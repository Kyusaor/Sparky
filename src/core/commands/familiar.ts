import { SlashCommandStringOption } from "discord.js";
import { CommandArgs, CommandInterface, pactList } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Utils } from "../utils.js";
import { Constants, DiscordValues } from "../constants/values.js";
import { TranslationsCache } from "../../main.js";

export const familiar:CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("familiar", "member")
        .addSubcommand(
            Command.generateSubcommandBuilder("familiar", "famidex")
                .addStringOption(
                    (Command.generateCommandOptionBuilder("familiar", "famidex", "string", true, "tier") as SlashCommandStringOption)
                        .setRequired(true)
                        .setChoices(...Command.getChoices("familiar", "tier"))
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
    let famTranslations = TranslationsCache[language].others.familiars;

    if(intera.options.getString('tier') == 'all') {
        let listEmbed = Utils.EmbedBaseBuilder(language)
            .setTitle(commandText.listEmbedTitle)
            .setDescription(commandText.listEmbedDescription)
            .setThumbnail(DiscordValues.embedThumbnails.pact)

        for(let pact of pactList) {
            let name = commandText[`${pact}pactName`]
            let value = ``;
            Object.keys(Constants.familiarsData).forEach(fam => {
                let famData = Constants.familiarsData[fam as keyof typeof Constants.familiarsData];
                if(famData.pactTier == pact)
                    value += `-${Utils.displayEmoteInChat(DiscordValues.emotes[`familiarRank${famData.tier}`])} ${famTranslations[fam as keyof typeof Constants.familiarsData].name}\n`
            })
            listEmbed.addFields([{ name, value }])
        }

        return Command.prototype.reply({embeds: [listEmbed]}, intera);
    }
}