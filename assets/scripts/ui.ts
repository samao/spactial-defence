import { _decorator, Component, Label, Node, NodeEventType } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('ui')
export class ui extends Component {
    @property(GameManager)
    private gm: GameManager;

    @property(Node)
    private startBut: Node;

    @property(Node)
    private replayBut: Node;

    @property(Node)
    private menu: Node;

    @property(Node)
    private over: Node;

    @property(Node)
    private gaming: Node;

    @property(Label)
    private gameOverLabel: Label;

    protected start(): void {
        // console.log('UI START')
    }

    onEnable() {
        // console.log(this.startBut, this.replayBut)
        this.startBut.on(NodeEventType.TOUCH_START, this.startGame, this);
        this.replayBut.on(NodeEventType.TOUCH_START, this.replayGame, this)
        this.menu.active = true;
    }

    startGame() {
        this.menu.active = false;
        this.over.active = false;
        this.gaming.active = true;
        this.gm.startGame();
    }

    overGame() {
        // this.menu.active = false;
        this.over.active = true;
        this.gaming.active = false;
        this.gameOverLabel.string = '得分：' + this.gm.playerScore;
    }

    replayGame() {
        this.menu.active = true;
        this.over.active = false;
        // this.gaming.active = false;
    }

    update(deltaTime: number) {
        
    }
}


