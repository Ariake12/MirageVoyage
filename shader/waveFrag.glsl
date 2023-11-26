precision highp float;

uniform sampler2D tex1;
uniform sampler2D tex2;
uniform vec2 resolution;
uniform vec2 touch;

varying vec2 vUv;

#define waveSpeed 0.68
#define touchScale 0.003
#define Attenuation 0.994

void main(){
    vec2 stride = 1./resolution;

    float u = 0.0;
    float d = length(vUv-touch);
    if(d<touchScale){
        u = 1.;
    }
    else{
        //vec2 u;
        /*u = (2.*texture2D(tex1,vUv).r +
        waveSpeed*waveSpeed*(
            texture2D(tex1,vUv-vec2(stride.x,0.)).r+
            texture2D(tex1,vUv+vec2(stride.x,0.)).r+
            texture2D(tex1,vUv-vec2(0.,stride.y)).r+
            texture2D(tex1,vUv+vec2(0.,stride.y)).r-
            4.*texture2D(tex1,vUv).r
        )-texture2D(tex2,vUv).r) * Attenuation;*/

        u = 2.*texture2D(tex1,vUv).r;
    }
    gl_FragColor = vec4(vec3(u),1.);
}