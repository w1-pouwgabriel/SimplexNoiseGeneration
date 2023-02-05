import SimplexNoise from "./SimplexNoise"

export default class Game {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private _noise?: SimplexNoise;
    
    constructor() {
        let domElement = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
        domElement.id = "canvas";
        domElement.setAttribute("width", window.innerWidth.toString());
        domElement.setAttribute("height", window.innerHeight.toString());

        document.body.appendChild(domElement);

        let canvas = document.getElementById("canvas") as HTMLCanvasElement;
        let context = canvas.getContext("2d") as CanvasRenderingContext2D;

        window.addEventListener("resize", this.onResize, false);

        this.canvas = canvas;
        this.context = context;

        //Noise generator
        this._noise = new SimplexNoise();
    }

    public Render(){
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for(let i = 0; i < data.length; i += 4){
            let y = Math.round(i / this.canvas.height);
            let x = i;

            let color : number = this._noise?.get2D(x, y) ? this._noise?.get2D(x, y) : 0;

            data[i] = color * 255;      // red
            data[i + 1] = color * 255;  // green
            data[i + 2] = color * 255;  // blue
            data[i + 3] = 255   // alpha
        }

        this.context.putImageData(imageData, 0, 0);
        requestAnimationFrame(this.Render.bind(this));
    }

    private onResize(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}

const game = new Game();
// @ts-ignore
window.game = game;

game.Render();