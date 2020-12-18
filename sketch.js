let width = window.innerWidth,height=window.innerHeight-4;
let topleft = [-width/2,-height/2];
let w;
let columns;
let rows;
let board;
let next;

let Font;
function preload(){
  Font = loadFont('PressStart2P-Regular.ttf');
}

function setup() {
  createCanvas(width, height,WEBGL);
  w = Math.trunc(width/20);
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

let i = 0;
function draw() {
  background(255);
  fill(0)
  stroke(0);
  strokeWeight(0);
  for ( let i = 0; i < columns;i++) {
    for ( let j = 0; j < rows;j++) {
      fill(Math.round(board[i][j]));
      rect(topleft[0]+i * w,topleft[1]+j * w, w-1, w-1);
    }
  }
  i++;
  init(i);
  fill(0,0,0,50)
  rect(topleft[0]+1.5*w,topleft[1]+1.5*w,width-3*w,height-3*w);
  fill(255-board[0][2],255-board[0][2],255-board[0][2],90);
  textFont(Font);
  textSize(Math.min(w,height/20));
  text(`Cauê Felchar, Cientista da computação em formação; caue.fcr @gmail.com, github: cauefcr; Linguagens: C, C++, Go, Javascript, Node, HTML, CSS`, topleft[0]+2*w,topleft[1]+2*w+36,width-4.5*w,height-4.5*w);
}

// Fill board randomly
function init(seed) {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      board[i][j]=(Math.sin(j/10-seed/10)*255/2)+255/2;
    }
  }
}

