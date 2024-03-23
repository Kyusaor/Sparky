import { APIEmbedField, EmbedBuilder, RestOrArray, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Constants, DiscordValues } from "../constants/values.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";
import { TranslationsCache } from "../../main.js";

export const calculator: CommandInterface = {
    permissionLevel: 1,

    cacheLockScope: "user",

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
        )
        .addSubcommand(
            Command.generateSubcommandBuilder("calculator", "train")
                .addIntegerOption(
                    (Command.generateCommandOptionBuilder("calculator", "train", "integer", true, "speed") as SlashCommandIntegerOption)
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(800)
                )
                .addIntegerOption(
                    (Command.generateCommandOptionBuilder("calculator", "train", "integer", true, "capacity") as SlashCommandIntegerOption)
                        .setRequired(true)
                        .setMinValue(0)
                )
                .addIntegerOption(
                    (Command.generateCommandOptionBuilder("calculator", "train", "integer", true, "subsidy") as SlashCommandIntegerOption)
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(10)
                )
                .addIntegerOption(
                    (Command.generateCommandOptionBuilder("calculator", "train", "integer", true, "amount") as SlashCommandIntegerOption)
                        .setRequired(true)
                        .setMinValue(0)
                )
                .addStringOption(
                    (Command.generateCommandOptionBuilder("calculator", "train", "string", true, "type") as SlashCommandStringOption)
                        .setRequired(true)
                        .addChoices(...Command.getChoices("calculator", "type"))
                )
                .addStringOption(
                    (Command.generateCommandOptionBuilder("calculator", "train", "string", true, "tier") as SlashCommandStringOption)
                        .setRequired(true)
                        .addChoices(...Command.getChoices("calculator", "tier"))
                )
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
                let rsstO = TranslationsCache[language].others.resources;

                let missingResources: Record<string, string> = {}

                if (lvl == 25 || (build == 'trove' && lvl > 8)) {
                    for (let i of Object.keys(rss.resources))
                        missingResources[i] = commandText.noResources;
                    missingResources.gems = commandText.noResources;
                    if (build == 'trove')
                        lvl = 9;
                }
                else {
                    //Add missing resources (w/o gems)
                    for (let i of Object.keys(rss.resources))
                        missingResources[i] = Utils.format3DigitsSeparation(rss.resources[i as keyof typeof Constants.buildings.altar.resources].slice(lvl).reduce((somme, num) => somme + num)).toString();

                    //Add missing gems
                    missingResources.gems = Translations.displayText(commandText.missingItemForGems, { text: buildingtO.item })
                    for (let i of Object.keys(rss.itemCost)) {
                        let key = parseInt(i) as 1 | 10 | 100 | 1000;
                        let value = parseInt(missingResources.items.replace(/\s+/g, '')) / key * rss.itemCost[key] + 2000
                        missingResources.gems += Translations.displayText(commandText.missingGemsCosts, { text: i, text2: Utils.format3DigitsSeparation(value) })
                    }
                }

                //Build embed
                let embedDescription = Translations.displayText(commandText.buildEmbedDescription, { text: buildingtO.name, text2: lvl.toString(), text3: rss.resources.food.length.toString() })

                let buildEmbed = Utils.EmbedBaseBuilder(language)
                    .setTitle(commandText.buildEmbedTitle)
                    .setThumbnail(lvlImage)
                    .setDescription(embedDescription)
                    .addFields([
                        { name: `${rsstO.food}:`, value: missingResources.food },
                        { name: `${rsstO.stone}:`, value: missingResources.stone },
                        { name: `${rsstO.wood}:`, value: missingResources.wood },
                        { name: `${rsstO.ore}:`, value: missingResources.ore },
                        { name: buildingtO.item + ":", value: missingResources.items },
                        { name: commandText.gemsEquivalence, value: missingResources.gems }
                    ])

                Command.prototype.reply({ embeds: [buildEmbed] }, intera);
                break;

            case 'train':
                let troopData = TranslationsCache[language].commands.calculator.choices;

                let args = {
                    speed: intera.options.getInteger('speed')!,
                    capacity: intera.options.getInteger('capacity')!,
                    subsidy: intera.options.getInteger('subsidy')!,
                    amount: intera.options.getInteger('amount')!,
                    type: intera.options.getString('type')! as keyof typeof troopData.type,
                    tier: intera.options.getString('tier')! as keyof typeof troopData.tier
                };

                let fieldValues: RestOrArray<APIEmbedField> = [
                    { name: commandText.trainEmbedTrainSpeed, value: `${args.speed}%`, inline: true },
                    { name: commandText.trainEmbedCostReduction, value: `${Constants.troops.subv[args.tier][args.subsidy]}%`, inline: true },
                    { name: commandText.trainEmbedTroopAmount, value: `${Utils.format3DigitsSeparation(args.amount)} ${troopData.type[args.type]} T${args.tier}`, inline: true },
                    { name: commandText.trainEmbedBatchAmount, value: Math.ceil(args.amount / args.capacity).toString(), inline: true },
                    { name: commandText.trainEmbedMightGained, value: Utils.format3DigitsSeparation(args.amount * Constants.troops[args.tier].might) }
                ];

                for (let rss of Object.keys(TranslationsCache.fr.others.resources)) {
                    if (rss == "gems")
                        continue;
                    fieldValues.push({ name: Translations.displayText(commandText.trainEmbedRssCost, { text: TranslationsCache[language].others.resources[rss as keyof typeof TranslationsCache.fr.others.resources] }), value: Utils.format3DigitsSeparation(rssCost(rss as keyof typeof TranslationsCache.fr.others.resources, args.type, args.tier) * args.amount * (100 - Constants.troops.subv[args.tier][args.subsidy]) / 100), inline: true })
                }

                let trainEmbed = Utils.EmbedBaseBuilder(language)
                    .setTitle(commandText.trainEmbedTitle)
                    .setDescription(commandText.trainEmbedDescription)
                    .setThumbnail(DiscordValues.embedThumbnails.trainCalculator)
                    .setColor(0)
                    .addFields([
                        ...fieldValues,
                        { name: commandText.trainEmbedTimeCost, value: Utils.stringifyDuration(Constants.troops[args.tier].time * args.amount / 60 / ((args.speed + 100) / 100), language), inline: true },
                    ])

                Command.prototype.reply({ embeds: [trainEmbed] }, intera);
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

let rssCost = function (
    rss: keyof typeof TranslationsCache.fr.others.resources,
    type: keyof typeof TranslationsCache.fr.commands.calculator.choices.type,
    tier: keyof typeof TranslationsCache.fr.commands.calculator.choices.tier
) {
    if ((type == "inf" && rss == "stone") || (type == "range" && rss == "ore") || (type == "cav" && rss == "wood")) return 0;
    if (rss == "gold") return Constants.troops[tier].gold
    else return Constants.troops[tier].rss
}
