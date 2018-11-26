import * as leftPad from 'left-pad'

export class NameManager {
  names: string[] = []

  uniqueName (name: string): { name: string, count: number } {
    const result = /^(.*?)(\d*)$/g.exec(name)!
    let index = result[2].length > 0 ? parseInt(result[2], 10) : 0
    let rawName = result[1]
    let possibleName = rawName
    if (index) {
      possibleName = `${rawName}${index}`
    } else {
      index = 1
    }

    while (true) {
      if (this.names.indexOf(possibleName) < 0) {
        this.names.push(possibleName)
        return { name: possibleName, count: index }
      }

      index++
      possibleName = `${rawName}${index}`
    }
  }
}

export class PortsManager {
  tcpPorts: number[] = []
  udpPorts: number[] = []

  uniquePort (port: number, udp: boolean = false): string {
    let possiblePort = port

    const ports = udp ? this.udpPorts : this.tcpPorts

    while (true) {
      if (ports.indexOf(possiblePort) < 0) {
        ports.push(possiblePort)
        return leftPad(possiblePort, 2, '0')
      }
      possiblePort++
    }
  }
}
