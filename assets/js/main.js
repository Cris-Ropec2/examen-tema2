
(() => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const uiLevel = document.getElementById("ui-level");
    const uiTimer = document.getElementById("ui-timer");
    const uiScore = document.getElementById("ui-score");
    const btnStart = document.getElementById("btn-start");

    const musicaFondo = new Audio('./assets/audio/musica_fondo.mp3');
    musicaFondo.loop = true; musicaFondo.volume = 0.4;
    const sonidoTrafico = new Audio('./assets/audio/traffic-passing.mp3');
    sonidoTrafico.loop = true; sonidoTrafico.volume = 0.3;
    const sonidoChoque = new Audio('./assets/audio/choque.mp3');
    sonidoChoque.volume = 0.7;

    const imgPlayer = new Image(); imgPlayer.src = './assets/img/auto-usuario.png';
    const imgPista = new Image(); imgPista.src = './assets/img/pista.jpg';
    const imgPremio = new Image(); imgPremio.src = './assets/img/premio-final.png';
    const enemyImages = [];
    for(let i=1; i<=4; i++) {
        let img = new Image();
        img.src = `./assets/img/auto-estorbo${i}.png`;
        enemyImages.push(img);
    }

    let level = 1, lives = 3, timeLeft = 60;
    let totalScore = 0, gameActive = false, animationId, timerId;
    let enemies = [], roadOffset = 0, shakeTime = 0, isFlashing = false;

    const player = { x: 250, y: 0, w: 35, h: 75 };

    function initLevel() {
        enemies = [];
        timeLeft = 60;
        player.y = canvas.height - 110;
        updateUI();
        if (gameActive) { musicaFondo.play(); sonidoTrafico.play(); }

        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
            if (timeLeft > 0 && gameActive) {
                timeLeft--;
                updateUI();
            } else if (timeLeft <= 0) {
                processLevelEnd();
            }
        }, 1000);
    }

    function updateUI() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        uiTimer.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        uiLevel.innerText = level;
        uiScore.innerText = totalScore; 
    }

    function processLevelEnd() {
        let levelPoints = (lives === 3) ? 100 : (lives === 2) ? 67 : 33;
        totalScore += levelPoints;
        updateUI();
        if (level < 8) {
            level++;
            alert(`¡Nivel superado! Acumulado: ${totalScore} pts.`);
            initLevel();
        } else { victory(); }
    }

    function handleCollision() {
        gameActive = false;
        lives--;
        sonidoChoque.currentTime = 0;
        sonidoChoque.play();
        shakeTime = 20; isFlashing = true; 

        setTimeout(() => {
            isFlashing = false; 
            if (lives > 0) {
                initLevel();
                gameActive = true;
                animate();
            } else {
                musicaFondo.pause(); sonidoTrafico.pause();
                alert(`GAME OVER.\nPuntaje final: ${totalScore}`);
                location.reload(); 
            }
        }, 600);
    }

    function spawnEnemy() {
        const lanes = [canvas.width * 0.25, canvas.width * 0.42, canvas.width * 0.58, canvas.width * 0.75];
        if (Math.random() < 0.055 + (level * 0.008)) {
            enemies.push({
                x: lanes[Math.floor(Math.random() * 4)] - 18,
                y: -100, w: 30, h: 65,
                speed: 8.5 + (level * 1.3), 
                img: enemyImages[Math.floor(Math.random() * 4)]
            });
        }
    }

    function animate() {
        if (!gameActive && shakeTime <= 0) return; 
        animationId = requestAnimationFrame(animate);
        ctx.save();
        if (shakeTime > 0) {
            ctx.translate((Math.random() - 0.5) * shakeTime * 0.3, (Math.random() - 0.5) * shakeTime * 0.3);
            shakeTime--;
        }
        roadOffset += 12 + level;
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height - canvas.height, canvas.width, canvas.height);
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height, canvas.width, canvas.height);

        ctx.fillStyle = "white"; ctx.font = "bold 20px Arial";
        ctx.fillText("VIDAS: " + "❤️".repeat(lives), 20, 35);
        ctx.drawImage(imgPlayer, player.x - 22, player.y, 45, 85);

        if (gameActive) {
            spawnEnemy();
            enemies.forEach((en, index) => {
                en.y += en.speed;
                ctx.drawImage(en.img, en.x - 7, en.y - 12, 45, 85);
                if (player.x - 15 < en.x + en.w && player.x + 15 > en.x &&
                    player.y + 10 < en.y + en.h && player.y + 70 > en.y) { handleCollision(); }
                if (en.y > canvas.height) enemies.splice(index, 1);
            });
        } else { enemies.forEach(en => ctx.drawImage(en.img, en.x - 7, en.y - 12, 45, 85)); }

        if (isFlashing) { ctx.fillStyle = "rgba(255, 0, 0, 0.4)"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.restore();
    }

    function victory() {
        gameActive = false; musicaFondo.pause(); sonidoTrafico.pause();
        ctx.fillStyle = "rgba(0,0,0,0.85)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgPremio, canvas.width/2 - 75, canvas.height/2 - 100, 150, 150);
        ctx.fillStyle = "gold"; ctx.textAlign = "center"; ctx.font = "bold 25px Arial";
        ctx.fillText("¡CAMPEÓN FINAL!", canvas.width/2, canvas.height/2 + 80);
    }

    // FUNCIÓN UNIFICADA DE MOVIMIENTO (Mouse + Touch)
    function handleMove(e) {
        if (!gameActive) return;
        const rect = canvas.getBoundingClientRect();
        // Detectar si es touch o mouse
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        
        let mX = clientX - rect.left;
        if (mX < 115) mX = 115; 
        if (mX > 385) mX = 385;
        player.x = mX;
        
        // Evita que el scroll del celular interfiera
        if (e.cancelable) e.preventDefault();
    }

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchstart', handleMove, { passive: false });

    btnStart.addEventListener("click", () => {
        canvas.width = 500; canvas.height = 700;
        btnStart.style.display = "none";
        gameActive = true; musicaFondo.play(); sonidoTrafico.play();
        totalScore = 0; level = 1; lives = 3;
        initLevel(); animate();
    });
})();