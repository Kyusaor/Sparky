import { EmbedBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Constants } from "../constants/values.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";
import { TranslationsCache } from "../../main.js";

export const calculator: CommandInterface = {
    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("calculator", "member")
        .addSubcommand(
            Command.generateSubcommandBuilder("calculator", "buildings")
                .addStringOption(
                    (Command.generateCommandOptionBuilder("calculator", "buildings", "string", true, "building") as SlashCommandStringOption)
                        .setRequired(true)
                        .addChoices(...Command.getChoices("calculator", "buildings"))
                )
                .addIntegerOption(
                    (Command.generateCommandOptionBuilder("calculator", "buildings", "integer", true, "level") as SlashCommandIntegerOption)
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(25)
                ),
        ),

    run({ intera, language, commandText }) {
        let subcommand = intera.options.getSubcommand();

        switch (subcommand) {

            case 'buildings':
                let lvl = intera.options.getInteger('level') || 0;
                let build = intera.options.getString('building') as keyof typeof Constants.buildings;

                let rss = Constants.buildings[build];
                let lvlImage: string = getBuildingImage(build, lvl);
                let buildingtO = TranslationsCache[language].others.buildings[build];
                let rsstO = TranslationsCache[language].others.ressources;

                let missingRessources: Record<string, string> = {}

                if (lvl == 25 || (build == 'trove' && lvl > 8)){
                    for (let i of Object.keys(rss.ressources))
                        missingRessources[i] = commandText.noRessources;
                    missingRessources.gems = commandText.noRessources;
                    lvl = 9
                }
                else {
                    //Add missing ressources (w/o gems)
                    for (let i of Object.keys(rss.ressources))
                        missingRessources[i] = Utils.format3DigitsSeparation(rss.ressources[i as keyof typeof Constants.buildings.altar.ressources].slice(lvl).reduce((somme, num) => somme + num)).toString();

                    //Add missing gems
                    missingRessources.gems = Translations.displayText(commandText.missingItemForGems, { text: buildingtO.item })
                    for (let i of Object.keys(rss.itemCost)) {
                        let key = parseInt(i) as 1 | 10 | 100 | 1000;
                        let value = parseInt(missingRessources.items.replace(/\s+/g, '')) / key * rss.itemCost[key] + 2000
                        missingRessources.gems += Translations.displayText(commandText.missingGemsCosts, { text: i, text2: Utils.format3DigitsSeparation(value) })
                    }
                }

                //Build embed
                let embedDescription = Translations.displayText(commandText.buildEmbedDescription, { text: buildingtO.name, text2: lvl.toString(), text3: rss.ressources.food.length.toString() })

                let buildEmbed = Utils.EmbedBaseBuilder(language)
                    .setTitle(commandText.buildEmbedTitle)
                    .setThumbnail(lvlImage)
                    .setDescription(embedDescription)
                    .addFields([
                        { name: `${rsstO.food}:`, value: missingRessources.food },
                        { name: `${rsstO.stone}:`, value: missingRessources.stone },
                        { name: `${rsstO.wood}:`, value: missingRessources.wood },
                        { name: `${rsstO.ore}:`, value: missingRessources.ore },
                        { name: buildingtO.item + ":", value: missingRessources.items },
                        { name: commandText.gemsEquivalence, value: missingRessources.gems }
                    ])

                Command.prototype.reply({ embeds: [buildEmbed] }, intera);
                break;

        }
    },
}

function getBuildingImage(building: keyof typeof Constants.buildings, level: number): string {
    let images = Constants.buildings[building].images
    let levelCap: number[];

    building == 'trove' ?
        levelCap = [3, 6, 9] :
        levelCap = [9, 17, 25];

    let getStep = levelCap.filter(e => level >= e);
    return images[getStep.length];
}