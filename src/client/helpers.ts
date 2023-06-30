export function debounce( callback:Function, timeout:number = 300 ) {

  let timer:any;

  function wrapper(...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply( wrapper, args );
    }, timeout);
  }

  return wrapper;
}

import { Canvg, presets } from 'canvg';

export interface ToPngOptions {
  width: number,
  height: number,
  svg: string
}


export async function toPng(data:ToPngOptions) {
  
  const preset = presets.offscreen()

  const {
    width,
    height,
    svg
  } = data;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d') as any ;
  const v = await Canvg.fromString(ctx, svg, preset)
  
  v.resize(width, height, 'xMidYMid meet')

  // Render only first frame, ignoring animations and mouse.
  await v.render()

  const blob = await canvas.convertToBlob()
  const pngUrl = URL.createObjectURL(blob)

  return pngUrl
}

export function convertSVGtoCanvas(data:ToPngOptions) {

  const {
    width,
    height,
    svg
  } = data;

  let canvg:any = null;  

  window.onload = async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  
    canvg = Canvg.fromString(ctx, svg, {});
  
    // Start SVG rendering with animations and mouse handling.
    canvg.start();
  };
  
  window.onbeforeunload = () => {
    canvg.stop();
  };
}