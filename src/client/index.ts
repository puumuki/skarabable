import mustache from 'mustache';

import { boardMustacheTemplate, renderBoardSVG, createBoardData, DEFAULT_THEME, Theme, T } from './board';
import { toPng } from './helpers';

const HAUSKA_THEME:Theme = {

  ...DEFAULT_THEME,

  backgroud: '#2D1D20',

  [T.tw]: {//Triple word
    background: '#F97218',
    textColor: '#ffffff',
    text: ['TRIPLA', 'SANA', 'PISTEET'],
    triangles: { width: 5, height: 2, gap: 1, amount: 3, fill: '#F97218' }    
  },  
  [T.dw]: {//Double word
    background: '#E4374D',
    textColor: '#ffffff',
    text: ['TUPLA', 'SANA', 'PISTEET'],
    triangles: { width: 5, height: 2, gap: 3, amount: 2, fill: '#E4374D' }    
  },  
  [T.tl]: {//Triple letters
    background: '#6AAA24',
    textColor: '#ffffff',
    text: ['TRIPLA', 'KIRJAIN', 'PISTEET'],
    triangles: { width: 5, height: 2, gap: 1, amount: 3, fill: '#6AAA24' }    
  },
  [T.dl]: {//Double letter
    background: '#4A8BC5',
    textColor: '#ffffff',
    text: ['TUPLA', 'KIRJAIN', 'PISTEET'],
    triangles: { width: 5, height: 2, gap: 3, amount: 2, fill: '#4A8BC5' }    
  },
  [T.ss]: {//Start
    background: '#DD373B',
    textColor: '#ffffff',
    text: []
  },
  [T.ee]: {//Empty
    background: '#ffffff',
    textColor: '#000000',
    text: []
  }
}

const mustacheData = createBoardData( HAUSKA_THEME )
const svgHtml = renderBoardSVG( boardMustacheTemplate, mustacheData );

function renderDocument() {
  const documentHtml:string = mustache.render(`
  {{{svg}}}
  
  <style>
  a {
    font-size: 20px;
    display: none;

  }
  img {
    max-width: 100%;
    height: 100%; 
  }

  </style>  
  <img id="board" alt="Board">
  `, {svg: svgHtml});

  document.body.innerHTML = documentHtml;

  //Convert to PNG image and insert it to DOM
  toPng({
    width: 3000,
    height: 3000,
    svg: svgHtml
  }).then((pngUrl) => {
    const img = document.querySelector('img#board') as HTMLImageElement;
    img.src = pngUrl
  })
}

renderDocument();


//convertSVGtoCanvas();






