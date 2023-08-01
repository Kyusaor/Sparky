import { ColorResolvable, EmbedBuilder, EmbedFooterOptions, GuildMember, SlashCommandUserOption, User } from "discord.js";
import { CommandInterface } from "../constants/types";
import { CommandManager, Command } from "../managers/commands.js";
import { Console, TranslationsCache } from "../../main.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";

export const info:CommandInterface = {
    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("info", "member")
        .addSubcommand(
            Command.generateSubcommandBuilder("info", "user")
            .addUserOption(
                Command.generateCommandOptionBuilder("info", "user", "user", true) as SlashCommandUserOption
            )
        ),

    async run(args) {
        let subcommand = args.intera.options.getSubcommand();
        let text = Translations.getCommandText("info")[args.language].text as Record<string, string>;

        switch(subcommand) {

            case 'user':

                let user:User = args.intera.options.getUser('user') || args.intera.user;
                if(!user)
                    return Console.log(`Impossible de récupérer l'utilisateur`);
                let embed = new EmbedBuilder();

                //Fetching data
                let username:string = user.username;
                let globalUsername:string = user.globalName || username;
                let profileType:string;
                user.bot ?
                    profileType = text.bot:
                    profileType = text.account;
                let accountCreationTimestamp:string = Utils.stringifyDate(user.createdTimestamp, args.language);
                let accountCreationDate:string = Translations.displayText(`${profileType}${text.accountCreation}`, { date: accountCreationTimestamp })
                let pdp:string = user.displayAvatarURL();
                let bannerColor:ColorResolvable = user.hexAccentColor || [13, 84, 236];
                let footer:EmbedFooterOptions = { text: `ID: ${user.id}`}
                
                embed
                    .setTitle(globalUsername)
                    .setColor(bannerColor)
                    .setFooter(footer)
                    .setThumbnail(pdp)
                    .addFields([
                        { name: `__${text.usernameField}__:`, value: username, inline: true },
                        //{ name: `__${text.globalUsernameField}__:`, value: globalUsername, inline: true },
                        { name: `__${text.profileTypeField}__:`, value: profileType, inline: true },
                        { name: `__${text.accountCreationDateField}__:`, value: accountCreationDate, inline: true }
                    ])

                let member:GuildMember | undefined
                try {
                    member = await args.intera.guild?.members.fetch(user.id)!;
                    
                    let nickname:string = member?.nickname || text.noNickname;
                    let joinDate:string = Utils.stringifyDate(member.joinedAt!, args.language);
                    let roles:string = member.roles.cache.map(r => r.name).slice(0, -1).join(", ");
    
                    embed
                        .addFields([
                            { name: `__${text.isPresentField}__:`, value: TranslationsCache[args.language].global.yes},
                            { name: `__${text.nicknameField}__:`, value: nickname, inline: true },
                            { name: `__${text.joinDateField}__:`, value: joinDate, inline: true },
                            { name: `__${text.rolesField}__:`, value: roles, inline: true }
                        ])
                }
                
                catch {
                    embed.addFields([{ name: `__${text.isPresentField}__:`, value: TranslationsCache[args.language].global.no}])
                 }

                Command.prototype.reply({embeds: [embed]}, args.intera);

                break;

            case 'bot':
                break;

            case 'server':
                break;

            default:
                Console.info(`Subcommand impossible (commande info): ${subcommand}`);
                break;
        }
    },
}