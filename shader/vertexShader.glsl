uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec3 lightDir;
uniform sampler2D bumpMap;
uniform vec3 eye;
uniform sampler2D waveMap;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
attribute vec3 tangent;
attribute vec3 binormal;

uniform float iTime;

varying vec2 vUv;
varying float vITime;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBinormal;
varying vec3 vLightDir;
varying vec3 vEye;

float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float noise(vec2 x) {
	vec2 i = floor(x);
	vec2 f = fract(x);

	float a = hash(i);
	float b = hash(i + vec2(1.0, 0.0));
	float c = hash(i + vec2(0.0, 1.0));
	float d = hash(i + vec2(1.0, 1.0));

	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5
float fbm(vec2 x) {
	float v = 0.0;
	float a = 0.5;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

void main(){
    vec3 posT = position + tangent;
    vec3 posB = position + normalize(cross(normal,tangent));

    float h = fbm(vec2(iTime*0.2,0)+uv*10.)*150.;
    h += sin(uv.x*6.+iTime*0.4)*25.;
    h += sin(uv.x*6.-iTime*0.4)*25.;

    float hN = fbm(vec2(iTime*0.2,0)+uv*50.);
    float hT = fbm(vec2(iTime*0.2+posT.x,posT.y)+uv*50.);
    float hB = fbm(vec2(iTime*0.2+posB.x,posB.y)+uv*50.);

    vec3 pos = position + vec3(0,0,h);
    vec3 posN = position + vec3(0,0,hN);
    posT += vec3(0,0,hT);
    posB += vec3(0,0,hB);

    vec3 modifiedTangent = posT - posN;
    vec3 modifiedBinormal = posB - posN;

    //vec3 normal2 = normalize(cross(modifiedTangent,modifiedBinormal));
    vec3 normal2 = texture2D( bumpMap, mod(uv*4. +vec2(iTime*0.01,0.),1.)).rgb;
    normal2 = modifiedTangent*normal2.r + modifiedBinormal*normal2.g + normal*normal2.b;

    float waveH = texture2D(waveMap,uv).r;
    pos.z += waveH*80.;
    vec4 vt = projectionMatrix * viewMatrix * modelMatrix * vec4(pos,1.0);

    vUv = uv;
    vITime = iTime;
    vNormal = normal2;
    vTangent = tangent;
    vBinormal = normalize(cross(normal,tangent));
    vLightDir = lightDir;
    vEye = eye;

    gl_Position = vt;
}