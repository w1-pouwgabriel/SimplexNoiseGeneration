import * as THREE from "three";
import { Clock } from "three";

import Graphics from "./Graphics";
import World from "./World";
import Constrols from "./Controls";

export default class Game {
    private _Graphics: Graphics;
    private _World: World;
    private _Controls: Constrols;
   
    private _timer: THREE.Clock = new Clock(true);
    
    constructor() {
        this._World = new World();
        this._Graphics = new Graphics(this._World.scene);
        this._Controls = new Constrols();

        this._timer = new Clock(true);
    }

    public async Load(){
        //Load all needed textures and model
        
    }

    public Render(){
        let deltaTime: any = this._timer.getDelta();

        this._World.updateEntities(deltaTime);
        this._Graphics.Render();
        requestAnimationFrame(this.Render.bind(this));
    }
}

const game = new Game();
// @ts-ignore
window.game = game;
game.Load()
    .then(() => {
        game.Render();
    });
