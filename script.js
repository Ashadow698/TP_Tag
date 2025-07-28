// ... same setup code at the top ...

let player1 = new Player(100, 'blue');
let player2 = new Player(300, 'green', true);

// 🆕 Added more platforms
let platforms = [
  {x: 0, y: canvas.height - 30, w: canvas.width},
  {x: 100, y: 450, w: 150},
  {x: 300, y: 400, w: 180},
  {x: 600, y: 350, w: 160},
  {x: 200, y: 280, w: 140},
  {x: 500, y: 220, w: 130},
  {x: 100, y: 150, w: 120},
  {x: 400, y: 100, w: 110}
];

let powerups = [];
let orbs = [];

let timer = 120;
setInterval(() => {
  if (timer > 0) {
    timer--;
    document.getElementById('timer').textContent = timer;
  }
}, 1000);

// 🐢 Powerups spawn every 15s now
setInterval(() => {
  const px = Math.random() * (canvas.width - 20);
  const py = Math.random() * (canvas.height - 100);
  const types = ['speed', 'shield', 'swap', 'elevator', 'reversal'];
  powerups.push(new Powerup(px, py, types[Math.floor(Math.random() * types.length)]));
}, 15000);

// 🟣 Portals every 8s
setInterval(() => {
  const x1 = Math.random() * canvas.width;
  const y1 = Math.random() * canvas.height;
  const x2 = Math.random() * canvas.width;
  const y2 = Math.random() * canvas.height;
  const colors = ['red', 'green', 'blue', 'orange', 'purple'];
  orbs.push(new Orb(x1, y1, x2, y2, colors[Math.floor(Math.random() * colors.length)]));
}, 8000);

// 🛠 Updated tagCheck to prevent constant flickering
function tagCheck() {
  const dx = player1.x - player2.x;
  const dy = player1.y - player2.y;
  const close = Math.abs(dx) < 30 && Math.abs(dy) < 30;
  if (close && !player1.reversal && !player2.reversal) {
    if (player1.tagger && !player2.shield && !player2.tagger) {
      player1.tagger = false;
      player2.tagger = true;
    } else if (player2.tagger && !player1.shield && !player1.tagger) {
      player2.tagger = false;
      player1.tagger = true;
    }
  }
}

// ... rest of code (loop, drawing, collisions) stays same ...
