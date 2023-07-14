import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { DiscordValues } from "./values.js";
import frTranslationJSON from '../../../ressources/text/fr.json';

export type fetchedChannelsAtBoot = {
    [Value in keyof typeof DiscordValues.channels]: TextChannel | undefined;
}

export type queryArgs = string | number | boolean | null | queryArgs[] | undefined;

export type textLanguage = "fr" | "en";

export type Server = { id: string, name: string, active: 0 | 1, language: textLanguage };

export type PartialServer = { id?: string, name?: string, active?: 0 | 1, language?: textLanguage };

export type CommandArgs = { intera: ChatInputCommandInteraction, language: textLanguage };

export interface CommandInterface {
    permissionLevel:1 | 2 | 3;
    commandStructure:Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    run: (args: CommandArgs) => Promise<void>
};

export interface TranslationCacheType {
    fr: TranslationObject;
    en: TranslationObject;
}

export type SingleLanguageCommandTranslation = { name: string, description: string, text?: Record<any, string[] | string> };

export type CommandTranslation = { fr: SingleLanguageCommandTranslation, en: SingleLanguageCommandTranslation };

export type TranslationObject = typeof frTranslationJSON;

export type ReplacerList = { username?: string, avatar?: string }