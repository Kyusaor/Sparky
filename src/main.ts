import { Client } from 'discord.js';
import { Config } from '../data/config';
const VERSION = require('../../package.json').version; // app version
const bot = new Client(Config.clientParam);

require('console-stamp')(console, {
    format: ":date(dd/mm/yyyy - HH:MM:ss)"
})

const VERSION = JSON.parse(readFileSync('./package.json', 'utf-8')).version; // app version
const bot = new Client(Config.clientParam);

bot.login(Config.CURRENT_TOKEN)


//Executed when the bot starts
bot.on('ready', async () => {
    try {
        console.log(`\n\n             SPARKY\n\nBot discord Lords Mobile français\nDéveloppé par Kyusaki\n\nVersion: ${VERSION}\nClient: ${bot.user?.username}\nConsole:`)
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
})

export { bot };