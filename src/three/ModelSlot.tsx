import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Vec3 } from '../types/game';
import { assetPipeline } from './AssetPipeline';

interface ModelSlotProps {
  /** Key in MODEL_REGISTRY; if absent or load fails, renders procedural fallback cleanly */
  assetKey: string;
  position?: Vec3;
  rotation?: Vec3;
  fallback: React.ReactNode;
}

/**
 * Seamless Blender-GLB-or-Procedural slot with automatic AnimationMixer,
 * distance LOD swapping, and clean GPU disposal on unmount.
 */
export const ModelSlot: React.FC<ModelSlotProps> = ({
  assetKey,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  fallback,
}) => {
  const { gl, camera } = useThree();
  const desc = assetPipeline.getDescriptor(assetKey);
  const [loadedRoot, setLoadedRoot] = useState<THREE.Group | null>(null);
  const [lodRoot, setLodRoot] = useState<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const [useLodMesh, setUseLodMesh] = useState(false);

  useEffect(() => {
    if (!desc) return;
    let cancelled = false;
    let mainUrl = desc.url;
    let lodUrl = desc.lodUrl;

    assetPipeline
      .loadModel(mainUrl, gl)
      .then((entry) => {
        if (cancelled) {
          assetPipeline.releaseModel(mainUrl);
          return;
        }
        const { root, mixer } = assetPipeline.instantiateModel(entry, desc);
        mixerRef.current = mixer;
        setLoadedRoot(root);
      })
      .catch(() => {
        // Gracefully stay on procedural fallback if external asset fails
      });

    if (lodUrl) {
      assetPipeline
        .loadModel(lodUrl, gl)
        .then((entry) => {
          if (cancelled) {
            assetPipeline.releaseModel(lodUrl!);
            return;
          }
          const { root } = assetPipeline.instantiateModel(entry, desc);
          setLodRoot(root);
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      assetPipeline.releaseMixer(mixerRef.current);
      mixerRef.current = null;
      assetPipeline.releaseModel(mainUrl);
      if (lodUrl) assetPipeline.releaseModel(lodUrl);
    };
  }, [assetKey, desc, gl]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(Math.min(delta, 0.05));
    }
    if (desc?.lodUrl && desc.lodDistance && groupRef.current && lodRoot) {
      const dist = camera.position.distanceTo(groupRef.current.position);
      const shouldLod = dist > desc.lodDistance;
      if (shouldLod !== useLodMesh) setUseLodMesh(shouldLod);
    }
  });

  if (!desc || !loadedRoot) {
    return (
      <group position={position} rotation={rotation}>
        {fallback}
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={useLodMesh && lodRoot ? lodRoot : loadedRoot} />
    </group>
  );
};
