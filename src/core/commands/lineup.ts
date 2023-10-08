import { PermissionFlagsBits, SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { existsSync } from "fs";

export const lineup:CommandInterface = {

    permissionLevel: 1,

    neededPermissions: [PermissionFlagsBits.AttachFiles],

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("lineup", "member")
        .addStringOption(
            (Command.generateCommandOptionBuilder("lineup", "monster", "string") as SlashCommandStringOption)
                .setRequired(true)
                .addChoices(...Command.getChoices("lineup", "mobs"))
        ),

    async run({ intera, language }): Promise<void> {
        let imagePath = `./ressources/images/mob/${language}/${intera.options.getString('monster')}.png`;
        if(!existsSync(imagePath))
            throw `Fichier ./ressources/images/mob/${language}/${intera.options.getString('monster')}.png introuvable`
        await Command.prototype.reply({ files: [ imagePath] }, intera);
    }
}