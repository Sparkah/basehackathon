import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('apiClient')
export class apiClient extends Component {

    @property
    public BaseUrl: string = 'https://basebackend-production-f4f9.up.railway.app';

    public async sendRunFinished(score: number) {
        try {
            var body = {
                walletAddress: 'anonymous', // later replace with real wallet from WalletConnect
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
                console.error('API error:', text);
                return;
            }

            var data = await response.json();
            console.log('Run saved:', data);
        } catch (e) {
            console.error('Failed to send run:', e);
        }
    }

    public async getAllRuns(): Promise<Array<{ walletAddress: string; score: number; createdAt: string; }>> {
        try {
            var response = await fetch(`${this.BaseUrl}/runs/all`, {
                method: 'GET',
            });

            if (!response.ok) {
                var text = await response.text();
                console.error('API error:', text);
                return [];
            }

            var data = await response.json();
            console.log('Fetched runs:', data);
            return data;
        } catch (e) {
            console.error('Failed to fetch runs:', e);
            return [];
        }
    }
}