declare global {
  interface Math {
    Clamp(num: number, min: number, max: number): number
  }
}

globalThis.Math.Clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export {}
