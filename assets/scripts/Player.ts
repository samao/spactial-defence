import { _decorator, Animation, Collider, Component, EventTouch, Input, input, ITriggerEvent, Label, Node, Quat, Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { ui } from './ui';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    private easeScale = 0.1;

    @property
    private lifeCount = 5;

    @property(Node)
    private explode: Node;

    @property(Node)
    private tailFlame: Node;

    private currentLife = this.lifeCount;

    @property(Label)
    private lifeLabel: Label;

    @property(GameManager)
    public gm: GameManager;

    @property(ui)
    private uiManager: ui

    protected onEnable(): void {
        // console.log('开始游戏PLAYER')
        this.node.active = true;
        this.explode.active = false;
        this.currentLife = this.lifeCount
        this.updateLife();
        input.on(Input.EventType.TOUCH_START, this.touchStart)
        input.on(Input.EventType.TOUCH_END, this.touchEnd)
        input.on(Input.EventType.TOUCH_MOVE, this.touchMove)

        const cld = this.getComponent(Collider)
        cld.on('onTriggerEnter', this.onCrashed)

        this.gm.node.on('addLifeFromScore', this.addOneLife, this)
    }

    addOneLife() {
        this.currentLife += 1;
        this.updateLife();
    }

    protected onDisable(): void {
        input.off(Input.EventType.TOUCH_START, this.touchStart)
        input.off(Input.EventType.TOUCH_END, this.touchEnd)
        input.off(Input.EventType.TOUCH_MOVE, this.touchMove)

        const cld = this.getComponent(Collider)
        cld.off('onTriggerEnter', this.onCrashed)
    }

    private onCrashed = (e: ITriggerEvent) => {
        // console.log('碰撞', e.otherCollider.node.name);

        if (e.otherCollider.node.name === 'items') {
            return;
        }
        this.currentLife--;
        if (this.currentLife === 0) {
            this.gm.playEffect('player');
            this.explode.active = true;
            this.gm.setShooting(false);
            this.gm.overGame();
            this.scheduleOnce(this.disappear, 1);
            return;
        } else {
            this.gm.playEffect('shieldhit')
        }
        this.updateLife();
    }

    private disappear() {
        this.uiManager.overGame();
        this.node.active = false;
    }

    private touchMove = (e: EventTouch) => {
        const delta = e.getDelta().multiplyScalar(this.easeScale);
        this.node.setPosition(this.node.position.x + delta.x, this.node.position.y, this.node.position.z - delta.y)
        this.setLean(delta.x)
    }

    setLean(deltaX: number) {
        if ( deltaX !== 0) {
            this.getComponent(Animation).play(deltaX > 0 ? 'right':'left');
            // this.unschedule(this.reBack);
            // this.node.setRotationFromEuler(0, 0, -30 * Math.abs(deltaX) / deltaX)
            // this.scheduleOnce(this.reBack, 1)
        }
    }

    updateLife() {
        this.lifeLabel.string = `生命：${this.currentLife} / ${this.lifeCount}`
    }

    private touchStart = (e: EventTouch) => {
        this.gm.setShooting(true);
        this.tailFlame.active = true;
    }

    private touchEnd = (e: EventTouch) => {
        this.gm.setShooting(false);
        this.tailFlame.active = false;
    }

    update(deltaTime: number) {
       
    }
}


