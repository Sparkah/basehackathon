import { _decorator, Component, Node, RichText, instantiate, Prefab, Button } from 'cc';
import { gameManager } from '../gameManager';
const { ccclass, property } = _decorator;

interface RunData {
    id: number;
    score: number;
    createdAt: string;
    user: {
        username: string;
        fid: number;
    };
}

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
            var itemNode = instantiate(this.DisplyPlayerPrefab);
            var rich = itemNode.getComponent(RichText);

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

    public showLeaderboard(runs: any[]) { 
        for (var i = 0; i < this._textComponents.length; i++) {
            var rich = this._textComponents[i];

            if (i >= runs.length) {
                rich.string = '';
                continue;
            }

            var run = runs[i];
            

            var displayName = run.user ? run.user.username : 'Unknown Player';
            
            var dateText = new Date(run.createdAt).toLocaleDateString();

            rich.string = `<color=#00ff00>${i + 1}.</color> ${displayName} - Score: <color=#ff0000>${run.score}</color>`;
        }
    }

    private _onBackClicked() {
        this.gameManagerNode.showMenu();
    }
}