// Haetaan canvas ja konteksti, skaalataan korkean resoluution tuella
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1; // Laadukas suorituskyky

// Ladataan pelaajan ja vihollisen kuvat
const images = {
    invader: new Image(),
    player: new Image(),
};
images.invader.src = './kuvat/invader.png';
images.player.src = './kuvat/spaceship.png';

//
// PELAAJA
//

//pelaajan koko ja sijainti
const player = {
    width: 60,
    height: 60,
    x: 0,
    y: 0
};
//funktio, joka piirtää pelaajan canvakselle
function drawPlayer() {
    ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
}

//muuttujat pelaajan liikkeeseen ja ampumiseen
let leftPressed = false;
let rightPressed = false;
let canShoot = true;

//kuuntelijat näppäimistölle
document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            leftPressed = true;//liikkuu vasemmalle
            break;
        case "ArrowRight":
            rightPressed = true;//liikkuu oikealle
            break;
        case " ":
            //ampuminen 
            if (canShoot) {
                playerBullets.push({
                    x: player.x + player.width / 2 - 2,//ammus lähtee pelaajan keskeltä
                    y: player.y,
                    //ammuksen koko ja väri
                    width: 4,
                    height: 15,
                    color: "yellow"
                });
                canShoot = false;//estää jatkuvan ampumisen
            }
            break;
    }
});
//lopettaa liikkumisen ja ampumisen, kun näppäin on ylhäällä
document.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            leftPressed = false;
            break;
        case "ArrowRight":
            rightPressed = false;
            break;
        case " ":
            canShoot = true;
            break;
    }
});

// Päivitetään pelaajan sijainti painalluksien perusteella
function updatePlayer() {
    if (leftPressed && player.x > 0) {
        player.x -= 8;
    }
    if (rightPressed && player.x < (canvas.width / dpr) - player.width) {
        player.x += 8;
    }
}

// Pelaajan ammukset
const playerBullets = [];

//piirtää kaikki pelaajan ammukset canvakselle
function drawPlayerBullets() {
    playerBullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}
//liikuttaa ammuksia ja poistaa ruudun ulkopuolelle menneet.
function updatePlayerBullets() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        playerBullets[i].y -= 12; // Liikutetaan ammusta ylöspäin
        if (playerBullets[i].y < 0) {
            playerBullets.splice(i, 1); // Poistetaan ruudun ulkopuolelle menneet
        }
    }
}

//
// VIHOLLISET
//
const enemyGroups = [];
//luodaan vihollisryhmät
function createEnemies(difficulty) {
    const enemyWidth = 32;
    const enemyHeight = 40;
    const hSpacing = 15;
    const vSpacing = 15;
    const rows = 3;
    const baseCols = 1;
    //sarakkeita lisätään, kun vaikeustaso nousee, max 4 saraketta
    const additionalCols = Math.floor((difficulty - 1) / 2);
    const cols = Math.min(baseCols + additionalCols, 4);

    //satunnainen spawn vihollisryhmälle
    const availableWidth = canvas.width / dpr;
    const totalWidth = cols * enemyWidth + (cols - 1) * hSpacing;
    const maxStartX = availableWidth - totalWidth;
    const startX = Math.random() * (maxStartX > 0 ? maxStartX : 0);
    const startY = 20;

    const group = {
        enemies: [],
        direction: 2.5, //suunta=oikealle
        speed: 100 // Ryhmän liikkumisnopeus
    };
    // Täytetään vihollisryhmä rivien ja sarakkeiden perusteella
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            group.enemies.push({
                x: startX + col * (enemyWidth + hSpacing),
                y: startY + row * (enemyHeight + vSpacing),
                width: enemyWidth,
                height: enemyHeight,
                alive: true
            });
        }
    }
    enemyGroups.push(group);
}
//piirtää kaikki vihollisryhmät
function drawEnemyGroups() {
    ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
    ctx.shadowBlur = 15;
    enemyGroups.forEach(group => {
        group.enemies.forEach(enemy => {
            ctx.drawImage(images.invader, enemy.x, enemy.y, enemy.width, enemy.height);
        });
    });
}
//päivittää vihollisryhmien sijainnin ja tarkistaa koska ryhmät osuvat reunaan
function updateEnemyGroups(deltaTime) {
    for (let i = enemyGroups.length - 1; i >= 0; i--) {
        const group = enemyGroups[i];
        let hitEdge = false;

        //tarkistaa osuuko jokin vihollinen reunaan
        group.enemies.forEach(enemy => {
            const rightEdge = enemy.x + enemy.width;
            if (rightEdge >= canvas.width / dpr || enemy.x <= 0) {
                hitEdge = true;
            }
        });
        //jos reunaan osuu, vaihtaa liikesuuntaa ja ryhmä tippuu alemmas
        if (hitEdge) {
            group.direction *= -1;
            group.enemies.forEach(enemy => {
                //varmistaa, että vihollinen pysyy ruudulla laskemalla canvaksen koon ja
                enemy.x = Math.max(0, Math.min(enemy.x, canvas.width / dpr - enemy.width));
                enemy.y += 25;
            });
        }
        //tiputtaa vihollisia ja lisää pienen aaltoiluefektin
        group.enemies.forEach(enemy => {
            enemy.x += group.direction * (deltaTime / 1000) * group.speed;
            enemy.y += Math.sin(performance.now() / 500) * 0.3;
        });
        //poistaa ryhmän, jos siinä ei ole enään yhtään vihollisia
        if (group.enemies.length === 0) {
            enemyGroups.splice(i, 1);
        }
    }
}

//
// TÄHTITAIVAS
//
const starField = [];
//luo satunnaisen tähtitaivaan aina kun peli päivitetään
function createStarField() {
    const starCount = 60;//tähtien määrä

    starField.length = 0;
    for (let i = 0; i < starCount; i++) {
        starField.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.5
        });
    }
}
//piirtää tähtitaivaan
function drawStarField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //luo taustan tähdille
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(1, "#000033");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //tähtien väri
    ctx.fillStyle = "white";
    starField.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

//
// PISTEET
//
let score = 0;

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = '2vh "Press Start 2P"';
    ctx.textAlign = "left";
    ctx.fillText(`Pisteet: ${score}`, 15, 600);
}

//
// TÖRMÄYSTEN TARKISTUS
//
//tarkistaa osuuko pelaajan ammukset viholliseen
function checkBulletCollisions() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let bulletHit = false;
        //käy läpi eka vihollisryhmät
        for (let g = enemyGroups.length - 1; g >= 0 && !bulletHit; g--) {
            const group = enemyGroups[g];
            //käy läpi kunkin ryhmän viholliset
            for (let j = group.enemies.length - 1; j >= 0; j--) {
                const enemy = group.enemies[j];
                //törmäystarkistus tekoälyn luoma
                if (
                    playerBullets[i].x < enemy.x + enemy.width &&
                    playerBullets[i].x + playerBullets[i].width > enemy.x &&
                    playerBullets[i].y < enemy.y + enemy.height &&
                    playerBullets[i].y + playerBullets[i].height > enemy.y
                ) {
                    //poistaa viholliset johon on osunut ja lisää 10 pistettä osumasta
                    group.enemies.splice(j, 1);
                    score += 10;
                    bulletHit = true;
                    break;
                }
            }
        }
        //poistaa ammuksen, jos se osuu
        if (bulletHit) {
            playerBullets.splice(i, 1);
        }
    }
}

const enemyBullets = [];

// Vihollisen ampuminen tapahtuu satunnaisesti Math.randomilla
function spawnEnemyBullets() {
    enemyGroups.forEach(group => {
        group.enemies.forEach(enemy => {
            //todennäköisyys millä vihollinen ampuu(pienempi=ampuu harvemmin)
            if (Math.random() < 0.003 && enemy.alive) {
                enemyBullets.push({
                    //ammuksen lähtösijainti ja ulkonäkö
                    x: enemy.x + enemy.width / 2 - 2,
                    y: enemy.y + enemy.height,
                    width: 4,
                    height: 15,
                    color: "red"
                });
            }
        });
    });
}
//liikuttaa vihollisen ammuksia ja poistaa ruudun ulkopuolelle menneet
function updateEnemyBullets(deltaTime) {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += 5 * (deltaTime / 16.67);
        if (enemyBullets[i].y > canvas.height / dpr) {
            enemyBullets.splice(i, 1);
        }
    }
}
//piirto canvakselle
function drawEnemyBullets() {
    enemyBullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Tarkistaa, osuuko vihollisen ammukset pelaajaan
function checkPlayerCollisions() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            //peli pysähtyy, jos pelaajaan osuu
            isGameRunning = false;
            //kutsuu aloitussivua
            document.getElementById("gameOverlay").style.display = "block";
            enemyBullets.splice(i, 1);
        }
    }
}

//
// CANVAS JA SELAIMEN KOKO
//
//päivittää canvaksen koon vastaamaan ikkunan kokoa
function updateCanvasSize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    player.x = (canvas.width / dpr) / 2 - player.width / 2;
    player.y = canvas.height / dpr - player.height - 3;
}

//
// PELISILMUKKA JA PELIN HALLINTA
//
let isGameRunning = false;
let lastTimestamp = 0;
let spawnTimer = 0;//ajastin uusien vihollisryhmien luomiselle
let spawnInterval = 4000;//aika jonka jälkeen luodaan uusi vihollisryhmä
let difficulty = 1;//pelin "vaikeustaso", joka kasvaa ajan myötän

//pelisilmukka, joka kutsutaan requestAnimationFrame-metodilla
function gameLoop(timestamp) {
    if (!isGameRunning) return;

    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    spawnTimer += deltaTime;

    //luo uuden vihollisryhmän, kun spawnTimer ylittää spawnInterval-arvon
    if (spawnTimer >= spawnInterval) {
        if (enemyGroups.length < 8) {
            createEnemies(difficulty);
            difficulty += 0.5;//kasvattaa vaikeustasoa
        }
        spawnTimer = 0;
    }

    //päivittää canvaksen
    updatePlayer();
    updatePlayerBullets();
    updateEnemyGroups(deltaTime);
    spawnEnemyBullets();
    updateEnemyBullets(deltaTime);
    checkBulletCollisions();
    checkPlayerCollisions();
    
    //piirtää pelin elementit canvakselle
    drawStarField();
    drawPlayer();
    drawPlayerBullets();
    drawEnemyGroups();
    drawEnemyBullets();
    drawScore();
    
    requestAnimationFrame(gameLoop);
}

//käynnistää pelin, piilottaa aloitusnäytön
function startGame() {
    document.getElementById("gameOverlay").style.display = "none";
    if (!isGameRunning) {
        isGameRunning = true;
        resetGame();
        createEnemies(difficulty);
        lastTimestamp = performance.now();
        requestAnimationFrame(gameLoop);
    }
}
//nollaa canvaksen
function resetGame() {
    if (!isGameRunning) return;
    playerBullets.length = 0;
    enemyGroups.length = 0;
    enemyBullets.length = 0;
    score = 0;
    difficulty = 1;
    spawnTimer = 0;
    spawnInterval = 4000;
    updateCanvasSize();
    createStarField();
}

// Alustetaan canvas ja tähtitaivas
updateCanvasSize();
createStarField();

//responsiivisuus
window.addEventListener("resize", () => {
    updateCanvasSize();
    createStarField();
});