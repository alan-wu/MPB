varying vec3 worldSpaceCoords;
uniform float min_x;
uniform float max_x;
uniform float min_y;
uniform float max_y;
uniform float min_z;
uniform float max_z;

void main()
{
	worldSpaceCoords = position + vec3(0.5, 0.5, 0.5); //move it from [-0.5;0.5] to [0,1]
	if (worldSpaceCoords.x > max_x)
	{
		worldSpaceCoords.x = max_x;
	}
	if (worldSpaceCoords.x < min_x)
	{
		worldSpaceCoords.x = min_x;
	}
	
	if (worldSpaceCoords.y > max_y)
	{
		worldSpaceCoords.y = max_y;
	}
	if (worldSpaceCoords.y < min_y)				
	{
		worldSpaceCoords.y = min_y;
	}
	
	if (worldSpaceCoords.z > max_z)
	{
		worldSpaceCoords.z = max_z;
	}
	if (worldSpaceCoords.z < min_z)
	{
		worldSpaceCoords.z = min_z;
	}		
			
	//Set the world space coordinates of the back faces vertices as output.
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( (worldSpaceCoords - vec3(0.5, 0.5, 0.5)), 1.0 );
}
