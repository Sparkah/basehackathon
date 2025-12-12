import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('authPanel')
export class authPanel extends Component {

    async initMiniApp() {
        const sdk = this.getFarcasterSDK();

        if (!sdk) {
            console.error("❌ SDK not found. Are you in a browser?");
            return;
        }

        console.log("✅ SDK Found. Initializing...");

        try {
            await sdk.actions.ready();
            console.log("✅ sent sdk.actions.ready()");

            await this.silentLogin(sdk);

        } catch (e) {
            console.error("❌ SDK Init Error:", e);
        }
    }

    async silentLogin(sdk: any) {
        try {
            console.log("🕵️ Starting Silent Login...");

            const context = await sdk.context;

            if (context && context.user) {
                console.log("👤 User Context Found:", context.user.username);
                await this.loginToBackend(context.user);
            } else {
                console.warn("⚠️ No user context found. (Running outside Farcaster?)");
            }
        } catch (e) {
            console.error("❌ Silent login error:", e);
        }
    }

    async loginToBackend(userContext: any) {
        try {
            const response = await fetch('https://basebackend-production-f4f9.up.railway.app/auth/login-silent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fid: userContext.fid,
                    username: userContext.username,
                    displayName: userContext.displayName,
                    pfpUrl: userContext.pfpUrl
                })
            });

            if (!response.ok) {
                throw new Error(`Backend Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("🔐 Backend Auth Success! Token:", data.accessToken);

            // Save token
            localStorage.setItem('auth_token', data.accessToken);
            localStorage.setItem('user_fid', userContext.fid.toString());
        } catch (error) {
            console.error("❌ Backend connection failed:", error);
        }
    }

    private getFarcasterSDK() {
        const raw = (window as any).miniapp;
        if (!raw) return null;
        if (raw.actions) return raw;
        if (raw.default && raw.default.actions) return raw.default;
        if (raw.sdk && raw.sdk.actions) return raw.sdk;
        return null;
    }
}