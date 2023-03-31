import * as THREE from "three";
import { Vector2 } from "three";
import ChunkLOD, { LODInfo } from "./LOD"

export default class Chunk{

    private _ChunkObject : THREE.Mesh = new THREE.Mesh();
    private _Bounds: THREE.Box3 = new THREE.Box3();
    private _Position: Vector2 = new Vector2();
    private _IsVisible: boolean = false;

    private _LODs: Array<ChunkLOD> = new Array();
    private _LODInfo: Array<LODInfo> = new Array();

    private _PrevicousLODIndex: number = -1;

    public get IsVisible() : boolean{
        return this.IsVisible;
    }

    public get ChunkObject(){
        return this._ChunkObject;
    }

    public get Bound(){
        return this._Bounds;
    }

    constructor(coords: Vector2, size: number, isWireFrame: boolean, detailLevels: Array<LODInfo>, sceneRef: THREE.Scene){
        this._Position = new THREE.Vector2(coords.x * size, coords.y * size);

        this._LODInfo = detailLevels;

        let phongMaterial = new THREE.MeshPhongMaterial({
            wireframe: isWireFrame,
            color: 0x808080,
            side: THREE.DoubleSide,
        });
        
        this._ChunkObject = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size, 4, 4),
            phongMaterial
        );
        this._ChunkObject.visible = false;

        sceneRef.add(this._ChunkObject);

        for(let i = 0; i < detailLevels.length; i++){
            let LOD : ChunkLOD = new ChunkLOD(i, size, isWireFrame, detailLevels[i].Resolution);

            LOD.ChunkPosition = new THREE.Vector3(this._Position.x, this._Position.y, 0);

            this._LODs.push(LOD);

            const box = new THREE.BoxHelper( LOD._Chunk, 0xff0000 );
            box.setFromObject(LOD._Chunk);
            sceneRef.add( box );

            sceneRef.add(LOD._Chunk);
        }
        
        let min : THREE.Vector3 = new THREE.Vector3(this._Position.x - size, this._Position.y - size, 0.0);
        let max : THREE.Vector3 = new THREE.Vector3(this._Position.x + size, this._Position.y + size, 1.0);
        this._Bounds = new THREE.Box3(
            min,
            max
        );
    }

    public UpdateChunkVisibility(ObjectPosition: THREE.Vector3){
        let distanceToClosestPoint = this._Bounds.distanceToPoint(ObjectPosition);
        const isVisible = distanceToClosestPoint <= this._LODInfo[this._LODInfo.length - 1].VisibleDistanceThreshold * 0.8;

        if(isVisible){
            let lodIndex = 0;

            for(let i = 0; this._LODInfo.length; i++){
                if(distanceToClosestPoint > this._LODInfo[i].VisibleDistanceThreshold){
                    this._LODs[lodIndex]._Chunk.visible = false; // Not the LOD in range so make sure its not being drawn
                    lodIndex = i + 1;
                }else{
                    break;
                }
            }

            if(lodIndex != this._PrevicousLODIndex){
                let currentLOD : ChunkLOD = this._LODs[lodIndex];

                if(currentLOD.HasMesh){
                    this._PrevicousLODIndex = lodIndex;
                    this._ChunkObject = currentLOD._Chunk;
                }
            }
        }
        
        this.SetVisible(isVisible);
    }

    private SetVisible(isVisible: boolean){
        this._ChunkObject.visible = isVisible;
        this._IsVisible = isVisible;
    }
}