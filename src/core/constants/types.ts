import { TextChannel } from "discord.js";
import { DiscordValues } from "./values.js";

export type fetchedChannelsAtBoot = {
    [Value in keyof typeof DiscordValues.channels]: TextChannel | undefined;
}

export type queryArgs = string | number | boolean | null | queryArgs[] | undefined;

export type Server = { id: string, name: string, active: 0 | 1, language: "fr" | "en" };

export type PartialServer = { id?: string, name?: string, active?: 0 | 1, language?: "fr" | "en" };