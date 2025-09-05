Loxone Nexus
============

> This project is currently under development use at your own risk


This project aims to connect different Integrations like HomeAssistant with Loxone via their integrated Loxone Intercommunication Interface used to communicate variables across different Loxone Miniservers

### Setup

#### Prerequisites
`Nodejs v22`, `npm` and `git` installed

#### Installation
```
git clone https://github.com/Multivit4min/loxone-nexus
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

### Planned Integrations

- .ical Calendar Support
- Fronius
- Webhooks