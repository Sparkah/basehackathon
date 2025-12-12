import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('walletPanel')
export class walletPanel extends Component {
    start() {
        // sdk.actions.signIn() - opens the sign transaction window
    }

    update(deltaTime: number) {

    }
}

