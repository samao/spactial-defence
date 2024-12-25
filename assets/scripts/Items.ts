import { _decorator, Animation, AnimationState, Component, Node, Prefab, math, instantiate, Collider } from 'cc';
import { GameManager } from './GameManager';
import { Pool } from './Pool';
const { ccclass, property } = _decorator;

@ccclass('Items')
export class Items extends Component {
    @property([Prefab])
    private items: Prefab[] = [];

    @property
    private genernateGap = 15;

    private currentTime = 0;

    private running = false;

    @property(GameManager)
    private gm: GameManager;

    protected onEnable(): void {
        this.currentTime = 0;
        this.running = false;
    }

    createMotion() {
        this.running = true;
        const type = math.randomRangeInt(0, this.items.length);
        const item = Pool.instance().get(this.items[type], this.node);
        // item.setParent(this.node);
        const animation: Animation = this.getComponent(Animation);
        // animation.enabled = true;
        // console.log('GOOO', item, animation);
        animation.play('move')
        animation.once(Animation.EventType.FINISHED, () =>{
            // animation.enabled = false;
            this.running = false;
        })

        const cld = this.getComponent(Collider);
        cld.once('onTriggerEnter', () => {
            this.gm.changeBulletType(type);
            // item.destroy();
            Pool.instance().put(item);
            this.running = false;
            this.currentTime = 0;
            this.gm.playEffect('plant')
        })
    }

    update(deltaTime: number) {
        if (this.running || !this.node.active) {
            return;
        }
        if (this.currentTime > this.genernateGap) {
            this.currentTime = 0;
            this.createMotion();
        }
        this.currentTime += deltaTime;
    }
}


