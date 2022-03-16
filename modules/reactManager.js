const utils = require("./utils");

module.exports = {

    selecter(reaction, user, bot, gpconf, type){

        let reacId;
        reaction.emoji.id ? reacId = reaction.emoji.id : reacId = reaction.emoji.name;
        let gpconfig = gpconf[reaction.message.guild.id];

        if(user.bot) return;
        if(!gpconfig && (reaction.message.id != gpconf.settings.msg_annonce)) return;
        //Ajout réac
        if(type) {
            if(reaction.message.id == gpconfig.msg_board && utils.VeilleurReac.includes(reacId)){
                this.veilleurAdd(reaction, user, bot, gpconfig)
            }
            else if(reaction.message.id == gpconf.settings.msg_annonce){
                reaction.users.remove(user);
                this.sendGPing(reaction, bot, gpconf, user)
            }
        }

        //Retrait réac
        else {
            if(reaction.message.id == gpconfig.msg_board && utils.VeilleurReac.includes(reacId)){
                this.veilleurRemove(reaction, user, bot, gpconfig)
            }
        }
    },

    async veilleurAdd(reaction, user, bot, gpconfig){
        let date = new Date();
        let chanPing = await bot.channels.cache.get(gpconfig.chan_board);

        if(!chanPing) return console.log(utils.displayConsoleHour(date) + gpconfig.chan_notifs + ": chan introuvable");

        let reacId;
        reaction.emoji.id ? reacId = reaction.emoji.id : reacId = reaction.emoji.name;

        if(!chanPing.guild.me.hasPermission('MANAGE_ROLES')) {
            let mess = await chanPing.send("Désolé <@" + user.id + ">, mais il semble que je n'ai pas la permission de te donner ce rôle")
            mess.delete({timeout: 10000})
            return console.log(utils.displayConsoleHour(date) + guildId + ": Impossible de give le role " + roleId + " à " + user.id + ": permission manquante");
        }

        switch(reacId){

            case '660453261979025418':
                utils.giveRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.IVR, chanPing.id)
                break;

            case '660453599318638592':
                utils.giveRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.IDR, chanPing.id)
                break;

            case '607194832271573024':
                utils.giveRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.IV, chanPing.id)
                break;

            case '607194934759391242':
                utils.giveRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.ID, chanPing.id)
                break;

            case '607554773851570181':
                utils.giveRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.CDT, chanPing.id)
                break;

            case '607196986948452377':
                utils.giveRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.CDR, chanPing.id)
                break;

            case '740689133600768091':
                utils.giveRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.OJ, chanPing.id)
                break;

            case '740688906755768470':
                utils.giveRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.OR, chanPing.id)
                break;

            default:
                break;
        }
    },

    async veilleurRemove(reaction, user, bot, gpconfig){
        let date = new Date();
        let chanPing = await bot.channels.cache.get(gpconfig.chan_board);

        if(!chanPing) return console.log(utils.displayConsoleHour(date) + gpconfig.chan_board + ": chan introuvable");

        let reacId;
        reaction.emoji.id ? reacId = reaction.emoji.id : reacId = reaction.emoji.name;

        if(!chanPing.guild.me.hasPermission('MANAGE_ROLES')) {
            let mess = await chanPing.send("Désolé <@" + user.id + ">, mais il semble que je n'ai pas la permission de t'enlever ce rôle")
            mess.delete({timeout: 10000})
            return console.log(utils.displayConsoleHour(date) + chanPing.guild.name + " (" + guildId + "): Impossible d'enlever le role " + roleId + " à " + user.tag + "(" + user.id + "): permission manquante");
        }

        switch(reacId){

            case '660453261979025418':
                utils.removeRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.IVR, chanPing.id)
                break;

            case '660453599318638592':
                utils.removeRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.IDR, chanPing.id)
                break;

            case '607194832271573024':
                utils.removeRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.IV, chanPing.id)
                break;

            case '607194934759391242':
                utils.removeRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.ID, chanPing.id)
                break;

            case '607554773851570181':
                utils.removeRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.CDT, chanPing.id)
                break;

            case '607196986948452377':
                utils.removeRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.CDR, chanPing.id)
                break;

            case '740689133600768091':
                utils.removeRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.OJ, chanPing.id)
                break;

            case '740688906755768470':
                utils.removeRole(bot, user.id, reaction.message.guild.id, gpconfig.roles.OR, chanPing.id)
                break;

            default:
                break;
        }
    },

    async sendGPing(reaction, bot, gpconfig, user){

        let date = new Date();
        let emojID, mess, mess2, role, confirm, type, i;
        reaction.emoji.id ? emojID = reaction.emoji.id : emojID = reaction.emoji.name;

        switch(emojID){

            case '🇻':
                let Vreac = ['607196986948452377', '607559564535267348', '607554115416883200', '607561368421400576', '607559484486844436', '614816781420199937'];
                let Vtypes = {
                    academie:{
                        name: "infernal veilleur recherche",
                        role:"IVR",
                    },
                    batiment:{
                        name:"infernal veilleur construction",
                        role:"IV",
                    },
                    pacte:{
                        name:"infernal veilleur fusion",
                        role:"IV"
                    },
                    labyrinthe:{
                        name:"infernal veilleur labyrinthe",
                        role:"IV"
                    },
                    royaume_pouvoir:{
                        name:"infernal veilleur royaume du pouvoir",
                        role:"IV"
                    },
                    chasse:{
                        name:"infernal veilleur chasse",
                        role:"IV"
                    },
                }
                
                mess = await reaction.message.channel.send("__Choisis le type d'évènement Veilleur:__\n<:academie:607196986948452377>-Recherche\n<:batiment:607559564535267348>-Construction\n<:pacte:607554115416883200>-Fusion\n<:labyrinthe:607561368421400576>-Laby\n<:royaume_pouvoir:607559484486844436>-Royaume du pouvoir\n<:chasse:614816781420199937>: Chasse\n\n:warning: *Ignorez pour annuler*")
                i = 0;
                await Vreac.forEach(r => {mess.react(r); i++});

                try {
                    type = await mess.awaitReactions((r, u) => Vreac.includes(r.emoji.id) && u.id == user.id && i == Vreac.length, { max : 1, time: 60000, errors: ['time']})
                }
                catch {
                    return mess.delete();
                }
                mess.delete();

                mess2 = await reaction.message.channel.send("Voulez-vous signaler un " + Vtypes[type.first().emoji.name].name + "?");
                await mess2.react('✅');
                await mess2.react('❌');
        
                try {
                    confirm = await mess2.awaitReactions((r, u) => ['✅', '❌'].includes(r.emoji.name) && u.id == user.id, { max: 1, time: 30000, errore: ['time']});
                }
                catch {
                    return mess2.delete()
                }
                mess2.delete();

                if(confirm.first().emoji.name != '✅') return;

                role = Vtypes[type.first().emoji.name];
                break;
                
            case '🇩':
                
                let Dreac = ['607196986948452377', '614816781420199937', '607559564535267348', '607554773851570181', '607561368421400576', '607559484486844436', '607554115416883200', '🇷', '🇪'];
                let Dtypes = {
                    academie:{ 
                        name:"infernal dragon recherche",
                        role:"IDR",
                    },
                    chasse:{
                        name:"infernal dragon chasse",
                        role:"ID",
                    },
                    batiment:{
                        name:"infernal dragon construction",
                        role:"ID",
                    },
                    fantassin: {
                        name:"infernal dragon troupes",
                        role:"ID",
                    },
                    labyrinthe:{
                        name:"infernal dragon labyrinthe",
                        role:"ID",
                    },
                    royaume_pouvoir:{
                        name:"infernal dragon royaume du pouvoir",
                        role:"ID",
                    },
                    pacte:{
                        name:"infernal dragon pactes",
                        role:"ID",
                    },
                    "🇷":{
                        name:"challenge dragon recherche",
                        role:"CDR",
                    },
                    "🇪":{
                        name:"challenge dragon troupes",
                        role:"CDT",
                    }
                }

                mess = await reaction.message.channel.send("__Choisissez le type d'évènement Dragon:__\n\n-<:academie:607196986948452377>: Infernal Recherche\n-<:chasse:614816781420199937>: Infernal Chasse\n-<:batiment:607559564535267348>: Infernal construction\n-<:fantassin:607554773851570181>: Infernal troupes\n-<:labyrinthe:607561368421400576>: Infernal Labyrinthe\n-<:royaume_pouvoir:607559484486844436>: Infernal Royaume\n-<:pacte:607554115416883200>: Infernal Fusion\n\nChallenges:\n-🇷: Challenge Recherche\n-🇪: Challenge Entrainement\n\n*Ignorez pour annuler*")
                i = false;
                await Dreac.forEach(r => mess.react(r));

                setTimeout(() => {i = true}, 10000)
                try {
                    type = await mess.awaitReactions((r, u) => Object.keys(Dtypes).includes(r.emoji.name) && u.id == user.id && i, { max : 1, time: 60000, errors: ['time']})
                }
                catch {
                    return mess.delete();
                }
                mess.delete();

                mess2 = await reaction.message.channel.send("Voulez-vous signaler un " + Dtypes[type.first().emoji.name].name + "?");
                await mess2.react('✅');
                await mess2.react('❌');
        
                try {
                    confirm = await mess2.awaitReactions((r, u) => ['✅', '❌'].includes(r.emoji.name) && u.id == user.id, { max: 1, time: 30000, errore: ['time']});
                }
                catch {
                    return mess2.delete()
                }
                mess2.delete();

                if(confirm.first().emoji.name != '✅') return;

                role = Dtypes[type.first().emoji.name];

                break;
                
            case'740688906755768470':
                mess2 = await reaction.message.channel.send("Voulez-vous signaler un infernal orbes rouges?");
                await mess2.react('✅');
                await mess2.react('❌');
        
                try {
                    confirm = await mess2.awaitReactions((r, u) => ['✅', '❌'].includes(r.emoji.name) && u.id == user.id, { max: 1, time: 30000, errore: ['time']});
                }
                catch {
                    return mess2.delete()
                }
                mess2.delete();

                if(confirm.first().emoji.name != '✅') return;

                role = {name:"infernal orbes rouges", role:"OR"};
                break;
                
            case '740689133600768091':
                mess2 = await reaction.message.channel.send("Voulez-vous signaler un infernal orbes jaunes?");
                await mess2.react('✅');
                await mess2.react('❌');
        
                try {
                    confirm = await mess2.awaitReactions((r, u) => ['✅', '❌'].includes(r.emoji.name) && u.id == user.id, { max: 1, time: 30000, errore: ['time']});
                }
                catch {
                    return mess2.delete()
                }
                mess2.delete();

                if(confirm.first().emoji.name != '✅') return;

                role = {name:"infernal orbes jaunes", role:"OJ"};
                break;

            default:
                break;
        }

        console.log(utils.displayConsoleHour(date) + user.tag + " (" + user.id + ") a mentionné un [" + role.name + "]")

        for(i in gpconfig){
            if(!gpconfig[i].ping_global) continue;

            let chan = await bot.channels.cache.get(gpconfig[i].chan_notifs);
            if(!chan) {
                //console.log('chan: ' + i); 
                continue
            };

            let guild = await bot.guilds.cache.get(i);
            if(!guild) {
                //console.log('guild: ' + i + ' introuvable');
                continue
            };

            let rol = await guild.roles.cache.get(gpconfig[i].roles[role.role])
            if(!rol) {
                //console.log('role: ' + i); 
                continue
            };

            try { chan.send(rol.toString() + " un " + role.name + " est en cours!").catch(e => console.log(utils.displayConsoleHour(date) + "Impossible d'envoyer " + role.role + " sur le serv " + guild.name + "(" + guild.id + ")")) }
            catch { console.log(utils.displayConsoleHour(date) + "Impossible d'envoyer " + role.role + " sur le serv " + guild.name + "(" + guild.id + ")"); continue}

            //console.log('succès:' + chan.guild.name)
            
        }
    }
}