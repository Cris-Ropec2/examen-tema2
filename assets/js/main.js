/**
 * main.js - ITP Nitro Racer (Versión Desafío Extremo)
 * Christopher Rodríguez Pérez
 */
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
    let level = 1, lives = 3, timeLeft = 90; 
    let gameActive = false, animationId, timerId;
    let enemies = [], roadOffset = 0;
    let highScore = localStorage.getItem('nitroHighScore') || 0;

    const player = { x: 200, y: 0, w: 35, h: 75 };

    function initLevel() {
        enemies = [];
        timeLeft = 90; // 1:30 min
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
            alert("Puntos insuficientes (Menor a 60%). Reintentando nivel...");
            initLevel();
        }
    }

    function handleCollision() {
        gameActive = false;
        lives--;
        ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setTimeout(() => {
            if (lives > 0) {
                initLevel();
                gameActive = true;
                animate();
            } else {
                alert("SIN VIDAS. Reiniciando desde el Nivel 1.");
                location.reload(); 
            }
        }, 500);
    }

    function spawnEnemy() {
        // AJUSTE: Carriles más cerrados para que no toquen el pasto lateral
        const lanes = [canvas.width * 0.25, canvas.width * 0.42, canvas.width * 0.58, canvas.width * 0.75];
        
        // AJUSTE: Probabilidad aumentada significativamente (de 0.02 a 0.04 base)
        if (Math.random() < 0.04 + (level * 0.006)) {
            enemies.push({
                x: lanes[Math.floor(Math.random() * 4)] - 18,
                y: -100,
                w: 28, h: 60, // Hitbox optimizada
                speed: 6 + (level * 0.9), // Velocidad base más alta
                img: enemyImages[Math.floor(Math.random() * 4)]
            });
        }
    }

    function animate() {
        if (!gameActive) return;
        animationId = requestAnimationFrame(animate);
        
        roadOffset += 7 + level; // Pista más veloz
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height - canvas.height, canvas.width, canvas.height);
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height, canvas.width, canvas.height);

        // Vidas y HUD
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.fillText("VIDAS: " + "❤️".repeat(lives), 15, 25);

        // Jugador (auto-usuario)
        ctx.drawImage(imgPlayer, player.x - 22, player.y, 45, 85);

        spawnEnemy();
        enemies.forEach((en, index) => {
            en.y += en.speed;
            ctx.drawImage(en.img, en.x - 7, en.y - 12, 45, 85);

            // COLISIÓN (Hitbox ultra-precisa)
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
        
        // AJUSTE: Límites de pista más estrictos (No toca el pasto)
        if (mX < 95) mX = 95; 
        if (mX > 305) mX = 305;
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