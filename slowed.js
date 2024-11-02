const { generateWAMessageFromContent, generateWAMessage, proto } = require("@whiskeysockets/baileys")
const fs = require("fs")
const config = JSON.parse(fs.readFileSync('./config.json'))
const owner = config.owner
const axios = require('axios')
const { exec } = require("child_process")
const util = require('util')

// Identificador De Dispositivo:
const tipodispositivo = (devicekk) => {
resp = devicekk.length > 28 ? 'android' : devicekk.substring(0, 2) === '3A' ? 'ios' : devicekk.startsWith("BAE5") ? 'baileys' : devicekk.startsWith("3EB0") ? 'web' : 'desconocido';
return resp
}

module.exports = async(slowed, mek) => {
try {
const from = mek.key.remoteJid
const type = Object.keys(mek.message).find((key) => !['senderKeyDistributionMessage', 'messageContextInfo'].includes(key))
const prefijo = ","

// Procesamiento Del Contenido Del Mensaje:
const budy = (type === 'conversation') ? mek.message.conversation: (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text: ''
const body = type === "conversation" ? mek.message.conversation : type === "viewOnceMessageV2" ? mek.message.viewOnceMessageV2.message.imageMessage ? mek.message.viewOnceMessageV2.message.imageMessage.caption : mek.message.viewOnceMessageV2.message.videoMessage.caption : type === "imageMessage" ? mek.message.imageMessage.caption : type === "videoMessage" ? mek.message.videoMessage.caption : type === "extendedTextMessage" ? mek.message.extendedTextMessage.text : type === "viewOnceMessage" ? mek.message.viewOnceMessage.message.videoMessage ? mek.message.viewOnceMessage.message.videoMessage.caption : mek.message.viewOnceMessage.message.imageMessage.caption : type === "documentWithCaptionMessage" ? mek.message.documentWithCaptionMessage.message.documentMessage.caption : type === "buttonsMessage" ? mek.message.buttonsMessage.imageMessage.caption : type === "buttonsResponseMessage" ? mek.message.buttonsResponseMessage.selectedButtonId : type === "listResponseMessage" ? mek.message.listResponseMessage.singleSelectReply.selectedRowId : type === "templateButtonReplyMessage" ? mek.message.templateButtonReplyMessage.selectedId : type === "groupInviteMessage" ? mek.message.groupInviteMessage.caption : type === "pollCreationMessageV3" ? mek.message.pollCreationMessageV3 : type === "interactiveResponseMessage" ? JSON.parse(mek.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : type === "text" ? mek.text : ""    

// Extracción Y Verificación Del Comando:
const isCmd = body.startsWith(prefijo)
const comando = body.slice(1).trim().split(/ +/).shift().toLowerCase()
const args = body.trim().split(/ +/).slice(1)
const text = args.join(' ')

// Información Del Bot:
const me = slowed.user;
const nameBot = slowed.user.name || "Not found";
const botNumber = slowed.user.id.split(':')[0] + '@s.whatsapp.net';
const content = JSON.stringify(mek.message);

// Información Del Grupo:
const isGrupo = mek.key.remoteJid.endsWith('@g.us');
const sender = isGrupo ? (mek.key.participant ? mek.key.participant: mek.participant): mek.key.remoteJid
const groupMetadata = isGrupo ? await slowed.groupMetadata(from): ''
const grupoID = isGrupo ? groupMetadata.id: prefijo + ''
const grupoOwner = isGrupo ? groupMetadata.owner: ''
const grupoDescripcion = isGrupo ? groupMetadata.desc: ''
const grupoNombre = isGrupo ? groupMetadata.subject: ''
const grupoMiembros = isGrupo ? groupMetadata.participants: []
const participants = isGrupo ? await groupMetadata.participants: ''
const grupoAdmins = isGrupo ? await participants.filter(v => v.admin !== null).map(v => v.id): ''
const isGrupoAdmins = isGrupo ? grupoAdmins.includes(sender): false
const isBotGrupoAdmins = grupoAdmins.includes(botNumber) || false
const isOwner = owner.includes(sender) || mek.key.fromMe

// Información Del Usuario:
const nombre = mek.pushName ? mek.pushName : ''
const nmrp = sender.replace("@s.whatsapp.net", "")
const nmrp2 = from.replace("@g.us", "")
const nmrp3 = text.replace(new RegExp("[()+-/ +/]", "gi"), "").replace("@", '')
const nmrp4 = nmrp3.split('|')[0]

// Tipo De Mensaje:
const isVideo = (type == 'videoMessage')
const isImage = (type == 'imageMessage')
const isSticker = (type == 'stickerMessage')
const isLocLive = (type === 'liveLocationMessage')
const isContato = (type === 'contactMessage')
const isCatalogo = (type === 'productMessage')
const isLocalização = (type === 'locationMessage')
const isDocumento = (type === 'documentMessage')
const iscontactsArray = (type === 'contactsArrayMessage')
const isMedia = (type === 'imageMessage' || type === 'videoMessage')
const isQuotedMsg = (type == 'extendedTextMessage')
const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true: false: false
const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') ? true: false: false
const isQuotedDocument = isQuotedMsg ? content.includes('documentMessage') ? true: false: false
const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true: false: false
const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') ? true: false: false

// Tipos De Mensajes:
const enviar = (text) => {
return slowed.sendMessage(from, {
text: text
}, {
quoted: mek
})
}

// Consola De Mensajes:
if (!isGrupo && isCmd) console.log(
'⚡COМANDO EN PV⚡','\n',
'‣ NICK :',nombre,'\n',
'‣ DISPOSITIVO :',tipodispositivo(mek.key.id),'\n',
'‣ NUMERO :',sender.split("@")[0],'\n',
'‣ CMD :',comando,'\n',
'‣ TEXTO DE CMD :',text,'\n')

if (!isCmd && !isGrupo) console.log(
'⚡MENSAGES EN PV ⚡','\n',
'‣ NICK :',nombre,'\n',
'‣ DISPOSITIVO :',tipodispositivo(mek.key.id),'\n',
'‣ NUMERO :',sender.split("@")[0],'\n',
'‣ MSG :',budy,'\n')

if (isCmd && isGrupo) console.log(
'⚡COМANDO EN GRUPO ⚡','\n',
'‣ GRUPO :', groupName,'\n',
'‣ IDGP :',from,'\n',
'‣ NICK :',nombre,'\n',
'‣ DISPOSITIVO :',tipodispositivo(mek.key.id),'\n',
'‣ NUMERO :',sender.split("@")[0],'\n',
'‣ CMD :',comando,'\n',
'‣ TEXTO DE CMD :',text,'\n')

if (!isCmd && isGrupo) console.log(
'⚡ MENSAJE EN GRUPO⚡','\n', 
'‣ GRUPO :', groupName, '\n', 
'‣ IDGP :',from,'\n',
'‣ NICK :',nombre,'\n',
'‣ DISPOSITIVO :',tipodispositivo(mek.key.id),'\n',
'‣ NUMERO :',sender.split("@")[0],'\n',
 '‣ MSG :', budy, '\n')




// Inicio De Comandos:
switch (comando) {

case 'ping':
enviar('Pong! aaaaa');
break
  
default:

}
} catch (e) {
err = String(e)
console.log('[ slowed Error ]', err)
console.log('[ slowed Error ]', util.inspect(e))
slowed.sendMessage(owner[0], {text: util.inspect(e)}, {quoted: mek})
}}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update file: ${__filename}`)
delete require.cache[file]
require(file)
})