import { ChatInputCommandInteraction, InteractionReplyOptions, MessagePayload } from "discord.js";
import { Console, db } from "../../main.js";
import { Translations } from "../constants/translations.js";
import { CommandArgs } from "../constants/types.js";

export abstract class CommandManager {

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

        let args:CommandArgs = { 
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