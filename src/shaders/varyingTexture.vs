precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;
attribute vec2 uv;
attribute vec3 position_1;
attribute vec3 position_2;
attribute vec2 uv_1;
attribute vec2 uv_2;

uniform float time;
uniform float slide_pos;
varying vec2 vUv;

void main() {
	vUv = uv;
	
	vec3 transformed_xi1 = position * vec3(1.0 - time) +  position_1 * vec3(time);
	
	vec3 xi0_time_1 = vec3(position_1.x, position_1.y, 0.0);
	vec3 transformed_xi0 = position_2 * vec3(1.0 - time) +  xi0_time_1 * vec3(time);

	vec3 transformed = vec3(transformed_xi0) * vec3(1.0 - slide_pos) +  vec3(transformed_xi1) * vec3(slide_pos);
	
	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

}
