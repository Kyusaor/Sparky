import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from 'discord.js';
import {chanList, TranslationsCache} from '../../main.js';
import {CommandInterface} from '../constants/types.js';
import {Command, CommandManager} from '../managers/commands.js';
import {Constants} from '../constants/values.js';
import {Utils} from '../utils.js';

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
        channel.send({embeds: [embed], components: buttons});
        Command.prototype.reply({content: commandText.success, ephemeral: true}, intera);
    }
}

function buildBoardEmbed(text:Record<string, string>):EmbedBuilder {
    let embed = new EmbedBuilder()
        .setTitle(text.embedTitle)
        .setDescription(text.embedDescription)
        .setColor([253,90,24])

        let hellEvents = Constants.WatcherMentionsTemplates;
        for(let event of Object.keys(hellEvents)) {
            let name = `${Utils.capitalizeFirst(TranslationsCache.fr.others.hellEvents[event as keyof typeof TranslationsCache.fr.others.hellEvents])} ${Utils.displayEmoteInChat(event)}`
            embed.addFields({
                name,
                value: text[`${event}Description`]
            })
        }

    return embed
}

function buildBoardButtons():ActionRowBuilder<ButtonBuilder>[] {
    let buttons:ActionRowBuilder<ButtonBuilder>[] = [];
    let row = new ActionRowBuilder<ButtonBuilder>();
    let hellEvents = Constants.WatcherMentionsTemplates;
    for(let event of Object.keys(hellEvents)) {
        if(row.components.length == 5) {
            buttons.push(row);
            row = new ActionRowBuilder<ButtonBuilder>();
        }
        row.addComponents([
            new ButtonBuilder()
                .setCustomId(`${Command.generateButtonCustomId("setglobalping", "fr")}-${event}`)
                .setEmoji(Utils.displayEmoji(event).id)
                .setStyle(ButtonStyle.Secondary)
        ])
    }

    buttons.push(row)
    return buttons
}