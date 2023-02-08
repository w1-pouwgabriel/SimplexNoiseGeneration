import * as THREE from "three";
import { Clock, Mesh } from "three";

import NoiseGenerator, { NoiseParams } from "./Noise"
import Graphics from "./Graphics";
import degToRad from "./Utisl";

export default class Game {
    //private canvasCollection: HTMLCollectionOf<HTMLCanvasElement>;
    private _noise?: NoiseGenerator;
    private _Graphics: Graphics;

    //Three.js
    private _scene: THREE.Scene;
    private _chunk: THREE.Mesh = new Mesh();
    private _timer: THREE.Clock = new Clock(true);
    
    constructor() {
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color('skyblue');

        //@ts-ignore
        window.scene = this._scene;
        this._Graphics = new Graphics(this._scene);

        let light = new THREE.DirectionalLight(0x808080, 1);
        light.position.set(-100, 100, -100);
        light.target.position.set(0, 0, 0);
        light.castShadow = false;
        this._scene.add(light);
  
        light = new THREE.DirectionalLight(0x404040, 1);
        light.position.set(100, 100, -100);
        light.target.position.set(0, 0, 0);
        light.castShadow = false;
        this._scene.add(light);

        this._chunk = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 1, 1),
            new THREE.MeshStandardMaterial({
                wireframe: true,
                color: 0xFFFFFF,
                side: THREE.FrontSide
            }));
        this._chunk.castShadow = false;
        this._chunk.receiveShadow = true;
        this._chunk.setRotationFromAxisAngle(new THREE.Vector3(1,0,0), degToRad(-90));

        let vertices = this._chunk.geometry.attributes.position["array"];
        for (let v of vertices) {
            vertices[2] += 2;
        }

        this._scene.add( this._chunk );

        this._timer = new Clock(true);

        //Noise generator
        let noiseParams: NoiseParams = new NoiseParams();
        noiseParams.scale = 1;
        noiseParams.noiseType = "simplex";
        noiseParams.persistence = 1;
        noiseParams.octaves = 1;
        noiseParams.lacunarity = 1; 
        noiseParams.exponentiation = 1; 
        noiseParams.height = 1;
        noiseParams.seed = Math.random();

        this._noise = new NoiseGenerator(noiseParams);
    }

    public async Load(){
        //Load all needed textures and model
        
    }

    public Render(){
        let deltaTime: any = this._timer.getDelta();

        //this._chunk.rotation.x += deltaTime * 0.7;
        this._chunk.rotation.z += deltaTime * 0.7;
        //this._mesh.rotation.z += deltaTime * 0.7;

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
