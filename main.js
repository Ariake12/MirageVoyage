import * as THREE from "three";
import {objectsCreate} from "./system.js";
import {loop} from "./system.js";
import {shaderAnimate} from "./system.js"
import {PickHelper} from "./pick.js"
import { cameraToSphere } from "./ledPoolFloatingLightSystem.js";
import {BloomInit} from "./effect.js";
import {BloomRender} from "./effect.js";
import { humanRotate } from "./system.js";

let mousePosX1 = 0.0;
let mousePosX2 = 0.0;
let saveTime = 1.0;
let touchTime = 1.0;

const controllRadius = 1500;
let radSpeed = 0.0;
let theta = 0.0;
let isMouseTouch = false;

const clock = new THREE.Clock();

// サイズを指定
const width = window.innerWidth;
const height = window.innerHeight;

// レンダラーを作成
const canvasElement = document.querySelector('#maincanvas');
const renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);

// シーンを作成
const scene = new THREE.Scene();
const objects = [];

// カメラを作成
const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000);
camera.position.set(0, 200, controllRadius);
const eyeDir = new THREE.Vector3();
camera.getWorldDirection(eyeDir);

//ライトを作成
const directionalLight = new THREE.DirectionalLight(new THREE.Color(0.0,0.0,0.0),);
directionalLight.position.set(0.3,1,0.8);
const lightDir = directionalLight.position.clone().normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(new THREE.Color(0.0,0.0,0.0),0); 
scene.add(ambientLight);

//オブジェクトの設定
objectsCreate(scene,objects);
BloomInit(renderer,scene,camera);

//resize初期化
onResize();
window.addEventListener("resize",onResize);

const pickPosition = {x: 0, y: 0};
clearPickPosition();
const pickHelper = new PickHelper();

render();

// 毎フレーム時に実行されるループイベント
function render(time) {
    requestAnimationFrame(render);

    shaderAnimate(renderer,scene);

    time*=0.001;
    loop(time,lightDir,eyeDir);

    mouseVelocity();

    cameraRot();
    cameraToSphere(camera);
    humanRotate(camera,theta);

    pickHelper.pick(pickPosition,objects[0],camera);

    //BloomRender();
    renderer.render(scene, camera); // レンダリング
}

function onResize(){
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width,height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function getCanvasRelativePosition(event) {
    const rect = canvasElement.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * canvasElement.width  / rect.width,
        y: (event.clientY - rect.top ) * canvasElement.height / rect.height,
    };
}

function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvasElement.width ) * 2 - 1;
    pickPosition.y = (pos.y / canvasElement.height) * -2 + 1;  
}

function clearPickPosition() {
    pickPosition.x = -100000;
    pickPosition.y = -100000;
}

function mouseDown(){
    isMouseTouch = true;
}

function mouseUp(){
    isMouseTouch = false;
}

window.addEventListener('mouseup',mouseUp);
window.addEventListener('mousedown',mouseDown);
window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);

function cameraRot(){
    theta += radSpeed*0.1;

    camera.position.x = controllRadius*Math.cos(theta);
    camera.position.z = controllRadius*Math.sin(theta);
}

function mouseVelocity(){
    if(isMouseTouch){
        mousePosX1 = pickPosition.x;
        let mousePosDiff = mousePosX1 - mousePosX2;
        mousePosX2 = mousePosX1;
        touchTime = clock.getElapsedTime()-saveTime;
        radSpeed = mousePosDiff/touchTime;
        saveTime = clock.getElapsedTime();
    }
}