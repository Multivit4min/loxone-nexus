Loxone Nexus
============

> This project is currently under development


This project aims to connect different Integrations like HomeAssistant with Loxone via their integrated Loxone Intercommunication Interface used to communicate variables across different Loxone Miniservers

### Setup

#### Prerequisites
`Nodejs v22`, `npm` and `git` installed

#### Installation
```
git clone https://github.com/Multivit4min/loxone-nexus
cd loxone-nexus
npm ci
npx prisma migrate deploy
npm start
```

if you want to run it with a process manager like pm2 you can start it with `pm2 start ecosystem.js`


### Supported Loxone Datatypes
 - DIGITAL
 - ANALOG
 - TEXT
 - SmartActuatorSingleChannel

### Supported Integrations

- HomeAssistant
  - access to all entities which have string, number, boolean attributes
  - control switch, lights, buttons, counters, valve, lock and many more
 
- Sonos
  - Notifications (mp3 files from web or Network Storage)
  - various controls, play, pause, set volume, next, previous