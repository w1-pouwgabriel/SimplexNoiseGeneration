import * as THREE from "three";
import NoiseGenerator, { NoiseParams } from "./Noise"
import { reverseNumberInRange } from "./Utisl";
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'

import Chunk from "./Chunk";
import { LODInfo } from "./LOD"
import { start } from "repl";
import { worker } from "cluster";

interface TerrianType {
    name: string,
    height: number,
    color: number[]
};

export default class World{
    private _scene: THREE.Scene;

    //Controllable settings
    private _noise: NoiseGenerator;
    private _isWireFrame: boolean = false;

    //@ts-ignore
    private _controlRef: FlyControls;

    private _chunkSize: number = 200;
    private _terrianTypes: any[] = new Array<TerrianType>(); 
    private _terrian: Map<string, Chunk> = new Map();
    private _LODInfo: Array<LODInfo> = new Array();

    //Render distance options
    private _MaxViewDst: number = 0;
    private _ChunksVisableInViewDst: number;

    public get scene(){
        return this._scene;
    }

    public set controlRef(controlRef: FlyControls){
        this._controlRef = controlRef;
    }

    constructor(){
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color('skyblue');

        //@ts-ignore
        window.scene = this._scene;

        this.Lighthing();

        this._LODInfo.push(
            { Lod: 1, VisibleDistanceThreshold: 300, Resolution: 48 },
            { Lod: 2, VisibleDistanceThreshold: 500, Resolution: 24 },
            { Lod: 3, VisibleDistanceThreshold: 1000, Resolution: 12 },
            { Lod: 4, VisibleDistanceThreshold: 2000, Resolution: 8 },
            { Lod: 5, VisibleDistanceThreshold: 3600, Resolution: 4 }
        );

        this._MaxViewDst = this._LODInfo[this._LODInfo.length - 1].VisibleDistanceThreshold;

        console.log(this._LODInfo);

        this._ChunksVisableInViewDst = Math.round(this._MaxViewDst / this._chunkSize);

        //Noise generator
        let noiseParams: NoiseParams = new NoiseParams();
        noiseParams.scale = 512;               //At what scale do you want to generate noise
        noiseParams.noiseType = "simplex";      //What type of noise
        noiseParams.persistence = 3;            //Controls the amplitude of octaves
        noiseParams.octaves = 4;                //The amount of noise maps used
        noiseParams.lacunarity = 5;             //Controls frequency of octaves
        noiseParams.seed = Math.random();       // Math.random(); //Generate a random seed

        this._noise = new NoiseGenerator(noiseParams);

        //Create some terriantypes
        this._terrianTypes.push(
            { name: "WaterDeep",    height: -0.5,   color: [0, 0, 126, 255]},
            { name: "WaterShallow", height: 0.0,    color: [0, 0, 255, 255]},
            { name: "Sand",         height: 0.2,    color: [255, 255, 0, 255]},
            { name: "Land1",        height: 0.4,    color: [0, 255, 0, 255]},
            { name: "Land2",        height: 0.6,    color: [0, 126, 0, 255]},
            { name: "Mountain1",    height: 0.7,    color: [255, 150, 0, 255]},
            { name: "Mountain2",    height: 0.9,    color: [150, 75, 0, 255]},
            { name: "Snow",         height: 1.0,    color: [255, 255, 255, 255]}
        );

        //SET DEBUG MENU VALUES
        {
            let noiseScale: HTMLInputElement = document.getElementById("noiseScale") as HTMLInputElement;
            noiseScale.value = noiseParams.scale.toString();

            let noiseSeed = document.getElementById("noiseSeed") as HTMLInputElement;
            noiseSeed.value = noiseParams.seed.toString();

            let noiseZoom = document.getElementById("noiseZoom") as HTMLInputElement;
            noiseZoom.value = "1";
        }
    }

    private GenerateHeightMap(chunkRef: THREE.Mesh, mapCoordinate: THREE.Vector2) : Array<number>{
        // create a buffer with color data
        //@ts-ignore
        let width = chunkRef.geometry.parameters.widthSegments + 1;
        //@ts-ignore
        let height = chunkRef.geometry.parameters.heightSegments + 1;

        //console.log(width + ":" + height)
        //console.log(mapCoordinate)

        const size = width * height;
        const colorData = new Uint8Array( 4 * size );
        const heightData = new Array<number>( size );
        
        for(let y = 0; y < height; y++)
        {
            for(let x = 0; x < width; x++)
            {
                const index = (y * width + x);
                const stride = index * 4;

                let WaterDeep: TerrianType = this._terrianTypes.find(terrianType => terrianType.name == "WaterDeep");
                let WaterShallow: TerrianType = this._terrianTypes.find(terrianType => terrianType.name == "WaterShallow");
                let Sand: TerrianType = this._terrianTypes.find(terrianType => terrianType.name == "Sand");
                let Land1: TerrianType = this._terrianTypes.find(terrianType => terrianType.name == "Land1");
                let Land2: TerrianType = this._terrianTypes.find(terrianType => terrianType.name == "Land2");
                let Mountain1: TerrianType = this._terrianTypes.find(terrianType => terrianType.name == "Mountain1");
                let Mountain2: TerrianType = this._terrianTypes.find(terrianType => terrianType.name == "Mountain2");
                let Snow: TerrianType = this._terrianTypes.find(terrianType => terrianType.name == "Snow");

                let noiseCoordinate : THREE.Vector2 = new THREE.Vector2(x + mapCoordinate.x * (width - 1), y + mapCoordinate.y * (height - 1));

                let heightValue = this._noise.Get(noiseCoordinate.x , noiseCoordinate.y);

                if(heightValue <= WaterDeep.height){
                    colorData[ stride ] = WaterDeep.color[0];
                    colorData[ stride + 1 ] = WaterDeep.color[1];
                    colorData[ stride + 2 ] = WaterDeep.color[2];
                    colorData[ stride + 3 ] = WaterDeep.color[3];
                }
                else if(heightValue <= WaterShallow.height){
                    colorData[ stride ] = WaterShallow.color[0];
                    colorData[ stride + 1 ] = WaterShallow.color[1];
                    colorData[ stride + 2 ] = WaterShallow.color[2];
                    colorData[ stride + 3 ] = WaterShallow.color[3];
                }
                else if((heightValue <= Sand.height)){
                    colorData[ stride ] = Sand.color[0];
                    colorData[ stride + 1 ] = Sand.color[1];
                    colorData[ stride + 2 ] = Sand.color[2];
                    colorData[ stride + 3 ] = Sand.color[3];
                }
                else if((heightValue <= Land1.height)){
                    colorData[ stride ] = Land1.color[0];
                    colorData[ stride + 1 ] = Land1.color[1];
                    colorData[ stride + 2 ] = Land1.color[2];
                    colorData[ stride + 3 ] = Land1.color[3];
                }
                else if((heightValue <= Land2.height)){
                    colorData[ stride ] = Land2.color[0];
                    colorData[ stride + 1 ] = Land2.color[1];
                    colorData[ stride + 2 ] = Land2.color[2];
                    colorData[ stride + 3 ] = Land2.color[3];
                }
                else if((heightValue <= Mountain1.height)){
                    colorData[ stride ] = Mountain1.color[0];
                    colorData[ stride + 1 ] = Mountain1.color[1];
                    colorData[ stride + 2 ] = Mountain1.color[2];
                    colorData[ stride + 3 ] = Mountain1.color[3];
                }
                else if((heightValue <= Mountain2.height)){
                    colorData[ stride ] = Mountain2.color[0];
                    colorData[ stride + 1 ] = Mountain2.color[1];
                    colorData[ stride + 2 ] = Mountain2.color[2];
                    colorData[ stride + 3 ] = Mountain2.color[3];
                }
                else if((heightValue <= Snow.height)){
                    colorData[ stride ] = Snow.color[0];
                    colorData[ stride + 1 ] = Snow.color[1];
                    colorData[ stride + 2 ] = Snow.color[2];
                    colorData[ stride + 3 ] = Snow.color[3];
                }

                heightData[index] = heightValue;
            }
        }

        if (mapCoordinate.x == 0 && mapCoordinate.y == 0 ){
            chunkRef.position.sub(new THREE.Vector3(0,0,0));
        }

        // used the buffer to create a DataTexture
        const texture = new THREE.DataTexture( colorData, width, height);
        texture.needsUpdate = true;

        //@ts-ignore
        chunkRef.material.map = texture;
        //chunkRef.material.side = THREE.DoubleSide;
        
        return heightData;
        
    }

    private Lighthing(){
        let light = new THREE.DirectionalLight(0x808080, 1);
        light.position.set(0, 100, -500);
        light.target.position.set(0, 0, 0);
        light.intensity = 2;
        light.castShadow = false;

        this._scene.add(light);
    }

    public Reset(){
        let noiseScale: HTMLInputElement = document.getElementById("noiseScale") as HTMLInputElement;
        let noiseSeed = document.getElementById("noiseSeed") as HTMLInputElement;
        let noiseZoom = document.getElementById("noiseZoom") as HTMLInputElement;
        let wireframe = document.getElementById("wireframe") as HTMLInputElement;
        let randomSeed = document.getElementById("randomSeed") as HTMLInputElement;

        if(parseFloat(noiseZoom.value) <= 0.0 || parseFloat(noiseZoom.value) > 1 || Number.isNaN(parseFloat(noiseZoom.value)))
        {
            window.alert("Use a correct zoom value");
            return;
        }

        this._scene.clear();
        this._terrian.clear();

        this.Lighthing();

        this._isWireFrame = wireframe.checked;

        //Noise generator
        let noiseParams: NoiseParams = new NoiseParams();
        noiseParams.scale = parseFloat(noiseScale.value);   //At what scale do you want to generate noise
        noiseParams.noiseType = "simplex";                  //What type of noise
        noiseParams.persistence = 3;                        //Controls the amplitude of octaves
        noiseParams.octaves = 4;                            //The amount of noise maps used
        noiseParams.lacunarity = 5;                         //Controls frequency of octaves
        if(randomSeed.checked){
            noiseParams.seed = Math.random();
            noiseSeed.value = noiseParams.seed;
        }
        else{
            noiseParams.seed = parseFloat(noiseSeed.value);
        }

        this._noise = new NoiseGenerator(noiseParams);

        //Create some terriantypes
        this._terrianTypes.push(
            { name: "WaterDeep",    height: -0.5,   color: [0, 0, 126, 255]},
            { name: "WaterShallow", height: 0.0,    color: [0, 0, 255, 255]},
            { name: "Sand",         height: 0.2,    color: [255, 255, 0, 255]},
            { name: "Land1",        height: 0.4,    color: [0, 255, 0, 255]},
            { name: "Land2",        height: 0.6,    color: [0, 126, 0, 255]},
            { name: "Mountain1",    height: 0.7,    color: [255, 150, 0, 255]},
            { name: "Mountain2",    height: 0.9,    color: [150, 75, 0, 255]},
            { name: "Snow",         height: 1.0,    color: [255, 255, 255, 255]}
        );

        //SET DEBUG MENU VALUES
        {
            let noiseScaleUI: HTMLInputElement = document.getElementById("noiseScale") as HTMLInputElement;
            noiseScaleUI.value = noiseParams.scale.toString();

            let noiseSeedUI = document.getElementById("noiseSeed") as HTMLInputElement;
            noiseSeedUI.value = noiseParams.seed.toString();

            let noiseZoomUI = document.getElementById("noiseZoom") as HTMLInputElement;
            noiseZoomUI.value = noiseZoom.value;
        }
    }

    private LoadAndUnload(){
        let playerChunkIndex: THREE.Vector2 = new THREE.Vector2(
            this._controlRef.object.position.x / this._chunkSize,
            this._controlRef.object.position.y / this._chunkSize
        );
        playerChunkIndex.round();

        for(let yOffset = -this._ChunksVisableInViewDst; yOffset <= this._ChunksVisableInViewDst; yOffset++){
            for(let xOffset = -this._ChunksVisableInViewDst; xOffset <= this._ChunksVisableInViewDst; xOffset++){

                let viewedChunkCoord : THREE.Vector2 = new THREE.Vector2(xOffset + playerChunkIndex.x, yOffset + playerChunkIndex.y);
                let viewedChunkCoordkString : string = viewedChunkCoord.x + "," + viewedChunkCoord.y;

                if(!this._terrian.has(viewedChunkCoordkString))
                {
                    let chunk : Chunk = new Chunk(viewedChunkCoord, this._chunkSize, this._isWireFrame, this._LODInfo, this.scene);
                    chunk.HeightMap = this.GenerateHeightMap(chunk.ChunkObject, viewedChunkCoord);

                    // const box = new THREE.BoxHelper( chunk.ChunkObject, 0xff0000 );
                    // box.setFromObject(chunk.ChunkObject);
                    // this._scene.add( box );

                    //this._scene.add( chunk.ChunkObject )
                    this._terrian.set(viewedChunkCoordkString, chunk);
                }
                else{

                    this._terrian.get(viewedChunkCoordkString)?.UpdateChunkVisibility(this._controlRef.object.position);
                }
            }
        }
    }

    public updateEntities(deltaTime: number){
        //let worker = new Worker(this.LoadAndUnload);
        
        this.LoadAndUnload();
    }
}