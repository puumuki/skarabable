import mustache from 'mustache';

/**
 * Tile types
 */
export enum T {
  tw = 'tw',//Triple word scores
  dw = 'dw',//Double word scores
  tl = 'tl',//Triple letter scores
  dl = 'dl',//Double letter scores
  ss = 'ss',//Start tile
  ee = 'ee'//Empty tile
}

export interface Point {
  x:number;
  y:number;
}

interface Triangle {
  width:number,
  height: number,
  gap: number,
  amount: number,
  fill: string 
}

export interface Theme {

  backgroud: string,

  //Gives SVG internal and external dimesion
  width: number,
  height: number,

  tileOffsetX: number,
  tileOffsetY: number,
  tileCap: number,
  tileWidth: number,
  tileHeight: number,
  tileSize: number
  tringleOffset: number,

  [T.tw]: {
    background:string,
    textColor:string,
    text: string[],
    triangles?: Triangle
  },
  [T.dw]: {
    background:string,
    textColor:string,
    text: string[],
    triangles?: Triangle
  },
  [T.tl]: {
    background:string,
    textColor:string,
    text: string[],
    triangles?: Triangle
  },
  [T.dl]: {
    background:string,
    textColor:string,
    text: string[],
    triangles?: Triangle
  },
  [T.ss]: {
    background:string,
    textColor:string,
    text: string[],
    triangles?: Triangle
  },
  [T.ee]: {
    background:string,
    textColor:string,
    text: string[],
    triangles?: Triangle
  }     
}



export const DEFAULT_THEME:Theme = {

  backgroud: '#ffffff',

  width: 317,
  height: 317,

  tileOffsetX: 2,
  tileOffsetY: 2,
  tileCap: 2,
  tileHeight: 19,
  tileWidth: 19,

  tileSize: 19,
  tringleOffset: 0.25,

  [T.tw]: {//Triple word
    background: '#F56546',
    textColor: '#000000',
    text: ['TRIPLA', 'SANA', 'PISTEET'],
    triangles: { width: 5, height: 1.5, gap: 3, amount: 3, fill: '#F56546' }
  },  
  [T.dw]: {//Double word
    background: '#FABAA8',
    textColor: '#000000',
    text: ['TUPLA', 'SANA', 'PISTEET'],
    triangles: { width: 5, height: 1.5, gap: 3, amount: 2, fill: '#FABAA8' }
  },  
  [T.tl]: {//Triple letters
    background: '#459DB1',
    textColor: '#ffffff',
    text: ['TRIPLA', 'KIRJAIN', 'PISTEET'],
    triangles: { width: 5, height: 1.5, gap: 3, amount: 3, fill: '#459DB1' }
  },
  [T.dl]: {//Double letter
    background: '#B8D6D2',
    textColor: '#000000',
    text: ['TUPLA', 'KIRJAIN', 'PISTEET'],
    triangles: { width: 5, height: 1.5, gap: 3, amount: 2, fill: '#B8D6D2' }
  },
  [T.ss]: {//Start
    background: '#FF0000',
    textColor: '#000000',
    text: [],
    triangles: undefined
  },
  [T.ee]: {//Empty
    background: '#C7C0A4',
    textColor: '#000000',
    text: [],
    triangles: undefined
  }
}

interface TriangleCoordinates {
  c: Point,
  c2: Point,
  c3: Point,
  fill: string
}

interface TileCoordinates {
  background:string;
  p:Point,
  p2:Point,
  p3:Point,
  p4:Point,

  t: Point,
  t2: Point,

  textColor:string
  text?:string[],  

  hasTriangles: boolean,
  triangles?: TriangleCoordinates[]
}

interface Row {
  cols: TileCoordinates[]
}

interface BoardTemplateMustacheData {
  
  svg: {
    width:string,
    height:string,
    fill:string
  },

  viewBox: {
    minX: number,
    minY: number,
    width: number,
    height: number
  },

  background: {
    fill: string,
    p: Point,
    p2: Point,
    p3: Point,
    p4: Point
  }

  //Triangles tansform coordinates
  triangeTransform: {
    top: Point,
    bottom: Point,
    left: Point
    right: Point,  
  }

  tileRows: Row[]
} 

export const boardMustacheTemplate = ` 
<svg 
  viewBox="{{viewBox.minX}} {{viewBox.minY}} {{viewBox.width}} {{viewBox.height}}" 
  width="{{svg.width}}"
  height="{{svg.height}}"
  fill="{{svg.fill}}" 
  xmlns="http://www.w3.org/2000/svg">

  <style>
    * {
      font-size: 2.8pt;      
      font-family: sans-serif;
    }
    .points {             
      font-weight: bold;       
    }
  </style>
  
  <path fill="{{background.fill}}" d="M {{background.p.x}},{{background.p.y}} L {{background.p2.x}},{{background.p2.y}} L {{background.p3.x}},{{background.p3.y}} L {{background.p4.x}},{{background.p4.y}} z"/>



  {{#tileRows}}
    {{#cols}}
      <path fill="{{background}}"  d="M {{p.x}},{{p.y}} L {{p2.x}},{{p2.y}} L {{p3.x}},{{p3.y}} L {{p4.x}},{{p4.y}} z"/>

      {{#hasTriangles}}
      
        
        <g transform="translate({{triangeTransform.top.x}} {{triangeTransform.top.y}})" >
        {{#triangles}}
          <path fill="{{fill}}" d="M {{c.x}},{{c.y}} L {{c2.x}},{{c2.y}} L {{c3.x}},{{c3.y}} z"/>      
        {{/triangles}}
        </g>

        <g transform="translate({{triangeTransform.right.x}} {{triangeTransform.right.y}}) rotate(90 {{p2.x}} {{p2.y}})" >
        {{#triangles}}
          <path fill="{{fill}}" d="M {{c.x}},{{c.y}} L {{c2.x}},{{c2.y}} L {{c3.x}},{{c3.y}} z"/>      
        {{/triangles}}
        </g>

        <g transform="translate({{triangeTransform.bottom.x}} {{triangeTransform.bottom.y}}) rotate(180 {{p2.x}} {{p2.y}})" >
        {{#triangles}}
          <path fill="{{fill}}" d="M {{c.x}},{{c.y}} L {{c2.x}},{{c2.y}} L {{c3.x}},{{c3.y}} z"/>      
        {{/triangles}}
        </g>

        <g transform="translate({{triangeTransform.left.x}} {{triangeTransform.left.y}}) rotate(270 {{p2.x}} {{p2.y}})" >
        {{#triangles}}
          <path fill="{{fill}}" d="M {{c.x}},{{c.y}} L {{c2.x}},{{c2.y}} L {{c3.x}},{{c3.y}} z"/>      
        {{/triangles}}
        </g>        

      {{/hasTriangles}}

      {{#text.length}}
      <g transform="translate({{t.x}} {{t.y}})">
        <text class="points" fill="{{textColor}}">
          {{#text}}<tspan x="0" dy="3.5pt">{{.}}</tspan>{{/text}}
        </text>
      </g>
      {{/text.length}}   
      


    {{/cols}}
  {{/tileRows}}
</svg>
`;  

/**
 * Works with renderBoardSVG() function by providing Mustache data for the function.
 * @param {Theme} theme theme 
 * @returns {BoardTemplateMustacheData} data
 */
export function createBoardData( theme:Theme ):BoardTemplateMustacheData {

  /**
   * tw = triple word score
   * dw = double word score
   * tl = triple letter score
   * dl = double letter score
   * st = start
   * ee = empty
   */
   const tiles = [
    [T.tw,T.ee,T.ee,T.dl,T.ee,T.ee,T.ee,T.tw,T.ee,T.ee,T.ee,T.dl,T.ee,T.ee,T.tw],
    [T.ee,T.dw,T.ee,T.ee,T.ee,T.tl,T.ee,T.ee,T.ee,T.tl,T.ee,T.ee,T.ee,T.dw,T.ee],
    [T.ee,T.ee,T.dw,T.ee,T.ee,T.ee,T.ee,T.ee,T.ee,T.ee,T.ee,T.ee,T.dw,T.ee,T.ee],
    [T.dl,T.ee,T.ee,T.dw,T.ee,T.ee,T.ee,T.dl,T.ee,T.ee,T.ee,T.dw,T.ee,T.ee,T.dl],
    [T.ee,T.ee,T.ee,T.ee,T.dw,T.ee,T.ee,T.ee,T.ee,T.ee,T.dw,T.ee,T.ee,T.ee,T.ee],
    [T.ee,T.tl,T.ee,T.ee,T.ee,T.tl,T.ee,T.ee,T.ee,T.tl,T.ee,T.ee,T.ee,T.tl,T.ee],
    [T.ee,T.ee,T.dl,T.ee,T.ee,T.ee,T.dl,T.ee,T.dl,T.ee,T.ee,T.ee,T.dl,T.ee,T.ee],
    [T.tw,T.ee,T.ee,T.dl,T.ee,T.ee,T.ee,T.ss,T.ee,T.ee,T.ee,T.dl,T.ee,T.ee,T.tw],    
    [T.ee,T.ee,T.dl,T.ee,T.ee,T.ee,T.dl,T.ee,T.dl,T.ee,T.ee,T.ee,T.dl,T.ee,T.ee],
    [T.ee,T.tl,T.ee,T.ee,T.ee,T.tl,T.ee,T.ee,T.ee,T.tl,T.ee,T.ee,T.ee,T.tl,T.ee],    
    [T.ee,T.ee,T.ee,T.ee,T.dw,T.ee,T.ee,T.ee,T.ee,T.ee,T.dw,T.ee,T.ee,T.ee,T.ee],
    [T.dl,T.ee,T.ee,T.dw,T.ee,T.ee,T.ee,T.dl,T.ee,T.ee,T.ee,T.dw,T.ee,T.ee,T.dl],
    [T.ee,T.ee,T.dw,T.ee,T.ee,T.ee,T.ee,T.ee,T.ee,T.ee,T.ee,T.ee,T.dw,T.ee,T.ee],
    [T.ee,T.dw,T.ee,T.ee,T.ee,T.tl,T.ee,T.ee,T.ee,T.tl,T.ee,T.ee,T.ee,T.dw,T.ee],
    [T.tw,T.ee,T.ee,T.dl,T.ee,T.ee,T.ee,T.tw,T.ee,T.ee,T.ee,T.dl,T.ee,T.ee,T.tw],           
  ]

  const tile = {
    xOffset: theme.tileOffsetX,
    yOffset: theme.tileOffsetY,
    width: theme.tileWidth,
    heigth: theme.tileHeight,
    cap: theme.tileCap,

    tileSize: theme.tileSize,
    tringleOffset: theme.tringleOffset
  };

  const rows = tiles.map( (row:T[], rowI:number):Row => {
    const cols:TileCoordinates[] = row.map( (column:T, colI:number):TileCoordinates => {    
  
      const x = tile.xOffset + tile.width * colI + tile.cap * colI;
      const y = tile.yOffset + tile.heigth * rowI + tile.cap * rowI;         
      
      let triangles:TriangleCoordinates[] = [];
      const triangleDefinition = theme[column].triangles;

      if( triangleDefinition ) {
        for( let index:number = 0; index < triangleDefinition.amount; index++ ) {
          const offset:Point = {
            x: triangleDefinition.gap + triangleDefinition.gap * index + triangleDefinition.width * index, 
            y: 0
          }          

          triangles.push({
            c: { 
              x: x + offset.x, 
              y: y + offset.y
            },
            c2: { 
              x: x + triangleDefinition.width + offset.x, 
              y: y + offset.y
            },
            c3: { 
              x: x + triangleDefinition.width / 2 + offset.x,  
              y: y - triangleDefinition.height + offset.y
            },
            fill: triangleDefinition.fill,
          });
        } 
      }      

      return {
        background: theme[column].background,
        p: { 
          x: x, 
          y: y 
        },
        p2: { 
          x: x + tile.width, 
          y: y 
        },
        p3: { 
          x: x + tile.width, 
          y: y + tile.heigth 
        },
        p4: { 
          x: x, 
          y: y + tile.heigth
        },
  
        textColor: theme[column].textColor,
        text: theme[column].text,
  
        t: {
          x: x + 1.5,
          y: y + 2
        },
  
        t2: {
          x, y
        },
        
        triangles,
        hasTriangles: triangles.length > 0
      }
    });
  
    return { cols };
  });

  const data = {

    //These can be used to scale thing to final size
    svg: { 
      fill: 'none',
      width: `${theme.width}mm`,
      height: `${theme.height}mm`
    },
  
    //Internal coordinate system, everething follows this!
    viewBox: {
      minX: 0, minY:0,
      width: theme.width, height: theme.height
    },

    tile,

    background: {
      fill: theme.backgroud,
      p: { x:0, y:0 },
      p2: { x: theme.width, y: 0 },
      p3: { x: theme.width, y: theme.height },
      p4: { x: 0, y: theme.height },      
    },

    triangeTransform: {
      top: { x: 0, y: tile.tringleOffset },
      right: { x: -tile.tringleOffset, y: tile.tileSize },
      bottom:  { x: -(tile.tileSize ) , y: tile.tileSize - tile.tringleOffset },
      left:  { x: -(tile.tileSize - tile.tringleOffset), y: 0 }, 
    }, 

    tileRows: rows
  }

  return data;
}



/**
 * Create Board svg icon
 * @param svgTemplate Board's svg template
 * @param mustacheData mustache data for board
 * @returns svg icon
 */
export function renderBoardSVG( svgTemplate:string, 
                                mustacheData:BoardTemplateMustacheData ):string {
  
  const html = mustache.render(svgTemplate, mustacheData, {});  
  return html;
}

