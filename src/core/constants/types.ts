import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { DiscordValues } from "./values.js";

export type fetchedChannelsAtBoot = {
    [Value in keyof typeof DiscordValues.channels]: TextChannel | undefined;
}

export type queryArgs = string | number | boolean | null | queryArgs[] | undefined;

export type textLanguage = "fr" | "en";

export type Server = { id: string, name: string, active: 0 | 1, language: textLanguage };

export type PartialServer = { id?: string, name?: string, active?: 0 | 1, language?: textLanguage };

export type CommandArgs = { intera: ChatInputCommandInteraction, translation: { language: textLanguage, text: any } };

export interface BaseCommandInterface {
    name:string;
    permissionLevel:1 | 2 | 3;
    commandStructure:SlashCommandBuilder;
}