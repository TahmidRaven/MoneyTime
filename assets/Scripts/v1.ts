import { _decorator, Component, Node, UITransform, tween, Vec3, Input, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DartThrow')
export class DartThrow extends Component {

    @property(Node)
    wheel: Node = null;

    @property([Node])
    prizeNodes: Node[] = []; 

    @property(Label)
    throwsLeftLabel: Label = null;

    @property(Label)
    prizeResultLabel: Label = null;

    private throwsLeft: number = 3;
    private prizes: string[] = [];
    private isThrowing: boolean = false;

    onLoad() {
        // For both mobile and desktop
        this.node.on(Input.EventType.TOUCH_START, this.throwDart, this);
        this.node.on(Input.EventType.MOUSE_DOWN, this.throwDart, this);
        this.updateUI();
    }

    throwDart() {
        // Prevent throwing if already in progress or no throws left
        if (this.isThrowing || this.throwsLeft <= 0) {
            return;
        }

        if (!this.prizeNodes.length) {
            console.warn("No prize nodes assigned!");
            return;
        }

        this.isThrowing = true;

        // Pick a random prize node
        const randomIndex = Math.floor(Math.random() * this.prizeNodes.length);
        const targetNode = this.prizeNodes[randomIndex];

        // Get world position
        const worldPos = targetNode.getWorldPosition();

        // Convert world position to dart's parent space
        const uiTransform = this.node.parent.getComponent(UITransform);
        if (!uiTransform) {
            console.error("Parent node needs a UITransform!");
            this.isThrowing = false;
            return;
        }

        const localPos = uiTransform.convertToNodeSpaceAR(worldPos);

        // Store start position for reset
        const startPos = new Vec3(this.node.position);

        // Tween dart to target position
        tween(this.node)
            .to(0.5, { position: localPos })
            .call(() => {
                // Only register the hit after the dart reaches its destination
                this.onHit(targetNode);
            })
            .delay(0.5) // Wait a bit to show the result
            .to(0.3, { position: startPos }) // Return dart to start position
            .call(() => {
                this.isThrowing = false;
                
                // Check if game is over
                if (this.throwsLeft <= 0) {
                    this.endGame();
                }
            })
            .start();
    }

    onHit(targetNode: Node) {
        const prize = targetNode.name;
        this.prizes.push(prize);
        this.throwsLeft--;

        console.log(`🎯 Prize ${this.prizes.length} Won:`, prize);
        
        this.updateUI();

        // Stop wheel after last throw
        if (this.throwsLeft <= 0) {
            const wheelScript = this.wheel.getComponent("WheelRotate");
            if (wheelScript) {
                wheelScript.stopWheel();
            }
        }
    }

    updateUI() {
        if (this.throwsLeftLabel) {
            this.throwsLeftLabel.string = `Throws Left: ${this.throwsLeft}`;
        }

        if (this.prizeResultLabel && this.prizes.length > 0) {
            let resultText = "Prizes Won:\n";
            this.prizes.forEach((prize, index) => {
                resultText += `Prize ${index + 1}: ${prize}\n`;
            });
            this.prizeResultLabel.string = resultText;
        }
    }

    endGame() {
        console.log("🎉 Game Over! Final Prizes:", this.prizes);
        
        if (this.prizeResultLabel) {
            let resultText = "🎉 GAME OVER! 🎉\n\nYour Prizes:\n";
            this.prizes.forEach((prize, index) => {
                resultText += `Prize ${index + 1}: ${prize}\n`;
            });
            this.prizeResultLabel.string = resultText;
        }
    }

    
    resetGame() {
        this.throwsLeft = 3;
        this.prizes = [];
        this.isThrowing = false;
        this.updateUI();

        const wheelScript = this.wheel.getComponent("WheelRotate");
        if (wheelScript) {
            wheelScript.start();
        }
    }
}

