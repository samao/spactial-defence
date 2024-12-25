import { _decorator, Component, instantiate, Node, NodePool, Prefab } from 'cc';

export class Pool {
    static #instance: Pool

    #map: Map<string, NodePool> = new Map();

    static instance(): Pool {
        if (!Pool.#instance) {
            Pool.#instance = new Pool();
        }
        return Pool.#instance;
    }

    get(prefab: Prefab, parent: Node) {
        const map = this.#map.get(prefab.name) ?? new NodePool(prefab.name);
        let node: Node;
        if (map.size() > 0) {
            // console.log('复用', prefab.name, map.size());
            node = map.get()
        } else {
            node = instantiate(prefab)
        }
        node.parent = parent;
        this.#map.set(prefab.name, map);
        return node;
    }

    put(node: Node) {
        // console.log('回收了');
        const name = node.name;
        node.parent = null;
        if (!this.#map.has(name)) {
            this.#map.set(name, new NodePool(name))
        }
        this.#map.get(name).put(node);
        // console.log(this.#map);
    }
}


