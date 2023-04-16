import { TextChannel } from "discord.js";
import { DiscordValues } from "./values.js";

export type fetchedChannelsAtBoot = {
    [Value in keyof typeof DiscordValues.channels]: TextChannel | undefined;
}
