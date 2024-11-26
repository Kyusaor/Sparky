import { CommandArgs, CommandInterface, GearSet, textLanguage } from '../constants/types';
import { Command, CommandManager } from '../managers/commands.js';
import { Console, Cache, TranslationsCache } from '../../main.js';
import { Utils } from '../utils.js';
import { ActionRowBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } from 'discord.js';
import APIManager from '../managers/apicalls.js';

export const gear: CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: 'none',

    commandStructure: CommandManager.baseSlashCommandBuilder('gear', 'member')
        .addSubcommand(Command.generateSubcommandBuilder('gear', 'data')
        ),

    run: async function ({ intera, language, commandText }: CommandArgs) {
        let subcommand = intera.options.getSubcommand();

        let GearCache = Cache.getGear();
        if (!GearCache)
            return intera.reply({ content: TranslationsCache[language].global.errors.gearCacheUnavailable, ephemeral: true });

        switch (subcommand) {
            case 'data':
                let gearMenuThumbnail = await APIManager.getImage('/gear/others/helmet.png');

                let embed = await baseDataEmbed(commandText, language, gearMenuThumbnail.display);
                let component = buildGearSelectMenu(language, commandText);

                await Command.prototype.reply({ embeds: [embed], components: component, files: [gearMenuThumbnail.attachment] }, intera);
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
