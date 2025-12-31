import { _decorator, Component, Vec3, UITransform, tween } from 'cc';
const { ccclass } = _decorator;

@ccclass('FloatingCircle')
export class FloatingCircle extends Component {

    moveInterval = 0.5; // how often it moves in seconds
    moveRadius = 500;   // how far it can move around

    start() {
        this.schedule(this.moveRandomly, this.moveInterval);
    }

    moveRandomly() {
        const parent = this.node.parent;
        if (!parent) return;

        const ui = parent.getComponent(UITransform);
        if (!ui) return;

        const halfW = ui.width / 2;
        const halfH = ui.height / 2;

        const randomX = Math.random() * halfW * 2 - halfW;
        const randomY = Math.random() * halfH * 2 - halfH;

        const targetPos = new Vec3(randomX, randomY, 0);

        tween(this.node)
            .to(0.6, { position: targetPos }, { easing: 'sineInOut' })
            .start();

        

    }
}
