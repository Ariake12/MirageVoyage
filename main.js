import * as THREE from "three";
import {objectsCreate} from "./system.js";
import {loop} from "./system.js";
import {shaderAnimate} from "./system.js"
import {PickHelper} from "./pick.js"
import { cameraToSphere } from "./ledPoolFloatingLightSystem.js";
import {BloomInit} from "./effect.js";
import { humanRotate } from "./system.js";

let mousePosX1 = 0.0;
let mousePosX2 = 0.0;
let saveTime = 1.0;
let touchTime = 1.0;

let isDraw = false;

const controllRadius = 1500;
let radSpeed = 0.0;
let theta = 0.0;
let isMouseTouch = false;

const clock = new THREE.Clock();

// レンダラーを作成
const canvasElement = document.querySelector('#mainCanvas');
const renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
    preserveDrawingBuffer: true,
    alpha: true, // 背景を透明にする
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClear = false; // レイヤーを有効化するときは自動クリアを無効化する

// シーンを作成
const scene = new THREE.Scene();

// カメラを作成
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 200, controllRadius);
const eyeDir = new THREE.Vector3();
camera.getWorldDirection(eyeDir);
scene.add(camera);

//ライトを作成
const directionalLight = new THREE.DirectionalLight(new THREE.Color(0.0,0.0,0.0),);
directionalLight.position.set(0.3,1,0.8);
const lightDir = directionalLight.position.clone().normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(new THREE.Color(0.0,0.0,0.0),0); 
scene.add(ambientLight);

//オブジェクトの設定
const sea = new THREE.Object3D();
scene.add(sea);
objectsCreate(scene,sea);
const effectComposer = BloomInit(renderer,scene,camera);

//resize初期化
onResize();
window.addEventListener("resize",onResize);

const pickPosition = {x: 0, y: 0};
clearPickPosition();
const pickHelper = new PickHelper();

//debug
if(isMobileDevice()==true || isInAppBrowser()==true){
    const s = new THREE.SphereGeometry(50,50,50);
    const m = new THREE.MeshBasicMaterial();
    m.color.setRGB(1,0,0);
    const me = new THREE.Mesh(s,m);
    scene.add(me);
}

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

    pickHelper.pick(pickPosition,sea,camera);

    if(isDraw){
        renderer.clear();
        //effectComposer.render(); // レンダリング
        renderer.clearDepth();
        renderer.render(scene, camera); // レンダリング
    }
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

function getCanvasRelativePositionTouch(event) {
    const rect = canvasElement.getBoundingClientRect();
    return {
        x: (event.touches[0].pageX - rect.left) * canvasElement.width  / rect.width,
        y: (event.touches[0].pageY - rect.top ) * canvasElement.height / rect.height,
    };
}

function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvasElement.width ) * 2 - 1;
    pickPosition.y = (pos.y / canvasElement.height) * -2 + 1;  
}

function setPickPositionTouch(event) {
    const pos = getCanvasRelativePositionTouch(event);
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

/*if(isMobileDevice()==true || isInAppBrowser()==true){
    window.addEventListener('touchend',mouseUp);
    window.addEventListener('touchstart',mouseDown);
    window.addEventListener('touchmove', setPickPositionTouch);
    window.addEventListener('touchend', clearPickPosition);
    window.addEventListener('touchend', clearPickPosition);
    console.log("スマホのイベント初期化が実行されました");
}*/
//else{
    window.addEventListener('mouseup',mouseUp);
    window.addEventListener('mousedown',mouseDown);
    window.addEventListener('mousemove', setPickPosition);
    window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);
    console.log("パソコンのイベント初期化が実行されました");
//}


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

window.onload = function() {
    console.log("webページを読み込み完了しました");
    isDraw = true;

    const spinner = document.getElementById('loading');
    spinner.classList.add('loaded');

    //document.querySelector('mainCanvas').style.display = 'block';
}

function isMobileDevice() {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

function isInAppBrowser() {
    if (navigator.userAgent.includes('FBAV')) {
        return true;
    }

    return false;
}