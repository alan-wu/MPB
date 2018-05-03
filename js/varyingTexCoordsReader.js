
PJP.VaryingTexCoordsReader = function(sceneIn) {
	
	var _this = this;
	var finishCallbackFunction = undefined;
	var bufferGeometry = undefined;
	var zincGeometry = undefined;
	var numberOfInputs = 0;
	var completedInputs = 0;
	var scene = sceneIn;
	var currentMap = undefined;
	var textureLoader = new THREE.TextureLoader();
	var texture = new textureLoader.load( 'models/organsViewerModels/digestive/stomach/nerve_map/texture/ratstomach_innervation_square.png' );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.format = THREE.RGBFormat;
	
	var shadersUniforms = THREE.UniformsUtils.merge( [
	  {
		ambient  : { type: "c", value: new THREE.Color( 0x000000 ) },
		diffuse  : { type: "c", value: new THREE.Color( 0xffffff ) },
		emissive : { type: "c", value: new THREE.Color( 0xbbbbbb ) },
		specular : { type: "c", value: new THREE.Color( 0x111111 ) },
		shininess: { type: "f", value: 100 },
		opacity: { type: "f", value: 1.0 },
		ambientLightColor: { type: "c", value: new THREE.Color( 0xF0F0F0 ) },
		directionalLightColor: { type: "c", value: new THREE.Color( 0x555555) },
		directionalLightDirection: { type: "v3", value: new THREE.Vector3()  },
		offsetRepeat: { value: new THREE.Vector4( 0, 0, 1, 1 ) },
		time: { type: "f", value: 0.0 },
		slide_pos: { type: "f", value: 1.0 },
		myTex:  { value: texture  }
	} ] );

	var addGeometryIntoBufferGeometry = function(order, geometry)
	{
		var arrayLength = geometry.faces.length * 3 * 3;
		var positions = new Float32Array( arrayLength );
		var colors = new Float32Array( arrayLength );
		var normals = new Float32Array( arrayLength );
		var texCoords = new Float32Array( geometry.faces.length * 3 * 2 );
		if (bufferGeometry === undefined)
			bufferGeometry = new THREE.BufferGeometry();
		
		geometry.faces.forEach( function ( face, index ) {
			positions[ index * 9 + 0 ] = geometry.vertices[ face.a ].x;
			positions[ index * 9 + 1 ] = geometry.vertices[ face.a ].y;
			positions[ index * 9 + 2 ] = geometry.vertices[ face.a ].z;
			positions[ index * 9 + 3 ] = geometry.vertices[ face.b ].x;
			positions[ index * 9 + 4 ] = geometry.vertices[ face.b ].y;
			positions[ index * 9 + 5 ] = geometry.vertices[ face.b ].z;
			positions[ index * 9 + 6 ] = geometry.vertices[ face.c ].x;
			positions[ index * 9 + 7 ] = geometry.vertices[ face.c ].y;
			positions[ index * 9 + 8 ] = geometry.vertices[ face.c ].z;
		
			normals[ index * 9 + 0 ] = face.vertexNormals[0].x;
			normals[ index * 9 + 1 ] = face.vertexNormals[0].y;
			normals[ index * 9 + 2 ] = face.vertexNormals[0].z;
			normals[ index * 9 + 3 ] = face.vertexNormals[1].x;
			normals[ index * 9 + 4 ] = face.vertexNormals[1].y;
			normals[ index * 9 + 5 ] = face.vertexNormals[1].z;
			normals[ index * 9 + 6 ] = face.vertexNormals[2].x;
			normals[ index * 9 + 7 ] = face.vertexNormals[2].y;
			normals[ index * 9 + 8 ] = face.vertexNormals[2].z;
			
			texCoords[ index * 6 + 0] = geometry.faceVertexUvs[ 0 ][index][0].x;
			texCoords[ index * 6 + 1] = geometry.faceVertexUvs[ 0 ][index][0].y;
			texCoords[ index * 6 + 2] = geometry.faceVertexUvs[ 0 ][index][1].x;
			texCoords[ index * 6 + 3] = geometry.faceVertexUvs[ 0 ][index][1].y;
			texCoords[ index * 6 + 4] = geometry.faceVertexUvs[ 0 ][index][2].x;
			texCoords[ index * 6 + 5] = geometry.faceVertexUvs[ 0 ][index][2].y;
		} );
		
		
		if (order == 0) {
			bufferGeometry.addAttribute( "position", new THREE.BufferAttribute( positions, 3) );
			bufferGeometry.addAttribute( "normal", new THREE.BufferAttribute( normals, 3 ) );
			bufferGeometry.addAttribute( "uv", new THREE.BufferAttribute( texCoords, 2 ) );
		} else {
			var positionStr = "position_" + order;
			var normalStr = "normal_" + order;
			var uvsStr = "uv_" + order;
			bufferGeometry.addAttribute( positionStr, new THREE.BufferAttribute( positions, 3) );
			bufferGeometry.addAttribute( normalStr, new THREE.BufferAttribute( normals, 3 ) );
			bufferGeometry.addAttribute( uvsStr, new THREE.BufferAttribute( texCoords, 2 ) );
		}

	}
	
	var meshReady = function(bufferGeometryIn, shaderText, material){
		console.log(shadersUniforms);
		
		var shaderMaterial = new THREE.RawShaderMaterial( {
			vertexShader: shaderText[0],
			fragmentShader: shaderText[1],
			uniforms: shadersUniforms
		} );
		shaderMaterial.side = THREE.DoubleSide;
		shaderMaterial.depthTest = true;
		shaderMaterial.needsUpdate = true;
		shaderMaterial.uniforms.myTex.value.needsUpdate = true;
		material.opacity = 1.0;
		zincGeometry = scene.addZincGeometry(bufferGeometryIn, 30001, undefined, undefined, false, false, true, undefined, shaderMaterial);
		zincGeometry.groupName = "varyingTexture";
	}
	
	var myLoader = function(order, shaderText) {
	    return function(geometry, materials){
	    	var material = 0;
	    	addGeometryIntoBufferGeometry(order, geometry);
	    	completedInputs++;
	    	if (completedInputs == numberOfInputs) {
	    		meshReady(bufferGeometry, shaderText, material);
	    		if (finishCallbackFunction != undefined && (typeof finishCallbackFunction == 'function'))
	    			finishCallbackFunction(bufferGeometry);
	    	}
	    }
	}
	
	this.setSliderPos = function(pos) {
		if (zincGeometry)
			zincGeometry.morph.material.uniforms.slide_pos.value = pos;
	}
	
	this.setTime = function(time) {
		if (zincGeometry)
			zincGeometry.morph.material.uniforms.time.value = time;
	}
	
	this.setTexture = function(textureIn) {
		if (zincGeometry) {
			zincGeometry.morph.material.uniforms.myTex.value = textureIn;
			zincGeometry.morph.material.uniforms.myTex.value.needsUpdate = true;
		}
	}
	
	this.loadURLsIntoBufferGeometry = function(urls, finishCallback, progressCallback, errorCallback) {
		var loader = new THREE.JSONLoader( true );
	    numberOfInputs = urls.length;
	    finishCallbackFunction = finishCallback;
		Zinc.loadExternalFiles(['shaders/varyingTexture.vs', 'shaders/varyingTexture.fs'], function (shaderText) {
		    for (var i = 0; i < numberOfInputs; i++)
		    	loader.load( urls[i], myLoader(i, shaderText), progressCallback, errorCallback);
		}, function (url) {
	  		alert('Failed to download "' + url + '"');
		});
	}
}
