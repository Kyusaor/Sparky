import { existsSync } from "fs";
import { db } from "../../main.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Utils } from "../utils.js";

export const data:CommandInterface = {

    permissionLevel: 3,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("data", "dev"),

    async run({ intera, commandText }) {
        await db.generateBackup();

        let day = Utils.format2DigitsNumber(new Date().getDate());
        let month = Utils.format2DigitsNumber(new Date().getMonth() + 1);

        let path = `./data/backups/${month}/backup-${day}-${month}.sql`

        console.log(`New backup at ${path}`)
        if(!existsSync(path))
            return Command.prototype.reply(commandText.error, intera);

        await intera.user.send({files: [path]});
        Command.prototype.reply(commandText.success, intera);
    },
}