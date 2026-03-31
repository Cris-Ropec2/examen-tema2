(() => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const uiLevel = document.getElementById("ui-level");
    const uiTimer = document.getElementById("ui-timer");
    const uiScore = document.getElementById("ui-score");
    const btnStart = document.getElementById("btn-start");

    const imgPlayer = new Image(); imgPlayer.src = './assets/img/auto-usuario.png';
    const imgPista = new Image(); imgPista.src = './assets/img/pista.jpg';
    const imgPremio = new Image(); imgPremio.src = './assets/img/premio-final.png';
    
    const enemyImages = [];
    for(let i=1; i<=4; i++) {
        let img = new Image();
        img.src = `./assets/img/auto-estorbo${i}.png`;
        enemyImages.push(img);
    }

    let level = 1, lives = 3, timeLeft = 90; 
    let gameActive = false, animationId, timerId;
    let enemies = [], roadOffset = 0;

    const player = { x: 250, y: 0, w: 35, h: 75 };

    function initLevel() {
        enemies = [];
        timeLeft = 90;
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
        uiScore.innerText = ((lives / 3) * 100).toFixed(0);
    }

    function checkProgress() {
        if ((lives / 3) * 100 >= 60) {
            if (level < 10) {
                level++;
                alert(`¡Nivel ${level-1} superado!`);
                initLevel();
            } else {
                victory();
            }
        } else {
            alert("Vidas insuficientes para avanzar. Reintentando...");
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
                alert("SIN VIDAS. Volviendo al Nivel 1.");
                location.reload(); 
            }
        }, 500);
    }

    function spawnEnemy() {
        // Carriles ajustados al nuevo ancho de canvas (500px)
        const lanes = [canvas.width * 0.25, canvas.width * 0.42, canvas.width * 0.58, canvas.width * 0.75];
        if (Math.random() < 0.04 + (level * 0.006)) {
            enemies.push({
                x: lanes[Math.floor(Math.random() * 4)] - 20,
                y: -100,
                w: 30, h: 65,
                speed: 6.5 + (level * 1.0),
                img: enemyImages[Math.floor(Math.random() * 4)]
            });
        }
    }

    function animate() {
        if (!gameActive) return;
        animationId = requestAnimationFrame(animate);
        
        roadOffset += 8 + level;
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height - canvas.height, canvas.width, canvas.height);
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height, canvas.width, canvas.height);

        // Vidas dibujadas con estilo
        ctx.fillStyle = "white";
        ctx.font = "bold 20px Arial";
        ctx.fillText("VIDAS: " + "❤️".repeat(lives), 20, 35);

        ctx.drawImage(imgPlayer, player.x - 22, player.y, 45, 85);

        spawnEnemy();
        enemies.forEach((en, index) => {
            en.y += en.speed;
            ctx.drawImage(en.img, en.x - 7, en.y - 12, 45, 85);

            if (player.x - 15 < en.x + en.w && player.x + 15 > en.x &&
                player.y + 10 < en.y + en.h && player.y + 70 > en.y) {
                handleCollision();
            }
            if (en.y > canvas.height) enemies.splice(index, 1);
        });
    }

    function victory() {
        gameActive = false;
        clearInterval(timerId);
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgPremio, canvas.width/2 - 75, canvas.height/2 - 100, 150, 150);
        ctx.fillStyle = "gold";
        ctx.textAlign = "center";
        ctx.font = "bold 25px Arial";
        ctx.fillText("¡ERES EL CAMPEÓN!", canvas.width/2, canvas.height/2 + 80);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        let mX = e.clientX - rect.left;
        // Límites estrictos para que no toque el pasto en el nuevo ancho
        if (mX < 110) mX = 110; 
        if (mX > 390) mX = 390;
        player.x = mX;
    });

    btnStart.addEventListener("click", () => {
        canvas.width = 500; // Canvas más ancho
        canvas.height = 700; // Canvas más alto
        btnStart.style.display = "none";
        gameActive = true;
        initLevel();
        animate();
    });
})();