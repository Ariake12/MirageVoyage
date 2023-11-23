import * as THREE from "three";
import {LEDPoolFloatingLightCreate} from "./ledPoolFloatingLightSystem.js";

const planeWidth = 1000;
const planeHeight = 1000;

const uniforms = {
    uv: {value: new THREE.Vector2},
    normal: {value: new THREE.Vector3},
    tangent: {value: new THREE.Vector3},
    binormal: {value: new THREE.Vector3},
    iTime: {value: 0},
    lightDir: {value: new THREE.Vector3},
    bumpMap: {value: null},
    eye: {value: THREE.Vector3},
    waveMap: {value: null},
    cubeMap: {value: null},
};
const uniforms2 = {
    tex1: {value: null},
    tex2: {value: null},
    resolution: {value: THREE.Vector2},
    touch: {value: new THREE.Vector2},
};
const uniforms3 = {
    tex: {value: null},
}

let plane;
let uvAttribute;
let normalAttribute;
let tangentAttribute;
let binormalAttribute;
let texture;
let uvAttribute2;
let uvAttribute3;
let cubeTexture;

let waterSystem;

let humanImage;

let humanRadius = 1000;

//renderTextureの設定
let renderTexture1 = new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight);
let renderTexture2 = new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight);
let renderTexture3 = new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight);

const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
camera2.position.set(0,0,1);

const shaderComputeScene = new THREE.Scene();

const blitScene = new THREE.Scene();

function loadShader(system){
    let vertexShader,fragmentShader;
    const loader = new THREE.FileLoader();
    loader.load("./shader/vertexShader.glsl",function(data){
        vertexShader = data;
        loader.load("./shader/fragmentShader.glsl",function(data){
            fragmentShader = data;

            //テクスチャの読み込み
            const loader2 = new THREE.TextureLoader();
            texture = loader2.load("./src/Noise_Normal.png");

            const geometry = new THREE.PlaneGeometry(10000,10000,planeWidth,planeHeight);
            geometry.computeTangents();
            const material = new THREE.RawShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: uniforms,
            });
            plane = new THREE.Mesh(geometry, material);
            plane.position.y -= 20;
            plane.rotation.x += -1.6;
            uvAttribute = plane.geometry.getAttribute("uv");
            normalAttribute = plane.geometry.getAttribute("normal");
            tangentAttribute = plane.geometry.attributes.tangent;
            binormalAttribute = plane.geometry.attributes.binormal;

            system.add(plane);
        });
    });

    let vertexShader2,fragmentShader2;
    const loader2 = new THREE.FileLoader();
    loader2.load("./shader/waveVert.glsl",function(data){
        vertexShader2 = data;
        loader2.load("./shader/waveFrag.glsl",function(data){
            fragmentShader2 = data;
            const geometry = new THREE.PlaneGeometry(2,2);
            const material = new THREE.ShaderMaterial({
                vertexShader: vertexShader2,
                fragmentShader: fragmentShader2,
                uniforms: uniforms2,
            });
            const fullscreenQuad = new THREE.Mesh(geometry, material);
            shaderComputeScene.add(fullscreenQuad);
        })
    })

    let vertexShader3,fragmentShader3;
    const loader3 = new THREE.FileLoader();
    loader3.load("./shader/blitVert.glsl",function(data){
        vertexShader3 = data;
        loader2.load("./shader/blitFrag.glsl",function(data){
            fragmentShader3 = data;
            const geometry = new THREE.PlaneGeometry(2,2);
            const material = new THREE.ShaderMaterial({
                vertexShader: vertexShader3,
                fragmentShader: fragmentShader3,
                uniforms: uniforms3,
            });
            const fullscreenQuad = new THREE.Mesh(geometry, material);
            blitScene.add(fullscreenQuad);
        })
    })
}

export function objectsCreate(scene,objects){
    //水面の追加
    waterSystem = new THREE.Object3D();
    scene.add(waterSystem);
    objects.push(waterSystem);

    loadShader(waterSystem);

    //LEDプールフローティングライトの追加
    const LEDPoolFloatingLightSystem = new THREE.Object3D();
    LEDPoolFloatingLightCreate(LEDPoolFloatingLightSystem);
    scene.add(LEDPoolFloatingLightSystem);
    objects.push(LEDPoolFloatingLightSystem);

    //人物の追加
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./src/Human.png');

    const humanSystem = new THREE.Object3D();
    const plane = new THREE.PlaneGeometry(400,400);
    const humanMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.5
    });
    humanImage = new THREE.Mesh(plane,humanMaterial);
    humanImage.position.y = 300;
    humanSystem.add(humanImage);
    scene.add(humanSystem);
    objects.push(humanSystem);

    //skyboxの追加
    cubeTexture = new THREE.CubeTextureLoader()
        .setPath("./src/skybox/")
        .load([
        "Left_Tex-1.png",
        "Right_Tex-1.png",
        "Up_Tex-1.png",
        "Down_Tex-1.png",
        "Front_Tex-1.png",
        "Back_Tex-1.png",
    ]);
    scene.background = cubeTexture;
    scene.backgroundIntensity = 0.15;
}

export  function loop(time,lightDir,eyeDir){
    uniforms.uv.value = uvAttribute;
    uniforms.normal.value = normalAttribute;
    uniforms.tangent.value = tangentAttribute;
    uniforms.binormal.value = binormalAttribute;
    uniforms.iTime.value = time;
    uniforms.lightDir.value = lightDir;
    uniforms.bumpMap.value = texture;
    uniforms.eye.value = eyeDir;
    uniforms.waveMap.value = renderTexture2.texture;
    uniforms.cubeMap.value = cubeTexture;
}

export function shaderAnimate(renderer){
    renderer.setClearColor(0xFFFFFF,1.0);
    //shaderの計算
    uniforms2.tex1.value = renderTexture2.texture;
    uniforms2.tex2.value = renderTexture3.texture;
    uniforms2.resolution.value = new THREE.Vector2(planeWidth,planeHeight);

    Blit(renderTexture2,renderTexture3,renderer);
    Blit(renderTexture1,renderTexture2,renderer);

    renderer.setRenderTarget(renderTexture1);
    renderer.render(shaderComputeScene, camera2);
    renderer.setRenderTarget(null);

    renderer.setClearColor(0x000000,1.0);
}

export function setXYUniforms(uvX,uvY){
    uniforms2.touch.value = new THREE.Vector2(uvX,uvY);
}

export function humanRotate(camera,theta){
    humanImage.lookAt(camera.position);

    humanImage.position.x = humanRadius*Math.cos(theta);
    humanImage.position.z = humanRadius*Math.sin(theta);
}

//renderTexture1のテクスチャ内容をそのままrenderTexture2にコピーする関数
function Blit(targetRenderTexture1,targetRenderTexture2,renderer){
    uniforms3.tex.value = targetRenderTexture1.texture;

    renderer.setClearColor(0x000000,1.0);

    renderer.setRenderTarget(targetRenderTexture2);
    renderer.render(blitScene, camera2);
    renderer.setRenderTarget(null);
}