"use client";

import { OrbitControls, useFBO } from "@react-three/drei";
import {
  Canvas,
  createPortal,
  extend,
  useFrame,
  useLoader,
} from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import fragmentShader from "./shaders/base/fragmentShader.glsl";
import vertexShader from "./shaders/base/vertexShader.glsl";

import {
  MeshSimulationMaterial,
  SimulationMaterial,
} from "@/components/experience/materials/simulationMaterial";
import { PLYLoader } from "three-stdlib";
extend({ SimulationMaterial: SimulationMaterial });
extend({ MeshSimulationMaterial: MeshSimulationMaterial });

const FboRandom = () => {
  //FBO size
  const size = 128;

  const pointsRef = useRef();
  const simulationMaterialRef = useRef();

  /**
   * RENDER TARGET SETUP
   */
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1
  );
  //Target texture
  const renderTarget = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
  });

  /**
   * Bi-unit quadrilateral setup, use the simulation materials
   */
  const positions = new Float32Array([
    -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
  ]);
  const uvs = new Float32Array([
    0,
    0, // bottom-left
    1,
    0, // bottom-right
    1,
    1, // top-right
    0,
    0, // bottom-left
    1,
    1, // top-right
    0,
    1, // top-left
  ]);

  /**
   * Vertx buffer of size size * size with normalized coordinates
   */
  const particlesPosition = useMemo(() => {
    const length = size * size;
    const particles = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      let i3 = i * 3;
      particles[i3 + 0] = (i % size) / size;
      particles[i3 + 1] = i / size / size;
    }
    return particles;
  }, [size]);

  //Cache uniforms object between each rerender
  const uniforms = useMemo(
    () => ({
      uPositions: {
        value: null,
      },
    }),
    []
  );

  useFrame((state) => {
    const { gl, clock } = state;

    // Render render target texture each frame
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    //Apply render target texture to update particles positions
    pointsRef.current.material.uniforms.uPositions.value = renderTarget.texture;

    //Update simulation material shader based on elapsed time
    simulationMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      {/* render target texture outside of viewport */}
      {createPortal(
        <mesh>
          <simulationMaterial ref={simulationMaterialRef} args={[size]} />
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-uv"
              count={uvs.length / 2}
              array={uvs}
              itemSize={2}
            />
          </bufferGeometry>
        </mesh>,
        scene
      )}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlesPosition.length / 3}
            array={particlesPosition}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
        />
      </points>
    </>
  );
};

const Fbo = () => {
  //FBO size
  // const size = 128;

  const pointsRef = useRef();
  const simulationMaterialRef = useRef();

  /**
   * MESH IMPORT
   */
  const mesh = useLoader(PLYLoader, "./models/face_point_cloud_02.ply");
  const positionArray = mesh.attributes.position.array;
  const vertexCount = positionArray.length / 3;

  const size = Math.ceil(Math.sqrt(positionArray.length) + 0.5);

  console.log("Mesh array length: ", positionArray.length * 3);

  /**
   * RENDER TARGET SETUP
   */
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1
  );
  //Target texture
  const renderTarget = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
  });

  /**
   * Bi-unit quadrilateral setup, use the simulation materials
   */
  const positions = new Float32Array([
    -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
  ]);
  const uvs = new Float32Array([
    0,
    0, // bottom-left
    1,
    0, // bottom-right
    1,
    1, // top-right
    0,
    0, // bottom-left
    1,
    1, // top-right
    0,
    1, // top-left
  ]);

  /**
   * Vertx buffer of size size * size with normalized coordinates
   */
  const particlesPosition = useMemo(() => {
    const length = size * size;
    const particles = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      let i3 = i * 3;
      particles[i3 + 0] = (i % size) / size;
      particles[i3 + 1] = i / size / size;
    }
    return particles;
  }, [size]);

  console.log("Vertex buffer length: ", particlesPosition.length);

  //Cache uniforms object between each rerender
  const uniforms = useMemo(
    () => ({
      uPositions: {
        value: null,
      },
    }),
    []
  );

  useFrame((state) => {
    const { gl, clock } = state;

    // Render render target texture each frame
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    //Apply render target texture to update particles positions
    pointsRef.current.material.uniforms.uPositions.value = renderTarget.texture;

    //Update simulation material shader based on elapsed time
    simulationMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      {/* render target texture outside of viewport */}
      {createPortal(
        <mesh>
          <meshSimulationMaterial
            ref={simulationMaterialRef}
            args={[size, positionArray]}
          />
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-uv"
              count={uvs.length / 2}
              array={uvs}
              itemSize={2}
            />
          </bufferGeometry>
        </mesh>,
        scene
      )}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlesPosition.length / 3}
            array={particlesPosition}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
        />
      </points>
    </>
  );
};

export const Scene = () => {
  return (
    <Canvas className="" camera={{ position: [0, 0, 3], fov: 45 }}>
      <OrbitControls target={[0, 0, 0]} enablePan={false} enableZoom={true} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {/* <FboRandom /> */}
      <Fbo />
    </Canvas>
  );
};
