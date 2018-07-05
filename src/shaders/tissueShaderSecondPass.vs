varying vec3 worldSpaceCoords;
varying vec4 projectedCoords;
uniform float min_x;
uniform float max_x;
uniform float min_y;
uniform float max_y;
uniform float min_z;
uniform float max_z;

void main()
{
	vec3 originalCoords = position + vec3(0.5, 0.5,0.5);
	if (originalCoords.x > max_x)
	{
		originalCoords.x = max_x;
	}
	if (originalCoords.x < min_x)
	{
		originalCoords.x = min_x;
	}
	if (originalCoords.y > max_y)
	{
		originalCoords.y = max_y;
	}
	if (originalCoords.y < min_y)				
	{
		originalCoords.y = min_y;
	}	
	if (originalCoords.z > max_z)
	{
		originalCoords.z = max_z;
	}
	if (originalCoords.z < min_z)
	{
		originalCoords.z = min_z;
	}		

	worldSpaceCoords = (modelMatrix * vec4(originalCoords, 1.0 )).xyz;
	gl_Position = projectionMatrix *  modelViewMatrix * vec4((originalCoords - vec3(0.5, 0.5, 0.5)), 1.0 );
	projectedCoords =  projectionMatrix * modelViewMatrix * vec4((originalCoords - vec3(0.5, 0.5, 0.5)), 1.0 );
}
