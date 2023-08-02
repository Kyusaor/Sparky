import { ColorResolvable, EmbedBuilder, EmbedFooterOptions, Guild, GuildMember, SlashCommandUserOption, User, embedLength } from "discord.js";
import { CommandInterface } from "../constants/types";
import { CommandManager, Command } from "../managers/commands.js";
import { Console, TranslationsCache, bot } from "../../main.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";
import { readFileSync } from "fs";

export const info: CommandInterface = {
    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("info", "member")
        .addSubcommand(
            Command.generateSubcommandBuilder("info", "user")
                .addUserOption(
                    Command.generateCommandOptionBuilder("info", "user", "user", true) as SlashCommandUserOption
                )
        )
        .addSubcommand(
            Command.generateSubcommandBuilder("info", "bot")
        )
        .addSubcommand(
            Command.generateSubcommandBuilder("info", "server")
        ),

    async run(args) {
        let subcommand = args.intera.options.getSubcommand();
        let text = Translations.getCommandText("info")[args.language].text as Record<string, string>;

        switch (subcommand) {

            case 'user':

                let user: User = args.intera.options.getUser('user') || args.intera.user;
                if (!user)
                    return Console.log(`Impossible de récupérer l'utilisateur`);
                let userEmbed = new EmbedBuilder();

                //Fetching data
                let username: string = user.username;
                let globalUsername: string = user.globalName || username;
                let profileType: string;
                user.bot ?
                    profileType = text.bot :
                    profileType = text.account;
                let accountCreationTimestamp: string = Utils.stringifyDate(user.createdTimestamp, args.language);
                let accountCreationDate: string = Translations.displayText(`${profileType}${text.accountCreation}`, { date: accountCreationTimestamp })
                let pdp: string = user.displayAvatarURL();
                let bannerColor: ColorResolvable = user.hexAccentColor || [13, 84, 236];
                let footer: EmbedFooterOptions = { text: `ID: ${user.id}` }

                userEmbed
                    .setTitle(globalUsername)
                    .setColor(bannerColor)
                    .setFooter(footer)
                    .setThumbnail(pdp)
                    .addFields([
                        { name: `__${text.usernameField}__:`, value: username, inline: true },
                        { name: `__${text.profileTypeField}__:`, value: profileType, inline: true },
                        { name: `__${text.accountCreationDateField}__:`, value: accountCreationDate, inline: true }
                    ])

                let member: GuildMember | undefined
                try {
                    member = await args.intera.guild?.members.fetch(user.id)!;

                    let nickname: string = member?.nickname || text.noNickname;
                    let joinDate: string = Utils.stringifyDate(member.joinedAt!, args.language);
                    let roles: string = member.roles.cache.map(r => r.name).slice(0, -1).join(", ");

                    userEmbed
                        .addFields([
                            { name: `__${text.isPresentField}__:`, value: TranslationsCache[args.language].global.yes },
                            { name: `__${text.nicknameField}__:`, value: nickname, inline: true },
                            { name: `__${text.joinDateField}__:`, value: joinDate, inline: true },
                            { name: `__${text.rolesField}__:`, value: roles, inline: true }
                        ])
                }

                catch {
                    userEmbed.addFields([{ name: `__${text.isPresentField}__:`, value: TranslationsCache[args.language].global.no }])
                }

                Command.prototype.reply({ embeds: [userEmbed] }, args.intera);

                break;

            case 'bot':
                let botUser: User = bot.user!;
                let botMember: GuildMember = await args.intera.guild?.members.fetch(botUser)!;

                let botPdp: string = botUser.displayAvatarURL();
                let botData: Record<string, string> = {
                    usernameField: botUser.username,
                    nicknameField: botMember.nickname || text.noNickname,
                    idField: botUser.id,
                    accountCreationDateField: Utils.stringifyDate(botUser.createdTimestamp, args.language),
                    joinDateField: Utils.stringifyDate(botMember.joinedAt!, args.language),
                    guildCountField: bot.guilds.cache.size.toString(),
                    versionField: JSON.parse(readFileSync('./package.json', 'utf-8')).version,
                    botInviteField: `[${text.clicHere}](${Utils.displayBotLink()})`
                };

                let botEmbed: EmbedBuilder = Utils.EmbedBaseBuilder(args.language)
                    .setThumbnail(botPdp)

                for (let field of Object.keys(botData)) {
                    botEmbed.addFields([{ name: text[field], value: botData[field as keyof typeof botData], inline: true }])
                }

                Command.prototype.reply({ embeds: [botEmbed] }, args.intera);
                break;

            case 'server':
                let server: Guild = args.intera.guild!;
                let icon = server.iconURL();
                console.log(icon)
                let owner = await bot.users.fetch(server.ownerId);

                let guildData: Record<string, string> = {
                    guildCreationField: Utils.stringifyDate(server.createdAt, args.language),
                    guildOwnerField: owner.displayName,
                    guildMemberCountField: server.memberCount.toString()
                }

                let guildEmbed = Utils.EmbedBaseBuilder(args.language)
                    .setTitle(server.name)
                    .setColor([16, 231, 215])
                
                if (icon)
                    guildEmbed.setThumbnail(icon);
                if(owner.displayName !== owner.username)
                    guildData.guildOwnerField = `${owner.displayName} (${owner.username})`

                for (let field of Object.keys(guildData)) {
                    await guildEmbed.addFields([{ name: text[field], value: guildData[field as keyof typeof guildData] }])
                }

                Command.prototype.reply({ embeds: [guildEmbed] }, args.intera);
                break;

            default:
                Console.info(`Subcommand impossible (commande info): ${subcommand}`);
                break;
        }
    },
}