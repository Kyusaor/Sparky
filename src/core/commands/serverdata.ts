import { APIEmbedField, RestOrArray, SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { TranslationsCache, bot, db } from "../../main.js";
import { Utils } from "../utils.js";

export const serverdata:CommandInterface = {
    permissionLevel: 3,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("serverdata", "dev")
        .addStringOption(
            (Command.generateCommandOptionBuilder("serverdata", "id", "string") as SlashCommandStringOption)
                .setRequired(true)
        ),

    async run({ intera, language, commandText }) {

        let id = intera.options.getString("id")!;
        if(isNaN(+id))
            return Command.prototype.reply(commandText.NaN, intera);
        
        let guildObject = await bot.guilds.fetch(id);
        if(!guildObject)
            return Command.prototype.reply(commandText.notFound, intera);

        let guild = await db.fetchServerData(id);
        if(!guild)
            throw `Impossible de récupérer les infos du serveur ${id}`
        let owner = await bot.users.fetch(guildObject.ownerId);

        let data = {
            members: guildObject.memberCount,
            owner: `${owner.username} (${owner.id})`,
            language: TranslationsCache[language].global.languagesFullName[guild.language],
            creation: Utils.stringifyDate(guildObject.createdTimestamp, language),
            joinedAt: Utils.stringifyDate(guildObject.joinedTimestamp, language)
        };

        let fields:RestOrArray<APIEmbedField> = [];
        for(let i of Object.keys(data)) {
            fields.push({ name: `__${commandText[i]}:__`, value: data[i as keyof typeof data].toString()});
        }

        let embed = Utils.EmbedBaseBuilder(language)
            .setThumbnail(guildObject.iconURL())
            .setTitle(`__${guildObject.name}__`)
            .addFields(fields);

        Command.prototype.reply({embeds: [embed]}, intera);
    },
}