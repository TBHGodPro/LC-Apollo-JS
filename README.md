# LC Apollo JS

A JavaScript/TypeScript Library for working with the LunarClient Apollo API.

## Getting Started

First, install the package and create a `Player` object.

| **NOTE:** Player objects do not store or require the player uuid or username, they can be used for multiple different players if wanted. If you want to separate them by UUID or Username, simply place them in a `Map` which has the instance as a value and anything as the key, and for the handling, make sure that however it is sending still works in case the player disconnects and reconnects onto the same instance.

```bash
npm install lc-apollo-js
```

```typescript
// CommonJS
const apollo = require('lc-apollo-js');

// ES6
import * as apollo from 'lc-apollo-js';

// Intitiate Player
const player = new apollo.Player({
  handling: {
    registerPluginChannel: channel => {
      // Register a plugin channel
      // For example, with PrismarineJS

      client?.write('custom_payload', {
        channel: 'REGISTER',
        data: Buffer.from(`${channel}\0`),
      });
    },
    sendPacket: (channel, buffer) => {
      // Send a packet to the channel, and return whether it was successful
      // For example, with PrismarineJS

      if (!client) return false;
      client?.write('custom_payload', {
        channel: channel,
        data: buffer,
      });
      return true;
    },
  },
});

// Wait for the instance to load all packets
await player.onceReady();

player.once('handshake', data => {
  // the player has connected and is ready for messages
});
```

## Usage

Whenever a player connects, use the `connect()` method.

This will tell the instance to prepare all state variables and register plugin channels.

| **NOTE:** Only run this once the player has connected and the server is allowed to send packets to it.

```typescript
player.connect();
```

Whenever the client sends a packet to the server in the `lunar:apollo` plugin channel, take the buffer and send it into the `receivePacket()` method.

```typescript
player.receivePacket(buffer);
```

## Properties

_(Property Info coming soon)_

## Methods

_(Method Info coming soon)_

## Events

_(Event Info coming soon)_
