import { _decorator, Component, Node, Button, Label, RichText, Sprite, Color, tween, v3 } from 'cc';
import { playerData } from '../playerData';
import { apiClient } from '../apiClient';
const { ccclass, property } = _decorator;

// Constants (Must match Backend)
const BASE_TAP_COST = 50;
const TAP_MULT = 1.4;
const BASE_CRIT_COST = 200; 
const CRIT_MULT = 1.8;

@ccclass('playerStatsPanel')
export class playerStatsPanel extends Component {
    @property(Node) public coinsText: Node = null;
    @property(Node) public critText: Node = null;
    @property(Node) public incomeText: Node = null;
    @property(Button) public critUpgradeBtn: Button = null;
    @property(Button) public tapValueUpgradeBtn: Button = null;

    private apiClient: apiClient = new apiClient();
    private _data: playerData = null;

    start() {
        if (this.critUpgradeBtn)
            this.critUpgradeBtn.node.on(Button.EventType.CLICK, this.onBuyCrit, this);
        if (this.tapValueUpgradeBtn)
            this.tapValueUpgradeBtn.node.on(Button.EventType.CLICK, this.onBuyValue, this);
    }

    async onBuyCrit() {
        if (!this._data) return;
        const cost = this.calculateCost(this._data.currentCritsUpgrds || 1, BASE_CRIT_COST, CRIT_MULT);
        
        // 1. Validation
        if (this._data.currentCoins < cost) {
            this.flashButton(this.critUpgradeBtn.node, new Color(255, 0, 0)); // Flash RED
            return;
        }

        // 2. Optimistic Update (Immediate)
        this._data.currentCoins -= cost;
        this._data.currentCritsUpgrds += 1;
        this.updateStats(this._data); // Update UI instantly
        this.flashButton(this.critUpgradeBtn.node, new Color(0, 255, 0)); // Flash GREEN

        // 3. Background Sync
        const result = await this.apiClient.upgradeCrit();
        
        // 4. Rollback if server failed (Safety Net)
        if (!result || result.error) {
            console.error("Upgrade failed on server, rolling back");
            this._data.currentCoins += cost;
            this._data.currentCritsUpgrds -= 1;
            this.updateStats(this._data);
            this.flashButton(this.critUpgradeBtn.node, new Color(255, 0, 0));
        }
    }

    async onBuyValue() {
        if (!this._data) return;
        const cost = this.calculateCost(this._data.currentClickPowerUpgrds || 1, BASE_TAP_COST, TAP_MULT);

        if (this._data.currentCoins < cost) {
            this.flashButton(this.tapValueUpgradeBtn.node, new Color(255, 0, 0)); // Flash RED
            return;
        }

        // Optimistic Update
        this._data.currentCoins -= cost;
        this._data.currentClickPowerUpgrds += 1;
        this.updateStats(this._data); // Update UI instantly
        this.flashButton(this.tapValueUpgradeBtn.node, new Color(0, 255, 0)); // Flash GREEN

        // Background Sync
        const result = await this.apiClient.upgradeTapValue();

        if (!result || result.error) {
            console.error("Upgrade failed on server, rolling back");
            this._data.currentCoins += cost;
            this._data.currentClickPowerUpgrds -= 1;
            this.updateStats(this._data);
            this.flashButton(this.tapValueUpgradeBtn.node, new Color(255, 0, 0));
        }
    }

    public updateStats(data: playerData) {
        this._data = data; 

        // 1. Update Top Stats
        this.setText(this.coinsText, `Coins: ${data.currentCoins}`);
        this.setText(this.critText, `Crit Chance: ${data.currentCritsUpgrds}%`);
        this.setText(this.incomeText, `Tap Power: ${data.currentClickPowerUpgrds}`);

        // 2. Update Button Labels (Cost & Name)
        const nextCritCost = this.calculateCost(data.currentCritsUpgrds || 1, BASE_CRIT_COST, CRIT_MULT);
        const nextTapCost = this.calculateCost(data.currentClickPowerUpgrds || 1, BASE_TAP_COST, TAP_MULT);

        this.setButtonLabel(this.critUpgradeBtn, `Upgrade Crit\n(${nextCritCost})`);
        this.setButtonLabel(this.tapValueUpgradeBtn, `Upgrade Power\n(${nextTapCost})`);
    }

    // --- HELPERS ---
    private calculateCost(level: number, base: number, mult: number): number {
        return Math.floor(base * Math.pow(mult, level - 1));
    }

    private setText(node: Node, text: string) {
        if (!node) return;
        let lbl = node.getComponent(Label) || node.getComponent(RichText);
        if (lbl) lbl.string = text;
    }

    private setButtonLabel(btn: Button, text: string) {
        if (!btn) return;
        let lbl = btn.getComponentInChildren(Label) || btn.getComponentInChildren(RichText);
        if (lbl) lbl.string = text;
    }

    private flashButton(node: Node, color: Color) {
        const sprite = node.getComponent(Sprite);
        if (!sprite) return;
        const originalColor = new Color(255, 255, 255); 
        tween(sprite)
            .to(0.1, { color: color })
            .delay(0.2)
            .to(0.3, { color: originalColor })
            .start();
    }
}