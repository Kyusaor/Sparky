import { db, dev } from "../../main.js";
import { textLanguage } from "./types";

export class Translations {

    static async getServerTranslation(serverId:string) {
        let language = await db.returnServerLanguage(serverId);
        let text = {language: language, text:this.displayText().fr}
        return text
    }

    static displayText() {
        return {
            fr: {
                global: {
                    welcomeMsg: `Je me présente: je suis Sparky, un bot discord Lords Mobile, conçu pour les serveurs de guilde.\n\nLa liste de mes commandes se trouve en faisant **\`\`/aide\`\`** sur votre serveur\n\nMerci de m'avoir ajouté!`,
                    tipsFooter: [
                        {text: "Faites la commande /aide pour obtenir de l'aide !"},
                        {text: `Développé avec amour par ${dev.tag}`, iconURL: dev.displayAvatarURL()},
                        {text: `Faites la commande /langage pour passer le bot en anglais !`},
                        {text: `Faites /veilleur pour avoir les notifications d'évènements infernaux`},
                        {text: `Fun fact: je suis le meilleur bot du monde`},
                    ],
                    noLinkInDm: "Bonjour, pour m'ajouter à votre serveur utilisez plutôt ce lien!"
                },
                helpMention: {
                    title: "Perdu?",
                    description: "Pour obtenir la liste de mes commandes, faites **/aide**",
                }
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
                    noLinkInDm: "{english}"
                },
                helpMention: {
                    title: "{english}",
                    description: "{english}",
                }

            }
        }
    }
}