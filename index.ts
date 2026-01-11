const API_URL = 'https://apix.spotzee.com/api'

type ClientProps = {
    apiKey: string
}

type TrackUserProps = {
    email?: string
    phone?: string
    timezone?: string
    locale?: string
    data?: Record<string, any>
}

type TrackProps = {
    event: string
    anonymousId?: string
    externalId?: string
    user?: TrackUserProps
    properties: Record<string, any>
}

type IdentifyProps = {
    anonymousId?: string
    externalId: string
    phone?: string
    email?: string
    timezone?: string
    locale?: string
    traits: Record<string, any>
}

type AliasProps = {
    anonymousId: string
    externalId: string
}

type DeviceProps = {
    anonymousId?: string
    externalId?: string
    deviceId: string
    token?: string
    os: string
    osVersion?: string
    model: string
    appBuild: string
    appVersion: string
}

type NotificationType = 'banner' | 'alert' | 'html'

type BaseNotificationContent = {
    title: string
    body: string
    custom?: Record<string, string | number>
}

type BannerNotificationContent = BaseNotificationContent & { type: 'banner' }

type StyledNotificationContent = BaseNotificationContent & {
    html: string
    readOnShow?: boolean
}

type AlertNotificationContent = StyledNotificationContent & {
    type: 'alert'
    image?: string
}

type HtmlNotificationContent = StyledNotificationContent & {
    type: 'html'
}

type NotificationContent = BannerNotificationContent | AlertNotificationContent | HtmlNotificationContent

export type Notification = {
    id: number
    projectId: number
    userId: number
    contentType: NotificationType
    content: NotificationContent
    readAt?: string
    expiresAt?: string
    createdAt: string
    updatedAt: string
}

export type PagedResponse<T> = {
    results: T[]
    cursor?: string
}

export class Client {
    #apiKey: string

    constructor(props: ClientProps) {
        this.#apiKey = props.apiKey
    }

    async track({ event, properties: data, ...props }: TrackProps) {
        return await this.#request('events', [{ name: event, ...props, data }])
    }

    async identify({ traits: data, ...props }: IdentifyProps) {
        return await this.#request('identify', { ...props, data })
    }

    async alias(props: AliasProps) {
        return await this.#request('alias', props)
    }

    async registerDevice(props: DeviceProps) {
        // Validate required fields per backend schema
        if (!props.deviceId || !props.os || !props.model || !props.appBuild || !props.appVersion) {
            throw new Error('Missing required device fields: deviceId, os, model, appBuild, appVersion')
        }
        if (!props.anonymousId && !props.externalId) {
            throw new Error('Must provide either anonymousId or externalId')
        }
        return await this.#request('devices', props)
    }

    async getNotifications(identity: { anonymousId: string; externalId?: string }, cursor?: string): Promise<PagedResponse<Notification>> {
        return await this.#get('notifications', identity, cursor)
    }

    async markNotificationRead(id: number, identity: { anonymousId: string; externalId?: string }) {
        return await this.#put(`notifications/${id}`, identity)
    }

    #mapKeys(obj: Record<string, any> | any[]): any {
        const camelToUnderscore = (key: string) => key.replace(/([A-Z])/g, '_$1').toLowerCase()

        // Handle arrays by recursively mapping each element
        if (Array.isArray(obj)) {
            return obj.map(item => this.#mapKeys(item))
        }

        // Handle non-object primitives
        if (obj === null || typeof obj !== 'object') {
            return obj
        }

        // Handle objects by converting keys and recursively processing values
        const newObj: Record<string, any> = {}
        for (const key in obj) {
            const newKey = camelToUnderscore(key)
            const value = obj[key]
            // Recursively convert nested objects/arrays, but preserve primitive values
            newObj[newKey] = (value !== null && typeof value === 'object')
                ? this.#mapKeys(value)
                : value
        }
        return newObj
    }

    async #request(path: string, data: Record<string, any> | any[]) {
        const response = await fetch(`${API_URL}/client/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.#apiKey}`,
            },
            body: JSON.stringify(this.#mapKeys(data)),
        })
        if (!response.ok) {
            throw new Error(`API Error ${response.status}: ${await response.text()}`)
        }
        return await response.text()
    }

    async #get(path: string, identity: { anonymousId: string; externalId?: string }, cursor?: string) {
        const url = new URL(`${API_URL}/client/${path}`)
        if (cursor) {
            url.searchParams.set('cursor', cursor)
        }
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.#apiKey}`,
            'x-anonymous-id': identity.anonymousId,
        }
        if (identity.externalId) {
            headers['x-external-id'] = identity.externalId
        }
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
        })
        if (!response.ok) {
            throw new Error(`API Error ${response.status}: ${await response.text()}`)
        }
        return await response.json()
    }

    async #put(path: string, data: Record<string, any>) {
        const response = await fetch(`${API_URL}/client/${path}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.#apiKey}`,
            },
            body: JSON.stringify(this.#mapKeys(data)),
        })
        if (!response.ok) {
            throw new Error(`API Error ${response.status}: ${await response.text()}`)
        }
        return await response.text()
    }
}

export class BrowserClient extends Client {

    #anonymousId: string = this.uuid()
    #externalId?: string
    #client: Client

    constructor(props: ClientProps) {
        super(props)
        this.#client = new Client(props)
    }

    async track(props: TrackProps) {
        return await this.#client.track({
            ...props,
            anonymousId: props.anonymousId ?? this.#anonymousId,
            externalId: props.externalId ?? this.#externalId,
        })
    }

    async identify(props: IdentifyProps) {
        this.#externalId = props.externalId
        return await this.#client.identify({
            ...props,
            anonymousId: props.anonymousId ?? this.#anonymousId,
            externalId: props.externalId ?? this.#externalId,
        })
    }

    async alias(props: AliasProps) {
        this.#externalId = props.externalId
        return await this.#client.alias(props)
    }

    async registerDevice(props: Omit<DeviceProps, 'anonymousId' | 'externalId'>) {
        return await this.#client.registerDevice({
            ...props,
            anonymousId: this.#anonymousId,
            externalId: this.#externalId,
        })
    }

    async getNotifications(identity?: { anonymousId: string; externalId?: string }, cursor?: string): Promise<PagedResponse<Notification>> {
        return await this.#client.getNotifications({
            anonymousId: identity?.anonymousId ?? this.#anonymousId,
            externalId: identity?.externalId ?? this.#externalId,
        }, cursor)
    }

    async markNotificationRead(id: number, identity?: { anonymousId: string; externalId?: string }) {
        return await this.#client.markNotificationRead(id, {
            anonymousId: identity?.anonymousId ?? this.#anonymousId,
            externalId: identity?.externalId ?? this.#externalId,
        })
    }

    uuid() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        )
    }
}

export class Spotzee {
    static instance?: BrowserClient = undefined

    static initialize(props: ClientProps) {
        Spotzee.instance = new BrowserClient(props)
    }

    static async track(props: TrackProps) {
        return await Spotzee.instance?.track(props)
    }

    static async identify(props: IdentifyProps) {
        return await Spotzee.instance?.identify(props)
    }

    static async alias(props: AliasProps) {
        return await Spotzee.instance?.alias(props)
    }

    static async registerDevice(props: Omit<DeviceProps, 'anonymousId' | 'externalId'>) {
        return await Spotzee.instance?.registerDevice(props)
    }

    static async getNotifications(identity?: { anonymousId: string; externalId?: string }, cursor?: string) {
        return await Spotzee.instance?.getNotifications(identity, cursor)
    }

    static async markNotificationRead(id: number, identity?: { anonymousId: string; externalId?: string }) {
        return await Spotzee.instance?.markNotificationRead(id, identity)
    }
}


// If running in a browser, expose Spotzee from the window object
declare global {
    interface Window { Spotzee: any; }
}

if (typeof window !== 'undefined') {
    window.Spotzee = Spotzee
}
