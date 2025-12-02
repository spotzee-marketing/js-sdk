type ClientProps = {
    apiKey: string
    urlEndpoint: string
}

type TrackProps = {
    event: string
    anonymousId?: string
    externalId?: string
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

export class Client {
    #apiKey: string
    #urlEndpoint: string

    constructor(props: ClientProps) {
        this.#apiKey = props.apiKey
        this.#urlEndpoint = props.urlEndpoint
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
        const request = await fetch(`${this.#urlEndpoint}/client/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.#apiKey}`,
            },
            body: JSON.stringify(this.#mapKeys(data)),
        })
        return await request.text()
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
}


// If running in a browser, expose Spotzee from the window object
declare global {
    interface Window { Spotzee: any; }
}

if (typeof window !== 'undefined') {
    window.Spotzee = Spotzee
}
