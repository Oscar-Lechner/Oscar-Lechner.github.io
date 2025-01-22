new p5((sketch) => {
    let yoff = 0.0;

    sketch.setup = () => {
        let canvas = sketch.createCanvas(sketch.windowWidth, 200);
        canvas.parent('p5-sketch');
        sketch.noFill();
    };

    sketch.draw = () => {
        sketch.background(52, 73, 94); // Matches the dark secondary color from your CSS
        sketch.beginShape();
        let xoff = 0;

        for (let x = 0; x <= sketch.width; x += 10) {
            let y = sketch.map(sketch.noise(xoff, yoff), 0, 1, 50, 150);
            sketch.vertex(x, y);
            xoff += 0.05;
        }
        yoff += 0.01;
        sketch.vertex(sketch.width, sketch.height);
        sketch.vertex(0, sketch.height);
        sketch.endShape(sketch.CLOSE);
    };

    sketch.windowResized = () => {
        sketch.resizeCanvas(sketch.windowWidth, 200);
    };
}, 'p5-sketch');
