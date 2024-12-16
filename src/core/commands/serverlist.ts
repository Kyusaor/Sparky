import {APIEmbed, EmbedBuilder, SlashCommandStringOption} from 'discord.js';
import {CommandInterface, embedPageData} from '../constants/types.js';
import {Command, CommandManager} from '../managers/commands.js';
import {bot, TranslationsCache} from '../../main.js';
import {Utils} from '../utils.js';
import {Translations} from '../constants/translations.js';
import {readFileSync, writeFileSync} from 'fs';

export const serverlist:CommandInterface = {
    permissionLevel: 3,

    cacheLockScope: "none",

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
        let members = buildServerList(0, serverList);
        await sortServerList(serverList, filter);
        let totalPages = Math.ceil(serverList.length / 25).toString();

        let embed = Utils.EmbedBaseBuilder(language)
            .setTitle(commandText.embedTitle)
            .setDescription(Translations.displayText(commandText.embedDescription, { text: TranslationsCache[language].commands.serverlist.choices.filter[filter]}))
            .setFooter({ text: Translations.displayText(commandText.embedFooter, {text: "1", text2: totalPages, text3: members.toString()})})

        buildFields(embed, serverList, commandText.embedFiledValue, 0);

        let buttons = Command.generatePageButtons("serverlist", language, filter, "first");

        let filelist = JSON.parse(readFileSync('./data/jsonCache/serverlist.json', 'utf-8'));
        filelist[filter] = serverList;
        writeFileSync('./data/jsonCache/serverlist.json', JSON.stringify(filelist));
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

function buildFields(embed:EmbedBuilder, list:serverData[], text: string, startingPosition:number):void {
    for(let i = 0; i < 25 && list[i]; i++) {
        let serv = list[i];

        embed.addFields({
            name: `${(startingPosition + i + 1)}. **${serv.name}**`,
            value: Translations.displayText(text, { id: serv.id, text: serv.members.toString(), text2: serv.owner})
        })
    }
}

export function getEditedEmbed(data:embedPageData, embed: Readonly<APIEmbed>):EmbedBuilder {

    let newEmbed = new EmbedBuilder(embed)
        .setFields([])
    let filedata = JSON.parse(readFileSync('./data/jsonCache/serverlist.json', 'utf-8'));
    let servList = filedata[data.filter as keyof typeof filedata] as serverData[]

    let newPage = data.current + data.target;
    buildFields(newEmbed, servList.slice(25*(newPage - 1), 25 * newPage + 1), TranslationsCache[data.language].commands.serverlist.text.embedFiledValue, (newPage - 1) * 25)

    let oldFooter = embed.footer!.text
    let newFooter = oldFooter.split("[")[0] + "[" + newPage + "/" + oldFooter.split("/")[1]
    newEmbed.setFooter({text: newFooter});

    return newEmbed;
}