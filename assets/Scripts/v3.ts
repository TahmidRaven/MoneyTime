import { _decorator, Component, Node, UITransform, tween, Vec3, Input, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DartThrow')
export class DartThrow extends Component {

    @property(Node)
    wheel: Node = null;

    @property([Node])
    prizeNodes: Node[] = []; 

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

        // Hide all slots initially
        if (this.collectionSlots) {
            this.collectionSlots.children.forEach(slot => {
                slot.active = false;
            });
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
        // Cash rewards ($1, $5, $10)
        if (prize.startsWith('$')) {
            const amount = parseInt(prize.substring(1));
            this.cashTotal += amount;
            console.log(`💰 Cash earned: ${prize} | Total: $${this.cashTotal}`);
            // TODO: Add "Ch-ching" sound effect
            
        // Collection items (PayPal, Amazon, PiggyBank)
        } else if (this.requiredItems.includes(prize)) {
            if (!this.collectedItems.has(prize)) {
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
            } else {
                console.log(`ℹ️ ${prize} already collected!`);
            }
            
        // Bomb obstacle
        } else if (prize === 'Bomb') {
            console.log('💣 HIT BOMB! Game Over or Extra Dart popup');
            // TODO: Implement bomb penalty or "Save Me" popup
        }
    }

    animateItemToSlot(itemName: string, sourceNode: Node) {
        if (!this.collectionSlots) {
            console.error("❌ CollectionSlots not assigned!");
            return;
        }

        // Debug: Show all children
        console.log(`📋 CollectionSlots has ${this.collectionSlots.children.length} children:`);
        this.collectionSlots.children.forEach((child, i) => {
            console.log(`  [${i}] ${child.name}`);
        });

        // Find the corresponding slot
        const slotIndex = this.requiredItems.indexOf(itemName);
        if (slotIndex === -1) {
            console.error(`❌ ${itemName} not found in requiredItems!`);
            return;
        }

        console.log(`🔍 Looking for slot at index ${slotIndex} for ${itemName}`);

        const slot = this.collectionSlots.children[slotIndex];
        if (!slot) {
            console.error(`❌ No slot found at index ${slotIndex}!`);
            return;
        }

        console.log(`✈️ Animating ${itemName} to slot ${slotIndex + 1} (${slot.name})`);
        
        // Light up the slot with animation
        slot.active = true;
        slot.setScale(0, 0, 1);
        
        tween(slot)
            .to(0.3, { scale: new Vec3(1.2, 1.2, 1) })
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    transitionToPhase2() {
        console.log('🔥 PHASE 2: FRENZY MODE!');
        
        // Stop wheel
        const wheelScript = this.wheel.getComponent("WheelRotate");
        if (wheelScript) {
            wheelScript.stopWheel();
        }

        // Shake animation
        const originalPos = new Vec3(this.wheel.position);
        tween(this.wheel)
            .to(0.1, { position: new Vec3(originalPos.x + 10, originalPos.y, originalPos.z) })
            .to(0.1, { position: new Vec3(originalPos.x - 10, originalPos.y, originalPos.z) })
            .to(0.1, { position: new Vec3(originalPos.x + 10, originalPos.y, originalPos.z) })
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
        // Update cash counter only
        if (this.cashCounterLabel) {
            this.cashCounterLabel.string = `${this.cashTotal}`;
        }
    }

    endGame() {
        console.log("🎉 Game Over! Final Prizes:", this.prizes);
        console.log(`💰 Total Cash Earned: ${this.cashTotal}`);
        console.log(`📦 Items Collected: ${Array.from(this.collectedItems).join(', ')}`);
        console.log(`🏆 Total Prizes Won: ${this.prizes.length}`);
        console.log("Thank you for playing!");
        
        if (this.prizeResultLabel) {
            let finalText = `Game Over!\nTotal Cash: $${this.cashTotal}\nItems Collected: ${Array.from(this.collectedItems).join(', ')}\nTotal Prizes: ${this.prizes.length}`;
            this.prizeResultLabel.string = finalText;
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

        // Reset slots
        if (this.collectionSlots) {
            this.collectionSlots.children.forEach(slot => {
                slot.active = false;
            });
        }

        // Restart wheel
        const wheelScript = this.wheel.getComponent("WheelRotate");
        if (wheelScript) {
            wheelScript.start();
        }
        
        this.wheel.active = true;
    }
}

