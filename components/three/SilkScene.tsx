"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/gsap";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;
  varying vec2 vUv;
  varying float vWave;
  varying vec3 vNormal2;

  // 3D simplex noise (Ashima / Ian McEwan)
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float height(vec2 p) {
    float t = uTime * 0.12;
    float n = snoise(vec3(p.x * 0.55 + t, p.y * 1.1 - t * 0.6, t)) * 0.55;
    n += snoise(vec3(p.x * 1.3 - t, p.y * 0.9, t * 1.4)) * 0.22;
    n += sin(p.x * 1.6 + p.y * 0.8 + uTime * 0.5) * 0.18;
    return n * (1.0 + uVelocity * 0.8);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    float h = height(pos.xy);
    pos.z += h;
    float e = 0.02;
    float hx = height(pos.xy + vec2(e, 0.0));
    float hy = height(pos.xy + vec2(0.0, e));
    vNormal2 = normalize(vec3(h - hx, h - hy, e));
    vWave = h;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uDark;
  uniform vec3 uMid;
  uniform vec3 uLight;
  varying vec2 vUv;
  varying float vWave;
  varying vec3 vNormal2;
  void main() {
    vec3 light = normalize(vec3(-0.4, 0.6, 0.7));
    float diff = clamp(dot(vNormal2, light), 0.0, 1.0);
    // satin: tight, anisotropic-ish highlight
    float spec = pow(diff, 18.0);
    vec3 col = mix(uDark, uMid, smoothstep(-0.6, 0.6, vWave));
    col = mix(col, uLight, spec * 0.85);
    col *= 0.75 + diff * 0.35;
    // fade edges into the card
    float vign = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.7, vUv.x) * smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
    gl_FragColor = vec4(col, vign);
  }
`;

function Silk({ velocity }: { velocity: React.RefObject<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uDark: { value: new THREE.Color("#2e2016") },
      uMid: { value: new THREE.Color("#6b4f37") },
      uLight: { value: new THREE.Color("#e9cfa6") },
    }),
    [],
  );
  useFrame((_, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += dt;
    const u = mat.current.uniforms.uVelocity;
    u.value += ((velocity.current ?? 0) - u.value) * 0.05;
  });
  return (
    <mesh rotation={[-0.5, 0.15, 0.1]} position={[0, 0, 0]}>
      <planeGeometry args={[9, 5, 220, 120]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
}

export default function SilkScene({ active, velocity }: { active: boolean; velocity: React.RefObject<number> }) {
  if (prefersReducedMotion()) return null;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3.4], fov: 45 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      className="!absolute inset-0"
    >
      <Silk velocity={velocity} />
    </Canvas>
  );
}
