import * as THREE from "three";
import { Mesh, Vector3 } from "three";
import NoiseGenerator, { NoiseParams } from "./Noise"
import { degToRad, reverseNumberInRange } from "./Utisl";

interface TerrianType {
    name: string,
    height: number,
    color: number[]
};

export default class World{
    private _scene: THREE.Scene;
    private _noise: NoiseGenerator;
    private _terrianTypes: any[] = new Array<TerrianType>(); //Because of stupid type checking we vcan not 

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
        noiseParams.octaves = 4;            //The amount of noise maps used
        noiseParams.lacunarity = 5;         //Controls frequency of octaves
        noiseParams.exponentiation = 1;     //???
        noiseParams.seed = 1234;            // Math.random(); //Generate a random seed

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

        const texture = new THREE.TextureLoader().load('./assets/land.jpg');

        //Later maybe have different materials for different terrian types?
        let phongMaterial = new THREE.MeshPhongMaterial({
            wireframe: true,
            color: 0x808080,
            side: THREE.DoubleSide,
            //vertexColors: true
            map: texture
        });
        phongMaterial.flatShading = true;

        let resolution = 256;
        let chunkSize = 400;
        let chunk = new THREE.Mesh(
            new THREE.PlaneGeometry(chunkSize, chunkSize, resolution, resolution),
            phongMaterial
        );
        chunk.rotation.x = degToRad(90);
        
        const heightMap = this.GenerateHeightMap(chunk);
        this.ApplyHeightMap(chunk, heightMap);

        //console.log(chunk);
        
        this._scene.add( chunk );
    }

    //Offset the vertices in the z
    private ApplyHeightMap(chunkRef: THREE.Mesh, heightMap: Array<Number>){
        //@ts-ignore
        let vertices = chunkRef.geometry.attributes.position["array"];

        // +1 because this is what three js always does
        //@ts-ignore
        let width = chunkRef.geometry.parameters.widthSegments + 1;
        //@ts-ignore
        let height = chunkRef.geometry.parameters.heightSegments + 1;

        for(let y = 0; y < height; y++){
            for (let x = 0; x < width; x++) {

                //We need to add 3 since each vertex is
                //(x, y, z)
                let index = y * width + x;
                let heightDataIndex = reverseNumberInRange(y, 0, height);
                heightDataIndex = heightDataIndex * width + x;
                const vertexIndex = index * 3;

                if(heightMap[heightDataIndex] <= 0.0){
                    //@ts-ignore
                    vertices[vertexIndex + 2] = 0;
                }else{
                    //@ts-ignore
                    vertices[vertexIndex + 2] = -heightMap[heightDataIndex] * heightMap[heightDataIndex] * 77.0;
                }
                
            }
        }
        
        //Recalculate the normals
        chunkRef.geometry.computeVertexNormals();
    }

    private GenerateHeightMap(chunkRef: THREE.Mesh) : Array<Number>{
        // create a buffer with color data
        //@ts-ignore
        let width = chunkRef.geometry.parameters.widthSegments + 1;
        //@ts-ignore
        let height = chunkRef.geometry.parameters.heightSegments + 1;

        const size = width * height;
        const colorData = new Uint8Array( 4 * size );
        const heightData = new Array<Number>( size );
        
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

                let heightValue = this._noise.Get(x, y);
                
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


        // used the buffer to create a DataTexture
        const texture = new THREE.DataTexture( colorData, width, height);
        texture.needsUpdate = true;

        //@ts-ignore
        chunkRef.material.map = texture;
        
        return heightData;
    }

    private Lighthing(){
        let light = new THREE.DirectionalLight(0x808080, 1);
        light.position.set(0, 100, 150);
        light.target.position.set(0, 0, 0);
        light.intensity = 2;
        light.castShadow = false;

        this._scene.add(light);
    }

    public updateEntities(deltaTime: number){

    }
}