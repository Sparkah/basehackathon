import { _decorator, Component, Node, Label, Button } from 'cc';
import { apiClient } from './apiClient';
import { gameManager } from './gameManager';
const { ccclass, property } = _decorator;

@ccclass('mintPanel')
export class mintPanel extends Component {
    @property(Label) titleLabel: Label = null;
    @property(Label) statusLabel: Label = null;
    @property(Button) mintButton: Button = null;
    @property(Button) closeButton: Button = null;

    private apiClient: apiClient = new apiClient();
    private gameManager: gameManager = null;
    private currentScore: number = 0;

    public init(manager: gameManager) {
        this.gameManager = manager;
        this.mintButton.node.on(Button.EventType.CLICK, this.onMintClicked, this);
        this.closeButton.node.on(Button.EventType.CLICK, this.onCloseClicked, this);
    }

    public async show(score: number) {
        this.node.active = true;
        this.currentScore = score;

        this.titleLabel.string = `Score: ${score}`;
        this.statusLabel.string = "Checking status...";
        this.mintButton.node.active = false;
        this.closeButton.node.active = true;

        const status = await this.apiClient.checkScoreStatus(score);

        if (status.available) {
            this.statusLabel.string = "✨ LEGENDARY SCORE! ✨\nTap to Mint NFT";
            this.mintButton.node.active = true;
            this.mintButton.interactable = true;
        } else {
            this.statusLabel.string = `🔒 Taken By:\n${status.owner || "Unknown"}`;
            this.mintButton.node.active = false;
        }
    }

    async onMintClicked() {
        this.mintButton.interactable = false;

        const currentWallet = this.gameManager.playerData.walletAddress;
        console.log("🔍 Mint Clicked. Wallet Address:", currentWallet);

        const hasValidWallet = currentWallet && currentWallet.startsWith("0x");

        if (!hasValidWallet) {
            this.statusLabel.string = "Connecting Wallet...";
            console.log("🚀 Starting Wallet Connection Flow...");

            const success = await this.connectWalletFlow();

            if (!success) {
                this.statusLabel.string = "❌ Wallet Required to Mint";
                this.mintButton.interactable = true;
                return; // STOP HERE
            }
        }

        // Only proceeds here if we have a valid 0x address
        this.statusLabel.string = "Minting NFT... (Please Wait)";
        const result = await this.apiClient.mintScore(this.currentScore);

        if (result && result.success) {
            this.statusLabel.string = "✅ SUCCESS!\nYou own this score.";
            this.mintButton.node.active = false;
        } else {
            console.error("Mint Error:", result);
            this.statusLabel.string = "❌ Mint Failed. Try again.";
            this.mintButton.interactable = true;
        }
    }

    async connectWalletFlow(): Promise<boolean> {
        // Use the workaround to get the SDK
        const sdk = (window as any).miniapp?.actions ? (window as any).miniapp : (window as any).miniapp?.default;

        if (!sdk) {
            console.error("❌ Base SDK not found");
            return false;
        }

        try {
            console.log("📱 Opening Base Sign In...");
            const result = await sdk.actions.signIn({
                nonce: Math.random().toString(36).substring(2)
            });

            console.log("✅ SDK Sign In Result:", result);

            const match = result.message.match(/0x[a-fA-F0-9]{40}/);
            const address = match ? match[0] : null;

            if (address) {
                // Link to Backend
                await this.apiClient.linkWallet(address);
                // Update Local Data immediately
                this.gameManager.playerData.walletAddress = address;
                return true;
            }
        } catch (error) {
            console.error("❌ Connect failed:", error);
        }
        return false;
    }

    onCloseClicked() {
        this.node.active = false;
        if (this.gameManager) this.gameManager.showMenu();
    }
}