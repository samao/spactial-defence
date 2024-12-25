import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    private ctl: AudioSource;

    @property([AudioClip])
    private shot: AudioClip[] = [];

    private map: Map<string, AudioClip> = new Map();

    protected start(): void {
        this.ctl = this.getComponent(AudioSource);

        for (var ele of this.shot) {
            this.map.set(ele.name, ele);
        }
        // console.log(this.map);
    }

    play(name: string, volume = 0.6) {
        const clip = this.map.get(name);
        if (clip) {
            // console.log('播放音效：', name, this.ctl);
            this.ctl.playOneShot(clip, volume);
        }
    }
}


