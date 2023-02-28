export const NapiCompat = `
declare module globalThis {
  export type NRSMimeType = 'image/png' | 'image/jpeg' | 'image/webp'

  export interface NRSImage {
    width: number
    height: number
    readonly naturalWidth: number
    readonly naturalHeight: number
    readonly complete: boolean
    alt: string
    src: string
  }

  export interface NRSCanvas {
    getContext(type: '2d'): NRSContext;
    height: number;
    width: number;
    toDataURL(type: NRSMimeType): string;
    toDataURLAsync(type: NRSMimeType): Promise<string>
  };
  
  export interface NRSContext
    extends Omit<
      CanvasRenderingContext2D,
      'drawImage' | 'createPattern' | 'getTransform' | 'drawFocusIfNeeded' | 'scrollPathIntoView' | 'canvas'
    > {
    canvas: NRSCanvas;
    drawImage(image: NRSImage | NRSCanvas, dx: number, dy: number): void;
    drawImage(image: NRSImage | NRSCanvas, dx: number, dy: number, dw: number, dh: number): void;
    drawImage(
      image: NRSImage | NRSCanvas,
      sx: number,
      sy: number,
      sw: number,
      sh: number,
      dx: number,
      dy: number,
      dw: number,
      dh: number,
    ): void;
    createPattern(
      image: NRSImage | ImageData,
      repeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | null,
    ): CanvasPattern
    getContextAttributes(): { alpha: boolean; desynchronized: boolean }
  };

  declare function createCanvas(width: number, height: number): NRSCanvas;
  declare function loadImage(input: string): Promise<NRSImage>;
  declare function finish(canvas: NRSCanvas, ctx: NRSContext): void;
}
`
