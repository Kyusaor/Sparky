import { existsSync, mkdirSync } from 'fs';
import { createPool, Pool, PoolConfig } from 'mysql';
import { Console } from '../../main.js';
import { Utils } from '../utils.js';
import mysqldump from 'mysqldump';
import { Config } from '../../../data/config.js';
import { queryArgs } from '../constants/types.js';
import { Guild } from 'discord.js';


export class DBManager {

    pool: Pool;

    constructor (config: PoolConfig) {
        this.pool = createPool(config);

        this.pool.on('connection', (stream) => {
            Console.log('Connected to database')
        });

    }


    //Static methods
    static createAndDisplayBackupPath() {
        let date = new Date();

        let month = Utils.format2DigitsNumber(date.getMonth() + 1);
        let day = Utils.format2DigitsNumber(date.getDay());

        let dir = `./data/backups/${month}`
        if (!existsSync(dir)) {
            mkdirSync(dir)
        }


        return dir + `/backup-${day}-${month}.sql`;
    }




    //Instance methods
    query<T>(sql: string, args?: queryArgs): Promise<T> {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, args, (err, rows) => {
                if (err){
                    Console.error(err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }


    async checkIfServerIsPresent(guild: Guild): Promise<boolean> {
        let server = await this.query<any[]>(`SELECT * FROM config WHERE id = ?`, guild.id);
        if(server.length > 1)
            Console.info(`Plus d'une instance du serveur ${guild.id} est présente dans la base de donnée`)
        return server.length > 0;
    }

    generateBackup() {
        mysqldump({
            connection: {
                host: Config.DBConfig.host,
                user: Config.DBConfig.user,
                password: Config.DBConfig.password,
                database: 'guilds'
            },
            dumpToFile: DBManager.createAndDisplayBackupPath()
        })
    }

    async returnServerLanguage(guildId: string): Promise<"fr" | "en"> {
        let rows = await this.query<any[]>(`SELECT language FROM config WHERE id = ?`, guildId)
        return rows[0].language
    }
}