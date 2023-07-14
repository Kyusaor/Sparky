import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, TextChannel } from "discord.js";
import { DiscordValues } from "./values.js";
import frTranslationJSON from '../../../ressources/text/fr.json';


//Global
export type fetchedChannelsAtBoot = {
    [Value in keyof typeof DiscordValues.channels]: TextChannel | undefined;
}

export type queryArgs = string | number | boolean | null | queryArgs[] | undefined;

export type Server = { id: string, name: string, active: 0 | 1, language: textLanguage };

export type PartialServer = { id?: string, name?: string, active?: 0 | 1, language?: textLanguage };


//Translations
export type textLanguage = "fr" | "en";

export interface TranslationCacheType {
    fr: TranslationObject;
    en: TranslationObject;
}

export type SingleLanguageCommandTranslation = { name: string, description: string, subcommand?: Record<string, { name:string, description: string }>, text?: Record<any, string[] | string> };

export type CommandTranslation = { fr: SingleLanguageCommandTranslation, en: SingleLanguageCommandTranslation };

export type TranslationObject = typeof frTranslationJSON;

export type ReplacerList = { username?: string, avatar?: string }


//Commands
export type CommandArgs = { intera: ChatInputCommandInteraction, language: textLanguage };

export interface CommandInterface {
    permissionLevel:1 | 2 | 3;
    commandStructure:SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    run: (args: CommandArgs) => Promise<void>
};