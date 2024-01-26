import { InteractionReplyOptions, SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { existsSync } from "fs";
import { Translations } from "../constants/translations.js";
import { Constants } from "../constants/values.js";
import { TranslationsCache } from "../../main.js";

export const resources:CommandInterface = {
    
    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("resources", "member")
        .addStringOption(
            (Command.generateCommandOptionBuilder("resources", "target", "string") as SlashCommandStringOption)
                .addChoices(...Command.getChoices("resources", "target"))
                .setRequired(true)
        ),

    cacheLockScope: "none",

    run({ intera, commandText }) {

        let option = intera.options.getString('target')! as keyof typeof TranslationsCache.en.commands.resources.choices.target;

        let path = `../../../ressources/images/rss-cmd/${option}.png`
        let text = commandText[option];
        if(Object.keys(Constants.links.resources).includes(option)) {
            let reviver = Constants.links.resources[option as keyof typeof Constants.links.resources];
            text = Translations.displayText(text, { text: reviver });
        }

        let payload:InteractionReplyOptions = {
        };

        if(existsSync(path))
            payload.files = [path];

        if(text)
            payload.content = text;

        Command.prototype.reply(payload, intera);
    },
}