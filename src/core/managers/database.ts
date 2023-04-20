import { existsSync, mkdirSync } from 'fs';
import { createPool, Pool, PoolConfig } from 'mysql';
import { Console } from '../../main.js';
import { Utils } from '../utils.js';
import mysqldump from 'mysqldump';
import { Config } from '../../../data/config.js';


export class DBManager {

    pool: Pool;

    constructor (config: PoolConfig) {
        this.pool = createPool(config);

        this.pool.on('connection', (stream) => {
            Console.log('Connected to database')
        });

    }

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

    static generateBackup() {
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
}