import { APISelectMenuOption, ActionRowBuilder, CacheType, ChatInputCommandInteraction, EmbedBuilder, Guild, GuildMember, PermissionFlagsBits, Role, StringSelectMenuBuilder, TextChannel } from "discord.js";
import { ChanData, CommandInterface, CommandName, fullServer, RolesData, textLanguage } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Console, TranslationsCache, bot, consoleErrors, db, dev } from "../../main.js";
import { ServerManager } from "../managers/servers.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";
import { Constants, DiscordValues } from "../constants/values.js";

export const watcher: CommandInterface = {
    permissionLevel: 2,

    neededPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.AddReactions],

    cacheLockScope: "guild",

    commandStructure: CommandManager.baseSlashCommandBuilder("watcher", "admin")
        .addSubcommand(Command.generateSubcommandBuilder("watcher", "create"))
        .addSubcommand(Command.generateSubcommandBuilder("watcher", "refresh"))
        .addSubcommand(Command.generateSubcommandBuilder("watcher", "delete")),

    async run({ intera, language, commandText }) {

        let subcommand = intera.options.getSubcommand();

        if (!intera.guild)
            return Console.error(consoleErrors.notInAGuild, true)

        let botmember = await intera.guild!.members.fetch(bot.user!)
        let check = checkPerm(botmember, language);
        if (check)
            return Command.prototype.reply(check, intera);

        //Check DB
        let guild = new ServerManager(intera.guild);
        let guildData = await guild.getData("full") as fullServer;
        if (!guildData) {
            await db.createServer(intera.guild.id, intera.guild.name, Utils.getLanguageFromLocale(intera.guild.preferredLocale));
            if (subcommand !== "create")
                return Command.prototype.reply({ content: Translations.displayText(commandText.watcherIsNotDefined, { text: getSubcommandName("create", language) }) }, intera)
        }

        let hasWatcher = await guild.hasWatcher();

        switch (subcommand) {

            case 'create':
                if (hasWatcher)
                    return Command.prototype.reply({ content: Translations.displayText(commandText.boardAlreadyCreated, { text: getSubcommandName('refresh', language) }) }, intera)

                await Command.prototype.reply({ content: commandText.createLoadingText, components: [] }, intera);

                let boardChan = await createChannel("board", intera.guild, commandText, intera, language);
                let mentionsChan = await createChannel("ping", intera.guild, commandText, intera, language);

                let chans: ChanData = { board: boardChan.id, ping: mentionsChan.id };
                let roles: RolesData = await buildRoles(language, intera.guild);
                await guild.registerHellData(chans, roles, hasWatcher);

                let successString = Translations.displayText(commandText.createSuccess, { text: boardChan.id, text2: mentionsChan.id, text3: getSubcommandName("delete", language) })
                await Command.prototype.reply({ content: successString, components: [] }, intera);
                return;


            case 'refresh':
                if (!hasWatcher)
                    return Command.prototype.reply({ content: Translations.displayText(commandText.watcherIsNotDefined, { text: getSubcommandName("create", language) }) }, intera)

                await Command.prototype.reply({ content: commandText.refreshChannelsLoadingText, components: [] }, intera);
                let checkChan = await refreshChanOrRole("channels", intera.guild, commandText, intera, language);
                checkChan ?
                    await Command.prototype.reply({ content: commandText.refreshChannelsSuccessText, components: [] }, intera) :
                    await Command.prototype.reply({ content: commandText.refreshChannelsNothingChangedText, components: [] }, intera);

                let msg = await intera.channel?.send(commandText.refreshRolesLoadingText);
                let checkRoles = await refreshChanOrRole("roles", intera.guild, commandText, intera, language);
                checkRoles ?
                    msg?.edit(commandText.refreshRolesSuccessText) :
                    msg?.edit(commandText.refreshRolesNothingChangedText)
                return;


            case 'delete':
                if (!hasWatcher)
                    return Command.prototype.reply({ content: Translations.displayText(commandText.watcherIsNotDefined, { text: getSubcommandName("create", language) }) }, intera)

                let confirm = await Command.getConfirmationMessage(intera, intera.commandName as CommandName, language, { text: Translations.displayText(commandText.askIfDelete, { text: guildData.chans?.board, text2: guildData.chans?.ping }) });
                if (typeof confirm == "string")
                    return Command.prototype.reply({ content: TranslationsCache[language].global.cancelledCommand, components: [] }, intera);

                await Command.prototype.reply({ content: commandText.deleteLoadingText, components: [] }, intera);
                await deleteChanOrRole("roles", intera.guild, botmember, commandText, intera);
                await deleteChanOrRole("channels", intera.guild, botmember, commandText, intera);

                Command.prototype.reply(Translations.displayText(commandText.deleteSuccess, { text: TranslationsCache[language].commands.watcher.name }), intera);

                await guild.deleteHellData();
                return;


            default:
                break;
        }
    }
}

function checkPerm(bot: GuildMember, language: textLanguage): string | undefined {
    let text = TranslationsCache[language].permissions
    let str = "";
    if (!bot.permissions.has([PermissionFlagsBits.ManageRoles])) str += text.flags.ManageRoles;
    if (!bot.permissions.has([PermissionFlagsBits.ManageChannels])) str += text.flags.ManageChannels;
    if (!bot.permissions.has([PermissionFlagsBits.EmbedLinks])) str += text.flags.EmbedLinks;
    if (str.length > 1)
        return Translations.displayText(text.MissingPermissions, { text: str })
}

async function deleteChanOrRole(type: "channels" | "roles", guild: Guild, botmember: GuildMember, commandText: Record<string, string>, intera: ChatInputCommandInteraction<CacheType>): Promise<string | void> {
    let guildManager = new ServerManager(guild);
    let data = await guildManager.getData(type) as ChanData | RolesData;

    for (let dataId of Object.values(data).slice(1)) {
        let roleOrChannel;
        try {
            type == "channels" ?
                roleOrChannel = await guildManager.guild.channels.fetch(dataId) :
                roleOrChannel = await guildManager.guild.roles.cache.get(dataId);
        }
        catch {
            Console.info(Translations.displayText(commandText[`${type}NotFound`], { id: guildManager.guild.id, text: dataId, text2: guildManager.guild.name }));
            continue;
        }
        if (!roleOrChannel) {
            Console.info(Translations.displayText(commandText[`${type}NotFound`], { id: guildManager.guild.id, text: dataId, text2: guildManager.guild.name }));
            continue;
        }
        if (type == "roles" && botmember.roles.highest.comparePositionTo(roleOrChannel as Role) <= 0) {
            Console.info(Translations.displayText(commandText.rolesNotCancellable, { id: guildManager.guild.id, text: dataId, text2: guildManager.guild.name }))
            intera.channel?.send({ content: Translations.displayText(commandText.roleTooHigh, { text: roleOrChannel.name }), components: [] });
            continue;
        }
        await roleOrChannel.delete(commandText.rolesAndChanDeletionReason);
    }
}

async function refreshChanOrRole(type: "channels" | "roles", guild: Guild, commandText: Record<string, string>, intera: ChatInputCommandInteraction<CacheType>, language: textLanguage) {
    let guildManager = new ServerManager(guild);
    let hasChangedAnything: boolean = false;
    let data = await guildManager.getData(type) as ChanData | RolesData;

    for (let dataName of Object.keys(data)) {
        let dataId = data[dataName as keyof typeof data];
        let roleOrChannel;
        try {
            type == "channels" ?
                roleOrChannel = await guildManager.guild.channels.fetch(dataId) :
                roleOrChannel = await guildManager.guild.roles.fetch(dataId);

            if(!roleOrChannel)
                throw 'Absent';
        }
        catch {
            hasChangedAnything = true;
            if (type == "channels") {
                let chan = await createChannel(dataName as keyof ChanData, guild, commandText, intera, language);
                (data as ChanData)[dataName as keyof ChanData] = chan.id;
            }
            else {
                let hellText = TranslationsCache[language].others.hellEvents;
                let role = await guild.roles.create({
                    name: Utils.capitalizeFirst(hellText[dataName as keyof typeof hellText]),
                    mentionable: true,
                    permissions: [],
                    hoist: false
                });
                (data as RolesData)[dataName as keyof RolesData] = role.id;
            }
            Console.log(`Add ping ${type} ${dataName} (Server ${intera.guild?.name} - ${intera.guildId})`)
        }

    }

    if (hasChangedAnything)
        await guildManager.updateHellData(type, data)

    return hasChangedAnything
}

function getSubcommandName(sub: keyof typeof TranslationsCache.fr.commands.watcher.subcommand, language: textLanguage) {
    return `${TranslationsCache[language].commands.watcher.name} ${TranslationsCache[language].commands.watcher.subcommand[sub].name}`;
}

async function createChannel(type: "board" | "ping", guild: Guild, text: Record<string, string>, intera: ChatInputCommandInteraction<CacheType>, language: textLanguage) {
    let chan = await createEmptyChannel(type, guild, text);
    if (type == "board") {
        let boardMessageData = buildBoardEmbedMessage(text, intera.commandName as CommandName, language, chan);
        await chan.send(boardMessageData);
    }
    return chan;
}

async function createEmptyChannel(type: "board" | "ping", guild: Guild, text: Record<string, string>): Promise<TextChannel> {
    let chan;
    try {
        chan = await guild.channels.create({
            name: text[`${type}Name`],
            topic: text[`${type}Topic`],
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: DiscordValues.permissions.hellEvents.denyEveryone
                },
                {
                    id: bot.user!.id,
                    allow: DiscordValues.permissions.hellEvents.allowBot
                }
            ],
            reason: text[`${type}Reason`]
        })
    } catch (e) {
        throw e
    }
    return chan
}

function buildBoardEmbedMessage(text: Record<string, string>, commandName: CommandName, language: textLanguage, mentionsChan: TextChannel) {
    let embed = new EmbedBuilder()
        .setTitle(text.boardEmbedTitle)
        .setDescription(Translations.displayText(text.boardEmbedDescription, { id: mentionsChan.id }))
        .setThumbnail(DiscordValues.embedThumbnails.hellBoard)
        .addFields([{ name: text.boardEmbedFieldName, value: text.boardEmbedFieldValue }])
        .setFooter({ text: Translations.displayText(text.boardEmbedFooter, { dev_username: dev.username }), iconURL: dev.displayAvatarURL() })

    let menuOptions: APISelectMenuOption[] = []

    for (let i of Object.keys(Constants.hellMenu)) {
        let name = TranslationsCache[language].others.hellEvents[i as keyof typeof Constants.hellMenu];
        if (i !== "challengeResearch" && i !== "challengeTroops")
            name = text.hell + name;
        menuOptions.push({
            value: i,
            label: Utils.capitalizeFirst(name),
            emoji: Constants.hellMenu[i as keyof typeof Constants.hellMenu].emoji,
            description: Translations.displayText(text.boardMenuOptionDescription, { text: name })
        })
    }

    let menu = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`${Command.generateButtonCustomId(commandName, language)}-boardMenu`)
                .setPlaceholder(text.boardMenuPlaceholder)
                .setMinValues(0)
                .setMaxValues(Object.keys(Constants.hellMenu).length)
                .addOptions(...menuOptions)
        )

    return { embeds: [embed], components: [menu] }
}

async function buildRoles(language: textLanguage, guild: Guild): Promise<RolesData> {
    let hellText = TranslationsCache[language].others.hellEvents;
    let roles: Partial<RolesData> = {};
    for (let event of Object.keys(hellText)) {
        let role = await guild.roles.create({
            name: Utils.capitalizeFirst(hellText[event as keyof typeof hellText]),
            mentionable: true,
            permissions: [],
            hoist: false
        });
        roles[event as keyof RolesData] = role.id;
    }
    return roles as RolesData
}