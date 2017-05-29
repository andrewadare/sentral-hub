var guides = ( function() {
  'use strict';

  assert && assert( THREE, 'three.js not loaded.' );

  var planarGrid = function( params ) {
    params = params || {};
    var size = params.size !== undefined ? params.size : 100;
    var scale = params.scale !== undefined ? params.scale : 0.1;
    var orientation = params.orientation !== undefined ? params.orientation : 'x';
    var grid = new THREE.Mesh(
      new THREE.PlaneGeometry( size, size, size * scale, size * scale ),
      new THREE.MeshBasicMaterial( { color: 0x555555, wireframe: true } )
    );
    // Yes, these are poorly labeled! It would be a mess to fix.
    // What's really going on here:
    // 'x' means "rotate 90 degrees around x", etc.
    // So 'x' really means "show a grid with a normal of Y"
    //    'y' means "show a grid with a normal of X"
    //    'z' means (logically enough) "show a grid with a normal of Z"
    if ( orientation === 'x' ) {
      grid.rotation.x = -Math.PI / 2;
    } else if ( orientation === 'y' ) {
      grid.rotation.y = -Math.PI / 2;
    } else if ( orientation === 'z' ) {
      grid.rotation.z = -Math.PI / 2;
    }
    return grid;
  };

  var axes = function( params ) {
    params = params || {};
    var axisRadius = params.axisRadius !== undefined ? params.axisRadius : 0.04;
    var axisLength = params.axisLength !== undefined ? params.axisLength : 11;
    var axisTess = params.axisTess !== undefined ? params.axisTess : 48;

    var axisXMaterial = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );
    var axisYMaterial = new THREE.MeshLambertMaterial( { color: 0x00FF00 } );
    var axisZMaterial = new THREE.MeshLambertMaterial( { color: 0x0000FF } );
    axisXMaterial.side = THREE.DoubleSide;
    axisYMaterial.side = THREE.DoubleSide;
    axisZMaterial.side = THREE.DoubleSide;
    var axisX = new THREE.Mesh(
      new THREE.CylinderGeometry( axisRadius, axisRadius, axisLength, axisTess, 1, true ),
      axisXMaterial
    );
    var axisY = new THREE.Mesh(
      new THREE.CylinderGeometry( axisRadius, axisRadius, axisLength, axisTess, 1, true ),
      axisYMaterial
    );
    var axisZ = new THREE.Mesh(
      new THREE.CylinderGeometry( axisRadius, axisRadius, axisLength, axisTess, 1, true ),
      axisZMaterial
    );
    axisX.rotation.z = -Math.PI / 2;
    axisX.position.x = axisLength / 2 - 1;
    axisY.position.y = axisLength / 2 - 1;
    axisZ.rotation.y = -Math.PI / 2;
    axisZ.rotation.z = -Math.PI / 2;
    axisZ.position.z = axisLength / 2 - 1;

    var arrowX = new THREE.Mesh(
      new THREE.CylinderGeometry( 0, 4 * axisRadius, 4 * axisRadius, axisTess, 1, true ),
      axisXMaterial
    );
    var arrowY = new THREE.Mesh(
      new THREE.CylinderGeometry( 0, 4 * axisRadius, 4 * axisRadius, axisTess, 1, true ),
      axisYMaterial
    );
    var arrowZ = new THREE.Mesh(
      new THREE.CylinderGeometry( 0, 4 * axisRadius, 4 * axisRadius, axisTess, 1, true ),
      axisZMaterial
    );
    arrowX.rotation.z = -Math.PI / 2;
    arrowX.position.x = axisLength - 1 + axisRadius * 4 / 2;

    arrowY.position.y = axisLength - 1 + axisRadius * 4 / 2;

    arrowZ.rotation.z = -Math.PI / 2;
    arrowZ.rotation.y = -Math.PI / 2;
    arrowZ.position.z = axisLength - 1 + axisRadius * 4 / 2;

    return [ axisX, axisY, axisZ, arrowX, arrowY, arrowZ ];
  };

  return {
    grid: planarGrid,
    axes: axes
  }
} )();
