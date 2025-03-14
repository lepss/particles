import * as THREE from "three";
import basicSimulationFragmentShader from "../shaders/simulation/BasicSimulationFragmentShader.glsl";
import basicSimulationVertexShader from "../shaders/simulation/BasicSimulationVertexShader.glsl";
import simulationFragmentShader from "../shaders/simulation/WavySimulationFragmentShader.glsl";
import simulationVertexShader from "../shaders/simulation/WavySimulationVertexShader.glsl";

const getRandomData = (width, height) => {
  // we need to create a vec4 since we're passing the positions to the fragment shader
  // data textures need to have 4 components, R, G, B, and A
  const length = width * height * 4;
  const data = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const stride = i * 4;

    const distance = Math.sqrt(Math.random()) * 2.0;
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);

    data[stride] = distance * Math.sin(theta) * Math.cos(phi);
    data[stride + 1] = distance * Math.sin(theta) * Math.sin(phi);
    data[stride + 2] = distance * Math.cos(theta);
    data[stride + 3] = 1.0; // this value will not have any impact
  }

  return data;
};

const getMeshData = (positionsArray, size) => {
  const data = new Float32Array(size * size * 4);
  const total = positionsArray.length;

  for (let i = 0; i < total / 3; i++) {
    data[i * 4] = positionsArray[i * 3];
    data[i * 4 + 1] = positionsArray[i * 3 + 1];
    data[i * 4 + 2] = positionsArray[i * 3 + 2];
    data[i * 4 + 3] = 1.0; // Alpha inutile mais requis
  }
  return data;
};

class SimulationMaterial extends THREE.ShaderMaterial {
  constructor(size) {
    const positionsTexture = new THREE.DataTexture(
      getRandomData(size, size),
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    positionsTexture.needsUpdate = true;

    const simulationUniforms = {
      positions: { value: positionsTexture },
      uFrequency: { value: 0.25 },
      uTime: { value: 0 },
    };

    super({
      uniforms: simulationUniforms,
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
    });
  }
}

class MeshSimulationMaterial extends THREE.ShaderMaterial {
  constructor(size, positionsArray) {
    const positionsTexture = new THREE.DataTexture(
      getMeshData(positionsArray, size),
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    positionsTexture.needsUpdate = true;

    const simulationUniforms = {
      positions: { value: positionsTexture },
      uFrequency: { value: 0.25 },
      uTime: { value: 0 },
    };

    super({
      uniforms: simulationUniforms,
      vertexShader: basicSimulationVertexShader,
      fragmentShader: basicSimulationFragmentShader,
    });
  }
}

export { MeshSimulationMaterial, SimulationMaterial };
