import { Translations } from "../constants/translations.js";
import { CommandInterface } from "../constants/types.js";
import { DiscordValues } from "../constants/values.js";
import { CommandManager } from "../managers/commands.js";


export const contact:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("contact", "member"),
    
    async run({ intera, translation }):Promise<void> {
        let fullTranslation = Translations.displayCommandText(intera.commandName)[translation.language];
        let content = fullTranslation.text.content[0] + DiscordValues.MAIN_GUILD_INVITE + fullTranslation.text.content[1] + DiscordValues.BOT_EMAIL_CONTACT + "**__";
        intera.reply(content);
    },
}