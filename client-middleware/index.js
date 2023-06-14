import { SerialPort } from 'serialport'
import pino from 'pino'
import { v4 } from 'uuid';
import WebSocket from 'ws';
const logger = pino({ level: "debug" })


var socket;

async function findArduinoPorts() {
    let COMports = await SerialPort.list()
    return COMports.filter(c => c.manufacturer ? c.manufacturer.includes("Arduino") : false)
}






async function main() {
    let ports = await findArduinoPorts()
    if (ports.length == 0) {
        logger.warn("No Arduinos avaliable, trying again in 10 seconds")
        return setTimeout(() => { main() }, 10000)
    }
    logger.info(`Establishing handshake at ${ports[0].path}`)
    return connectCOMPort(ports[0])
}


async function connectCOMPort(port) {
    var latestData = ''
    var handshakeCompleted = false
    var handshakeIDS = []
    var handshakeInterval = null

    const connection = new SerialPort({ path: port.path, baudRate: 9600 })
    connection.on("open", () => {
        logger.info(`Opened port ${port.path}`)



        function sendHandshake() {
            if (handshakeCompleted) return clearInterval(handshakeInterval)
            if (handshakeIDS.length > 5) {
                logger.warn(`Could not complete handshake with ${port.path}`)
                clearInterval(handshakeInterval)
                return connection.close()
            }
            var id = v4()
            handshakeIDS.push(id)
            connection.write(JSON.stringify({ "event": "handshake", "id": id }))
            logger.debug(`send -> ${JSON.stringify({ "event": "handshake", "id": id })}`)
        }
        sendHandshake()
        handshakeInterval = setInterval(sendHandshake, 3000)

    })
    connection.on("error", (e) => {
        logger.error(`Error at ${port.path}: ${e.toString()}`)
        setTimeout(() => {
            main();
        }, 7000)
    })
    connection.on("close", (e) => {
        if (e !== null) logger.error(`Error at ${port.path} (likely disconnect): ${e.toString()}`)
        logger.error(`Closing ${port.path}`)
        clearInterval(handshakeInterval)
        setTimeout(() => {
            main();
        }, 3000)

    })
    connection.on('readable', function () {
        latestData += connection.read().toString()
        var temp = `${latestData}`//concatenates a new string so node doesnt combine the memory adresses
        setTimeout(() => {
            if (temp == latestData) {
                //logger.debug(`receive <- ${latestData}`.replace("\n", ""))

                try {
                    let d = JSON.parse(latestData)



                    if (d.data !== undefined && d.data == "unknown") logger.warn("Arduino returned unknown event: " + d.event)
                    if (d.error !== undefined) logger.warn("Arduino returned " + d.error + " error")

                    switch (d.event) {
                        case "handshake":
                            if (handshakeIDS.includes(d.id) && d.data == "success") {
                                logger.info("Successful handshake")
                                handshakeCompleted = true;

                                socket.onmessage = (d) => {
                                    logger.debug(`recieved from ws ${d.data}`)
                                    if (JSON.parse(d.data).request == "data") {
                                        connection.write(JSON.stringify({ "event": "dataUpdate" }))
                                    } else if (JSON.parse(d.data).event == "toggleArm") {
                                        connection.write(JSON.stringify({ "event": "toggleArm" }))

                                    }
                                }



                            }
                            break;
                        default:
                            socket.send(JSON.stringify(d))
                            logger.debug(JSON.stringify(d))
                            break;
                    }

                } catch (e) {
                    logger.warn("Data parse error: " + latestData.replace("\n", ""))
                }
                latestData = ''
            }
        }, 500)
    })

}




async function connectWS() {
    return new Promise(res => {
        socket = new WebSocket("wss://smarthome.mitchellonii.me")

        socket.onopen = () => {
            socket.send(JSON.stringify({ "userType": 'backend' }))
            logger.info("Conected to wss://smarthome.mitchellonii.me");
            res;
        }

        socket.onclose = () => {
            logger.error("Disconnected from wss://smarthome.mitchellonii.me");
            return connectWS()
        }
    })
}

connectWS()

main()




