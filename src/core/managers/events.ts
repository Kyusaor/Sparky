import {
    ActionRowBuilder,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    GuildMemberRoleManager,
    Interaction,
    InteractionType,
    Message,
    SelectMenuBuilder,
    SelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction
} from 'discord.js';
import {Translations} from '../constants/translations.js';
import {Utils} from '../utils.js';
import {Constants, DiscordValues} from '../constants/values.js';
import {bot, chanList, Console, db, Cache, StatusCache, TranslationsCache} from '../../main.js';
import {Command, CommandManager} from './commands.js';
import {ServerManager} from './servers.js';
import {
    ButtonOutputType,
    GearObject,
    GearPiece,
    GearSet,
    RarityWithMythic,
    RolesData,
    textLanguage
} from '../constants/types.js';
import APIManager from './apicalls.js';

export abstract class EventHandler {

    static async interactionHandler(intera: Interaction<"cached">): Promise<void> {
        if (intera.guild)
            ServerManager.createIfServerIsNotInDb(intera.guild.id);

        let language = (await db.fetchUserData(intera.user.id))?.preferredLanguage;
        if (!language)
            language = await Translations.getServerLanguage(intera.guildId);

        try {
            if (intera.isChatInputCommand())
                await CommandManager.slashCommandManager(intera, language);

            if (intera.isButton())
                await CommandManager.buttonInteractionManager(intera, language);

            if (intera.isStringSelectMenu())
                await SelectMenuManager(intera, language);

            if (intera.isAutocomplete())
                await CommandManager.autocompleteManager(intera, language)
        }
        catch (e) {
            Console.error(e);
            if (intera.isButton())
                StatusCache.unlock(intera.guildId || intera.user.id, intera.user.id, 'setglobalping');
        }
    }

    static MessageCreateHandler(msg: Message<boolean>): void {
        if (msg.author.bot) return;

        msg.channel.type === ChannelType.DM ? this.DmToBotHandler(msg) : this.MessageInServerHandler(msg);
    };

    static async MessageInServerHandler(msg: Message): Promise<void> {
        if (!msg.guild || msg.channel.isDMBased() || !msg.mentions.has(bot.user!.id, {
            ignoreRoles: true,
            ignoreEveryone: true,
            ignoreRepliedUser: true
        })) return;
        let language = await Translations.getServerLanguage(msg.guild.id);
        if (!language)
            throw `Impossible de récupérer la langue du serveur ${msg.guild.id}`;

        let embed = (await Utils.EmbedBaseBuilder(language))
            .setThumbnail(DiscordValues.botIcon.help)
            .setTitle(TranslationsCache[language].helpMention.title)
            .setDescription(TranslationsCache[language].helpMention.description);

        msg.channel.send({embeds: [embed]});
    };


    static async DmToBotHandler(msg: Message): Promise<void> {
        if (msg.author.bot || msg.channel.type !== ChannelType.DM) return;

        let msgFiles: string[] = [];
        let chanDM = chanList.LOGS_DM;

        if (!chanDM)
            throw 'Logs DM impossible à récupérer';

        msg.attachments.forEach(e =>
            msgFiles.push(e.url)
        );

        try {
            await chanDM.send(msg.author.id);
            await chanDM.send(`__**${msg.author.tag} a envoyé:**__`);

            let content: string;
            msg.stickers.size == 1 ?
                content = `sticker: ${msg.stickers.first()?.name}` :
                content = msg.content;

            //Auto response
            if (msg.content.includes('discord.gg/') || msg.content.includes('discord.com/')) {
                content += `\n${TranslationsCache.fr.global.autoDmResponse}: ${TranslationsCache.fr.global.noLinkInDm}`;
                await msg.channel.send(`${TranslationsCache.fr.global.noLinkInDm}\n\n${TranslationsCache.en.global.noLinkInDm}\n\n${Utils.displayBotLink()}`);
            }
            if (msg.content.startsWith('!') || msg.content.startsWith('/')) {
                content += `\n${TranslationsCache.fr.global.autoDmResponse}: ${TranslationsCache.fr.global.noCommandOffServer}`;
                await msg.channel.send(`${TranslationsCache.fr.global.noCommandOffServer}\n\n${TranslationsCache.en.global.noCommandOffServer}`);
            }
            if (msg.mentions.has(bot.user!.id, {ignoreRoles: true, ignoreEveryone: true, ignoreRepliedUser: true})) {
                let embed = (await Utils.EmbedBaseBuilder('en'))
                    .setThumbnail(DiscordValues.botIcon.help);

                for (let lang of Object.keys(TranslationsCache))
                    embed.addFields({
                        name: TranslationsCache[lang as textLanguage].global.flag + TranslationsCache[lang as textLanguage].helpMention.title,
                        value: TranslationsCache[lang as textLanguage].helpMention.description
                    });

                content += `\n${TranslationsCache.fr.global.autoDmResponse}: ${TranslationsCache.fr.helpMention.title}`;
                await msg.channel.send({embeds: [embed]});
            }

            await chanDM.send({content, files: msgFiles});

        }
        catch (err) {
            Console.error(err);
        }
    };
}

async function SelectMenuManager(intera: StringSelectMenuInteraction, language: textLanguage) {
    switch (CommandManager.getCommandFromButtonOrMenuId(intera.customId)) {
        case 'watcher':
            //Old hell board values legacy
            let values = intera.values.map(e => {
                if (Object.keys(Constants.oldHellMenu).includes(e))
                    return Constants.oldHellMenu[e as keyof typeof Constants.oldHellMenu];
                else return e;
            });

            if (values.find(e => !Constants.hellMenu.includes(e)))
                return;

            let guild = new ServerManager(intera.guild!);
            let roles = await guild.getHellRoles();
            if (!roles)
                return Command.prototype.reply(TranslationsCache[language].commands.watcher.text.noRoles, intera);

            let changesList: { add: [keyof RolesData, string][], remove: [keyof RolesData, string][] } = {
                add: [],
                remove: []
            };

            let currentRoles = intera.member?.roles as GuildMemberRoleManager;
            for (let roleLabel of Object.keys(roles)) {
                if (currentRoles.cache.map(r => r.id).includes(roles[roleLabel as keyof typeof roles]) && !values.includes(roleLabel))
                    changesList.remove.push([roleLabel as keyof RolesData, roles[roleLabel as keyof typeof roles]]);
                if (!currentRoles.cache.map(r => r.id).includes(roles[roleLabel as keyof typeof roles]) && values.includes(roleLabel))
                    changesList.add.push([roleLabel as keyof RolesData, roles[roleLabel as keyof typeof roles]]);
            }

            let messageString: string = TranslationsCache[language].others.hellMentions.updateRolesMsg;

            for (let obj of changesList.add) {
                messageString += `(+) ${TranslationsCache[language].others.hellEvents[obj[0]]}\n`;
            }

            for (let obj of changesList.remove) {
                messageString += `(-) ${TranslationsCache[language].others.hellEvents[obj[0]]}\n`;
            }

            await Command.prototype.reply({content: messageString, ephemeral: true}, intera);

            await Promise.allSettled(changesList.add.map(async (obj) => {
                try {
                    await currentRoles.add(obj[1]);
                }
                catch {
                    Console.log(TranslationsCache[Constants.defaultLanguage].global.errors.RoleNotEditable);
                }
            }));

            await Promise.allSettled(changesList.remove.map(async (obj) => {
                messageString += `(-) ${TranslationsCache[language].others.hellEvents[obj[0]]}\n`;
                try {
                    await currentRoles.remove(obj[1]);
                }
                catch {
                    Console.log(TranslationsCache[Constants.defaultLanguage].global.errors.RoleNotEditable);
                }
            }));
            break;

        case 'gear':
            let GearCache = Cache.getGear();
            if(!GearCache)
                return intera.reply({content: TranslationsCache[language].global.errors.gearCacheUnavailable, ephemeral: true});
            intera.deferReply();
            let set: GearSet;
            let gearText = TranslationsCache[language].others.gear;
            let commandText = TranslationsCache[language].commands.gear.text;
            let embed: EmbedBuilder;

            switch (intera.customId.split('-')[2]) {
                //Manage the message edit from the set selector to the set piece selector
                case 'menu':
                    let gearList = Object.keys(GearCache);
                    let rowList: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
                    set = intera.values[0] as GearSet;
                    if (!gearList.includes(set))
                        throw `Set ${set} inconnu`;

                    embed = new EmbedBuilder(intera.message.embeds[0]!.data)
                        .setThumbnail('attachment://image.png')
                        .setFields();


                    let gearPiecSelectMenuBuilder = new SelectMenuBuilder()
                        .setCustomId(`${Command.generateButtonCustomId('gear', language)}-set-${set}`)
                        .setPlaceholder(commandText.setPlaceHolder)
                        .setMaxValues(1)
                        .setMinValues(1);

                    //Looks through every part of the selected set
                    for (let part of Object.keys(GearCache[set])) {
                        let itemList = '';
                        if (set == 'none' && part !== 'offhand') {
                            gearPiecSelectMenuBuilder = new SelectMenuBuilder(gearPiecSelectMenuBuilder.data)
                                .setCustomId(`${Command.generateButtonCustomId('gear', language)}-set-${set}-${part}`)
                                .setPlaceholder(gearText.pieceName[part as GearPiece])
                                .setOptions();
                        } else if (set == 'none' && part == 'offhand')
                            gearPiecSelectMenuBuilder.setPlaceholder(gearPiecSelectMenuBuilder.data.placeholder + ' / ' + gearText.pieceName['offhand']);

                        //Looks through every piece of the set part
                        GearCache[set][part as GearPiece].forEach(item => {
                            let itemName = gearText.setItemNames[item.name as keyof typeof gearText.setItemNames] || 'DefaultName';
                            gearPiecSelectMenuBuilder.addOptions(
                                new SelectMenuOptionBuilder()
                                    .setEmoji(Utils.displayEmoji(item.piece).id)
                                    .setLabel(itemName)
                                    .setValue(item.name)
                            );
                            itemList += `-${itemName}\n`;
                        });

                        if (set == 'none' && part !== 'offhand')
                            rowList.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(gearPiecSelectMenuBuilder));

                        embed.addFields([{
                            name: `${Utils.displayEmoteInChat(part)} ${gearText.pieceName[part as GearPiece]}`,
                            value: itemList
                        }
                        ]);
                    }

                    if (set !== 'none')
                        rowList.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(gearPiecSelectMenuBuilder));

                    await intera.message.edit({embeds: [embed], components: rowList}).catch(e => Console.error(e));
                    break;

                //Manage the message edit from the set piece selector to the piece rarity selector
                case 'set':
                    set = intera.customId.split('-')[3] as GearSet;
                    let itemData: GearObject = fetchItemFromName(intera.values[0], set);
                    let itemImage = await APIManager.getImage(APIManager.getGearImagePathFromItem(itemData));

                    let gearItemEmbed = buildItemGearDataEmbed(itemData, language)
                        .setThumbnail(itemImage.display);

                    let rarityButtons = createRarityGearButtons(itemData, language, 'classic');
                    intera.message.edit({
                        embeds: [gearItemEmbed],
                        components: rarityButtons,
                        files: [itemImage.attachment]
                    });
                    break;

                default:
                    Console.error(`Case ${intera.customId.split('-')[2]} inexistant dans les menus gear`);
            }

            intera.deleteReply();
            break;
    }
}

function buildItemGearDataEmbed(itemData: GearObject, language: textLanguage) {
    let gearText = TranslationsCache[language].others.gear;
    let setNames = {...TranslationsCache[language].others.mobs, ...gearText.setNames};
    let sourcesTO = {...TranslationsCache[language].others.mobs, ...gearText.sources};
    let commandText = TranslationsCache[language].commands.gear.text;

    let craftList: string[] = [];
    Object.keys(itemData.craft).forEach(item => {

        if (Object.keys(Constants.craftingItemSources).includes(item)) {
            let itemTO = gearText.craftingItems[item as keyof typeof Constants.craftingItemSources];
            let sourceListTO: string[] = [];
            Constants.craftingItemSources[item as keyof typeof Constants.craftingItemSources].forEach(sourceName => {
                if (!sourceListTO.includes(sourcesTO[sourceName]))
                    sourceListTO.push(sourcesTO[sourceName]);
            });
            craftList.push(`${itemTO} ${Utils.displayEmoteInChat(item)}x${itemData.craft[item as keyof typeof Constants.craftingItemSources]} (${sourceListTO.join(', ')})`);
        } else if (Object.keys(gearText.specificSources).includes(item)) {
            craftList.push(Translations.displayText(gearText.specificSources[item as keyof typeof gearText.specificSources], {text: itemData.craft[item as keyof typeof itemData.craft]?.toString()}));
        } else Console.info(`L'item ${item} est absent, verifiez la typo`);

    });

    let embed = Utils.EmbedBaseBuilder(language)
                     .setTitle(`${TranslationsCache[language].others.gear.setItemNames[itemData.name]}`)
                     .addFields([
                         {name: commandText.objectEmbedSetName, value: setNames[itemData.set]},
                         {name: commandText.objectEmbedLevel, value: itemData.requiredLevel.toString()},
                         {name: commandText.objectEmbedPiece, value: gearText.pieceName[itemData.piece]},
                         {
                             name: commandText.objectEmbedCraft,
                             value: '-' + craftList.join('\n-')
                         }
                     ]);

    let isEmperor = Constants.emperorSets.includes(itemData.set);
    if (itemData.ember && !isEmperor)
        embed.addFields({
            name: commandText.objectEmbedEmberCost,
            value: `${Utils.displayEmoteInChat(isEmperor ? 'mythic_ember' : 'blazing_ember')} ${Utils.displayEmoteInChat(itemData.ember.rarity)} x${itemData.ember.amount}`
        });

    return embed
}

export function createRarityGearButtons(gear: GearObject, language: textLanguage, step: ButtonOutputType) {
    let output: ActionRowBuilder<ButtonBuilder>[] = [];
    let row = new ActionRowBuilder<ButtonBuilder>();

    if (step !== 'tempered') {
        Constants.rarityList.forEach(rarity => {
            if (row.components.length == 5) {
                output.push(row);
                row = new ActionRowBuilder<ButtonBuilder>();
            }
            let button = new ButtonBuilder()
                .setCustomId(`${Command.generateButtonCustomId('gear', language)}-rarity-${gear.set}-${gear.piece}-${gear.name}-${rarity}-${step}`)
                .setLabel(TranslationsCache[language].others.rarity[rarity as RarityWithMythic])
                .setEmoji(Utils.displayEmoji(rarity).id)
                .setStyle(ButtonStyle.Primary);

            let isBattlegroundReward = Constants.emperorSets.includes(gear.set);

            if (
                (gear.requiredLevel < 50 && rarity == 'tempered' && !isBattlegroundReward) ||
                (isBattlegroundReward && !['mythic', 'legendary', 'tempered'].includes(rarity)) ||
                (gear.set == 'collab' && rarity !== 'legendary')
            )
                button.setDisabled(true);

            row.addComponents(button);
        });
    } else {
        let maxAstra: number;
        Constants.emperorSets.includes(gear.set) ?
            maxAstra = 3 :
            maxAstra = 15;

        for (let i = 1; i <= maxAstra; i++) {
            if (row.components.length == 5) {
                output.push(row);
                row = new ActionRowBuilder<ButtonBuilder>();
            }

            let button = new ButtonBuilder()
                .setCustomId(`${Command.generateButtonCustomId('gear', language)}-rarity-${gear.set}-${gear.piece}-${gear.name}-"tempered"-${step}-${i}`)
                .setEmoji(Utils.displayEmoji('tempered').id)
                .setLabel(i.toString())
                .setStyle(ButtonStyle.Primary);

            row.addComponents(button);
        }

        output.push(row);
        row = new ActionRowBuilder<ButtonBuilder>();
        let button = new ButtonBuilder()
            .setCustomId(`${Command.generateButtonCustomId('gear', language)}-rarity-${gear.set}-${gear.piece}-${gear.name}-"tempered"-${step}-back`)
            .setEmoji('⏪')
            .setLabel(TranslationsCache[language].global.back)
            .setStyle(ButtonStyle.Danger);

        row.addComponents(button);
    }
    output.push(row);
    return output;
}

function fetchItemFromName(name: string, setName?: GearSet): GearObject {
    function searchItem(itemName: string, setData: Record<Partial<GearPiece>, GearObject[]>) {
        let foundPiece: GearObject | undefined = undefined;
        Object.keys(setData).forEach(piece => {
            setData[piece as keyof typeof setData].forEach(e => {
                if (e.name == name) foundPiece = e;
            });
        });
        return foundPiece;

    }

    let GearCache = Cache.getGear()!;

    let output: GearObject | undefined;
    if (setName)
        output = searchItem(name, GearCache[setName]);
    else {
        Object.keys(GearCache).forEach(set => {
            let out = searchItem(name, GearCache[set as GearSet]);
            output = (out == undefined) ? output : out;
        });
    }

    return output || Constants.defaultGearObjectData;
}