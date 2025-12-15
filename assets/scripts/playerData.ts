import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('playerData')
export class playerData extends Component {
    public currentCoins: number = 0;
    public currentCritsUpgrds: number = 0;
    public currentClickPowerUpgrds: number = 0;
    public walletAddress: string = null;

    public async loadData() {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            const response = await fetch('https://basebackend-production-f4f9.up.railway.app/users/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`Status: ${response.status}`);

            const data = await response.json();
            
            this.currentCoins = data.coins || 0;
            this.currentCritsUpgrds = data.critUpgrades || 0;
            this.currentClickPowerUpgrds = data.valueUpgrades || 0;
            this.walletAddress = data.walletAddress || null;

            console.log("✅ Data Loaded. Wallet:", this.walletAddress);
        } catch (error) {
            console.error("Error loading player data:", error);
        }
    }
}