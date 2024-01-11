import * as THREE from "three";

const generateNum = 7;
const generateRange = 2000;
const sphereScale = 70;
const sphereElevation = 60;

export function SphereCountryCreate(scene){
    for(let i=0; i<generateNum; i++){
        const x = Math.random()*generateRange-generateRange*0.5;
        const z = Math.random()*generateRange-generateRange*0.5;
        const position = new THREE.Vector3(x,sphereElevation,z);

        const geometry = new THREE.SphereGeometry(sphereScale,sphereScale,sphereScale);
        const material = new THREE.MeshBasicMaterial();
        material.color.setHSL(0,0,1);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(position.x,position.y,position.z);
        sphere.position.y += sphereElevation;
        //sphere.layers.set(1);
        //scene.add(sphere);
    }
}