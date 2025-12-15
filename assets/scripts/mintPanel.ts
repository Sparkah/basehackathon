import { _decorator, Component, Node, Label, Button, RichText } from 'cc';
import { apiClient } from './apiClient';
import { gameManager } from './gameManager';
const { ccclass, property } = _decorator;

@ccclass('mintPanel')
export class mintPanel extends Component {
    @property(Label) titleLabel: Label = null;
    @property(Label) statusLabel: Label = null;
    @property(Button) mintButton: Button = null;
    @property(Button) closeButton: Button = null;
    
    // Dependencies
    private apiClient: apiClient = new apiClient();
    private gameManager: gameManager = null;
    private currentScore: number = 0;

    public init(manager: gameManager) {
        this.gameManager = manager;
    }

    public async show(score: number) {
        this.node.active = true;
        this.currentScore = score;
        
        // Reset UI
        this.titleLabel.string = `Score: ${score}`;
        this.statusLabel.string = "Checking blockchain...";
        this.mintButton.node.active = false;
        this.closeButton.node.active = false; // Hide until check finishes

        // Check Status
        const status = await this.apiClient.checkScoreStatus(score);

        this.closeButton.node.active = true; // Always allow exit

        if (status.available) {
            this.statusLabel.string = "✨ LEGENDARY! ✨\nThis score has never been minted.";
            this.mintButton.node.active = true; // Enable Minting
        } else {
            this.statusLabel.string = `🔒 Already Minted By:\n${status.owner || "Unknown"}`;
            this.mintButton.node.active = false;
        }
    }

    async onMintClicked() {
        this.statusLabel.string = "Minting... (Please wait)";
        this.mintButton.interactable = false;

        const result = await this.apiClient.mintScore(this.currentScore);

        if (result && result.success) {
            this.statusLabel.string = "✅ SUCCESS!\nYou own this score forever.";
            this.mintButton.node.active = false;
        } else {
            this.statusLabel.string = "❌ Failed.\nTry again later.";
            this.mintButton.interactable = true;
        }
    }

    onCloseClicked() {
        this.node.active = false;
        if (this.gameManager) {
            this.gameManager.showMenu();
        }
    }
}