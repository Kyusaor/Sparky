import { GuildMember, PermissionFlagsBits } from "discord.js";
import { CommandInterface, RolesData, textLanguage } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Console, TranslationsCache, bot, consoleErrors, db } from "../../main.js";
import { ServerManager } from "../managers/servers.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";

export const watcher:CommandInterface = {
    permissionLevel: 2,

    commandStructure: CommandManager.baseSlashCommandBuilder("watcher", "admin"),

    async run({ intera, language, commandText }) {

        if(!intera.guild)
            return Console.error(consoleErrors.notInAGuild, true)

        let botmember = await intera.guild!.members.fetch(bot.user!)
        let check = checkPerm(botmember, language);
        if(check)
            return Command.prototype.reply(check, intera);

        //Check DB
        let guild = new ServerManager(intera.guild);        
        let guildData = await guild.getData("full");
        if(!guildData)
            await db.createServer(intera.guild.id, intera.guild.name, Utils.getLanguageFromLocale(intera.guild.preferredLocale));

        //manage role deletion if watcher is already defined
        if(await guild.hasWatcher()) {
            let confirm = await Command.getConfirmationMessage({intera, language, commandText}, commandText.askIfReparam);
            if(confirm !== 'yes')
                return Command.prototype.reply({content: TranslationsCache[language].global.cancelledCommand, components: []}, intera);

            let roles = await guild.getData("roles") as RolesData;
            for(let role of Object.values(roles)) {
                let guildRole = await intera.guild.roles.fetch(role);
                if(!guildRole) {
                    Console.info(Translations.displayText(commandText.roleNotFound, { id: intera.guild.id, text: role, text2: intera.guild.name }));
                    continue;
                }
                if(botmember.roles.highest.comparePositionTo(guildRole) < 0) {
                    Console.info(Translations.displayText(commandText.roleNotCancellable, { id: intera.guild.id, text: role, text2: intera.guild.name }))
                    return Command.prototype.reply(Translations.displayText(commandText.roleTooHigh, { text: guildRole.name}), intera);
                }
            }
        }


    }
}

function checkPerm(bot:GuildMember, language: textLanguage): string | undefined {
    let text = TranslationsCache[language].permissions
    let str = text.MissingPermissions;
    if(!bot.permissions.has([PermissionFlagsBits.ManageRoles])) str += text.flags.ManageRoles;
    if(!bot.permissions.has([PermissionFlagsBits.ManageChannels])) str += text.flags.ManageChannels;
    if(!bot.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles])) return str
}