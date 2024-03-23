import { SlashCommandStringOption } from "discord.js";
import { CommandArgs, CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";

export const familiar:CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("familiar", "member")
        .addSubcommand(
            Command.generateSubcommandBuilder("familiar", "famidex")
                .addStringOption(
                    Command.generateCommandOptionBuilder("familiar", "famidex", "string", true, "tier") as SlashCommandStringOption
                    )
        ),

    run: async function ({ intera, language, commandText }: CommandArgs) {
        let option = intera.options.getSubcommand();

        switch(option) {
            case 'famidex':
                await famidex({intera, language, commandText});
                break;
        }
    }
}

async function famidex({ intera, language, commandText }: CommandArgs) {
    if(intera.options.getString('tier') == 'all') {
        
    }
}