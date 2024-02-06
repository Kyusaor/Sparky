import { Translations } from "../constants/translations.js";
import { CommandInterface } from "../constants/types.js";
import { Constants } from "../constants/values.js";
import { Command, CommandManager } from "../managers/commands.js";

export const donate:CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("donate", "member"),

    run({ intera, commandText }) {
        let reply = Translations.displayText(commandText.donate, { text: Constants.links.paypal });

        Command.prototype.reply(reply, intera);
    },
}