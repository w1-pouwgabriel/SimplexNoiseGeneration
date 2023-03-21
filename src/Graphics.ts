import * as THREE from "three";
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'
import { Vec2, Vector2 } from "three";

export default class Graphics{
    private _camera: THREE.Camera;
    private _renderer: THREE.WebGLRenderer;
    private _sceneRef: THREE.Scene;
    private _controls: FlyControls;

    private _windowSize: Vec2;

    public get renderer(){
        return this._renderer;
    }

    public get camera(){
        return this._renderer;
    }

    constructor(sceneRef: THREE.Scene){
        this._renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this._renderer.domElement);
  
        window.addEventListener('resize', () => {this.OnWindowResize()}, false);

        this._windowSize = new Vector2(window.innerWidth, window.innerHeight);
  
        const fov = 75;
        const aspect = this._windowSize.x / this._windowSize.y;
        const near = 0.1;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(0, 300, 250);
        this._camera.lookAt(0,0,0);

        this._controls = new FlyControls(this._camera, this._renderer.domElement);
        this._controls.movementSpeed = 100;
        this._controls.rollSpeed = 0.3;
        this._controls.dragToLook = true;

        this._sceneRef = sceneRef;
    }

    private async OnWindowResize(){
        this._windowSize = new Vector2(window.innerWidth, window.innerHeight);
    
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public Render(){
        this._controls.update(1/60);
        this._renderer.render(this._sceneRef, this._camera);
    }

} 