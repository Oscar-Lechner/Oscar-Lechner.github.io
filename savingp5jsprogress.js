let inputText = '';
let structureOn = true; // Toggle switch state for structure
let gravityOn = false; // Toggle switch state for gravity
let buttonStructure; // Toggle switch button for structure
let buttonGravity; // Toggle switch button for gravity
let buttonClear; // Clear button
let letters = []; // Array to store Letter objects
let gravity; // Gravity acceleration
let spinOn = false; // Toggle switch state for spin
let buttonSpin; // Toggle switch button for spin
let fishOn = false; // Toggle switch state for fish
let buttonFish; // Toggle switch button for fish
let fishImage; // Variable to store the fish image
let bounceOn = false; // Toggle switch state for bouncing
let buttonBounce; // Toggle switch button for bouncing
let buttonNewFont; // New Font button
let fontFiles; // Array to store font file names
let currentFont; // Current font
let fontLoaded = false; // Flag to indicate if the font is loaded
let rotationSpeed = 0.2; // Variable to store the current rotation speed based on mouseX


class Letter {
  constructor(x, y, velX, velY, char) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.char = char;
    this.size = textSize() / 2;
  }

 draw() {
    push();
    translate(this.x, this.y);
    if (spinOn) {
      rotate(frameCount * rotationSpeed);
    }
    if (fishOn) {
      imageMode(CENTER);
      image(fishImage, 0, 0, textSize(), textSize());
    } else {
      text(this.char, 0, 0);
    }
    pop();
  }


  update() {
  // Apply gravity if it's on
    
  if (gravityOn) {
    this.velY += gravity.y;
  

  // Update positions based on current velocity
  this.x += this.velX;
  this.y += this.velY;

  // Handle horizontal boundaries by reversing velocity and constraining position
  if (this.x + this.size > width || this.x - this.size < 0) {
    this.velX *= -1; // Reverse horizontal velocity
    this.x = constrain(this.x, this.size, width - this.size); // Constrain within the canvas
  }

  // Handle vertical boundaries
  if (this.y + this.size > height || this.y - this.size < 0) {
    this.velY *= -1; // Reverse vertical velocity
    this.y = constrain(this.y, this.size, height - this.size); // Constrain within the canvas
  }
  }
  // Apply damping only if bounce is on to reduce energy over time
    
    
  if (bounceOn) {
    this.velX *= 0.999999;
    this.velY *= 0.999999;
    // Update positions based on current velocity
  this.x += this.velX;
  this.y += this.velY;

  // Handle horizontal boundaries by reversing velocity and constraining position
  if (this.x + this.size > width || this.x - this.size < 0) {
    this.velX *= -1; // Reverse horizontal velocity
    this.x = constrain(this.x, this.size, width - this.size); // Constrain within the canvas
  }

  // Handle vertical boundaries
  if (this.y + this.size > height || this.y - this.size < 0) {
    this.velY *= -1; // Reverse vertical velocity
    this.y = constrain(this.y, this.size, height - this.size); // Constrain within the canvas
  }
  } else {
    if (this.y + textSize() >= height) {  // Use textSize() if it's a better measure of full height
    this.y = height - textSize();     // Adjust so the entire letter sits above the floor
    this.velY = 0;                    // Stop moving vertically
}
  }
}

  collisionDetect() {
    for (const letter of letters) {
      if (this !== letter) {
        const dx = this.x - letter.x;
        const dy = this.y - letter.y;
        const distance = sqrt(dx * dx + dy * dy);
        if (distance < this.size + letter.size) {
          const angle = atan2(dy, dx);
          const sine = sin(angle);
          const cosine = cos(angle);

          // Rotate letter positions
          const pos0 = { x: 0, y: 0 };
          const pos1 = this.rotate(dx, dy, sine, cosine, true);

          // Rotate velocities
          const vel0 = this.rotate(this.velX, this.velY, sine, cosine, true);
          const vel1 = this.rotate(letter.velX, letter.velY, sine, cosine, true);

          // Swap velocities
          const vxTotal = vel0.x - vel1.x;
          vel0.x = ((this.size - letter.size) * vel0.x + 2 * letter.size * vel1.x) / (this.size + letter.size);
          vel1.x = vxTotal + vel0.x;

          // Update letter positions
          const absV = abs(vel0.x) + abs(vel1.x);
          const overlap = this.size + letter.size - abs(pos0.x - pos1.x);
          pos0.x += vel0.x / absV * overlap;
          pos1.x += vel1.x / absV * overlap;

          // Apply a small separation force
          const separationForce = 0.1; // Adjust this value as needed
          pos0.x += (pos0.x - pos1.x) * separationForce;
          pos1.x -= (pos0.x - pos1.x) * separationForce;

          // Rotate positions back
          const pos0F = this.rotate(pos0.x, pos0.y, sine, cosine, false);
          const pos1F = this.rotate(pos1.x, pos1.y, sine, cosine, false);

          // Adjust positions to actual screen positions
          this.x = letter.x + pos1F.x;
          this.y = letter.y + pos1F.y;
          letter.x = letter.x + pos0F.x;
          letter.y = letter.y + pos0F.y;

          // Rotate velocities back
          const vel0F = this.rotate(vel0.x, vel0.y, sine, cosine, false);
          const vel1F = this.rotate(vel1.x, vel1.y, sine, cosine, false);

          this.velX = vel0F.x;
          this.velY = vel0F.y;
          letter.velX = vel1F.x;
          letter.velY = vel1F.y;
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
}

function preload() {
  fishImage = loadImage('fish.png');
  fontFiles = ['fonts/ANTQUAB.TTF', 'fonts/BKANT.TTF', 'fonts/BRADHITC.TTF',  'fonts/CENTURY.TTF', 'fonts/Candara.ttf', 'fonts/DUBAI-BOLD.TTF', 'fonts/FREESCPT.TTF', 'fonts/GOTHIC.TTF', 'fonts/Gabriola.ttf', 'fonts/ITCKRIST.TTF', 'fonts/Inkfree.ttf', 'fonts/JUICE___.TTF', 'fonts/LEELAWAD.TTF', 'fonts/LHANDW.TTF', 'fonts/MSUIGHUB.TTF', 'fonts/arial.ttf',  'fonts/HELVETICA-01.TTF', 'fonts/HELVETICA-BOLD-02.TTF', 'fonts/HELVETICA-LIGHT-05.TTF', 'fonts/TEMPSITC.TTF', 'PPTelegraf-Ultrabold.otf', 'DS-DIGIT.TTF', '911porschav3.ttf', '13_Misa.TTF'];
}

function setup() {
  createCanvas(1200, 600);
  textSize(32);
  textAlign(LEFT, TOP);
  fill(0);
  strokeWeight(2);
  stroke(255);
  textStyle(BOLD);
  gravity = createVector(0, 0.05); // Initialize gravity here

  // Create the toggle switch button for structure
  buttonStructure = createButton('Structure: ON');
  buttonStructure.position(25, 25);
  buttonStructure.mousePressed(toggleStructure);
  buttonStructure.style('background-color', '#528D49'); // Set initial color to light gray

  // Create the clear button
  buttonClear = createButton('Clear');
  buttonClear.position(25, 235);
  buttonClear.mousePressed(clearText);
  buttonClear.style('background-color', '#9B0808'); // Set initial color to black

  // Create the toggle switch button for gravity
  buttonGravity = createButton('Gravity: OFF');
  buttonGravity.position(25, 60);
  buttonGravity.mousePressed(toggleGravity);
  buttonGravity.style('background-color', '#000000'); // Set initial color to black

  // Create the toggle switch button for spin
  buttonSpin = createButton('Spin: OFF');
  buttonSpin.position(25, 95);
  buttonSpin.mousePressed(toggleSpin);
  buttonSpin.style('background-color', '#000000'); // Set initial color to black

  // Create the toggle switch button for fish
  buttonFish = createButton('Fish: OFF');
  buttonFish.position(25, 130);
  buttonFish.mousePressed(toggleFish);
  buttonFish.style('background-color', '#000000'); // Set initial color to black

  // Create the toggle switch button for bouncing
  buttonBounce = createButton('Bounce: OFF');
  buttonBounce.position(25, 165);
  buttonBounce.mousePressed(toggleBounce);
  buttonBounce.style('background-color', '#000000'); // Set initial color to black

  // Create the New Font button
  buttonNewFont = createButton('New Font');
  buttonNewFont.position(25, 200);
  buttonNewFont.mousePressed(changeFont);
  buttonNewFont.style('background-color', '#000000'); // Set initial color to black

  const buttons = selectAll('button');
  for (const button of buttons) {
    button.style('font-family', 'telegraf');
    button.style('font-size', '14px');
    button.style('padding', '7px 10px');
    button.style('padding-top', '10px');
    button.style('border', 'none');
    button.style('border-radius', '12px');
    button.style('color', '#FFFFFF');
    button.style('text-transform', 'uppercase');
    button.style('letter-spacing', '1px');
    button.style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)');
    button.style('cursor', 'pointer');
    button.style('transition', 'background-color 0.3s');
  }
  


  // Load the initial font
  currentFont = random(fontFiles);
  loadFont(currentFont, function (font) {
    if (font) {
      textFont(font);
      fontLoaded = true;
      const fileName = currentFont.split('/').pop();
      console.log("Current font file name: " + currentFont);
    } else {
      console.error('Failed to load font: ' + currentFont);
    }
  });
}

function draw() {
  background(240);

  if (fontLoaded) {
    for (const letter of letters) {
      letter.draw();
      if (!structureOn) {
        if (gravityOn) {
          letter.velY += gravity.y; // Apply gravity only when gravityOn is true
        }
        letter.update();
        if (bounceOn) {
          letter.collisionDetect();
        }
      }
    }
  }
}
function keyTyped() {
  inputText += key;
  let pos;
  let vel = createVector(0, 0); // Default velocity is zero
  if (structureOn) {
    toggleStructure();
    toggleStructure();
    let kerningAdjustment = -5; // Adjust this value to control the kerning
    pos = createVector(width / 2 - textWidth(inputText) / 2 + textWidth(inputText.substring(0, inputText.length - 1)) + kerningAdjustment, height / 2);
  } else {
    pos = createVector(random(width), random(height - textSize()));
    if (bounceOn) {
      // Assign smaller random velocities if bounce is ON
      vel = createVector(random(-1, 1), random(-1, 1)); // Reduced velocity range
    }
  }
  letters.push(new Letter(pos.x, pos.y, vel.x, vel.y, key));
}

  

function keyPressed() {
  if (keyCode === BACKSPACE && inputText.length > 0) {
    inputText = inputText.slice(0, -1);
    letters.pop();
  }
}

function toggleStructure() {
  structureOn = !structureOn;
  buttonStructure.html(structureOn ? 'Structure: ON' : 'Structure: OFF');
  buttonStructure.style('background-color', structureOn ? '#528D49' : '#000000');
  if (structureOn) {
    bounceOn = false;
    buttonBounce.html('Bounce: OFF');
    buttonBounce.style('background-color', '#000000');
  }
  resetLetters();
}

function toggleGravity() {
  gravityOn = !gravityOn;
  buttonGravity.html(gravityOn ? 'Gravity: ON' : 'Gravity: OFF');
  buttonGravity.style('background-color', gravityOn ? '#528D49' : '#000000');
}

function toggleSpin() {
  spinOn = !spinOn;
  buttonSpin.html(spinOn ? 'Spin: ON' : 'Spin: OFF');
  buttonSpin.style('background-color', spinOn ? '#528D49' : '#000000');
}

function toggleFish() {
  fishOn = !fishOn;
  buttonFish.html(fishOn ? 'Fish: ON' : 'Fish: OFF');
  buttonFish.style('background-color', fishOn ? '#528D49' : '#000000');
}

function toggleBounce() {
  if (!structureOn) {
    bounceOn = !bounceOn;
    buttonBounce.html(bounceOn ? 'Bounce: ON' : 'Bounce: OFF');
    buttonBounce.style('background-color', bounceOn ? '#528D49' : '#000000');
  }
}

function clearText() {
  inputText = '';
  letters = [];
}

function changeFont() {
  // Choose a random font from the fontFiles array
  let newFont = random(fontFiles);

  // Ensure the new font is different from the current font
  while (newFont === currentFont) {
    newFont = random(fontFiles);
  }

  // Load the new font and set it as the current font
  loadFont(newFont, function (font) {
    if (font) {
      textFont(font);
      currentFont = newFont;
      const fileName = newFont.split('/').pop();
      console.log("Current font file name: " + currentFont);

      if (structureOn) {
        // Quickly toggle structure off and on again
        toggleStructure();
        toggleStructure();
      }
    } else {
      console.error('Failed to load font: ' + newFont);
    }
  });
}

function resetLetters() {
  letters = [];
  for (let i = 0; i < inputText.length; i++) {
    let pos;
    if (structureOn) {
      let kerningAdjustment = -5;
      pos = createVector(width / 2 - textWidth(inputText) / 2 + textWidth(inputText.substring(0, i)) + kerningAdjustment, height / 2);
      letters.push(new Letter(pos.x, pos.y, 0, 0, inputText[i]));
    } else {
      pos = createVector(random(width), random(height - textSize()));
      const vel = createVector(random(-2, 2), random(-2, 2));
      letters.push(new Letter(pos.x, pos.y, vel.x, vel.y, inputText[i]));
    }
  }
}