import { _decorator, Component, Node, RichText, Label } from 'cc';
import { gameManager } from '../gameManager';
import { playerData } from '../playerData'; // ✅ Import this
const { ccclass, property } = _decorator;

@ccclass('clicker')
export class clicker extends Component {

    @property(Node)
    public scoreText: Node = null;

    @property(Node)
    public timerText: Node = null;

    @property
    public defaultTime: number = 10; // Renamed to separate "config" from "current state"

    @property(Node)
    public GameManagerNode: Node = null; // Reference to the Node containing GameManager

    // Internal State
    private _gameManager: gameManager = null;
    private _playerData: playerData = null;
    private _score: number = 0;
    private _timer: number = 0;
    private _gameStarted: boolean = false;

    // Components
    private _timerRichText: RichText | Label = null; // Support both for safety
    private _scoreRichText: RichText | Label = null;

    start() {
        // 1. Setup Touch Listener
        this.node.on(Node.EventType.TOUCH_START, this._onClick, this);

        // 2. Get UI Components (Safety check for RichText vs Label)
        this._timerRichText = this.timerText.getComponent(RichText) || this.timerText.getComponent(Label);
        this._scoreRichText = this.scoreText.getComponent(RichText) || this.scoreText.getComponent(Label);

        // 3. Get GameManager Component
        if (this.GameManagerNode) {
            this._gameManager = this.GameManagerNode.getComponent(gameManager);
        }
    }

    // ✅ Called by GameManager before starting to pass upgrade levels
    public setPlayerData(data: playerData) {
        this._playerData = data;
    }

    public startGame() {
        this._gameStarted = true;
        this._score = 0;
        this._timer = this.defaultTime;

        this.updateUI(0, false); // Reset UI
    }

    update(deltaTime: number) {
        if (!this._gameStarted) return;

        this._timer -= deltaTime;

        if (this._timer <= 0) {
            this.finishGame();
            return;
        }

        // Update Timer UI
        if (this._timerRichText) {
            this._timerRichText.string = `<color=#ff0000>Time: </color><color=#ff00ff>${this._timer.toFixed(2)}</color>`;
        }
    }

    private finishGame() {
        this._timer = 0;
        this._gameStarted = false;

        if (this._gameManager) {
            this._gameManager.onRunFinished(this._score);
        } else {
            console.error("Game Manager not found! Score lost.");
        }
    }

    private _onClick() {
        if (!this._gameStarted || this._timer <= 0) return;

        // --- CALCULATION LOGIC ---
        
        // 1. Base Value (Default 1) + Upgrades
        let hitValue = 1;
        if (this._playerData) {
            // If you have lvl 5 upgrade, you get +5 points per tap
            hitValue += (this._playerData.currentClickPowerUpgrds || 0);
        }

        // 2. Crit Logic
        let isCrit = false;
        if (this._playerData) {
            const critChance = (this._playerData.currentCritsUpgrds || 0); // E.g., 5 = 5%
            const roll = Math.random() * 100;

            if (roll < critChance) {
                isCrit = true;
                hitValue *= 5; // Crits give 5x points!
                console.log("🔥 CRITICAL HIT!");
            }
        }

        // 3. Apply Score
        this._score += hitValue;
        this.updateUI(this._score, isCrit);
    }

    private updateUI(score: number, isCrit: boolean) {
        if (!this._scoreRichText) return;

        // If Crit, make text RED and BOLD. Normal is Cyan.
        const color = isCrit ? "#ff0000" : "#0fffff"; 
        const sizeTag = isCrit ? "<b>" : ""; // Optional bold for crit
        const sizeTagClose = isCrit ? "</b>" : "";

        // Using RichText formatting
        this._scoreRichText.string = `<color=#00ff00>Score: </color>${sizeTag}<color=${color}>${score}</color>${sizeTagClose}`;
    }
}