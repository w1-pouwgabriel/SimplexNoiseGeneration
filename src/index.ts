import * as THREE from "three";
import { Clock } from "three";
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'

import Graphics from "./Graphics";
import World from "./World";

export default class Game {
    private _Graphics: Graphics;
    private _World: World;
    private _Controls: FlyControls;
    
    private _timer: THREE.Clock = new Clock(true);
    
    constructor() {
        this._World = new World();
        this._Graphics = new Graphics(this._World.scene);

        this._timer = new Clock(true);

        this._Controls = new FlyControls(this._Graphics.camera, this._Graphics.renderer.domElement);
        this._Controls.movementSpeed = 250;
        this._Controls.rollSpeed = 0.7;
        this._Controls.dragToLook = true;

        let button: HTMLButtonElement = document.getElementById("generate") as HTMLButtonElement;
        button.addEventListener("click", (e: Event) => {
            this._World.Reset();
        });
    }

    public async Load(){
        //Load all needed textures and model
        
    }

    public Render(){
        requestAnimationFrame(this.Render.bind(this));

        let deltaTime: any = this._timer.getDelta();

        this._Controls.update(deltaTime);
        this._World.updateEntities(deltaTime);
        this._Graphics.Render(deltaTime);
    }
}

const game = new Game();
// @ts-ignore
window.game = game;
game.Load()
    .then(() => {
        game.Render();
    });
