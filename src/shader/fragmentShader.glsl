precision mediump float;

uniform samplerCube cubeMap;

varying vec2 vUv;
varying float vITime;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBinormal;
varying vec3 vLightDir;
varying vec3 vEye;

#define F0 0.02

void main() {
    vec4 col = vec4(0.05, 0.06, 0.12, 1.0);

    vec3 reflDir = reflect(-vEye,vNormal);
    vec4 reflectedColor = textureCube(cubeMap,reflDir)*2.5;

    //フレネル反射
    float vdotn = dot(vEye,vNormal);
    float fresnel = F0 + (1.-F0) * pow(1.-vdotn,5.);
    col.b *= fresnel * 0.04;
    col.g *= fresnel * 0.1;
    col.r *= fresnel * 0.1;

    vec4 diffuseCol = mix(vec4(0.01,0.01,0.01,1.),vec4(0.15, 0.19, 0.43, 1.0),vec4(max(0.,dot(vNormal,vLightDir)*1.0+0.0)));
    col = col * diffuseCol + reflectedColor;

    //col = vec4(texture2D(waveMap,vUv).rgb,1.);
    //col = vec4(vNormal,1.);
    //col.a = 0.;

    gl_FragColor = col;
}