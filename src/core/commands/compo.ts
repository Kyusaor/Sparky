import { SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { existsSync } from "fs";

export const compo:CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("compo", "member")
        .addStringOption(
            (Command.generateCommandOptionBuilder("compo", "monster", "string") as SlashCommandStringOption)
                .setRequired(true)
                .addChoices(...Command.getChoices("compo", "mobs"))
        ),

    async run({ intera, language }): Promise<void> {
        let imagePath = `./ressources/images/mob/${language}/${intera.options.getString('monster')}.png`;
        if(!existsSync(imagePath))
            throw `Fichier ./ressources/images/mob/${language}/${intera.options.getString('monster')}.png introuvable`
        await Command.prototype.reply({ files: [ imagePath] }, intera);
    }
}