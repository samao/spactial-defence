import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Background")
export class Background extends Component {
    @property(Node)
    private bg01: Node;
    @property(Node)
    private bg02: Node;

    @property
    private moveSpeed = 10;

    private moveRange = 90;

    update(deltaTime: number) {
        this.bg01.setPosition(0, 0, this.bg01.position.z + this.moveSpeed * deltaTime);
        this.bg02.setPosition(0, 0, this.bg02.position.z + this.moveSpeed * deltaTime);

        if (this.bg01.position.z > this.moveRange) {
            this.bg01.setPosition(0, 0, this.bg02.position.z - this.moveRange);
        } else if (this.bg02.position.z > this.moveRange) {
            this.bg02.setPosition(0, 0, this.bg01.position.z - this.moveRange);
        }
    }
}
