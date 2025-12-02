// import { _decorator, Component, Node, tween, Vec3 } from 'cc';
// const { ccclass, property } = _decorator;

// @ccclass('WheelRotate')
// export class WheelRotate extends Component {

//     @property(Node)
//     wheel: Node = null;

//     start() {
//         // Continuous rotation
//         tween(this.wheel)
//             .by(10, { eulerAngles: new Vec3(0, 0, -360) }) // rotate 360 degrees per 10 second
//             .repeatForever()
//             .start();

//     }
// }


import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WheelRotate')
export class WheelRotate extends Component {

    private spinTween = null;

    start() {
        this.spinTween = tween(this.node)
            .by(10, { eulerAngles: new Vec3(0, 0, -360) })
            .repeatForever()
            .start();
    }

    stopWheel() {
        if (this.spinTween) {
            this.spinTween.stop();
        }
    }

    getPrizeFromAngle(angle: number): string {
        let a = ((angle % 360) + 360) % 360;

        if (a >= 22.5 && a < 67.5) return "$5";
        if (a >= 67.5 && a < 112.5) return "$1";
        if (a >= 112.5 && a < 157.5) return "$1";
        if (a >= 157.5 && a < 202.5) return "$10";
        if (a >= 202.5 && a < 247.5) return "Bomb";
        if (a >= 247.5 && a < 292.5) return "PiggyBank";
        if (a >= 292.5 && a < 337.5) return "Amazon";
        if (a >= 337.5 || a < 22.5) return "PayPal";

        return "Unknown";
    }
}



