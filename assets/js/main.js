(() => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    
    // Elementos UI
    const uiLevel = document.getElementById("ui-level");
    const uiTimer = document.getElementById("ui-timer");
    const uiScore = document.getElementById("ui-score");
    const uiHigh = document.getElementById("high-score-display");
    const btnStart = document.getElementById("btn-start");

    // --- CARGA DE IMÁGENES ---
    const imgPlayer = new Image(); imgPlayer.src = './assets/img/auto-usuario.png';
    const imgPista = new Image(); imgPista.src = './assets/img/pista.jpg';
    const imgPremio = new Image(); imgPremio.src = './assets/img/premio-final.png';
    
    // Arreglo de autos enemigos (estorbos)
    const enemyImages = [];
    for(let i=1; i<=4; i++) {
        let img = new Image();
        img.src = `./assets/img/auto-estorbo${i}.png`;
        enemyImages.push(img);
    }

    // Estado del Juego
    let level = 1, lives = 3, timeLeft = 180; 
    let gameActive = false, animationId, timerId;
    let enemies = [], roadOffset = 0;
    let highScore = localStorage.getItem('nitroHighScore') || 0;

    const player = { x: 0, y: 0, w: 45, h: 85 };

    function initLevel() {
        enemies = [];
        timeLeft = 180; 
        player.y = canvas.height - 110;
        updateUI();
        startTimer();
    }

    function startTimer() {
        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
            if (timeLeft > 0 && gameActive) {
                timeLeft--;
                updateUI();
            } else if (timeLeft <= 0) {
                checkLevelProgression();
            }
        }, 1000);
    }

    function updateUI() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        uiTimer.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        uiLevel.innerText = level;
        uiHigh.innerText = `Récord Máximo: ${highScore}`;
        
        let score = (lives / 3) * 100;
        uiScore.innerText = score.toFixed(1);
    }

    function checkLevelProgression() {
        let score = (lives / 3) * 100;
        if (score >= 60) {
            if (level < 10) {
                level++;
                alert(`¡NIVEL ${level-1} SUPERADO!`);
                initLevel();
            } else {
                victory();
            }
        } else {
            alert("Puntuación insuficiente para avanzar.");
            gameOver();
        }
    }

    function handleCollision() {
        gameActive = false;
        lives--;
        
        // Efecto visual de choque
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        setTimeout(() => {
            if (lives > 0) {
                initLevel();
                gameActive = true;
                animate();
            } else {
                alert("GAME OVER - Volviendo al Nivel 1.");
                gameOver();
            }
        }, 500);
    }

    function gameOver() {
        gameActive = false;
        level = 1;
        lives = 3;
        cancelAnimationFrame(animationId);
        clearInterval(timerId);
        btnStart.style.display = "block";
    }

    function victory() {
        gameActive = false;
        clearInterval(timerId);
        if (level > highScore) localStorage.setItem('nitroHighScore', level);
        drawVictoryScreen();
    }

    function spawnEnemy() {
        const lanes = [canvas.width * 0.15, canvas.width * 0.40, canvas.width * 0.65, canvas.width * 0.90];
        if (Math.random() < 0.015 + (level * 0.005)) {
            enemies.push({
                x: lanes[Math.floor(Math.random() * 4)] - 22,
                y: -100,
                w: 45, h: 85,
                speed: 4 + (level * 0.8),
                img: enemyImages[Math.floor(Math.random() * 4)]
            });
        }
    }

    function animate() {
        if (!gameActive) return;
        animationId = requestAnimationFrame(animate);
        
        // --- DIBUJAR PISTA (FONDO INFINITO) ---
        roadOffset += 5 + level;
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height - canvas.height, canvas.width, canvas.height);
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height, canvas.width, canvas.height);

        // Vidas en pantalla
        ctx.fillStyle = "white";
        ctx.font = "bold 18px Arial";
        ctx.fillText("VIDAS: " + "❤️".repeat(lives), 20, 35);

        // --- DIBUJAR AUTO USUARIO ---
        ctx.drawImage(imgPlayer, player.x - player.w/2, player.y, player.w, player.h);

        // --- DIBUJAR AUTOS ESTORBO ---
        spawnEnemy();
        enemies.forEach((en, index) => {
            en.y += en.speed;
            ctx.drawImage(en.img, en.x, en.y, en.w, en.h);

            // Colisión
            if (player.x - 20 < en.x + en.w && player.x + 20 > en.x &&
                player.y < en.y + en.h && player.y + player.h > en.y) {
                handleCollision();
            }

            if (en.y > canvas.height) enemies.splice(index, 1);
        });
    }

    function drawVictoryScreen() {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgPremio, canvas.width/2 - 60, canvas.height/2 - 100, 120, 120);
        ctx.fillStyle = "gold";
        ctx.textAlign = "center";
        ctx.font = "24px Arial";
        ctx.fillText("¡FELICIDADES!", canvas.width/2, canvas.height/2 + 50);
        ctx.fillText("HAS COMPLETADO EL JUEGO", canvas.width/2, canvas.height/2 + 85);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        player.x = e.clientX - rect.left;
    });

    btnStart.addEventListener("click", () => {
        canvas.width = 400; canvas.height = 600;
        btnStart.style.display = "none";
        gameActive = true;
        lives = 3;
        initLevel();
        animate();
    });
})();