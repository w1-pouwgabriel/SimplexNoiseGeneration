const PI: number = 3.14159265359;
const PI2: number = PI / 180;

export function degToRad(Degrees: number): number{
    return Degrees * PI2;
};

export function rand_range(a: number, b: number): number {
    return Math.random() * (b - a) + a;
  };

export function rand_normalish() {
    const r = Math.random() + Math.random() + Math.random() + Math.random();
    return (r / 4.0) * 2.0 - 1;
  };

export function rand_int(a: number, b: number) : number {
    return Math.round(Math.random() * (b - a) + a);
};

export function lerp(x: number, a: number, b:number) : number {
    return x * (b - a) + a;
  };

export function smoothstep(x: number, a: number, b: number) : number {
    x = x * x * (3.0 - 2.0 * x);
    return x * (b - a) + a;
  };

export function smootherstep(x: number, a: number, b: number) : number {
    x = x * x * x * (x * (x * 6 - 15) + 10);
    return x * (b - a) + a;
  };

export function clamp(x: number, a: number, b: number): number {
    return Math.min(Math.max(x, a), b);
  };

  export function sat(x: number): number {
    return Math.min(Math.max(x, 0.0), 1.0);
  };

  export function reverseNumberInRange(num: number, min: number, max: number) : number{
    return (max + min) - num;
  };

  export function nearestPowerOf2(n : number) : number {
    return 1 << 31 - Math.clz32(n);
  };