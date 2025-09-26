# Loxone Nexus

[![codecov](https://codecov.io/github/Multivit4min/loxone-nexus/branch/main/graph/badge.svg?token=QF11M7H8SB)](https://codecov.io/github/Multivit4min/loxone-nexus)
[![Latest Version](https://img.shields.io/github/v/release/multivit4min/loxone-nexus
)](https://github.com/multivit4min/loxone-nexus)


⚠️ **Under active development** – expect breaking changes.

Loxone Nexus connects external integrations (currently **Home Assistant** and **Sonos**) to **Loxone Miniservers** using the **Loxone Intercommunication Interface** for variable exchange.

<details>
  <summary>Screenshots</summary>

  ![Loxone](https://github.com/Multivit4min/loxone-nexus/blob/main/images/loxone.png?raw=true)
  ![HomeAssistant](https://github.com/Multivit4min/loxone-nexus/blob/main/images/hass.png?raw=true)
  ![Sonos](https://github.com/Multivit4min/loxone-nexus/blob/main/images/sonos.png?raw=true)
  ![Variable](https://github.com/Multivit4min/loxone-nexus/blob/main/images/variable.png?raw=true)

</details>


## Setup

### Requirements
- [Node.js](https://nodejs.org/en/download/)
- npm
- pm2 (`npm install -g pm2`) **recommended but optional**

```sh
wget https://github.com/multivit4min/loxone-nexus/releases/latest/download/loxone-nexus.tar.gz -O - |
tar -xzvf -
cd loxone-nexus
npm ci
pm2 start ecosystem.configjs
```

<details>
  <summary>Update</summary>

```sh
wget https://github.com/multivit4min/loxone-nexus/releases/latest/download/loxone-nexus.tar.gz -O - |
tar -xzvf -
cd loxone-nexus
npm ci
pm2 restart ecosystem.config.js
```
</details>

You application now runs on Port **8000**, you can change this port by editing **data/.env**

## Supported Loxone Data Types
- `DIGITAL`  
- `ANALOG`  
- `TEXT`  
- `SmartActuatorRGBW`
- `SmartActuatorSingleChannel`


## Integrations

### Home Assistant
- Entity support: `string`, `number`, `boolean`  
- Control: switch, light, button, counter, valve, lock, …  

### Sonos
- Notifications (MP3 from HTTP or SMB)  
- Media control: play, pause, volume, next, previous  

### Calendar
- Import calendar events directly from an iCal web source.
- Control visibility of events via a Loxone variable (e.g. hide events once completed).

**Use Case** Perfect for recurring tasks such as trash pickup schedules. Events are shown on a Loxone Flex display, and once the trash is taken out, you can clear the reminder with a single button press on the display.