import { APIApplicationCommandOptionChoice, ComponentType, SlashCommandStringOption, time } from "discord.js";
import { CommandInterface, TranslationCacheType, textLanguage } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { TranslationsCache, db } from "../../main.js";
import { Translations } from "../constants/translations.js";
import { ServerManager } from "../managers/servers.js";

export const language:CommandInterface = {
    permissionLevel: 2,

    commandStructure: CommandManager.baseSlashCommandBuilder("language", "admin")
        .addStringOption(
            (Command.generateCommandOptionBuilder("language", "language", "string") as SlashCommandStringOption)
                .setRequired(true)
                .addChoices(...getLanguageList())
        ),

    async run(args) {
        let text = Translations.getCommandText("language")[args.language].text as Record<string, string>;
        let selectedLanguage = args.intera.options.getString('language') as textLanguage;

        if(selectedLanguage == args.language)
            return Command.prototype.reply(text.alreadySelectedLanguage, args.intera);

        let newText = Translations.getCommandText("language")[selectedLanguage].text as Record<string, string>;

        let newLanguageTranslation = {
            old: TranslationsCache[args.language].global.languagesFullName[selectedLanguage],
            new: TranslationsCache[selectedLanguage].global.languagesFullName[selectedLanguage]
        }

        //Confirmation message
        let confirmationText:string = `${Translations.displayText(text.changeLanguageConfirmation, { text: newLanguageTranslation.old})}\n\n${Translations.displayText(newText.changeLanguageConfirmation, { text: newLanguageTranslation.new})}`
        let confirmation = await Command.getConfirmationMessage(args, confirmationText);

        if(confirmation !== "yes")
            return Command.prototype.reply({content: TranslationsCache[args.language].global.cancelledCommand, components: []}, args.intera)

        //Language change
        let guild = new ServerManager(args.intera.guild!);
        await guild.editServerData({ language: selectedLanguage});

        Command.prototype.reply({content: newText.success, components: []}, args.intera);
    },
}

function getLanguageList():APIApplicationCommandOptionChoice<string>[] {
    let list:APIApplicationCommandOptionChoice<string>[] = []
    for(let lang of Object.keys(TranslationsCache)) {
        list.push({ name: TranslationsCache[lang as keyof TranslationCacheType].global.languagesFullName[lang as keyof TranslationCacheType], value: lang})
    }

    return list
}