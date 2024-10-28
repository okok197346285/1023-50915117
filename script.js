const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let ballRadius = 12;
let x, y, dx, dy;
let paddleHeight = 15;
let paddleWidth = 150;
let paddleX;
let score = 0;
let rightPressed = false;
let leftPressed = false;
let difficulty;
let brickRowCount;
let brickColumnCount;
const brickWidth = 100;
const brickHeight = 30;
const brickPadding = 15;
const brickOffsetTop = 50;
const brickOffsetLeft = 50;
let bricks = [];
let totalHitsNeeded; // 記錄需要的總擊打次數

// 音樂和音效
const backgroundMusic = document.getElementById("backgroundMusic");
const brickHitSound = document.getElementById("brickHitSound");

// 初始化磚塊並計算所需的總擊打次數
function initBricks(rowCount, columnCount, hits) {
    bricks = [];
    totalHitsNeeded = 0;
    for (let c = 0; c < columnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < rowCount; r++) {
            const strength = hits[r % hits.length];
            bricks[c][r] = { x: 0, y: 0, status: strength, strength: strength };
            totalHitsNeeded += strength;
        }
    }
}

// 開始遊戲
function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    document.getElementById("difficultyMenu").style.display = "none";
    document.getElementById("restartButton").style.display = "block";
    canvas.style.display = "block";

    backgroundMusic.play(); // 開始播放背景音樂
    resetGame();
    draw();
}

// 重置遊戲參數
function resetGame() {
    if (difficulty === 'easy') {
        dx = 3; dy = -3;
        brickRowCount = 3; brickColumnCount = 7;
        initBricks(brickRowCount, brickColumnCount, [1]);
    } else if (difficulty === 'medium') {
        dx = 2; dy = -2;
        brickRowCount = 5; brickColumnCount = 8;
        initBricks(brickRowCount, brickColumnCount, [1, 2]);
    } else if (difficulty === 'hard') {
        dx = 5; dy = -5;
        brickRowCount = 6; brickColumnCount = 10;
        initBricks(brickRowCount, brickColumnCount, [1, 2, 3]);
    }

    x = canvas.width / 2;
    y = canvas.height - 40;
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    rightPressed = false;
    leftPressed = false;
}

function restartGame() {
    document.getElementById("gameOverDialog").style.display = "none";
    canvas.style.display = "block";
    resetGame();
    draw();
}

function setBackground(theme) {
    canvas.className = theme; // 設置背景主題類別
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// 碰撞檢測
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status > 0) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status--;
                    totalHitsNeeded--;
                    score++;
                    brickHitSound.play(); // 播放磚塊擊打音效

                    if (totalHitsNeeded === 0) {
                        setTimeout(() => {
                            showGameOverDialog("恭喜！你贏了！");
                            backgroundMusic.pause(); // 停止背景音樂
                        }, 100);
                    }
                }
            }
        }
    }
}

// 遊戲主循環
function draw() {
    // 使用透明度清除畫布，留下前幾幀的部分影像，製造尾跡效果
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; // 半透明白色
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            setTimeout(() => {
                showGameOverDialog("遊戲結束！");
                backgroundMusic.pause(); // 停止背景音樂
            }, 100);
            return;
        }
    }

    x += dx;
    y += dy;

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 10;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 10;
    }

    requestAnimationFrame(draw);
}

function showGameOverDialog(message) {
    document.getElementById("gameOverMessage").innerText = message;
    document.getElementById("gameOverDialog").style.display = "block";
    canvas.style.display = "none";
}

function goToMainMenu() {
    document.getElementById("gameOverDialog").style.display = "none";
    document.getElementById("difficultyMenu").style.display = "block";
    document.getElementById("restartButton").style.display = "none";
    canvas.style.display = "none";
    backgroundMusic.pause(); // 停止背景音樂
    backgroundMusic.currentTime = 0; // 重設音樂位置
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status > 0) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = bricks[c][r].status === 1 ? "#0095DD" : bricks[c][r].status === 2 ? "#DD9500" : "#DD0000";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}
