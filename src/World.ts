import * as THREE from "three";
import { Mesh } from "three";
import { degToRad } from "./Utisl";
import NoiseGenerator, { NoiseParams } from "./Noise"

export default class World{
    private _scene: THREE.Scene;
    private _chunk: THREE.Mesh = new Mesh();
    private _noise?: NoiseGenerator;

    public get scene(){
        return this._scene;
    }

    constructor(){
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color('skyblue');

        //@ts-ignore
        window.scene = this._scene;

        this.Lighthing();

        let resolution = 50;

        this._chunk = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, resolution, resolution),
            new THREE.MeshStandardMaterial({
                wireframe: true,
                color: 0xFFFFFF,
                side: THREE.DoubleSide
            }));
        this._chunk.castShadow = false;
        this._chunk.receiveShadow = true;
        
        this._chunk.rotation.x = degToRad(90);
        this._chunk.rotation.z = degToRad(45);

        this._scene.add( this._chunk );

        //Noise generator
        let noiseParams: NoiseParams = new NoiseParams();
        noiseParams.scale = resolution;
        noiseParams.noiseType = "simplex";
        noiseParams.persistence = 10;
        noiseParams.octaves = 0.5;
        noiseParams.lacunarity = 2; 
        noiseParams.exponentiation = 4; 
        noiseParams.height = 25;
        noiseParams.seed = Math.random();

        this._noise = new NoiseGenerator(noiseParams);

        this.ApplyHeightMap();
    }

    private ApplyHeightMap(){
        let vertices = this._chunk.geometry.attributes.position["array"];
        for(let i = 0; i < vertices.length; i += 3){
            vertices[i + 2] = this._noise.Get(vertices[i], vertices[i + 1]);
        }
    }

    private Lighthing(){
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
    }

    public updateEntities(deltaTime: number){
        this._chunk.rotation.z += deltaTime * degToRad(25);
    }
}