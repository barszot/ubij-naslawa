const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let runningGame = false;
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Definicja obrazów
const startBackgroundImage = new Image();
startBackgroundImage.src = 'graphics/start_background.png';
const gameBackgroundImage = new Image();
gameBackgroundImage.src = 'graphics/game_background.png';
const spriteSheet = new Image();
spriteSheet.src = 'graphics/sprite_sheet.png';
const defaultEndBackground = new Image();
defaultEndBackground.src = 'graphics/default_end_background.png';
const newRecordEndBackground = new Image();
newRecordEndBackground.src = 'graphics/new_record_end_background.png';

let loadedImages = 0;
// Funkcja do sprawdzenia, czy wszystkie obrazy są załadowane
function imageLoaded() {
    loadedImages++;
    if (loadedImages === 5) {
        // Wszystkie obrazy załadowane, rozpocznij grę
        ctx.drawImage(startBackgroundImage, 0, 0, canvas.width, canvas.height);  // Rysuje obraz jako tło na początku
        canvas.addEventListener('click', manageClicking);
    }
}

// Dodaj nasłuchiwacze na załadowanie obrazów
startBackgroundImage.onload = imageLoaded;
gameBackgroundImage.onload = imageLoaded;
spriteSheet.onload = imageLoaded;
defaultEndBackground.onload = imageLoaded;
newRecordEndBackground.onload = imageLoaded;


let mouseX = 900/2;
let mouseY = 700/2;


const RECT_WIDTH = 128;
const RECT_HEIGHT = 162;


function rectanglesCollide(rect1, rect2) {
    return (
        rect1.x <= rect2.x + rect2.width &&    // Sprawdź, czy lewy brzeg rect1 jest na lewo od prawego brzegu rect2
        rect1.x + rect1.width >= rect2.x &&    // Sprawdź, czy prawy brzeg rect1 jest na prawo od lewego brzegu rect2
        rect1.y <= rect2.y + rect2.height &&   // Sprawdź, czy górny brzeg rect1 jest na górze od dolnego brzegu rect2
        rect1.y + rect1.height >= rect2.y       // Sprawdź, czy dolny brzeg rect1 jest na dole od górnego brzegu rect2
    );
}

class Mole {
    constructor(index, x, y) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.moleWidth = RECT_WIDTH;
        this.moleHeight = RECT_HEIGHT;
        this.rect = { x: this.x, y: this.y, width: RECT_WIDTH, height: RECT_HEIGHT };
    }
    draw(state) {
        if (state <= 0) {
            ctx.drawImage(spriteSheet, 386-28-this.moleWidth, 325-14-this.moleHeight, this.moleWidth, this.moleHeight, this.x, this.y, this.moleWidth, this.moleHeight);
        }
        else if(state > this.lifespan*0.95 || state < this.lifespan*0.05) {
            ctx.drawImage(spriteSheet, 386, 325-14-this.moleHeight, this.moleWidth, this.moleHeight, this.x, this.y, this.moleWidth, this.moleHeight);
        }
        else if(state > this.lifespan*0.9 || state < this.lifespan*0.1) {
            ctx.drawImage(spriteSheet, 386+28+this.moleWidth, 325-14-this.moleHeight, this.moleWidth, this.moleHeight, this.x, this.y, this.moleWidth, this.moleHeight);
        }
        else {
            ctx.drawImage(spriteSheet, 386-28-this.moleWidth, 325, this.moleWidth, this.moleHeight, this.x, this.y, this.moleWidth, this.moleHeight);
        }
    }
    setLifespan(newLifespan) {
        this.lifespan = newLifespan
    }

    isClicked() {
        let hammerRect = { x: mouseX - RECT_WIDTH/2, y: mouseY - RECT_HEIGHT/2, width: Math.floor(0.35*RECT_WIDTH), height: Math.floor(0.35*RECT_HEIGHT) };
        return rectanglesCollide(this.rect, hammerRect);
    }

}

let lifespan = 0;

class MolesBoard
{
    constructor(maxMoles, probabilityOfMole)
    {
        this.maxMoles = Math.min(maxMoles, 9);
        this.probabilityOfMole = probabilityOfMole;
        this.moles = [];
        this.states = new Array(9).fill(0);
        this.indexes = Array.from({ length: 9 }, (_, index) => index);
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const index = 3 * i + j;
                const x = 230 - 14 + (28 + 14 + RECT_WIDTH) * i;
                const y = 144 + (30 + RECT_HEIGHT) * j;
                this.moles.push(new Mole(index, x, y));
            }
        }
    }
    draw()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(gameBackgroundImage, 0, 0, canvas.width, canvas.height);
        this.moles.forEach((mole, index) => {
            mole.draw(this.states[index]);
        });
    }

    getShuffledHoleIndexes(emptyHolesIndexes) {
        const shuffledHoleIndexes = [...emptyHolesIndexes];
        for (let i = shuffledHoleIndexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledHoleIndexes[i], shuffledHoleIndexes[j]] = [shuffledHoleIndexes[j], shuffledHoleIndexes[i]];
        }
        return shuffledHoleIndexes;
    }

    getNewMolesIndexes(emptyHolesIndexes) {

        const shuffledHoleIndexes = this.getShuffledHoleIndexes(emptyHolesIndexes);    
        const newMolesIndexes = [];
        const holesAmount = emptyHolesIndexes.length;

        for (let i = 0; i < holesAmount; i++) {
            const randomNumber = Math.random();
            if (randomNumber < this.probabilityOfMole) {
                if (newMolesIndexes.length < (this.maxMoles - (9-holesAmount))) {
                    newMolesIndexes.push(i);
                }
            }
        }
    
        return newMolesIndexes.map(index => shuffledHoleIndexes[index]);
    }

    updateBoard(deltaTime) {
        const holeIndexes = [];
        for (let i = 0; i < 9; i++) {
            if (this.states[i] === 0) {
                holeIndexes.push(i);
            } else if (this.states[i] > 0) {
                this.states[i] = Math.max(0, this.states[i]-deltaTime);
            }
            else {
                this.states[i] = Math.min(0, this.states[i]+deltaTime)
            }
        }
    
        const newMolesIndexes = this.getNewMolesIndexes(holeIndexes);
    
        for (const index of newMolesIndexes) {
            this.states[index] = lifespan;
            this.moles[index].setLifespan(lifespan);
        }
    }
}

let score = 0;
let molesBoard = new MolesBoard(4, 0.003);

canvas.style.cursor = 'default';
function manageClicking() {
    if (runningGame === false) {
        startGame();
    }
    else {
        score -= 5;
        for (let index = 0; index < molesBoard.moles.length; index++) {
            const mole = molesBoard.moles[index];
            if (mole.isClicked())  {
                if(molesBoard.states[index] > 0) {
                    molesBoard.states[index] = -lifespan / 2.0;  // Ustaw stan kreta na -lifespan/2.0
                    score += 15;                                 // Dodaj punkty
                }
                break;                                       // Przerwij pętlę po obsłużeniu kliknięcia
            }

        }
    }
}

class Hammer
{
    constructor()
    {
        this.rotated = false;
    }
    setRotate(rotated)
    {
        this.rotated = rotated;
    }
    getRotate()
    {
        return this.rotated;
    }
    draw(){
        if(!this.rotated)
        {
            ctx.drawImage(spriteSheet, 386, 325, RECT_WIDTH, RECT_HEIGHT, mouseX-RECT_WIDTH/2, mouseY-RECT_HEIGHT/2, RECT_WIDTH, RECT_HEIGHT);
        }
        else
        {
            ctx.drawImage(spriteSheet, 386+RECT_WIDTH+28, 325, RECT_WIDTH, RECT_HEIGHT, mouseX-RECT_WIDTH/2, mouseY-RECT_HEIGHT/2, RECT_WIDTH, RECT_HEIGHT);
        }
    }
}


let highscore = localStorage.getItem('highscore') ? parseInt(localStorage.getItem('highscore')) : 0;

function drawScores(remainingTime) {
    ctx.font = '42px "ComicSansCustom"';
    ctx.fillStyle = 'black';
    ctx.fillText("Wynik:  " + score, 15, 50);
    ctx.fillText("Rekord: " + highscore, 15, 100);
    ctx.font = '84px "ComicSansCustom"';
    ctx.fillText(remainingTime, 785, 92);
}

let elapsedTime = 0; // Czas, który upłynął w sekundach
let endGameClickHandler;
let hammer = new Hammer();

let lastTimestamp = 0;

let gameStartTime = 0; // Nowa zmienna, która przechowuje czas rozpoczęcia gry

let startGame = function () {

    if (runningGame === false){
        lastTimestamp = 0;
        elapsedTime = 0;

        // Usuń poprzedni nasłuchiwacz, jeśli istnieje
        if (endGameClickHandler) {
            canvas.removeEventListener('click', endGameClickHandler);
        }

        canvas.addEventListener('mousemove', (event) => {
            mouseX = event.offsetX;
            mouseY = event.offsetY;
        });
        canvas.addEventListener('mousedown', (event) => {
            event.preventDefault(); // Zapobiega zaznaczaniu tekstu na stronie
            hammer.setRotate(true);
        });
        
        canvas.addEventListener('mouseup', (event) => {
            hammer.setRotate(false);
        });

        score = 0;
        canvas.style.cursor = 'none'; // Ukrywa kursor
        runningGame = true;
        gameStartTime = performance.now();  // Ustawiamy czas rozpoczęcia gry

        requestAnimationFrame(gameLoop);
    }
}


const targetFps = 60;
const frameDuration = 1000 / targetFps; // czas na klatkę w ms
const gameDuration = 60;

// Główna pętla gry
function gameLoop(timestamp) {

    if (!runningGame) endGame();
    else {
        const delta = timestamp - lastTimestamp;

        if (delta >= frameDuration) {

            lastTimestamp = timestamp - (delta % frameDuration); // Ustaw czas ostatniej klatki
            //elapsedTime += delta / 1000; // Zaktualizuj czas gry (w sekundach)
            elapsedTime = (timestamp - gameStartTime) / 1000; // Zaktualizuj czas gry (w sekundach)

            if (elapsedTime >= gameDuration) {
                runningGame = false; // Zatrzymaj grę po 60 sekundach
            } else {
                lifespan = (100.0 - elapsedTime)/20.0;
                molesBoard.updateBoard(delta / 1000);
                molesBoard.draw();
                hammer.draw();
                drawScores(gameDuration - Math.floor(elapsedTime));
            }
        }
        requestAnimationFrame(gameLoop); // Wywołaj pętlę znowu
    }
}   

function drawEndScores()
{
        ctx.font = '64px "ComicSansCustom"';
        ctx.fillStyle = '#f2cf08';
        ctx.fillText(score, 575, 360);
        ctx.fillText(highscore, 725, 465);
}

function endGame()
{
    if (score <= highscore){
        ctx.drawImage(defaultEndBackground, 0, 0, canvas.width, canvas.height);
    }
    else {
        highscore = score;
        localStorage.setItem('highscore', highscore);
        ctx.drawImage(newRecordEndBackground, 0, 0, canvas.width, canvas.height);

    }
    drawEndScores();
    canvas.style.cursor = 'default';
}


const Slonik = `
                                                                                      .,,*/(#%&&@@@@@@@@&%#((/*,,                                                                                       
                                                                        .*#&@@@@@@@@@@@@@@&%%%############%%%&@@@@@@@@@@@@@@&(,                                                                         
                                                                 ,#&@@@@@@&#((////*************************************///(#%&@@@@@&%(.                                                                 
                                                            *#@@@@@%(//**********************************************************//#%@@@@@#*                                                            
                                                        *%@@@&#/************************************************************************(#&@@@%*                                                        
                                                    .(@@@&#/********************************************************************************/#&@@@(.                                                    
                                                  (@@@&/****************************************************************************************(&@@@*                                                  
                                                &@@&(**********************************************************************************************(@@@#.                                               
                                             .&@@&/**************************************************************************************************/&@@#                                              
                                           .#@@%*******************************************************************************************************/&@@#                                            
                                         ./@@&/**********************************************************************************************************(@@@*..                                        
                            .*(#%@@@@@@@@@@@#/************************************************************************************************************/&@@@@@@@@@@@&%#/,                            
                    ,(#&@@@@@@&%#(//***/@@@(****************************************************************************************************************#@@%/***//(#%%&@@@@@@%(*.                   
              ,(&@@@@&&#(/**********//(@@@(*****************************************************************************************************************/#@@%////**********/#%&@@@@@#*.             
          *&@@@@%(*********///(((((((#&@@(*******************************//(#%%%&%%#(//*************************//(##%%&%%#((/*******************************/%@@%(((((((((///********/#&@@@@/.         
       /@@@@(********/(((((((((((((((&@@(****************************/#@@@@@@&##(#%&@@@@@&(/****************/#@@@@@@&%#(#%&@@@@@@(/***************************/&@@#(((((((((((((((///******/&@@@%.      
    .&@@@/******/(((((((((((((((((((%@@%***************************&@@@#.               /@@@@/************%@@@&,               *@@@@(**************************(@@@(((((((((((((((((((((/*****/%@@@*    
  .#@@%*****/((((((((((((((((((((((#&@@/************************/&@@&.                     /@@@(*******/%@@&.                     *@@@(*************************%@@%((((((((((((((((((((((((/****#@@@,  
 .@@@(***/(((((((((((((((((((((((((%@@#/***********************(@@&.                         #@@%/****/@@&,                         /@@@/***********************/@@@#((((((((((((((((((((((((((***/&@@( 
 &@&(***/((((((((((((((((((((((((((&@@(***********************(@@#                            *@@%/**/@@%.                           *@@&/***********************&@@%(((((((((((((((((((((((((((/***%@@*
*@@#***(((((((((((((((((((((((((((#@@%/***********************&@&,                .,*,         #@@(**&@&*         ,*,.                (@@#***********************(@@&((((((((((((((((((((((((((((/**/@@#
&@&(***/((((////******************#@@%/**********************/@@#.             ,@@@@@@@@%.     *@@#*/@@%.     .#@@@@@@@%.             *@@&/**********************/@@&(//*****************///(((((/**/%@@
@@&/******************************%@@(***********************/@@%.            ,&@@@@@@@@@&     /@@#**@@&,    .%@@@@@@@@@@             /@@#************************@@&(*******************************#@@
%@@(******************************&@&(************************#@@/            .%@@@@@@@@@%    .@@&/**(@@#     (@@@@@@@@@%            .@@@/************************&@@(******************************/%@&
*@@#******************************@@&(************************/#@@/             ,@@@@@@@.    ,@@&/****#@@(     ,%@@@@@&,            ,&@@/************************/&@@#******************************/@@#
 @@&/****************************/@@&/**************************#@@@,                      .%@@%*******(@@@*                      .#@@&**************************(%@@#******************************#@@/
 /@@#/***************************/@@&/***************************/#@@@#.                 /&@@%/**********(@@@%,                 *&@@&/**************************((%@@#*****************************/@@%.
 .%@@(***************************/@@&/******************************/%@@@@%#*,.   .,(#&@@@&(/**************/#@@@@%#*,.   .,/#&@@@&(/***************************/((%@@#/****************************&@@* 
  ,&@&/***************************&@&(**********************************/#%&@@@@@@@@&%#(***********************/(%&@@@@@@@@&%#(/******************************/(((&@@#/***************************%@@(  
   *@@&***************************#@@#***********************************************************************************************************************/((((@@@#/**************************#@@%   
    *&@@/*************************/@@%/*********************************************************************************************************************/((((%@@&(/************************/%@@(    
     ,@@@(*************************%@@(*****************************************************//#&@@@@@@&%(//************************************************/(((((@@@#(/***********************/%@@/     
       &@@%************************(@@%/*************************************************#@@@@@&#(//((%@@@@@@%/*******************************************((((((%@@@(/***********************/@@@*      
        *@@&/**********************/#@@(**********************************************(@@@&(/*************//%@@@#/**************************************/((((((#@@@#(/**********************%@@%.       
         .#@@&**********************/&@@/**********************************************///********************//**************************************/(((((((#&@@#((/********************#@@@,         
           ,&@@%/********************(&@@/***********************************************************************************************************((((((((#&@@%((/******************/(@@@/           
             .&@@&/*******************/@@@(*********************************(%(******************************************(#(***********************((((((((((&@@%(((******************#@@&/             
               .#@@@#/*****************/@@@#*******************************/#@@#****************************************&@@%********************/(((((((((((&@@%(((***************/(&@@&*               
                ,%@@@@@#/****************%@@%/*************/#@@@@@@@@@@#/***/%@@#***************///////****************%@@%***/(&@@@@@@@@@%(**/(((((((((((#@@@#(((*************/(&@@@@*                 
                ,%@&*(&@@@@(/*************(@@&/**********#@@@%.      ,%@@@%**/&@@/*********/#@@@@@@@@@@@@@%/**********#@@&*/#@@@&*       (@@@%(((((((((((&@@@((((**********/(%@@@@#%@@*                 
                .%@@*****(@@@@@@%/*********/%@@&(*******#@@(            *@@@#*(@@@*******/#@@&/*********/%@@@********/&@@//@@@*            /@@&((((((((%@@@#((((/*****/#@@@@@@#***/%@@,                 
                 #@@/********/(%@@@@@@@@@@@@@@@@@%((/**/@@#.            ,*&@@(*#@@%*********************************/%@@(*@@%.              #@@%(((((#@@@@@@@@@@@@@@@@@@&(//******/%@@.                 
                 (@@(****************////////((%@@@%(((%@@*            .**@@&/*/@@@(********************************(@@%/*&@&*              .@@@#((#@@@&#((#####(///**************(&@&                  
                 ,&@&*************************/((%@@@&(@@%.           .**&@@(***(@@%*******************************/%@@(**/@@&,              &@@#%@@@&#((((((((/*****************/#@@/                  
                  %@@(**************************(((#@@@@@#.          .*/&@@(*****@@&(******************************/@@%//((#@@@,             #@@@@@%((((((((((/*****************/(&@@.                  
                  *@@&***************************/((((&@@#          ,*#@@&/******#@@#***********///////************#@@%((((((&@@%            (@@&#((((((((((/******************((%@@(                   
                   %@@(****************************/(((@@#.       .*(@@@%(((((((((@@%/*****/#@@@@@@@@@@@@@%/*******@@@#(((((((#@@@/          (@@%((((((((((******************/((#&@&,                   
                   .@@&/*****************************((@@%.      ,/@@@&(((((((((((&@&(*****/%&(*********/#%/******/@@&#(((((((((#@@@/        %@@#((((((((/*****************/((((%@@/                    
                    ,@@%/******************************%@@*    ,#@@@@&#(((((((((((%@@#****************************#@@%(((((((((((%@@@@(     .@@@#((((((*******************(((((%@@#                     
                     *@@%/*****************************(@@# .*@@@@##&@@@@@&#((((((#@@#/***************************&@@%(((((#%@@@@@@##@@@&*  #@@%((((/*******************((((((#@@%                      
                      /@@#/****************************/#@@@@@@%#((((((##%@@@@@@@&%@@%/**************************/@@@&&@@@@@@&##(((((((%@@@@@@&((/*******************/(((((((%@@&                       
                       /@@%******************************////**/((((((((((((((#%%&@@@%/**************************/@@@@&%##((((((((((((((((###(//*******************/((((((((%@@&                        
                        /@@&**************************************/(((((((((((((((#@@&/**************************/@@@#(((((((((((((((((((((/*********************/(((((((((%@@%                         
                         ,@@@(****************************************/(((((((((((#&@&/**************************(@@@((((((((((((((((((/**********************/(((((((((((&@@/                          
                           &@@#/*******************************************/((((((#&@&/**************************(@@@(((((((((((((/*************************/(((((((((((#@@@*                           
                            *@@&/****************//#%@@@@@@@@@@@@%#(///**********/(&@&/**************************(@@@(((((((/*********//(#&@@@@@@@@@@@@%(((((((((((((((&@@%                             
                             .#@@%************#@@@@@&#(/*****//(#&@@@@@@@@%/******/&@&/**************************(@@&/**********(&@@@@@@@@&#(/******/(#@@@@@@%(((((((%@@@,                              
                               ,&@@%/******#@@@@(/********************//(#@@@@@@%//&@&/**************************/@@&/****(%@@@@@@#///*******************/(#@@@@#((#@@@/                                
                                 *@@@%((*(@@@#/******************************/(%@@@@@%/**************************/@@&/#&@@@@#(/****************************((#%@@@@@@#.                                 
                                   *@@@%@@@%/*********************************(@@@@@@%/**************************/@@@@@&(/**********************************/((#&@@&.                                   
                                     *&@@@(*********************************(&@@#*(@@#/***************************&@@#***************************************/(((%@@%                                   
                                     .%@@(*********************************#@@%/**#@@#****************************#@@#***************************************/((((%@@(                                  
                                     (@@#*********************************%@@%****%@&(****************************(@@%/***************************************/((((%@@/                                 
                                    ,&@&*********************************#@@&*****@@&/****************************/@@&/***************************************/((((#@@%.                                
                                    /@@(*********************************@@@(****(@@%/****************************/&@@(****************************************(((((%@@*                                
                                    #@@/********************************/@@@/****/%%/****************************((%@@#****************************************/((((%@@(                                
                                   .&@&/*********************************@@@(**********************************/(((&@@(****************************************/((((#@@%                                
                                   .&@%/*********************************#@@&(/******************************/((((#@@&/****************************************/((((#&@&                                
                                   .@@%/**********************************&@@%((/**************************/(((((#@@@(*****************************************/((((#&@@                                
                                   .&@&/******/(#&@@@@&%(/*******////******%@@&#((((//****************///(((((((%@@@##&@@@@&%(/*******////********/#&@@@@@@@%(/(((((#@@%                                
                                    /@@(***/(@@@&#*,,*(&@@@%/#@@@@@@@@@@%/*%@@@@%((((((((((//////(((((((((((((#&@@@@@&#/,,*(&@@@%/#@@@@@@@@@@%//%@@@%*.   ,(&@@&#(((%@@*                                
                                    .%@@/*/&@@*          ,%@@@%.      .#@@@@%,*&@@@#((((((((((((((((((((((((%@@@@@@/          .&@@@#.      .%@@@@%,          ,%@@%(%@@(                                 
                                      #@@&%@@,           (@@/            /@@% ,*,#@@@@%#((((((((((((((((%@@@@@#%@@.           #@@#            *@@(         .***%@@@@@(                                  
                                       .@@@@@*          ,&@#              %@@(******/%@@@@@@@@@@@@@@@@@@@&*.#@@@@@*          ,&@&              (@@*     .*****#@@@@&.                                   
                                          *%@@@@&#*.    .%@@.            .@@@(****/(%&@@@@@@#/////*,,.        ,#@@@@@&#*.    .%@@.             &@@*,,,*/(%&@@@@@%,                                      
                                              ,/#&@@@@@@@@@@@@@&%%%%%%&@@@@@@@@@@@@@@@%(*.                        .*(&@@@@@@@@@@@@@@&&%%%&&&@@@@@@@@@@@@@@&(*.                                          
`;