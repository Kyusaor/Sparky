import { existsSync, mkdirSync } from 'fs';
import { createPool, Pool, PoolConfig } from 'mysql';
import { Console } from '../../main.js';
import { Utils } from '../utils.js';
import mysqldump from 'mysqldump';
import { Config } from '../../../data/config.js';
import { ChanData, RolesData, Server, UserData, fullServer, queryArgs, textLanguage } from '../constants/types.js';
import { Guild, User } from 'discord.js';
import { Constants } from '../constants/values.js';


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

    async checkIfUserIsPresent(userId:string):Promise<boolean> {
        let users = await this.query<any[]>(`SELECT * FROM users WHERE id = ?`, userId);
        return users.length > 0;
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
        let data = [guildId, roles.watcher, roles.dragon, roles.dragonResearch, roles.watcherResearch, roles.redOrb, roles.yellowOrb, roles.challengeResearch, roles.challengeTroops]
        await this.query<void>(`INSERT INTO hellroles VALUES (?,?,?,?,?,?,?,?,?)`, data);
        Console.logDb(`Serveur ${guildName} (${guildId}) ajouté avec succès à la DB roles`);
    }

    async createServerChannels(guildId: string, guildName: string, chans: ChanData): Promise<void> {
        let data = [ guildId, chans.board, chans.ping]
        await this.query<void>(`INSERT INTO hellchannels VALUES (?,?,?)`, data);
        Console.logDb(`Serveur ${guildName} (${guildId}) ajouté avec succès à la DB channels`);
    }

    async createUser(data:UserData):Promise<void> {
        await this.query<void>(`INSERT INTO users VALUES (?,?)`, [data.id, data.preferredLanguage]);
        Console.logDb(`User ${data.id} ajouté avec succès à la DB users`);
    }

    async deleteServerRoles(guildId: string, guildName: string): Promise<void> {
        await this.query<void>('DELETE FROM hellroles WHERE id = ?', [guildId]);
        Console.logDb(`Serveur ${guildName} (${guildId}) supprimé avec succès de la DB roles`)
    }

    async deleteServerChannels(guildId: string, guildName: string): Promise<void> {
        await this.query<void>('DELETE FROM hellchannels WHERE id = ?', [guildId]);
        Console.logDb(`Serveur ${guildName} (${guildId}) supprimé avec succès de la DB channels`)
    }

    async editServerDatabase(serverData:Server): Promise<void> {
        await this.query<void>(`UPDATE config SET id = ?, name = ?, active = ?, hellEvent = ?, language = ? WHERE id = ?`, [serverData.id, serverData.name, serverData.active, serverData.hellEvent, serverData.language, serverData.id])
        this.generateBackup();
        Console.logDb(`Serveur ${serverData.name} (${serverData.id}) modifié avec succès`)
    }

    async editUserDatabase(userData:UserData):Promise<void> {
        await this.query<void>(`UPDATE users SET id = ?, preferredLanguage = ? WHERE id = ?`, [userData.id, userData.preferredLanguage, userData.id])
        this.generateBackup();
        Console.logDb(`User ${userData.id} modifié avec succès`)
    }

    async fetchFullServerData(guildId: string): Promise<fullServer | undefined> {
        let Server = await this.fetchServerData(guildId)
        if(!Server)
            return undefined;
        let roles = await this.fetchServerRoles(guildId);
        let chans = await this.fetchServerChannels(guildId);
        return { ...Server, roles, chans }
    }

    async fetchServerChannels(guildId: string): Promise<ChanData | undefined> {
        let rows = await this.query<ChanData[]>(`SELECT * FROM hellchannels WHERE id =?`, guildId);
        return rows[0];
    }

    async fetchServerData(guildId: string): Promise<Server | undefined> {
        let rows = await this.query<Server[]>(`SELECT * FROM config WHERE id =?`, guildId);
        return rows[0];
    }

    async fetchServerRoles(guildId: string): Promise<RolesData | undefined> {
        let rows = await this.query<RolesData[]>(`SELECT * FROM hellroles WHERE id =?`, guildId);
        return rows[0]
    }

    async fetchServersHellChannels(role:keyof RolesData): Promise<{ping: string, role: string}[]> {
        let channelsRows = await this.query<any[]>(`SELECT ping,${role} FROM hellchannels INNER JOIN hellroles ON hellchannels.id = hellroles.id`);
        let channelsId:{ping: string, role: string}[] = [];
        channelsRows.forEach(e => channelsId.push({ping: e.ping, role: e[role]}));
        return channelsId
    }

    async fetchUserData(userID:string) {
        let rows = await this.query<UserData[]>(`SELECT * FROM users WHERE id =?`, userID);
        return rows[0];
    }

    async updateServerRoles(guildId: string, guildName: string, roles: RolesData): Promise<void> {
        let data = [roles.watcher, roles.dragon, roles.dragonResearch, roles.watcherResearch, roles.redOrb, roles.yellowOrb, roles.challengeResearch, roles.challengeTroops]
        await this.query<void>(`UPDATE hellroles SET watcher = ?, dragon = ?, dragonResearch = ?, watcherResearch = ?, redOrb = ?, yellowOrb = ?, challengeResearch = ?, challengeTroops = ? WHERE id = ?;`, [...data, guildId]);
        Console.logDb(`Serveur ${guildName} (${guildId}) modifié avec succès dans la DB roles`);
    }

    async updateServerChannels(guildId: string, guildName: string, chans: ChanData): Promise<void> {
        let data = [chans.board, chans.ping]
        await this.query<void>(`UPDATE hellchannels SET board = ?, ping = ? WHERE id = ?;`, [...data, guildId]);
        Console.logDb(`Serveur ${guildName} (${guildId}) modifié avec succès dans la DB channels`);
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