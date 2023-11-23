import * as THREE from "three";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

let effectComposer;

const bloomGroup = new THREE.Group();
const bloomScene = new THREE.Scene();

export function BloomInit(render,scene,camera){
    bloomScene.add(bloomGroup);

    effectComposer = new EffectComposer(render);
    effectComposer.addPass(
        new RenderPass(bloomScene,camera)
    );
    effectComposer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth,window.innerHeight),
        0.6, //Strength
        1.0, //Radius
        0.99, //Threshold
    ));

    //bloomを適応しない通常のcomposer
    /*const normalComposer = new EffectComposer(render);
    normalComposer.addPass(new RenderPass(scene, camera));*/

    render.setAnimationLoop(()=>{
        //effectComposer.render();
        //normalComposer.render();
    });
}

export function BloomRender(){
    
}

export function getBloomTarget(object){
    bloomGroup.add(object);
}