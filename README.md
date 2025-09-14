Loxone Nexus
============

[![codecov](https://codecov.io/github/Multivit4min/loxone-nexus/branch/main/graph/badge.svg?token=QF11M7H8SB)](https://codecov.io/github/Multivit4min/loxone-nexus)

> This project is currently under development


This project aims to connect different Integrations like HomeAssistant with Loxone via their integrated Loxone Intercommunication Interface used to communicate variables across different Loxone Miniservers

### Setup

#### Prerequisites
`NodeJS`, `npm` and `git` installed

#### Installation
```sh
git clone https://github.com/Multivit4min/loxone-nexus
cd loxone-nexus
npm ci
npx prisma migrate deploy
npm start
#or via pm2:
#pm2 start ecosystem.js
```
<details>
  <summary>Screenshots</summary>

  ![Loxone](https://github.com/Multivit4min/loxone-nexus/blob/main/images/loxone.png?raw=true)
  ![HomeAssistant](https://github.com/Multivit4min/loxone-nexus/blob/main/images/hass.png?raw=true)
  ![Sonos](https://github.com/Multivit4min/loxone-nexus/blob/main/images/sonos.png?raw=true)
  ![Variable](https://github.com/Multivit4min/loxone-nexus/blob/main/images/variable.png?raw=true)

</details>

### Supported Loxone Datatypes
 - DIGITAL
 - ANALOG
 - TEXT
 - SmartActuatorSingleChannel

### Available Integrations

- HomeAssistant
  - access to all entities which have string, number, boolean attributes
  - control switch, lights, buttons, counters, valve, lock and many more
 
- Sonos
  - Notifications (mp3 files from web or Network Storage)
  - various controls, play, pause, set volume, next, previous