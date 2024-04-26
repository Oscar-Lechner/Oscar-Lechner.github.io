document.addEventListener('DOMContentLoaded', function() {
    // Setup Matter.js engine, world, and renderer
    let engine = Matter.Engine.create();
    world = engine.world;
    
    // Configure gravity (slower gravity)
    engine.world.gravity.y = 0.2;  // Slower gravity for more control

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
    let ground = Matter.Bodies.rectangle(150, 590, 300, 20, { isStatic: true, render: { fillStyle: '#999' } });
    let leftWall = Matter.Bodies.rectangle(0, 300, 20, 600, { isStatic: true, render: { fillStyle: '#666' } });
    let rightWall = Matter.Bodies.rectangle(300, 300, 20, 600, { isStatic: true, render: { fillStyle: '#666' } });
    let pegs = createPegs(10, 150, 100, 30, 40);
    Matter.World.add(world, [ground, leftWall, rightWall, ...pegs]);

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

    // Spawn Plinko ball at a specific X coordinate
    function spawnPlinkoBall(x) {
        let plinkoBall = Matter.Bodies.circle(x, 50, 5, {
            restitution: 0.1,  // Less bouncing
            friction: 0.005,
            density: 0.002,
            render: { fillStyle: '#f00' }
        });
        Matter.World.add(world, plinkoBall);

        // Update volume based on the horizontal position at the bottom
        Matter.Events.on(engine, 'afterUpdate', function() {
            if (plinkoBall.position.y >= ground.position.y - 15 && plinkoBall.speed < 1) { // Check if near the bottom and almost stopped
                let volume = Math.round((plinkoBall.position.x / render.options.width) * 100);
                document.getElementById('volumeLabel').textContent = volume;
                // Do not remove the ball after calculating volume, leave it visible at the bottom
            }
        });
    }
    
    // Function to create pegs in the classic alternating rows pattern
    function createPegs(rows, startX, startY, gapX, gapY) {
        let pegs = [];
        for (let i = 0; i < rows; i++) {
            let rowOffset = (i % 2 === 0) ? gapX / 2 : 0;
            let pegsInRow = (i % 2 === 0) ? Math.floor(render.options.width / gapX) : Math.floor((render.options.width - gapX / 2) / gapX);
            for (let j = 0; j < pegsInRow; j++) {
                let x = startX - render.options.width / 2 + rowOffset + j * gapX;
                let y = startY + i * gapY;
                let peg = Matter.Bodies.circle(x, y, 5, { isStatic: true, render: { fillStyle: '#444' } });
                pegs.push(peg);
            }
        }
        return pegs;
    }
});
