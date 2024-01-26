import * as THREE from "three";

export interface LODInfo{
    Lod: number;
    VisibleDistanceThreshold: number;
    Resolution: number;
}

export default class ChunkLOD
{
    public _Chunk: THREE.Mesh;
    private _LODLevel: number;
    private _hasMesh: boolean = false;

    public set ChunkPosition(position: THREE.Vector3){
        this._Chunk.position.set(position.x, position.y, position.z);
    }

    public get HasMesh() : boolean{
        return this._hasMesh;
    }

    constructor(lodLevel: number, size: number, isWireframe: boolean, resolution: number){
        this._LODLevel = lodLevel;
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

    private CalculateNormals(){
        let indices = this._Chunk.geometry.getIndex();
        let vertices = this._Chunk.geometry.getAttribute("position");
        let normals = this._Chunk.geometry.getAttribute("normal");

        let verticesGrouped : Array<THREE.Vector3> = new Array;
        let computeNormals : Array<THREE.Vector3> = new Array;

        for(let i = 0; i <= vertices.count / 3; i++){
            //@ts-ignore
            let vertexVector : THREE.Vector3 = new THREE.Vector3(vertices.array[i], vertices.array[i+1], vertices.array[i+2]);
            verticesGrouped.push(vertexVector);
        }

        //@ts-ignore
        for(let i = 0; i <= indices?.count / 3; i++){
            let normalTriangleIndex = i * 3;
            let vertexIndexA = indices?.array[normalTriangleIndex];
			let vertexIndexB = indices?.array[normalTriangleIndex + 1];
			let vertexIndexC = indices?.array[normalTriangleIndex + 2];

            console.log(normalTriangleIndex)
            
        }
    }

    private SurfaceNormalFromIndices(indexA : number, indexB : number, indexC : number, verticesGrouped : Array<THREE.Vector3>) : THREE.Vector3 {
        let pointA : THREE.Vector3 = verticesGrouped [indexA];
        let pointB : THREE.Vector3 = verticesGrouped [indexB];
        let pointC : THREE.Vector3 = verticesGrouped [indexC];

        let sideAB : THREE.Vector3 = pointB.min(pointA);
        let sideAC : THREE.Vector3 = pointC.min(pointA);

        return sideAB.cross(sideAC).normalize();
    }
}