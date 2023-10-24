import { Client, User } from 'discord.js';
import { readFileSync } from 'fs';
import { Config } from '../data/config.js';
import { ConsoleLogger, Utils } from './core/utils.js';
import cron from 'node-cron';
import { TranslationCacheType, fetchedChannelsAtBoot } from './core/constants/types.js';
import { DiscordValues } from './core/constants/values.js';
import { DBManager } from './core/managers/database.js';
import { ServerManager } from './core/managers/servers.js'
import { EventManager } from './core/managers/events.js';
import { Command, CommandManager, StatusCacheClass } from './core/managers/commands.js';
import { Translations } from './core/constants/translations.js';

let Console = new ConsoleLogger();
const VERSION = JSON.parse(readFileSync('./package.json', 'utf-8')).version; // app version
const bot = new Client(Config.clientParam);
cron.schedule('0 0 * * *', () => {
    Console = new ConsoleLogger();
    Console.log("Refresh des logs effectué avec succès")
});
let TranslationsCache: TranslationCacheType = await Translations.generateTranslationsCache();
let consoleErrors = TranslationsCache.fr.global.errors;

bot.login(Config.CURRENT_TOKEN);
let botCommands: Command[];
let chanList: fetchedChannelsAtBoot;
let dev: User;
let db: DBManager;
let StatusCache: StatusCacheClass;
let bootLocked = true;


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
        botCommands = await CommandManager.buildBotCommands();
        StatusCache = new StatusCacheClass(botCommands);
        chanList.LOGS_CONNEXIONS?.send(VERSION);
        bootLocked = false;
        await test();
    }
    catch (err) {
        Console.error(err, true);
    }
});


//Discord events listeners
bot.on('guildCreate', guild => {
    if(bootLocked)
        return console.log("Erreur démarrage: guildCreate");
    try {
        let server = new ServerManager(guild);
        server.checklistNewServers();
    }
    catch (err) {
        Console.error(err);
    }
});

bot.on('guildDelete', guild => {
    if(bootLocked)
        return console.log("Erreur démarrage: guildDelete");
    try {
        let server = new ServerManager(guild);
        server.checkListRemoveServer();
    }
    catch (err) {
        Console.error(err);
    }
})

bot.on('messageCreate', msg => {
    if(bootLocked)
        return console.log("Erreur démarrage: message");
    try {
        EventManager.MessageCreateHandler(msg);
    }
    catch (err) {
        Console.error(err);
    }
})

bot.on('interactionCreate', intera => {
    if(bootLocked)
        return console.log("Erreur démarrage: intera");
    try {
        EventManager.interactionHandler(intera);
    }
    catch (err) {
        Console.error(err);
    }
})

export { bot, Console, chanList, dev, db, botCommands, TranslationsCache, consoleErrors, StatusCache };


async function test() {
}