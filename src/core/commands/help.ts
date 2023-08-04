import { APIEmbedField, ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, PermissionFlagsBits, RestOrArray } from "discord.js";
import { CommandArgs, CommandInterface, perksType } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Translations } from "../constants/translations.js";
import { DiscordValues } from "../constants/values.js";
import { Utils } from "../utils.js";
import { botCommands } from "../../main.js";

export const help: CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("help", "member")
        .setDMPermission(true),

    async run({intera, language, commandText }) {
        if (intera.channel?.type == ChannelType.DM || !intera.guildId)
            return Command.prototype.reply(`${commandText.commandInDM}`, intera)

        let member = await intera.guild?.members.fetch(intera.user);
        if (!member)
            throw "Membre introuvable (commande help)"
        let memberPerks = getMemberPermissionPerk(member);

        let thumb: string;
        memberPerks == "member" ?
            thumb = DiscordValues.botIcon.help :
            thumb = DiscordValues.botIcon.helpAdmin;

        let helpEmbed = Utils.EmbedBaseBuilder(language)
            .setThumbnail(thumb)
            .setDescription(Translations.displayText(commandText.embedDescription, { username: intera.user.displayName }))


        let CommandsEmbedFields = buildCommandsEmbeds({ intera, language, commandText});
        addHelpCommandFields(helpEmbed, intera, memberPerks, commandText, CommandsEmbedFields);

        Command.prototype.reply({ embeds: [helpEmbed] }, intera);
    }
}

function getMemberPermissionPerk(member: GuildMember): perksType {
    let value: perksType;

    member.permissions.has(PermissionFlagsBits.Administrator) ?
        value = "admin" :
        value = "member";

    if (member.user.id === DiscordValues.DEV_DISCORD_ID)
        value = "dev";

    return value;
}

function buildCommandsEmbeds({language}: CommandArgs) {
    let helpCommands: RestOrArray<APIEmbedField> = [];
    let adminCommands: RestOrArray<APIEmbedField> = [];
    let devCommands: RestOrArray<APIEmbedField> = [];

    for (let command of botCommands) {
        let data: { name: string, value: string };
        let subList: string = "";
        let optionsList = command.commandStructure.options.filter(o => o.toJSON().type == ApplicationCommandOptionType.Subcommand);

        if (optionsList.length > 0) {
            language == "en" ?
                subList = ` (${optionsList.map(o => (o.toJSON().name)).join('/')})` :
                subList = ` (${optionsList.map(o => (o.toJSON().name_localizations![language as keyof typeof command.commandStructure.name_localizations]!)).join('/')})`
        }

        language == "en" ?
            data = { name: `__${command.commandStructure.name}${subList}__`, value: command.commandStructure.description } :
            data = { name: `__${command.commandStructure.name_localizations![language]!}${subList}__`, value: command.commandStructure.description_localizations![language]! }

        if (command.permissionLevel == 1)
            helpCommands.push(data)
        else {
            command.permissionLevel == 2 ?
                adminCommands.push(data) :
                devCommands.push(data);
        }
    }

    return {
        helpCommands, adminCommands, devCommands
    }
}

function addHelpCommandFields(embed: EmbedBuilder, intera:ChatInputCommandInteraction, memberPerks: perksType, text: Record<string, string>, data: { helpCommands: APIEmbedField[]; adminCommands: APIEmbedField[]; devCommands: APIEmbedField[]; }) {
    embed.addFields([
        { name: text.memberFieldTitle, value: DiscordValues.emptyEmbedFieldValue },
        ...data.helpCommands,
        DiscordValues.emptyEmbedField,
        { name: text.adminFieldTitle, value: (memberPerks == "member" ? text.memberNotAdminWarning : DiscordValues.emptyEmbedFieldValue) },
        ...data.adminCommands
    ])
    if (memberPerks == "dev" && intera.guildId == DiscordValues.MAIN_GUILD)
        embed.addFields([
            DiscordValues.emptyEmbedField,
            { name: text.devFieldTitle, value: DiscordValues.emptyEmbedFieldValue },
            ...data.devCommands
        ])
}