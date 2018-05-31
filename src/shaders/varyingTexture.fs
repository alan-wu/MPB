precision highp float;
uniform sampler2D myTex;
varying vec2 vUv;

void main() {
	gl_FragColor = texture2D( myTex, vUv );

}
