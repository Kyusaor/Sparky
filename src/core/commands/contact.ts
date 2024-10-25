import {Translations} from '../constants/translations.js';
import {CommandInterface} from '../constants/types.js';
import {DiscordValues} from '../constants/values.js';
import {CommandManager} from '../managers/commands.js';


export const contact:CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("contact", "member"),
    
    async run(args):Promise<void> {
        let content = Translations.displayText(args.commandText.content as string, { support_email: DiscordValues.BOT_EMAIL_CONTACT, support_server_invite: DiscordValues.MAIN_GUILD_INVITE });
        args.intera.reply(content);  
    },
}