import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('authPanel')
export class authPanel extends Component {

    public async signInWithBase() {
        const sdk = (window as any).miniapp;

        if (!sdk) {
            console.error("SDK not found on window.miniapp");
            return;
        }

        console.log("SDK Found:", sdk);

        try {
            if (sdk.actions) {
                await sdk.actions.ready();
            } else if (sdk.sdk && sdk.sdk.actions) {
                await sdk.sdk.actions.ready();
            }
            console.log("MiniApp Ready!");
        } catch (e) {
            console.error("SDK Error:", e);
        }
    }

    async loginSequence() {
        const sdk = (window as any).miniapp;

        // 1. Get Nonce from Backend
        const nonceRes = await fetch('https://basebackend-production-f4f9.up.railway.app/auth/nonce');
        const { nonce } = await nonceRes.json();

        // 2. Request Signature from Farcaster (SIWF)
        const result = await sdk.actions.signIn({ nonce });

        if (result.error) {
            console.error("User rejected login");
            return;
        }

        // 3. Verify on Backend & Get Session Token
        const loginRes = await fetch('https://basebackend-production-f4f9.up.railway.app/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: result.message,
                signature: result.signature,
                nonce: nonce
            })
        });

        const { accessToken } = await loginRes.json();
        console.log("Logged in! Token:", accessToken);

        // 4. Store Token for future API calls
        localStorage.setItem('auth_token', accessToken);
    }
}