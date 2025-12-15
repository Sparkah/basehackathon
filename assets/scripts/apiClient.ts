import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

interface RunData {
    id: number;
    score: number;
    createdAt: string;
    user: {
        username: string;
        fid: number;
    };
}

@ccclass('apiClient')
export class apiClient extends Component {

    @property
    public BaseUrl: string = 'https://basebackend-production-f4f9.up.railway.app';

    public async sendRunFinished(score: number): Promise<number> {
        try {
            let fid = Number(localStorage.getItem('user_fid'));

            if (!fid) {
                const sdk = (window as any).miniapp;
                if (sdk) {
                    const context = await sdk.context;
                    if (context && context.user) {
                        fid = context.user.fid;
                    }
                }
            }

            if (!fid || fid === 0) {
                console.error("❌ Fatal Error: No FID found in Storage or Context. Cannot save run.");
                return;
            }

            console.log(`🚀 Sending run for FID: ${fid}, Score: ${score}`);

            var body = {
                fid: fid,
                score: score,
            };

            var response = await fetch(`${this.BaseUrl}/runs/finish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                var text = await response.text();
                console.error('❌ API error:', text);
                return;
            }

            var data = await response.json();
            console.log('✅ Run saved:', data);
        } catch (e) {
            console.error('❌ Failed to send run:', e);
        }
    }

    public async getAllRuns(): Promise<RunData[]> {
        try {
            var response = await fetch(`${this.BaseUrl}/runs/all`, {
                method: 'GET',
            });

            if (!response.ok) {
                var text = await response.text();
                console.error('❌ API error:', text);
                return [];
            }

            var data: RunData[] = await response.json();

            if (data.length > 0) console.log('Fetched first run:', data[0]);

            return data;
        } catch (e) {
            console.error('❌ Failed to fetch runs:', e);
            return [];
        }
    }

    public async upgradeCrit(): Promise<any> {
        return this._callUpgradeEndpoint('/users/upgradecrit');
    }

    public async upgradeTapValue(): Promise<any> {
        return this._callUpgradeEndpoint('/users/upgradevalue');
    }

    public async checkScoreStatus(score: number) {
        try {
            const response = await fetch(`${this.BaseUrl}/nft/check/${score}`);
            return await response.json();
        } catch (e) {
            console.error("Check score failed", e);
            return { available: false, owner: "Error" };
        }
    }

    public async mintScore(score: number) {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${this.BaseUrl}/nft/mint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ score })
            });
            return await response.json();
        } catch (e) {
            console.error("Minting failed", e);
            return { error: e };
        }
    }

    public async linkWallet(address: string) {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return { success: false };

            const response = await fetch(`${this.BaseUrl}/users/link-wallet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ walletAddress: address })
            });

            return await response.json();
        } catch (e) {
            console.error("Link wallet failed:", e);
            return { success: false };
        }
    }

    public async getMyNfts() {
        return this.authenticatedGet('/nft/my-nfts');
    }

    public async getNftLeaderboard() {
        return this.authenticatedGet('/nft/leaderboard');
    }

    private async authenticatedGet(endpoint: string) {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${this.BaseUrl}${endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (e) {
            console.error("API Error", e);
            return [];
        }
    }

    private async _callUpgradeEndpoint(endpoint: string) {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return null;

            const response = await fetch(`${this.BaseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Body is empty now because backend reads from Token
            });

            if (!response.ok) {
                console.error("Upgrade failed:", await response.text());
                return null;
            }

            return await response.json();
        } catch (e) {
            console.error("Upgrade error:", e);
            return null;
        }
    }
}