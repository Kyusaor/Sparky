import {
    ActionRowBuilder,
    APIApplicationCommandOptionChoice,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    PermissionFlagsBits,
    SlashCommandStringOption,
    TextChannel
} from 'discord.js';
import {CommandInterface, CommandName, textLanguage, TranslationCacheType} from '../constants/types.js';
import {Command, CommandManager} from '../managers/commands.js';
import {TranslationsCache} from '../../main.js';
import {Translations} from '../constants/translations.js';
import {ServerManager} from '../managers/servers.js';
import {UserManager} from '../managers/users.js';

export const language:CommandInterface = {
    permissionLevel: 1,

    cacheLockScope: "guild",

    commandStructure: CommandManager.baseSlashCommandBuilder("language", "member")
        .addStringOption(
            (Command.generateCommandOptionBuilder("language", "language", "string") as SlashCommandStringOption)
                .setRequired(true)
                .addChoices(...getLanguageList())
        ),

    async run({ intera, language }) {

        let selectedLanguage = intera.options.getString('language') as textLanguage;
        let type = await checkIfUserOfGuildLanguage(intera, selectedLanguage, TranslationsCache[selectedLanguage].commands.language.text);

        if(type == "guild" && !intera.memberPermissions?.has(PermissionFlagsBits.ManageGuild))
            return Command.prototype.reply(TranslationsCache[selectedLanguage].commands.language.text.noPermission, intera);
        if(type == "none")
            return Command.prototype.reply(TranslationsCache[language].global.cancelledCommand, intera);

        let user = new UserManager(intera.user.id);
        let oldLangUser = await user.getOldLanguage();
        if(!oldLangUser)
            oldLangUser = language;
        if(type == "user")
            language = oldLangUser;

        let text = Translations.getCommandText("language")[language].text as Record<string, string>;

        if(selectedLanguage == language)
            return Command.prototype.reply(text.alreadySelectedLanguage, intera);

        let newText = Translations.getCommandText("language")[selectedLanguage].text as Record<string, string>;

        let newLanguageTranslation = {
            old: TranslationsCache[language].global.languagesFullName[selectedLanguage],
            new: TranslationsCache[selectedLanguage].global.languagesFullName[selectedLanguage],
            oldType: TranslationsCache[language].commands.language.text[type],
            newType: TranslationsCache[selectedLanguage].commands.language.text[type],
        }

        //Language change
        if(type == 'guild') {
            let guild = new ServerManager(intera.guild!);
            await guild.editServerData({ language: selectedLanguage});
        } else {
            await user.editData({ preferredLanguage: selectedLanguage})
        }

        Command.prototype.reply({content: Translations.displayText(newText.success, {text: newLanguageTranslation.newType}), components: []}, intera);
    },
}

function getLanguageList():APIApplicationCommandOptionChoice<string>[] {
    let list:APIApplicationCommandOptionChoice<string>[] = []
    for(let lang of Object.keys(TranslationsCache)) {
        list.push({ name: TranslationsCache[lang as keyof TranslationCacheType].global.languagesFullName[lang as keyof TranslationCacheType], value: lang})
    }

    return list
}

async function checkIfUserOfGuildLanguage(intera:ChatInputCommandInteraction, language:textLanguage, commandText:Record<string, string>): Promise<"guild" | "user" | "none"> {
    let buttons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
        new ButtonBuilder()
            .setCustomId(`${Command.generateButtonCustomId(intera.commandName as CommandName, language)}-nbb-guild`)
            .setStyle(ButtonStyle.Primary)
            .setLabel(commandText.guild),

        new ButtonBuilder()
            .setCustomId(`${Command.generateButtonCustomId(intera.commandName as CommandName, language)}-nbb-user`)
            .setStyle(ButtonStyle.Primary)
            .setLabel(commandText.user),

        new ButtonBuilder()
            .setCustomId(`${Command.generateButtonCustomId(intera.commandName as CommandName, language)}-nbb-none`)
            .setStyle(ButtonStyle.Danger)
            .setLabel(TranslationsCache[language].global.cancel)
    ])

    await Command.prototype.reply({content: commandText.serverOrAccount, components: [buttons]}, intera);

    let confirmationResponse;
    try {
        let filter = (button: ButtonInteraction<"cached">) => button.user.id === intera.user.id && button.customId.includes(intera.commandName)
        confirmationResponse = await (intera.channel as TextChannel)?.awaitMessageComponent({ componentType: ComponentType.Button, filter, time: 15000 })
    } catch {
        return "none"
    }

    let id = confirmationResponse?.customId;
    if(id?.endsWith("guild"))
        return "guild";
    else if (id?.endsWith("user"))
        return "user"
    else return "none"
}