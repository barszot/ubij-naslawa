/*

class Mole():
    def __init__(self, index, x, y, sprite_sheet_img):
        self.x = x
        self.y = y
        self.index = index
        self.rect = pygame.Rect(x, y, RECT_WIDTH, RECT_HEIGHT)
        self.lifespan = 0
        self.frames = [
            sprite_sheet_img.subsurface(pygame.Rect(386-28-RECT_WIDTH, 325-14-RECT_HEIGHT, RECT_WIDTH, RECT_HEIGHT)),
            sprite_sheet_img.subsurface(pygame.Rect(386, 325-14-RECT_HEIGHT, RECT_WIDTH, RECT_HEIGHT)),
            sprite_sheet_img.subsurface(pygame.Rect(386+28+RECT_WIDTH, 325-14-RECT_HEIGHT, RECT_WIDTH, RECT_HEIGHT)),
            sprite_sheet_img.subsurface(pygame.Rect(386-28-RECT_WIDTH, 325, RECT_WIDTH, RECT_HEIGHT)),
        ]

    def draw(self, window, state):

        frame_index = None
        if state <= 0:
            frame_index = 0
        elif state > self.lifespan*0.95 or state < self.lifespan*0.05:
            frame_index = 1
        elif state > self.lifespan*0.9 or state < self.lifespan*0.1:
            frame_index = 2
        else:
            frame_index = 3

        window.blit(self.frames[frame_index], self.rect.topleft)

    def set_lifespan(self, lifespan):
        self.lifespan = lifespan

    def is_clicked(self, event):

        hammer_rect = pygame.Rect(
            event.pos[0] - RECT_WIDTH/2,
            event.pos[1] - RECT_HEIGHT/2,
            int(0.35*RECT_WIDTH),
            int(0.35*RECT_HEIGHT)
        )

        if self.rect.colliderect(hammer_rect):
            return True
        else:
            return False



*/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
RECT_WIDTH = 128
RECT_HEIGHT = 162

let loadedImages = 0;  // Zmienna do liczenia załadowanych obrazów

// Nasłuchuj kliknięcia na canvasie
canvas.addEventListener('click', function() {
    if (loadedImages >= 3) {
        startGame();  // Wywołaj funkcję startGame() po kliknięciu, tylko jeśli wszystkie obrazy są załadowane
    }
});

// Definicja obrazów
const startBackgroundImage = new Image();
startBackgroundImage.src = 'graphics/start_background.png';  // Ścieżka do obrazka

const gameBackgroundImage = new Image();
gameBackgroundImage.src = 'graphics/game_background.png';  // Ścieżka do obrazka

const spriteSheet = new Image();
spriteSheet.src = 'graphics/sprite_sheet.png';  // Ścieżka do sprite sheet'a

// Funkcje wczytania obrazów
startBackgroundImage.onload = function() {
    ++loadedImages;
    ctx.drawImage(startBackgroundImage, 0, 0, canvas.width, canvas.height);  // Rysuje obraz jako tło na początku
};

gameBackgroundImage.onload = function() {
    ++loadedImages;
};

spriteSheet.onload = function() {
    ++loadedImages;
};

const moleWidth = 128;
const moleHeight = 162;
let gameDuration = 60; // 60 seconds
let board = new Array(9).fill(0); // Initial mole board (all moles hidden)

let gameTime = 0;

// Funkcja, która uruchamia grę
function startGame() {
    console.log("Gra została rozpoczęta!");
    
    // Rysuje tło gry
    ctx.drawImage(gameBackgroundImage, 0, 0, canvas.width, canvas.height);
    
    // Rysuje krecika na odpowiednim miejscu
    let score = 0;
    gameTime = 0;
    const spriteX = 1 * moleWidth;  // Wybierz właściwy krecik z sprite sheet'a
    const spriteY = 0;  // Zakładam, że krecik jest w pierwszym wierszu sprite sheet'a
    
    // Rysowanie krecika na pozycji (100, 100)
    ctx.drawImage(spriteSheet, 386-28-moleWidth, 325-14-moleHeight,   moleWidth, moleHeight, 100, 100, moleWidth, moleHeight);
    
    board.fill(0);  // Resetuje planszę z kretami
}
/*
// Main game loop
function gameLoop(timestamp) {
    updateGame(1 / 60); // Assume 60 FPS for simplicity
    requestAnimationFrame(gameLoop);
}
function drawMole(x, y, frame) {
    const spriteX = frame * moleWidth;
    ctx.drawImage(spriteSheet, spriteX, 0, moleWidth, moleHeight, x, y, moleWidth, moleHeight);
}


// Update the game state (moving moles, updating score, etc.)
function updateGame(deltaTime) {
    //board = updateBoard(board, 3, 0.002, 200); // Update moles on the board

    // Clear the canvas and redraw the background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(gameBackgroundImage, 0, 0, canvas.width, canvas.height);  // Rysuje obraz jako tło

    // Draw moles on the board (3x3 grid)
    for (let i = 0; i < 9; i++) {
        const x = (i % 3) * (moleWidth + 20) + 200;
        const y = Math.floor(i / 3) * (moleHeight + 20) + 100;
        const moleState = board[i];

        if (moleState > 0) {
            drawMole(x, y, 0); // Adjust this to use different frames for different mole states
        }
    }

    // Update the game timer and check for game over
    if (gameTime >= gameDuration) {
        //gameRunning = false;
        //showGameOver();
    } else {
        gameTime += deltaTime;
    }
}

/*



let highscore = 0;
let gameDuration = 60; // 60 seconds
let gameTime = 0;
let gameRunning = false;
let board = new Array(9).fill(0); // Initial mole board (all moles hidden)

// Start game once both images are loaded
let imagesLoaded = 0;
function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        startGame(); // Start game after both background and sprite sheet are loaded
    }
}

// Ensure both images are loaded before starting the game
background.onload = imageLoaded;
spriteSheet.onload = imageLoaded;

// Function to draw the background image
function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}



// Update the game state (moving moles, updating score, etc.)
function updateGame(deltaTime) {
    board = updateBoard(board, 3, 0.002, 200); // Update moles on the board

    // Clear the canvas and redraw the background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // Draw the background first

    // Draw moles on the board (3x3 grid)
    for (let i = 0; i < 9; i++) {
        const x = (i % 3) * (moleWidth + 20) + 200;
        const y = Math.floor(i / 3) * (moleHeight + 20) + 100;
        const moleState = board[i];

        if (moleState > 0) {
            drawMole(x, y, 0); // Adjust this to use different frames for different mole states
        }
    }

    // Update the game timer and check for game over
    if (gameTime >= gameDuration) {
        gameRunning = false;
        showGameOver();
    } else {
        gameTime += deltaTime;
    }
}

// Show "Game Over" text when the game ends
function showGameOver() {
    ctx.fillStyle = "black";
    ctx.font = "42px Comic Sans MS";
    ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2);
    ctx.fillText("Score: " + score, canvas.width / 2 - 100, canvas.height / 2 + 50);
    highscore = Math.max(score, highscore);
    ctx.fillText("High Score: " + highscore, canvas.width / 2 - 100, canvas.height / 2 + 100);
}

// Start the game and reset variables
function startGame() {
    gameRunning = true;
    gameTime = 0;
    score = 0;
    board.fill(0); // Reset mole board
    requestAnimationFrame(gameLoop); // Start the game loop
}

// Main game loop
function gameLoop(timestamp) {
    if (gameRunning) {
        updateGame(1 / 60); // Assume 60 FPS for simplicity
        requestAnimationFrame(gameLoop);
    }
}

// Handle mouse click to detect mole whacking
canvas.addEventListener('mousedown', function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let i = 0; i < 9; i++) {
        const x = (i % 3) * (moleWidth + 20) + 200;
        const y = Math.floor(i / 3) * (moleHeight + 20) + 100;

        if (mouseX >= x && mouseX <= x + moleWidth && mouseY >= y && mouseY <= y + moleHeight) {
            if (board[i] > 0) {
                score += 10;
                board[i] = -100; // Mark mole as whacked
            }
        }
    }
});
*/