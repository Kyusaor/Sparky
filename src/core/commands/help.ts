import { APIEmbedField, ChannelType, GuildMember, PermissionFlagsBits, RestOrArray } from "discord.js";
import { CommandInterface, perksType } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Translations } from "../constants/translations.js";
import { DiscordValues } from "../constants/values.js";
import { Utils } from "../utils.js";
import { botCommands } from "../../main.js";

export const help:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("help", "member")
        .setDMPermission(true),

    async run(args) {
        let text = Translations.getCommandText("help")[args.language].text as Record<string, string>;
        if(args.intera.channel?.type == ChannelType.DM || !args.intera.guildId)
            return Command.prototype.reply(`${text.commandInDM}`, args.intera)

        let member = await args.intera.guild?.members.fetch(args.intera.user);
        if(!member)
            throw "Membre introuvable (commande help)"
        let memberPerks = getMemberPermissionPerk(member);

        let thumb:string;
        memberPerks == "member" ?
            thumb = DiscordValues.botIcon.help :
            thumb = DiscordValues.botIcon.helpAdmin;

        let helpEmbed = Utils.EmbedBaseBuilder(args.language)
            .setThumbnail(thumb)
            .setDescription(Translations.displayText(text.embedDescription, { username: args.intera.user.displayName }))


        //Build Arrays of commands depending of member permission
        let helpCommands:RestOrArray<APIEmbedField> = [];
        let adminCommands:RestOrArray<APIEmbedField> = [];
        let devCommands:RestOrArray<APIEmbedField> = [];
        
        for(let command of botCommands) {
            let data:{ name: string, value:string };
            args.language == "en" ? 
                data = {name: `__${command.commandStructure.name}__`, value: command.commandStructure.description } :
                data = {name: `__${command.commandStructure.name_localizations![args.language]!}__`, value: command.commandStructure.description_localizations![args.language]!}

            if(command.permissionLevel == 1)
                helpCommands.push(data)
            else {
                command.permissionLevel == 2 ?
                    adminCommands.push(data) :
                    devCommands.push(data);
            }
        }


        //Build embed fields
        helpEmbed.addFields([
            { name: text.memberFieldTitle, value: DiscordValues.emptyEmbedFieldValue },
            ...helpCommands, 
            DiscordValues.emptyEmbedField,
            { name: text.adminFieldTitle, value: (memberPerks == "member" ? text.memberNotAdminWarning : DiscordValues.emptyEmbedFieldValue ) },
            ...adminCommands
        ])
        if(memberPerks == "dev" && args.intera.guildId == DiscordValues.MAIN_GUILD)
            helpEmbed.addFields([
                DiscordValues.emptyEmbedField,
                { name: text.devFieldTitle, value: DiscordValues.emptyEmbedFieldValue },
                ...devCommands
            ])

        Command.prototype.reply({embeds: [helpEmbed]}, args.intera);
    }
}

function getMemberPermissionPerk(member: GuildMember):perksType {
    let value:perksType;

    member.permissions.has(PermissionFlagsBits.Administrator) ?
        value =  "admin":
        value = "member";

    if(member.user.id === DiscordValues.DEV_DISCORD_ID)
        value = "dev";

    return value;
}