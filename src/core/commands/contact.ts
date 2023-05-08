import { SlashCommandBuilder } from "discord.js";
import { BaseCommandInterface, CommandArgs } from "../constants/types.js";
import { BaseCommand, CommandManager } from "../managers/commands.js";
import { Console } from "../../main.js";

export abstract class Command extends BaseCommand implements BaseCommandInterface {

    readonly name = "contact";
    readonly permissionLevel = 1;

    readonly commandStructure = CommandManager.baseSlashCommandBuilder(this.name, "member");
    
    run(args:CommandArgs) {
        Console.log("Ca marche yolo")
    }
}