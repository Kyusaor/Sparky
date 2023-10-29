import { APIApplicationCommandOptionChoice, APIEmbed, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, ChatInputCommandInteraction, ComponentType, Embed, EmbedBuilder, GuildMember, GuildMemberRoleManager, InteractionReplyOptions, InteractionType, InteractionUpdateOptions, MessagePayload, PermissionFlagsBits, PermissionResolvable, PermissionsBitField, Role, RoleData, SlashCommandAttachmentOption, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder, SlashCommandUserOption, StringSelectMenuInteraction, TextBasedChannel, TextChannel, parseEmoji, time } from "discord.js";
import { Console, StatusCache, TranslationsCache, bot, botCommands, chanList, db } from "../../main.js";
import { Translations } from "../constants/translations.js";
import { CommandArgs, CommandInterface, CommandName, RolesData, SingleLanguageCommandTranslation, TranslationCacheType, TranslationObject, cacheLockScope, embedPageData, hellEventData, hellEventTask, perksType, textLanguage } from "../constants/types.js";
import { readFileSync, readdirSync } from "fs";
import { Utils } from "../utils.js";
import { Constants, DiscordValues } from "../constants/values.js";
import { ServerManager } from "./servers.js";

export abstract class CommandManager {

    static baseSlashCommandBuilder(name: CommandName, perm: perksType): SlashCommandBuilder {
        const frJSON = JSON.parse(readFileSync(`./ressources/text/fr.json`, 'utf-8'));
        const enJSON = JSON.parse(readFileSync(`./ressources/text/en.json`, 'utf-8'));

        let translations: TranslationCacheType = { fr: frJSON, en: enJSON };

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
        let Commands: Command[] = [];

        for (const file of commandsFiles) {
            const commandName = file.slice(0, -3);
            const commandData = await import(`../commands/${commandName}.js`);
            if (!commandData) {
                Console.error(`Impossible de récupérer le fichier ${file}`);
                continue;
            }
            let command = new Command(commandData[commandName]);
            Commands.push(command);
        }

        Console.log(`${Commands.length} commandes chargées avec succès`);
        return Commands;
    };

    static async slashCommandManager(intera: ChatInputCommandInteraction, language: textLanguage) {
        if (!intera.guildId && !['link', 'help'].includes(intera.commandName))
            return intera.reply(`${TranslationsCache.fr.global.noCommandOffServer}\n\n${TranslationsCache.en.global.noCommandOffServer}`);

        if (intera.guild && !(await db.checkIfServerIsPresent(intera.guild)))
            await db.createServer(intera.guild.id, intera.guild.name, Utils.getLanguageFromLocale(intera.guild.preferredLocale));

        let command = botCommands.find(com => com.commandStructure.name == intera.commandName);
        if (!command) {
            intera.reply({ content: TranslationsCache[language].global.CommandExecutionError, ephemeral: true });
            return Console.info(`Impossible de récupérer la commande ${intera.commandName}`);
        }
        if (StatusCache.isLocked(intera.guildId || intera.user.id, intera.user.id, intera.commandName as CommandName))
            return Command.prototype.reply(TranslationsCache[language].global.commandIsLocked, intera);

        let commandText = Translations.getCommandText(intera.commandName as CommandName)[language].text as Record<string, string>;

        let args: CommandArgs = {
            intera,
            language,
            commandText
        };

        try {
            StatusCache.lock(intera.guildId || intera.user.id, intera.user.id, intera.commandName as CommandName)
            await command.run(args);
            StatusCache.unlock(intera.guildId || intera.user.id, intera.user.id, intera.commandName as CommandName)
            Console.log(userCommandLogString(intera));
            chanList.LOGS_USERS?.send(`__**New command**__\nUser: \`${intera.user.username}\`\nId: \`${intera.user.id}\`\nCommand: \`${intera.commandName}\`\nServer: \`${intera.guild?.name}\`\nID: \`${intera.guildId}\``)
        }
        catch (err) {
            Command.prototype.reply({ content: TranslationsCache[language].global.CommandExecutionError, components: [] }, intera)
                .catch(e => { intera.channel?.send(TranslationsCache[language].global.CommandExecutionError).catch(e => e) });
            StatusCache.unlock(intera.guildId || intera.user.id, intera.user.id, intera.commandName as CommandName)
            Console.error(err);
        }
    };

    static async buttonInteractionManager(button: ButtonInteraction, language: textLanguage) {
        if (button.message.author.id !== bot.user!.id)
            return;
        let command = this.getCommandFromButtonId(button.customId);
        if (!command)
            return Console.info(TranslationsCache.fr.global.errors.buttonWithoutCommand + button.customId)

        if (command !== 'not a base button' && StatusCache.isLocked(button.guildId, button.user.id, command)) {
            return Command.prototype.reply({ content: TranslationsCache[language].global.commandIsLocked, ephemeral: true }, button);
        }
        switch (command) {
            case "serverlist":
                await Command.defilePage("serverlist", button);
                break;

            case "setglobalping":
                await WatcherManager.MentionManager(button);
                break;

            default:
                return;
        }
        StatusCache.unlock(button.guildId, button.user.id, command)
    }

    static getCommandFromButtonId(buttonId: string): CommandName | "not a base button" | undefined {

        for (let key of botCommands) {
            let name = key.commandStructure.name;
            if (buttonId.endsWith('yes') || buttonId.endsWith('no') || buttonId.includes("nbb")) return "not a base button";
            if (buttonId.includes(`${name}-`)) return name as CommandName
        }

        let hellEventsList = Object.keys(TranslationsCache.fr.others.hellMentions);
        if (
            hellEventsList.find(e => buttonId.includes(e))
        ) return "not a base button";

    }

}

export class Command implements CommandInterface {

    permissionLevel: 1 | 2 | 3;
    neededPermissions?: bigint[];
    cacheLockScope: "guild" | "user" | "none";
    commandStructure: SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    run: (args: CommandArgs) => unknown;

    constructor(args: CommandInterface) {
        this.permissionLevel = args.permissionLevel;
        this.cacheLockScope = args.cacheLockScope;
        this.commandStructure = args.commandStructure;
        this.neededPermissions = args.neededPermissions;
        this.run = args.run;
    }

    async reply(data: string | MessagePayload | InteractionReplyOptions, intera: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction) {
        let missingPerm = await Command.getMissingPermissions([PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages], intera.channel!, intera.guildId);
        if (missingPerm.length > 0)
            data = await Command.returnMissingPermissionMessage(missingPerm, intera.guildId!);

        try {
            if (intera.replied) {
                await intera.deleteReply().catch(e => e);
                return intera.followUp(data);
            }
            if (intera.deferred) {
                return intera.editReply(data);
            }
            return intera.reply(data);
        }
        catch {
            Console.error(TranslationsCache.fr.global.errors.unableToReply)
        }
    };

    static generateSubcommandBuilder(command: CommandName, name: string): SlashCommandSubcommandBuilder {
        if (!Object.keys(TranslationsCache.fr.commands).includes(command))
            throw "Erreur: infos de localisation indisponibles (commande introuvable)"

        let sub = new SlashCommandSubcommandBuilder;
        sub.setName(name)
            .setNameLocalizations(this.getSubcommandTranslations(command, name, "name", "sub"))
            .setDescription(this.getSubcommandTranslations(command, name, "description", "sub")['en-US'])
            .setDescriptionLocalizations(this.getSubcommandTranslations(command, name, "description", "sub"))

        return sub
    }

    static generateCommandOptionBuilder(command: CommandName, name: string, option: "user" | "number" | "string" | "channel" | "file" | "integer", isSubOption?: true | undefined, optionName?: string) {
        if (!Object.keys(TranslationsCache.fr.commands).includes(command))
            throw "Erreur: infos de localisation indisponibles (commande introuvable)"

        let sub;
        switch (option) {
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

            case 'integer':
                sub = new SlashCommandIntegerOption();
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

    static generateButtonCustomId(command: CommandName, language: textLanguage): string {
        return `${command}-${language}`
    }

    static getChoices(command: CommandName, optionName: string): APIApplicationCommandOptionChoice<string>[] {
        let path = './ressources/text/'
        let translationPath = readdirSync(path);

        let choicesTranslations: Record<string, Record<string, string>> = {}

        for (let language of translationPath) {
            let lang = language.slice(0, -5) as textLanguage;
            let file = JSON.parse(readFileSync(`${path}${language}`, 'utf-8')) as TranslationObject;

            choicesTranslations[lang] = (file.commands[command] as SingleLanguageCommandTranslation).choices![optionName]
        }

        let list: APIApplicationCommandOptionChoice<string>[] = []
        for (let item of Object.keys(choicesTranslations.en)) {
            let list_locale: Record<string, string> = {};
            Object.keys(choicesTranslations).forEach(e => {
                if (e !== 'en')
                    list_locale[e] = choicesTranslations[e][item]
            })
            list.push({ name: choicesTranslations.en[item], name_localizations: list_locale, value: item })
        }
        return list
    }

    static getSubcommandTranslations(command: CommandName, subcommand: string, type: "name" | "description", optionType: "sub" | "option" | "sub-option", optionName?: string): Record<string, string> {

        let data: Record<string, string> = {};
        for (let lang of Object.keys(TranslationsCache)) {
            let language = lang;
            if (language == 'en')
                language = 'en-US';
            let translationData: SingleLanguageCommandTranslation = TranslationsCache[lang as textLanguage].commands[command as keyof typeof TranslationsCache.fr.commands];
            switch (optionType) {
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
                    .setCustomId(`${this.generateButtonCustomId(command, language)}${additionalLabel}-yes`)
                    .setStyle(ButtonStyle.Success)
                    .setLabel(TranslationsCache[language].global.yes),

                new ButtonBuilder()
                    .setCustomId(`${this.generateButtonCustomId(command, language)}${additionalLabel}-no`)
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(TranslationsCache[language].global.no)
            ])

        return buttons
    };

    static generatePageButtons(command: CommandName, language: textLanguage, additionalLabel?: string, isFirstOrLast?: "first" | "last"): ActionRowBuilder<ButtonBuilder> {
        let previous = new ButtonBuilder()
            .setCustomId(`${this.generateButtonCustomId(command, language)}${("-" + additionalLabel)}-previousPage`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('◀');

        let next = new ButtonBuilder()
            .setCustomId(`${this.generateButtonCustomId(command, language)}${("-" + additionalLabel)}-nextPage`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('▶');

        if (isFirstOrLast == "first")
            previous.setDisabled(true)

        if (isFirstOrLast == "last")
            next.setDisabled(true)

        let buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([previous, next])

        return buttons
    }

    static async getConfirmationMessage(intera: ChatInputCommandInteraction | ButtonInteraction, commandname: CommandName, language: textLanguage, options?: { text?: string, embeds?: EmbedBuilder[], time?: number, ephemeral?: boolean, deleteMsg?: boolean }): Promise<"yes" | "no" | "error"> {
        let payload: MessagePayload | InteractionReplyOptions = { content: options?.text, components: [Command.generateYesNoButtons(commandname, language)], ephemeral: options?.ephemeral };
        if (options?.embeds)
            payload.embeds = options?.embeds
        await Command.prototype.reply(payload, intera);

        let confirmationResponse;
        try {
            let filter = (button: ButtonInteraction<"cached">) => button.user.id === intera.user.id && button.customId.includes(commandname)
            confirmationResponse = await intera.channel?.awaitMessageComponent({ componentType: ComponentType.Button, filter, time: options?.time || 15000 })
        } catch {
            intera.channel?.lastMessage?.delete().catch(e => Console.error(e));
            return "error"
        }

        if (options?.deleteMsg) {
            if (intera.isChatInputCommand())
                intera.deleteReply().catch(e => Console.error(e));
            if (intera.isButton()) {
                confirmationResponse?.message.delete().catch(e => Console.error(e));
            }
        }
        if (confirmationResponse?.customId.endsWith('yes'))
            return "yes"
        else if (confirmationResponse?.customId.endsWith('no'))
            return "no"
        else return "error"
    };

    static getMissingPermissions(requiredPermissions: PermissionResolvable[], channel: TextBasedChannel, guildId?: string | null): string[] {
        if (channel.type == ChannelType.DM || !guildId)
            return [];
        let botPermissions = channel.permissionsFor(bot.user!.id);
        let permissionsBitfield = new PermissionsBitField(requiredPermissions).toArray();
        let missingPermissions: string[] = [];

        for (let perm of permissionsBitfield) {
            if (!botPermissions?.has(perm))
                missingPermissions.push(perm)
        }

        return missingPermissions;
    };

    static async returnMissingPermissionMessage(perms: string[], guildId: string): Promise<string> {
        let language = await db.returnServerLanguage(guildId);
        let permList: string = "";

        for (let perm of perms) {
            permList += `-${TranslationsCache[language].permissions.flags[perm as keyof typeof TranslationsCache.fr.permissions.flags]}\n`
        }

        return Translations.displayText(TranslationsCache[language].permissions.MissingPermissions, { text: permList })
    }

    static async defilePage(command: CommandName, button: ButtonInteraction) {

        let customId = button.customId;
        let embed = button.message.embeds[0].data;
        let pageData: embedPageData = getPageData(embed, customId, command);

        let newEmbedPage = await (await import(`../commands/${command}.js`)).getEditedEmbed(pageData, embed);

        let components: ActionRowBuilder<ButtonBuilder>
        if (pageData.current + pageData.target == 1) {
            components = this.generatePageButtons(command, pageData.language, pageData.filter?.toString(), "first")
        }
        else if (pageData.current + pageData.target == pageData.total) {
            components = this.generatePageButtons(command, pageData.language, pageData.filter?.toString(), "last")
        }
        else {
            components = this.generatePageButtons(command, pageData.language, pageData.filter?.toString())
        }
        button.update({ embeds: [newEmbedPage], components: [components] });
    }
}


export class StatusCacheClass {

    type: Record<CommandName, cacheLockScope>;
    locked: Record<CommandName, string[]>;

    constructor(commandList: Command[]) {
        this.type = {} as any;
        this.locked = {} as any;
        for (let command of commandList) {
            this.type[command.commandStructure.name as CommandName] = command.cacheLockScope;
            this.locked[command.commandStructure.name as CommandName] = [];
        }
    }

    getTarget(guild: string, user: string, command: CommandName): string {
        switch (this.type[command]) {
            case 'guild':
                return guild;

            case 'user':
                return user

            default:
                return "nope";
        }
    }

    lock(guild: string | null, user: string, command: CommandName): void {
        const target = this.getTarget(guild || user, user, command);
        if (target !== "nope")
            this.locked[command].push(target);
    }

    unlock(guild: string | null, user: string, command: CommandName): void {
        let target: string = this.getTarget(guild || user, user, command);

        while (this.locked[command].includes(target)) {
            let index = this.locked[command].findIndex(e => e == target);
            this.locked[command].splice(index, 1);
        }
    }

    isLocked(guild: string | null, user: string, command: CommandName): boolean {
        return this.locked[command].includes(this.getTarget(guild || user, user, command));
    }
}

export class WatcherManager {

    //Watcher mention management
    static async MentionManager(button: ButtonInteraction) {
        StatusCache.lock(button.guild!.id, button.user.id, "setglobalping");
        let language = button.customId.split("-")[1] as textLanguage;

        let payload = this.generateTypeEventMessage(button, language);
        await Command.prototype.reply({ content: payload.message, components: payload.buttons }, button);

        let event = await this.getEventType(button, payload.list);
        if (event == "error")
            return Command.prototype.reply({ content: TranslationsCache[language].global.cancelledCommand, ephemeral: true, components: [] }, button);

        let eventData = this.getEventData(event, button.customId);
        let confirmation = await Command.getConfirmationMessage(button, "setglobalping", language, { text: this.getConfirmationMessage(language, eventData), deleteMsg: true });

        if (confirmation !== 'yes') {
            return Command.prototype.reply({ content: TranslationsCache[language].global.cancelledCommand, ephemeral: true, components: [] }, button);
        }

        await this.sendMentions(eventData);
        this.logMention(eventData, button);
    }

    static generateTypeEventMessage(button: ButtonInteraction, language: textLanguage) {
        let event = button.customId.split("-")[2] as keyof typeof Constants.WatcherMentionsTemplates;
        const text = TranslationsCache[language].others.hellMentions;

        let buttons: ActionRowBuilder<ButtonBuilder>[] = [];
        let row = new ActionRowBuilder<ButtonBuilder>();
        let list: string[] = [];
        let message = Translations.displayText(text.baseTypeMsg, { text: text[event] })

        for (let i = 0; i < Constants.WatcherMentionsTemplates[event].length; i++) {

            if (row.components.length == 5) {
                buttons.push(row);
                row = new ActionRowBuilder<ButtonBuilder>()
            }

            let currentType = Constants.WatcherMentionsTemplates[event][i];
            let customId: string = "";
            let emoji: string;
            if (Array.isArray(currentType)) {
                customId = currentType.join("-");
                emoji = DiscordValues.defaultEmotes.numbers[i];
                message += `-${emoji}: ${currentType.map(e => text[e as keyof typeof Constants.WatcherMentionsTemplates]).join(", ")}\n`
            } else {
                customId = currentType;
                let customEmoji = Constants.hellMenu[currentType as keyof typeof Constants.hellMenu]?.emoji ||
                    DiscordValues.emotes[currentType as keyof typeof DiscordValues.emotes];
                emoji = customEmoji.id
                let stringEmoji = `<:${customEmoji.name}:${customEmoji.id}>`
                message += `-${stringEmoji}: ${text[currentType as keyof typeof Constants.WatcherMentionsTemplates]}\n`
            }

            list.push(customId);
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(customId)
                    .setEmoji(emoji)
                    .setStyle(ButtonStyle.Secondary)
            )
        }

        message += text.baseTypeMsgEnd;
        buttons.push(row);

        return { message, buttons, list }
    }

    static async getEventType(button: ButtonInteraction, customIdList: string[]): Promise<keyof typeof TranslationsCache.fr.others.hellMentions | "error"> {
        let confirmationResponse;
        try {
            let filter = (buttonReply: ButtonInteraction<"cached">) => buttonReply.user.id === button.user.id && customIdList.includes(buttonReply.customId)
            confirmationResponse = await button.channel!.awaitMessageComponent({ componentType: ComponentType.Button, filter, time: 10000 })
        } catch {
            return "error"
        }
        return confirmationResponse.customId as keyof typeof TranslationsCache.fr.others.hellMentions
    }

    static getEventData(event: keyof typeof TranslationsCache.fr.others.hellMentions, customId: string): hellEventData {
        return {
            hellOrChallenge: event.includes("challenge") ? "challenge" : "hell",
            type: event.split('-'),
            reward: customId.split('-')[2],
        } as hellEventData
    }

    static getConfirmationMessage(language: textLanguage, eventData: hellEventData): string {
        let text = TranslationsCache[language].others.hellMentions
        let confirmationText = Translations.displayText(text.confirmation, {
            text: text[eventData.hellOrChallenge as keyof typeof text],
            text2: text[eventData.reward as keyof typeof text],
            text3: eventData.type.map(e => text[e as keyof typeof text]).join(", ")
        })
        return confirmationText;
    }

    static async sendMentions(event: hellEventData) {
        let chanlist = await db.fetchServersHellChannels(this.displayRoleToMention(event));
        if (!chanlist)
            throw TranslationsCache[Constants.defaultLanguage].global.errors.DBerror;
        let message = this.buildHellMentionMessage(event);

        for (let chan of chanlist) {
            let channel = await bot.channels.cache.get(chan.ping) as TextChannel;
            if (!channel)
                continue;
            let language = await db.returnServerLanguage(channel.guildId);
            try {
                if (!channel)
                    throw TranslationsCache.fr.global.errors.noChannel;
                if(channel.permissionsFor(channel.guild.members.me!).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]))
                    await channel.send(Translations.displayText(message[language], { id: chan.role }));
            } catch (e) {
                Console.error(e);
                continue;
            }
        }
    }

    static buildHellMentionMessage(event: hellEventData): Record<textLanguage, string> {
        let textTranslations: Partial<Record<textLanguage, string>> = {};
        let minutes = new Date().getMinutes();
        Object.keys(TranslationsCache).forEach(lang => {
            let text = TranslationsCache[lang as textLanguage].others.hellMentions;

            let base = Translations.displayText(text.baseMentionMsg, { text: text[event.hellOrChallenge], text2: text[event.reward], text3: event.type.map(e => text[e]).join(", ") });

            let timer = minutes >= 55 ?
                Translations.displayText(text.remainingTimeAfterBegining, { text: Math.floor(Math.abs(minutes - 60)).toString() }) :
                Translations.displayText(text.remainingTimeBeforeEnd, { text: Math.floor(55 - minutes).toString() });
            textTranslations[lang as textLanguage] = base + timer
        })

        return textTranslations as Record<textLanguage, string>;
    }

    static displayRoleToMention(event: hellEventData): keyof RolesData {
        let role: keyof RolesData;
        if (event.type[0] == 'research' && event.type.length == 1) {
            event.reward == 'dragon' ?
                role = "dragonResearch" :
                role = "watcherResearch";
            return role;
        }
        if (event.hellOrChallenge == 'challenge') {
            event.type[0] == 'research' ?
                role = 'challengeResearch' :
                role = 'challengeTroops'
            return role
        }
        return event.reward;
    }

    static async logMention(data: hellEventData, button: ButtonInteraction) {
        let text = TranslationsCache.fr.others.hellMentions;
        chanList.LOGS_HELL_EVENTS!.send(Translations.displayText(text.logMentions, { id: button.user.username, text: text[data.hellOrChallenge], text2: text[data.reward], text3: data.type.map(e => text[e]).join(", ") }));

        //Temporary log in board channel
        let message: string = "";
        for (let lang of Object.keys(TranslationsCache)) {
            text = TranslationsCache[lang as keyof typeof TranslationsCache].others.hellMentions;
            let typeString = data.type.map(e => {
                if (Object.keys(DiscordValues.emotes).includes(e)) {
                    let emoteData = DiscordValues.emotes[e as keyof typeof DiscordValues.emotes];
                    return `${text[e]} ${Utils.displayEmoteInChat(emoteData)}`
                }
                else return `${text[e]}`
            }).join(", ")

            let msg = Translations.displayText(text.temporaryLogMentions, {
                text: text[data.hellOrChallenge],
                text2: `${text[data.reward]} ${Utils.displayEmoteInChat(DiscordValues.emotes[data.reward])}`,
                text3: typeString
            })
            message += msg
        }
        button.channel?.send(message)
    }


    static async selectMenuManager(intera: StringSelectMenuInteraction, language: textLanguage) {
        if (intera.values.find(e => !Object.keys(Constants.hellMenu).includes(e)))
            return;

        let guild = new ServerManager(intera.guild!);
        let roles = await guild.getHellRoles();
        if (!roles)
            return Command.prototype.reply(TranslationsCache[language].commands.watcher.text.noRoles, intera);

        let changesList: { add: [keyof RolesData, string][], remove: [keyof RolesData, string][] } = {
            add: [],
            remove: []
        };

        let currentRoles = intera.member?.roles as GuildMemberRoleManager;
        for (let roleLabel of Object.keys(roles)) {
            if (currentRoles.cache.map(r => r.id).includes(roles[roleLabel as keyof typeof roles]) && !intera.values.includes(roleLabel))
                changesList.remove.push([roleLabel as keyof RolesData, roles[roleLabel as keyof typeof roles]])
            if (!currentRoles.cache.map(r => r.id).includes(roles[roleLabel as keyof typeof roles]) && intera.values.includes(roleLabel))
                changesList.add.push([roleLabel as keyof RolesData, roles[roleLabel as keyof typeof roles]])
        }

        let messageString: string = TranslationsCache[language].others.hellMentions.updateRolesMsg;

        for (let obj of changesList.add) {
            messageString += `(+) ${TranslationsCache[language].others.hellEvents[obj[0]]}\n`;
        }

        for (let obj of changesList.remove) {
            messageString += `(-) ${TranslationsCache[language].others.hellEvents[obj[0]]}\n`;
        }

        await Command.prototype.reply({ content: messageString, ephemeral: true }, intera);

        await Promise.allSettled(changesList.add.map(async (obj) => {
            try {
                await currentRoles.add(obj[1])
            } catch {
                Console.log(TranslationsCache[Constants.defaultLanguage].global.errors.RoleNotEditable);
            }
        }))

        await Promise.allSettled(changesList.remove.map(async (obj) => {
            messageString += `(-) ${TranslationsCache[language].others.hellEvents[obj[0]]}\n`;
            try {
                await currentRoles.remove(obj[1])
            } catch {
                Console.log(TranslationsCache[Constants.defaultLanguage].global.errors.RoleNotEditable);
            }
        }))

    }
}

function userCommandLogString(intera: ChatInputCommandInteraction): string {
    let baseText = `${intera.user.username} (${intera.user.id}) a executé la commande ${intera.commandName} `;
    let chanText: string = "";
    intera.channel!.type == ChannelType.GuildText ?
        chanText = `sur le salon ${intera.channel?.name} (${intera.channel?.id}), serveur ${intera.guild?.name} (${intera.guild?.id})` :
        chanText = `en mp`;
    return baseText + chanText
}

function getPageData(embed: Readonly<APIEmbed>, id: string, command: CommandName): embedPageData {
    let splitId = id.split('-');
    let language = splitId[1] as textLanguage;
    let target: -1 | 1;

    let current = Number(embed.footer?.text.split("/")[0].split("[")[1]);

    splitId[splitId.length - 1] == 'nextPage' ?
        target = 1 :
        target = -1;

    let total = Number(embed.footer?.text.split("/")[1].split("]")[0]);

    let filter: string | undefined = undefined
    let filterNames = (TranslationsCache[language].commands[command] as any).choices.filter || undefined;
    if (filterNames)
        filter = Object.keys(filterNames).find(k => embed.description?.includes(filterNames[k]));

    return { current, target, total, filter, language }
}