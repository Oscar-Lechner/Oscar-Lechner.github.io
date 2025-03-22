let sun;
let planets = [];
let asteroids = [];
let primaryColor, secondaryColor, accentColor, darkColor;

function setup() {
  // Retrieve CSS variables from the document's root
  const styles = getComputedStyle(document.documentElement);
  primaryColor = color(styles.getPropertyValue('--primary-color').trim());
  secondaryColor = color(styles.getPropertyValue('--secondary-color').trim());
  accentColor = color(styles.getPropertyValue('--accent-color').trim());
  darkColor = color(styles.getPropertyValue('--dark-color').trim());
  
  createCanvas(1080, 1080);
  
  // Use primary color for the sun
  sun = new Sun(width / 2, height / 2, 50, primaryColor);
  
  // Orbital periods relative to Earth's (in Earth years)
  const orbitalPeriods = {
    Mercury: 0.240846,
    Venus: 0.615198,
    Earth: 1,
    Mars: 1.88082,
    Jupiter: 11.862,
    Saturn: 29.4571,
    Uranus: 84.016846,
    Neptune: 164.79132,
  };
  
  // Simulation settings
  const earthPeriodSeconds = 20;
  const framesPerSecond = 30;
  
  // Helper function to calculate angular speed
  function calculateAngularSpeed(orbitalPeriodYears) {
    let orbitalPeriodSeconds = (orbitalPeriodYears / orbitalPeriods.Earth) * earthPeriodSeconds;
    let totalFrames = orbitalPeriodSeconds * framesPerSecond;
    return TWO_PI / totalFrames;
  }
  
  // Define neutral colors for planets not directly using CSS variables
  let neutralMercury = color('#bfbfbf'); // Mercury: a light gray
  let neutralEarth   = color('#cccccc'); // Earth: a soft neutral tone
  let neutralJupiter = color('#e0e0e0'); // Jupiter: a very light gray
  let neutralUranus  = color('#bbbbbb'); // Uranus
  
  // Saturn will use a lightened variant of secondaryColor
  let saturnColor = lerpColor(secondaryColor, color(255), 0.5);
  
  // Neptune will use a lighter variant of darkColor
  let neptuneColor = lerpColor(darkColor, color(255), 0.7);
  
  // Create planets with updated colors and appropriate moons:
  
  // Mercury
  planets.push(
    new Planet(
      80, 5, neutralMercury, calculateAngularSpeed(orbitalPeriods.Mercury), [],
      'Mercury'
    )
  );
  
  // Venus
  planets.push(
    new Planet(
      120, 12, secondaryColor, calculateAngularSpeed(orbitalPeriods.Venus), [],
      'Venus'
    )
  );
  
  // Earth and its Moon
  planets.push(
    new Planet(
      160, 12, neutralEarth, calculateAngularSpeed(orbitalPeriods.Earth),
      [new Moon(20, 3, color('#dddddd'), 0.05, false, 'Moon')],
      'Earth'
    )
  );
  
  // Mars and its moons – Mars uses the accent color (red)
  planets.push(
    new Planet(
      200, 7, accentColor, calculateAngularSpeed(orbitalPeriods.Mars),
      [
        new Moon(15, 2, color('#bbbbbb'), 0.06, false, 'Phobos'),
        new Moon(25, 2, color('#999999'), 0.04, false, 'Deimos')
      ],
      'Mars'
    )
  );
  
  // Jupiter and its Galilean moons
  planets.push(
    new Planet(
      260, 25, neutralJupiter, calculateAngularSpeed(orbitalPeriods.Jupiter),
      [
        new Moon(30, 4, color('#dddddd'), 0.08, false, 'Io'),
        new Moon(40, 4, color('#cccccc'), 0.07, false, 'Europa'),
        new Moon(50, 5, color('#bbbbbb'), 0.06, false, 'Ganymede'),
        new Moon(60, 5, color('#aaaaaa'), 0.05, false, 'Callisto')
      ],
      'Jupiter'
    )
  );
  
  // Saturn with rings and moons
  planets.push(
    new Planet(
      320, 22, saturnColor, calculateAngularSpeed(orbitalPeriods.Saturn),
      [
        new Moon(25, 3, color('#cccccc'), 0.06, false, 'Enceladus'),
        new Moon(35, 5, color('#bbbbbb'), 0.05, false, 'Titan')
      ],
      'Saturn',
      true  // hasRings flag set to true
    )
  );
  
  // Uranus and its moons
  planets.push(
    new Planet(
      380, 19, neutralUranus, calculateAngularSpeed(orbitalPeriods.Uranus),
      [
        new Moon(30, 4, color('#dddddd'), 0.05, false, 'Titania'),
        new Moon(40, 4, color('#cccccc'), 0.04, false, 'Oberon')
      ],
      'Uranus'
    )
  );
  
  // Neptune and its moon Triton (retrograde orbit)
  planets.push(
    new Planet(
      440, 18, neptuneColor, calculateAngularSpeed(orbitalPeriods.Neptune),
      [new Moon(35, 4, color('#dddddd'), 0.05, true, 'Triton')],
      'Neptune'
    )
  );
  
  // Create asteroids for the asteroid belt using a neutral color
  for (let i = 0; i < 200; i++) {
    let distance = random(220, 250);
    let size = random(1, 3);
    let speed = calculateAngularSpeed(random(3, 6));
    asteroids.push(new Asteroid(distance, size, speed, color('#bfbfbf')));
  }
}

function draw() {
  // Use darkColor (from CSS) for the background
  background(darkColor);
  
  // Display the sun, asteroids, and planets
  sun.display();
  
  for (let asteroid of asteroids) {
    asteroid.update();
    asteroid.display();
  }
  
  for (let planet of planets) {
    planet.update();
    planet.displayOrbit();
    planet.display();
  }
}

// --- Classes ---

class Sun {
  constructor(x, y, radius, col) {
    this.pos = createVector(x, y);
    this.radius = radius;
    this.col = col;
  }
  
  display() {
    noStroke();
    fill(this.col);
    ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }
}

class Planet {
  constructor(distance, radius, col, speed, moons = [], name = '', hasRings = false) {
    this.center = createVector(width / 2, height / 2);
    this.distance = distance;
    this.radius = radius;
    this.col = col;
    this.angle = random(TWO_PI);
    this.speed = speed;
    this.moons = moons;
    this.name = name;
    this.hasRings = hasRings;
  }
  
  update() {
    this.angle = (this.angle + this.speed) % TWO_PI;
    for (let moon of this.moons) {
      moon.update(this.getPosition());
    }
  }
  
  display() {
    let pos = this.getPosition();
    
    if (this.hasRings) {
      this.displayRings(pos, true);
    }
    
    noStroke();
    fill(this.col);
    ellipse(pos.x, pos.y, this.radius * 2);
    
    if (this.hasRings) {
      this.displayRings(pos, false);
    }
    
    for (let moon of this.moons) {
      moon.display();
    }
    
    // Show label if the mouse is near
    let distanceToMouse = dist(mouseX, mouseY, pos.x, pos.y);
    if (distanceToMouse < 50) {
      fill(255);
      textAlign(CENTER);
      textSize(12);
      text(this.name, pos.x, pos.y - this.radius - 10);
    }
  }
  
  displayRings(pos, isBackHalf) {
    push();
    translate(pos.x, pos.y);
    rotate(-QUARTER_PI / 2);
    noFill();
    stroke(200, 200, 200, 150);
    
    if (isBackHalf) {
      strokeWeight(3);
      arc(0, 0, this.radius * 4, this.radius * 1.5, PI, TWO_PI);
      strokeWeight(2);
      arc(0, 0, this.radius * 3, this.radius, PI, TWO_PI);
    } else {
      strokeWeight(3);
      arc(0, 0, this.radius * 4, this.radius * 1.5, 0, PI);
      strokeWeight(2);
      arc(0, 0, this.radius * 3, this.radius, 0, PI);
    }
    
    pop();
  }
  
  displayOrbit() {
    let planetPos = this.getPosition();
    let distanceToMouse = dist(mouseX, mouseY, planetPos.x, planetPos.y);
    
    let maxArcLength = PI;
    let minArcLength = 0;
    let minDistance = 0;
    let maxDistance = 200;
    
    let arcLength = map(distanceToMouse, minDistance, maxDistance, maxArcLength, minArcLength);
    arcLength = constrain(arcLength, minArcLength, maxArcLength);
    
    let startAngle = this.angle - arcLength / 2;
    let stopAngle = this.angle + arcLength / 2;
    
    stroke(255, 255, 255, 100);
    strokeWeight(1);
    noFill();
    arc(this.center.x, this.center.y, this.distance * 2, this.distance * 2, startAngle, stopAngle);
  }
  
  getPosition() {
    return createVector(
      this.center.x + cos(this.angle) * this.distance,
      this.center.y + sin(this.angle) * this.distance
    );
  }
}

class Moon {
  constructor(distance, radius, col, speed, retrograde = false, name = '') {
    this.distance = distance;
    this.radius = radius;
    this.col = col;
    this.angle = random(TWO_PI);
    this.speed = speed;
    this.retrograde = retrograde;
    this.name = name;
  }
  
  update(planetPos) {
    this.planetPos = planetPos;
    this.angle = (this.angle + (this.retrograde ? -this.speed : this.speed)) % TWO_PI;
  }
  
  display() {
    let pos = createVector(
      this.planetPos.x + cos(this.angle) * this.distance,
      this.planetPos.y + sin(this.angle) * this.distance
    );
    noStroke();
    fill(this.col);
    ellipse(pos.x, pos.y, this.radius * 2);
    
    let distanceToMouse = dist(mouseX, mouseY, pos.x, pos.y);
    if (distanceToMouse < 60) {
      fill(255);
      textAlign(CENTER);
      textSize(10);
      text(this.name, pos.x, pos.y - this.radius - 5);
    }
  }
}

class Asteroid {
  constructor(distance, radius, speed, col) {
    this.center = createVector(width / 2, height / 2);
    this.distance = distance;
    this.radius = radius;
    this.angle = random(TWO_PI);
    this.speed = speed;
    this.col = col;
  }
  
  update() {
    this.angle = (this.angle + this.speed) % TWO_PI;
  }
  
  display() {
    let pos = createVector(
      this.center.x + cos(this.angle) * this.distance,
      this.center.y + sin(this.angle) * this.distance
    );
    noStroke();
    fill(this.col);
    ellipse(pos.x, pos.y, this.radius * 2);
  }
}
