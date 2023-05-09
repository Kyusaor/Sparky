import { SlashCommandBuilder } from "discord.js";
import { CommandArgs, CommandInterface } from "./types.js";

export const command:CommandInterface = {
    permissionLevel: 1,

    commandStructure: new SlashCommandBuilder(),

    async run({intera, translation }: CommandArgs): Promise<void> {
        intera.reply(translation.text.global.defaultCommandReply);
    }
}