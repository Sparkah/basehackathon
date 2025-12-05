import { _decorator, Component, Node, Button } from 'cc';
import { gameManager } from './gameManager';
const { ccclass, property } = _decorator;

@ccclass('menuPanel')
export class menuPanel extends Component {

    @property(gameManager)
    public GameManager: gameManager = null;

    @property(Button)
    public startGameBtn: Button = null;

    start() {
        if (this.startGameBtn) {
            this.startGameBtn.node.on(Button.EventType.CLICK, this._onStartClicked, this);
        }
    }

    private _onStartClicked() {
        if (this.GameManager) {
            this.GameManager.startGame();
        }
    }
}
