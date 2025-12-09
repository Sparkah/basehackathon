import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('authPanel')
export class authPanel extends Component {

    public async signInWithBase() {
        // Now we can access it directly via the window property we just forced
        const sdk = (window as any).miniapp;

        if (!sdk) {
            console.error("❌ SDK not found on window.miniapp");
            return;
        }

        console.log("✅ SDK Found:", sdk);
        
        try {
            // Note: Depending on the specific version, 'actions' might be directly on sdk
            // or inside sdk.sdk. Check the console log to be sure.
            if (sdk.actions) {
                await sdk.actions.ready();
            } else if (sdk.sdk && sdk.sdk.actions) {
                // Sometimes the bundle wraps it in an extra object
                await sdk.sdk.actions.ready();
            }
            console.log("MiniApp Ready!");
        } catch (e) {
            console.error("SDK Error:", e);
        }
    }
}