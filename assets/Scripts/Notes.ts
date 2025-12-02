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

    @property(Label)
    cashCounterLabel: Label = null;

    @property(Node)
    collectionSlots: Node = null; // Parent node containing 3 slots

    @property(Node)
    tutorialHand: Node = null;

    private throwsLeft: number = 3;
    private prizes: string[] = [];
    private isThrowing: boolean = false;
    private cashTotal: number = 0;
    private collectedItems: Set<string> = new Set();
    private tutorialTimer: number = 0;
    private requiredItems = ['PayPal', 'Amazon', 'PiggyBank'];

    onLoad() {
        // For both mobile and desktop
        this.node.on(Input.EventType.TOUCH_START, this.throwDart, this);
        this.node.on(Input.EventType.MOUSE_DOWN, this.throwDart, this);
        this.updateUI();
        
        // Hide tutorial hand initially
        if (this.tutorialHand) {
            this.tutorialHand.active = false;
        }
    }

    update(dt: number) {
        // Show tutorial hand if player is inactive for 2 seconds
        if (!this.isThrowing && this.throwsLeft === 3 && this.prizes.length === 0) {
            this.tutorialTimer += dt;
            if (this.tutorialTimer > 2 && this.tutorialHand) {
                this.tutorialHand.active = true;
                // Add pulsing animation
                tween(this.tutorialHand)
                    .to(0.5, { scale: new Vec3(1.2, 1.2, 1) })
                    .to(0.5, { scale: new Vec3(1, 1, 1) })
                    .union()
                    .repeatForever()
                    .start();
            }
        } else {
            this.tutorialTimer = 0;
            if (this.tutorialHand) {
                this.tutorialHand.active = false;
            }
        }
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
        
        // Handle different prize types
        this.handlePrizeType(prize, targetNode);
        
        this.updateUI();

        // Stop wheel after last throw
        if (this.throwsLeft <= 0) {
            const wheelScript = this.wheel.getComponent("WheelRotate");
            if (wheelScript) {
                wheelScript.stopWheel();
            }
        }
    }

    handlePrizeType(prize: string, targetNode: Node) {
        // Cash rewards
        if (prize.startsWith('

    updateUI() {
        // Update throws left
        if (this.throwsLeftLabel) {
            this.throwsLeftLabel.string = `Throws Left: ${this.throwsLeft}`;
        }

        // Update cash counter
        if (this.cashCounterLabel) {
            this.cashCounterLabel.string = `${this.cashTotal}`;
        }

        // Update prize results
        if (this.prizeResultLabel && this.prizes.length > 0) {
            let resultText = "Prizes Won:\n";
            this.prizes.forEach((prize, index) => {
                resultText += `${index + 1}. ${prize}\n`;
            });
            resultText += `\nCollected: ${this.collectedItems.size}/3`;
            this.prizeResultLabel.string = resultText;
        }
    }

    endGame() {
        console.log("🎉 Game Over! Final Prizes:", this.prizes);
        console.log(`💰 Total Cash Earned: ${this.cashTotal}`);
        console.log(`📦 Items Collected: ${Array.from(this.collectedItems).join(', ')}`);
        
        if (this.prizeResultLabel) {
            let resultText = "🎉 GAME OVER! 🎉\n\n";
            resultText += `💰 Total Cash: ${this.cashTotal}\n\n`;
            resultText += "Your Prizes:\n";
            this.prizes.forEach((prize, index) => {
                resultText += `${index + 1}. ${prize}\n`;
            });
            resultText += `\n📦 Collected: ${this.collectedItems.size}/3 items`;
            this.prizeResultLabel.string = resultText;
        }
    }

    // Optional: Reset game
    resetGame() {
        this.throwsLeft = 3;
        this.prizes = [];
        this.isThrowing = false;
        this.cashTotal = 0;
        this.collectedItems.clear();
        this.tutorialTimer = 0;
        this.updateUI();

        const wheelScript = this.wheel.getComponent("WheelRotate");
        if (wheelScript) {
            wheelScript.start();
        }
        
        this.wheel.active = true;
    }
})) {
            const amount = parseInt(prize.substring(1));
            this.cashTotal += amount;
            console.log(`💰 Cash earned: ${prize} | Total: ${this.cashTotal}`);
            // TODO: Add "Ch-ching" sound effect
            
        // Collection items (PayPal, Amazon, PiggyBank)
        } else if (this.requiredItems.includes(prize)) {
            this.collectedItems.add(prize);
            console.log(`📦 Collected: ${prize} | Progress: ${this.collectedItems.size}/3`);
            this.animateItemToSlot(prize, targetNode);
            // TODO: Add fanfare sound effect
            
            // Check if all 3 items collected
            if (this.collectedItems.size === 3) {
                console.log('🎉 ALL ITEMS COLLECTED! Transitioning to Phase 2...');
                this.scheduleOnce(() => {
                    this.transitionToPhase2();
                }, 1.0); // Delay for item animation
            }
            
        // Bomb obstacle
        } else if (prize === 'Bomb') {
            console.log('💣 HIT BOMB! Game Over or Extra Dart popup');
            // TODO: Implement bomb penalty or "Save Me" popup
        }
    }

    animateItemToSlot(itemName: string, sourceNode: Node) {
        if (!this.collectionSlots) return;

        // Find the corresponding slot
        const slotIndex = this.requiredItems.indexOf(itemName);
        if (slotIndex === -1) return;

        const slot = this.collectionSlots.children[slotIndex];
        if (!slot) return;

        // Get positions
        const sourceWorldPos = sourceNode.getWorldPosition();
        const targetWorldPos = slot.getWorldPosition();

        // Create a temporary sprite that flies to the slot
        // (In a real implementation, you'd create a sprite node here)
        console.log(`✈️ Animating ${itemName} from wheel to slot ${slotIndex + 1}`);
        
        // Light up the slot
        slot.active = true;
        // TODO: Add glow/highlight effect to the slot
    }

    transitionToPhase2() {
        console.log('🔥 PHASE 2: FRENZY MODE!');
        
        // Shake and shatter wheel animation
        const wheelScript = this.wheel.getComponent("WheelRotate");
        if (wheelScript) {
            wheelScript.stopWheel();
        }

        // Shake animation
        const originalPos = new Vec3(this.wheel.position);
        tween(this.wheel)
            .to(0.1, { position: originalPos.add3f(10, 0, 0) })
            .to(0.1, { position: originalPos.add3f(-10, 0, 0) })
            .to(0.1, { position: originalPos.add3f(10, 0, 0) })
            .to(0.1, { position: originalPos })
            .call(() => {
                console.log('💥 Wheel Shattered! Golden Piggy appears!');
                // TODO: Hide wheel, show Golden Piggy
                // TODO: Start frenzy mode (infinite darts, rapid tapping)
                this.wheel.active = false;
            })
            .start();
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

    // Optional: Reset game
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