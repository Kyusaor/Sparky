import { TranslationsCache } from "../../main.js";
import { Translations } from "../constants/translations.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Utils } from "../utils.js";

export const link:CommandInterface = {
    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("link", "member")
        .setDMPermission(true),

    run(args) {
        let response:string;
        args.intera.guild ?
            response = Translations.displayText(TranslationsCache[args.language].commands.link.text.reply, { text: Utils.displayBotLink() }) :
            response = Utils.displayBotLink();

        Command.prototype.reply(response, args.intera);
    },
}