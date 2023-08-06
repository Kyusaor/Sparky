import { APIApplicationCommandOptionChoice, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, InteractionReplyOptions, MessagePayload, PermissionFlagsBits, PermissionResolvable, PermissionsBitField, SlashCommandAttachmentOption, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandNumberOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder, SlashCommandUserOption, TextBasedChannel } from "discord.js";
import { Console, TranslationsCache, bot, botCommands, db } from "../../main.js";
import { Translations } from "../constants/translations.js";
import {  CommandArgs, CommandInterface, CommandName, SingleLanguageCommandTranslation, TranslationCacheType, TranslationObject, perksType, textLanguage } from "../constants/types.js";
import { readFileSync, readdirSync } from "fs";

export abstract class CommandManager {

    static baseSlashCommandBuilder(name: CommandName, perm: perksType): SlashCommandBuilder {
        const frJSON = JSON.parse(readFileSync(`./ressources/text/fr.json`, 'utf-8'));
        const enJSON = JSON.parse(readFileSync(`./ressources/text/en.json`, 'utf-8'));

        let translations:TranslationCacheType = { fr: frJSON, en: enJSON };

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
        let commandText = Translations.getCommandText(intera.commandName as CommandName)[language].text as Record<string, string>;

        let args: CommandArgs = {
            intera,
            language,
            commandText
        };

        try {
            await command.run(args);
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
    commandStructure: SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    run:(args: CommandArgs) => unknown;

    constructor(args: CommandInterface) {
        this.permissionLevel = args.permissionLevel;
        this.commandStructure = args.commandStructure;
        this.run = args.run;
    }

    async reply(data: string | MessagePayload | InteractionReplyOptions, intera: ChatInputCommandInteraction) {
        let missingPerm = await Command.getMissingPermissions([PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages], intera.channel!, intera.guildId);
        if(missingPerm.length > 0)
            data = await Command.returnMissingPermissionMessage(missingPerm, intera.guildId!);
        
        if (!intera.deferred && !intera.replied) return intera.reply(data);
        try {
            intera.editReply(data);
        }
        catch {
            await intera.deleteReply().catch(e => e)
            return intera.followUp(data).catch(e => Console.log(e))
        }
    };

    static generateSubcommandBuilder(command:CommandName, name: string): SlashCommandSubcommandBuilder {
        if(!Object.keys(TranslationsCache.fr.commands).includes(command))
            throw "Erreur: infos de localisation indisponibles (commande introuvable)"

        let sub = new SlashCommandSubcommandBuilder;
        sub.setName(name)
            .setNameLocalizations(this.getSubcommandTranslations(command, name, "name", "sub"))
            .setDescription(this.getSubcommandTranslations(command, name, "description", "sub")['en-US'])
            .setDescriptionLocalizations(this.getSubcommandTranslations(command, name, "description", "sub"))

        return sub
    }

    static generateCommandOptionBuilder(command:CommandName, name: string, option:"user" | "number" | "string" | "channel" | "file", isSubOption?: true | undefined, optionName?:string) {
        if(!Object.keys(TranslationsCache.fr.commands).includes(command))
            throw "Erreur: infos de localisation indisponibles (commande introuvable)"

        let sub;
        switch(option) {
            case 'string':
                sub = new SlashCommandStringOption();
                break;

            case 'number':
                sub = new SlashCommandNumberOption();
                break;

            case 'user':
                sub = new SlashCommandUserOption();
                break;

            case 'channel':
                sub = new SlashCommandChannelOption();
                break;

            case 'file':
                sub = new SlashCommandAttachmentOption();
                break;

            default:
                throw "Type de subcommande non reconnu";
        }

        sub.setName(optionName || name)
            .setNameLocalizations(this.getSubcommandTranslations(command, name, "name", (isSubOption ? "sub-option" : "option"), optionName))
            .setDescription(this.getSubcommandTranslations(command, name, "description", (isSubOption ? "sub-option" : "option"), optionName)['en-US'])
            .setDescriptionLocalizations(this.getSubcommandTranslations(command, name, "description", (isSubOption ? "sub-option" : "option"), optionName))

        return sub
    };

    static getChoices(command: CommandName, optionName:string):APIApplicationCommandOptionChoice<string>[] {
        let path = './ressources/text/'
        let translationPath = readdirSync(path);
        
        let choicesTranslations:Record<string, Record<string, string>> = {}
    
        for(let language of translationPath) {
            let lang = language.slice(0, -5) as textLanguage;
            let file = JSON.parse(readFileSync(`${path}${language}`, 'utf-8')) as TranslationObject;
    
            choicesTranslations[lang] = (file.commands[command] as SingleLanguageCommandTranslation).choices![optionName]
        }
        
        let list:APIApplicationCommandOptionChoice<string>[] = []
        for(let item of Object.keys(choicesTranslations.en)) {
            let list_locale:Record<string, string> = {};
            Object.keys(choicesTranslations).forEach(e =>{
                if(e !== 'en')
                    list_locale[e] = choicesTranslations[e][item]
            })
            list.push({ name: choicesTranslations.en[item], name_localizations: list_locale, value: item})
        }
        return list
        }

    static getSubcommandTranslations(command: CommandName, subcommand: string, type: "name" | "description", optionType: "sub" | "option" | "sub-option", optionName?:string):Record<string, string> {

        let data:Record<string, string> = {};
        for(let lang of Object.keys(TranslationsCache)) {
            let language = lang;
            if(language == 'en')
                language = 'en-US';
            let translationData:SingleLanguageCommandTranslation = TranslationsCache[lang as textLanguage].commands[command as keyof typeof TranslationsCache.fr.commands];
            switch(optionType) {
                case 'option':
                    data[language] = translationData.options![subcommand as keyof typeof translationData.subcommand][type]
                    break;

                case 'sub':
                    data[language] = translationData.subcommand![subcommand as keyof typeof translationData.subcommand][type]
                    break;

                case 'sub-option':
                    data[language] = translationData.subcommand![subcommand as keyof typeof translationData.subcommand].options![optionName!][type];
                    break;

                default:
                    break;
            }
        }
        return data;
    };

    static generateYesNoButtons(command: CommandName, language: textLanguage, additionalLabel?: string) {
        let buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId(`${command}${additionalLabel}-yes`)
                    .setStyle(ButtonStyle.Success)
                    .setLabel(TranslationsCache[language].global.yes),

                new ButtonBuilder()
                    .setCustomId(`${command}${additionalLabel}-no`)
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(TranslationsCache[language].global.no)
            ])
        
        return buttons    
    };

    static async getConfirmationMessage({ intera, language }: CommandArgs, text?: string, embeds?:EmbedBuilder[], time?:number):Promise<"yes" | "no" | "error"> {
        let payload:MessagePayload | InteractionReplyOptions = {content: text, components: [Command.generateYesNoButtons('language', language)]};
        if(embeds)
            payload.embeds = embeds
        Command.prototype.reply(payload, intera);

        let confirmationResponse;
        try {
            let filter = (button:ButtonInteraction<"cached">) => button.user.id === intera.user.id && button.customId.includes(intera.commandName)
            confirmationResponse = await intera.channel?.awaitMessageComponent({ componentType: ComponentType.Button, filter, time: time || 15000})
        } catch {
            return "error"
        }
        if(confirmationResponse?.customId.endsWith('yes'))
            return "yes"
        else if(confirmationResponse?.customId.endsWith('no'))
            return "no"
        else return "error"
        

    };

    static getMissingPermissions(requiredPermissions: PermissionResolvable[], channel:TextBasedChannel, guildId?:string | null):string[] {
        if(channel.type == ChannelType.DM || !guildId)
            return [];
        let botPermissions = channel.permissionsFor(bot.user!.id);
        let permissionsBitfield = new PermissionsBitField(requiredPermissions).toArray();
        let missingPermissions:string[] = [];

        for(let perm of permissionsBitfield) {
            if(!botPermissions?.has(perm))
                missingPermissions.push(perm)
        }

        return missingPermissions;
    };

    static async returnMissingPermissionMessage(perms:string[], guildId:string):Promise<string> {
        let language = await db.returnServerLanguage(guildId);
        let permList:string = "";

        for(let perm of perms) {
            permList += `-${TranslationsCache[language].permissions.flags[perm as keyof typeof TranslationsCache.fr.permissions.flags]}\n`
        }

        return Translations.displayText(TranslationsCache[language].permissions.MissingPermissions, { text: permList})
    }
}


function userCommandLogString(intera: ChatInputCommandInteraction):string {
    let baseText = `${intera.user.username} (${intera.user.id}) a executé la commande ${intera.commandName} `;
    let chanText:string = "";
    intera.channel!.type == ChannelType.GuildText ?
        chanText = `sur le salon ${intera.channel?.name} (${intera.channel?.id}), serveur ${intera.guild?.name} (${intera.guild?.id})` :
        chanText = `en mp`;
    return baseText + chanText
}