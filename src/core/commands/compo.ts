import { APIApplicationCommandOptionChoice } from "discord.js";
import { Translations } from "../constants/translations.js";
import { CommandInterface } from "../constants/types.js";
import { CommandManager } from "../managers/commands.js";

export const compo:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("compo", "member")
        .addStringOption(monster =>
            monster.setName(`Monster`)
                .setDescription('The monster you want the lineup for')
                .setRequired(true)
                .addChoices(...getMobsChoicesList())
        ),

    async run({ intera, translation }): Promise<void> {
        let imagePath = `./ressources/images/mob/${translation.language}/${intera.options.getString('mob')}.png`;
        
    }
}

function getMobsChoicesList():APIApplicationCommandOptionChoice<string>[] {
    let list = []
    let translations = Translations.mobs;
    for(let mob of Object.keys(translations)) {
        list.push({ name: translations[mob as keyof typeof translations].en, name_localizations: { fr: translations[mob as keyof typeof translations].fr}, value: mob})
    }
    return list;
}