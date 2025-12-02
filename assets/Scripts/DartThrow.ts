import { _decorator, Component, Node, UITransform, tween, Vec3, Input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DartThrow')
export class DartThrow extends Component {

    @property(Node)
    wheel: Node = null;

    @property([Node])
    prizeNodes: Node[] = []; 

    onLoad() {
        // For both mobile and desktop
        this.node.on(Input.EventType.TOUCH_START, this.throwDart, this);
        this.node.on(Input.EventType.MOUSE_DOWN, this.throwDart, this);
    }

    throwDart() {
        if (!this.prizeNodes.length) {
            console.warn("No prize nodes assigned!");
            return;
        }

        // Pick a random prize node
        const randomIndex = Math.floor(Math.random() * this.prizeNodes.length);
        const targetNode = this.prizeNodes[randomIndex];

        // Get world position
        const worldPos = targetNode.getWorldPosition();

        // Convert world position to dart's parent space
        const uiTransform = this.node.parent.getComponent(UITransform);
        if (!uiTransform) {
            console.error("Parent node needs a UITransform!");
            return;
        }

        const localPos = uiTransform.convertToNodeSpaceAR(worldPos);

        // Tween dart to target position
        tween(this.node)
            .to(0.5, { position: localPos }) // Adjust duration as needed
            .call(() => {
                this.onHit(targetNode);
            })
            .start();
    }

    onHit(targetNode: Node) {
        const wheelScript = this.wheel.getComponent("WheelRotate");
        if (wheelScript) {
            wheelScript.stopWheel();
        }

        const prize = targetNode.name;
        console.log("🎯 Prize Won:", prize);
    }
}
