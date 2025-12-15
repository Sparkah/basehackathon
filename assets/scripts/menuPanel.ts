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
    public viewNFTLeaderboardBtn: Button = null;

    @property(Button)
    public viewMyNFTButton: Button = null;

    start() {
        if (this.startGameBtn) {
            this.startGameBtn.node.on(Button.EventType.CLICK, this._onStartClicked, this);
        }
        if (this.viewNormalLeaderbiardBtn) {
            this.viewNormalLeaderbiardBtn.node.on(Button.EventType.CLICK, this._onViewNormalLeaderboardClicked, this);
        }
        if (this.viewNFTLeaderboardBtn) {
            this.viewNFTLeaderboardBtn.node.on(Button.EventType.CLICK, this._onViewNFTLeaderboardClicked, this);
        }
        if (this.viewMyNFTButton) {
            this.viewMyNFTButton.node.on(Button.EventType.CLICK, this._onviewMyNFTButton, this);
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
            this.GameManager.onNftLeaderboardClicked();
        }
    }

    private _onviewMyNFTButton() {
        if (this.GameManager) {
            this.GameManager.onMyNftsClicked();
        }
    }
}
