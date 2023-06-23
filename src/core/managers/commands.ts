import { ChatInputCommandInteraction, InteractionReplyOptions, MessagePayload, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { Console, bot, botCommands, db } from "../../main.js";
import { Translations } from "../constants/translations.js";
import {  CommandArgs, CommandInterface } from "../constants/types.js";
import { readdirSync } from "fs";
import { ServerManager } from "./servers.js";

export abstract class CommandManager {

    static baseSlashCommandBuilder(name: string, perm: "member" | "admin" | "dev"): SlashCommandBuilder {
        let defaultText = [Translations.displayText("fr").commands, Translations.displayText("en").commands];
        let text = {
            fr: defaultText[0][name as keyof typeof defaultText[0]],
            en: defaultText[1][name as keyof typeof defaultText[1]],
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
            const commandName = file.slice(0, -3);
            const commandData = await import(`../commands/${commandName}.js`);
            if(!commandData) {
                Console.error(`Impossible de récupérer le fichier ${file}`);
                continue;
            }
            let command = new Command(commandData[commandName]);
            Commands.push(command);
        }

        Console.log(`${Commands.length} commandes chargées avec succès`);
        return Commands;
    };

    static async slashCommandManager(intera: ChatInputCommandInteraction) {
        if (!intera.guildId && !['link', 'help'].includes(intera.commandName))
            return intera.reply(`${Translations.displayText("fr").global.noCommandOffServer}\n\n${Translations.displayText("en").global.noCommandOffServer}`);

        if (intera.guild && !await db.checkIfServerIsPresent(intera.guild))
            await db.createServer(intera.guild.id, intera.guild.name);

        let translation = await Translations.getServerTranslation(intera.guildId);

        let command = botCommands.find(com => com.commandStructure.name == intera.commandName);
        if (!command) {
            intera.reply({ content: translation.text.global.CommandExecutionError, ephemeral: true });
            return Console.info(`Impossible de récupérer la commande ${intera.commandName}`);
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
            Command.prototype.reply(translation.text.global.CommandExecutionError, intera);
            Console.error(err);
        }
    };
}

export class Command implements CommandInterface {

    permissionLevel: 1 | 2 | 3;
    commandStructure: SlashCommandBuilder;
    run:(args: CommandArgs) => Promise<void>;

    constructor(args: CommandInterface) {
        this.permissionLevel = args.permissionLevel;
        this.commandStructure = args.commandStructure;
        this.run = args.run;
    }

    async reply(data: string | MessagePayload | InteractionReplyOptions, intera: ChatInputCommandInteraction) {
        await checkReplyPermissions(data, intera);
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


async function checkReplyPermissions(data: string | MessagePayload | InteractionReplyOptions, intera: ChatInputCommandInteraction) {
    let channel = intera.channel as TextChannel
    let botPermissions = channel.permissionsFor(bot.user!.id);
    let missingPermissions = [];
    if(Object.keys(data).includes("attachment") && !botPermissions?.has(PermissionFlagsBits.AttachFiles)) {
        missingPermissions.push("AttachFiles")
    }
    if(Object.keys(data).includes("embeds") && !botPermissions?.has(PermissionFlagsBits.EmbedLinks)) {
        missingPermissions.push("EmbedLinks")
    }
    if(missingPermissions.length > 0) {
        let language = await db.returnServerLanguage(intera.guild!.id);
        let translation = Translations.displayText(language).permissions;
        let missingPermErrorReply:string = translation.MissingPermissions;
        for(let permission of missingPermissions) {
            missingPermErrorReply += translation.flags[permission as keyof typeof translation.flags]
        }
        data = missingPermErrorReply;
    }
}