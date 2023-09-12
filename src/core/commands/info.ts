import { ColorResolvable, EmbedBuilder, EmbedFooterOptions, Guild, GuildMember, PermissionFlagsBits, SlashCommandUserOption, User, embedLength } from "discord.js";
import { CommandInterface } from "../constants/types";
import { CommandManager, Command } from "../managers/commands.js";
import { Console, TranslationsCache, bot } from "../../main.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";
import { readFileSync } from "fs";

export const info: CommandInterface = {
    permissionLevel: 1,

    neededPermissions: [PermissionFlagsBits.EmbedLinks],

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("info", "member")
        .addSubcommand(
            Command.generateSubcommandBuilder("info", "user")
                .addUserOption(
                    Command.generateCommandOptionBuilder("info", "user", "user", true, "user") as SlashCommandUserOption
                )
        )
        .addSubcommand(
            Command.generateSubcommandBuilder("info", "bot")
        )
        .addSubcommand(
            Command.generateSubcommandBuilder("info", "server")
        ),

    async run({intera, language, commandText}) {
        let subcommand = intera.options.getSubcommand();

        switch (subcommand) {

            case 'user':

                let user: User = intera.options.getUser('user') || intera.user;
                if (!user)
                    return Console.log(`Impossible de récupérer l'utilisateur`);
                let userEmbed = new EmbedBuilder();

                //Fetching data
                let username: string = user.username;
                let globalUsername: string = user.globalName || username;
                let profileType: string;
                user.bot ?
                    profileType = commandText.bot :
                    profileType = commandText.account;
                let accountCreationTimestamp: string = Utils.stringifyDate(user.createdTimestamp, language);
                let accountCreationDate: string = Translations.displayText(`${profileType}${commandText.accountCreation}`, { date: accountCreationTimestamp })
                let pdp: string = user.displayAvatarURL();
                let bannerColor: ColorResolvable = user.hexAccentColor || [13, 84, 236];
                let footer: EmbedFooterOptions = { text: `ID: ${user.id}` }

                userEmbed
                    .setTitle(globalUsername)
                    .setColor(bannerColor)
                    .setFooter(footer)
                    .setThumbnail(pdp)
                    .addFields([
                        { name: `__${commandText.usernameField}__:`, value: username, inline: true },
                        { name: `__${commandText.profileTypeField}__:`, value: profileType, inline: true },
                        { name: `__${commandText.accountCreationDateField}__:`, value: accountCreationDate, inline: true }
                    ])

                let member: GuildMember | undefined
                try {
                    member = await intera.guild?.members.fetch(user.id)!;

                    let nickname: string = member?.nickname || commandText.noNickname;
                    let joinDate: string = Utils.stringifyDate(member.joinedAt!, language);
                    let roles: string = member.roles.cache.map(r => r.name).slice(0, -1).join(", ");

                    userEmbed
                        .addFields([
                            { name: `__${commandText.isPresentField}__:`, value: TranslationsCache[language].global.yes },
                            { name: `__${commandText.nicknameField}__:`, value: nickname, inline: true },
                            { name: `__${commandText.joinDateField}__:`, value: joinDate, inline: true },
                            { name: `__${commandText.rolesField}__:`, value: roles, inline: true }
                        ])
                }

                catch {
                    userEmbed.addFields([{ name: `__${commandText.isPresentField}__:`, value: TranslationsCache[language].global.no }])
                }

                Command.prototype.reply({ embeds: [userEmbed] }, intera);

                break;

            case 'bot':
                let botUser: User = bot.user!;
                let botMember: GuildMember = await intera.guild?.members.fetch(botUser)!;

                let botPdp: string = botUser.displayAvatarURL();
                let botData: Record<string, string> = {
                    usernameField: botUser.username,
                    nicknameField: botMember.nickname || commandText.noNickname,
                    idField: botUser.id,
                    accountCreationDateField: Utils.stringifyDate(botUser.createdTimestamp, language),
                    joinDateField: Utils.stringifyDate(botMember.joinedAt!, language),
                    guildCountField: bot.guilds.cache.size.toString(),
                    versionField: JSON.parse(readFileSync('./package.json', 'utf-8')).version,
                    botInviteField: `[${commandText.clicHere}](${Utils.displayBotLink()})`
                };

                let botEmbed: EmbedBuilder = Utils.EmbedBaseBuilder(language)
                    .setThumbnail(botPdp)

                for (let field of Object.keys(botData)) {
                    botEmbed.addFields([{ name: commandText[field], value: botData[field as keyof typeof botData], inline: true }])
                }

                Command.prototype.reply({ embeds: [botEmbed] }, intera);
                break;

            case 'server':
                let server: Guild = intera.guild!;
                let icon = server.iconURL();
                console.log(icon)
                let owner = await bot.users.fetch(server.ownerId);

                let guildData: Record<string, string> = {
                    guildCreationField: Utils.stringifyDate(server.createdAt, language),
                    guildOwnerField: owner.displayName,
                    guildMemberCountField: server.memberCount.toString()
                }

                let guildEmbed = Utils.EmbedBaseBuilder(language)
                    .setTitle(server.name)
                    .setColor([16, 231, 215])
                
                if (icon)
                    guildEmbed.setThumbnail(icon);
                if(owner.displayName !== owner.username)
                    guildData.guildOwnerField = `${owner.displayName} (${owner.username})`

                for (let field of Object.keys(guildData)) {
                    await guildEmbed.addFields([{ name: commandText[field], value: guildData[field as keyof typeof guildData] }])
                }

                Command.prototype.reply({ embeds: [guildEmbed] }, intera);
                break;

            default:
                Console.info(`Subcommand impossible (commande info): ${subcommand}`);
                break;
        }
    },
}