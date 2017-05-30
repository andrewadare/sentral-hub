( function() {
  'use strict';

  assert && assert( THREE, 'three.js not loaded.' );
  assert && assert( guides, 'guides module not loaded.' );

  // Module globals
  var ws, scene, camera, renderer, controls, box, arrow;
  var accelDirection;
  var chipRotation = new THREE.Vector3();

  init();
  animate();

  function init() {
    // WebSocket client
    ws = new WebSocket( 'ws://' + window.location.host );

    // Scene
    scene = new THREE.Scene();

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // IMU chip
    var boxGeom = new THREE.BoxGeometry( 2, 2, 0.5 ); // width, height, depth
    var boxMaterial = new THREE.MeshLambertMaterial( { color: 0x7f7f7f } );
    box = new THREE.Mesh( boxGeom, boxMaterial );
    box.position.set( 2, 2, 1 );

    // Acceleration arrow: direction, origin, length, color
    accelDirection = new THREE.Vector3( 1, 1, 0 ).normalize();
    arrow = new THREE.ArrowHelper( accelDirection, new THREE.Vector3(), 1 );
    scene.add( arrow );

    // Camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set( box.position.x, -5, 8 );
    camera.lookAt( box.position.x, box.position.y, box.position.z );
    scene.add( box );

    // Text label on chip
    var fontLoader = new THREE.FontLoader();
    fontLoader.load( 'js/lib/helvetiker_regular.typeface.json', function( response ) {
      var textMaterial = new THREE.MeshPhongMaterial( { color: 0xdddddd } );
      var textGeom = new THREE.TextGeometry( 'EM7180', {
        font: response,
        size: 0.25,
        height: 0.01,
        curveSegments: 4,
        bevelThickness: 0.005,
        bevelSize: 0.005,
        bevelEnabled: true
      } );
      var textMesh = new THREE.Mesh( textGeom, textMaterial );
      textMesh.position.set( -boxGeom.parameters.width / 4,
        boxGeom.parameters.height / 4,
        boxGeom.parameters.depth / 2 + 0.001 );
      box.add( textMesh );
      render();
    } );

    // HORIZONTAL GRID
    scene.add( guides.grid( { size: 100, scale: 1, orientation: 'z' } ) );

    // Axis guides: r,g,b = x,y,z
    var axes = new THREE.AxisHelper( 10 );
    axes.position.set( 0, 0, 0.001 ); // prevent z-fighting
    scene.add( axes );
    box.add( new THREE.AxisHelper( 3 ) );

    // CAMERA TRACKBALL CONTROLS
    addControls();

    // LIGHTING
    scene.add( new THREE.AmbientLight( 0x444444 ) );
    var pointLight = new THREE.PointLight( 0xFFFFFF );
    pointLight.position.set( 5, 5, 10 );
    scene.add( pointLight );

    window.addEventListener( 'resize', onWindowResize, false );
    render();
  }

  // Camera position controller
  function addControls() {
    controls = new THREE.TrackballControls( camera );
    // controls.target.set( 0, 0, 0 );
    controls.target.set( box.position.x, box.position.y, box.position.z );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ];
    controls.addEventListener( 'change', render );
    controls.update();
  }

  function animate() {
    requestAnimationFrame( animate );
    controls.update();
  }

  function render() {
    renderer.render( scene, camera );
  }

  // Update box orientation from websocket message data
  function updateBox( data ) {
    var pitch = Math.PI / 180 * data.pitch;
    var roll = Math.PI / 180 * data.roll;
    var yaw = -Math.PI / 180 * data.yaw;
    box.rotation.set( pitch, roll, yaw );


    // Experimental - acceleration arrow
    // chipRotation.set(pitch, roll, yaw);
    // accelDirection.set( data.ax, data.ay, data.az ).normalize();
    // accelDirection.set( data.ay, data.ax, data.az )
    // var l = accelDirection.length();
    // accelDirection.sub(chipRotation).normalize();
    // arrow.setDirection( accelDirection );
    // arrow.setLength( l, 0.2 * l, 0.04 * l );
    render();
  }

  // Websocket onopen handler (page visit, reload)
  ws.onopen = function( event ) {
    ws.send( JSON.stringify( {
      type: 'update',
      text: 'ready',
      id: 0,
      date: Date.now()
    } ) );
  };

  // Websocket client message handler
  ws.onmessage = function( event ) {
    var msg = JSON.parse( event.data );

    // Add message-function pair objects to array as needed
    var handler = [ {
      type: 'imu',
      f: updateBox
    } ];

    handler.forEach( function( m ) {
      if ( m.type === msg.type ) {
        m.f( msg.data );
      }
    } );
  };

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.localClippingEnabled = true;
  }

} )();
