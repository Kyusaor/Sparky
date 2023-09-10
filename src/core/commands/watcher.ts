import { APISelectMenuOption, ActionRowBuilder, CacheType, ChatInputCommandInteraction, EmbedBuilder, Guild, GuildMember, PermissionFlagsBits, Role, RoleData, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel } from "discord.js";
import { ChanData, CommandInterface, CommandName, RolesData, textLanguage } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Console, TranslationsCache, bot, botCommands, consoleErrors, db, dev } from "../../main.js";
import { ServerManager } from "../managers/servers.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";
import { Constants, DiscordValues } from "../constants/values.js";

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

        //manage roles and channels deletion if watcher is already defined
        let hasWatcher = await guild.hasWatcher()
        if(hasWatcher) {
            let confirm = await Command.getConfirmationMessage({intera, language, commandText}, commandText.askIfReparam);
            if(confirm !== 'yes')
                return Command.prototype.reply({content: TranslationsCache[language].global.cancelledCommand, components: []}, intera);

            await Command.prototype.reply({ content: commandText.loadingText, components: []}, intera);
            await deleteChanOrRole("roles", intera.guild, botmember, commandText, intera);
            await deleteChanOrRole("channels", intera.guild, botmember, commandText, intera);
        }

        await Command.prototype.reply({ content: commandText.loadingText, components: []}, intera);

        let boardChan = await createChannel("board", intera.guild, commandText);
        let mentionsChan = await createChannel("mention", intera.guild, commandText);

        let boardMessageData = buildBoardEmbedMessage(commandText, intera.commandName as CommandName, language, mentionsChan);
        await boardChan.send(boardMessageData);

        let chans:ChanData = { board: boardChan.id, ping: mentionsChan.id };
        let roles:RolesData = await buildRoles(language, intera.guild);    
        await guild.registerHellData(chans, roles, hasWatcher);

        let successString = Translations.displayText(commandText.success, { text: boardChan.id, text2: mentionsChan.id, text3: TranslationsCache[language].commands.stopwatcher.name})
        await Command.prototype.reply({ content: successString, components: []}, intera);
    }
}

function checkPerm(bot:GuildMember, language: textLanguage): string | undefined {
    let text = TranslationsCache[language].permissions
    let str = "";
    if(!bot.permissions.has([PermissionFlagsBits.ManageRoles])) str += text.flags.ManageRoles;
    if(!bot.permissions.has([PermissionFlagsBits.ManageChannels])) str += text.flags.ManageChannels;
    if(!bot.permissions.has([PermissionFlagsBits.EmbedLinks])) str += text.flags.EmbedLinks;
    if(!bot.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.EmbedLinks]))
        return Translations.displayText(text.MissingPermissions, { text: str })
}

async function deleteChanOrRole(type: "channels" | "roles", guild: Guild, botmember: GuildMember, commandText: Record<string, string>, intera: ChatInputCommandInteraction<CacheType>):Promise<string | void> {
    let guildManager = new ServerManager(guild);
    let data = await guildManager.getData(type) as ChanData | RoleData;

    for(let dataId of Object.values(data).slice(1)) {
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
        if(!roleOrChannel) {
            Console.info(Translations.displayText(commandText[`${type}NotFound`], { id: guildManager.guild.id, text: dataId, text2: guildManager.guild.name }));
            continue;
        }
        if(type == "roles" && botmember.roles.highest.comparePositionTo(roleOrChannel as Role) <= 0) {
            Console.info(Translations.displayText(commandText.rolesNotCancellable, { id: guildManager.guild.id, text: dataId, text2: guildManager.guild.name }))
            intera.channel?.send({content: Translations.displayText(commandText.roleTooHigh, { text: roleOrChannel.name}), components: []});
            continue;
        }
        await roleOrChannel.delete(commandText.rolesAndChanDeletionReason);
    }
}

async function createChannel(type: "board" | "mention", guild: Guild, text:Record<string, string>): Promise<TextChannel> {
    let chan = await guild.channels.create({
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
    }).catch(e=> { throw e })

    return chan
}

function buildBoardEmbedMessage(text: Record<string, string>, commandName: CommandName, language: textLanguage, mentionsChan: TextChannel) {
    let embed = new EmbedBuilder()
        .setTitle(text.boardEmbedTitle)
        .setDescription(Translations.displayText(text.boardEmbedDescription, { id: mentionsChan.id }))
        .setThumbnail(DiscordValues.embedThumbnails.hellBoard)
        .addFields([{name: text.boardEmbedFieldName, value: text.boardEmbedFieldValue}])
        .setFooter({text: Translations.displayText(text.boardEmbedFooter, { dev_username: dev.username }), iconURL: dev.displayAvatarURL()})

    let menuOptions:APISelectMenuOption[] = []

    for(let i of Object.keys(Constants.hellMenu)) {
        let name = TranslationsCache[language].others.hellEvents[i as keyof typeof Constants.hellMenu];
        if(i !== "challengeResearch" && i !== "challengeTroops")
            name = text.hell + name;
        menuOptions.push({
            value: i,
            label: Utils.capitalizeFirst(name),
            emoji: Constants.hellMenu[i as keyof typeof Constants.hellMenu].emoji,
            description: Translations.displayText(text.boardMenuOptionDescription, {text: name})
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

    return { embeds: [embed], components: [menu]}
}

async function buildRoles(language: textLanguage, guild: Guild):Promise<RolesData> {
    let hellText = TranslationsCache[language].others.hellEvents;
    let roles:Partial<RolesData> = {};
    for(let event of Object.keys(hellText)) {
        let role = await guild.roles.create({
            name: hellText[event as keyof typeof hellText],
            mentionable: true,
            permissions: [],
            hoist: false
        });
        roles[event as keyof RolesData] = role.id;
    }
    return roles as RolesData
}