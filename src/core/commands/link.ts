import { TranslationsCache } from "../../main.js";
import { Translations } from "../constants/translations.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Utils } from "../utils.js";

export const link:CommandInterface = {
    permissionLevel: 1,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("link", "member")
        .setDMPermission(true),

    run({ intera, language }) {
        let response:string;
        intera.guild ?
            response = Translations.displayText(TranslationsCache[language].commands.link.text.reply, { text: Utils.displayBotLink() }) :
            response = Utils.displayBotLink();

        Command.prototype.reply(response, intera);
    },
}