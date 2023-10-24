import { existsSync, mkdirSync } from 'fs';
import { createPool, Pool, PoolConfig } from 'mysql';
import { Console } from '../../main.js';
import { Utils } from '../utils.js';
import mysqldump from 'mysqldump';
import { Config } from '../../../data/config.js';
import { ChanData, RolesData, Server, UserData, fullServer, queryArgs, textLanguage } from '../constants/types.js';
import { Guild } from 'discord.js';
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

    static getColumnList(type: "roles" | "channels"): string {
        switch (type) {
            case 'roles':
                return Object.keys(Constants.hellMenu).join(",");

            case 'channels':
                return "board,ping";
        }
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

    async checkIfServerIsActive(guildId: string) {
        try {
            let rows = await this.query<any[]>(`SELECT active FROM config WHERE id = ?`, guildId);
            return rows[0].active == 1;
        } catch (err) {
            Console.error(err);
            return false;
        }
    }

    async checkIfServerIsPresent(guild: Guild | string) {
        try {
            if (typeof guild !== "string")
                guild = guild.id;
            let server = await this.query<any[]>(`SELECT * FROM config WHERE id = ?`, guild);
            if (server.length > 1)
                Console.info(`Plus d'une instance du serveur ${guild} est présente dans la base de donnée`)
            return server.length > 0;
        } catch (err) {
            Console.error(err);
            return false;
        }
    }

    async checkIfUserIsPresent(userId: string) {
        try {
            let users = await this.query<any[]>(`SELECT * FROM users WHERE id = ?`, userId);
            return users.length > 0;
        } catch (err) {
            Console.error(err);
            return false;
        }
    }

    async checkIfWatcherEnabled(guildId: string) {
        try {
            let data = await this.fetchServerData(guildId);
            return (data !== undefined && data.hellEvent == '1') as boolean
        } catch (err) {
            Console.error(err);
            return false;
        }
    }

    async createServer(guildId: string, guildName: string, language: textLanguage) {
        try {
            if (await this.checkIfServerIsPresent(guildId))
                return Console.logDb('Server already in database')

            await this.query<void>(`INSERT INTO config VALUES (?,?,?,?,?)`, [guildId, guildName, 1, 0, language]);
            Console.logDb(`Serveur ${guildName} (${guildId}) ajouté avec succès à la DB`);
            this.generateBackup();
        } catch (err) {
            Console.error(err);
        }
    }

    async createServerRoles(guildId: string, guildName: string, roles: RolesData) {
        try {
            let data = [guildId, roles.watcher, roles.dragon, roles.dragonResearch, roles.watcherResearch, roles.redOrb, roles.yellowOrb, roles.challengeResearch, roles.challengeTroops]
            if (await this.fetchServerRoles(guildId))
                return await this.updateServerRoles(guildId, guildName, roles);

            await this.query<void>(`INSERT INTO hellroles VALUES (?,?,?,?,?,?,?,?,?)`, data);
            Console.logDb(`Serveur ${guildName} (${guildId}) ajouté avec succès à la DB roles`);
        } catch (err) {
            Console.error(err);
        }
    }

    async createServerChannels(guildId: string, guildName: string, chans: ChanData) {
        try {
            let isPresent = await this.query<any[]>(`SELECT * FROM hellchannels WHERE id = ?`, guildId);
            if (isPresent.length > 0)
                return await this.updateServerChannels(guildId, guildName, chans);

            let data = [guildId, chans.board, chans.ping]
            await this.query<void>(`INSERT INTO hellchannels VALUES (?,?,?)`, data);
            Console.logDb(`Serveur ${guildName} (${guildId}) ajouté avec succès à la DB channels`);
        } catch (err) {
            Console.error(err);
        }
    }

    async createUser(data: UserData) {
        try {
            if (await this.checkIfUserIsPresent(data.id))
                return await this.editUserDatabase(data);

            await this.query<void>(`INSERT INTO users VALUES (?,?)`, [data.id, data.preferredLanguage]);
            Console.logDb(`User ${data.id} ajouté avec succès à la DB users`);
        } catch (err) {
            Console.error(err);
        }
    }

    async deleteServerRoles(guildId: string, guildName: string) {
        try {
            await this.query<void>('DELETE FROM hellroles WHERE id = ?', [guildId]);
            Console.logDb(`Serveur ${guildName} (${guildId}) supprimé avec succès de la DB roles`)
        } catch (err) {
            Console.error(err);
        }
    }

    async deleteServerChannels(guildId: string, guildName: string) {
        try {
            await this.query<void>('DELETE FROM hellchannels WHERE id = ?', [guildId]);
            Console.logDb(`Serveur ${guildName} (${guildId}) supprimé avec succès de la DB channels`)
        } catch (err) {
            Console.error(err);
        }
    }

    async editServerDatabase(serverData: Server) {
        try {
            await this.query<void>(`UPDATE config SET id = ?, name = ?, active = ?, hellEvent = ?, language = ? WHERE id = ?`, [serverData.id, serverData.name, serverData.active, serverData.hellEvent, serverData.language, serverData.id])
            this.generateBackup();
            Console.logDb(`Serveur ${serverData.name} (${serverData.id}) modifié avec succès`)
        } catch (err) {
            Console.error(err);
        }
    }

    async editUserDatabase(userData: UserData) {
        try {
            await this.query<void>(`UPDATE users SET id = ?, preferredLanguage = ? WHERE id = ?`, [userData.id, userData.preferredLanguage, userData.id])
            this.generateBackup();
            Console.logDb(`User ${userData.id} modifié avec succès`)
        } catch (err) {
            Console.error(err);
        }
    }

    async fetchFullServerData(guildId: string) {
        try {
            let Server = await this.fetchServerData(guildId)
            if (!Server)
                return undefined;
            let roles = await this.fetchServerRoles(guildId);
            let chans = await this.fetchServerChannels(guildId);
            return { ...Server, roles, chans }
        } catch (err) {
            Console.error(err);
        }
    }

    async fetchServerChannels(guildId: string) {
        try {
            let rows = await this.query<ChanData[]>(`SELECT ${DBManager.getColumnList("channels")} FROM hellchannels WHERE id =?`, guildId);
            return rows[0];
        } catch (err) {
            Console.error(err);
        }
    }

    async fetchServerData(guildId: string) {
        try {
            let rows = await this.query<Server[]>(`SELECT * FROM config WHERE id =?`, guildId);
            return rows[0];
        } catch (err) {
            Console.error(err);
        }
    }

    async fetchServerRoles(guildId: string) {
        try {
            let rows = await this.query<RolesData[]>(`SELECT ${DBManager.getColumnList("roles")} FROM hellroles WHERE id =?`, guildId);
            return rows[0]
        } catch (err) {
            Console.error(err);
        }
    }

    async fetchServersHellChannels(role: keyof RolesData) {
        try {
            let channelsRows = await this.query<any[]>(`SELECT ping,${role} FROM hellchannels INNER JOIN hellroles ON hellchannels.id = hellroles.id`);
            let channelsId: { ping: string, role: string }[] = [];
            channelsRows.forEach(e => channelsId.push({ ping: e.ping, role: e[role] }));
            return channelsId
        } catch (err) {
            Console.error(err);
        }
    }

    async fetchUserData(userID: string) {
        try {
            let rows = await this.query<UserData[]>(`SELECT * FROM users WHERE id =?`, userID);
            return rows[0];
        } catch (err) {
            Console.error(err);
        }
    }

    async updateServerRoles(guildId: string, guildName: string, roles: RolesData) {
        try {
            let data = [roles.watcher, roles.dragon, roles.dragonResearch, roles.watcherResearch, roles.redOrb, roles.yellowOrb, roles.challengeResearch, roles.challengeTroops]
            await this.query<void>(`UPDATE hellroles SET watcher = ?, dragon = ?, dragonResearch = ?, watcherResearch = ?, redOrb = ?, yellowOrb = ?, challengeResearch = ?, challengeTroops = ? WHERE id = ?;`, [...data, guildId]);
            Console.logDb(`Serveur ${guildName} (${guildId}) modifié avec succès dans la DB roles`);
        } catch (err) {
            Console.error(err);
        }
    }

    async updateServerChannels(guildId: string, guildName: string, chans: ChanData) {
        try {
            let data = [chans.board, chans.ping]
            await this.query<void>(`UPDATE hellchannels SET board = ?, ping = ? WHERE id = ?;`, [...data, guildId]);
            Console.logDb(`Serveur ${guildName} (${guildId}) modifié avec succès dans la DB channels`);
        } catch (err) {
            Console.error(err);
        }
    }

    generateBackup() {
        try {
            mysqldump({
                connection: {
                    host: Config.DBConfig.host,
                    user: Config.DBConfig.user,
                    password: Config.DBConfig.password,
                    database: Config.DBConfig.database
                },
                dumpToFile: DBManager.createAndDisplayBackupPath()
            })
            Console.logDb(`Backup générée`)
        } catch (err) {
            Console.error(err);
        }
    }

    async returnServerLanguage(guildId: string) {
        try {
            let rows = await this.query<{ language: textLanguage }[]>(`SELECT language FROM config WHERE id = ?`, guildId)
            return rows[0].language
        } catch (err) {
            Console.error(err);
            return Constants.defaultLanguage;
        }
    }
}