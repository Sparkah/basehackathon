import { _decorator, Component, Label, instantiate, ScrollView, Sprite, ImageAsset, SpriteFrame, Texture2D, Prefab, Button } from 'cc';
import { apiClient } from './apiClient';
import { gameManager } from './gameManager';
const { ccclass, property } = _decorator;

@ccclass('nftPanel')
export class nftPanel extends Component {
    @property(Label) titleLabel: Label = null;
    @property(ScrollView) scrollView: ScrollView = null;
    @property(Prefab) itemPrefab: Prefab = null;
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
        this.populateList(await this.apiClient.getMyNfts(), true);
    }

    public async showLeaderboard() {
        this.node.active = true;
        this.titleLabel.string = "Leaderboard";
        this.populateList(await this.apiClient.getNftLeaderboard(), false);
    }

    private populateList(items: any[], isCollection: boolean) {
        this.scrollView.content.removeAllChildren();
        if (!items || items.length === 0) return;

        items.forEach((item, index) => {
            const node = instantiate(this.itemPrefab);
            node.parent = this.scrollView.content;

            // ✅ FIX 1: Check the ROOT node first
            // Your prefab root IS the label, so we get it directly.
            let labelComp = node.getComponent(Label);

            // Fallback: If root isn't a label, look in children
            if (!labelComp) labelComp = node.getComponentInChildren(Label);

            if (labelComp) {
                const text = isCollection
                    ? `🏆 Score: ${item.score}`
                    : `#${index + 1} ${item.owner?.username || "Anon"} - ${item.score}`;
                labelComp.string = text;
            } else {
                console.error("❌ Label component missing on Prefab Root!");
            }

            // ✅ FIX 2: Find Icon (It is a child named "Icon")
            const iconNode = node.getChildByName("Icon");
            if (iconNode) {
                const sprite = iconNode.getComponent(Sprite);
                // Ensure we have valid image data before trying to load
                if (item.imageUrl && item.imageUrl.startsWith("data:image")) {
                    this.loadBase64Image(sprite, item.imageUrl);
                }
            }
        });
    }

    private loadBase64Image(sprite: Sprite, base64String: string) {
        const img = new Image();
        img.src = base64String;
        img.onload = () => {
            const imgAsset = new ImageAsset(img);
            const texture = new Texture2D();
            texture.image = imgAsset;
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            sprite.spriteFrame = spriteFrame;
        };
        img.onerror = () => {
            console.warn("⚠️ Failed to load image data");
        };
    }

    private onClose() {
        this.node.active = false;
        if (this.gameManager) this.gameManager.showMenu();
    }
}