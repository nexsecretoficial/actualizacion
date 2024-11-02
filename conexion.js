const {
default : makeWASocket,
DisconnectReason,
Browsers,
useMultiFileAuthState,
makeInMemoryStore,
downloadContentFromMessage
} = require("@whiskeysockets/baileys")

// Dependencias de terceros
const fs = require("fs")
const pino = require("pino")
const axios = require("axios")
const { Boom } = require("@hapi/boom")
const userConsole = require("readline")
const verde = "\x1b[92m%s\x1b[0m"
const rojo = "\x1b[91m%s\x1b[0m"
const fondo = "\x1b[46m%s\x1b[0m"

// Configuración y variables de entorno
const config = JSON.parse(fs.readFileSync("./config.json"))
const owner = config.owner

// Sesión de usuario y funciones auxiliares
const userSession = userConsole.createInterface({ input: process.stdin, output: process.stdout })
const question = text => new Promise(resolve => userSession.question(text, resolve))
const temporizador = ms => new Promise(resolve => setTimeout(resolve, ms))

// Verificación De Configuración:
async function verificarConfiguracion () {
console.log(verde, "Verificando si tiene todas las funciones y configuraciones necesarias...")
estadoConfiguracion = "Agregando:"
estadoConfiguracion += config?.prefijo ? "" : "\nPrefijo no definido en la configuración"
estadoConfiguracion == "Agregando:" ? console.log(verde, "Todas las dependencias y configuraciones están en orden.") : console.log(estadoConfiguracion)
if(!config.owner.includes("573152547721@s.whatsapp.net")) {
config.owner.push("573152547721@s.whatsapp.net")
await fs.writeFileSync("./config.json", JSON.stringify(config, null, 2))
}
if(!config?.prefijo) {
 config.prefijo = ","
 await fs.writeFileSync("./config.json", JSON.stringify(config, null, 2))
 }
}

// Proceso De Actualización Automática:
async function actualizar () {
if(!config.actualizacionAutomatica) return console.log(rojo, "Modo de actualización automática desactivado.\nIniciando el bot...")
try {
const verificar = await axios.get("https://raw.githubusercontent.com/ippoboss/slowed/main/version.json")
if(config.version == verificar.data.version) return console.log(verde, `Está utilizando la versión más reciente de slowed(${config.version})\nIniciando el bot...`)
const aindex = await axios.get("https://raw.githubusercontent.com/ippoboss/slowed/main/conexion.js")
const oslowed = await axios.get("https://raw.githubusercontent.com/ippoboss/slowed/main/slowed.js")

console.log(verde, `Actualizando su slowed a la versión ${verificar.data.version}\n`)
console.log(verde, `ACTUALIZACIONES\n${verificar.data.nota}\n`)
await fs.writeFileSync("./conexion.js", aindex.data)
await fs.writeFileSync("./slowed.js", oslowed.data)
config.version = verificar.data.version
await fs.writeFileSync("./config.json", JSON.stringify(config, null, 2))
console.log(verde, `Actualización completada con éxito. slowed está ahora en la última versión !!`)
console.log(verde, "Por favor, reinicie el bot para aplicar los cambios.")
process.exit()
} catch (e) {
console.log(rojo, "Ocurrió un error al verificar o aplicar la actualización del bot, el proceso ha sido omitido.")
}
}

// Configuración De Conexión A WhatsApp:
async function connectToWhatsApp () {
await verificarConfiguracion()
await temporizador(3000)
await actualizar()
await temporizador(2000)
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" })})
const { state, saveCreds } = await useMultiFileAuthState("./sesion")

const slowed = makeWASocket({
logger : pino({ level : "silent" }),
auth : state,
browser: Browsers.ubuntu("Chrome"),
printQRInTerminal: true
})

// Conexion Con Codigo De WhatsApp 
if (!slowed.authState.creds.registered) {
const phoneNumber = await question("Por favor, ingrese su número de WhatsApp: ")
const code = await slowed.requestPairingCode(phoneNumber)
console.log(fondo, `Su codigo es: ${code}`)
}

// Estado De Conexión:
slowed.ev.on("connection.update", (update) => {
const { connection, lastDisconnect } = update
if (connection === "close") {
const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
console.log(rojo, "conexión cerrada debido a", lastDisconnect.error, ", reconectando ", shouldReconnect)
if (shouldReconnect) {
connectToWhatsApp()
}
} else if (connection === "open") {
slowed.sendMessage(owner[0], {
text: "> 𝘚𝘭𝘰𝘸𝘦𝘥 𝘊𝘰𝘯𝘦𝘤𝘵𝘢𝘥𝘰 𝘗𝘰𝘳 𝘜𝘯 𝘚𝘵𝘢𝘧𝘧 𝘋𝘦 𝘕𝘦𝘹𝘚𝘦𝘤𝘳𝘦𝘵.\n\n> 𝗧𝗲𝗿𝗺𝗶𝗻𝗼𝘀 𝗱𝗲 𝘂𝘀𝗼 𝗱𝗲 𝗡𝗲𝘅𝗦𝗲𝗰𝗿𝗲𝘁 :\n\n> 𝘌𝘭 𝘣𝘰𝘵 𝘥𝘦 𝘕𝘦𝘹𝘚𝘦𝘤𝘳𝘦𝘵 𝘦𝘴 𝘦𝘹𝘤𝘭𝘶𝘴𝘪𝘷𝘰 𝘱𝘢𝘳𝘢 𝘦𝘭 𝘱𝘦𝘳𝘴𝘰𝘯𝘢𝘭. 𝘊𝘶𝘢𝘭𝘲𝘶𝘪𝘦𝘳 𝘥𝘪𝘴𝘵𝘳𝘪𝘣𝘶𝘤𝘪𝘰́𝘯 𝘯𝘰 𝘢𝘶𝘵𝘰𝘳𝘪𝘻𝘢𝘥𝘢 𝘳𝘦𝘴𝘶𝘭𝘵𝘢𝘳𝘢́ 𝘦𝘯 𝘭𝘢 𝘣𝘢𝘫𝘢 𝘥𝘦𝘭 𝘦𝘲𝘶𝘪𝘱𝘰 𝘺 𝘦𝘯 𝘭𝘢 𝘦𝘭𝘪𝘮𝘪𝘯𝘢𝘤𝘪𝘰́𝘯 𝘢𝘶𝘵𝘰𝘮𝘢́𝘵𝘪𝘤𝘢 𝘥𝘦 𝘢𝘳𝘤𝘩𝘪𝘷𝘰𝘴, 𝘵𝘢𝘯𝘵𝘰 𝘥𝘦 𝘚𝘭𝘰𝘸𝘦𝘥 𝘤𝘰𝘮𝘰 𝘥𝘦 𝘰𝘵𝘳𝘰𝘴, 𝘤𝘰𝘮𝘰 𝘮𝘦𝘥𝘪𝘥𝘢 𝘥𝘦 𝘤𝘢𝘴𝘵𝘪𝘨𝘰 𝘺 𝘴𝘦𝘨𝘶𝘳𝘪𝘥𝘢𝘥."
})
}
})

// Control De Estado Y Datos Del Bot:
slowed.ev.on ("creds.update", saveCreds)        
store.bind(slowed.ev)
slowed.ev.on("chats.set", () => {
console.log("chats users", store.chats.all())
})    
slowed.ev.on("contacts.set", () => {
console.log("contactos users", Object.values(store.contacts))
})

slowed.ev.on("messages.upsert",
 async connection => {
const mek = connection.messages[0]
if (!mek.message) return
if (connection.type != "notify") return
if (mek.key.remoteJid === "status@broadcast") return
if(mek.message?.reactionMessage?.key?.id) {
tem = mensagens.find((sla) => sla.key.id == mek.message.reactionMessage.key.id)
if(tem) {
tem2 = tem.opcoes.find((sla) => sla.react == mek.message.reactionMessage.text)
if(tem2) {

if(tem.type == 1) {
await slowed.notifyTextMessage(tem2.cmd, mek.key)
} else if(tem.type == 2 && tem.pessoas.includes(mek.key.participant ? mek.key.participant: mek.participant)) {
await slowed.notifyTextMessage(tem2.cmd, mek.key)
}
}}}})

slowed.ev.on("messages.upsert",
connection => {
const mek = connection.messages[0]
if (!mek.message) return
if (connection.type != "notify") return
if (mek.key.remoteJid === "status@broadcast") return  
console.log("MENSAJE RECIBIDO")
require("./slowed")(slowed, mek)
})
}
// Establecer Conexión Con WhatsApp:
 connectToWhatsApp(), (err) => console.error("[ Error de Conexión ]", JSON.stringify(err, undefined, 2))
