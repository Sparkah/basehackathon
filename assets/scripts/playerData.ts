import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('playerData') // Note: Class name should match file usually
export class playerData extends Component {
    public currentCoins: number = 0;
    public currentCritsUpgrds: number = 0;
    public currentClickPowerUpgrds: number = 0;

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

            // ✅ FIX: Match Backend JSON Keys exactly
            this.currentCoins = data.coins || 0;
            this.currentCritsUpgrds = data.critUpgrades || 1;   // Backend sends 'critUpgrades'
            this.currentClickPowerUpgrds = data.valueUpgrades || 1; // Backend sends 'valueUpgrades'

            console.log("✅ Data Sync:", this.currentCoins, this.currentCritsUpgrds, this.currentClickPowerUpgrds);
        } catch (error) {
            console.error("Error loading player data:", error);
        }
    }
}