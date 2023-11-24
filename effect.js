import * as THREE from "three";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

let bloomGroup = new THREE.Group();

export function BloomInit(render,scene,camera){
    scene.add(bloomGroup);

    console.log(bloomGroup);

    const renderScene = new RenderPass(bloomGroup,camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth,window.innerHeight),
        1.0, //Strength
        1.0, //Radius
        0.8, //Threshold
    );

    const effectComposer = new EffectComposer(render);
    effectComposer.addPass(renderScene);
    effectComposer.addPass(bloomPass);

    return effectComposer;
}

export function getBloomTarget(object){
    bloomGroup.add(object);
}