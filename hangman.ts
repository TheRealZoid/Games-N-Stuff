import GameBase from './game-base';
import Discord, { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import GameResult, { ResultType } from './game-result';
import fetch from 'node-fetch';

//unicode fun...
const reactions = new Map([
    ["đ°ī¸", "A"],
    ["đĻ", "A"],
    ["đąī¸", "B"],
    ["đ§", "B"],
    ["đ¨", "C"],
    ["đŠ", "D"],
    ["đĒ", "E"],
    ["đĢ", "F"],
    ["đŦ", "G"],
    ["đ­", "H"],
    ["âšī¸", "I"],
    ["đŽ", "I"],
    ["đ¯", "J"],
    ["đ°", "K"],
    ["đą", "L"],
    ["âī¸", "M"],
    ["đ˛", "M"],
    ["đŗ", "N"],
    ["đžī¸", "O"],
    ["â­", "O"],
    ["đ´", "O"],
    ["đŋī¸", "P"],
    ["đĩ", "P"],
    ["đļ", "Q"],
    ["đˇ", "R"],
    ["đ¸", "S"],
    ["đš", "T"],
    ["đē", "U"],
    ["đģ", "V"],
    ["đŧ", "W"],
    ["âī¸", "X"],
    ["â", "X"],
    ["â", "X"],
    ["đŊ", "X"],
    ["đž", "Y"],
    ["đ¤", "Z"],
    ["đŋ", "Z"],
]);

export default class HangmanGame extends GameBase {
    private word: string = "";
    private guesssed: string[] = [];
    private wrongs: number = 0;

    constructor() {
        super('hangman', false);
    }

    public initGame(): GameBase {
        return new HangmanGame();
    }

    public newGame(msg: Message, player2: User | null, onGameEnd: (result: GameResult) => void): void {
        if (this.inGame)
            return;

        fetch('https://api.theturkey.dev/randomword').then(resp => resp.text()).then(word => {
            this.word = word.toUpperCase();
            this.guesssed = [];
            this.wrongs = 0;

            super.newGame(msg, player2, onGameEnd, Array.from(reactions.keys()), false);
        });
    }

    protected getEmbed(): MessageEmbed {
        return new Discord.MessageEmbed()
            .setColor('#db9a00')
            .setTitle('Hangman')
            .setAuthor("Made By: TurkeyDev", "https://site.theturkey.dev/images/turkey_avatar.png", "https://www.youtube.com/watch?v=0G3gD4KJ59U")
            .setDescription(this.getDescription())
            .addField('Letters Guessed', this.guesssed.length == 0 ? '\u200b' : this.guesssed.join(" "))
            .addField('How To Play', "React to this message using the emojis that look like letters (đ°ī¸, đš, )")
            .setFooter(`Currently Playing: ${this.gameStarter.username}`)
            .setTimestamp();
    }

    protected getGameOverEmbed(result: GameResult): MessageEmbed {
        return new Discord.MessageEmbed()
            .setColor('#db9a00')
            .setTitle('Hangman')
            .setAuthor("Made By: TurkeyDev", "https://site.theturkey.dev/images/turkey_avatar.png", "https://www.youtube.com/watch?v=0G3gD4KJ59U")
            .setDescription(`${this.getWinnerText(result)}\n\nThe Word was:\n${this.word}\n\n${this.getDescription()}`)
            .setTimestamp();
    }

    private makeGuess(reaction: string) {
        if (reactions.has(reaction)) {
            const letter = reactions.get(reaction);
            if (letter === undefined)
                return;

            if (!this.guesssed.includes(letter)) {
                this.guesssed.push(letter);

                if (this.word.indexOf(letter) == -1) {
                    this.wrongs++;

                    if (this.wrongs == 6) {
                        this.gameOver({ result: ResultType.LOSER, name: this.gameStarter.username, score: this.word });
                        return;
                    }
                }
                else if (!this.word.split("").map(l => this.guesssed.includes(l) ? l : "_").includes("_")) {
                    this.gameOver({ result: ResultType.WINNER, name: this.gameStarter.username, score: this.word });
                    return;
                }
            }
        }

        this.step();
    }

    private getDescription(): string {
        return "```"
            + "|âžâžâžâžâžâž|   \n|     "
            + (this.wrongs > 0 ? "đŠ" : " ")
            + "   \n|     "
            + (this.wrongs > 1 ? "đ" : " ")
            + "   \n|     "
            + (this.wrongs > 2 ? "đ" : " ")
            + "   \n|     "
            + (this.wrongs > 3 ? "đŠŗ" : " ")
            + "   \n|    "
            + (this.wrongs > 4 ? "đđ" : " ")
            + "   \n|     \n|__________\n\n"
            + this.word.split("").map(l => this.guesssed.includes(l) ? l : "_").join(" ")
            + "```";
    }

    protected onReaction(reaction: MessageReaction): void {
        if (reaction.users.cache.has(this.gameStarter.id))
            this.makeGuess(reaction.emoji.name);
        else
            this.step();
        reaction.remove().catch(e => super.handleError(e, 'remove reaction'));
    }
}
