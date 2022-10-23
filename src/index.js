import {Scene, PMREMGenerator, FloatType, TextureLoader, Color, Mesh, SphereGeometry, MeshPhysicalMaterial, ACESFilmicToneMapping, sRGBEncoding, PCFSoftShadowMap, DirectionalLight, PerspectiveCamera, WebGLRenderer} from "https://cdn.skypack.dev/three@0.137";

import {RGBELoader} from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader";
const scene = new Scene();

const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0,0,50);

const renderer = new WebGLRenderer({antialias: true, alpha: true});
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);


const sunLight = new DirectionalLight(new Color("#FFFFFF"), 3.5);
sunLight.position.set(5,1,10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.right = 10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.camera.top = 10;
scene.add(sunLight);


(async function(){
    let pmrem = new PMREMGenerator(renderer);
    let envmapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("assets/moonless_golf_2k.hdr"); //thanks to https://polyhaven.com/all?a=Greg%20Zaal
    let envMap = pmrem.fromEquirectangular(envmapTexture).texture;
    let textures = {
        // thanks to https://free3d.com/user/ali_alkendi
        bump: await new TextureLoader().loadAsync("assets/earthbump.jpg"),
        map: await new TextureLoader().loadAsync("assets/earthmap.jpg"),
        spec: await new TextureLoader().loadAsync("assets/earthspec.jpg"),
    }
    let sphere = new Mesh(
        new SphereGeometry(7,70,70),
        new MeshPhysicalMaterial({ 
            map: textures.map,
            roughnessMap: textures.spec,
            bumpMap: textures.bump,
            bumpScale: 0.05,
            envMap,
            envMapIntensity: 0.4,
            sheen: 1,
            sheenRoughness: 0.75,
            sheenColor: new Color("#ff8a00").convertSRGBToLinear(),
            clearcoat: 0.5,
        }),
    );
    sphere.position.y = -10;
    sphere.rotation.y +=Math.PI * 2;
    sphere.reciveShadow = true;
    scene.add(sphere);

    const updateSphere = (event) =>{
        sunLight.position.y = window.scrollY / 5  + 0.4;
        sphere.rotation.x = window.scrollY * 0.003;
        sphere.rotation.y = window.scrollY * 0.003;
        sphere.position.y = -10 + window.scrollY * 0.03;
    }
    
    window.addEventListener('scroll', updateSphere);

    renderer.setAnimationLoop(()=>{

        renderer.render(scene, camera);
    });
})();


//sideplan objects

$(document).scroll(function() {
    var y = $(this).scrollTop();
    if (y > 350) {
      $('.night-animation').fadeIn();
      $('.day-animation').fadeOut();

    } else {
      $('.night-animation').fadeOut();
      $('.day-animation').fadeIn();
    }
  });