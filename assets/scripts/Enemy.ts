import { _decorator, Collider, Component, Node, ITriggerEvent, input, Prefab, instantiate } from "cc";
import { GameManager } from "./GameManager";
import { Pool } from "./Pool";
const { ccclass, property } = _decorator;

@ccclass("Enemy")
export class Enemy extends Component {
    private speed = 0;

    private gm: GameManager;

    protected onEnable(): void {
        const cd = this.getComponent(Collider);
        cd.on("onTriggerEnter", this.onHitHandle);
    }

    protected onDisable(): void {
        const cd = this.getComponent(Collider);
        cd.off("onTriggerEnter", this.onHitHandle);
    }

    private onHitHandle = (o: ITriggerEvent) => {
        // console.log(o.selfCollider.getGroup(), o.otherCollider.getGroup())
        if (o.otherCollider.node.name !== 'player') {
            if (o.selfCollider.node.position.z <= -40) {
                // 保护期
                return;
            }
            this.gm.addScore();
            // console.log(o.selfCollider.node.position)
        }
        
        this.gm.playEffect("enemy");
        this.gm.explodeEnemyAt(this.node.position);
        // this.node.destroy();
        Pool.instance().put(this.node);
    };

    setGM(gm: GameManager) {
        this.gm = gm;
    }

    update(deltaTime: number) {
        const pos = this.node.position;

        this.node.setPosition(pos.x, pos.y, pos.z + deltaTime * this.speed);

        if (this.node.position.z > 50) {
            // console.log('敌人销毁', this.node.position.z, this.node.worldPosition.z)
            // this.node.destroy();
            Pool.instance().put(this.node)
        }
    }

    setSpeed(num: number) {
        this.speed = num;
    }
}
