import { _decorator, Component, Node } from 'cc';
import { clicker } from './clicker';
import { walletPanel } from './walletPanel';

const { ccclass, property } = _decorator;

@ccclass('gameManager')
export class gameManager extends Component {

    @property(Node)
    public GameplayPanel: Node = null;

    @property(Node)
    public MenuPanel: Node = null;

    @property(clicker)
    public Clicker: clicker = null;

    @property(Node)
    public WalletPannel: Node = null;

    start() {
        if (this.MenuPanel) {
            this.MenuPanel.active = true;
        }

        if (this.GameplayPanel) {
            this.GameplayPanel.active = false;
        }
    }

    public startGame() {
        if (this.MenuPanel) {
            this.MenuPanel.active = false;
        }

        if (this.GameplayPanel) {
            this.GameplayPanel.active = true;
        }

        if (this.WalletPannel) {
            this.WalletPannel.active = false;
        }

            if (this.Clicker) {
                this.Clicker.startGame();
            }
    }

    public onRunFinished(finalScore: number) {
    console.log("Run ended with score:", finalScore);

    if (this.GameplayPanel) {
        this.GameplayPanel.active = false;
    }

    if (this.MenuPanel) {
        this.MenuPanel.active = true;
    }

    // TODO: send score to backend here
}
}
