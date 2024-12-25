import { _decorator, Collider, Component, ITriggerEvent, MeshRenderer, Vec2 } from "cc";
import { Pool } from "./Pool";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
    private speed = new Vec2();

    start() {
        const cd: Collider = this.getComponent(Collider);
        cd.on("onTriggerEnter", this.onHitHandle);
        // console.log(this.getComponent(RigidBody).getGroup());
    }

    private onHitHandle = (o: ITriggerEvent) => {
        // console.log('子弹的组',o.selfCollider.getGroup())
        // this.node.destroy();
        this.returnToPool()
    };

    update(deltaTime: number) {
        const pos = this.node.position;
        this.node.setPosition(pos.x + this.speed.x * deltaTime, pos.y, pos.z - this.speed.y * deltaTime);
        if (this.speed.y > 0) {
            // console.log(this.node.position, this.node.worldPosition);
            if (this.node.position.z < -50) {
                // console.log("玩家子弹", this.node.position.z, this.node.worldPosition.z);
                // this.node.destroy();
                this.returnToPool()
            }
        } else {
            if (this.node.position.z > 50) {
                // console.log("电脑子弹", this.node.position.z, this.node.worldPosition.z);
                // this.node.destroy();
                this.returnToPool()
            }
        }
    }

    returnToPool() {
        Pool.instance().put(this.node);
    }

    setSpeed(num: Vec2) {
        this.speed.set(num)
    }
}
