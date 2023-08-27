import { APIEmbedField, RestOrArray } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Utils } from "../utils.js";
import { DiscordValues } from "../constants/values.js";

export const credits:CommandInterface = {

    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("credits", "member"),

    run({ intera, language, commandText }) {

        let fields: RestOrArray<APIEmbedField> = []

        let texts = commandText.thanks as unknown as Array<[string,string]>
        for(let i of texts) {
            fields.push({ name: i[0], value: i[1]})
        }

        let embed = Utils.EmbedBaseBuilder(language)
            .setTitle(commandText.embedTitle)
            .setDescription(commandText.embedDescription)
            .setColor([246,19,19])
            .setThumbnail(DiscordValues.embedThumbnails.credits)
            .addFields(fields)

        Command.prototype.reply({embeds: [embed]}, intera);
    },
}