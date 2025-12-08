import { _decorator, Component, Node, RichText, instantiate, Prefab } from 'cc';
const { ccclass, property } = _decorator;
import { Button } from 'cc';
import { gameManager } from '../gameManager';

@ccclass('leaderboard')
export class leaderboard extends Component {

    @property(Prefab)
    public DisplyPlayerPrefab: Prefab = null;

    @property(Button)
    public backBtn: Button = null;

    @property(gameManager)
    public gameManagerNode: gameManager = null;

    private _textNodes: Node[] = [];
    private _textComponents: RichText[] = [];

    private _maxLeaders: number = 100;

    start() {
        if (!this.DisplyPlayerPrefab) {
            console.error('DisplyPlayerPrefab is not set');
            return;
        }

        if (this.backBtn) {
            this.backBtn.node.on(Button.EventType.CLICK, this._onBackClicked, this);
        }

        for (var i = 0; i < this._maxLeaders; i++) {
            var itemNode = instantiate(this.DisplyPlayerPrefab); // Node
            var rich = itemNode.getComponent(RichText);          // RichText

            if (!rich) {
                console.error('Prefab has no RichText component');
                continue;
            }

            rich.string = '';
            this._textNodes.push(itemNode);
            this._textComponents.push(rich);

            this.node.addChild(itemNode);
        }
    }

    public showLeaderboard(runs: Array<{ walletAddress: string; score: number; createdAt: string; }>) {
        for (var i = 0; i < this._textComponents.length; i++) {
            var rich = this._textComponents[i];

            if (i >= runs.length) {
                rich.string = '';
                continue;
            }

            var run = runs[i];
            var dateText = new Date(run.createdAt).toLocaleDateString();

            rich.string = `${i + 1}. ${run.walletAddress} - Score: ${run.score} - Date: ${dateText}`;
        }
    }

    private _onBackClicked() {
        this.gameManagerNode.showMenu();
    }
}