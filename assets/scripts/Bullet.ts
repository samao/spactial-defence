import { _decorator, Collider, Component, ITriggerEvent, MeshRenderer, Vec2, Me, Material } from "cc";
import { Pool } from "./Pool";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
    private speed = new Vec2();

    private materials: Partial<{ origin: Material; speci: Material, sprond: Material }> = {};

    private mr: MeshRenderer;

    start() {
        const cd: Collider = this.getComponent(Collider);
        cd.on("onTriggerEnter", this.onHitHandle);
        // console.log(this.getComponent(RigidBody).getGroup());
    }

    protected onLoad(): void {
        this.mr = this.getComponentInChildren(MeshRenderer);
        this.materials.origin = this.mr.materials[0];
        this.materials.speci = this.mr.materials[1];
        this.materials.sprond = this.mr.materials[2]
    }

    protected onEnable(): void {
        this.mr.material = this.materials.origin;
        this.node.setScale(4, 4, 4);
    }

    useSpecial(type: 0 | 1 | 2 | 3) {
        switch(type) {
            case 1:
                this.mr.material = this.materials.speci;
                this.node.setScale(8, 8, 8);
                break;
            case 3:
                this.mr.material = this.materials.sprond;
                break;
            default:
                break;
        }
    }

    // protected onDisable(): void {

    // }

    private onHitHandle = (o: ITriggerEvent) => {
        // console.log('子弹的组',o.selfCollider.getGroup())
        // this.node.destroy();
        this.returnToPool();
    };

    update(deltaTime: number) {
        const pos = this.node.position;
        this.node.setPosition(pos.x + this.speed.x * deltaTime, pos.y, pos.z - this.speed.y * deltaTime);
        if (this.speed.y > 0) {
            // console.log(this.node.position, this.node.worldPosition);
            if (this.node.position.z < -50) {
                // console.log("玩家子弹", this.node.position.z, this.node.worldPosition.z);
                // this.node.destroy();
                this.returnToPool();
            }
        } else {
            if (this.node.position.z > 50) {
                // console.log("电脑子弹", this.node.position.z, this.node.worldPosition.z);
                // this.node.destroy();
                this.returnToPool();
            }
        }
    }

    returnToPool() {
        Pool.instance().put(this.node);
    }

    setSpeed(num: Vec2) {
        this.speed.set(num);
    }
}
