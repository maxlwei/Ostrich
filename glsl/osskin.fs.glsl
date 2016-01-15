varying vec3 interpolatedNormal;
varying vec3 worldNormal;
varying float worldYPosition;

void main() {
  // Set final rendered color according to the surface normal
  gl_FragColor = vec4(0.89,0.62,0.62,1.0); 
  
  // darken lower parts
  if ((worldYPosition - 10.0) < 0.0) {
	gl_FragColor = gl_FragColor - (vec4(0.02, 0.02, 0.02 ,0.0) * (- worldYPosition + 10.0));
  }
  gl_FragColor.x = (worldNormal.y / 4.5) + gl_FragColor.x;
  gl_FragColor.y = (worldNormal.y / 4.5) + gl_FragColor.y;
  gl_FragColor.z = (worldNormal.y / 4.5) + gl_FragColor.z;


  // some extra colour variation here
  gl_FragColor = gl_FragColor + ((vec4(normalize(worldNormal), 1.0)) / 15.0);

  
}
