import { LoxoneRepository } from "../../prisma/repositories/LoxoneRepository"

export class ListenPortFinder {

  constructor(private readonly loxoneRepository: LoxoneRepository, private readonly range: [number, number]) {}

  get min() {
    return this.range[0]
  }

  get max() {
    return this.range[1]
  }

  async getNextAvailablePort(): Promise<number> {
    const entities = await this.loxoneRepository.findAll()
    const portsUsed = entities.map(entity => entity.listenPort)
    let i = this.min
    while (i < this.max) {
      if (!portsUsed.includes(i)) return i
      i++
    }
    throw new Error(`no available ports found in range ${this.min}-${this.max}`)
  }
}