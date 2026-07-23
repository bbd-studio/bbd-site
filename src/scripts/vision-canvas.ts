import * as THREE from 'three';

const SNOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const SPHERE_VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
varying float vNoise;
varying vec3 vNormal;
varying vec3 vView;
${SNOISE}
void main(){
  vec3 dir=normalize(position);
  float n=snoise(dir*uFreq+uTime*0.12);
  float n2=snoise(dir*uFreq*2.6-uTime*0.09)*0.4;
  float d=(n+n2)*uAmp;
  vec3 p=position+normal*d;
  vNoise=n+n2;
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  vNormal=normalize(normalMatrix*normal);
  vView=normalize(-mv.xyz);
  gl_Position=projectionMatrix*mv;
}`;

const SPHERE_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
varying float vNoise;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  float fres=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),1.6);
  vec3 col=mix(uColorA,uColorB,smoothstep(-0.7,1.0,vNoise));
  col+=fres*0.4;
  gl_FragColor=vec4(col,uOpacity*(0.3+0.45*fres));
}`;

const POINTS_VERT = /* glsl */ `
uniform float uTime;
uniform float uSpread;
uniform float uSize;
attribute float aScale;
attribute float aSeed;
varying float vSeed;
void main(){
  vec3 p=position*uSpread;
  p.y+=sin(uTime*0.25+aSeed*6.2831)*0.18;
  p.x+=cos(uTime*0.18+aSeed*12.566)*0.12;
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_PointSize=uSize*aScale*(7.5/-mv.z);
  gl_Position=projectionMatrix*mv;
  vSeed=aSeed;
}`;

const POINTS_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
varying float vSeed;
void main(){
  vec2 uv=gl_PointCoord-0.5;
  float d=length(uv);
  float alpha=smoothstep(0.5,0.05,d);
  float flicker=0.6+0.4*sin(uTime*(0.6+vSeed)+vSeed*40.0);
  gl_FragColor=vec4(uColor,alpha*uOpacity*flicker);
}`;

type Stage = {
  colorA: THREE.Color;
  colorB: THREE.Color;
  bg: THREE.Color;
  amp: number;
  freq: number;
  spread: number;
  sphereOpacity: number;
  pointsOpacity: number;
  ringOpacity: number;
};

const STAGES: Stage[] = [
  {
    colorA: new THREE.Color('#ff7a3c'),
    colorB: new THREE.Color('#ff4d6d'),
    bg: new THREE.Color('#080404'),
    amp: 0.14,
    freq: 1.5,
    spread: 1,
    sphereOpacity: 0.55,
    pointsOpacity: 0.5,
    ringOpacity: 0,
  },
  {
    colorA: new THREE.Color('#6f7dff'),
    colorB: new THREE.Color('#b48cff'),
    bg: new THREE.Color('#04050d'),
    amp: 0.3,
    freq: 2.2,
    spread: 1.2,
    sphereOpacity: 0.5,
    pointsOpacity: 0.65,
    ringOpacity: 0.4,
  },
  {
    colorA: new THREE.Color('#ffcf8f'),
    colorB: new THREE.Color('#fff3e0'),
    bg: new THREE.Color('#0a0705'),
    amp: 0.42,
    freq: 2.9,
    spread: 1.9,
    sphereOpacity: 0.22,
    pointsOpacity: 0.9,
    ringOpacity: 0.22,
  },
];

function sampleStages(value: number): Stage {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  const segment = clamped < 0.5 ? 0 : 1;
  const local = segment === 0 ? clamped / 0.5 : (clamped - 0.5) / 0.5;
  const from = STAGES[segment];
  const to = STAGES[segment + 1];
  const eased = local * local * (3 - 2 * local);
  return {
    colorA: from.colorA.clone().lerp(to.colorA, eased),
    colorB: from.colorB.clone().lerp(to.colorB, eased),
    bg: from.bg.clone().lerp(to.bg, eased),
    amp: THREE.MathUtils.lerp(from.amp, to.amp, eased),
    freq: THREE.MathUtils.lerp(from.freq, to.freq, eased),
    spread: THREE.MathUtils.lerp(from.spread, to.spread, eased),
    sphereOpacity: THREE.MathUtils.lerp(from.sphereOpacity, to.sphereOpacity, eased),
    pointsOpacity: THREE.MathUtils.lerp(from.pointsOpacity, to.pointsOpacity, eased),
    ringOpacity: THREE.MathUtils.lerp(from.ringOpacity, to.ringOpacity, eased),
  };
}

export function mountVisionCanvas(canvas: HTMLCanvasElement) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch {
    canvas.hidden = true;
    return () => {};
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = STAGES[0].bg.clone();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4.6);

  const sphereUniforms = {
    uTime: { value: 0 },
    uAmp: { value: STAGES[0].amp },
    uFreq: { value: STAGES[0].freq },
    uColorA: { value: STAGES[0].colorA.clone() },
    uColorB: { value: STAGES[0].colorB.clone() },
    uOpacity: { value: STAGES[0].sphereOpacity },
  };
  const sphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.28, 22),
    new THREE.ShaderMaterial({
      vertexShader: SPHERE_VERT,
      fragmentShader: SPHERE_FRAG,
      uniforms: sphereUniforms,
      wireframe: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene.add(sphere);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 48, 48),
    new THREE.MeshBasicMaterial({
      color: STAGES[0].colorA.clone(),
      transparent: true,
      opacity: 0.04,
      depthWrite: false,
    }),
  );
  scene.add(glow);

  const count = 1400;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const seeds = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const radius = 2.1 + Math.pow(Math.random(), 0.7) * 2.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[index * 3 + 2] = radius * Math.cos(phi);
    scales[index] = 0.4 + Math.random() * 1.1;
    seeds[index] = Math.random();
  }
  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointsGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  pointsGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  const pointsUniforms = {
    uTime: { value: 0 },
    uSpread: { value: STAGES[0].spread },
    uSize: { value: 5 * Math.min(window.devicePixelRatio, 2) },
    uColor: { value: STAGES[0].colorB.clone() },
    uOpacity: { value: STAGES[0].pointsOpacity },
  };
  const points = new THREE.Points(
    pointsGeometry,
    new THREE.ShaderMaterial({
      vertexShader: POINTS_VERT,
      fragmentShader: POINTS_FRAG,
      uniforms: pointsUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene.add(points);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: STAGES[0].colorA.clone(),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.004, 8, 220), ringMaterial);
  ring1.rotation.x = Math.PI / 2.4;
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.95, 0.003, 8, 220),
    ringMaterial.clone(),
  );
  ring2.rotation.x = Math.PI / 1.9;
  ring2.rotation.y = 0.5;
  scene.add(ring1, ring2);

  const mouse = { x: 0, y: 0 };
  const onPointerMove = (event: PointerEvent) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    pointsUniforms.uSize.value = 5 * Math.min(window.devicePixelRatio, 2);
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  const clock = new THREE.Clock();
  let frame = 0;
  let progress = 0;
  const tick = () => {
    const time = clock.getElapsedTime();
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const target = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    progress += (target - progress) * (reduceMotion ? 1 : 0.06);
    const stage = sampleStages(progress);

    sphereUniforms.uTime.value = reduceMotion ? 0 : time;
    sphereUniforms.uAmp.value = stage.amp;
    sphereUniforms.uFreq.value = stage.freq;
    sphereUniforms.uColorA.value.copy(stage.colorA);
    sphereUniforms.uColorB.value.copy(stage.colorB);
    sphereUniforms.uOpacity.value = stage.sphereOpacity;
    pointsUniforms.uTime.value = reduceMotion ? 0 : time;
    pointsUniforms.uSpread.value = stage.spread;
    pointsUniforms.uColor.value.copy(stage.colorB);
    pointsUniforms.uOpacity.value = stage.pointsOpacity;

    (glow.material as THREE.MeshBasicMaterial).color.copy(stage.colorA);
    (glow.material as THREE.MeshBasicMaterial).opacity = 0.03 + progress * 0.03;
    ringMaterial.color.copy(stage.colorA);
    ringMaterial.opacity = stage.ringOpacity;
    (ring2.material as THREE.MeshBasicMaterial).color.copy(stage.colorB);
    (ring2.material as THREE.MeshBasicMaterial).opacity = stage.ringOpacity * 0.7;
    (scene.background as THREE.Color).copy(stage.bg);

    if (!reduceMotion) {
      sphere.rotation.y += 0.0016;
      points.rotation.y -= 0.0004;
      ring1.rotation.z += 0.0012;
      ring2.rotation.z -= 0.0009;
    }
    sphere.rotation.x = 0.15 + progress * 0.4;
    glow.rotation.copy(sphere.rotation);
    camera.position.z = 5 - progress * 0.8;
    camera.position.x += (mouse.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.25 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };
  tick();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    sphere.geometry.dispose();
    (sphere.material as THREE.Material).dispose();
    glow.geometry.dispose();
    (glow.material as THREE.Material).dispose();
    pointsGeometry.dispose();
    (points.material as THREE.Material).dispose();
    ring1.geometry.dispose();
    ringMaterial.dispose();
    ring2.geometry.dispose();
    (ring2.material as THREE.Material).dispose();
  };
}
