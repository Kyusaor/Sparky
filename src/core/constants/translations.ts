import { db, dev } from "../../main.js";
import { textLanguage } from "./types.js";
import { DiscordValues } from "./values.js";

export class Translations {

    static async getServerTranslation(serverId:string | null) {
        let language = await db.returnServerLanguage(serverId || DiscordValues.MAIN_GUILD);
        let text = {language: language, text:this.displayText("fr")}
        return text
    }

    static displayText(language: textLanguage) {
        let text = {
            fr: {
                global: {
                    welcomeMsg: `Je me présente: je suis Sparky, un bot discord Lords Mobile, conçu pour les serveurs de guilde.\n\nLa liste de mes commandes se trouve en faisant **\`\`/aide\`\`** sur votre serveur\n\nMerci de m'avoir ajouté!`,
                    tipsFooter: [
                        {text: "Faites la commande /aide pour obtenir de l'aide !"},
                        {text: `Développé avec amour par ${dev?.tag || `<@${DiscordValues.DEV_DISCORD_ID}>`}`, iconURL: dev?.displayAvatarURL()},
                        {text: `Faites la commande /langage pour passer le bot en anglais !`},
                        {text: `Faites /veilleur pour avoir les notifications d'évènements infernaux`},
                        {text: `Fun fact: je suis le meilleur bot du monde`},
                    ],
                    noLinkInDm: ":flag_fr: Bonjour, pour m'ajouter à votre serveur utilisez plutôt ce lien!",
                    noCommandOffServer: ":flag_fr: Les commandes sont à réaliser sur un serveur !",
                    defaultCommandReply: "Impossible d'exécuter la commande :confused:",
                    CommandExecutionError: "Une erreur est survenue pendant l\'éxecution de la commande!",
                },
                helpMention: {
                    title: "Perdu?",
                    description: "Pour obtenir la liste de mes commandes, faites **/aide**",
                },
                commands: {
                    contact: {
                        name: "contact",
                        description: "Nous contacter (discord ou mail)",
                        text: {
                            content: [
                                "Besoin d'aide sur le bot, de signaler un bug ou simplement discuter avec des joueurs de Lords Mobile? Voilà le lien du serveur :wink:\n",
                                "\n\nPour contacter le développeur, vous pouvez également envoyer un mail à __**"
                            ],
                        },
                    },
                },
            },
        
            en: {
                global: {
                    welcomeMsg: `{english}`,
                    tipsFooter: [
                        {text: "{english}"},
                        {text: "{english}"},
                        {text: "{english}"},
                        {text: "{english}"},
                        {text: "{english}"},
                    ],
                    noLinkInDm: "{english}",
                    noCommandOffServer: "{english}",
                    CommandExecutionError: "{english}",
                    defaultCommandReply: "{english}"
                },
                helpMention: {
                    title: "{english}",
                    description: "{english}",
                },
                commands: {
                    contact: {
                        name: "contact",
                        description: "{english}",
                        text: {
                            content: [
                                "{english}",
                                "{english}"
                            ]
                        },
                    },
                },

            }
        };

        return text[language]
    }

    static displayFullText() {
        return {fr: this.displayText("fr"), en: this.displayText("en")}
    }

    static displayCommandText(command:string) {
        let textFr = this.displayText("fr").commands;
        if(!Object.keys(textFr).includes(command))
            throw `Impossible de récupérer le texte de la commande ${command}`;

        return {
            fr: this.displayText("fr").commands[command as keyof typeof textFr],
            en: this.displayText("en").commands[command as keyof typeof textFr],
        }
    }
}