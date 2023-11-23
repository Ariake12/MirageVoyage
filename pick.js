import * as THREE from "three";
import { setXYUniforms } from "./system.js";

export class PickHelper {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, objects, camera) {
        this.raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObject = this.raycaster.intersectObject(objects);
        if (intersectedObject.length) {
            // pick the first object. It's the closest one
            this.pickedObject = intersectedObject[0];
            var uvX = this.pickedObject.uv.x;
            var uvY = this.pickedObject.uv.y;

            setXYUniforms(uvX,uvY);

            // これでuvXとuvYがタッチした位置の一意な座標となります
            //console.log("UV Coordinates:", uvX, uvY);
        }
        else{
            this.pickedObject = null
        }
    }
}