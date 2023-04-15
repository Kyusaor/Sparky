import { Client } from 'discord.js';
import { readFileSync } from 'fs';
import { Config } from '../data/config.js';
import { ConsoleLogger, Utils } from './core/utils.js';
import cron from 'node-cron';

let Console = new ConsoleLogger();
const VERSION = JSON.parse(readFileSync('./package.json', 'utf-8')).version; // app version
const bot = new Client(Config.clientParam);
cron.schedule('0 0 * * *', () => {
    Console = new ConsoleLogger();
    Console.log("Refresh des logs effectué avec succès")
})

bot.login(Config.CURRENT_TOKEN)


//Executed when the bot starts
bot.on('ready', async () => {
    try {
        Utils.statusLoop(bot);
        Console.log(`\n\n             SPARKY\n\nBot discord Lords Mobile français\nDéveloppé par Kyusaki\n\nVersion: ${VERSION}\nClient: ${bot.user?.username}\nConsole:`)
    }
    catch (err) {
        Console.error(err, true);
    }
})

export { bot, Console };