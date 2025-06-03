/**
 * Simple 2D platformer game using HTML5 canvas.
 * The player can move left/right, jump, and climb ladders.
 * Everything is rendered on a single canvas without external libraries.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false
};

// basic constants
const GRAVITY = 0.5;
const MOVE_SPEED = 2.5;
const JUMP_FORCE = 10;
const CLIMB_SPEED = 2;

// simple rectangle helper
class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    // check axis-aligned bounding box intersection
    intersects(other) {
        return !(this.x + this.w <= other.x || this.x >= other.x + other.w ||
                 this.y + this.h <= other.y || this.y >= other.y + other.h);
    }
}

class Player extends Rect {
    constructor(x, y) {
        super(x, y, 32, 32);
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.climbing = false;
    }

    update(platforms, ladders) {
        // horizontal movement
        if (keys.left) this.vx = -MOVE_SPEED;
        else if (keys.right) this.vx = MOVE_SPEED;
        else this.vx = 0;

        // jumping
        if (keys.jump && this.onGround) {
            this.vy = -JUMP_FORCE;
            this.onGround = false;
        }

        // check if player is on ladder
        this.climbing = false;
        for (const ladder of ladders) {
            if (this.intersects(ladder)) {
                if (keys.up || keys.down) {
                    this.climbing = true;
                    break;
                }
            }
        }

        if (this.climbing) {
            // disable gravity while climbing
            if (keys.up) this.vy = -CLIMB_SPEED;
            else if (keys.down) this.vy = CLIMB_SPEED;
            else this.vy = 0;
        } else {
            // apply gravity
            this.vy += GRAVITY;
        }

        // update position with velocities
        this.x += this.vx;
        this.y += this.vy;

        // simple collision with platforms
        this.onGround = false;
        for (const p of platforms) {
            if (this.intersects(p)) {
                // moving down
                if (this.vy > 0 && this.y + this.h - this.vy <= p.y) {
                    this.y = p.y - this.h;
                    this.vy = 0;
                    this.onGround = true;
                } else if (this.vy < 0 && this.y >= p.y + p.h) {
                    // hitting head
                    this.y = p.y + p.h;
                    this.vy = 0;
                }
                // horizontal correction
                if (this.vx > 0 && this.x + this.w - this.vx <= p.x) {
                    this.x = p.x - this.w;
                } else if (this.vx < 0 && this.x >= p.x + p.w) {
                    this.x = p.x + p.w;
                }
            }
        }
    }

    draw(ctx, offsetX) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - offsetX, this.y, this.w, this.h);
    }
}

// create level data
const platforms = [
    new Rect(0, 368, 2000, 32), // ground
    new Rect(200, 300, 100, 20),
    new Rect(400, 250, 100, 20),
    new Rect(650, 200, 100, 20)
];

const ladders = [
    new Rect(430, 270, 40, 80) // ladder from ground to second platform
];

const player = new Player(50, 336);
let cameraX = 0;

function update() {
    player.update(platforms, ladders);

    // simple camera following player
    const center = canvas.width / 2;
    cameraX = player.x - center;
    if (cameraX < 0) cameraX = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw background
    ctx.fillStyle = '#88d0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw ladders
    ctx.fillStyle = '#8b4513';
    for (const l of ladders) {
        ctx.fillRect(l.x - cameraX, l.y, l.w, l.h);
    }

    // draw platforms
    ctx.fillStyle = '#654321';
    for (const p of platforms) {
        ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);
    }

    // draw player
    player.draw(ctx, cameraX);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// keyboard listeners
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w') { keys.up = true; keys.jump = true; }
    if (e.key === 'ArrowDown' || e.key === 's') keys.down = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w') { keys.up = false; keys.jump = false; }
    if (e.key === 'ArrowDown' || e.key === 's') keys.down = false;
});

// start the game
loop();
