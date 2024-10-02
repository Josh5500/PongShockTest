//array med vægge/fjender
let walls = []
//playeren er et JSON objekt med funktioner til at vise, opdatere og hoppe 
let player
let scoreBoard
const startLife = 3
let life = 0
let playerSkin

let millisecondsPlayed, timeStamp
//state er spillets tilstand - programmeret som en "stateMachine"
let state = 'splash'
let BG 
let splashBG
let wallGif

function preload(){
  BG = loadImage('https://media1.tenor.com/m/QAtZz3n-N9MAAAAC/krill-yourself.gif')
  splashBG = loadImage('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHG6VvuRnU9pmks6x1irs7NZOG1W9X4-skkQ&s')
  
  playerSkin = loadImage('https://images.vexels.com/media/users/3/307296/isolated/preview/b78763b23d79862ab4d4b420f2e2d2f6-silver-disc-shaped-ufo.png')

wallGif = loadImage('https://png.pngtree.com/png-clipart/20230130/ourmid/pngtree-topographic-map-dark-texture-png-image_6189043.png')

}


function setup() {
  let cnv = createCanvas(windowWidth, windowHeight)
  player = createPlayer()
  scoreBoard = createScoreboard()
  splashScreen()
  cnv.mousePressed( () => player.jump() )
}

function draw() {
  imageMode(CORNERS)
  background(220)
  image(BG,0,0,windowWidth, windowHeight)
  
  for(i=0; i < walls.length; i++){
    walls[i].show()
    walls[i].move()
    walls[i].collide()    
  }
  if(walls.length > 10 ){
    walls.splice(0, 1)
  }
  
  player.show()
  player.move()
  player.bounce()
  
  scoreBoard.showLife()
  scoreBoard.showTime()
  
  if(life == 0){
    gameOver()
  }

}

let splashTitle, startButton
function splashScreen(){
  frameRate(0)
  background(0)
  image(splashBG, 0, 0, windowWidth, windowHeight)
  //lav en html overskrift
  //og gør den hvid og sæt den midt på skærmen
  splashTitle = createElement('h1', 'Flappy ish')
  splashTitle.style('color', 'white')
  splashTitle.center()
  startButton = createButton('Start Spil')
  startButton.style('color', 'white')
  startButton.position(width/2 - startButton.width/2, height/2 + 50)
  startButton.mousePressed(startGame)
}

let lifeLabel 
let spawnWallInterval = 2500
let spawnTimer 

function startGame(){
  if(restartButton) {
    restartButton.hide()
  }
  player.y = 0
  walls = []
  life = startLife
  state = "playing"
  //tjek hvad "klokken" i spillet er lige nu  
  timeStamp = millis() 
  frameRate(60)
  splashTitle.hide()
  startButton.hide()
  //spawn nye vægge
  clearInterval(spawnTimer)
  spawnTimer = setInterval(createWall, spawnWallInterval)
}

function createScoreboard(){
  let lifeHeart = createImg('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Love_Heart_symbol.svg/1125px-Love_Heart_symbol.svg.png', 'hjerte').hide()
  lifeHeart.size(60, 60)
  lifeHeart.position(width - 60, 20)
  let lifeLabel = createElement('h1', life.toString()).hide()
  lifeLabel.style('color', 'white')
  lifeLabel.style('font-size', '32px')
  lifeLabel.style('width', '40px')    
  lifeLabel.style('text-align', 'center')  
  lifeLabel.position(width - 50, 25)
  return {
    showLife(){
      if(state=='playing'){
        lifeLabel.html(life)
        lifeLabel.show()
        lifeHeart.show()
      }else{
        lifeLabel.hide()
        lifeHeart.hide()
      }
      if(state=='gameOver'){
        textAlign(CENTER, CENTER)
        textFont('Arial')
        textSize(40)
        text('Din tid ', width/2, height/2)
        textSize(60)
        text(millisecondsPlayed, width/2, height/2 + 60)
        
      }
    }, 
    showTime(){
      if(state=='playing'){
        fill('red')
        textSize(32)
        let t = millis() - timeStamp
        t = t/1000
        t = round(t, 2)
        text( t, 30, 40)
      }
    }  
  }
}

let goTitle, restartButton, resultLabel
function gameOver(){
  //tjek hvad "klokken" er nu og træk timeStamp fra
  //så har du hvor længe runden har varet
  let t = millis() - timeStamp
  t = t/1000
  millisecondsPlayed = round(t, 2)

  state = "gameOver"
  frameRate(0)
  background('lightblue')
  imageMode(CORNERS)
   image(BG, 0, 0, windowWidth, windowHeight)    
  scoreBoard.showLife()
  
  restartButton = createButton('new game')
  restartButton.position(width/2 - restartButton.width/2, height/2 + 100)
  restartButton.style('background-color','hotpink')
  restartButton.mousePressed(startGame)
  
}


//safeSpace er rummet mellem søjler
const safeSpace = 250
const minHeight = 50
let wallSpeed = 2

function createWall(){
  //wall er et json objekt som blivder til en ny væg
  let wall = {
    x: width, 
    h: random(minHeight, height - (safeSpace + minHeight)),
    w: 40, 
    hit: false,
    col: color(64, 224, 208),
    show(){
      //rektangel fra toppen af skærmen
      fill(this.col)
      rect(this.x, 0, this.w, this.h)
      //tegn det andet rektangel i bunden
      rect(this.x, this.h + safeSpace, this.w, height - (this.h + safeSpace) )
      imageMode(CORNER)
      image(wallGif,this.x, 0, this.w, this.h)
      imageMode(CORNER)
      image(wallGif,this.x, this.h + safeSpace, this.w, height - (this.h + safeSpace) )
    },
    move(){
      this.x -= wallSpeed
    },
    collide(){
      //nedenstående funktion gælder når hit er den omvendte boolean expression. hit blev defineret som false inde i objekt variablen "wall", så det vil siges at når hit er true gælder funktionen.
      if(!this.hit){
      
      //wallLeft bliver defineret som this.x, hvilket vil sige at når en ny wall bliver lavet, angives den start koordinater som this.x (som er width). Selve wall'ens x koordinater (wallLeft og wallRight) er nu dynamiske og kan bruges til at vurdere om playeren rammer væggen
      let wallLeft = this.x
      //wallRight bliver defineret som this.x + this.w, hvilket vil siges at det første x koordinat (wallLeft/this.x) bliver plusset med this.w som har en værdi på 40, og det betyder at der vil være en afstand mellem de to koordinater (wallLeft og wallRight) på 40. 
      let wallRight = this.x + this.w 
     //this.h generere et tilfældigt tal fra minHeight til height - (safeSpace + minHeight. Dette gør at der bliver genereret et tilfældigt tal, men hensyn til safeSpace og minHeigt. Denne værdi defineres wallTop som.
      let wallTop = this.h
      //Her bliver wallBottom defineret som this.h plusset med safeSpace, hvilket resultere i at der bliver skabt en afstand på safeSpace eller 100 mellem wallTop og wallBottom
      let wallBottom = this.h + safeSpace
      //playerTop defineres som player.y - player.size/2. Her er player.y altså height/2 + 20 og player.size/2 er 40/2 = 20. Dette vil resultere i at playerTop vil være lig med height/2. playerTop angiver også det øverste koordinat på kuglen (som er playeren) og det kan samt med playerBottom bruges til at vurdere om playeren rammer en væg
      let playerTop = player.y - player.size/2
      //playerBottom defineres som player.y + player.size/2. Dette betyder at player.y (som er height/2 + 20) bliver plusset med player.size/2 (som er 40 / 2 = 20). Dette gør at der vil være en konstant afstand på 40 mellem playerTop og playerBottom.
      let playerBottom = player.y + player.size/2
      //playerRight bliver defineret som player.x + player.size/2. Dette betyder at player.x (som er lig width/4) bliver plusset med player.size/2 (som er 40/2 = 20). playerRight er altså det punkt på playeren (kuglen) længst til højre. 
      let playerRight = player.x + player.size/2
      //playerLeft defineres som player.x - player.size/2. Dette betyder at player.x (som er lig width/4) bliver minusset player.size/2 (der er 40/2 = 20), og som skaber en afstand på 40 mellem playerRight og playerLeft.
      let playerLeft = player.x - player.size/2
      //De nedenstående funktioner angiver hvis playerRight's værdi er større end wallLeft's, og playerLeft's værdi er mindre end wallRight's, og så også at hvis playerTop's værdi er mindre end wallTop eller playerBottom's værdi er større end wallBottom's værdi, så skal this.col defineres som color('red') (hvilket ændre væg farve), der trækkes point fra life (som er 10) og this.hit defineres som true. this.hit defineres som true for at den ikke bliver ved med at trække point fra life. Dette er fordi at måden der registreres om playeren rammer en væg er inde i dette boolean statement, som kun aktiveres når !this.hit, altså når this.hit = true. 
      if(playerRight > wallLeft && playerLeft < wallRight){
        if(playerTop < wallTop || playerBottom > wallBottom){
          //væg ramt
          this.col = color('red')
          life--
          this.hit = true 
      }
      }
      }
    }
  }
  walls.push(wall)
}

let gravity = 0.5
let friction = 0.97

function createPlayer(){
  return {
    x: width/4, 
    size: 40, 
    y: height/2 + 20,
    col: color(255, 80, 120),
    velocity: 0,
    jumpSpeed: 15,
    show(){
      fill(this.col)
      ellipse(this.x, this.y, this.size)
      imageMode(CENTER)
      image(playerSkin, this.x,this.y, this.size*2, this.size*2)
    }, 
    move(){
      //her skal vi flytte playeren
      this.velocity += gravity
      this.velocity *= friction
      this.y += this.velocity
    },
    bounce(){
      if( this.y + this.size/2  >= height){
        this.y = height - this.size/2
        this.velocity = -this.velocity
      }
    },
    jump(){
      this.velocity -= this.jumpSpeed
    }
  }
}

function keyPressed(){
  if(key == ' '){
    player.jump()
  }
}

