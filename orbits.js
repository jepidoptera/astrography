var ctx;
var canvas;
const astros = [];
var zoomscale = 1
var gravitationalConstant = 10
var timestep = 5

class Astro {
    constructor(x, y, radius, color = 'white', movementVector = {x: 0, y: 0}) {
        this.x = x
        this.y = y
        this.color = color
        this.radius = radius
        this.surface = radius ** 2
        this.mass = radius ** 3
        this.movementVector = movementVector
    }
    attractAll() {
        for (let n in astros) {
            if (astros[n] === this) continue;
            // no need to take the square root, since what we actually want in the square of the distance
            let xdist = astros[n].x - this.x
            let ydist = astros[n].y - this.y
            let dist = xdist ** 2 + ydist ** 2
            astros[n].movementVector.x -= Math.sign(xdist) * this.mass / astros[n].mass / dist * gravitationalConstant
            astros[n].movementVector.y -= Math.sign(ydist) * this.mass / astros[n].mass / dist * gravitationalConstant
            if (dist < this.surface + astros[n].surface) {
                // collide
                console.log('collision')
            }
        }
    }
    move() {
        this.x += this.movementVector.x
        this.y += this.movementVector.y
    }
    draw() {
        drawCircle(this.x, this.y, this.radius, this.color)
    }
}


$(document).ready(function() {
    canvas = document.getElementById('canvas');
    canvas.origin = {x: $(canvas).width() / 2, y: $(canvas).height() / 2}
    ctx = canvas.getContext('2d');
    astros.push(new Astro(0, 0, 50, 'yellow', {x: 0, y: 0}))
    astros.push(new Astro(200, 200, 10, 'green', {x: -1, y: 1.5}))
    // astros.push(new Astro(-100, -100, 10, 'green', {x: 5, y: -5}))
    setInterval(() => {
        drawCanvas();
    }, timestep);


    // mouse events
    var leftButtonDown = false;
    var middleButtonDown = false;
    var mouseWas = null;
    $(document).mousedown(function(e){
        // Left mouse button was pressed, set flag
        if(e.which === 1) leftButtonDown = true;
        if(e.which === 2) middleButtonDown = true;
        mouseWas = mouseWas || {x: e.offsetX, y: e.offsetY}
    });
    $(document).mouseup(function(e){
        // Left mouse button was released, clear flag
        if(e.which === 1) leftButtonDown = false;
        if(e.which === 2) middleButtonDown = false;
    });
    $(document).click(function(e){
        mouseWas = {x: e.offsetX, y: e.offsetY}

        // did we click on an astro?
        for (let n in astros) {
            if (astros[n].x < mouseWas.x - canvas.origin.x + astros[n].radius && astros[n].y < mouseWas.y - canvas.origin.y + astros[n].radius) {
                if (astros[n].x > mouseWas.x - canvas.origin.x - astros[n].radius && astros[n].y > mouseWas.y - canvas.origin.y - astros[n].radius) {
                    // target acquired
                    console.log('clicked on ' + n)
                }
            }
        }
        console.log('clicked at', mouseWas.x, mouseWas.y)
    })

    $(canvas).mousemove(function(e){
        if (mouseWas) {
            e.delta = {x: e.offsetX - mouseWas.x, y: e.offsetY - mouseWas.y}
            mouseWas = {x: e.offsetX, y: e.offsetY}
        }
        console.log('mouse moved')
        if (middleButtonDown) {
            canvas.origin.x += e.delta.x;
            canvas.origin.y += e.delta.y;
            canvas.drift = {x: e.delta.x, y: e.delta.y}
        }
    })
})

function drawCanvas() {
    ctx.fillStyle = "black"
    if (canvas.drift) {
        canvas.origin.x += canvas.drift.x
        canvas.origin.y += canvas.drift.y
    }
    canvas.origin = {x: astros[0].x + canvas.width / 2, y: astros[0].y + canvas.height / 2}
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (let n in astros) {
        astros[n].attractAll()
    }
    for (let n in astros) {
        astros[n].move()
        astros[n].draw()
    }
}

let origin = {x: $(canvas).width() / 2, y: $(canvas).height / 2}
function drawCircle(x = 0, y = 0, radius = 1, color = 'white') {
    ctx.fillStyle = color;
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(canvas.origin.x - x*zoomscale, canvas.origin.y - y*zoomscale, radius, 0, 2 * Math.PI);
    ctx.closePath();
    // ctx.stroke();
    ctx.fill();
}