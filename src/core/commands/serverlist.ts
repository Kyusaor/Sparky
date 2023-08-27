import { EmbedBuilder, SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { TranslationsCache, bot } from "../../main.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";
import { readFileSync, writeFileSync } from "fs";

export const serverlist:CommandInterface = {
    permissionLevel: 3,

    commandStructure: CommandManager.baseSlashCommandBuilder("serverlist", "dev")
        .addStringOption(
            (Command.generateCommandOptionBuilder("serverlist", "filter", "string") as SlashCommandStringOption)
                .setRequired(true)
                .addChoices(...Command.getChoices("serverlist", "filter"))
        ),

    async run({ intera, language, commandText }) {
        
        await intera.deferReply();
        let filter = intera.options.getString('filter') as "members" | "name" | "none";

        let serverList:serverData[] = [];
        
        //Build the list and return members value
        let members = await buildServerList(0, serverList);
        await sortServerList(serverList, filter);
        let totalPages = Math.ceil(serverList.length / 25).toString();

        let embed = Utils.EmbedBaseBuilder(language)
            .setTitle(commandText.embedTitle)
            .setDescription(Translations.displayText(commandText.embedDescription, { text: TranslationsCache[language].commands.serverlist.choices.filter[filter]}))
            .setFooter({ text: Translations.displayText(commandText.embedFooter, {text: "1", text2: totalPages, text3: members.toString()})})

        buildFields(embed, serverList, commandText.embedFiledValue)

        let buttons = Command.generatePageButtons("serverlist", filter, "first");

        let filelist = JSON.parse(readFileSync('./data/jsonCache/sortedguilds.json', 'utf-8'));
        filelist[filter] = serverList;
        writeFileSync('./data/jsonCache/sortedguilds.json', JSON.stringify(filelist));
        Command.prototype.reply({embeds: [embed], components: [buttons]}, intera);
    },
}

type serverData = {
    id: string,
    name: string,
    owner: string,
    members: number
}

function buildServerList(members:number, list:serverData[]):number {
    for(let serv of bot.guilds.cache) {
        members += serv[1].memberCount;
        list.push({
            name: serv[1].name,
            id: serv[1].id,
            owner: serv[1].ownerId,
            members: serv[1].memberCount
        })
    }
    return members
}

function sortServerList(list:serverData[], filter: "members" | "name" | "none"):void {
    if(filter == "none") return;

    filter == "members" ?
        list.sort((a, b) => b.members - a.members) :
        list.sort((a, b) => a.name.localeCompare(b.name))
}

function buildFields(embed:EmbedBuilder, list:serverData[], text: string):void {
    for(let i = 0; i < 25 && list[i]; i++) {
        let serv = list[i];

        embed.addFields({
            name: `${(i + 1)}. **${serv.name}**`,
            value: Translations.displayText(text, { id: serv.id, text: serv.members.toString(), text2: serv.owner})
        })
    }
}