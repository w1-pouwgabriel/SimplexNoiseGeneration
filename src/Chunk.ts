import * as THREE from "three";
import { Vector2 } from "three";
import { degToRad } from "./Utisl";

export default class Chunk{

    private _ChunkObject : THREE.Mesh = new THREE.Mesh();
    private _Bounds: THREE.Box3 = new THREE.Box3();
    private _Position: Vector2 = new Vector2();
    private _IsVisible: boolean = false;

    public get IsVisible() : boolean{
        return this.IsVisible;
    }

    public get ChunkObject(){
        return this._ChunkObject;
    }

    public get Bound(){
        return this._Bounds;
    }

    constructor(coords: Vector2, size: number){
        this._Position = new THREE.Vector2(coords.x * size, coords.y * size);
        
        let phongMaterial = new THREE.MeshPhongMaterial({
            wireframe: false,
            color: 0x808080,
            side: THREE.BackSide,
        });
        phongMaterial.flatShading = true;

        let resolution = 32; //256, 128, 64, 32
        this._ChunkObject = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size, resolution, resolution),
            phongMaterial
        );
        //chunk.position.add(new THREE.Vector3((this._chunkSize * xOffset) + 25 * xOffset, 0, (this._chunkSize * yOffset) + 25 * yOffset));
        this._ChunkObject.position.add(new THREE.Vector3(this._Position.x, this._Position.y, 0));
        //this._ChunkObject.rotation.x = degToRad(90);
        this._ChunkObject.visible = this._IsVisible;

        let min : THREE.Vector3 = new THREE.Vector3(this._Position.x - size, this._Position.y - size, 0.0);
        let max : THREE.Vector3 = new THREE.Vector3(this._Position.x + size, this._Position.y + size, 1.0);
        this._Bounds = new THREE.Box3(
            min,
            max
        );
    }

    public UpdateChunkVisibility(maxViewDst: number, ObjectPosition: THREE.Vector3){
        let distanceToClosestPoint = this._Bounds.distanceToPoint(ObjectPosition);
        const isVisible = distanceToClosestPoint <= maxViewDst * 0.8;
        
        this.SetVisible(isVisible);
    }

    private SetVisible(isVisible: boolean){
        this._ChunkObject.visible = isVisible;
        this._IsVisible = isVisible;
    }
}