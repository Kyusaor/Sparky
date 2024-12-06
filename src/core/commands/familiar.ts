import {
    ActionRowBuilder,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandStringOption
} from 'discord.js';
import {CommandArgs, CommandInterface, embedPageData, familiarName, pactList} from '../constants/types.js';
import {Command, CommandManager, FamiliarManager} from '../managers/commands.js';
import {Utils} from '../utils.js';
import {Constants, DiscordValues} from '../constants/values.js';
import {TranslationsCache} from '../../main.js';
import {Translations} from '../constants/translations.js';

export const familiar: CommandInterface = {

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

        switch (option) {
            case 'famidex':
                await famidex({ intera, language, commandText });
                break;
        }
    }
}

async function famidex({ intera, language, commandText }: CommandArgs) {
    let famTranslations = TranslationsCache[language].others.familiars;

    if (intera.options.getString('tier') == 'all') {
        let listEmbed = Utils.EmbedBaseBuilder(language)
            .setTitle(commandText.listEmbedTitle)
            .setDescription(commandText.listEmbedDescription)
            .setThumbnail(DiscordValues.embedThumbnails.pact)

        for (let pact of pactList) {
            let name = commandText[`${pact}pactName`]
            let value = ``;
            Object.keys(Constants.familiarsData).forEach(fam => {
                let famData = Constants.familiarsData[fam as familiarName];
                if (famData.pactTier == pact)
                    value += `-${Utils.displayEmoteInChat(`familiarRank${famData.tier}`)} ${famTranslations[fam as familiarName].name}\n`
            })
            listEmbed.addFields([{ name, value }])
        }

        return Command.prototype.reply({ embeds: [listEmbed] }, intera);
    }

    let tier = intera.options.getString('tier')!;

    let selectorEmbed = Utils.EmbedBaseBuilder(language)
        .setTitle(commandText.selectorEmbedTitle)
        .setDescription(Translations.displayText(commandText.selectorEmbedDescription, { text: commandText[`${tier}pactName`] }))
        .setThumbnail(DiscordValues.embedThumbnails.pact)

    let buttonsList: ActionRowBuilder<ButtonBuilder>[] = [];
    let rows = new ActionRowBuilder<ButtonBuilder>();

    Object.keys(Constants.familiarsData).forEach(fam => {
        let famData = Constants.familiarsData[fam as familiarName];
        let famName = famTranslations[fam as familiarName].name;

        if (famData.pactTier == tier) {
            if (rows.components.length == 5) {
                buttonsList.push(rows);
                rows = new ActionRowBuilder<ButtonBuilder>(); 
            }
            rows.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${Command.generateButtonCustomId("familiar", language)}-${fam}`)
                    .setLabel(famName)
                    .setEmoji(Utils.displayEmoji(`familiarRank${famData.tier}`).id)
                    .setStyle(ButtonStyle.Primary)
            )
        }
    })
    buttonsList.push(rows);
    Command.prototype.reply({embeds: [selectorEmbed], components: buttonsList}, intera);
}

export function getEditedEmbed(data:embedPageData, embed: Readonly<APIEmbed>):EmbedBuilder {
    let familiar = FamiliarManager.getFamiliarDataFromEmbed(embed);
    let pactList = Object.keys(Constants.familiarsData).filter(fam => Constants.familiarsData[fam as familiarName].pactTier == Constants.familiarsData[familiar].pactTier) as familiarName[];
    let newFamIndex = data.current + data.target -1;
    if(newFamIndex == -1)
        newFamIndex = pactList.length - 1;
    if(newFamIndex == pactList.length)
        newFamIndex = 0;
    let newFamName = pactList[newFamIndex];

    return FamiliarManager.getFamiliarEmbed(newFamName, data.language);
}