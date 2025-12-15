import { _decorator, Component, Label, Button } from 'cc';
import { apiClient } from './apiClient'; // Ensure this path is correct
const { ccclass, property } = _decorator;

@ccclass('walletPanel')
export class walletPanel extends Component {

    @property(Label) statusLabel: Label = null;
    @property(Button) connectButton: Button = null;

    private apiClient: apiClient = new apiClient();

    start() {
        // Init SDK when panel loads
        const sdk = this.getFarcasterSDK();
        if (sdk) {
            sdk.actions.ready();
        }

        if (this.connectButton) {
            this.connectButton.node.on(Button.EventType.CLICK, this.onConnectClicked, this);
        }
    }

    async onConnectClicked() {
        const sdk = this.getFarcasterSDK();
        if (!sdk) {
            this.updateStatus("❌ Error: Run in Base App");
            return;
        }

        try {
            this.updateStatus("Requesting Wallet...");

            // 1. Trigger Native Sign In
            // This opens the Base Wallet bottom sheet
            const result = await sdk.actions.signIn({
                nonce: this.generateNonce()
            });

            console.log("✅ Sign In Result:", result);

            // 2. Extract Address from the SIWE Message
            // The message looks like: "sepolia.base.org wants you to sign in with... 0x123..."
            const address = this.extractAddressFromMessage(result.message);

            if (!address) {
                this.updateStatus("❌ Could not find address");
                return;
            }

            this.updateStatus("Linking to Account...");

            // 3. Send to Backend to Save
            const linkResult = await this.apiClient.linkWallet(address);

            if (linkResult.success) {
                this.updateStatus(`✅ Linked: ${address.substring(0, 6)}...`);
                this.connectButton.node.active = false; // Hide button on success
            } else {
                this.updateStatus("❌ Backend Link Failed");
            }

        } catch (error) {
            console.error("Sign In Error:", error);
            this.updateStatus("❌ Connection Cancelled");
        }
    }

    // --- Helpers ---

    // 1. Safe SDK Access (The workaround)
    private getFarcasterSDK() {
        const raw = (window as any).miniapp;
        if (!raw) return null;
        if (raw.actions) return raw;
        if (raw.default && raw.default.actions) return raw.default;
        return null;
    }

    // 2. Parse the SIWE message to find the 0x address
    private extractAddressFromMessage(message: string): string | null {
        // Regex to find the Ethereum address in the message
        const match = message.match(/0x[a-fA-F0-9]{40}/);
        return match ? match[0] : null;
    }

    private generateNonce() {
        return Math.random().toString(36).substring(2, 15);
    }

    private updateStatus(msg: string) {
        if (this.statusLabel) this.statusLabel.string = msg;
    }
}