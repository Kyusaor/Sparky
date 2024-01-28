import { PermissionFlagsBits, SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Constants, DiscordValues } from "../constants/values.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";

export const guildfest:CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: "none",

    neededPermissions: [PermissionFlagsBits.EmbedLinks],

    commandStructure: CommandManager.baseSlashCommandBuilder("guildfest", "member")
        .addSubcommand(
            Command.generateSubcommandBuilder("guildfest", "random")
                .addStringOption(
                    (Command.generateCommandOptionBuilder("guildfest", "random", "string", true, "points") as SlashCommandStringOption)
                        .addChoices(...Command.getChoices("guildfest", "points"))
                        .setRequired(true)
                )
        )
        .addSubcommand(
            Command.generateSubcommandBuilder("guildfest", "bonus")
        ),
    
    run({ intera, language, commandText }) {
        let sub = intera.options.getSubcommand();

        switch(sub) {
            case 'random':
                let points = intera.options.getString('points') as unknown as keyof typeof Constants.randomGF.data;
                let questsData = Constants.randomGF.data[points];
                let difficultyData = Constants.randomGF.difficulty;

                let questDuration = questsData.duration;

                let randomEmbed = Utils.EmbedBaseBuilder(language)
                    .setColor(questsData.color)
                    .setTitle(Translations.displayText(commandText.embedTitle, { text: points.toString() }))
                    .setDescription(commandText.embedDescription)
                    .addFields([
                        {
                            name: commandText.fieldDuration,
                            value:Translations.displayText(questDuration == 1 ? commandText.day : commandText.days, {text: questDuration.toString()})}
                    ])
                    
                for(let difficulty of Object.keys(difficultyData)) {
                    let name = commandText[`${difficulty}Field`]
                    let value = ""

                    for(let quest of difficultyData[difficulty as keyof typeof difficultyData]) {
                        let questQuota = questsData.quest[quest as keyof typeof questsData.quest];
                        if(!questQuota) continue;
                        let questText = Translations.displayText(commandText[quest], {text: questQuota.toString()})
                        value += `-${questText}\n`
                    }
                    randomEmbed.addFields([{ name, value }])
                }
                Command.prototype.reply({embeds: [randomEmbed]}, intera);
                break;

            case 'bonus':
                let bonusData = Constants.bonusGF;

                let bonusEmbed = Utils.EmbedBaseBuilder(language)
                    .setTitle(commandText.bonusTitle)
                    .setDescription(commandText.bonusDescription)
                    .setColor(Constants.randomGF.data[265].color)

                let bonusText = "";
                for(let data of Object.keys(bonusData)) 
                    bonusText += Translations.displayText(`-${commandText[data]}\n`, {text: bonusData[data as keyof typeof bonusData]});
                bonusEmbed.addFields({name: DiscordValues.emptyEmbedField.name, value: bonusText})
                
                Command.prototype.reply({embeds: [bonusEmbed]}, intera);
                break;
        }
    },
}