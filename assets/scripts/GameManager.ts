import {
    _decorator,
    Collider,
    Component,
    Label,
    log,
    math,
    Node,
    Prefab,
    Vec2,
    Vec3,
} from "cc";
// import { Player } from './Player';
import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";
import { AudioManager } from "./AudioManager";
import { Pool } from "./Pool";
// import { Player } from './Player
const { ccclass, property } = _decorator;

enum TeamStyle {
    SINGLE,
    LINE_TEAM,
    V_TEAM,
}

enum WeaponType {
    NORMAL,
    POWER,
    DOUBLE,
    W_LINE,
}

const W_LINE_POINT = [-1, 0, -1];

const PREFAB_TO_WEAPON_MAP = {
    0: WeaponType.POWER,
    1: WeaponType.DOUBLE,
    2: WeaponType.W_LINE,
};

@ccclass("GameManager")
export class GameManager extends Component {
    @property(Prefab)
    private bullet: Prefab;

    @property(Prefab)
    private moonBullet: Prefab;

    @property(Prefab)
    private enemyExplode: Prefab;

    @property(Prefab)
    private enemyBullet: Prefab;

    @property(Node)
    private player: Node;

    @property
    private bulletSpeed = 10;

    @property(Node)
    private bullets: Node;

    private isShooting = false;
    @property
    private shootGap = 0.4;

    private currentTime = 0;

    @property(Node)
    private enemies: Node;

    @property(Node)
    private items: Node;

    @property(Prefab)
    private enemy: Prefab;

    @property(Prefab)
    private speciEnemy: Prefab;

    private enemyGenerationGap = 1;

    private currentEnemyTime = 0;
    @property
    private enemySpeed = 20;

    private currentStep = 0;

    @property(AudioManager)
    private audioManager: AudioManager;

    @property(Label)
    private label: Label;

    @property
    private weaponLife = 20;

    private score = 0;

    @property
    private uplifeGap = 10;

    private currentBulletType: WeaponType = WeaponType.NORMAL;

    protected start(): void {
        this.player.active = false;
        log("游戏开始了");
    }

    get playerScore() {
        return this.score;
    }

    startGame() {
        this.enemies.destroyAllChildren();
        this.bullets.destroyAllChildren();
        this.player.active = true;
        this.items.active = true;
        this.currentBulletType = WeaponType.NORMAL;
        this.score = 0;
        this.label.string = "0";
    }

    overGame() {
        this.items.destroyAllChildren();
        this.items.active = false;
        // this.player.active = false;
    }

    update(deltaTime: number) {
        if (this.isShooting && this.currentTime > this.shootGap) {
            this.currentTime = 0;
            this.createBulletByType(this.currentBulletType, this.player.position.clone().add(new Vec3(0, 0, -7)), this.bulletSpeed);
        }
        this.currentTime += deltaTime;
        this.currentEnemyTime += deltaTime;

        if (this.currentEnemyTime > this.enemyGenerationGap) {
            this.currentEnemyTime = 0;
            this.generateEnemy(
                this.currentStep % 6 !== 0 ? TeamStyle.SINGLE : math.randomRangeInt(0, 2) === 0 ? TeamStyle.LINE_TEAM : TeamStyle.V_TEAM
            );
        }
    }

    changeBulletType(index: number) {
        this.currentBulletType = PREFAB_TO_WEAPON_MAP[index] ?? WeaponType.NORMAL;

        if (this.currentBulletType !== WeaponType.NORMAL) {
            // console.log('切换弹药', this.currentBulletType)
            this.unschedule(this.weaponFallback);
            this.scheduleOnce(this.weaponFallback, this.weaponLife);
        }
    }

    weaponFallback() {
        this.currentBulletType = WeaponType.NORMAL;
    }

    playEffect(name: string, volume = 0.4) {
        // console.log('播放特效', name)
        this.audioManager.play(name, volume);
    }

    createBullet(pos: Vec3, speed: Vec2) {
        const bullet = Pool.instance().get(
            speed.y < 0 ? this.enemyBullet : this.currentBulletType === WeaponType.POWER ? this.moonBullet : this.bullet,
            this.bullets
        );
        bullet.setPosition(pos.x, pos.y, pos.z);
        // bullet.setParent(this.bullets);
        const bulletController = bullet.getComponent(Bullet);
        bulletController.setSpeed(speed);
        if (speed.y < 0) {
            const cld = bullet.getComponent(Collider);
            cld.setGroup(1 << 4);
            cld.setMask(1 << 3);
        }
        this.audioManager.play(speed.y > 0 ? "bullet2" : "bullet1");
    }

    createBulletByType(type: WeaponType, mid: Vec3, speed: number) {
        switch (type) {
            case WeaponType.DOUBLE:
                for (let i = 0; i < 2; i++) {
                    this.createBullet(Vec3.add(new Vec3(), mid, new Vec3((i - 0.5) * 3, 0, 0)), new Vec2(0, speed));
                }
                break;
            case WeaponType.W_LINE:
                for (let i = 0; i < 3; i++) {
                    this.createBullet(
                        Vec3.add(new Vec3(), mid, new Vec3((i - 1) * 3, 0, W_LINE_POINT[i] * 5)),
                        new Vec2((i - 1) * speed * 0.4, speed)
                    );
                }
                break;
            default:
                this.createBullet(mid, new Vec2(0, speed));
                break;
        }
    }

    generateEnemy(style = TeamStyle.SINGLE) {
        let prefab = math.randomRangeInt(0, 2) === 0 ? this.enemy : this.speciEnemy;
        const total = 5;
        this.currentStep++;
        switch (style) {
            case TeamStyle.LINE_TEAM:
                for (let i = 0; i < total; i++) {
                    this.createEnemy(prefab, new Vec3((i - 2) * 8, 0, -50));
                }
                break;
            case TeamStyle.V_TEAM:
                for (let i = 0; i < total; i++) {
                    this.createEnemy(prefab, new Vec3((i - 2) * 8, 0, -50 + -Math.abs(i - 2) * 5));
                }
                break;
            default:
                this.createEnemy(prefab, new Vec3(this.randomXPos, 0, -50), true);
                break;
        }
    }

    createEnemy(pb: Prefab, pos: Vec3, withBullet = false) {
        const enemy = Pool.instance().get(pb, this.enemies);
        // enemy.setParent(this.enemies);
        enemy.setPosition(pos);
        const enemyCMP = enemy.getComponent(Enemy);
        enemyCMP.setSpeed(this.enemySpeed);
        enemyCMP.setGM(this);
        if (withBullet) {
            const bulletPos = pos.clone().add(new Vec3(0, 0, 7));
            // console.log('发射一个子弹', this.bulletSpeed, bulletPos)
            this.createBullet(bulletPos, new Vec2(0, -this.bulletSpeed));
        }
    }

    explodeEnemyAt(pos: Readonly<Vec3>) {
        const explode = Pool.instance().get(this.enemyExplode, this.enemies);
        explode.setPosition(pos.clone().add(new Vec3(0, 0, 3)));
        // explode.setParent(this.enemies);
        this.scheduleOnce(() => {
            // explode.destroy();
            Pool.instance().put(explode);
        }, 2);
    }

    addScore() {
        this.score++;
        this.label.string = this.score + "";
        if (this.score % this.uplifeGap == 0) {
            // console.log('add one life');
            this.playEffect("points", 2);
            this.node.emit("addLifeFromScore");
        }
    }

    get randomXPos() {
        return math.randomRangeInt(-20, 20);
    }

    setShooting(bool: boolean) {
        this.isShooting = bool;
    }
}
