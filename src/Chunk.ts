import * as THREE from "three";
import { Vector2 } from "three";
import ChunkLOD, { LODInfo } from "./LOD"
import { reverseNumberInRange } from "./Utisl";

export default class Chunk{

    private _ChunkObject : THREE.Mesh = new THREE.Mesh();
    private _Bounds: THREE.Box3 = new THREE.Box3();
    private _Position: Vector2 = new Vector2();
    private _IsVisible: boolean = false;

    private _LODs: Array<ChunkLOD> = new Array();
    private _LODInfo: Array<LODInfo> = new Array();

    private _PrevicousLODIndex: number = -1;

    private _HeightMap: Array<number> = new Array();

    public get IsVisible() : boolean{
        return this.IsVisible;
    }

    public get ChunkObject(){
        return this._ChunkObject;
    }

    public get Bound(){
        return this._Bounds;
    }

    public set HeightMap(NewHeightMap: Array<number>){
        this._HeightMap = NewHeightMap;

        this.ApplyHeightMap();
    }

    constructor(coords: Vector2, size: number, isWireFrame: boolean, detailLevels: Array<LODInfo>, sceneRef: THREE.Scene){
        this._Position = new THREE.Vector2(coords.x * size, coords.y * size);

        this._LODInfo = detailLevels;

        let phongMaterial = new THREE.MeshPhongMaterial({
            wireframe: isWireFrame,
            color: 0x808080,
            side: THREE.BackSide,
        });
        phongMaterial.flatShading = true;
        
        this._ChunkObject = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size, detailLevels[0].Resolution, detailLevels[0].Resolution),
            phongMaterial
        );
        this._ChunkObject.visible = false;

        sceneRef.add(this._ChunkObject);

        for(let i = 0; i < detailLevels.length; i++){
            let LOD : ChunkLOD = new ChunkLOD(i, size, isWireFrame, detailLevels[i].Resolution);

            LOD.ChunkPosition = new THREE.Vector3(this._Position.x, this._Position.y, 0);

            this._LODs.push(LOD);

            sceneRef.add(LOD._Chunk);
        }
        
        let min : THREE.Vector3 = new THREE.Vector3(this._Position.x - size, this._Position.y - size, 0.0);
        let max : THREE.Vector3 = new THREE.Vector3(this._Position.x + size, this._Position.y + size, 1.0);
        this._Bounds = new THREE.Box3(
            min,
            max
        );
    }

    private ApplyHeightMap(){
        for(let i = 0; i < this._LODInfo.length; i++){
            let LODChunkRef : THREE.Mesh = this._LODs[i]._Chunk;
            
            let lodRatio = this._LODInfo[0].Resolution / this._LODInfo[i].Resolution;

            //@ts-ignore
            let vertices = LODChunkRef.geometry.getAttribute("position").array;
            //@ts-ignore
            let width = LODChunkRef.geometry.parameters.widthSegments + 1;
            //@ts-ignore
            let height = LODChunkRef.geometry.parameters.heightSegments + 1;

            let highestLODWidth = this._LODInfo[0].Resolution + 1;
            
            for(let y = 0; y < height; y++){
                for (let x = 0; x < width; x++) {
                    //We need to add 3 since each vertex is
                    //(x, y, z)
                    let index = y * width + x
                    const vertexIndex = index * 3;

                    let heightValue : number = 0;

                    let heightDataIndex : number = reverseNumberInRange(y, 0, height - 1);

                    heightDataIndex = (heightDataIndex * lodRatio) * highestLODWidth + (x * lodRatio);

                    heightValue = -this._HeightMap[heightDataIndex] * this._HeightMap[heightDataIndex] * 2.0;

                    if(this._HeightMap[heightDataIndex] <= 0){
                        heightValue = 0;
                    }

                    if(!isNaN(heightValue)) {
                        //@ts-ignore
                        vertices[vertexIndex + 2] = heightValue * 200;
                    }
                    else{
                        //@ts-ignore
                        vertices[vertexIndex + 2] = 0;
                        //console.log('NaN')
                    }
                }
            }
            
            //Recalculate the normals
            LODChunkRef.geometry.computeVertexNormals();
            //this.FlatShading(LODChunkRef);
            //LODChunkRef.

            //console.log(LODChunkRef);
        }
    }

    private FlatShading(chunkRef: THREE.Mesh){
        let vertices = chunkRef.geometry.getAttribute("position");
        let normals = chunkRef.geometry.getAttribute("normal");
        let indices = chunkRef.geometry.getIndex();

        let indexVertices : Array<THREE.Vector3> = new Array;
        let computeNormals : Array<THREE.Vector3> = new Array(vertices.count * vertices.itemSize);
        computeNormals.fill(new THREE.Vector3(0,0,0));


        
        //Index all the vertices so they allign with the index numbers
        for(let i = 0; i < (vertices.count * vertices.itemSize); i += 3 ){
            indexVertices.push(new THREE.Vector3(vertices.array[i], vertices.array[i+1], vertices.array[i+2]))
        }

        for(let i = 0; i < indices.count; i += 3){
            let vertexA: THREE.Vector3 = indexVertices[indices.array[i]];
            let vertexB: THREE.Vector3 = indexVertices[indices.array[i + 1]];
            let vertexC: THREE.Vector3 = indexVertices[indices.array[i + 2]];

            let vertexAB: THREE.Vector3 = vertexB.sub(vertexA);
            let vertexAC: THREE.Vector3 = vertexC.sub(vertexA);

            let faceNormal: THREE.Vector3 = this.Cross(vertexAB, vertexAC);
            faceNormal = faceNormal.normalize();

            
        }

        //computeNormals = normals.array;
    }

    private Cross(a: THREE.Vector3, b: THREE.Vector3) : THREE.Vector3 {
        let result : THREE.Vector3 = new THREE.Vector3();
        result.x = a.y*b.z - a.z*b.y;
        result.y = a.z*b.x - a.x*b.z;
        result.z = a.x*b.y - a.y*b.x;
        return result;
    }

    public UpdateChunkVisibility(ObjectPosition: THREE.Vector3){
        let distanceToClosestPoint = this._Bounds.distanceToPoint(ObjectPosition);
        const isVisible = distanceToClosestPoint <= this._LODInfo[this._LODInfo.length - 1].VisibleDistanceThreshold * 0.7;

        if(isVisible){
            let lodIndex = 0;

            for(let i = 0; i < this._LODInfo.length; i++){
                if(distanceToClosestPoint > this._LODInfo[i].VisibleDistanceThreshold){
                    lodIndex = i + 1;
                }else{
                    break;
                }
            }

            if(lodIndex != this._PrevicousLODIndex){
                let currentLOD : ChunkLOD = this._LODs[lodIndex];

                if(currentLOD.HasMesh){
                    this._PrevicousLODIndex = lodIndex;

                    const oldRef : THREE.Mesh = this._ChunkObject.clone();

                    this._ChunkObject = currentLOD._Chunk;
                    this._ChunkObject.material = oldRef.material;
                }
            }
            
            for(let i = 0; i < this._LODs.length; i++){
                if(this._LODs[i].HasMesh){
                    this._LODs[i]._Chunk.visible = false; // Not the LOD in range so make sure its not being drawn
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