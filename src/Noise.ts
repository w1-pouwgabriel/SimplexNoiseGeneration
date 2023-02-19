import SimplexNoise from "simplex-noise";
import alea from "alea";

interface Noise{
    perlin: PerlinNoise,
    simplex: SimplexNoise,
    random: RandomNoise
}

export class NoiseParams{
    public scale: number = 256;             //At what scale do you want to generate noise
    public noiseType: string = "simplex";   //What type of noise
    public persistence: number = 10;        //Controls the amplitude of octaves
    public octaves: number = 0.5;           //The amount of noise maps used
    public lacunarity: number = 2;          //Controls frequency of octaves
    public exponentiation: number = 4;      //???
    public height: number = 64;             //Max height of the heightmap
    public seed: any = Math.random();       //Generate a random seed
}

export default class NoiseGenerator {
    private _params: NoiseParams;
    private _noise: Noise;
    private _maxHeight: number;
    private _minHeight: number;

    public get noice() : Noise{
        return this._noise;
    }

    public set parms(params: NoiseParams) {
        this._params = params;
    }

    constructor(params : NoiseParams) {
        if(params.scale == 0.0){
            params.scale = 0.001;
        }
        this._params = params;
        this._noise = {
            simplex: new SimplexNoise(alea(this._params.seed)),
            perlin: new PerlinNoise(this._params),
            random: new RandomNoise(this._params)
        };
        this._maxHeight = 1;
        this._minHeight = 1;
    }

    public Get(x: number, y: number) : number {
        let noiseFunc;
        if(this._params.noiseType == "simplex"){
            noiseFunc = this._noise["simplex"];
        }
        else if(this._params.noiseType == "perlin"){
            noiseFunc = this._noise["perlin"];
        }
        else{
            noiseFunc = this._noise["random"];
        }

        let amplitude = 1.0;
        let frequency = 1.0;
        let normalization = 0;
        let total = 0;

        for (let o = 0; o < this._params.octaves; o++) {
            //Sample coordinates
            const xs = x / this._params.scale * frequency;
            const ys = y / this._params.scale * frequency;

            const noiseValue = noiseFunc.noise2D(xs , ys);
            total += noiseValue * amplitude;
            
            normalization += amplitude;
            amplitude *= this._params.persistence;
            frequency *= this._params.lacunarity;
        }
        total /= normalization;
        
        return Math.pow(total, this._params.exponentiation);
      }

    // public Get(x: number, y: number) : number {
    //     const xs = x / this._params.scale;
    //     const ys = y / this._params.scale;
    //     let noiseFunc;
    //     if(this._params.noiseType == "simplex"){
    //         noiseFunc = this._noise["simplex"];
    //     }
    //     else if(this._params.noiseType == "perlin"){
    //         noiseFunc = this._noise["perlin"];
    //     }
    //     else{
    //         noiseFunc = this._noise["random"];
    //     }
    //     const G = 2.0 ** (-this._params.persistence);
    //     let amplitude = 1.0;
    //     let frequency = 1.0;
    //     let normalization = 0;
    //     let total = 0;
    //     for (let o = 0; o < this._params.octaves; o++) {
    //       const noiseValue = noiseFunc.noise2D(
    //           xs * frequency, ys * frequency) * 0.5 + 0.5;
    //       total += noiseValue * amplitude;

    //       normalization += amplitude;
    //       amplitude *= G;
    //       frequency *= this._params.lacunarity;
    //     }
    //     total /= normalization;

    //     return Math.pow(
    //         total, this._params.exponentiation) * this._params.height;
    //   }
}


class PerlinNoise{
    constructor(params: NoiseParams){

    }

    public noise2D(x: number, y: number) : number{
        return 1.0;
    }
}

class RandomNoise{
    constructor(params: NoiseParams){

    }

    public noise2D(x: number, y: number) : number{
        return 1.0;
    }
}
