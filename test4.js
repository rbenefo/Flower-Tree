var levelMax;
const rotDecay = 0.9;
const leafLevel = 2;
var leafColor;
var flowerColor;
var leafDimRatio = 0.5;
var node;
var rotOffset;
var flowerDict = {};
var flowerCount = 0;
var flowerSize;
var nodeId = 0;
var currCoord = [0,0];
var coordDict = {};
var parentCoord;
var initLen;
var deployFlowers = false;
var growToLevel = 0;

function setup(){
  createCanvas(windowWidth, windowHeight);
  //background(131,198,232);
  background(196, 255, 206);
  levelMax= round(random(6, 10));
  let randLen = round(random(40, 90));
  let randWidth = round(random(3, 10));
  let randRotRange = round(random(30,60));
  node = new Node(randLen, randWidth, 0, 3, randRotRange, null);
  leafColor = color(255, 82, 122);
  flowerColor = color(255, 183,59);
}

function draw(){
  background(196, 255, 206);
  translate(windowWidth/2, windowHeight);
  node.drawNode();
  node.drawFlowers();
}

function mousePressed(){
  if (deployFlowers){
    addFlower(mouseX,mouseY);
  } else {
    growToLevel++;
  }
}

function keyPressed() {
  if (key=="f"){
    deployFlowers = !deployFlowers;
  }
}

function addFlower(mouse_x, mouse_y){
  flowerSize = random(5, 12);
  let min_dist = Infinity;
  let closestKey;
  let coord_x;
  let coord_y;
  for (const [key, value] of Object.entries(coordDict)) {
    dist = Math.pow(mouse_x-windowWidth/2-value[0],2)+Math.pow(mouse_y-windowHeight-value[1],2);
    if (dist < min_dist){
      min_dist = dist;
      closestKey = key;
      coord_x = value[0];
      coord_y = value[1];
    }
  }
  let rnd_offset_x = random(-5, 5);
  let rnd_offset_y = random(-5, 5);

  flowerDict[flowerCount] = [coord_x, coord_y, flowerSize, closestKey, rnd_offset_x, rnd_offset_y];
  flowerCount ++;
}

class Node {
  constructor(len, _width, level, color, rotationRange, parent){
    this.len = len*0.79*(1+random(-0, 0.2));
    this._width = _width*0.75;
    this.level = level;
    this.color = color;
    this.rotation = radians(random(-rotationRange, rotationRange));
    this.id = nodeId;
    this.parent = parent;
    this.s = 0;
    this.leafScale = 0;
    this.leafDelay = round(random(50, 150));
    
    
    nodeId++;
    if (this.level >= leafLevel){
      this.willBloom = true;
      this.leafSize = random(12,17);
      this.leafRotation = radians(random(-100, 100));
      this.leafDimRatioRand = random(0.9,1.1);

     } else {
      this.willBloom = false;
     }
    
    this.nextRotationRange = rotationRange*rotDecay;

    if (this.level < levelMax) {
      this.createNextNodes();
    }
  }
  
  createNextNodes() {
    this.branch_1 = new Node(this.len, this._width, this.level+1, this.color, this.nextRotationRange, this.id);
    this.branch_2 = new Node(this.len, this._width, this.level+1, this.color, this.nextRotationRange, this.id);
  }

  drawNode() {
    if (this.level <= growToLevel){
      this.s+= (1.0-this.s)/(15+(this.level));
      scale(this.s);
      strokeWeight(this._width);
      stroke(50);
      if (this.id == 0) {
        currCoord = [0, 0-this.len, 0];
        initLen = this.len;
      } else {
        parentCoord = coordDict[this.parent];
      }
          
     
      push();
      rotOffset = sin(noise(millis()* 0.000006*this.level)*100)*0.1;
      
      if (this.level >= 1){
        let rotation = this.rotation+rotOffset;
        rotate(rotation);
        let netRotation = rotation+parentCoord[2];
        let currCoordRot = [this.len*sin(netRotation),-this.len*cos(netRotation)];
        currCoord = [parentCoord[0]+currCoordRot[0], parentCoord[1]+currCoordRot[1], netRotation];
        
      }
      line(0, 0, 0, -this.len);
      translate(0, -this.len);
      
      //console.log(currCoord);
      coordDict[this.id] = currCoord;
      
      
      
      if (this.willBloom){
        if (this.leafDelay < 0) {
        this.leafScale += (1.0-this.leafScale)*0.05;
        noStroke();
        fill(leafColor);
        push();
        scale(this.leafScale);
        rotate(this.leafRotation);
        translate(0, -this.leafSize/2);
        ellipse(0,0,this.leafSize*leafDimRatio*this.leafDimRatioRand, this.leafSize);
        pop();
        } else {
          this.leafDelay--;
        }
      }
      push();
      if (this.branch_1){
        this.branch_1.drawNode();
      }
      pop();
      push();
      if (this.branch_2){
        this.branch_2.drawNode();
      }
      pop();
      pop();
    }
  }
    drawFlowers(){
      for (const [key, value] of Object.entries(flowerDict)) {
        for (const [coordKey, coordValue] of Object.entries(coordDict)) {
          if (value[3] ==  coordKey){
            noStroke();
            fill(flowerColor);
            circle(coordValue[0]+value[3],coordValue[1]+value[4],value[2]);
          }
        }
        
      }

    }
    
}