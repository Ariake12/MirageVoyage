import * as THREE from "three";
import {SphereCountryCreate} from "./sphereCountrySystem.js";
import { getBloomTarget } from "./effect.js";

let centerSphere;

const centerSphereScale = 700;
const centerSphereElevation = 700;

export function LEDPoolFloatingLightCreate(system){
    const geometry = new THREE.SphereGeometry(centerSphereScale, centerSphereScale, centerSphereScale);
    const material = new THREE.MeshBasicMaterial();
    material.color.setHSL(0,0,1);
    centerSphere = new THREE.Mesh(geometry, material);
    centerSphere.position.y += centerSphereElevation;
    //getBloomTarget(centerSphere);
    cameraToSphere(centerSphere);
    system.add(centerSphere);

    const sphereCountrySystem = new THREE.Object3D();
    SphereCountryCreate(sphereCountrySystem);
    system.add(sphereCountrySystem);
}

export function cameraToSphere(camera){
    camera.lookAt(centerSphere.position);
}