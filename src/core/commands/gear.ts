import { CommandArgs, CommandInterface, GearCacheType, GearObject, GearPiece, GearSet, StatType, textLanguage } from '../constants/types';
import { Command, CommandManager } from '../managers/commands.js';
import { Console, Cache, TranslationsCache } from '../../main.js';
import { Utils } from '../utils.js';
import { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder, SelectMenuOptionBuilder, SlashCommandStringOption } from 'discord.js';
import APIManager from '../managers/apicalls.js';
import { Constants, DiscordValues } from '../constants/values.js';
import { Translations } from '../constants/translations.js';

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
                let stat = intera.options.getString('stats') as StatType;
                let sort = gearStatsSorter(part, stat, GearCache);
                let sortEmbedThumbnail = await APIManager.getImage(`/gear/others/${part}.png`);

                let sortEmbed = createSortingEmbed(sort, language, part, stat, sortEmbedThumbnail.display);
                intera.editReply({ embeds: [sortEmbed], files: [sortEmbedThumbnail.attachment] })
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
function gearStatsSorter(piece: GearPiece, stat: StatType, gearData: GearCacheType): GearObject[] {
    let pieceList: GearObject[] = [];
    Object.keys(gearData!).forEach(set => {
        if (gearData![set as GearSet][piece])
            pieceList.push(...gearData![set as GearSet][piece])
    });

    pieceList = pieceList
        .filter(item => Object.keys(item.stats).includes(stat));

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
 *Create the embed builder for the sort command
 */
function createSortingEmbed(sort: GearObject[], language: textLanguage, piece: GearPiece, stat: StatType, image: string):EmbedBuilder {
    let text = TranslationsCache[language];
    let embed = Utils.EmbedBaseBuilder(language)
        .setTitle(Translations.displayText(text.commands.gear.text.sortEmbedTitle, { text: text.others.gear.pieceName[piece], text2: text.others.gear.stats[stat] }))
        .setDescription(text.commands.gear.text.sortEmbedDescription)
        .setThumbnail(image)

    for (let i = 0; i < 9 && i < sort.length; i++) {
        let value = "";
        Object.keys(sort[i].stats).forEach(stat => value += `-${text.others.gear.stats[stat as StatType]}: ${sort[i].stats[stat as StatType]?.length == 1 ? sort[i].stats[stat as StatType] : sort[i].stats[stat as StatType]![sort[i].stats[stat as StatType]!.length - 1]}${Constants.statSuffix[stat as StatType]}\n`)

        let name = `${i + 1}. ${text.others.gear.setItemNames[sort[i].name]}`;

        i > 2 ?
            embed.addFields([
                { name: `${name}`, value }
            ]) :
            embed.addFields([
                { name: `__**${name}**__`, value }
            ])

    }

    return embed
}