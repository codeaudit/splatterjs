// ## DEBUG.JS
//
// Holds utility methods necessary to help in debugging textures or other aspects
// of WebGL.

// ### debugTexture(GL.texture, x, y, w, h, opt_nodebug);
//
// Given a texture, start texel position, and a width and height, print out the values
// stored in the texture.  Does not work for float textures
var debugTexture = function(tex, x, y, w, h, nodebug) {
  // Be a little lenient with texture, allow passing in GL.Texture (lightgl).
  if (Object.prototype.toString.call(tex).indexOf("WebGLTexture") == -1)
    tex = tex.id;

  w = w || 2;
  h = h || 2;
  ds.fbo = ds.fbo || gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, ds.fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  
  var pixels = new Uint8Array(w * h * 4);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
    gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    if (!nodebug) {
      console.log("Reading from texture coords (" + x + ", " + y + ") to (" + (x+w) + ", " + (y+h) + "):");
      console.log(pixels);
    }
  }
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return pixels;
};

// ### debugFloatTexture(GL.texture, x, y, w, h);
//
// Debug function for reading values from faux-float textures (e.g. storing 0xff 
// in each unsigned byte channel).
var debugFloatTexture = function(tex, x, y, w, h) {
  // default width and height to two pixels for easy printing
  w = w || 2;
  h = h || 2;
  var pixels = debugTexture(tex, x, y, w, h);
  
  // parse each component
  var output = [];
  for (var i = 0; i < pixels.length; i = i + 4) {
    output.push(threeChanToFloat(pixels[i]/255, pixels[i+1]/255, pixels[i+2]/255));
    output.push(pixels[i+3]);    
  }
  
  console.log("Reading floats from texture coords (" + x + ", " + y + ") to (" + (x+w) + ", " + (y+h) + "):");
  console.log(output);
  return output;
};

// ### debug2FloatTexture(GL.Texture, x, y, w, h);
//
// Debug function for reading two float values from faux-float textures (e.g. storing 
// 0xffff in each pair of unsigned byte channels).
var debug2FloatTexture = function(tex, x, y, w, h) {
  // default width and height to two pixels for easy printing
  w = w || 2;
  h = h || 2;
  var pixels = debugTexture(tex, x, y, w, h);
  
  // parse each component
  var output = [];
  for (var i = 0; i < pixels.length; i = i + 2) {
    output.push(twoChanToFloat(pixels[i]/255, pixels[i+1]/255));
  }
  
  console.log("Reading floats from texture coords (" + x + ", " + y + ") to (" + (x+w) + ", " + (y+h) + "):");
  console.log(output);
  return output;
};


// ### debugJfa();
//
// 
var debugJfa = function() {
  if (!shaders['jfadebug']) {
    if (!timer)
      timer = setTimeout("gl.ondraw()", 300);
    return;
  }
  
  gl.disable(gl.DEPTH_TEST);
  gl.clearColor(0.0,0.0,0.0,1.0);
  
  // only do the first group
  grp = ds.groups[0];
  grp.textures['dist0'].bind(0);
  shaders['jfadebug'].uniforms({
    texture: 0,
    maxDist: 500
  }).draw(plane);
  
  grp.textures['dist0'].unbind(0);
};

var threeChanToFloat = function(r,g,b) {
  return r * 255 / 256 + g * 255 / (256*256) + b * 255 / (256*256*256);
};

var floatToThreeChan = function(f) {
  f *= 256;
  var r = Math.floor(f);
  f -= r;
  f *= 256;
  var g = Math.floor(f);
  f -= g;
  f *= 256;
  var b = Math.floor(f);
  return [r / 255, g / 255, b / 255];
};

var twoChanToFloat = function(x,y) {
  return x * 255 / 256 + y * 255 / (256 * 256);
};

var floatToTwoChan = function(f) {
  f *= 256;
  var x = Math.floor(f);
  f -= x;
  f *= 256;
  var y = Math.floor(f);
  return [x / 255, y / 255];
};