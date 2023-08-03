import { Translations } from "../constants/translations.js";
import { CommandInterface, CommandName } from "../constants/types.js";
import { DiscordValues } from "../constants/values.js";
import { CommandManager } from "../managers/commands.js";


export const contact:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("contact", "member"),
    
    async run({ intera, language }):Promise<void> {
        let fullTranslation = Translations.getCommandText(intera.commandName as CommandName);
        let content = Translations.displayText(fullTranslation[language].text!.content as string, { support_email: DiscordValues.BOT_EMAIL_CONTACT, support_server_invite: DiscordValues.MAIN_GUILD_INVITE });
        intera.reply(content);  
    },
}