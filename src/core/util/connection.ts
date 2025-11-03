import net from "net"

/**
 * checks if a specific http address is reachable
 * @param url address to test
 * @param timeout timeout to wait before an error is thrown
 * @returns true if success, false if unknown error and string when an error with a message occured
 */
export async function checkHTTPConnection(url: string, timeout = 3000) {
  try {
    const signal = AbortSignal.timeout(timeout)
    const res = await fetch(url, { signal })
    if (res.status >= 200 && res.status <= 299) return true
    return res.statusText
  } catch (e) {
    return e instanceof Error ? e.message : false
  }
}

/**
 * checks if an ftp server is reachable
 * @param address address to test
 * @param port listen port of the ftp server
 * @param timeout timeout to wait before an error is thrown
 * @returns true if success and string when an error with a message occured
 */
export function checkFTPConnection(address: string, port = 21, timeout = 3000) {
  return new Promise(resolve => {
    const socket = new net.Socket()
    socket.setTimeout(timeout)
    socket.on("connect", () => {
      resolve(true)
      socket.removeAllListeners()
      socket.destroy()
    })
    socket.on("timeout", () => {
      resolve("connection timed out")
      socket.removeAllListeners()
      socket.destroy()
    })
    socket.on("error", err => {
      resolve(err.message)
      socket.removeAllListeners()
    })
    socket.connect(port, address)
  })
}