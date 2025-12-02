<p align="center">
  <img width="400" alt="Spotzee Logo" src=".github/assets/logo-light.svg#gh-light-mode-only" />
  <img width="400" alt="Spotzee Logo" src=".github/assets/logo-dark.svg#gh-dark-mode-only" />
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
Before using any methods, the library must be initialized with an API key and URL endpoint.

If you aren't accessing the SDK via script tag, start by importing the Spotzee SDK:
```typescript

//
const { Client /** or BrowserClient */ } = require('@spotzee/js-sdk')

// Or
import { Client /** or BrowserClient */ } from '@spotzee/js-sdk'
```

Then you can initialize the library:
```typescript
// Node
const client = new Client({
    apiKey: "XXX-XXX",
    urlEndpoint: "https://apix.spotzee.com/api"
})

// Browser
const client = new BrowserClient({
    apiKey: "XXX-XXX",
    urlEndpoint: "https://apix.spotzee.com/api"
})

// Or global script
Spotzee.initialize({
    apiKey: "XXX-XXX",
    urlEndpoint: "https://apix.spotzee.com/api"
})
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
