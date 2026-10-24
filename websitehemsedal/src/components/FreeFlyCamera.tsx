"use client";

import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls } from "leva";

/**
 * Dev-only free-fly camera.
 * Click the viewport to lock the pointer, then:
 *   WASD  — move horizontally
 *   Space — ascend
 *   Shift — descend
 *   Esc   — release pointer lock
 *
 * Remove or gate behind NODE_ENV in Phase 2.
 */
export default function FreeFlyCamera() {
  const { camera } = useThree();
  const keys = useRef({
    forward: false,
    back: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const velocity = useRef(new THREE.Vector3());

  const params = useControls(
    "Fly Camera",
    {
      speed: { value: 20, min: 1, max: 100, step: 1 },
      sensitivity: { value: 0.002, min: 0.0005, max: 0.005, step: 0.0001 },
    },
    { collapsed: true }
  );

  // ── Keyboard input ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.forward = true;
          break;
        case "KeyS":
          keys.current.back = true;
          break;
        case "KeyA":
          keys.current.left = true;
          break;
        case "KeyD":
          keys.current.right = true;
          break;
        case "Space":
          keys.current.up = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.down = true;
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.forward = false;
          break;
        case "KeyS":
          keys.current.back = false;
          break;
        case "KeyA":
          keys.current.left = false;
          break;
        case "KeyD":
          keys.current.right = false;
          break;
        case "Space":
          keys.current.up = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.down = false;
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // ── Mouse look (pointer lock) ──
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== document.body) return;
      euler.current.y -= e.movementX * params.sensitivity;
      euler.current.x -= e.movementY * params.sensitivity;
      euler.current.x = Math.max(
        -Math.PI / 2 + 0.01,
        Math.min(Math.PI / 2 - 0.01, euler.current.x)
      );
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [params.sensitivity]);

  // ── Click to lock pointer ──
  useEffect(() => {
    const onClick = () => {
      if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock().catch(() => {});
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // ── Frame update: apply rotation + movement ──
  useFrame((_, delta) => {
    camera.quaternion.setFromEuler(euler.current);

    const direction = new THREE.Vector3();
    if (keys.current.forward) direction.z -= 1;
    if (keys.current.back) direction.z += 1;
    if (keys.current.left) direction.x -= 1;
    if (keys.current.right) direction.x += 1;
    if (keys.current.up) direction.y += 1;
    if (keys.current.down) direction.y -= 1;
    direction.normalize();

    direction.applyQuaternion(camera.quaternion);

    const targetVel = direction.multiplyScalar(params.speed);
    const lerpFactor = Math.min(delta * 5, 1);
    velocity.current.lerp(targetVel, lerpFactor);

    camera.position.add(velocity.current.clone().multiplyScalar(delta));
  });

  return null;
}
