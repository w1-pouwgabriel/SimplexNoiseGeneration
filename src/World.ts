import * as THREE from "three";
import { Mesh, Vector3 } from "three";
import { math } from "./Math";
import NoiseGenerator, { NoiseParams } from "./Noise"
import Vector from "ts-vector"
import { degToRad } from "./Utisl";

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

        //Noise generator
        let noiseParams: NoiseParams = new NoiseParams();
        noiseParams.scale = 256;            //At what scale do you want to generate noise
        noiseParams.noiseType = "simplex";  //What type of noise
        noiseParams.persistence = 3;        //Controls the amplitude of octaves
        noiseParams.octaves = 3;            //The amount of noise maps used
        noiseParams.lacunarity = 5;         //Controls frequency of octaves
        noiseParams.exponentiation = 4;     //???
        noiseParams.height = 35;            //Max height of the heightmap
        noiseParams.seed = Math.random();   // Math.random(); //Generate a random seed

        this._noise = new NoiseGenerator(noiseParams);

        let resolution = 55;
        let chunkSize = 100;

        this._chunk = new THREE.Mesh(
            new THREE.PlaneGeometry(chunkSize, chunkSize, resolution, resolution),
            new THREE.MeshNormalMaterial({
                wireframe: false,
                side: THREE.DoubleSide
            }));
        this._chunk.castShadow = false;
        this._chunk.receiveShadow = true;

        this.ApplyHeightMap();
        
        this._scene.add( this._chunk );
    }

    private ApplyHeightMap(){
        let vertices = this._chunk.geometry.attributes.position["array"];

        for(let i = 0; i < vertices.length; i += 3){
            vertices[i + 2] = this._noise.Get(vertices[i] + this._chunk.position.x, vertices[i + 1] + this._chunk.position.z);
        }
        
        //Recalculate the normals
        this._chunk.geometry.computeVertexNormals();
    }

    private Lighthing(){
        let light = new THREE.DirectionalLight(0x808080, 1);
        light.position.set(0, 0, 0);
        light.target.position.set(0, 0, 0);
        light.castShadow = false;
        light.intensity = 0.0;
        this._scene.add(light);
    }

    public updateEntities(deltaTime: number){
        this._chunk.rotation.z += deltaTime * degToRad(25);
    }
}