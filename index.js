console.log(THREE)

var Colors = {
  red:0xf25346,
  white:0xd8d0d1,
  brown:0x59332e,
  pink:0xF5986E,
  brownDark:0x23190f,
  blue:0x68c3c0,
};

window.addEventListener('load', init, false);

var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;

 
function init() {

    createScene();
 
    createLights();

    createPlane();
    createSea();
    createSky();

    document.addEventListener('mousemove', handleMouseMove, false);
 
    loop();
}

var mousePos={x:0, y:0};
 
 
function handleMouseMove(event) {
 
    // here we are converting the mouse position value received 
    // to a normalized value varying between -1 and 1;
    // this is the formula for the horizontal axis:
     
    var tx = -1 + (event.clientX / WIDTH)*2;
 
    // for the vertical axis, we need to inverse the formula 
    // because the 2D y-axis goes the opposite direction of the 3D y-axis
     
    var ty = 1 - (event.clientY / HEIGHT)*2;
    mousePos = {x:tx, y:ty};
 
}


function createScene() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;


  scene = new THREE.Scene();

  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
   
  // Create the camera
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,  // 视角的角度
    aspectRatio,  // 宽高比
    nearPlane,   // 近点距离
    farPlane    // 远点距离
  );
   
  // 相机位置
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;
   
  // Create the renderer
  renderer = new THREE.WebGLRenderer({ 

    alpha: true,  // 画布包含透明缓冲

    antialias: true // 抗锯齿 
  });

  console.log(renderer)

  // 设置画布尺寸
  renderer.setSize(WIDTH, HEIGHT);
   
  // 阴影贴图
  renderer.shadowMap.enabled = true;
   

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);
   

  window.addEventListener('resize', handleWindowResize, false);

} 

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

var hemisphereLight, shadowLight;
 
function createLights() {
    // 模拟太阳光
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9) // 第一个参数为天空颜色，第二个背景色
     
    // 平行光
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
 
    // Set the direction of the light  
    shadowLight.position.set(150, 350, 350);
     
    // 产生动态阴影
    shadowLight.castShadow = true;
 
    // define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
 
    // 光线范围
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
     
    // 添加光线到场景
    scene.add(hemisphereLight);  
    scene.add(shadowLight);
}

// Sea类
Sea = function(){
     
  // 创建一个圆柱体作为海
  // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  var geom = new THREE.CylinderGeometry(600,600,800,40,10);
   
  // rotate the geometry on the x axis
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
   
  // create the material 
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.blue,
    transparent:true,
    opacity:.6,
    flatShading:THREE.FlatShading,
  });

  // 初始化mesh
  this.mesh = new THREE.Mesh(geom, mat);

  // Allow the sea to receive shadows
  this.mesh.receiveShadow = true; 
}

// Instantiate the sea and add it to the scene:

var sea;

function createSea(){
  sea = new Sea();

  // push it a little bit at the bottom of the scene
  sea.mesh.position.y = -600;

  // add the mesh of the sea to the scene
  scene.add(sea.mesh);
}

// Cloud类
Cloud = function(){
  // 创建一个空的容器来装不同的云
  this.mesh = new THREE.Object3D();
   
  // 定义小方块
  var geom = new THREE.BoxGeometry(20,20,20);
   
  // 材质
  var mat = new THREE.MeshPhongMaterial({
      color:Colors.white,  
  });
   
  // 随机组合方块作为云
  var nBlocs = 3+Math.floor(Math.random()*3);
  for (var i=0; i<nBlocs; i++ ){
       
      // create the mesh by cloning the geometry
      var m = new THREE.Mesh(geom, mat); 
       
      // set the position and the rotation of each cube randomly
      m.position.x = i*15;
      m.position.y = Math.random()*10;
      m.position.z = Math.random()*10;
      m.rotation.z = Math.random()*Math.PI*2;
      m.rotation.y = Math.random()*Math.PI*2;
       
      // set the size of the cube randomly
      var s = .1 + Math.random()*.9;
      m.scale.set(s,s,s);
       
      // allow each cube to cast and to receive shadows
      m.castShadow = true;
      m.receiveShadow = true;
       
      // add the cube to the container we first created
      this.mesh.add(m);
  } 
}

// Sky类
Sky = function(){
  // 空容器
  this.mesh = new THREE.Object3D();
   
  // 云朵数
  this.nClouds = 40;
   
  // To distribute the clouds consistently,
  // we need to place them according to a uniform angle
  var stepAngle = Math.PI*2 / this.nClouds;
   
  // create the clouds
  for(var i=0; i<this.nClouds; i++){
      var c = new Cloud();
    
      var a = stepAngle*i; // 云朵位置角度
      var h = 750 + Math.random()*200; // 随机一个云朵高度

      // 算出云朵位置
      c.mesh.position.y = Math.sin(a)*h;
      c.mesh.position.x = Math.cos(a)*h;

      // 旋转云朵本身
      c.mesh.rotation.z = a + Math.PI/2;

      // 随机云朵的远近
      c.mesh.position.z = -400-Math.random()*400;
       
      // 随即放大缩小云朵
      var s = 1+Math.random()*2;
      c.mesh.scale.set(s,s,s);

      // 将云朵添加到天空实例
      this.mesh.add(c.mesh);  
  }  
}

var sky;

// 实例化天空
function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -600;
  scene.add(sky.mesh);
}

var AirPlane = function() {
     
  this.mesh = new THREE.Object3D();
   
  // 机身
  var geomCockpit = new THREE.BoxGeometry(60,50,50,1,1,1);
  var matCockpit = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:THREE.FlatShading});
  var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
  cockpit.castShadow = true;
  cockpit.receiveShadow = true;
  this.mesh.add(cockpit);
   
  // 引擎
  var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
  var matEngine = new THREE.MeshPhongMaterial({color:Colors.white, flatShading:THREE.FlatShading});
  var engine = new THREE.Mesh(geomEngine, matEngine);
  engine.position.x = 40;
  engine.castShadow = true;
  engine.receiveShadow = true;
  this.mesh.add(engine);
   
  // 尾翼
  var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
  var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:THREE.FlatShading});
  var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
  tailPlane.position.set(-35,25,0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
  this.mesh.add(tailPlane);
   
  // 机翼
  var geomSideWing = new THREE.BoxGeometry(40,8,150,1,1,1);
  var matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:THREE.FlatShading});
  var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  this.mesh.add(sideWing);
   
  // 螺旋桨
  var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
  var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, flatShading:THREE.FlatShading});
  this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
  this.propeller.castShadow = true;
  this.propeller.receiveShadow = true;
   
  // 螺旋桨翼片
  var geomBlade = new THREE.BoxGeometry(1,100,20,1,1,1);
  var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, flatShading:THREE.FlatShading});
   
  var blade = new THREE.Mesh(geomBlade, matBlade);
  blade.position.set(8,0,0);
  blade.castShadow = true;
  blade.receiveShadow = true;
  this.propeller.add(blade);
  this.propeller.position.set(50,0,0);
  this.mesh.add(this.propeller);
};

var airplane;
 
function createPlane(){ 
    airplane = new AirPlane();
    airplane.mesh.scale.set(.25,.25,.25);
    airplane.mesh.position.y = 100;
    scene.add(airplane.mesh);
}

function loop(){
  // 更新场景位置
  airplane.propeller.rotation.x += 0.3;
  sea.mesh.rotation.z += .005;
  sky.mesh.rotation.z += .01;

  updatePlane();

  renderer.render(scene, camera);

  // 动画循环
  requestAnimationFrame(loop);
}

function updatePlane(){
 
  // 获取鼠标位置，并将目标位置进行限制
  var targetX = normalize(mousePos.x, -1, 1, -100, 100);
  var targetY = normalize(mousePos.y, -1, 1, 25, 175);

  // 更新飞机位置
  airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1;
  airplane.mesh.position.x += (targetX - airplane.mesh.position.x) * 0.1;
  airplane.propeller.rotation.x += 0.3;
}

function normalize(v,vmin,vmax,tmin, tmax){

  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;

}

renderer.render(scene, camera);

init();

