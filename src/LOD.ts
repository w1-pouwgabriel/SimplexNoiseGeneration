import * as THREE from "three";
import {nearestPowerOf2} from "./Utisl"

export interface LODInfo{
    Lod: number;
    VisibleDistanceThreshold: number;
    Resolution: number;
}

export default class ChunkLOD
{
    public _Chunk: THREE.Mesh;
    private _LODLevel: number;
    private _hasRequestedMesh: boolean = false;
    private _hasMesh: boolean = false;

    public set ChunkPosition(position: THREE.Vector3){
        this._Chunk.position.set(position.x, position.y, position.z);
    }

    public get HasMesh() : boolean{
        return this._hasMesh;
    }

    constructor(lodLevel: number, size: number, isWireframe: boolean, resolution: number){
        this._LODLevel = lodLevel;
        this._hasRequestedMesh = false;
        this._hasMesh = false;

        let phongMaterial = new THREE.MeshPhongMaterial({
            wireframe: isWireframe,
            color: 0x808080,
            side: THREE.BackSide,
        });
        phongMaterial.flatShading = true;
        
        this._Chunk = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size, resolution, resolution),
            phongMaterial
        );
        this._Chunk.visible = false;

        this._hasMesh = true;
    }
}