import * as THREE from "three";
import { Mesh, Vector3 } from "three";
import NoiseGenerator, { NoiseParams } from "./Noise"
import { degToRad } from "./Utisl";

interface TerrianType {
    name: string,
    height: number,
    color: number
};

export default class World{
    private _scene: THREE.Scene;
    private _chunk: THREE.Mesh = new Mesh();
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
        noiseParams.persistence = 3;        //Controls the amplitude of octaves
        noiseParams.octaves = 3;            //The amount of noise maps used
        noiseParams.lacunarity = 3;         //Controls frequency of octaves
        noiseParams.exponentiation = 1;     //???
        noiseParams.height = 3;            //The height of the heightmap
        noiseParams.seed = Math.random();   // Math.random(); //Generate a random seed

        this._noise = new NoiseGenerator(noiseParams);

        //Create some terriantypes
        this._terrianTypes = new Array; 
        this._terrianTypes.push(
            { name: "Water", height: -15.0, color: 0xFF0000},
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

        let resolution = 55;
        let chunkSize = 100;
        this._chunk = new THREE.Mesh(
            new THREE.PlaneGeometry(chunkSize, chunkSize, resolution, resolution),
            phongMaterial
            );
        this._chunk.castShadow = false;
        this._chunk.receiveShadow = true;
        this._chunk.position.set(0,0,0);
        
        this.ApplyHeightMap();
        this.ApplyTerrianMap();

        console.log(this._chunk);
        
        this._scene.add( this._chunk );
    }

    //Offset the vertices in the z
    private ApplyHeightMap(){
        //@ts-ignore
        let vertices = this._chunk.geometry.attributes.position["array"];

        // +1 because this is what three js always does
        let width = this._chunk.geometry.parameters.widthSegments + 1;
        let height = this._chunk.geometry.parameters.heightSegments + 1;

        for(let y = 0; y < height; y++){
            for (let x = 0; x < width; x++) {

                //We need to add 3 since each vertex is
                //(x, y, z)
                let index = (y * width + x) * 3;

                //@ts-ignore
                vertices[index + 2] = this._noise.Get(vertices[index] + this._chunk.position.x, vertices[index + 1] + this._chunk.position.z);
            }
        }
        
        //Recalculate the normals
        this._chunk.geometry.computeVertexNormals();
    }

    private ApplyTerrianMap(){
        // create a buffer with color dataw
        let width = this._chunk.geometry.parameters.widthSegments + 1;
        let height = this._chunk.geometry.parameters.heightSegments + 1;

        const size = width * height;
        const data = new Uint8Array( 4 * size );

        let vertices = this._chunk.geometry.attributes.position["array"];
        for(let y = 0; y < height; y++)
        {
            for(let x = 0; x < width; x++)
            {
                const index = (y * width + x);
                const stride = index * 4;
                const vertexIndex = index * 3;

                let water = this._terrianTypes.find(terrianType => terrianType.name == "Water");
                if(vertices[vertexIndex + 2] < water.height){
                    data[ stride ] = 0;
                    data[ stride + 1 ] = 0;
                    data[ stride + 2 ] = 255;
                    data[ stride + 3 ] = 255;
                }
                else{
                    data[ stride ] = 0;
                    data[ stride + 1 ] = 255;
                    data[ stride + 2 ] = 0;
                    data[ stride + 3 ] = 255;
                }
            }
        }

        // used the buffer to create a DataTexture
        const texture = new THREE.DataTexture( data, width, height, THREE.RGBAFormat );
        texture.needsUpdate = true;

        this._chunk.material.map = texture;
    }

    private Lighthing(){
        let light = new THREE.DirectionalLight(0x808080, 1);
        light.position.set(0, -30, 150);
        light.target.position.set(0, 0, 0);
        //light.castShadow = false;

        this._scene.add(light);
    }

    public updateEntities(deltaTime: number){
        //this._chunk.rotation.z += deltaTime * degToRad(25);
    }
}