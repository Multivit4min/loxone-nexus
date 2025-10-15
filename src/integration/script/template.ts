export const template = `
//async waiting time
const wait = time => new Promise(fulfill => setTimeout(fulfill, time))

//time in ms in which the script waits inside the async wait function
const interval = 60 * 1000

//set the output of the variable with the label "some output" to 1
async function main() {
  while (true) {
    const date = new Date()
    let hour = String(date.getHours())
    let minute = String(date.getMinutes())
    if (hour.length === 1) hour = "0"+hour
    if (minute .length === 1) minute = "0"+minute
    //sets the input variable value where "time" is the variable name
    nexus.set("time", hour + ":" + minute)
    //excecute at every full minute
    await wait(interval - (date.getTime() % interval))
  }
}

main()
`.trim()