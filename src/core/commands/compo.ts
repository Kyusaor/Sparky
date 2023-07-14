import { APIApplicationCommandOptionChoice } from "discord.js";
import { CommandInterface, TranslationCacheType, TranslationObject } from "../constants/types.js";
import { CommandManager } from "../managers/commands.js";
import { readFileSync } from "fs";
import { Translations } from "../constants/translations.js";

export const compo:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("compo", "member")
        .addStringOption(monster =>
            monster.setName(`monster`)
                .setDescription('The monster you want the lineup for')
                .setRequired(true)
                .addChoices(...getMobsChoicesList())
        ),

    async run({ intera, language }): Promise<void> {
        let imagePath = `./ressources/images/mob/${language}/${intera.options.getString('mob')}.png`;
        
    }
}

function getMobsChoicesList():APIApplicationCommandOptionChoice<string>[] {
    const frJSON:TranslationObject = JSON.parse(readFileSync(`./ressources/text/fr.json`, 'utf-8'), Translations.reviver);
    const enJSON:TranslationObject = JSON.parse(readFileSync(`./ressources/text/en.json`, 'utf-8'), Translations.reviver);
    let translations:TranslationCacheType = { fr: frJSON, en: enJSON };

    let list = []
    for(let mob of Object.keys(translations.fr.mobs)) {
        list.push({ name: translations.en.mobs[mob as keyof typeof translations.fr.mobs], name_localizations: { fr: translations.fr.mobs[mob as keyof typeof translations.fr.mobs]}, value: mob})
    }
    return list;
}