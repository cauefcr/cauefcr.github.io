let width = window.innerWidth,height=window.innerHeight-4;
let topleft = [-width/2-width/25,-height/2-width/25];
let w;
let columns;
let rows;
let board;
let next;

// let Font;
// function preload(){
//   Font = loadFont('PressStart2P-Regular.ttf');
// }  

function scene1Setup() {
  createCanvas(width, height,WEBGL);
  w = Math.trunc(width/25);
  // Calculate columns and rows
  columns = Math.round(width / w)+1;
  rows = Math.round(height / w)+1;
  // Wacky way to make a 2D array is JS
  board = new Array(columns);
  for (let i = 0; i < columns; i++) {
    board[i] = new Array(rows);
  }
  // Going to use multiple 2D arrays and swap them
  next = new Array(columns);
  for (i = 0; i < columns; i++) {
    next[i] = new Array(rows);
  }
}
let seed = 0;

function scene1() {
  function scene1Init(seed) {
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        next[i][j]=[(i+Math.sin((seed+i+j)/5)),(j+Math.cos((seed+i+j)/5)),Math.sin((seed+i+j)/5)*255/8+255/4];
      }
    }
    board = next;
  }
  scene1Init(seed);
  background(0);
  fill(0,100,0,50)
  stroke(0);
  strokeWeight(0);
  for ( let i = 0; i < columns;i++) {
    for ( let j = 0; j < rows;j++) {
      fill(Math.round(board[i][j][2]));
      square(topleft[0]+board[i][j][0] * w,topleft[1]+board[i][j][1] * w, w*2);
    }
  }
}

let png;

// function preload() {
//   img = loadImage('qr.png');
// }

function scene2Setup() {
  createCanvas(width, height,WEBGL);
  board = [];
  next = [];
  background(0);
  // for(let i = 0; i < img.width; i++){
  //   for(let j = 0; j < img.height; j++){
  //     next.push([i,j,img.pixels[(i*width+j)*4]]);
  //   }
  // }
  for(let i = 0; i < 1000; i++){
    // next.push([Math.random()*2*width,Math.random()*2*height]);
    next.push([Math.sin(i/13)*Math.min(width/4,height/4),Math.cos(i/13)*Math.min(width/4,height/4)]);
  }
  board = next;
}

const wrap = (num,mod) => (num+mod)%mod;
function scene2(){
  function scene2Init(){
    next=board.map(p => [p[0]+(Math.random()-0.5)*5,p[1]+(Math.random()-0.5)*5]);
    board = next;
  }
  scene2Init();
  // background(0);
  // fill("#00000001");
  // square(-width,-height,width*2,height);
  stroke(255);
  strokeWeight(0);
  board.forEach(p => {
    fill(seed%255,seed%255,seed%255);
    circle(p[0],p[1],4);
    // board
    // .filter(p2 => Math.pow(Math.pow(p2[0]-p[0],2)+Math.pow(p2[1]-p[1],2),0.5)<500)
    // .map(p2 => line(p[0],p[1],p2[0],p2[1]));
  });
}

scn = 0;

const toScene = [
  {
    draw:scene1,
    setup:scene1Setup
  },
  {
    draw:scene2,
    setup:scene2Setup
  },
  // {
  //   draw:scene3,
  //   setup:scene3Setup
  // },
];
function draw(){
  toScene[scn]["draw"]();
  seed++;
}
function mousePressed() {
  scn++;
  scn%=toScene.length;
  toScene[scn]["setup"]();
}
function setup(){
  toScene[scn]["setup"]();
}
// Fill board randomly

