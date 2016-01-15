varying vec3 interpolatedNormal;
varying vec3 worldNormal;
varying vec3 worldPosition;
uniform int tvChannelU;
uniform float timeUniform;

void main() {
  // Set final rendered color according to the surface normal
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  
  // subtle lighting from above
  gl_FragColor.x = (worldNormal.y / 3.0) + gl_FragColor.x;
  gl_FragColor.y = (worldNormal.y / 3.0) + gl_FragColor.y;
  gl_FragColor.z = (worldNormal.y / 3.0) + gl_FragColor.z;
  
  if (interpolatedNormal.z < -0.75) {
    // tail whiteness
	gl_FragColor.x = (-(interpolatedNormal.z + 0.75) * 3.0) + gl_FragColor.x;
	gl_FragColor.y = (-(interpolatedNormal.z + 0.75) * 3.0) + gl_FragColor.y;
	gl_FragColor.z = (-(interpolatedNormal.z + 0.75) * 3.0) + gl_FragColor.z;
  }
}
