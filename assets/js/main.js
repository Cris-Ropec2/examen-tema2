(() => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const uiLevel = document.getElementById("ui-level");
    const uiTimer = document.getElementById("ui-timer");
    const uiScore = document.getElementById("ui-score");
    const uiHigh = document.getElementById("high-score-display");
    const btnStart = document.getElementById("btn-start");

    // --- CARGA DE ACTIVOS ---
    const imgPlayer = new Image(); imgPlayer.src = './assets/img/auto-usuario.png';
    const imgPista = new Image(); imgPista.src = './assets/img/pista.jpg';
    const imgPremio = new Image(); imgPremio.src = './assets/img/premio-final.png';
    
    const enemyImages = [];
    for(let i=1; i<=4; i++) {
        let img = new Image();
        img.src = `./assets/img/auto-estorbo${i}.png`;
        enemyImages.push(img);
    }

    // --- VARIABLES DE ESTADO ---
    let level = 1, lives = 3, timeLeft = 180; 
    let gameActive = false, animationId, timerId;
    let enemies = [], roadOffset = 0;
    let highScore = localStorage.getItem('nitroHighScore') || 0;

    const player = { x: 200, y: 0, w: 35, h: 75 };

    function initLevel() {
        enemies = [];
        timeLeft = 180; 
        player.y = canvas.height - 110;
        updateUI();
        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
            if (timeLeft > 0 && gameActive) {
                timeLeft--;
                updateUI();
            } else if (timeLeft <= 0) {
                checkProgress();
            }
        }, 1000);
    }

    function updateUI() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        uiTimer.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        uiLevel.innerText = level;
        uiHigh.innerText = `Récord Máximo: Nivel ${highScore}`;
        uiScore.innerText = ((lives / 3) * 100).toFixed(1);
    }

    function checkProgress() {
        if ((lives / 3) * 100 >= 60) {
            if (level < 10) {
                level++;
                alert(`¡Nivel ${level-1} completado!`);
                initLevel();
            } else {
                victory();
            }
        } else {
            alert("Puntos insuficientes. Intenta de nuevo.");
            initLevel();
        }
    }

    function handleCollision() {
        gameActive = false;
        lives--;
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setTimeout(() => {
            if (lives > 0) {
                initLevel();
                gameActive = true;
                animate();
            } else {
                alert("SIN VIDAS. Reiniciando juego.");
                location.reload(); 
            }
        }, 500);
    }

    function spawnEnemy() {
        const lanes = [canvas.width * 0.22, canvas.width * 0.40, canvas.width * 0.58, canvas.width * 0.77];
        if (Math.random() < 0.018 + (level * 0.004)) {
            enemies.push({
                x: lanes[Math.floor(Math.random() * 4)] - 20,
                y: -100,
                w: 28, h: 60, // Hitbox optimizada
                speed: 4 + (level * 0.75),
                img: enemyImages[Math.floor(Math.random() * 4)]
            });
        }
    }

    function animate() {
        if (!gameActive) return;
        animationId = requestAnimationFrame(animate);
        
        // Carretera infinita
        roadOffset += 4 + level;
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height - canvas.height, canvas.width, canvas.height);
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height, canvas.width, canvas.height);

        // Vidas y HUD
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.fillText("VIDAS: " + "❤️".repeat(lives), 15, 25);

        // Jugador (auto-usuario)
        ctx.drawImage(imgPlayer, player.x - 22, player.y, 45, 85);

        // Obstáculos (autos-estorbo)
        spawnEnemy();
        enemies.forEach((en, index) => {
            en.y += en.speed;
            ctx.drawImage(en.img, en.x - 7, en.y - 12, 45, 85);

            // COLISIÓN (Hitbox reducida para justicia)
            if (player.x - 12 < en.x + en.w && player.x + 12 > en.x &&
                player.y + 10 < en.y + en.h && player.y + 70 > en.y) {
                handleCollision();
            }
            if (en.y > canvas.height) enemies.splice(index, 1);
        });
    }

    function victory() {
        gameActive = false;
        clearInterval(timerId);
        if (level > highScore) localStorage.setItem('nitroHighScore', level);
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgPremio, canvas.width/2 - 50, canvas.height/2 - 80, 100, 100);
        ctx.fillStyle = "gold";
        ctx.textAlign = "center";
        ctx.fillText("¡COMPLETASTE EL JUEGO!", canvas.width/2, canvas.height/2 + 50);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        let mX = e.clientX - rect.left;
        if (mX < 70) mX = 70; // Límites de la pista gris
        if (mX > 330) mX = 330;
        player.x = mX;
    });

    btnStart.addEventListener("click", () => {
        canvas.width = 400; 
        canvas.height = 600;
        btnStart.style.display = "none";
        gameActive = true;
        initLevel();
        animate();
    });
})();