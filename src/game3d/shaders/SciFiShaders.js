import * as THREE from 'three';

/**
 * Custom GLSL Sci-Fi Shaders for ZenLab 3D
 * Provides reusable ShaderMaterial factories with animated scanlines,
 * Fresnel rim lighting, hexagonal forcefields, laser energy packets,
 * and procedural circuit-board laboratory flooring.
 */

const activeShaderMaterials = new Set();

function registerShaderMaterial(material) {
  material.userData = material.userData || {};
  material.userData.isSciFiShader = true;
  material.updateTime = (time) => {
    if (material.uniforms && material.uniforms.uTime) {
      material.uniforms.uTime.value = time;
    }
  };
  activeShaderMaterials.add(material);
  material.addEventListener('dispose', () => {
    activeShaderMaterials.delete(material);
  });
  return material;
}

/**
 * Updates `uTime` uniform across a single material, an Object3D hierarchy,
 * an array of materials, or all active SciFiShaders if called with `(time)`.
 *
 * @param {number|THREE.Material|THREE.Object3D|Array} targetOrTime
 * @param {number} [maybeTime]
 */
export function updateShaderTime(targetOrTime, maybeTime) {
  if (typeof targetOrTime === 'number') {
    const time = targetOrTime;
    activeShaderMaterials.forEach((mat) => {
      if (mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = time;
      }
    });
    return;
  }

  const time = typeof maybeTime === 'number' ? maybeTime : 0;
  if (!targetOrTime) return;

  if (targetOrTime.isMaterial) {
    if (targetOrTime.uniforms && targetOrTime.uniforms.uTime) {
      targetOrTime.uniforms.uTime.value = time;
    }
    return;
  }

  if (Array.isArray(targetOrTime) || targetOrTime instanceof Set) {
    targetOrTime.forEach((item) => updateShaderTime(item, time));
    return;
  }

  if (targetOrTime.isObject3D && typeof targetOrTime.traverse === 'function') {
    targetOrTime.traverse((child) => {
      if (!child.material) return;
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => {
          if (m && m.uniforms && m.uniforms.uTime) {
            m.uniforms.uTime.value = time;
          }
        });
      } else if (child.material.uniforms && child.material.uniforms.uTime) {
        child.material.uniforms.uTime.value = time;
      }
    });
  }
}

/**
 * 1. Hologram Material
 * Animated horizontal scanlines, Fresnel rim glow, and subtle holographic pulse.
 */
export function createHologramMaterial({
  color = '#38bdf8',
  opacity = 0.65,
  scanlineScale = 45.0,
  additive = true
} = {}) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uScanlineScale: { value: scanlineScale }
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vNormalWorld;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPosition.xyz;
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPosition.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uScanlineScale;

      varying vec3 vNormalWorld;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      void main() {
        vec3 normal = normalize(vNormalWorld);
        vec3 viewDir = normalize(vViewDir);

        // Fresnel rim glow
        float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 2.2);

        // Animated horizontal scanlines in world + local UV space
        float scanCoord = (vWorldPos.y + vUv.y * 0.5) * uScanlineScale - uTime * 4.2;
        float scanline = 0.55 + 0.45 * sin(scanCoord);
        float fineScan = 0.85 + 0.15 * sin(scanCoord * 3.7 + uTime * 8.0);

        // Subtle travelling hologram band
        float sweep = smoothstep(0.4, 1.0, sin(vWorldPos.y * 2.6 - uTime * 2.4));

        // Gentle holographic pulse
        float pulse = 0.88 + 0.12 * sin(uTime * 3.2);

        vec3 baseGlow = uColor * (0.55 + 0.65 * fresnel + 0.25 * sweep);
        vec3 rimHighlight = mix(uColor, vec3(1.0), 0.45) * fresnel * 0.85;
        vec3 finalColor = (baseGlow + rimHighlight) * scanline * fineScan * pulse;

        float alpha = clamp((uOpacity * (0.42 + 0.58 * scanline) + fresnel * 0.55) * pulse, 0.08, 0.98);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
  });

  return registerShaderMaterial(material);
}

/**
 * 2. Forcefield Material
 * Volumetric energy sphere / portal arch shader with animated hexagonal/wave ripples
 * and bright Fresnel edge glow. Used for Station 5's k-NN radius sphere and Overworld portals.
 */
export function createForcefieldMaterial({
  color = '#38bdf8',
  secondaryColor = '#fbbf24',
  opacity = 0.32
} = {}) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSecondaryColor: { value: new THREE.Color(secondaryColor) },
      uOpacity: { value: opacity },
      uPulseIntensity: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vNormalWorld;
      varying vec3 vViewDir;
      varying vec3 vLocalPos;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vLocalPos = position;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uSecondaryColor;
      uniform float uOpacity;
      uniform float uPulseIntensity;

      varying vec3 vNormalWorld;
      varying vec3 vViewDir;
      varying vec3 vLocalPos;
      varying vec2 vUv;

      // Procedural hexagonal lattice distance
      float hexPattern(vec2 p) {
        p *= 10.0;
        const vec2 s = vec2(1.0, 1.7320508);
        vec4 hC = floor(vec4(p, p - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
        vec4 h = vec4(p - hC.xy * s, p - (hC.zw + 0.5) * s);
        vec2 hex = dot(h.xy, h.xy) < dot(h.zw, h.zw) ? h.xy : h.zw;
        hex = abs(hex);
        float d = max(dot(hex, s * 0.5), hex.x);
        return smoothstep(0.42, 0.49, d);
      }

      void main() {
        vec3 normal = normalize(vNormalWorld);
        vec3 viewDir = normalize(vViewDir);

        // Strong Fresnel edge glow
        float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 2.1);

        // Spherical/planar UV coordinates for hex lattice
        vec2 hexUv = vUv + vec2(vLocalPos.x * 0.25, vLocalPos.y * 0.25);
        float hexEdge = hexPattern(hexUv + vec2(0.0, uTime * 0.04));

        // Animated wave ripples
        float wave1 = 0.5 + 0.5 * sin(length(vLocalPos.xy) * 8.0 - uTime * 3.4);
        float wave2 = 0.5 + 0.5 * cos(vLocalPos.y * 10.0 - uTime * 2.6 + vLocalPos.x * 4.0);
        float ripple = mix(wave1, wave2, 0.5);

        vec3 coreColor = mix(uColor, uSecondaryColor, ripple * 0.38 + fresnel * 0.35);
        vec3 hexGlow = mix(uColor, uSecondaryColor, 0.6) * hexEdge * (0.45 + 0.55 * ripple);
        vec3 edgeHighlight = mix(coreColor, vec3(1.0), 0.4) * fresnel * 1.35;

        vec3 finalColor = (coreColor * 0.45 + hexGlow + edgeHighlight) * uPulseIntensity;
        float alpha = clamp(
          uOpacity * (0.35 + hexEdge * 0.55 + ripple * 0.25) + fresnel * 0.62,
          0.05,
          0.92
        );

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  return registerShaderMaterial(material);
}

/**
 * 3. Laser Pulse Material
 * Animated energy packets traveling along UV coordinates for laser tethers,
 * byte-decoder beams, and neural plasma pipes.
 */
export function createLaserPulseMaterial({
  color = '#38bdf8',
  pulseColor = '#ffffff',
  speed = 4.0,
  opacity = 0.92
} = {}) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uPulseColor: { value: new THREE.Color(pulseColor) },
      uSpeed: { value: speed },
      uOpacity: { value: opacity }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalWorld;
      varying vec3 vViewDir;

      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uPulseColor;
      uniform float uSpeed;
      uniform float uOpacity;

      varying vec2 vUv;
      varying vec3 vNormalWorld;
      varying vec3 vViewDir;

      void main() {
        // Support both U-oriented tubes/ribbons and V-oriented cylinders
        float coord = vUv.x + vUv.y;
        float flow = fract(coord * 3.0 - uTime * (uSpeed * 0.35));
        float packet = smoothstep(0.65, 0.95, sin(flow * 6.2831853) * 0.5 + 0.5);
        float secondaryPacket = smoothstep(0.75, 0.98, sin((coord * 6.0 - uTime * uSpeed) * 3.14159) * 0.5 + 0.5);

        vec3 normal = normalize(vNormalWorld);
        vec3 viewDir = normalize(vViewDir);
        float coreAlign = pow(abs(dot(viewDir, normal)), 0.7);

        float energy = clamp(packet * 0.75 + secondaryPacket * 0.45, 0.0, 1.0);
        vec3 col = mix(uColor, uPulseColor, energy * 0.85 + coreAlign * 0.25);

        float alpha = clamp(uOpacity * (0.48 + energy * 0.52), 0.15, 1.0);
        gl_FragColor = vec4(col * (1.1 + energy * 0.7), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  return registerShaderMaterial(material);
}

/**
 * 4. Circuit Floor Material
 * Renders a sleek metallic sci-fi laboratory grid with animated glowing
 * circuit traces and radial telemetry pulses across the floor.
 */
export function createCircuitFloorMaterial({
  bgColor = '#050b16',
  gridColor = '#1e293b',
  pulseColor = '#0ea5e9',
  gridScale = 1.0
} = {}) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBgColor: { value: new THREE.Color(bgColor) },
      uGridColor: { value: new THREE.Color(gridColor) },
      uPulseColor: { value: new THREE.Color(pulseColor) },
      uGridScale: { value: gridScale }
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldPos;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uBgColor;
      uniform vec3 uGridColor;
      uniform vec3 uPulseColor;
      uniform float uGridScale;

      varying vec3 vWorldPos;
      varying vec2 vUv;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float gridLine(vec2 coord, float scale, float thickness) {
        vec2 p = coord * scale;
        vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p);
        float line = min(grid.x, grid.y);
        return 1.0 - min(line / thickness, 1.0);
      }

      void main() {
        vec2 wp = vWorldPos.xz * uGridScale;

        // Primary 2m structural grid and 0.5m micro-grid
        float majorGrid = gridLine(wp, 0.5, 1.35);
        float minorGrid = gridLine(wp, 2.0, 0.85) * 0.35;

        // Procedural circuit board trace cells
        vec2 cellId = floor(wp * 0.5);
        vec2 cellUv = fract(wp * 0.5) - 0.5;
        float rnd = hash21(cellId);

        // Diagonal/orthogonal circuit traces inside cells
        float traceCoord = (rnd > 0.5) ? (cellUv.x + cellUv.y) : (cellUv.x - cellUv.y);
        float circuitTrace = smoothstep(0.035, 0.008, abs(traceCoord)) * step(0.45, rnd);

        // Circuit node pads at cell intersections
        float nodePad = smoothstep(0.11, 0.06, length(cellUv)) * step(0.65, rnd);

        // Radial telemetry pulse + directional data waves along traces
        float distFromCenter = length(vWorldPos.xz);
        float radialWave = smoothstep(0.65, 0.99, sin(distFromCenter * 0.45 - uTime * 2.2) * 0.5 + 0.5);
        float traceSignal = smoothstep(0.7, 0.98, sin((wp.x + wp.y) * 1.4 - uTime * 3.5 + rnd * 6.28) * 0.5 + 0.5);

        // Combine base metallic floor + grid + glowing circuit traces
        float combinedGrid = clamp(majorGrid + minorGrid, 0.0, 1.0);
        vec3 col = uBgColor;
        col = mix(col, uGridColor, combinedGrid * 0.85);
        col = mix(col, uGridColor * 1.35, circuitTrace * 0.55);

        float activeGlow = (majorGrid * radialWave * 0.55) + (circuitTrace * traceSignal * 0.85) + (nodePad * (0.4 + 0.6 * traceSignal));
        col += uPulseColor * activeGlow * 0.95;

        // Smooth radial vignette so edges blend into deep space/lab horizon
        float vignette = 1.0 - smoothstep(16.0, 42.0, distFromCenter);
        col = mix(uBgColor * 0.65, col, vignette);

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });

  return registerShaderMaterial(material);
}
