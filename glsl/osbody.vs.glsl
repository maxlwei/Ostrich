varying vec3 interpolatedNormal;
varying vec3 worldNormal;
varying vec3 worldPosition;
uniform int tvChannelU;
uniform float timeUniform;
#define M_PI 3.1415926535897932384626433832795

void main() {
    // Set a normal in world coords and a normal according to the object
    worldNormal = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
	interpolatedNormal = normal;
	
	vec3 newPosition = position;
	
	float upDownOscillation = sin((timeUniform + 0.50)* 8.0) / 2.0;
	float randomDisplacement = sin(mod((1.0 * 4.0) + (newPosition.x * 100.0), M_PI / 2.0));
	float randomDisplacement2 = sin(mod((5.2 * 4.0) + (newPosition.x * 100.0), M_PI / 2.0));
	
	if (tvChannelU == 0) {
		// feather displacement with movement
		if (normal.z < 0.7) {
			newPosition.z = (((normal.z - 0.7) * randomDisplacement) / 1.5) + newPosition.z;
			newPosition = (((normal * (- normal.z + 0.7)) * randomDisplacement2) / 1.5) + newPosition;
			
			newPosition.y = newPosition.y + ((upDownOscillation * (- normal.z + 0.7)) * randomDisplacement) ;
		}
	} else {
		// feather displacement without movement
		if (normal.z < 0.7) {
			newPosition.z = (((normal.z - 0.7) * randomDisplacement) / 1.5) + newPosition.z;
			newPosition = (((normal * (- normal.z + 0.7)) * randomDisplacement2) / 1.5) + newPosition;
		}
	}
	
	// set original position
	worldPosition = vec3(modelMatrix * vec4(newPosition, 1.0));
	
    // Multiply each vertex by the model-view matrix and the projection matrix to get final vertex position
    gl_Position = projectionMatrix * (viewMatrix * (modelMatrix * vec4(newPosition, 1.0)));
}
