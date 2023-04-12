import { Client } from 'discord.js';
import { readFileSync } from 'fs';
import { Config } from '../data/config.js';
import consoleStamp from 'console-stamp';
import { Utils } from './core/utils.js';

consoleStamp(console, {
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
        Utils.logErrors(err, true);
    }
})

export { bot };