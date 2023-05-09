import { CommandInterface } from "../constants/types.js";
import { CommandManager } from "../managers/commands.js";


export const contact:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("contact", "member"),
    
    async run({ intera, translation }):Promise<void> {
        
    },
}