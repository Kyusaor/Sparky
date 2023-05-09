import { CommandInterface } from "../constants/types.js";
import { CommandManager } from "../managers/commands.js";
import { Console } from "../../main.js";

async function run() {
    Console.log("Ca marche yolo")
}

export const command:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("contact", "member"),
    
    run
}