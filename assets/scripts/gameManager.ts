import { _decorator, Component, Node } from 'cc';
import { clicker } from './gameplay/clicker';
import { apiClient } from './apiClient';
import { leaderboard } from './Leaderboard/leaderboard';
import { authPanel } from './auth/authPanel';
import { playerStatsPanel } from './menu/playerStatsPanel';
import { playerData } from './playerData';
import { mintPanel } from './mintPanel';
import { nftPanel } from './nftPanel'

const { ccclass, property } = _decorator;

@ccclass('gameManager')
export class gameManager extends Component {

    @property(Node) public GameplayPanel: Node = null;
    @property(Node) public MenuPanel: Node = null;
    @property(clicker) public Clicker: clicker = null;
    @property(authPanel) public authPanel: authPanel = null;
    @property(Node) public LeaderboardPanel: Node = null;
    @property(playerStatsPanel) public PlayerStatsPanel: playerStatsPanel = null;
    @property(mintPanel) public MintPanel: mintPanel = null;
    @property(nftPanel) public NftPanel: nftPanel = null;

    public ApiClient: apiClient = null;
    public playerData: playerData = null;

    start() {
        this.ApiClient = new apiClient();
        this.playerData = new playerData();

        // Load data once at start//
        this.authPanel.initMiniApp().then(() => {
            this.loadAndRefresh();
        });

        this.showMenu();
    }

    // Load data from server and refresh UI
    async loadAndRefresh() {
        await this.playerData.loadData();
        this.refreshUI();
    }

    // Refresh UI using current local data
    refreshUI() {
        if (this.PlayerStatsPanel) {
            this.PlayerStatsPanel.updateStats(this.playerData);
        }
        if (this.Clicker) {
            this.Clicker.setPlayerData(this.playerData);
        }
    }

    public startGame() {
        this.MenuPanel.active = false;
        this.GameplayPanel.active = true;
        this.authPanel.node.active = false;
        this.LeaderboardPanel.active = false;

        if (this.Clicker) {
            this.Clicker.setPlayerData(this.playerData);
            this.Clicker.startGame();
        }
    }

    public onRunFinished(finalScore: number) {
        console.log("Run ended. Score:", finalScore);

        // 1. OPTIMISTIC UPDATE: Update frontend immediately
        // We know the backend logic: Score = Coins. So we just add it locally.
        this.playerData.currentCoins += finalScore;
        this.refreshUI();

        // 2. BACKGROUND SYNC: Tell server to save it
        if (this.ApiClient) {
            this.ApiClient.sendRunFinished(finalScore).then(() => {
                console.log("Run synced to server.");
                // Optional: Fetch fresh data to ensure we are perfectly synced
                // this.playerData.loadData(); 
            });
        }

        // 3. Switch Panel Instantly
        this.GameplayPanel.active = false; // Hide game

        if (this.MintPanel) {
            this.MintPanel.init(this); // Pass reference so it can call showMenu() later
            this.MintPanel.show(finalScore);
        } else {
            // Fallback if panel isn't assigned
            this.showMenu();
        }
    }

    public showMenu() {
        this.MenuPanel.active = true;
        this.GameplayPanel.active = false;
        this.LeaderboardPanel.active = false;
        if (this.authPanel) this.authPanel.node.active = false;
    }

    public showNormalLeaderboard() {
        this.LeaderboardPanel.active = true;
        var comp = this.LeaderboardPanel.getComponent(leaderboard);
        if (comp && this.ApiClient) {
            this.ApiClient.getAllRuns().then(runs => comp.showLeaderboard(runs));
        }
        this.MenuPanel.active = false;
    }

    public onMyNftsClicked() {
        this.MenuPanel.active = false;
        this.NftPanel.init(this);
        this.NftPanel.showMyCollection();
    }

    public onNftLeaderboardClicked() {
        this.MenuPanel.active = false;
        this.NftPanel.init(this);
        this.NftPanel.showLeaderboard();
    }
}