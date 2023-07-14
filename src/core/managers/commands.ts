import { ChannelType, ChatInputCommandInteraction, InteractionReplyOptions, MessagePayload, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { Console, TranslationsCache, bot, botCommands, db } from "../../main.js";
import { Translations } from "../constants/translations.js";
import {  CommandArgs, CommandInterface, TranslationCacheType } from "../constants/types.js";
import { readFileSync, readdirSync } from "fs";

export abstract class CommandManager {

    static baseSlashCommandBuilder(name: string, perm: "member" | "admin" | "dev"): SlashCommandBuilder {
        let translations:TranslationCacheType = TranslationsCache;
        if(translations == undefined){
            const frJSON = JSON.parse(readFileSync(`./ressources/text/fr.json`, 'utf-8'), Translations.reviver);
            const enJSON = JSON.parse(readFileSync(`./ressources/text/en.json`, 'utf-8'), Translations.reviver);

            translations = { fr: frJSON, en: enJSON };
        }
        let defaultText = [translations.fr.commands, translations.en.commands];
        let text = {
            fr: defaultText[0][name as keyof typeof defaultText[0]],
            en: defaultText[1][name as keyof typeof defaultText[1]],
        };

        let build = new SlashCommandBuilder()
            .setDMPermission(false)
            .setName(text.en.name)
            .setNameLocalization("fr", text.fr.name)
            .setDescription(text.en.description)
            .setDescriptionLocalization("fr", text.fr.description);

        if (perm !== "member")
            build.setDefaultMemberPermissions(0);

        return build;
    }

    static async buildBotCommands(): Promise<Command[]> {
        let commandsFiles = readdirSync('./src/core/commands/');
        let Commands:Command[] = [];

        for(const file of commandsFiles){
            const commandName = file.slice(0, -3);
            const commandData = await import(`../commands/${commandName}.js`);
            if(!commandData) {
                Console.error(`Impossible de récupérer le fichier ${file}`);
                continue;
            }
            let command = new Command(commandData[commandName]);
            Commands.push(command);
        }

        Console.log(`${Commands.length} commandes chargées avec succès`);
        return Commands;
    };

    static async slashCommandManager(intera: ChatInputCommandInteraction) {
        if (!intera.guildId && !['link', 'help'].includes(intera.commandName))
            return intera.reply(`${TranslationsCache.fr.global.noCommandOffServer}\n\n${TranslationsCache.en.global.noCommandOffServer}`);

        if (intera.guild && !await db.checkIfServerIsPresent(intera.guild))
            await db.createServer(intera.guild.id, intera.guild.name);

        let language = await Translations.getServerLanguage(intera.guildId);

        let command = botCommands.find(com => com.commandStructure.name == intera.commandName);
        if (!command) {
            intera.reply({ content: TranslationsCache[language].global.CommandExecutionError, ephemeral: true });
            return Console.info(`Impossible de récupérer la commande ${intera.commandName}`);
        }

        let args: CommandArgs = {
            intera,
            language
        };

        try {
            command.run(args);
            Console.log(userCommandLogString(intera));
        }
        catch (err) {
            intera.deleteReply().catch(e => e);
            Command.prototype.reply(TranslationsCache[language].global.CommandExecutionError, intera);
            Console.error(err);
        }
    };
}

export class Command implements CommandInterface {

    permissionLevel: 1 | 2 | 3;
    commandStructure: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    run:(args: CommandArgs) => Promise<void>;

    constructor(args: CommandInterface) {
        this.permissionLevel = args.permissionLevel;
        this.commandStructure = args.commandStructure;
        this.run = args.run;
    }

    async reply(data: string | MessagePayload | InteractionReplyOptions, intera: ChatInputCommandInteraction) {
        await checkReplyPermissions(data, intera);
        if (!intera.deferred && !intera.replied) return intera.reply(data);
        try {
            intera.editReply(data);
        }
        catch {
            await intera.deleteReply().catch(e => e)
            return intera.followUp(data).catch(e => Console.log(e))
        }
    };
}


async function checkReplyPermissions(data: string | MessagePayload | InteractionReplyOptions, intera: ChatInputCommandInteraction) {
    let channel = intera.channel as TextChannel
    let botPermissions = channel.permissionsFor(bot.user!.id);
    let missingPermissions = [];
    if(Object.keys(data).includes("attachment") && !botPermissions?.has(PermissionFlagsBits.AttachFiles)) {
        missingPermissions.push("AttachFiles")
    }
    if(Object.keys(data).includes("embeds") && !botPermissions?.has(PermissionFlagsBits.EmbedLinks)) {
        missingPermissions.push("EmbedLinks")
    }
    if(missingPermissions.length > 0) {
        let language = await db.returnServerLanguage(intera.guild!.id);
        let translation = TranslationsCache[language].permissions;
        let missingPermErrorReply:string = translation.MissingPermissions;
        for(let permission of missingPermissions) {
            missingPermErrorReply += translation.flags[permission as keyof typeof translation.flags]
        }
        data = missingPermErrorReply;
    }
}

function userCommandLogString(intera: ChatInputCommandInteraction):string {
    let baseText = `${intera.user.username} (${intera.user.id}) a executé la commande ${intera.commandName} `;
    let chanText:string = "";
    intera.channel!.type == ChannelType.GuildText ?
        chanText = `sur le salon ${intera.channel?.name} (${intera.channel?.id}), serveur ${intera.guild?.name} (${intera.guild?.id})` :
        chanText = ` en mp`;
    return baseText + chanText
}