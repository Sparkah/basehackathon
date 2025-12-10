import { _decorator, Component, Node } from 'cc';
import { clicker } from './gameplay/clicker';
import { apiClient } from './apiClient';
import { leaderboard } from './Leaderboard/leaderboard';
import { authPanel } from './auth/authPanel';

const { ccclass, property } = _decorator;

@ccclass('gameManager')
export class gameManager extends Component {

    @property(Node)
    public GameplayPanel: Node = null;

    @property(Node)
    public MenuPanel: Node = null;

    @property(clicker)
    public Clicker: clicker = null;

    @property(authPanel)
    public authPanel: authPanel = null;

    public ApiClient: apiClient = null;

    @property(Node)
    public LeaderboardPanel: Node = null;

    start() {
        this.ApiClient = new apiClient();
        this.authPanel.loginSequence();

        if (this.MenuPanel) {
            this.MenuPanel.active = true;
        }

        if (this.GameplayPanel) {
            this.GameplayPanel.active = false;
        }
    }

    public showMenu() {
        if (this.MenuPanel) {
            this.MenuPanel.active = true;
        }

        if (this.GameplayPanel) {
            this.GameplayPanel.active = false;
        }

        if (this.authPanel) {
            this.authPanel.node.active = false;
        }

        if (this.LeaderboardPanel) {
            this.LeaderboardPanel.active = false;
        }
    }

    public startGame() {
        if (this.MenuPanel) {
            this.MenuPanel.active = false;
        }

        if (this.GameplayPanel) {
            this.GameplayPanel.active = true;
        }

        if (this.authPanel) {
            this.authPanel.node.active = false;
        }

        if (this.Clicker) {
            this.Clicker.startGame();
        }

        if (this.LeaderboardPanel) {
            this.LeaderboardPanel.active = false;
        }
    }

    public onRunFinished(finalScore: number) {
        console.log("Run ended with score:", finalScore);

        // Send score to backend here
        if (this.ApiClient) {
            this.ApiClient.sendRunFinished(finalScore);
        }

        // Update UI panels
        if (this.GameplayPanel) {
            this.GameplayPanel.active = false;
        }

        if (this.MenuPanel) {
            this.MenuPanel.active = true;
        }
    }

    public showNormalLeaderboard() {
        console.log("Show Normal Leaderboard clicked");
        if (this.LeaderboardPanel) {
            this.LeaderboardPanel.active = true;
            var leaderboardComp = this.LeaderboardPanel.getComponent(leaderboard);
            if (leaderboardComp && this.ApiClient) {
                this.ApiClient.getAllRuns().then(runs => {
                    leaderboardComp.showLeaderboard(runs);
                });
            }
        }

        if (this.MenuPanel) {
            this.MenuPanel.active = false;
        }
    }

    public showNFTLeaderboard() {
        console.log("Show NFT Leaderboard clicked");
    }
}