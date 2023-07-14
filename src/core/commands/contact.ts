import { Translations } from "../constants/translations.js";
import { CommandInterface } from "../constants/types.js";
import { CommandManager } from "../managers/commands.js";


export const contact:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("contact", "member"),
    
    async run({ intera, language }):Promise<void> {
        let fullTranslation = Translations.getCommandText(intera.commandName);
        let content = fullTranslation[language].text!.content as string;
        intera.reply(content);  
    },
}