const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Ball {
  constructor(x, y, velX, velY, size) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.size = size;
    this.startTime = Date.now();
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.getColor();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    if ((this.x + this.size) >= width) {
      this.velX = -(this.velX);
    }

    if ((this.x - this.size) <= 0) {
      this.velX = -(this.velX);
    }

    if ((this.y + this.size) >= height) {
      this.velY = -(this.velY);
    }

    if ((this.y - this.size) <= 0) {
      this.velY = -(this.velY);
    }

    // Update ball positions based on velocity
    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect() {
    for (const ball of balls) {
      if (this !== ball) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + ball.size) {
          const angle = Math.atan2(dy, dx);
          const sine = Math.sin(angle);
          const cosine = Math.cos(angle);

          // Rotate ball positions
          const pos0 = { x: 0, y: 0 };
          const pos1 = this.rotate(dx, dy, sine, cosine, true);

          // Rotate velocities
          const vel0 = this.rotate(this.velX, this.velY, sine, cosine, true);
          const vel1 = this.rotate(ball.velX, ball.velY, sine, cosine, true);

          // Swap velocities
          const vxTotal = vel0.x - vel1.x;
          vel0.x = ((this.size - ball.size) * vel0.x + 2 * ball.size * vel1.x) / (this.size + ball.size);
          vel1.x = vxTotal + vel0.x;

          // Update ball positions
          const absV = Math.abs(vel0.x) + Math.abs(vel1.x);
          const overlap = this.size + ball.size - Math.abs(pos0.x - pos1.x);
          pos0.x += vel0.x / absV * overlap;
          pos1.x += vel1.x / absV * overlap;

          // Apply a small separation force
          const separationForce = 0.01;
          pos0.x += (pos0.x - pos1.x) * separationForce;
          pos1.x -= (pos0.x - pos1.x) * separationForce;

          // Rotate positions back
          const pos0F = this.rotate(pos0.x, pos0.y, sine, cosine, false);
          const pos1F = this.rotate(pos1.x, pos1.y, sine, cosine, false);

          // Calculate new positions based on collision response
          const thisNewX = this.x + pos1F.x;
          const thisNewY = this.y + pos1F.y;
          const ballNewX = ball.x + pos0F.x;
          const ballNewY = ball.y + pos0F.y;

          // Update ball positions separately
          this.x = thisNewX;
          this.y = thisNewY;
          ball.x = ballNewX;
          ball.y = ballNewY;

          // Rotate velocities back
          const vel0F = this.rotate(vel0.x, vel0.y, sine, cosine, false);
          const vel1F = this.rotate(vel1.x, vel1.y, sine, cosine, false);

          // Update velocities based on collision response
          this.velX = vel0F.x;
          this.velY = vel0F.y;
          ball.velX = vel1F.x;
          ball.velY = vel1F.y;
        }
      }
    }
  }

  rotate(x, y, sine, cosine, reverse) {
    return {
      x: (reverse) ? (x * cosine + y * sine) : (x * cosine - y * sine),
      y: (reverse) ? (y * cosine - x * sine) : (y * cosine + x * sine)
    };
  }

  getColor() {
    const elapsedTime = (Date.now() - this.startTime) * 0.001;
    const hue = ((this.x / width) + (this.y / height) + elapsedTime) % 1 * 360;
    const saturation = Math.round(Math.abs(this.velX + this.velY) / 4 * 100);
    const lightness = Math.round(Math.abs(this.velX + this.velY) / 4 * 50) + 25;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
}

const balls = [];
while (balls.length < 50) {
  const size = random(10, 30);
  const ball = new Ball(
    random(size, width - size),
    random(size, height - size),
    random(-2, 2),
    random(-2, 2),
    size
  );
  balls.push(ball);
}

function loop() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);

  for (const ball of balls) {
    ball.draw();
    ball.update();
    ball.collisionDetect();
  }

  requestAnimationFrame(loop);
}

loop();