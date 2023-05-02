import { Client, Guild, User } from 'discord.js';
import { readFileSync } from 'fs';
import { Config } from '../data/config.js';
import { ConsoleLogger, Utils } from './core/utils.js';
import cron from 'node-cron';
import { fetchedChannelsAtBoot } from './core/constants/types.js';
import { DiscordValues } from './core/constants/values.js';
import { DBManager } from './core/managers/database.js';
import  { ServerManager } from './core/managers/servers.js'
import { Translations } from './core/constants/translations.js';

let Console = new ConsoleLogger();
const VERSION = JSON.parse(readFileSync('./package.json', 'utf-8')).version; // app version
const bot = new Client(Config.clientParam);
cron.schedule('0 0 * * *', () => {
    Console = new ConsoleLogger();
    Console.log("Refresh des logs effectué avec succès")
});

bot.login(Config.CURRENT_TOKEN)
let chanList: fetchedChannelsAtBoot;
let dev: User;
let db:DBManager;


//Executed when the bot starts
bot.on('ready', async () => {
    try {
        chanList = await Utils.fetchChannelsAtBoot();
        Utils.statusLoop(bot);
        dev = await bot.users.fetch(DiscordValues.DEV_DISCORD_ID);
        if (!dev)
            Console.error("Compte discord dev introuvable", true);
        Console.log(`\n\n             SPARKY\n\nBot discord Lords Mobile français\nDéveloppé par Kyusaki\n\nVersion: ${VERSION}\nClient: ${bot.user?.username}\nConsole:`);
        db = new DBManager(Config.DBConfig);
        chanList.LOGS_CONNEXIONS?.send(VERSION);
        await test();
    }
    catch (err) {
        Console.error(err, true);
    }
});


//Discord events listeners
bot.on('guildCreate', guild => {
    let server = new ServerManager(guild);
    server.checklistNewServers();
});


export { bot, Console, chanList, dev, db };


async function test() {
    let guild = await bot.guilds.cache.get(DiscordValues.MAIN_GUILD) as Guild
    bot.emit('guildCreate', guild);
}