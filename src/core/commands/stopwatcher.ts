import { PermissionFlagsBits } from "discord.js";
import { Console, TranslationsCache, bot, consoleErrors, db } from "../../main.js";
import { Translations } from "../constants/translations.js";
import { CommandInterface, CommandName, fullServer } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { ServerManager } from "../managers/servers.js";
import { Utils } from "../utils.js";
import { checkPerm, deleteChanOrRole } from "./watcher.js";

export const stopwatcher:CommandInterface = { 
    permissionLevel: 2,

    neededPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles],

    cacheLockScope: "guild",

    commandStructure: CommandManager.baseSlashCommandBuilder("stopwatcher", "admin"),

    async run({ intera, language, commandText }) {
        if(!intera.guild)
            return Console.error(consoleErrors.notInAGuild, true)

        let botmember = await intera.guild!.members.fetch(bot.user!)
        let check = checkPerm(botmember, language);
        if(check)
            return Command.prototype.reply(check, intera);

        let guild = new ServerManager(intera.guild);        
        let guildData = await guild.getData("full") as fullServer;
        if(!guildData){
            await db.createServer(intera.guild.id, intera.guild.name, Utils.getLanguageFromLocale(intera.guild.preferredLocale));
            return Command.prototype.reply({content: Translations.displayText(commandText.watcherIsNotDefined, { text: TranslationsCache[language].commands.watcher.name})}, intera)
        }

        let hasWatcher = await guild.hasWatcher();
        if(!hasWatcher)
            return Command.prototype.reply({content: Translations.displayText(commandText.watcherIsNotDefined, { text: TranslationsCache[language].commands.watcher.name})}, intera)

        let confirm = await Command.getConfirmationMessage(intera, intera.commandName as CommandName, language, Translations.displayText(commandText.askIfDelete, { text: guildData.chans?.board, text2: guildData.chans?.ping}));
        if(confirm !== 'yes')
            return Command.prototype.reply({content: TranslationsCache[language].global.cancelledCommand, components: []}, intera);

        await Command.prototype.reply({ content: commandText.loadingText, components: []}, intera);
        await deleteChanOrRole("roles", intera.guild, botmember, commandText, intera);
        await deleteChanOrRole("channels", intera.guild, botmember, commandText, intera);

        Command.prototype.reply(Translations.displayText(commandText.success, { text: TranslationsCache[language].commands.watcher.name}), intera);

        await guild.deleteHellData();
    },
}