varying vec3 interpolatedNormal;
varying vec3 worldNormal;
varying float worldYPosition;
#define M_PI 3.1415926535897932384626433832795

void main() {
    // Set shared variable to vertex normal
    worldNormal = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
	interpolatedNormal = normal;
	
	worldYPosition = modelMatrix [3][1];
	
    // Multiply each vertex by the model-view matrix and the projection matrix to get final vertex position
    gl_Position = projectionMatrix * (viewMatrix * (modelMatrix * vec4(position, 1.0)));
}
