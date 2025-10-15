export const template = `
//async waiting time
const wait = time => new Promise(fulfill => setTimeout(fulfill, time))

//time in ms in which the script waits inside the async wait function
const interval = 60 * 1000

//set the output of the variable with the label "some output" to 1
async function main() {
  while (true) {
    const date = new Date()
    //sets the input variable value where "time" is the variable name
    set("time", date.getHours() + ":" + date.getMinutes())
    //excecute at every full minute
    await wait(interval - (date.getTime() % interval))
  }
}

main()
`.trim()