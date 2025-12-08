import { _decorator, Component, Node, Button } from 'cc';
import { gameManager } from './gameManager';
const { ccclass, property } = _decorator;

@ccclass('menuPanel')
export class menuPanel extends Component {

    @property(gameManager)
    public GameManager: gameManager = null;

    @property(Button)
    public startGameBtn: Button = null;

    @property(Button)
    public viewNormalLeaderbiardBtn: Button = null;

    @property(Button)
    public viewNFTLeaderbiardBtn: Button = null;

    start() {
        if (this.startGameBtn) {
            this.startGameBtn.node.on(Button.EventType.CLICK, this._onStartClicked, this);
        }
        if(this.viewNormalLeaderbiardBtn) {
            this.viewNormalLeaderbiardBtn.node.on(Button.EventType.CLICK, this._onViewNormalLeaderboardClicked, this);
        }
        if(this.viewNFTLeaderbiardBtn) {
            this.viewNFTLeaderbiardBtn.node.on(Button.EventType.CLICK, this._onViewNFTLeaderboardClicked, this);
        }
    }

    private _onStartClicked() {
        if (this.GameManager) {
            this.GameManager.startGame();
        }
    }

    private _onViewNormalLeaderboardClicked() {
        if (this.GameManager) {
            this.GameManager.showNormalLeaderboard();
        }
    }

    private _onViewNFTLeaderboardClicked() {
        if (this.GameManager) {
            this.GameManager.showNFTLeaderboard();
        }
    }   
}
