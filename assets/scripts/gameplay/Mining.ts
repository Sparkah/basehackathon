import { _decorator, Component, tween, Vec3} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Mining')
export class Mining extends Component {
    playMine() {
        tween(this.node)
            .to(0.05, { rotation: new Vec3(0, 0, -15) })
            .to(0.05, { rotation: new Vec3(0, 0, 0) })
            .start();
    }

    update(deltaTime: number) {
        
    }
}

