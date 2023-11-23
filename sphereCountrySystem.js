import * as THREE from "three";
import { getBloomTarget } from "./effect.js";

const positionList = [
    [-700,0,500],
    [-500,0,-100],
    [-1000,0,50],
    [300,0,500],
    [350,0,700],
    [1100,0,300]
];
const sphereScale = 70;
const sphereElevation = 60;

export function SphereCountryCreate(system){
    const count = positionList.length;
    for(let i=0; i<count; i++){
        const geometry = new THREE.SphereGeometry(sphereScale,sphereScale,sphereScale);
        const material = new THREE.MeshBasicMaterial();
        material.color.setHSL(0,0,1);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(positionList[i][0],positionList[i][1],positionList[i][2]);
        sphere.position.y += sphereElevation;
        //getBloomTarget(sphere);
        system.add(sphere);
    }
}