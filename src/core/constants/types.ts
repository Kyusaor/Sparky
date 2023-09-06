import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, TextChannel } from "discord.js";
import { DiscordValues } from "./values.js";
import frTranslationJSON from '../../../ressources/text/fr.json';


//Global
export type fetchedChannelsAtBoot = {
    [Value in keyof typeof DiscordValues.channels]: TextChannel | undefined;
}

export type queryArgs = string | number | boolean | null | queryArgs[] | undefined;

export type Server = { 
    id: string, 
    name: string, 
    active: 0 | 1, 
    hellEvent: string,
    language: textLanguage 
};

export type PartialServer = { 
    id?: string, 
    name?: string, 
    active?: 0 | 1, 
    hellEvent?: string,
    language?: textLanguage 
};

export type RolesData = {
    IW: 0 | 1,
    ID: 0 | 1,
    DR: 0 | 1,
    WR: 0 | 1,
    RO: 0 | 1,
    YO: 0 | 1,
    CR: 0 | 1,
    CT: 0 | 1,
}

export type fullServer = {
    id: string, 
    name: string, 
    active: 0 | 1, 
    language: textLanguage,
    roles: RolesData | undefined
}

//Translations
export type textLanguage = "fr" | "en";

export interface TranslationCacheType {
    fr: TranslationObject;
    en: TranslationObject;
}

export type SingleLanguageCommandTranslation = { 
    name: string, 
    description: string, 
    options?:Record<string, CommandOptionData>, 
    subcommand?: Record<string, { name: string, description: string, options?: Record<string, CommandOptionData> }>, 
    text?: Record<any, string[] | string | string[][]> ,
    choices?: Record<string, Record<string, string>>
};

export type CommandOptionData = { name: string, description: string }

export type CommandTranslation = { fr: SingleLanguageCommandTranslation, en: SingleLanguageCommandTranslation };

export type TranslationObject = typeof frTranslationJSON;

export type ReplacerList = { 
    username?: string, 
    avatar?: string, 
    dev_username?: string, 
    dev_avatar_url?: string,
    support_email?: string,
    support_server_invite?: string,
    daysSince?: string,
    timestamp?: number,
    date?: string,
    name?: string,
    id?: string,
    text?: string,
    text2?: string,
    text3?: string
}


//Commands
export type CommandArgs = { intera: ChatInputCommandInteraction, language: textLanguage, commandText: Record<string, string> };

export interface CommandInterface {
    permissionLevel: 1 | 2 | 3;
    commandStructure: SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    run: ({ intera, language, commandText }: CommandArgs) => unknown
};

export type perksType = "member" | "admin" | "dev";

export type CommandName = keyof typeof frTranslationJSON.commands

export type embedPageData = {
    current: number,
    target: -1 | 1,
    total: number,
    filter?: unknown,
    language: textLanguage
};