(() => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    
    // Elementos UI
    const uiLevel = document.getElementById("ui-level");
    const uiTimer = document.getElementById("ui-timer");
    const uiScore = document.getElementById("ui-score");
    const uiHigh = document.getElementById("high-score-display");
    const btnStart = document.getElementById("btn-start");

    // Imágenes del juego
    const imgPlayer = new Image(); imgPlayer.src = './assets/img/favicon.png'; // Usaremos el favicon o una imagen de auto
    const imgRoad = new Image(); imgRoad.src = './assets/img/esenario.jpg';

    // Estado del Juego
    let level = 1, lives = 3, timeLeft = 180; 
    let gameActive = false, animationId, timerId;
    let enemies = [], roadOffset = 0;
    let highScore = localStorage.getItem('nitroHighScore') || 0;

    const player = { x: 0, y: 0, w: 40, h: 70 };

    function initLevel() {
        enemies = [];
        timeLeft = 180; // 3 minutos por nivel
        player.y = canvas.height - 100;
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
        
        // Regla: Puntos basados en vidas (3=100, 2=66.6, 1=33.3)
        let score = (lives / 3) * 100;
        uiScore.innerText = score.toFixed(1);
    }

    function checkLevelProgression() {
        let score = (lives / 3) * 100;
        if (score >= 60) {
            if (level < 10) {
                level++;
                alert(`¡NIVEL ${level-1} SUPERADO! Avanzando al siguiente...`);
                initLevel();
            } else {
                victory();
            }
        } else {
            alert("Puntuación insuficiente (Menor a 60%). Fin del juego.");
            gameOver();
        }
    }

    function handleCollision() {
        gameActive = false;
        lives--;
        
        // Efecto de choque visual
        ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        setTimeout(() => {
            if (lives > 0) {
                alert(`¡CHOCASTE! Vidas restantes: ${lives}. Reiniciando nivel ${level}.`);
                initLevel();
                gameActive = true;
                animate();
            } else {
                alert("HAS PERDIDO TODAS TUS VIDAS. Volviendo al Nivel 1.");
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
        alert("¡FELICIDADES HAS COMPLETADO EL JUEGO!");
        drawVictoryScreen();
    }

    function spawnEnemy() {
        // Carretera de 4 carriles
        const lanes = [canvas.width * 0.15, canvas.width * 0.40, canvas.width * 0.65, canvas.width * 0.90];
        if (Math.random() < 0.01 + (level * 0.005)) {
            enemies.push({
                x: lanes[Math.floor(Math.random() * 4)] - 20,
                y: -100,
                w: 40, h: 70,
                speed: 3 + (level * 1.2), // Más rápido según el nivel
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
    }

    function animate() {
        if (!gameActive) return;
        animationId = requestAnimationFrame(animate);
        
        // Fondo con movimiento
        roadOffset += 4 + level;
        ctx.drawImage(imgRoad, 0, roadOffset % canvas.height - canvas.height, canvas.width, canvas.height);
        ctx.drawImage(imgRoad, 0, roadOffset % canvas.height, canvas.width, canvas.height);

        // Dibujar Vidas en el Canvas
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("VIDAS: " + "❤️".repeat(lives), 20, 30);

        // Jugador
        ctx.fillStyle = "#00fbff";
        ctx.fillRect(player.x - player.w/2, player.y, player.w, player.h);

        // Enemigos
        spawnEnemy();
        enemies.forEach((en, index) => {
            en.y += en.speed;
            ctx.fillStyle = en.color;
            ctx.fillRect(en.x, en.y, en.w, en.h);

            // Hitbox precisa
            if (player.x - player.w/2 < en.x + en.w && player.x + player.w/2 > en.x &&
                player.y < en.y + en.h && player.y + player.h > en.y) {
                handleCollision();
            }

            if (en.y > canvas.height) enemies.splice(index, 1);
        });
    }

    function drawVictoryScreen() {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "gold";
        ctx.textAlign = "center";
        ctx.font = "40px Bold Arial";
        ctx.fillText("🏆", canvas.width/2, canvas.height/2 - 20);
        ctx.font = "20px Arial";
        ctx.fillText("¡CAMPEÓN!", canvas.width/2, canvas.height/2 + 20);
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