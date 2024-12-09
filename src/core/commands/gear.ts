import { CommandArgs, CommandInterface, GearCacheType, GearObject, GearPiece, GearSet, StatType, textLanguage, TroopSpeciality } from '../constants/types';
import { Command, CommandManager } from '../managers/commands.js';
import { Console, Cache, TranslationsCache } from '../../main.js';
import { Utils } from '../utils.js';
import { ActionRowBuilder, AttachmentBuilder, EmbedBuilder, InteractionEditReplyOptions, SelectMenuBuilder, SelectMenuOptionBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from 'discord.js';
import APIManager from '../managers/apicalls.js';
import { Constants } from '../constants/values.js';
import { Translations } from '../constants/translations.js';
import { language } from './language';

export const gear: CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: 'none',

    commandStructure: CommandManager.baseSlashCommandBuilder('gear', 'member')
        .addSubcommand(Command.generateSubcommandBuilder('gear', 'data')
        )
        .addSubcommand(Command.generateSubcommandBuilder('gear', 'top')
            .addStringOption(
                (Command.generateCommandOptionBuilder('gear', 'top', 'string', true, "piecename") as SlashCommandStringOption)
                    .setChoices(...Command.getChoices('gear', 'piecename'))
                    .setRequired(true)
            )
            .addStringOption(
                (Command.generateCommandOptionBuilder('gear', 'top', 'string', true, 'stats') as SlashCommandStringOption)
                    .setAutocomplete(true)
                    .setRequired(true)
            )
            .addIntegerOption(
                (Command.generateCommandOptionBuilder('gear', 'top', 'integer', true, 'level') as SlashCommandIntegerOption)
                    .setMinValue(1)
                    .setMaxValue(60)
            )
        ),

    run: async function ({ intera, language, commandText }: CommandArgs) {
        let subcommand = intera.options.getSubcommand();

        let GearCache = Cache.getGear();
        if (!GearCache)
            return intera.reply({ content: TranslationsCache[language].global.errors.gearCacheUnavailable, ephemeral: true });

        switch (subcommand) {
            case 'data':
                let gearMenuThumbnail = await APIManager.getImage('/gear/others/helmet.png');

                let dataEmbed = await baseDataEmbed(commandText, language, gearMenuThumbnail.display);
                let component = buildGearSelectMenu(language, commandText);

                await Command.prototype.reply({ embeds: [dataEmbed], components: component, files: [gearMenuThumbnail.attachment] }, intera);
                break;

            case 'top':
                await intera.deferReply();
                let part = intera.options.getString('piecename') as GearPiece;
                let stat = intera.options.getString('stats') as StatType | TroopSpeciality;
                let level = intera.options.getInteger('level');

                let sort: GearObject[];
                Object.keys(TranslationsCache.fr.others.gear.speciality).includes(stat) ?
                    sort = gearStatsSorterSpeciality(part, level, stat as TroopSpeciality, GearCache) :
                    sort = gearStatsSorterStat(part, level, stat as StatType, GearCache);

                let sortEmbedThumbnail = await APIManager.getImage(`/gear/others/${part}.png`);

                intera.editReply(createSortingResponse(sort, language, part, stat, level, sortEmbedThumbnail.display, sortEmbedThumbnail.attachment))
                break;

            default:
                Console.error('subcommande gear inconnue: ' + subcommand);
        }
    }
};

/*
* Returns the base embed at the beginning of the Gear command
*/
async function baseDataEmbed(text: Record<string, string>, language: textLanguage, imageAtt: string) {
    return Utils.EmbedBaseBuilder(language)
        .setTitle(text.dataEmbedTitle)
        .setThumbnail(imageAtt)
        .setDescription(text.dataEmbedDescription);
}

/*
* Returns the basic set select menu
*/
function buildGearSelectMenu(language: textLanguage, text: Record<string, string>) {

    let mobMenu = new SelectMenuBuilder()
        .setPlaceholder(text.mobPlaceHolder)
        .setCustomId(`${Command.generateButtonCustomId("gear", language)}-menu-mob`)
        .setMaxValues(1)
        .setMinValues(1);
    let otherMenu = new SelectMenuBuilder()
        .setCustomId(`${Command.generateButtonCustomId("gear", language)}-menu-other`)
        .setPlaceholder(text.otherPlaceHolder)
        .setMaxValues(1)
        .setMinValues(1);

    let gearList = getGearSetList();

    let setTO = TranslationsCache[language].others.gear.setNames;
    for (let set of gearList) {
        let TO = setTO[set as keyof typeof setTO];
        if (!Object.keys(setTO).includes(set))
            TO = TranslationsCache[language].others.mobs[set as keyof typeof TranslationsCache.fr.others.mobs];

        let menuOption = new SelectMenuOptionBuilder()
            .setLabel(TO)
            .setValue(set);

        Object.keys(TranslationsCache.fr.others.mobs).includes(set) ?
            mobMenu.addOptions(menuOption) :
            otherMenu.addOptions(menuOption);
    }
    return [new ActionRowBuilder<SelectMenuBuilder>().addComponents(mobMenu), new ActionRowBuilder<SelectMenuBuilder>().addComponents(otherMenu)];
}

/*
 * Returns the gear set names list
 */
function getGearSetList() {
    return Object.keys(Cache.getGear() as Record<GearSet, any>);
}


/*
*Sort the gear by a given stats
*/
function gearStatsSorterStat(piece: GearPiece, level: number | null, stat: StatType, gearData: GearCacheType): GearObject[] {
    let pieceList: GearObject[] = [];
    Object.keys(gearData!).forEach(set => {
        if (gearData![set as GearSet][piece])
            pieceList.push(...gearData![set as GearSet][piece])
    });

    pieceList = pieceList
        .filter(item => Object.keys(item.stats).includes(stat));

    if (level)
        pieceList = pieceList.filter(item => item.requiredLevel < level);

    //List every item by name and targeted stat amount
    let liste: [string, number][];

    if (Object.keys(Constants.cumulativeStats).includes(stat)) {
        liste = [];
        pieceList.forEach(item => {
            let total = item.stats[stat]![item.stats[stat]!.length - 1];
            Object.keys(item.stats).forEach(focusedStat => {
                if (Constants.cumulativeStats[stat]?.includes(focusedStat as StatType))
                    total += item.stats[focusedStat as StatType]![item.stats[focusedStat as StatType]!.length - 1]
            })
            liste.push([item.name, total]);
        })
    }
    else
        liste = pieceList.map(item => [item.name, item.stats[stat]![item.stats[stat]!.length - 1]]);

    liste.sort((a, b) => b[1] - a[1]);
    return liste.map(array => {
        let item = pieceList.find(e => e.name == array[0])!;
        return item
    })
}

/*
* Sort the gear by a given speciality
*/
function gearStatsSorterSpeciality(piece: GearPiece, level: number | null, speciality: TroopSpeciality, gearData: GearCacheType): GearObject[] {
    let pieceList: GearObject[] = [];
    Object.keys(gearData!).forEach(set => {
        if (gearData![set as GearSet][piece])
            pieceList.push(...gearData![set as GearSet][piece])
    });

    pieceList = pieceList
        .filter(item => Object.keys(item.stats).find(e => Constants.statsFamily[speciality].includes(e as StatType)));

    if (level)
        pieceList = pieceList.filter(item => item.requiredLevel < level);

    //List every item by name and targeted stat amount
    let liste: [string, number][];
    liste = [];
    pieceList.forEach(item => {
        let total = 0;
        Object.keys(item.stats).forEach(stat => {
            if (Constants.statsFamily[speciality].includes(stat as StatType)) {
                let statMap = stat.split('-')
                let score = Constants.statsScore[speciality][statMap[0] as keyof typeof Constants.statsScore];
                let factor = Constants.statsScore[speciality][statMap[1] as keyof typeof Constants.statsScore];
                let amount = item.stats[stat as StatType]![item.stats[stat as StatType]!.length - 1];

                //console.log(item.name, stat, score, factor)
                total += score * factor * amount;
            }
        })
        liste.push([item.name, total]);
    })

    liste.sort((a, b) => b[1] - a[1]);
    return liste.map(array => {
        let item = pieceList.find(e => e.name == array[0])!;
        return item
    })
}

/*
 *Create the embed builder for the sort command
 */
function createSortingResponse(sort: GearObject[], language: textLanguage, piece: GearPiece, stat: StatType | TroopSpeciality, level: number | null, image: string, attachment: AttachmentBuilder): InteractionEditReplyOptions {
    if (!Object.keys(TranslationsCache.fr.others.gear.speciality).includes(stat) && !Object.keys(TranslationsCache.fr.others.gear.stats).includes(stat))
        return createErrorResponse(language);

    let text = TranslationsCache[language];
    let title = Translations.displayText(text.commands.gear.text.sortEmbedTitle, { text: text.others.gear.pieceName[piece], text2: text.others.gear.stats[stat as StatType] || text.others.gear.speciality[stat as TroopSpeciality] })
    if (level)
        title += `${Translations.displayText(text.commands.gear.text.selectorEmbedTitleLevel, { text: level.toString() })}`

    let embed = Utils.EmbedBaseBuilder(language)
        .setTitle(title)
        .setDescription(text.commands.gear.text.sortEmbedDescription)
        .setThumbnail(image)

    for (let i = 0; i < 10 && i < sort.length; i++) {
        let value = "";
        Object.keys(sort[i].stats).forEach(stat => value += `-${text.others.gear.stats[stat as StatType]}: ${sort[i].stats[stat as StatType]?.length == 1 ? sort[i].stats[stat as StatType] : sort[i].stats[stat as StatType]![sort[i].stats[stat as StatType]!.length - 1]}${Constants.statSuffix[stat as StatType]}\n`)

        let name = `${i + 1}. ${text.others.gear.setItemNames[sort[i].name]}`;
        let setName: string = text.others.mobs[sort[i].set as keyof typeof text.others.mobs] || text.others.gear.setNames[sort[i].set as keyof typeof text.others.gear.setNames];

        i > 2 ?
            embed.addFields([
                { name: `${name} (${setName})`, value }
            ]) :
            embed.addFields([
                { name: `__**${name}**__ (${setName})`, value }
            ])

    }

    return { embeds: [embed], files: [attachment] }
}

/*
* Returns the default embed when the user give bad input
*/
function createErrorResponse(language: textLanguage): InteractionEditReplyOptions {
    return {
        embeds: [
            Utils.EmbedBaseBuilder(language)
                .setTitle(TranslationsCache[language].commands.gear.text.sortEmbedErrorTitle)
                .setDescription(TranslationsCache[language].commands.gear.text.sortEmbedErrorDescription)
        ]
    }
}