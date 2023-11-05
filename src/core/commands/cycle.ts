import { SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Constants } from "../constants/values.js";
import { Translations } from "../constants/translations.js";
import { TranslationsCache } from "../../main.js";

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
        let mobsName = TranslationsCache[language].others.mobs;
        
        let reply = Translations.displayText(commandText.base, {text: commandText[`${option}Title`], text2: mobsName[data.events[eventIndex] as keyof typeof mobsName]});

        for(let i = 0; i < cycleLength; i++) {
            let index = eventIndex + i + 1;
            
            if(index >= cycleLength)
                index -= cycleLength;

            let timestamp = relativeOrigin + data.duration * index;
            if(index <= eventIndex)
                timestamp += cycleDuration;

            reply += `\n<t:${timestamp}:F> ${mobsName[data.events[index] as keyof typeof mobsName]}`
        }
        reply += commandText.footer;

        await Command.prototype.reply(reply, intera);
    }
}