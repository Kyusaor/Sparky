import {SlashCommandStringOption} from 'discord.js';
import {CommandInterface, textLanguage} from '../constants/types.js';
import {Command, CommandManager} from '../managers/commands.js';
import {Constants} from '../constants/values.js';
import {Translations} from '../constants/translations.js';
import {TranslationsCache} from '../../main.js';

export const cycle:CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("cycle", "member")
        .addStringOption(
            (Command.generateCommandOptionBuilder("cycle", "event", "string") as SlashCommandStringOption)
                .addChoices(...Command.getChoices("cycle", "event"))
                .setRequired(true)
        ),

    async run({intera, language, commandText}) {

        let option = intera.options.getString('event') as keyof typeof Constants.cycleEvents
        let data = Constants.cycleEvents[option];
        let currentTimeInSec = Math.round(Date.now() / 1000);

        let cycleLength = data.events.length;
        let eventIndex = Math.floor((currentTimeInSec - data.origin) / data.duration) % cycleLength;
        let cycleDuration = (data.duration * cycleLength);
        let relativeOrigin = currentTimeInSec - (currentTimeInSec - data.origin) % cycleDuration;
        let reply = Translations.displayText(commandText.base, {text: commandText[`${option}Title`], text2: getCycleElement(eventIndex, language, option)});

        for(let i = 1; i <= cycleLength; i++) {
            let index = eventIndex + i ;

            if(index >= cycleLength)
                index -= cycleLength;

            let timestamp = relativeOrigin + data.duration * index;
            if(index <= eventIndex)
                timestamp += cycleDuration;

            let eventString = getCycleElement(index, language, option);

            reply += `\n<t:${timestamp}:F> ${eventString}`
        }
        reply += commandText.footer;

        await Command.prototype.reply(reply, intera);
    }
}

/**
 * Returns the formatted string of a part of the rotation
 **/
function getCycleElement(index: number, language: textLanguage, option: keyof typeof Constants.cycleEvents): string {
    let mobsName = TranslationsCache[language].others.mobs;
    let data = Constants.cycleEvents[option].events;

    let eventString: string;
    option == "monster" ?
        eventString = `${mobsName[data[index].split('+')[0] as keyof typeof mobsName]} & ${mobsName[data[index].split('+')[1] as keyof typeof mobsName]}` :
        eventString = mobsName[data[index] as keyof typeof mobsName]

    return eventString;
}