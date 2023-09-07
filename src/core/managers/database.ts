import { existsSync, mkdirSync } from 'fs';
import { createPool, Pool, PoolConfig } from 'mysql';
import { Console } from '../../main.js';
import { Utils } from '../utils.js';
import mysqldump from 'mysqldump';
import { Config } from '../../../data/config.js';
import { RolesData, Server, fullServer, queryArgs, textLanguage } from '../constants/types.js';
import { Guild } from 'discord.js';


export class DBManager {

    pool: Pool;

    constructor(config: PoolConfig) {
        this.pool = createPool(config);

        this.pool.on('connection', (stream) => {
            Console.logDb('Connected to database')
        });

    }


    //Static methods
    static createAndDisplayBackupPath() {
        let date = new Date();

        let month = Utils.format2DigitsNumber(date.getMonth() + 1);
        let day = Utils.format2DigitsNumber(date.getDate());

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
                if (err) {
                    Console.error(err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    async checkIfServerIsActive(guildId: string): Promise<boolean> {
        let rows = await this.query<any[]>(`SELECT active FROM config WHERE id = ?`, guildId);
        return rows[0].active == 1;
    }

    async checkIfServerIsPresent(guild: Guild): Promise<boolean> {
        let server = await this.query<any[]>(`SELECT * FROM config WHERE id = ?`, guild.id);
        if (server.length > 1)
            Console.info(`Plus d'une instance du serveur ${guild.id} est présente dans la base de donnée`)
        return server.length > 0;
    }
    
    async checkIfWatcherEnabled(guildId: string):Promise<boolean> {
        let data = await this.fetchServerData(guildId);
        return data !== undefined && data.hellEvent == '1'
    }

    async createServer(guildId: string, guildName: string, language: textLanguage): Promise<void> {
        await this.query<void>(`INSERT INTO config VALUES (?,?,?,?,?)`, [guildId, guildName, 1, 0, language]);
        Console.logDb(`Serveur ${guildName} (${guildId}) ajouté avec succès à la DB`);
        this.generateBackup();
    }

    async createServerRoles(guildId: string, guildName: string, roles: RolesData): Promise<void> {
        await this.query<void>(`INSERT INTO hellroles VALUES (?,?,?,?,?,?,?,?)`, Object.values(roles));
        Console.logDb(`Serveur ${guildName} (${guildId}) ajouté avec succès à la DB`);
        this.generateBackup();
    }

    async editServerDatabase(serverData:Server): Promise<void> {
        await this.query<void>(`UPDATE config SET id = ?, name = ?, active = ?, hellEvent = ?, language = ? WHERE id = ?`, [serverData.id, serverData.name, serverData.active, serverData.hellEvent, serverData.language, serverData.id])
        this.generateBackup();
        Console.logDb(`Serveur ${serverData.name} (${serverData.id}) modifié avec succès`)
    }

    async fetchFullServerData(guildId: string): Promise<fullServer | undefined> {
        let Server = await this.fetchServerData(guildId)
        if(!Server)
            return undefined;
        let roles = await this.fetchServerRoles(guildId);
        return { ...Server, roles }
    }

    async fetchServerData(guildId: string): Promise<Server | undefined> {
        let rows = await this.query<Server[]>(`SELECT * FROM config WHERE id =?`, guildId);
        return rows[0];
    }

    async fetchServerRoles(guildId: string): Promise<RolesData | undefined> {
        let rows = await this.query<RolesData[]>(`SELECT * FROM hellroles WHERE id =?`, guildId);
        return rows[0]
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

    async returnServerLanguage(guildId: string): Promise<textLanguage> {
        let rows = await this.query<any[]>(`SELECT language FROM config WHERE id = ?`, guildId)
        return rows[0].language
    }
}