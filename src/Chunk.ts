import * as THREE from "three";
import { Vector2, Vector3 } from "three";
import { degToRad } from "./Utisl";

export default class Chunk{

    private _ChunkObject : THREE.Mesh = new THREE.Mesh();
    private _Position: Vector2 = new Vector2();
    private _AABB: THREE.Box3 = new THREE.Box3();
    private _IsVisible: boolean = false;

    public get IsVisible() : boolean{
        return this.IsVisible;
    }

    public get ChunkObject(){
        return this._ChunkObject;
    }

    constructor(coords: Vector2, size: number){
        this._Position = new THREE.Vector2(coords.x * size, coords.y * size);

        let max : Vector2 = new Vector2(1,1);
        this._AABB = new THREE.Box3(
            new Vector3(this._Position.x, this._Position.y,  1.0),  //Min
            new Vector3((max.multiplyScalar(size).x / 10.0, max.multiplyScalar(size).y / 10.0, 1.0) //Max
        ));
        
        const position3D : Vector3 = new Vector3(this._Position.x, 0, this._Position.y);
        const texture = new THREE.TextureLoader().load('./assets/land.jpg'); //Defualy material to fall back on

        //Later maybe have different materials for different terrian types?
        let phongMaterial = new THREE.MeshPhongMaterial({
            wireframe: false,
            color: 0x808080,
            side: THREE.BackSide,
            map: texture
        });
        phongMaterial.flatShading = true;

        let resolution = 256; //256, 128, 64, 32, 16, 8
        let chunkSize = 400;
        let chunk = new THREE.Mesh(
            new THREE.PlaneGeometry(chunkSize, chunkSize, resolution, resolution),
            phongMaterial
        );
        chunk.position.copy(position3D);
        chunk.rotation.x = degToRad(90);
    }

    public Update(maxViewDst: number){
        const position3D : Vector3 = new Vector3(this._Position.x, this._Position.y, 1);
        const viewDstFromNearestEdge = Math.sqrt(this._AABB.distanceToPoint(position3D));
        const isVisible = viewDstFromNearestEdge <= maxViewDst;
        this.SetVisible(isVisible);
    }

    private SetVisible(isVisible: boolean){
        this._ChunkObject.visible = isVisible;
        this._IsVisible = isVisible;
    }
}