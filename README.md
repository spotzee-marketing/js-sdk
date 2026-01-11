<p align="center">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://raw.githubusercontent.com/spotzee-marketing/js-sdk/main/.github/assets/logo-dark.svg"
    />
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://raw.githubusercontent.com/spotzee-marketing/js-sdk/main/.github/assets/logo-light.svg"
    />
    <img
      width="400"
      alt="Spotzee Logo"
      src="https://raw.githubusercontent.com/spotzee-marketing/js-sdk/main/.github/assets/logo-light.svg"
    />
  </picture>
</p>

# Spotzee JS SDK

## Installation
To install the SDK, use Yarn, npm, or a script tag:

- npm
```
npm install @spotzee/js-sdk
```

- Yarn
```
yarn add @spotzee/js-sdk
```

script tag

```
<script src="https://unpkg.com/@spotzee/js-sdk/lib/esm/index.js"></script>
```

## Usage
The SDK can be used both on the server or in the web browser. The main difference is that on the Browser the identified user will be cached vs in Node where you'll need to pass in identifiers on every request.

### Initialize
Before using any methods, the library must be initialized with an API key.

If you aren't accessing the SDK via script tag, start by importing the Spotzee SDK:
```typescript
const { Client /** or BrowserClient */ } = require('@spotzee/js-sdk')

// Or
import { Client /** or BrowserClient */ } from '@spotzee/js-sdk'
```

Then you can initialize the library:
```typescript
// Node
const client = new Client({ apiKey: "XXX-XXX" })

// Browser
const client = new BrowserClient({ apiKey: "XXX-XXX" })

// Or global script
Spotzee.initialize({ apiKey: "XXX-XXX" })
```

### Identify
You can handle the user identity of your users by using the `identify` method. This method works in combination to either/or associate a given user to your internal user ID (`external_id`) or to associate attributes (traits) to the user. By default all events and traits are associated with an anonymous ID until a user is identified with an `external_id`. From that point moving forward, all updates to the user and events will be associated to your provider identifier.
```typescript
// Client
client.identify({
    externalId: "XXX-XXX",
    phone: "+1234567890",
    email: "email@email.com",
    traits: {}
})

// Or global script
Spotzee.identify({
    externalId: "XXX-XXX",
    phone: "+1234567890",
    email: "email@email.com",
    traits: {}
})
```

### Events
If you want to trigger a journey and list updates off of things a user does within your app, you can pass up those events by using the `track` method.
```typescript
// Client
client.track({
    event: "Tapped Button",
    externalId: "XXX-XXX",
    properties: {
        "button_name": "signup"
    }
})

// Or global script
Spotzee.track({
    event: "Tapped Button",
    externalId: "XXX-XXX",
    properties: {
        "button_name": "signup"
    }
})
```

You can also update user profile fields inline with the event:
```typescript
client.track({
    event: "Tapped Button",
    user: {
        timezone: "America/New_York",
        locale: "en-US"
    },
    properties: {}
})
```

### Alias
Link an anonymous user to a known user when they sign up or log in:
```typescript
client.alias({
    anonymousId: "anon-123",
    externalId: "user-456"
})
```

### Device Registration
Register a device for push notifications:
```typescript
Spotzee.registerDevice({
    deviceId: "unique-device-id",
    token: "push-notification-token",  // Optional
    os: "web",
    model: "Chrome",
    appBuild: "1.0.0",
    appVersion: "1.0.0"
})
```

### In-App Notifications
Fetch and manage in-app notifications:
```typescript
// Get notifications for current user
const { results, cursor } = await Spotzee.getNotifications()

// Mark a notification as read
await Spotzee.markNotificationRead(notificationId)
```
