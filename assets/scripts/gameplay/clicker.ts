import { _decorator, Component, Node, RichText } from 'cc';
import { gameManager } from '../gameManager';
const { ccclass, property } = _decorator;

@ccclass('clicker')
export class clicker extends Component {

    @property(Node)
    public scoreText: Node = null;

    @property(Node)
    public timerText: Node = null;

    @property
    public timer: number = 10;

    @property(Node)
    public GameManager: gameManager = null;

    private _score: number = 0;
    private _timerRichText: RichText = null;
    private _scoreRichText: RichText = null;
    private _gameStarted: boolean = false;

    public startGame() {
        this._gameStarted = true;
        this._score = 0;
        this.timer = 10;

        if (this._scoreRichText) {
            this._scoreRichText.string = `<color=#00ff00>Score: </color><color=#0fffff>0</color>`;
        }

        if (this._timerRichText) {
            this._timerRichText.string = `<color=#ff0000>Time: </color><color=#ff00ff>${this.timer.toFixed(2)}</color>`;
        }
    }

    start() {
        this.node.on(Node.EventType.TOUCH_START, this._onClick, this);

        this._timerRichText = this.timerText.getComponent(RichText);
        this._scoreRichText = this.scoreText.getComponent(RichText);
        this.GameManager = this.GameManager.getComponent(gameManager);
    }

    update(deltaTime: number) {
        if (!this._gameStarted) {
            return;
        }

        this.timer -= deltaTime;

        if (this.timer <= 0) {
            this.timer = 0;
            this._gameStarted = false;

            if (this.GameManager) {
                this.GameManager.onRunFinished(this._score);
            }
            else
            {
                console.log("Game Manager is not assigned! Did not report final score.");
            }

            return;
        }

        if (this._timerRichText) {
            var timeText = `<color=#ff0000>Time: </color><color=#ff00ff>${this.timer.toFixed(2)}</color>`;
            this._timerRichText.string = timeText;
        }
    }

    private _onClick() {
        if (!this._gameStarted || this.timer <= 0) {
            return;
        }

        var newScore = this._score + 1;
        this._score = newScore;

        if (this._scoreRichText) {
            var scoreText = `<color=#00ff00>Score: </color><color=#0fffff>${newScore}</color>`;
            this._scoreRichText.string = scoreText;
        }
    }
}
