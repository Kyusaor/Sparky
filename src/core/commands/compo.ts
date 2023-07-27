import { APIApplicationCommandOptionChoice, SlashCommandStringOption } from "discord.js";
import { CommandInterface, TranslationCacheType, TranslationObject } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { existsSync, readFileSync } from "fs";

export const compo:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("compo", "member")
        .addStringOption(
            (Command.generateCommandOptionBuilder("compo", "monster", "string") as SlashCommandStringOption)
                .setRequired(true)
                .addChoices(...getMobsChoicesList())
        ),

    async run({ intera, language }): Promise<void> {
        let imagePath = `./ressources/images/mob/${language}/${intera.options.getString('monster')}.png`;
        if(!existsSync(imagePath))
            throw `Fichier ./ressources/images/mob/${language}/${intera.options.getString('monster')}.png introuvable`
        await Command.prototype.reply({ files: [ imagePath] }, intera);
    }
}

function getMobsChoicesList():APIApplicationCommandOptionChoice<string>[] {
    const frJSON:TranslationObject = JSON.parse(readFileSync(`./ressources/text/fr.json`, 'utf-8'));
    const enJSON:TranslationObject = JSON.parse(readFileSync(`./ressources/text/en.json`, 'utf-8'));
    let translations:TranslationCacheType = { fr: frJSON, en: enJSON };

    let list = []
    for(let mob of Object.keys(translations.fr.mobs)) {
        list.push({ name: translations.en.mobs[mob as keyof typeof translations.fr.mobs], name_localizations: { fr: translations.fr.mobs[mob as keyof typeof translations.fr.mobs]}, value: mob})
    }
    return list;
}