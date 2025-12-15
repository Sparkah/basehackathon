import { _decorator, Component, Node, Label, Button, Prefab, instantiate, ScrollView } from 'cc';
import { apiClient } from './apiClient';
import { gameManager } from './gameManager';
const { ccclass, property } = _decorator;

@ccclass('nftPanel')
export class nftPanel extends Component {
    @property(Label) titleLabel: Label = null;
    @property(ScrollView) scrollView: ScrollView = null;
    @property(Prefab) itemPrefab: Prefab = null; // A simple node with a Label
    @property(Button) closeButton: Button = null;

    private apiClient: apiClient = new apiClient();
    private gameManager: gameManager = null;

    public init(manager: gameManager) {
        this.gameManager = manager;
        this.closeButton.node.on(Button.EventType.CLICK, this.onClose, this);
    }

    public async showMyCollection() {
        this.node.active = true;
        this.titleLabel.string = "My Collection";
        this.clearList();
        
        const nfts = await this.apiClient.getMyNfts();
        this.populateList(nfts, true);
    }

    public async showLeaderboard() {
        this.node.active = true;
        this.titleLabel.string = "Minted Leaderboard";
        this.clearList();

        const nfts = await this.apiClient.getNftLeaderboard();
        this.populateList(nfts, false);
    }

    private populateList(items: any[], isCollection: boolean) {
        if (!items || items.length === 0) {
            // Show "Empty" message?
            return;
        }

        items.forEach((item, index) => {
            const node = instantiate(this.itemPrefab);
            node.parent = this.scrollView.content;
            
            const label = node.getComponent(Label) || node.getComponentInChildren(Label);
            if (label) {
                if (isCollection) {
                    // Format: "Score: 150 (Minted Today)"
                    label.string = `🏆 Score: ${item.score}`;
                } else {
                    // Format: "#1 mrtimm - Score: 500"
                    const ownerName = item.owner?.username || "Unknown";
                    label.string = `#${index + 1} ${ownerName} - ${item.score}`;
                }
            }
        });
    }

    private clearList() {
        this.scrollView.content.removeAllChildren();
    }

    private onClose() {
        this.node.active = false;
        if (this.gameManager) this.gameManager.showMenu();
    }
}