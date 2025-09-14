# Loxone Nexus

[![codecov](https://codecov.io/github/Multivit4min/loxone-nexus/branch/main/graph/badge.svg?token=QF11M7H8SB)](https://codecov.io/github/Multivit4min/loxone-nexus)

⚠️ **Under active development** – expect breaking changes.

Loxone Nexus connects external integrations (currently **Home Assistant** and **Sonos**) to **Loxone Miniservers** using the **Loxone Intercommunication Interface** for variable exchange.

---

## Setup

### Requirements
- [Node.js](https://nodejs.org/en/download/)
- npm  
- git (just for cloning of the repo)

### Installation
```sh
git clone https://github.com/Multivit4min/loxone-nexus
cd loxone-nexus
npm ci
npx prisma migrate deploy
npm start
```

With [pm2](https://pm2.keymetrics.io/):
```sh
pm2 start ecosystem.js
```

## Supported Loxone Data Types
- `DIGITAL`  
- `ANALOG`  
- `TEXT`  
- `SmartActuatorSingleChannel`  


## Integrations

### Home Assistant
- Entity support: `string`, `number`, `boolean`  
- Control: switch, light, button, counter, valve, lock, …  

### Sonos
- Notifications (MP3 from HTTP or SMB)  
- Media control: play, pause, volume, next, previous  
