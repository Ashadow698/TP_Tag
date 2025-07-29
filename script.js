const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

class Player {
  constructor(x, color, tagger = false) {
    this.x = x;
    this.y = canvas.height - 60;
    this.vx = 0;
    this.vy = 0;
    this.width = 30;
    this.height = 30;
    this.color = color;
    this.speed = 4;
    this.jump = -12;
    this.onGround = false;
    this.tagger = tagger;
    this.shield = false;
    this.reversal = false;
    this.history = [];
  }

  update(keysLeft, keysRight, keysJump) {
    if (this.reversal) {
      if (this.history.length > 0) {
        const past = this.history.shift();
        this.x = past.x;
        this.y = past.y;
        return;
      } else {
        this.reversal = false;
      }
    } else {
      this.history.push({x: this.x, y: this.y});
      if (this.history.length > 360) this.history.shift();
    }

    this.vx = 0;
    if (keys[keysLeft]) this.vx = -this.speed;
    if (keys[keysRight]) this.vx = this.speed;
    if (keys[keysJump] && this.onGround) {
      this.vy = this.jump;
      this.onGround = false;
    }

    this.vy += 0.5;
    this.x += this.vx;
    this.y += this.vy;

    for (const plat of platforms) {
      if (this.x < plat.x + plat.w && this.x + this.width > plat.x &&
          this.y + this.height < plat.y + 20 && this.y + this.height + this.vy >= plat.y) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.onGround = true;
      }
    }

    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    this.y = Math.min(canvas.height - this.height, this.y);
  }

  draw() {
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, this.tagger ? '#ff4d4d' : this.color);
    gradient.addColorStop(1, '#000');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 6);
    ctx.fill();
    if (this.shield) {
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

class Powerup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 20;
    this.height = 20;
  }

  draw() {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = {
      speed: 'lime',
      shield: 'gold',
      swap: 'cyan',
      elevator: 'white',
      reversal: 'magenta'
    }[this.type];
    ctx.fillStyle = ctx.shadowColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }
}

class Orb {
  constructor(x1, y1, x2, y2, color) {
    this.o1 = {x: x1, y: y1};
    this.o2 = {x: x2, y: y2};
    this.color = color;
    this.size = 15;
  }

  draw() {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.o1.x, this.o1.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.o2.x, this.o2.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  tryTeleport(player) {
    const dist1 = Math.hypot(player.x - this.o1.x, player.y - this.o1.y);
    const dist2 = Math.hypot(player.x - this.o2.x, player.y - this.o2.y);
    if (dist1 < 20) {
      player.x = this.o2.x;
      player.y = this.o2.y;
    } else if (dist2 < 20) {
      player.x = this.o1.x;
      player.y = this.o1.y;
    }
  }
}

let player1 = new Player(100, 'blue');
let player2 = new Player(300, 'green', true);

let platforms = [];
for (let i = 0; i < 25; i++) {
  platforms.push({
    x: Math.random() * (window.innerWidth - 150),
    y: Math.random() * (window.innerHeight - 50),
    w: 80 + Math.random() * 100
  });
}
platforms.push({x: 0, y: canvas.height - 30, w: canvas.width}); // ground

let powerups = [];
let orbs = [];
let tagCooldown = false;

let timer = 120;
setInterval(() => {
  if (timer > 0) {
    timer--;
    document.getElementById('timer').textContent = timer;
  }
}, 1000);

setInterval(() => {
  const px = Math.random() * (canvas.width - 20);
  const py = Math.random() * (canvas.height - 100);
  const types = ['speed', 'shield', 'swap', 'elevator', 'reversal'];
  powerups.push(new Powerup(px, py, types[Math.floor(Math.random() * types.length)]));
}, 15000);

setInterval(() => {
  const x1 = Math.random() * canvas.width;
  const y1 = Math.random() * canvas.height;
  const x2 = Math.random() * canvas.width;
  const y2 = Math.random() * canvas.height;
  const colors = ['red', 'green', 'blue', 'orange', 'purple'];
  orbs.push(new Orb(x1, y1, x2, y2, colors[Math.floor(Math.random() * colors.length)]));
}, 8000);

function tagCheck() {
  const dx = player1.x - player2.x;
  const dy = player1.y - player2.y;
  const close = Math.abs(dx) < 30 && Math.abs(dy) < 30;

  if (close && !player1.reversal && !player2.reversal && !tagCooldown) {
    if (player1.tagger && !player2.shield && !player2.tagger) {
      player1.tagger = false;
      player2.tagger = true;
      tagCooldown = true;
    } else if (player2.tagger && !player1.shield && !player1.tagger) {
      player2.tagger = false;
      player1.tagger = true;
      tagCooldown = true;
    }
  }

  if (!close) tagCooldown = false;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw platforms with glow
  platforms.forEach(p => {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#666";
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(p.x, p.y, p.w, 20);
    ctx.restore();
  });

  player1.update('a', 'd', 'w');
  player2.update('ArrowLeft', 'ArrowRight', 'ArrowUp');

  orbs.forEach(o => {
    o.draw();
    o.tryTeleport(player1);
    o.tryTeleport(player2);
  });

  powerups.forEach((p, i) => {
    p.draw();
    [player1, player2].forEach(player => {
      if (player.x < p.x + 20 && player.x + 30 > p.x && player.y < p.y + 20 && player.y + 30 > p.y) {
        switch (p.type) {
          case 'speed': player.speed = 8; setTimeout(() => player.speed = 4, 5000); break;
          case 'shield': player.shield = true; setTimeout(() => player.shield = false, 5000); break;
          case 'swap':
            const temp = {x: player1.x, y: player1.y};
            player1.x = player2.x;
            player1.y = player2.y;
            player2.x = temp.x;
            player2.y = temp.y;
            break;
          case 'elevator':
            let above = platforms.filter(pl => pl.y < player.y).sort((a,b) => b.y - a.y);
            if (above.length) player.y = above[0].y - player.height;
            break;
          case 'reversal': player.reversal = true; break;
        }
        powerups.splice(i, 1);
      }
    });
  });

  tagCheck();
  player1.draw();
  player2.draw();

  if (timer <= 0) {
    ctx.fillStyle = "white";
    ctx.font = "40px sans-serif";
    const loser = player1.tagger ? "Player 1" : "Player 2";
    ctx.fillText(`${loser} loses!`, canvas.width/2 - 100, canvas.height/2);
    return;
  }

  requestAnimationFrame(loop);
}

loop();
