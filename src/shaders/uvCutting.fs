varying vec3 colorValue; 
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
uniform float progress;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform vec3 diffuse;
uniform float shininess;
uniform vec3 ambientLightColor;
uniform	vec3 directionalLightColor;
uniform	vec3 directionalLightDirection;
uniform int reverse;

void main(void) {
#ifdef ALPHATEST
	if ( gl_FragColor.a < ALPHATEST ) discard;
#endif
	float pxielTimeStep = vUv.x;
	if (reverse == 1)
	{	
			if (pxielTimeStep > progress)
				discard;
	}
	else
	{
			if (pxielTimeStep < progress)
				discard;
	}

	float specularStrength = 1.0;
	vec3 normal = normalize( vNormal );

	
	if (!gl_FrontFacing)
		normal.z = -normal.z;
		
	vec3 viewPosition = normalize( vViewPosition );

#if NUM_DIR_LIGHTS > 0
	vec3 dirDiffuse  = vec3( 0.0 );
	vec3 dirSpecular = vec3( 0.0 );

	vec4 lDirection = viewMatrix * vec4( directionalLightDirection, 0.0 );
	vec3 dirVector = normalize( lDirection.xyz );
	float dotProduct = dot( normal, dirVector );
	#ifdef WRAP_AROUND
		float dirDiffuseWeightFull = max( dotProduct, 0.0 );
		float dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );
		vec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );
	#else
		float dirDiffuseWeight = max( dotProduct, 0.0 );
	#endif
	dirDiffuse += diffuse * directionalLightColor * dirDiffuseWeight;
	vec3 dirHalfVector = normalize( dirVector + viewPosition );
	float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );
	float dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );
	float specularNormalization = ( shininess + 2.0001 ) / 8.0;
	vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );
	dirSpecular += schlick * directionalLightColor * dirSpecularWeight * dirDiffuseWeight * specularNormalization;
#endif

vec3 totalDiffuse = vec3( 0.0 );
vec3 totalSpecular = vec3( 0.0 );
#if NUM_DIR_LIGHTS > 0
	totalDiffuse += dirDiffuse;
	totalSpecular += dirSpecular;
#endif
	gl_FragColor.xyz = totalDiffuse;
}

