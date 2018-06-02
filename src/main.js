var canvas;
var app;
var timer;
var drawCall;
var projMatrix, viewMatrix, viewProjMatrix;
var sceneUniformBuffer;
        
function init() {
    utils.addTimerElement();
    
    canvas = document.getElementById("gl-canvas");
    
    if (!utils.testWebGL2()) {
        console.error("WebGL 2 not available");
        document.body.innerHTML = "This example requires WebGL 2 which is unavailable on this system."
    }
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    app = PicoGL.createApp(canvas)
    .clearColor(0.0, 0.0, 0.0, 1.0)
    .depthTest();
    
    timer = app.createTimer();
    
    // SET UP PROGRAM
    var vsSource =  document.getElementById("vertex-draw").text.trim();
    var fsSource =  document.getElementById("fragment-draw").text.trim();
    var program = app.createProgram(vsSource, fsSource);
    
    // SET UP GEOMETRY
    var box = utils.createBox({dimensions: [1.0, 1.0, 1.0]})
    var positions = app.createVertexBuffer(PicoGL.FLOAT, 3, box.positions);
    
    var boxArray = app.createVertexArray()
    .vertexAttributeBuffer(0, positions);
    
    // SET UP UNIFORM BUFFER
    projMatrix = mat4.create();
    mat4.perspective(projMatrix, Math.PI / 2, canvas.width / canvas.height, 0.1, 10.0);
    
    viewMatrix = mat4.create();
    var eyePosition = vec3.fromValues(1, 1, 1);
    mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
    
    viewProjMatrix = mat4.create();
    mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);
    
    sceneUniformBuffer = app.createUniformBuffer([
        PicoGL.FLOAT_MAT4
    ])
    .set(0, viewProjMatrix)
    .update();
    
    drawCall = app.createDrawCall(program, boxArray)
    .uniformBlock("SceneUniforms", sceneUniformBuffer);
    
    requestAnimationFrame(draw);
    
}

window.onresize = function() {
    app.resize(window.innerWidth, window.innerHeight);

    mat4.perspective(projMatrix, Math.PI / 2, app.width / app.height, 0.1, 10.0);
    mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);
    
    sceneUniformBuffer.set(0, viewProjMatrix).update();
}

var modelMatrix = mat4.create();
var rotateXMatrix = mat4.create();
var rotateYMatrix = mat4.create();
var angleX = 0;
var angleY = 0;
    
function draw() {
    if (timer.ready()) {
        utils.updateTimerElement(timer.cpuTime, timer.gpuTime);
    }

    timer.start()

    angleX += 0.01;
    angleY += 0.02;

    mat4.fromXRotation(rotateXMatrix, angleX);
    mat4.fromYRotation(rotateYMatrix, angleY);
    mat4.multiply(modelMatrix, rotateXMatrix, rotateYMatrix);

    drawCall.uniform("uModel", modelMatrix);

    app.clear();
    drawCall.draw()
    
    timer.end();

    requestAnimationFrame(draw);
}