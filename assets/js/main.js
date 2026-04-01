(() => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const uiLevel = document.getElementById("ui-level");
    const uiTimer = document.getElementById("ui-timer");
    const uiScore = document.getElementById("ui-score");
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
    let totalScore = 0; 
    let gameActive = false, animationId, timerId;
    let enemies = [], roadOffset = 0;

    // Variables para el efecto de choque (Shake y Flash)
    let shakeTime = 0; 
    let isFlashing = false;

    const player = { x: 250, y: 0, w: 35, h: 75 };

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
        let levelPoints = 0;
        if (lives === 3) levelPoints = 100;
        else if (lives === 2) levelPoints = 67;
        else if (lives === 1) levelPoints = 33;

        totalScore += levelPoints; 
        updateUI();

        if (level < 8) {
            level++;
            alert(`¡Nivel ${level-1} superado! Puntos obtenidos: ${levelPoints}. Total: ${totalScore}`);
            initLevel();
        } else {
            victory();
        }
    }

    // --- FUNCIÓN DE COLISIÓN MODIFICADA (Efecto Visual) ---
    function handleCollision() {
        lives--;
        
        // Activar efectos visuales
        shakeTime = 20; // Duración de la sacudida (en frames)
        isFlashing = true; // Activar parpadeo rojo

        // Pausar el juego momentáneamente para que se note el golpe
        gameActive = false; 

        // Reproducir sonido de choque aquí si tuvieras uno: soundCrash.play();

        setTimeout(() => {
            isFlashing = false; // Apagar flash rojo
            if (lives > 0) {
                initLevel();
                gameActive = true;
                animate();
            } else {
                alert(`GAME OVER. Te quedaste sin vidas en el Nivel ${level}.\nPuntaje final: ${totalScore}`);
                location.reload(); 
            }
        }, 600); // Tiempo que dura el flash rojo y la pausa
    }

    function spawnEnemy() {
        const lanes = [canvas.width * 0.25, canvas.width * 0.42, canvas.width * 0.58, canvas.width * 0.75];
        if (Math.random() < 0.045 + (level * 0.007)) {
            enemies.push({
                x: lanes[Math.floor(Math.random() * 4)] - 20,
                y: -100,
                w: 30, h: 65,
                speed: 7.5 + (level * 1.15), // Un poco más rápido
                img: enemyImages[Math.floor(Math.random() * 4)]
            });
        }
    }

    // --- BUCLE DE ANIMACIÓN MODIFICADO (Efecto Shake) ---
    function animate() {
        // Ejecutar animate incluso si gameActive es false momentáneamente para el efecto de shake
        if (!gameActive && shakeTime <= 0) return; 
        animationId = requestAnimationFrame(animate);
        
        ctx.save(); // Guardar estado limpio del canvas

        // --- APLICAR EFECTO SHAKE (SACUDIDA) ---
        if (shakeTime > 0) {
            // Calculamos un desplazamiento aleatorio que disminuye con el tiempo
            const shakeForce = shakeTime * 0.25; 
            const offsetX = (Math.random() - 0.5) * shakeForce;
            const offsetY = (Math.random() - 0.5) * shakeForce;
            ctx.translate(offsetX, offsetY); // Movemos todo el canvas
            shakeTime--; // Decrementar el tiempo de sacudida
        }

        // --- DIBUJAR JUEGO NORMAL ---
        roadOffset += 10 + level; // Pista más rápida
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height - canvas.height, canvas.width, canvas.height);
        ctx.drawImage(imgPista, 0, roadOffset % canvas.height, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 20px Arial";
        ctx.fillText("VIDAS: " + "❤️".repeat(lives), 20, 35);

        ctx.drawImage(imgPlayer, player.x - 22, player.y, 45, 85);

        // Si el juego está activo, actualizar enemigos
        if (gameActive) {
            spawnEnemy();
            enemies.forEach((en, index) => {
                en.y += en.speed;
                ctx.drawImage(en.img, en.x - 7, en.y - 12, 45, 85);

                // COLISIÓN ULTRA-PRECISA
                if (player.x - 12 < en.x + en.w && player.x + 12 > en.x &&
                    player.y + 10 < en.y + en.h && player.y + 70 > en.y) {
                    handleCollision();
                }
                if (en.y > canvas.height) enemies.splice(index, 1);
            });
        } else {
            // Si está pausado por choque, dibujar enemigos quietos
            enemies.forEach((en) => {
                ctx.drawImage(en.img, en.x - 7, en.y - 12, 45, 85);
            });
        }

        // --- APLICAR FLASH ROJO (PARPADEO) ---
        if (isFlashing) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Rojo semi-transparente
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.restore(); // Restaurar estado del canvas (quitar translate del shake)
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
        ctx.fillText("¡ERES EL CAMPEÓN FINAL!", canvas.width/2, canvas.height/2 + 80);
        ctx.font = "20px Arial";
        ctx.fillText(`PUNTAJE TOTAL: ${totalScore} PTS`, canvas.width/2, canvas.height/2 + 115);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        let mX = e.clientX - rect.left;
        if (mX < 110) mX = 110; 
        if (mX > 390) mX = 390;
        player.x = mX;
    });

    btnStart.addEventListener("click", () => {
        canvas.width = 500; 
        canvas.height = 700;
        btnStart.style.display = "none";
        gameActive = true;
        totalScore = 0;
        level = 1;
        lives = 3;
        initLevel();
        animate();
    });
})();