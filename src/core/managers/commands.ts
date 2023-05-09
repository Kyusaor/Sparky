import { ChatInputCommandInteraction, InteractionReplyOptions, MessagePayload, SlashCommandBuilder } from "discord.js";
import { Console, db } from "../../main.js";
import { Translations } from "../constants/translations.js";
import { CommandArgs } from "../constants/types.js";

export abstract class CommandManager {

    static baseSlashCommandBuilder(name: string, perm: "member" | "admin" | "dev"): SlashCommandBuilder {
        let defaultText = Translations.displayText();
        let text = {
            fr: defaultText.fr.commands[name as keyof typeof defaultText.fr.commands],
            en: defaultText.en.commands[name as keyof typeof defaultText.en.commands],
        };

        let build = new SlashCommandBuilder()
            .setDMPermission(false)
            .setName(text.en.name)
            .setNameLocalization("fr", text.fr.name)
            .setDescription(text.en.description)
            .setDescriptionLocalization("fr", text.fr.description);

        if (perm !== "member")
            build.setDefaultMemberPermissions(0);

        return build;
    }

    static async buildBotCommands(): Promise<Command[]> {
        let commandsFiles = readdirSync('./src/core/commands/');
        let Commands:Command[] = [];

        for(const file of commandsFiles){
            const commandData = await import(`../commands/${file.slice(0, -3)}.js`);
            if(!commandData) {
                Console.error(`Impossible de récupérer le fichier ${file}`);
                continue;
            }
            let command = new Command(commandData.command);
            Commands.push(command);
        }

        Console.log(`${Commands.length} commandes chargées avec succès`);
        return Commands;
    };

    static async fetchCommand(name: string): Promise<any> {
        let command = await import(`../commands/${name}.js`);
        return command
    };

    static async slashCommandManager(intera: ChatInputCommandInteraction) {
        if (!intera.guildId && !['lien', 'aide'].includes(intera.commandName))
            return intera.reply(`${Translations.displayText().fr.global.noCommandOffServer}\n\n${Translations.displayText().en.global.noCommandOffServer}`);

        if (intera.guild && !await db.checkIfServerIsPresent(intera.guild))
            await db.createServer(intera.guild.id, intera.guild.name);

        let translation = await Translations.getServerTranslation(intera.guildId);

        let command = await this.fetchCommand(intera.commandName);
        if (!command) {
            intera.reply({ content: translation.text.global.CommandExecutionError, ephemeral: true });
            throw `Impossible de récupérer la commande ${intera.commandName}`;
        }

        let args: CommandArgs = {
            intera,
            translation
        };

        try {
            command.run(args);
        }
        catch (err) {
            intera.deleteReply().catch(e => e);
            BaseCommand.prototype.reply(translation.text.global.CommandExecutionError, intera);
            Console.error(err);
        }
    };
}

export abstract class BaseCommand {

    async reply(data: string | MessagePayload | InteractionReplyOptions, intera: ChatInputCommandInteraction) {
        if (!intera.deferred && !intera.replied) return intera.reply(data);
        try {
            intera.editReply(data);
        }
        catch {
            await intera.deleteReply().catch(e => e)
            return intera.followUp(data).catch(e => Console.log(e))
        }
    };
}