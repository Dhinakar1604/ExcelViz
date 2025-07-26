import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const BarChart3DReal = ({ data }) => {
  const bars = data?.datasets[0].data || [];
  return (
    <Canvas camera={{ position: [0, 5, 10] }}>
      <ambientLight />
      <OrbitControls />
      {bars.map((value, i) => (
        <mesh key={i} position={[i * 1.5, value / 2, 0]}>
          <boxGeometry args={[1, value, 1]} />
          <meshStandardMaterial color={data.datasets[0].backgroundColor[i] || "skyblue"} />
        </mesh>
      ))}
    </Canvas>
  );
};

export default BarChart3DReal;
