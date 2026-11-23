import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LevelData, SurfaceType, TargetInteractable } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { horrorAudio } from '../audio/horrorAudio';

interface FirstPersonControllerProps {
  level: LevelData;
}

const STAND_HEIGHT = 1.65;
const CROUCH_HEIGHT = 1.05;
const PLAYER_RADIUS = 0.38;
const WALK_SPEED = 3.4;
const SPRINT_SPEED = 5.4;
const CROUCH_SPEED = 1.85;
const INTERACT_RANGE = 3.2;

export const FirstPersonController: React.FC<FirstPersonControllerProps> = ({ level }) => {
  const { camera, gl } = useThree();

  const overlay = useGameStore((s) => s.overlay);
  const screen = useGameStore((s) => s.screen);
  const flashlightOn = useGameStore((s) => s.flashlightOn);
  const horrorIntensity = useGameStore((s) => s.horrorIntensity);
  const supernaturalGlitch = useGameStore((s) => s.supernaturalGlitch);
  const activeJumpscare = useGameStore((s) => s.activeJumpscare);
  const settings = useGameStore((s) => s.settings);
  const progress = useGameStore((s) => s.progressByLevel[level.id]);

  const setPointerLocked = useGameStore((s) => s.setPointerLocked);
  const setTargetedInteractable = useGameStore((s) => s.setTargetedInteractable);
  const toggleFlashlight = useGameStore((s) => s.toggleFlashlight);
  const drainFlashlight = useGameStore((s) => s.drainFlashlight);
  const setCrouching = useGameStore((s) => s.setCrouching);
  const setSprinting = useGameStore((s) => s.setSprinting);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const openInspect = useGameStore((s) => s.openInspect);
  const interactDoor = useGameStore((s) => s.interactDoor);
  const openPuzzle = useGameStore((s) => s.openPuzzle);
  const updatePlayerTransform = useGameStore((s) => s.updatePlayerTransform);
  const decayGlitch = useGameStore((s) => s.decayGlitch);

  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(level.spawnYaw);
  const pitch = useRef(0);
  const currentHeight = useRef(STAND_HEIGHT);
  const bobTime = useRef(0);
  const footstepCooldown = useRef(0);
  const saveTimer = useRef(0);
  const currentTargetRef = useRef<TargetInteractable | null>(null);

  const flashlightRef = useRef<THREE.SpotLight | null>(null);
  const flashlightTarget = useMemo(() => new THREE.Object3D(), []);

  // Initialize camera position when level changes
  useEffect(() => {
    const startPos = progress?.playerPosition ?? level.spawnPosition;
    const startYaw = progress?.playerYaw ?? level.spawnYaw;
    camera.position.set(startPos[0], STAND_HEIGHT, startPos[2]);
    yaw.current = startYaw;
    pitch.current = 0;
    camera.rotation.order = 'YXZ';
    camera.rotation.y = startYaw;
    camera.rotation.x = 0;
  }, [level.id, camera]);

  // Attach flashlight target to scene via camera parent
  useEffect(() => {
    camera.parent?.add(flashlightTarget);
    return () => {
      camera.parent?.remove(flashlightTarget);
    };
  }, [camera, flashlightTarget]);

  // Pointer Lock & Keyboard Listeners
  useEffect(() => {
    const domEl = gl.domElement;

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === domEl;
      setPointerLocked(locked);
    };

    const isDragging = { current: false };

    const onMouseDown = (e: MouseEvent) => {
      if (e.target === domEl && useGameStore.getState().overlay === 'none') {
        isDragging.current = true;
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== domEl && !isDragging.current) return;
      const sens = 0.0021 * settings.mouseSensitivity;
      yaw.current -= e.movementX * sens;
      pitch.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch.current - e.movementY * sens));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'playing') return;

      // Always intercept Tab inside game so browser doesn't cycle DOM focus
      if (e.code === 'Tab') {
        e.preventDefault();
        const curOverlay = useGameStore.getState().overlay;
        setOverlay(curOverlay === 'journal' ? 'none' : 'journal');
        horrorAudio.playClick();
        return;
      }

      if (e.code === 'Escape') {
        const curOverlay = useGameStore.getState().overlay;
        if (curOverlay !== 'none') {
          setOverlay('none');
          useGameStore.setState({ inspectingEvidenceId: null, activePuzzleId: null });
        } else {
          setOverlay('pause');
        }
        return;
      }

      if (e.code === 'KeyI') {
        const curOverlay = useGameStore.getState().overlay;
        if (curOverlay === 'none' || curOverlay === 'inventory') {
          setOverlay(curOverlay === 'inventory' ? 'none' : 'inventory');
          horrorAudio.playClick();
        }
        return;
      }

      const curOverlay = useGameStore.getState().overlay;
      if (curOverlay !== 'none') return;

      keys.current[e.code] = true;

      if (e.code === 'KeyF') {
        toggleFlashlight();
      } else if (e.code === 'KeyE') {
        const target = currentTargetRef.current;
        if (target) {
          if (target.kind === 'evidence') {
            openInspect(target.id);
          } else if (target.kind === 'door') {
            interactDoor(target.id);
          } else if (target.kind === 'puzzle') {
            openPuzzle(target.id);
          }
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const onBlur = () => {
      keys.current = {};
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [gl, screen, settings.mouseSensitivity, setOverlay, setPointerLocked, toggleFlashlight, openInspect, interactDoor, openPuzzle]);

  // Helper: Check collision against boxes & closed doors
  const collidesAt = (x: number, z: number): boolean => {
    if (
      x < level.bounds.minX + PLAYER_RADIUS ||
      x > level.bounds.maxX - PLAYER_RADIUS ||
      z < level.bounds.minZ + PLAYER_RADIUS ||
      z > level.bounds.maxZ - PLAYER_RADIUS
    ) {
      return true;
    }

    for (const box of level.boxes) {
      if (!box.collidable) continue;
      // Ignore floor/ceiling boxes (height below 0.35 or bottom above 2.1)
      const boxBottom = box.position[1] - box.size[1] / 2;
      const boxTop = box.position[1] + box.size[1] / 2;
      if (boxTop < 0.35 || boxBottom > 1.9) continue;

      const halfX = box.size[0] / 2 + PLAYER_RADIUS;
      const halfZ = box.size[2] / 2 + PLAYER_RADIUS;
      if (
        x > box.position[0] - halfX &&
        x < box.position[0] + halfX &&
        z > box.position[2] - halfZ &&
        z < box.position[2] + halfZ
      ) {
        return true;
      }
    }

    const openDoors = useGameStore.getState().progressByLevel[level.id]?.openDoorIds ?? [];
    for (const door of level.doors) {
      if (openDoors.includes(door.id)) continue;
      const rot = Math.abs(door.rotationY ?? 0);
      const isRotated = rot > Math.PI / 4 && rot < (3 * Math.PI) / 4;
      const wX = isRotated ? door.size[2] : door.size[0];
      const wZ = isRotated ? door.size[0] : door.size[2];
      const halfX = wX / 2 + PLAYER_RADIUS;
      const halfZ = wZ / 2 + PLAYER_RADIUS;
      if (
        x > door.position[0] - halfX &&
        x < door.position[0] + halfX &&
        z > door.position[2] - halfZ &&
        z < door.position[2] + halfZ
      ) {
        return true;
      }
    }

    return false;
  };

  const getSurfaceAt = (x: number, z: number): SurfaceType => {
    for (const zone of level.surfaceZones) {
      if (x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ) {
        return zone.surface;
      }
    }
    return 'wood';
  };

  const forwardVec = useMemo(() => new THREE.Vector3(), []);
  const rightVec = useMemo(() => new THREE.Vector3(), []);
  const moveVec = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const toTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    decayGlitch(delta);

    if (screen !== 'playing') return;

    drainFlashlight(delta);

    // Apply camera orientation (with violent shake during jumpscare!)
    camera.rotation.order = 'YXZ';
    if (activeJumpscare) {
      const t = state.clock.elapsedTime * 55;
      camera.rotation.y = yaw.current + Math.sin(t) * 0.065;
      camera.rotation.x = pitch.current + Math.cos(t * 1.3) * 0.055;
      camera.rotation.z = Math.sin(t * 0.9) * 0.08;
    } else {
      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, Math.min(1, delta * 10));
    }

    const isLocked = overlay === 'none';

    if (isLocked) {
      const crouch = Boolean(keys.current['ControlLeft'] || keys.current['KeyC']);
      const sprint = Boolean(keys.current['ShiftLeft'] || keys.current['ShiftRight']) && !crouch;
      setCrouching(crouch);
      setSprinting(sprint);

      // Movement vector on XZ plane
      forwardVec.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current)).normalize();
      rightVec.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current)).normalize();
      moveVec.set(0, 0, 0);

      if (keys.current['KeyW'] || keys.current['ArrowUp']) moveVec.add(forwardVec);
      if (keys.current['KeyS'] || keys.current['ArrowDown']) moveVec.sub(forwardVec);
      if (keys.current['KeyD'] || keys.current['ArrowRight']) moveVec.add(rightVec);
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) moveVec.sub(rightVec);

      const isMoving = moveVec.lengthSq() > 0.001;
      if (isMoving) {
        moveVec.normalize();
        const speed = crouch ? CROUCH_SPEED : sprint ? SPRINT_SPEED : WALK_SPEED;
        const dx = moveVec.x * speed * delta;
        const dz = moveVec.z * speed * delta;

        // Axis-separated sliding collision
        const nextX = camera.position.x + dx;
        if (!collidesAt(nextX, camera.position.z)) {
          camera.position.x = nextX;
        }
        const nextZ = camera.position.z + dz;
        if (!collidesAt(camera.position.x, nextZ)) {
          camera.position.z = nextZ;
        }

        // Head-bob + surface footsteps
        bobTime.current += delta * (sprint ? 12.5 : crouch ? 5.5 : 8.2);
        footstepCooldown.current -= delta;
        if (footstepCooldown.current <= 0) {
          const surface = getSurfaceAt(camera.position.x, camera.position.z);
          horrorAudio.playFootstep(surface, sprint);
          footstepCooldown.current = sprint ? 0.34 : crouch ? 0.65 : 0.48;
        }
      } else {
        footstepCooldown.current = Math.min(footstepCooldown.current, 0.08);
      }

      // Smooth crouch + head bob vertical height
      const targetH = crouch ? CROUCH_HEIGHT : STAND_HEIGHT;
      currentHeight.current = THREE.MathUtils.lerp(currentHeight.current, targetH, Math.min(1, delta * 9));
      const bobOffset = isMoving ? Math.sin(bobTime.current) * (sprint ? 0.055 : 0.032) : Math.sin(state.clock.elapsedTime * 1.4) * 0.008;
      camera.position.y = currentHeight.current + bobOffset;

      // Sync Web Audio 3D listener
      camera.getWorldDirection(camDir);
      horrorAudio.updateListener(
        [camera.position.x, camera.position.y, camera.position.z],
        [camDir.x, camDir.y, camDir.z],
        [upVec.x, upVec.y, upVec.z]
      );

      // Periodic transform save into store
      saveTimer.current += delta;
      if (saveTimer.current > 1.5) {
        saveTimer.current = 0;
        updatePlayerTransform([camera.position.x, camera.position.y, camera.position.z], yaw.current);
      }

      // Interactable ray/cone targeting
      const best: { target: TargetInteractable | null; score: number } = {
        target: null,
        score: Infinity,
      };

      const prog = useGameStore.getState().progressByLevel[level.id];
      const currentTier = prog?.currentTier ?? 1;
      const openDoors = prog?.openDoorIds ?? [];

      const evaluateCandidate = (
        kind: TargetInteractable['kind'],
        id: string,
        name: string,
        actionLabel: string,
        pos: [number, number, number],
        maxRange = INTERACT_RANGE
      ) => {
        toTarget.set(pos[0] - camera.position.x, pos[1] - camera.position.y, pos[2] - camera.position.z);
        const dist = toTarget.length();
        if (dist > maxRange) return;
        toTarget.normalize();
        const dot = camDir.dot(toTarget);
        if (dot < 0.88) return; // Looking roughly at the object
        const score = dist * (1.2 - dot);
        if (score < best.score) {
          best.score = score;
          best.target = { kind, id, name, actionLabel, distance: dist };
        }
      };

      for (const ev of level.evidences) {
        if (ev.requiresTier && currentTier < ev.requiresTier) continue;
        evaluateCandidate('evidence', ev.id, ev.name, 'Kiểm tra vật chứng', ev.worldPosition, 3.1);
      }

      for (const door of level.doors) {
        const isOpen = openDoors.includes(door.id);
        evaluateCandidate(
          'door',
          door.id,
          door.name,
          isOpen ? 'Đóng cửa' : 'Mở cửa',
          [door.position[0], door.position[1], door.position[2]],
          3.2
        );
      }

      for (const station of level.puzzleStations) {
        if (station.requiresTier && currentTier < station.requiresTier) continue;
        evaluateCandidate('puzzle', station.puzzleId, station.name, station.promptLabel, station.position, 3.4);
      }

      const prev = currentTargetRef.current;
      const nextTarget = best.target;
      if (prev?.id !== nextTarget?.id || prev?.actionLabel !== nextTarget?.actionLabel) {
        currentTargetRef.current = nextTarget;
        setTargetedInteractable(nextTarget);
      }
    }

    // Update Flashlight position & aim with eerie horror flicker
    if (flashlightRef.current) {
      camera.getWorldDirection(camDir);
      flashlightRef.current.position.copy(camera.position).addScaledVector(camDir, 0.15);
      flashlightRef.current.position.y -= 0.12;
      flashlightTarget.position.copy(camera.position).addScaledVector(camDir, 8);
      flashlightTarget.updateMatrixWorld();
      flashlightRef.current.target = flashlightTarget;

      let intensity = flashlightOn ? 18 : 0;
      if (activeJumpscare) {
        // Strobe flashlight violently during jumpscare
        intensity = Math.sin(state.clock.elapsedTime * 75) > 0 ? 28 : 0;
      } else if (flashlightOn && (horrorIntensity > 0.45 || supernaturalGlitch > 0.15)) {
        const flickerNoise = Math.sin(state.clock.elapsedTime * 37) * Math.sin(state.clock.elapsedTime * 19);
        if (flickerNoise > 0.84 - supernaturalGlitch * 0.4) {
          intensity *= 0.22;
        }
      }
      flashlightRef.current.intensity = intensity;
    }
  });

  return (
    <spotLight
      ref={flashlightRef}
      color="#fff1d6"
      angle={0.46}
      penumbra={0.62}
      distance={22}
      decay={1.45}
      intensity={flashlightOn ? 18 : 0}
      castShadow={settings.graphicsQuality === 'high'}
    />
  );
};
