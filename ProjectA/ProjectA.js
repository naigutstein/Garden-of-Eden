//
//               Naomi Gutstein         
//               nyg316 
//               EECS351
//               Project A
//
//--------------------------------------------------------------------
// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position =  u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE = 
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variable -- Rotation angle rate (degrees/second)
var ANGLE_STEP = 1;
var top_eat = 0;
var topchange = 0.008;
var bottomchange = -0.008
var bottom_eat = 0;
var floatsPerVertex= 7;
var sphPosX = 0.4;
var sphPosY = 0.4;
var xChange = -0.02;
var yChange = -0.01;
var stemX = 0.6;
var stemY = 1.3;
var stemXChange = -0.02;
var stemYChange = -0.01;
var rotateSnake = 0;
var ydifference = 0;
var isDrag=false;
var xMdragTot=0.0;  
var yMdragTot=0.0;
var movex = 0;  
var movey= 0

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // 
  var n = initVertexBuffers(gl);
  console.log(n)
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Register the Mouse & Keyboard Event-handlers-------------------------------
  // If users move, click or drag the mouse, or they press any keys on the 
  // the operating system will sense them immediately as 'events'.  
  //
  // First, register all mouse events found within our HTML-5 canvas:
  canvas.onmousedown  = function(ev){myMouseDown( ev, gl, canvas) }; 
  
  // when user's mouse button goes down call mouseDown() function
  canvas.onmousemove =  function(ev){myMouseMove( ev, gl, canvas) };
  
  // call mouseMove() function          
  canvas.onmouseup =    function(ev){myMouseUp(   ev, gl, canvas)};
            
            
  // Next, register all keyboard events found within our HTML webpage window:
  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);
  // The 'keyDown' and 'keyUp' events respond to ALL keys on the keyboard,
  //      including shift,alt,ctrl,arrow, pgUp, pgDn,f1,f2...f12 etc. 
  // The 'keyPress' events respond only to alpha-numeric keys, and sense any 
  //      modifiers such as shift, alt, or ctrl. 
  // END Mouse & Keyboard Event-Handlers----------------------------------------

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Enable 3D depth-test when drawing
  gl.depthFunc(gl.LESS);      
  gl.enable(gl.DEPTH_TEST); 

  
  // Get storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }


  // Current rotation angle
  var currentAngle = 0.0;
  //Angle of rotation for apple that is being eaten 
  var circleAngle = 90;
  // Model matrix
  var modelMatrix = new Matrix4();

  // Start drawing
  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    circleAngle = animateapple(circleAngle); //Update the rotation of apple being eaten
    draw(gl, n, currentAngle, circleAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
    drawArm(gl,currentAngle,modelMatrix,u_ModelMatrix); //Updates the arm
    drawSnake(gl,currentAngle,modelMatrix,u_ModelMatrix); //Updates the snake
    requestAnimationFrame(tick, canvas);   // Request that the browser ?calls tick
  };
  tick();

}


//Makes varying yellow shades for Banana
function makeYellow(){
  return Math.random() * 0.4 + 0.6;
}

//Makes varying green shades for the snake
function makeGreen(){
  return Math.random() 
}

function initVertexBuffers(gl) {
  var c30 = Math.sqrt(0.75);         // == cos(30deg) == sqrt(3) / 2
  var sq2 = Math.sqrt(2.0);            

 // Make each 3D shape in its own array of vertices:
  makeSphere();           // create, fill the sphVerts array
 
 // how many floats total needed to store all shapes?
  var mySiz = (sphVerts.length + 567);            

  // How many vertices total?
  var nn = mySiz / floatsPerVertex;
  console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
  // Copy all shapes into one big Float32 array:
  var colorShapes = new Float32Array(mySiz);
  // Copy them:  
  sphStart = 567;             
  var i;
  for(i=567,j=0; j< sphVerts.length; i++,j++) {
    colorShapes[i] = sphVerts[j];
    }

  var verticesColors = new Float32Array([
    // Vertex coordinates(x,y,z,w) and color (R,G,B) for one triangle.
     // x, y, z, w,  r,g,b

    //----------Eating Lips--------------------------------------------------------
    //left upper lip
     -0.8,  0.0, 0.0, 1.0,    1.0, 0.0, 0.0,  
     -0.65, 0.17, 0.0, 1.0,    1.0, 0.0, 0.0,
     -0.5, 0.0, 0.0, 1.0,    1.0, 0.0, 0.0,
     //right upper lip
     -0.5, 0.0, 0.0, 1.0,      1.0, 0.0, 0.0,
     -0.35, 0.17, 0.0, 1.0,    1.0, 0.0, 0.0,
     -0.2, 0.0, 0.0, 1.0,     1.0, 0.0, 0.0,
     //lower lip
     -0.8, -0.05, 0.0, 1.0,    1.0, 0.0, 0.0,
     -0.5, -0.2, 0.0, 1.0,    1.0, 0.0, 0.0,
     -0.2, -0.05, 0.0, 1.0,    1.0, 0.0, 0.0,
     
     //----------robot arm----------------------------------------------------------

     0.00, 0.00, 0.0, 1.0,    0.00, 1.00, 1.00,    // first triangle   (x,y,z,w==1)
     0.095, 0.00, 0.0, 1.0,  1.00, 1.00, 0.00,  
     0.0,  0.49, 0.0, 1.0,    0.00, 1.00, 1.00,
     0.1, 0.01, 0.0, 1.0,    1.00, 0.00, 1.00,    // second triangle
     0.10, 0.5, 0.0, 1.0,    1.00, 1.00, 0.00,
     0.005, 0.5, 0.0, 1.0,   1.00, 0.00, 1.00,

     //------------BANANA-----------------------------------------------------------
     //Cube in the middle part
     // +x face
     1.0, -1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 3
     1.0,  1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 2
     1.0,  1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 4
     
     1.0,  1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 4
     1.0, -1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 7
     1.0, -1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 3

    // +y face
    -1.0,  1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 1
    -1.0,  1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 5
     1.0,  1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 4

     1.0,  1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 4
     1.0,  1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 2 
    -1.0,  1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 1

    // +z face
    -1.0,  1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 5
    -1.0, -1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 6
     1.0, -1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 7

     1.0, -1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 7
     1.0,  1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 4
    -1.0,  1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 5

    // -x face
    -1.0, -1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 6 
    -1.0,  1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 5 
    -1.0,  1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 1
    
    -1.0,  1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 1
    -1.0, -1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 0  
    -1.0, -1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 6  
    
    // -y face
     1.0, -1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 3
     1.0, -1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 7
    -1.0, -1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 6

    -1.0, -1.0,  1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 6
    -1.0, -1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 0
     1.0, -1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 3

     // -z face
     1.0,  1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 2
     1.0, -1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 3
    -1.0, -1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 0   

    -1.0, -1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 0
    -1.0,  1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 1
     1.0,  1.0, -1.0, 1.0,    makeYellow(), makeYellow(), 0.1,  // Node 2


    //top tetrahedron vertices
          // Face 0: (left side)  
     0.0,  0.0, sq2, 1.0,     makeYellow(), makeYellow(), 0.0,  // Node 0
     c30, -0.5, 0.0, 1.0,     makeYellow(), makeYellow(), 0.0,  // Node 1
     0.0,  1.0, 0.0, 1.0,     makeYellow(), makeYellow(), 0.0,  // Node 2
      // Face 1: (right side)
     0.0,  0.0, sq2, 1.0,     makeYellow(), makeYellow(), 0.0,  // Node 0
     0.0,  1.0, 0.0, 1.0,     makeYellow(), makeYellow(), 0.0,  // Node 2
    -c30, -0.5, 0.0, 1.0,     makeYellow(), makeYellow(), 0.0,  // Node 3
      // Face 2: (lower side)
     0.0,  0.0, sq2, 1.0,     makeYellow(), makeYellow(), 0.0,  // Node 0 
    -c30, -0.5, 0.0, 1.0,     makeYellow(), makeYellow(), 0.0, // Node 3
     c30, -0.5, 0.0, 1.0,     makeYellow(), makeYellow(), 0.0,  // Node 1 
      // Face 3: (base side)  
    -c30, -0.5,  0.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 3
     0.0,  1.0,  0.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 2
     c30, -0.5,  0.0, 1.0,    makeYellow(), makeYellow(), 0.0,  // Node 1

     //------------------snake----------------------------------------------------- 
     0.00, 0.00, 0.0, 1.0,    0.00, makeGreen(), 0.2,    // first triangle   (x,y,z,w==1)
     0.095, 0.00, 0.0, 1.0,   0.00, makeGreen(), 0.2,  
     0.0,  0.49, 0.0, 1.0,    0.00, makeGreen(), 0.2,
     0.05, 0.01, 0.0, 1.0,     0.00, makeGreen(), 0.2,    // second triangle
     0.05, 0.5, 0.0, 1.0,     0.00, makeGreen(), 0.2,
     0.005, 0.5, 0.0, 1.0,    0.00, makeGreen(), 0.2,


     //------------------Apple Stem-------------------------------------------------
     //top tetrahedron vertices for apple
     // Face 0: (left side)  
     0.0,  0.0, sq2, 1.0,     0.0, makeGreen(), 0.0,  // Node 0
     c30, -0.5, 0.0, 1.0,     0.0, makeGreen(), 0.0,  // Node 1
     0.0,  1.0, 0.0, 1.0,     0.0, makeGreen(), 0.0,  // Node 2
      // Face 1: (right side)
     0.0,  0.0, sq2, 1.0,     0.0, makeGreen(), 0.0,  // Node 0
     0.0,  1.0, 0.0, 1.0,     0.0, makeGreen(), 0.0,  // Node 2
    -c30, -0.5, 0.0, 1.0,     0.0, makeGreen(), 0.0,  // Node 3
      // Face 2: (lower side)
     0.0,  0.0, sq2, 1.0,     0.0, makeGreen(), 0.0,  // Node 0 
    -c30, -0.5, 0.0, 1.0,     0.0, makeGreen(), 0.0, // Node 3
     c30, -0.5, 0.0, 1.0,     0.0, makeGreen(), 0.0,  // Node 1 
      // Face 3: (base side)  
    -c30, -0.5,  0.0, 1.0,    0.0, makeGreen(), 0.0,  // Node 3
     0.0,  1.0,  0.0, 1.0,    0.0, makeGreen(), 0.0,  // Node 2
     c30, -0.5,  0.0, 1.0,    0.0, makeGreen(), 0.0,  // Node 1

  ]);
  var n = 81;

  for(var j= 0; j<567; j++){
    colorShapes[j] = verticesColors[j];
  }

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  var FSIZE = colorShapes.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * 7, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 7, FSIZE * 4);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  console.log(nn);
  return nn;
}


function draw(gl, n, currentAngle, circleAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>
   gl.clear(gl.COLOR_BUFFER_BIT);
  
  //--------------------LIPS------------------------------------------------
  //--------Draws left upper lip------------

  modelMatrix.setTranslate(0,top_eat,0);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

   //--------Draws right upper lip------------
  modelMatrix.setTranslate(0,top_eat,0);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

 
  gl.drawArrays(gl.TRIANGLES, 3, 3);

 //---------Draws lower lip----------------------
  modelMatrix.setTranslate(0,bottom_eat,0);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 6, 3);

  //---------------------APPLE---------------------------------------------
  //--------Draw Spinning Sphere
  modelMatrix.setTranslate(sphPosX, sphPosY, 0.0); // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV.
  modelMatrix.scale(1,1,-1);              // convert to left-handed coord sys
                                          // to match WebGL display canvas.
  modelMatrix.scale(0.15, 0.15, 0.15);     // Make it smaller:
  modelMatrix.rotate(circleAngle, 1, 1, 0);  // Spin on XY diagonal axis
  // Drawing:   
  // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/7, // start at this vertex number, and 
                700); // draw this many vertices.
  
  //DRAW STEM OF APPLE
  modelMatrix.translate(stemX, stemY, 0.0);  
  modelMatrix.scale(1,1,-1);              // convert to left-handed coord sys
                                          // to match WebGL display canvas.
  modelMatrix.scale(0.5, 0.5, 0.5);
              // if you DON'T scale, tetra goes outside the CVV; clipped!
  modelMatrix.rotate(circleAngle, 1, 1, 0);  // Make new drawing axes that

  // DRAW TETRA:  Use this matrix to transform & draw 
  //            the first set of vertices stored in our VBO:
      // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw triangles: start at vertex 0 and draw 12 vertices
  gl.drawArrays(gl.TRIANGLES, 69, 12);

//---------------------BANANA--------------------------------------------
  // DRAW CUBE:   Use ths matrix to transform & draw
  //            the second set of vertices stored in our VBO:
  modelMatrix.setTranslate(0.7+xMdragTot,-0.7+yMdragTot,0);

  modelMatrix.scale(0.05,0.05,0.05,1);

  modelMatrix.rotate(circleAngle,45,45,1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the first set of vertices: start at vertex SHAPE_0_SIZE
  gl.drawArrays(gl.TRIANGLES, 15,36);

  pushMatrix(modelMatrix);

  //-------top of banana 
  modelMatrix.translate(0.2, 1.2, -0.2);  // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV. 
  modelMatrix.scale(1,1,-1);              // convert to left-handed coord sys
                                          // to match WebGL display canvas.
  modelMatrix.scale(1.5, 3, 1.5);
              // if you DON'T scale, tetra goes outside the CVV; clipped!
  modelMatrix.rotate(75, -30, 1, 0);  // Make new drawing axes that

  // DRAW TETRA:  Use this matrix to transform & draw 
  //            the first set of vertices stored in our VBO:
      // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw triangles: start at vertex 0 and draw 12 vertices
  gl.drawArrays(gl.TRIANGLES, 51, 12);


  modelMatrix = popMatrix();

  //------ bottom of banana 
  modelMatrix.translate(0.05, -1.2, -0.3);  // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV. 
  modelMatrix.scale(1,1,-1);              // convert to left-handed coord sys
                                          // to match WebGL display canvas.
  modelMatrix.scale(1.5, 3, 1.5);
              // if you DON'T scale, tetra goes outside the CVV; clipped!
  modelMatrix.rotate(255, -30, 1, 0);  // Make new drawing axes that

  // DRAW TETRA:  Use this matrix to transform & draw 
  //            the first set of vertices stored in our VBO:
      // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw triangles: start at vertex 0 and draw 12 vertices
  gl.drawArrays(gl.TRIANGLES, 51, 12);

  
 }

function drawArm(gl,currentAngle,modelMatrix,u_ModelMatrix){
  //-------Draw lower Arm----------------
  
  modelMatrix.setTranslate(0.4, -0.9, 0); 

  modelMatrix.scale(1,1,1);      

  modelMatrix.rotate(0, 0,0,1);  

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 9, 6);

  //-------Draw Upper Arm----------------
  modelMatrix.translate(0, 0.5, 0); 

  modelMatrix.scale(0.8,0.8,1);      

  modelMatrix.rotate(currentAngle, 0,0,1);  

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 9, 6);


  //--------Draw hand-------------------
  modelMatrix.translate(0.0, 0.5, 0); 

  modelMatrix.scale(0.8,0.8,1);      

  modelMatrix.rotate(currentAngle, 0,0,1);  

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 9, 6);
  

}

function drawSnake(gl, currentAngle, modelMatrix, u_ModelMatrix){
  //--------middle right of snake--------------
  modelMatrix.setTranslate(-0.5+movex, -0.9+movey, 0); 

  modelMatrix.scale(0.5,0.5,0.5);      

  modelMatrix.rotate(270+rotateSnake,0,0,1);  

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 63, 6);

  //-------right middle of snake----------------
  modelMatrix.translate(0, 0.5, 0); 

  modelMatrix.scale(0.8,0.8,1);      

  modelMatrix.rotate(currentAngle, 0,0,1);  

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 63, 6);


  //--------right end of snake-------------------
  modelMatrix.translate(0.0, 0.5, 0); 

  modelMatrix.scale(0.8,0.8,1);      

  modelMatrix.rotate(currentAngle, 0,0,1);  

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 63, 6);

 
  //-------middle left of snake------------
  modelMatrix.setTranslate(-0.5+movex, -0.95+movey, 0); 

  modelMatrix.scale(0.5,0.5,0.5);      

  modelMatrix.rotate(90+rotateSnake,0,0,1);  

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 63, 6);

  //-------left middle of snake----------------
  modelMatrix.translate(0, 0.5, 0); 

  modelMatrix.scale(0.8,0.8,1);      

  modelMatrix.rotate(currentAngle, 0,0,1);  

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 63, 6);


  //--------left end of snake-------------------
  modelMatrix.translate(0.0, 0.5, 0); 

  modelMatrix.scale(0.8,0.8,1);      

  modelMatrix.rotate(currentAngle, 0,0,1);  

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 63, 6);
}


function makeSphere() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 13;    // # of slices of the sphere along the z axis. >=3 req'd
                      // (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts  = 27; // # of vertices around the top edge of the slice
                      // (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([1, 0, 0]);  // North Pole: light gray
  var equColr = new Float32Array([0.5, 0, 0]);  // Equator:    bright green
  var botColr = new Float32Array([1, 0, 0]);  // South Pole: brightest gray.
  var sliceAngle = Math.PI/slices;  // lattitude angle spanned by one slice.

  // Create a (global) array to hold this sphere's vertices:
  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
                    // # of vertices * # of elements needed to store them. 
                    // each slice requires 2*sliceVerts vertices except 1st and
                    // last ones, which require only 2*sliceVerts-1.
                    
  // Create dome-shaped top slice of sphere at z=+1
  // s counts slices; v counts vertices; 
  // j counts array elements (vertices * elements per vertex)
  var cos0 = 0.0;         // sines,cosines of slice's top, bottom edge.
  var sin0 = 0.0;
  var cos1 = 0.0;
  var sin1 = 0.0; 
  var j = 0;              // initialize our array index
  var isLast = 0;
  var isFirst = 1;
  for(s=0; s<slices; s++) { // for each slice of the sphere,
    // find sines & cosines for top and bottom of this slice
    if(s==0) {
      isFirst = 1;  // skip 1st vertex of 1st slice.
      cos0 = 1.0;   // initialize: start at north pole.
      sin0 = 0.0;
    }
    else {          // otherwise, new top edge == old bottom edge
      isFirst = 0;  
      cos0 = cos1;
      sin0 = sin1;
    }               // & compute sine,cosine for new bottom edge.
    cos1 = Math.cos((s+1)*sliceAngle);
    sin1 = Math.sin((s+1)*sliceAngle);
    // go around the entire slice, generating TRIANGLE_STRIP verts
    // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
    if(s==slices-1) isLast=1; // skip last vertex of last slice.
    for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) { 
      if(v%2==0)
      {       // put even# vertices at the the slice's top edge
              // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
              // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
        sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);  
        sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);  
        sphVerts[j+2] = cos0;   
        sphVerts[j+3] = 1.0;      
      }
      else {  // put odd# vertices around the slice's lower edge;
              // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
              //          theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
        sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);    // x
        sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);    // y
        sphVerts[j+2] = cos1;                                       // z
        sphVerts[j+3] = 1.0;                                        // w.   
      }
      if(s==0) {  // Red color in verticies:
        sphVerts[j+4]=1; 
        sphVerts[j+5]=0; 
        sphVerts[j+6]=0; 
        }
      else if(s==slices-1) {
        sphVerts[j+4]=1; 
        sphVerts[j+5]=0; 
        sphVerts[j+6]=0; 
      }
      else {
          sphVerts[j+4]=Math.random();// equColr[0]; 
          sphVerts[j+5]=0;// equColr[1]; 
          sphVerts[j+6]=0;// equColr[2];          
      }
    }
  }
}



// animation
var g_last = Date.now();


function myMouseDown(ev, gl, canvas) {
//==============================================================================
// Called when user PRESSES down any mouse button;
//                  (Which button?    console.log('ev.button='+ev.button);   )
//    ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
//  console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
  
  rotateSnake = rotateSnake + 10;
  ydifference = ydifference +0.01
  isDrag = true;                      // set our mouse-dragging flag
  xMclik = x;                         // record where mouse-dragging began
  yMclik = y;
};


function myMouseMove(ev, gl, canvas) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
//                  (Which button?   console.log('ev.button='+ev.button);    )
//    ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

  if(isDrag==false) return;       // IGNORE all mouse-moves except 'dragging'

  // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
//  console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

  // find how far we dragged the mouse:
  xMdragTot += (x - xMclik);          // Accumulate change-in-mouse-position,&
  yMdragTot += (y - yMclik);
  xMclik = x;                         // Make next drag-measurement from here.
  yMclik = y;
};

function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
//                  (Which button?   console.log('ev.button='+ev.button);    )
//    ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
  
  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
  console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
  
  isDrag = false;                     // CLEAR our mouse-dragging flag, and
  // accumulate any final bit of mouse-dragging we did:
  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
  console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
};

function myKeyDown(ev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard, and captures the 
// keyboard's scancode or keycode(varies for different countries and alphabets).


  switch(ev.keyCode) {      
    case 37:    // left-arrow key
      // print in console:
      console.log(' left-arrow.');
      movex = movex - .1;
      // and print on webpage in the <div> element with id='Result':
      break;
    case 38:    // up-arrow key
      console.log('   up-arrow.');
      movey = movey + .1;
      break;
    case 39:    // right-arrow key
      console.log('right-arrow.');
      movex = movex + .1;
      break;
    case 40:    // down-arrow key
      console.log(' down-arrow.');
      movey = movey - .1;
      break;
    default:
      console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
      break;
  }
}

function myKeyUp(ev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

  console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');
}

function myKeyPress(ev) {
//===============================================================================
// Best for capturing alphanumeric keys and key-combinations such as 
// CTRL-C, alt-F, SHIFT-4, etc.
  console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
                        ', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
                        ', altKey='   +ev.altKey   +
                        ', metaKey(Command key or Windows key)='+ev.metaKey);
}
// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();
var gg_last = Date.now();


function animate(angle) {
//==============================================================================
  // Calculate the elapsed time


  if(angle > 45 || angle < 0){
    ANGLE_STEP = -ANGLE_STEP
    xChange = -xChange
    yChange = -yChange
    bottomchange = -bottomchange
    topchange = -topchange
    stemXChange = -stemXChange
    stemYChange = -stemYChange
  }
  
  var newAngle = angle + ANGLE_STEP;

  sphPosX = sphPosX + xChange;
  sphPosY = sphPosY + yChange;
  bottom_eat = bottom_eat + bottomchange;
  top_eat = top_eat + topchange;
  stemX = stemX + stemXChange;
  stemY = stemY + stemYChange;
  return newAngle;

}

function animateapple(circleAngle){

  var newAngle = circleAngle + 1;
  return newAngle;
}


function moreCCW() {
//==============================================================================

  ANGLE_STEP += 10; 
}

function lessCCW() {
//==============================================================================
  ANGLE_STEP -= 10; 
}