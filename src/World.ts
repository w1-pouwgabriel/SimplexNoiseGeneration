import * as THREE from "three";
import { Mesh, Vector3 } from "three";
import NoiseGenerator, { NoiseParams } from "./Noise"
import { degToRad, reverseNumberInRange } from "./Utisl";

interface TerrianType {
    name: string,
    height: number,
    color: number
};

export default class World{
    private _scene: THREE.Scene;
    private _noise?: NoiseGenerator;
    private _terrianTypes: TerrianType[];

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
        noiseParams.persistence = 55;        //Controls the amplitude of octaves
        noiseParams.octaves = 2;            //The amount of noise maps used
        noiseParams.lacunarity = 3;         //Controls frequency of octaves
        noiseParams.exponentiation = 1;     //???
        noiseParams.seed = Math.random();   // Math.random(); //Generate a random seed

        this._noise = new NoiseGenerator(noiseParams);

        //Create some terriantypes
        this._terrianTypes = new Array; 
        this._terrianTypes.push(
            { name: "Water", height: 0.0, color: 0xFF0000},
            { name: "Sand", height: 0.2, color: 0xFFFF00},
            { name: "Land", height: 1.0, color: 0x0000FF}
        );

        const texture = new THREE.TextureLoader().load('./assets/land.jpg');

        //Later maybe have different materials for different terrian types?
        let phongMaterial = new THREE.MeshPhongMaterial({
            wireframe: false,
            color: 0x808080,
            side: THREE.DoubleSide,
            //vertexColors: true
            map: texture
        });
        phongMaterial.flatShading = true;

        let resolution = 300;
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

        vertices[2] = -15;

        for(let y = 0; y < height; y++){
            for (let x = 0; x < width; x++) {

                //We need to add 3 since each vertex is
                //(x, y, z)
                let index = y * width + x;
                let heightDataIndex = reverseNumberInRange(y, 0, height);
                heightDataIndex = heightDataIndex * width + x;
                const vertexIndex = index * 3;

                if(heightMap[heightDataIndex] < 0.0){
                    //@ts-ignore
                    vertices[vertexIndex + 2] = 0;
                }else{
                    //@ts-ignore
                    vertices[vertexIndex + 2] = -heightMap[heightDataIndex] * 55.0;
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

        //@ts-ignore
        let vertices = chunkRef.geometry.attributes.position["array"];
        for(let y = 0; y < height; y++)
        {
            for(let x = 0; x < width; x++)
            {
                const index = (y * width + x);
                const stride = index * 4;

                let water = this._terrianTypes.find(terrianType => terrianType.name == "Water");
                let sand = this._terrianTypes.find(terrianType => terrianType.name == "Sand");
                let land = this._terrianTypes.find(terrianType => terrianType.name == "Land");

                let heightValue = this._noise.Get(x, y);
                
                //@ts-ignore
                if(heightValue <= water.height){
                    colorData[ stride ] = 0;
                    colorData[ stride + 1 ] = 0;
                    colorData[ stride + 2 ] = 255;
                    colorData[ stride + 3 ] = 255;
                }
                else if(heightValue <= sand.height){
                    colorData[ stride ] = 255;
                    colorData[ stride + 1 ] = 255;
                    colorData[ stride + 2 ] = 0;
                    colorData[ stride + 3 ] = 255;
                }
                else if((heightValue <= land.height)){
                    colorData[ stride ] = 0;
                    colorData[ stride + 1 ] = 255;
                    colorData[ stride + 2 ] = 0;
                    colorData[ stride + 3 ] = 255;
                }

                heightData[index] = heightValue;
            }
        }


        // used the buffer to create a DataTexture
        const texture = new THREE.DataTexture( colorData, width, height);
        texture.needsUpdate = true;

        chunkRef.material.map = texture;
        
        return heightData;
    }

    private Lighthing(){
        let light = new THREE.DirectionalLight(0x808080, 1);
        light.position.set(0, 100, 150);
        light.target.position.set(0, 0, 0);
        light.intensity = 2;
        //light.castShadow = false;

        this._scene.add(light);
    }

    public updateEntities(deltaTime: number){

    }
}