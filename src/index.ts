import * as THREE from "three";
import { Clock, Mesh } from "three";
import NoiseGenerator, { NoiseParams } from "./Noise"

export default class Game {
    //private canvas: HTMLCanvasElement;
    //private context: CanvasRenderingContext2D;
    private _noise?: NoiseGenerator;
    //private last: number = 0;
    //private deltaTime: number = 0;

    //Three.js
    private _camera: THREE.Camera;
    private _renderer: THREE.WebGLRenderer;
    private _scene: THREE.Scene;
    private _mesh: THREE.Mesh = new Mesh();
    private _timer: THREE.Clock = new Clock(true);
    
    constructor() {
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color('skyblue');

        //@ts-ignore
        window.scene = this._scene;
       
        //Initialize camera
        this._camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
        this._camera.position.z = 1;

        let geometry = new THREE.PlaneGeometry();
        let material = new THREE.MeshNormalMaterial();

        this._mesh = new THREE.Mesh( geometry, material );
        this._scene.add( this._mesh );
        this._mesh = this._mesh;

        //Init renderer
        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        //Create a canvas and add this to the html page
        document.body.appendChild(this._renderer.domElement);

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

        console.log("Constructor");
    }

    public async Load(){
        //Load all needed textures and model
        console.log("Load");
    }

    public Render(){
        let deltaTime: any = this._timer.getDelta();

        //this._mesh.rotation.x += deltaTime * 0.7;
        //this._mesh.rotation.y += deltaTime * 0.7;
        //this._mesh.rotation.z += deltaTime * 0.7;
        this._mesh.rotation.x = -45.0;
    
        this._renderer.render( this._scene, this._camera );

        requestAnimationFrame(this.Render.bind(this));

        console.log("Render");
    }

    // private onResize(){
    //     this.canvas.width = window.innerWidth;
    //     this.canvas.height = window.innerHeight;
    // }
}

const game = new Game();
// @ts-ignore
window.game = game;
game.Load()
    .then(() => {
        game.Render();
    });
