document.addEventListener('DOMContentLoaded', function() {
    // Setup Matter.js engine, world, and renderer
    let engine = Matter.Engine.create();
    world = engine.world;
    
    // Configure gravity (slower gravity)
    engine.world.gravity.y = 0.4;  // Slower gravity for more control

    // Setup renderer
    let render = Matter.Render.create({
        element: document.getElementById('volumeControl'),
        engine: engine,
        options: {
            width: 300,
            height: 600,
            wireframes: false,
            background: 'transparent'
        }
    });

    // Create ground, walls, and Plinko pegs
    let ground = Matter.Bodies.rectangle(150, 590, 300, 20, { isStatic: true, render: { fillStyle: '#444' } });
    let leftWall = Matter.Bodies.rectangle(0, 300, 20, 600, { isStatic: true, render: { fillStyle: '#444' } });
    let rightWall = Matter.Bodies.rectangle(300, 300, 20, 600, { isStatic: true, render: { fillStyle: '#444' } });

    // Create buckets
    let bucketWall1 = Matter.Bodies.rectangle(50, 560, 5, 40, { isStatic: true, render: { fillStyle: '#444' } });
    let bucketWall2 = Matter.Bodies.rectangle(100, 560, 5, 40, { isStatic: true, render: { fillStyle: '#444' } });
    let bucketWall3 = Matter.Bodies.rectangle(150, 560, 5, 40, { isStatic: true, render: { fillStyle: '#444' } });
    let bucketWall4 = Matter.Bodies.rectangle(200, 560, 5, 40, { isStatic: true, render: { fillStyle: '#444' } });
    let bucketWall5 = Matter.Bodies.rectangle(250, 560, 5, 40, { isStatic: true, render: { fillStyle: '#444' } });

    // Create bucket labels
    let bucketLabel1, bucketLabel2, bucketLabel3, bucketLabel4, bucketLabel5, bucketLabel6;

    let pegs = createPegs(10, 150, 100, 30, 40);
    Matter.World.add(world, [ground, leftWall, rightWall, bucketWall1, bucketWall2, bucketWall3, bucketWall4, bucketWall5, ...pegs]);

    // Create draggable volume control handle
    let volumeCircle = document.getElementById('handle');
    volumeCircle.style.position = 'absolute';
    volumeCircle.style.top = '0px'; // Vertical position fixed
    volumeCircle.style.left = '140px'; // Start centered

    // Enable dragging for the volume handle
    volumeCircle.addEventListener('mousedown', function(event) {
        let startX = event.clientX; // Starting X position of the mouse
        let startLeft = parseInt(volumeCircle.style.left, 10); // Starting left position of the handle

        function onMouseMove(event) {
            let deltaX = event.clientX - startX; // Calculate the change in the X position
            let newLeft = startLeft + deltaX; // Update the new left position
            if (newLeft >= 0 && newLeft <= render.options.width - 20) { // Keep within bounds
                volumeCircle.style.left = `${newLeft}px`; // Only update the horizontal position
            }
        }

        function onMouseUp(event) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            spawnPlinkoBall(parseInt(volumeCircle.style.left, 10) + 10); // Spawn the ball at the new X position
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // Run the Matter.js engine and renderer
    Matter.Engine.run(engine);
    Matter.Render.run(render);

    // Render bucket labels
Matter.Events.on(render, 'afterRender', function() {
    let context = render.context;
    if (context) {
        context.font = '18px Arial';
        context.fillStyle = '#000'; // Set the text color to black
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // Render the volume numbers without background
        context.fillText(bucketLabel1, 30, 545);
        context.fillText(bucketLabel2, 75, 545);
        context.fillText(bucketLabel3, 125, 545);
        context.fillText(bucketLabel4, 175, 545);
        context.fillText(bucketLabel5, 226, 545);
        context.fillText(bucketLabel6, 274, 545);
    }
});
// Randomize bucket labels on page load
randomizeBucketLabels();

// Function to randomize bucket labels
function randomizeBucketLabels() {
    bucketLabel1 = Math.floor(Math.random() * 101);
    bucketLabel2 = Math.floor(Math.random() * 101);
    bucketLabel3 = Math.floor(Math.random() * 101);
    bucketLabel4 = Math.floor(Math.random() * 101);
    bucketLabel5 = Math.floor(Math.random() * 101);
    bucketLabel6 = Math.floor(Math.random() * 101);
}

    // Spawn Plinko ball at a specific X coordinate
    function spawnPlinkoBall(x) {
        let plinkoBall = Matter.Bodies.circle(x, 50, 5, {
            restitution: 0.5,  // Less bouncing
            friction: 0.005,
            density: 0.002,
            render: { fillStyle: '#f00' }
        });
        Matter.World.add(world, plinkoBall);
    
        // Randomize bucket labels
        bucketLabel1 = Math.floor(Math.random() * 101);
        bucketLabel2 = Math.floor(Math.random() * 101);
        bucketLabel3 = Math.floor(Math.random() * 101);
        bucketLabel4 = Math.floor(Math.random() * 101);
        bucketLabel5 = Math.floor(Math.random() * 101);
        bucketLabel6 = Math.floor(Math.random() * 101);
    
        // Update volume based on the bucket the ball lands in
        Matter.Events.on(engine, 'afterUpdate', function() {
            if (plinkoBall.position.y >= ground.position.y - 15 && plinkoBall.speed < 1) {
                let volume = 0;
                if (plinkoBall.position.x > leftWall.position.x && plinkoBall.position.x < bucketWall1.position.x) {
                    volume = bucketLabel1;
                } else if (plinkoBall.position.x > bucketWall1.position.x && plinkoBall.position.x < bucketWall2.position.x) {
                    volume = bucketLabel2;
                } else if (plinkoBall.position.x > bucketWall2.position.x && plinkoBall.position.x < bucketWall3.position.x) {
                    volume = bucketLabel3;
                } else if (plinkoBall.position.x > bucketWall3.position.x && plinkoBall.position.x < bucketWall4.position.x) {
                    volume = bucketLabel4;
                } else if (plinkoBall.position.x > bucketWall4.position.x && plinkoBall.position.x < bucketWall5.position.x) {
                    volume = bucketLabel5;
                } else if (plinkoBall.position.x > bucketWall5.position.x && plinkoBall.position.x < rightWall.position.x) {
                    volume = bucketLabel6;
                }
                document.getElementById('volumeLabel').textContent = "Volume: " + volume;
            }
        });
    }
    
    // Function to create pegs in the classic alternating rows pattern with triangles
    function createPegs(rows, startX, startY, gapX, gapY) {
        let pegs = [];
        let triangleShiftX = 5; // Adjust this value to control the amount of shift for triangles
        let secondColumnShiftX = 275; // Adjust this value to control the distance between the two columns of triangles
        for (let i = 0; i < rows; i++) {
            let rowOffset = (i % 2 === 0) ? gapX / 2 : 0;
            let pegsInRow = (i % 2 === 0) ? Math.floor((render.options.width - gapX) / gapX) : Math.floor((render.options.width - gapX / 2) / gapX);
            for (let j = 0; j < pegsInRow; j++) {
                let x = rowOffset + j * gapX + gapX / 2;
                let y = startY + i * gapY;
                let peg = Matter.Bodies.circle(x, y, 5, { isStatic: true, render: { fillStyle: '#444' } });
                pegs.push(peg);

                // Add the first column of triangles on the leftmost peg of every other row, starting from the second to highest row
                if ((i + 1) % 2 === 0 && j === 0) {
                    let triangleWidth = 15;
                    let triangleHeight = 15;
                    let triangle = Matter.Bodies.polygon(x - triangleWidth / 2 + triangleShiftX, y, 3, triangleHeight, {
                        isStatic: true,
                        angle: -Math.PI / 2.9, // Rotate 90 degrees clockwise
                        render: { fillStyle: '#444' }
                    });
                    pegs.push(triangle);
                }

                // Add the second column of triangles 100 pixels to the right of the first column
                if ((i + 1) % 2 === 0 && j === 0) {
                    let triangleWidth = 15;
                    let triangleHeight = 15;
                    let triangle = Matter.Bodies.polygon(x - triangleWidth / 2 + triangleShiftX + secondColumnShiftX, y, 3, triangleHeight, {
                        isStatic: true,
                        angle: -Math.PI / 1.5, // Rotate 90 degrees clockwise
                        render: { fillStyle: '#444' }
                    });
                    pegs.push(triangle);
                }
            }
        }
        return pegs;
    }
});