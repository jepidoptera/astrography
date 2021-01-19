var ctx;
var canvas;
const astros = [];
var zoomscale = .1
var gravitationalConstant = .002
var timestep = .1
var paused = false
var showTrails = true

class Astro {
    constructor(args) {
        args = {
            x: args.x || 0, 
            y: args.y || 0, 
            radius: args.radius || 1, 
            fill: args.fill || 'white', 
            outline: args.outline || 'blue', 
            movementVector: args.movementVector || {x: 0, y: 0},
            borderWidth: args.borderWidth || 5,
            fixed: args.fixed || false
        }
        this.x = args.x
        this.y = args.y
        this.fill = args.fill
        this.outline = args.outline
        this.borderWidth = args.borderWidth
        this.radius = args.radius
        this.surface = this.radius ** 2
        this.mass = this.radius ** 3
        this.movementVector = args.movementVector
        this.fixed = args.fixed;
        this.lastDraw = Date.now() / 10
    }
    attractAll() {
        for (let n in astros) {
            if (astros[n] === this) continue;
            if (astros[n].fixed) continue;
            // no need to take the square root, since what we actually want in the square of the distance
            let xdist = astros[n].x - this.x
            let ydist = astros[n].y - this.y
            let dist = xdist ** 2 + ydist ** 2
            astros[n].movementVector.x -= Math.sign(xdist) * this.mass / dist * gravitationalConstant * timestep
            astros[n].movementVector.y -= Math.sign(ydist) * this.mass / dist * gravitationalConstant * timestep
            if (dist < this.surface + astros[n].surface) {
                // collide
                console.log('collision')
            }
        }
    }
    move() {
        timestep = Date.now() / 10 - this.lastDraw;
        this.lastDraw = Date.now() / 10;

        this.x += this.movementVector.x * timestep
        this.y += this.movementVector.y * timestep
    }
    draw() {
        ctx.fillStyle = this.fill;
        ctx.strokeStyle = this.outline;
        ctx.lineWidth = this.borderWidth * zoomscale;
        ctx.beginPath();
        ctx.arc(canvas.origin.x - this.x*zoomscale, canvas.origin.y - this.y*zoomscale, this.radius*zoomscale, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
}

let sun = new Astro({x: 0, y: 0, radius: 50, fill: 'yellow', outline: 'orange', borderWidth: 15, movementVector: {x: 0, y: 0}, fixed: true})
let earth = new Astro({x: 200, y: 200, radius: 10, fill: 'green', outline: 'blue', movementVector: {x: -0.5, y: 0.75}})
let jupiter = new Astro({x: 800, y: 0, radius: 15, fill: 'orange', outline: 'red', movementVector: {x: 0, y: 0.8}})
astros.push(sun, earth, jupiter)

for (let a = 0; a < 50; a++) {
    asteroid = new Astro({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        radius: 2,
        fill: 'gray',
        outline: 'black'
    })
    asteroid.movementVector = {
        x: Math.random() * (asteroid.y / (asteroid.y + asteroid.x)),
        y: Math.random() * (asteroid.x / (asteroid.y + asteroid.x))
    }
    // astros.push(asteroid)
}

$(document).ready(function() {
    canvas = document.getElementById('canvas');
    canvas.origin = {x: $(canvas).width() / 2, y: $(canvas).height() / 2}
    ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // astros.push(new Astro(-100, -100, 10, 'green', {x: 5, y: -5}))
    window.requestAnimationFrame(drawCanvas)
    setInterval(() => {
        for (let n in astros) {
            astros[n].move()
            astros[n].attractAll()
        }    
    }, 1);

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
    $(document).keypress(function(e){
        // console.log(e.key);
        if (e.key==='-') zoomscale *= .9;
        else if (e.key==='+') zoomscale /=.9;
    })
    $(canvas).mousemove(function(e){
        if (mouseWas) {
            e.delta = {x: e.offsetX - mouseWas.x, y: e.offsetY - mouseWas.y}
            mouseWas = {x: e.offsetX, y: e.offsetY}
        } 
        // console.log('mouse moved')
        if (leftButtonDown) {
            canvas.origin.x += e.delta.x;
            canvas.origin.y += e.delta.y;
            canvas.drift = {x: e.delta.x, y: e.delta.y}
        }
    })
})

function drawCanvas() {
    ctx.fillStyle = "black"
    // canvas.origin = {x: sun.x * zoomscale + canvas.width / 2, y: sun.y * zoomscale + canvas.height / 2}
    if (!showTrails) ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let n in astros) {
        astros[n].draw()
    }    

    window.requestAnimationFrame(drawCanvas)
}
