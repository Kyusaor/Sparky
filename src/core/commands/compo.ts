import { CommandInterface } from "../constants/types";
import { CommandManager } from "../managers/commands";

export const compo:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("compo", "member"),

    async run({ intera, translation }): Promise<void> {
        let imagePath = `./ressources/images/mob/${translation.language}/${intera.options.getString('mob')}.png`;
        
    }
}