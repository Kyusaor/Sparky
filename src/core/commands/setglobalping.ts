import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { TranslationsCache, chanList } from "../../main.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { DiscordValues } from "../constants/values.js";
import { Utils } from "../utils.js";

export const setglobalping:CommandInterface = {
    permissionLevel: 3,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("setglobalping", "dev"),

    run({intera, commandText}) {
        let channel = chanList.HELL_EVENTS_BOARD;
        if(!channel)
            return Command.prototype.reply(commandText.noChannel, intera);

        let embed = buildBoardEmbed(commandText);
        let buttons = buildBoardButtons();
        channel.send({embeds: [embed], components: [buttons]});
        Command.prototype.reply({content: commandText.success, ephemeral: true}, intera);
    }
}

function buildBoardEmbed(text:Record<string, string>):EmbedBuilder {
    let embed = new EmbedBuilder()
        .setTitle(text.embedTitle)
        .setDescription(text.embedDescription)
        .setColor([253,90,24])

        let emotes = DiscordValues.emotes
        for(let event of Object.keys(emotes)) {
            let data = emotes[event as keyof typeof emotes]
            let name = `${Utils.capitalizeFirst(TranslationsCache.fr.others.hellEvents[event as keyof typeof emotes])} <:${data.name}:${data.id}>`
            embed.addFields({
                name,
                value: text[`${event}Description`]
            })
        }

    return embed
}

function buildBoardButtons():ActionRowBuilder<ButtonBuilder> {
    let buttons = new ActionRowBuilder<ButtonBuilder>()
    let emotes = DiscordValues.emotes
    for(let event of Object.keys(emotes)) {
        buttons.addComponents([
            new ButtonBuilder()
                .setCustomId(`fr-setglobalping-${event}`)
                .setEmoji(emotes[event as keyof typeof emotes].id)
                .setStyle(ButtonStyle.Secondary)
        ])
    }

    return buttons
}