"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A real 3D supplement tub that slowly spins, floats and follows the mouse.
 * Drag it with your finger or mouse to spin it yourself.
 * three.js is loaded only in the browser, after the page appears, so the page stays fast.
 * If the device cannot do 3D (or "reduce motion" is on) a still picture is shown instead.
 */
export default function Hero3D() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import("three");
        const { RoomEnvironment } =
          await import("three/addons/environments/RoomEnvironment.js");
        if (disposed || !boxRef.current) return;

        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        const canvas = renderer.domElement;
        canvas.style.cssText =
          "position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y;cursor:grab;";
        canvas.setAttribute("aria-hidden", "true");
        box.appendChild(canvas);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envScene = new RoomEnvironment();
        scene.environment = pmrem.fromScene(envScene, 0.04).texture;
        scene.environmentIntensity = 0.75;

        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
        camera.position.set(0, 0.5, 8);
        camera.lookAt(0, 0.1, 0);

        // lights: soft key + red rim light from behind
        scene.add(new THREE.HemisphereLight(0xffffff, 0xffd9d9, 0.7));
        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(3, 4, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xff3b3b, 2.2);
        rim.position.set(-4, 2, -3);
        scene.add(rim);

        // ---------- label picture drawn on a canvas ----------
        const rootStyle = getComputedStyle(document.documentElement);
        const display = (
          rootStyle.getPropertyValue("--font-oswald") || ""
        ).trim();
        const family = `${display ? display + "," : ""} Impact, "Arial Narrow", sans-serif`;
        try {
          await document.fonts.load(`700 100px ${family}`);
        } catch {
          /* fonts are optional */
        }
        if (disposed) {
          renderer.dispose();
          return;
        }
        const W = 2048,
          H = 1024;
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        const g = c.getContext("2d")!;
        g.fillStyle = "#dc2626";
        g.fillRect(0, 0, W, H);
        // subtle diagonal stripes
        g.save();
        g.globalAlpha = 0.07;
        g.fillStyle = "#000";
        for (let x = -H; x < W + H; x += 90) {
          g.beginPath();
          g.moveTo(x, 0);
          g.lineTo(x + 40, 0);
          g.lineTo(x + 40 - H, H);
          g.lineTo(x - H, H);
          g.fill();
        }
        g.restore();
        // draws text, shrinking it if it would not fit inside the panel
        const fit = (text: string, cx: number, y: number, weight: string, size: number, maxW: number) => {
          let px = size;
          g.font = `${weight} ${px}px ${family}`;
          while (g.measureText(text).width > maxW && px > 14) {
            px -= 2;
            g.font = `${weight} ${px}px ${family}`;
          }
          g.fillText(text, cx, y);
        };
        const drawLogo = (cx: number) => {
          g.textAlign = "center";
          g.textBaseline = "middle";
          // white panel (about a quarter of the way round, so it reads flat from the front)
          g.fillStyle = "#ffffff";
          g.beginPath();
          g.roundRect(cx - 215, 190, 430, 650, 28);
          g.fill();
          g.fillStyle = "#1a1a1a";
          fit("TEAMBULL", cx, 295, "700", 88, 390);
          g.fillStyle = "#dc2626";
          fit("FUEL HOUSE", cx, 385, "700", 58, 390);
          g.fillStyle = "#1a1a1a";
          g.fillRect(cx - 180, 450, 360, 84);
          g.fillStyle = "#ffffff";
          fit("WHEY PROTEIN", cx, 493, "700", 46, 330);
          g.fillStyle = "#555";
          fit("24g PROTEIN PER SCOOP", cx, 615, "600", 26, 390);
          g.fillStyle = "#dc2626";
          g.font = `700 56px ${family}`;
          g.fillText("2 KG", cx, 715);
        };
        drawLogo(W / 2);
        drawLogo(0);
        drawLogo(W);
        drawLogo(W / 4);
        drawLogo((W * 3) / 4);
        const labelTex = new THREE.CanvasTexture(c);
        labelTex.colorSpace = THREE.SRGBColorSpace;
        labelTex.wrapS = THREE.RepeatWrapping;
        labelTex.offset.x = 0.5; // put the logo on the front
        labelTex.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy(),
        );

        // ---------- the tub ----------
        const tub = new THREE.Group();
        const bodyProfile = [
          [0, -1.0],
          [0.9, -1.0],
          [0.97, -0.95],
          [1.0, -0.88],
          [1.0, 0.8],
          [0.97, 0.88],
          [0.92, 0.92],
          [0, 0.92],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const body = new THREE.Mesh(
          new THREE.LatheGeometry(bodyProfile, 96),
          new THREE.MeshPhysicalMaterial({
            color: 0xdc2626,
            roughness: 0.38,
            metalness: 0.05,
            clearcoat: 0.6,
            clearcoatRoughness: 0.35,
          }),
        );
        tub.add(body);

        const label = new THREE.Mesh(
          new THREE.CylinderGeometry(1.012, 1.012, 1.55, 96, 1, true),
          new THREE.MeshPhysicalMaterial({
            map: labelTex,
            roughness: 0.42,
            metalness: 0.0,
            clearcoat: 0.5,
            clearcoatRoughness: 0.4,
          }),
        );
        label.position.y = -0.02;
        tub.add(label);

        const lidProfile = [
          [0, 0.9],
          [0.95, 0.9],
          [1.05, 0.94],
          [1.06, 1.16],
          [1.0, 1.24],
          [0.88, 1.28],
          [0, 1.28],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const lid = new THREE.Mesh(
          new THREE.LatheGeometry(lidProfile, 96),
          new THREE.MeshPhysicalMaterial({
            color: 0x1b1b1b,
            roughness: 0.3,
            metalness: 0.35,
            clearcoat: 0.8,
            clearcoatRoughness: 0.25,
          }),
        );
        tub.add(lid);
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.0, 0.025, 16, 96),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.6,
          }),
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.9;
        tub.add(ring);
        tub.position.y = 0.05;
        tub.rotation.x = 0.12;

        const stage = new THREE.Group();
        stage.add(tub);
        scene.add(stage);

        // ---------- weight plates orbiting ----------
        const plates: {
          mesh: InstanceType<typeof THREE.Group>;
          a: number;
          r: number;
          y: number;
          s: number;
        }[] = [];
        const plateMatDark = new THREE.MeshStandardMaterial({
          color: 0x3a3a3a, roughness: 0.42, metalness: 0.55,
        });
        const plateMatRed = new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          roughness: 0.4,
          metalness: 0.4,
        });
        for (let i = 0; i < 2; i++) {
          const p = new THREE.Group();
          const disc = new THREE.Mesh(
            new THREE.CylinderGeometry(0.62, 0.62, 0.14, 64),
            plateMatDark,
          );
          const edge = new THREE.Mesh(
            new THREE.TorusGeometry(0.62, 0.03, 12, 64),
            plateMatRed,
          );
          const hub = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.16, 0.17, 32),
            plateMatRed,
          );
          edge.rotation.x = Math.PI / 2;
          const inner = new THREE.Group();
          inner.add(disc, edge, hub);
          inner.rotation.x = Math.PI / 2; // face the camera
          p.add(inner);
          scene.add(p);
          plates.push({
            mesh: p,
            a: i * Math.PI,
            r: 1.75,
            y: i ? -0.75 : 0.95,
            s: i ? 0.36 : 0.44,
          });
        }

        // ---------- floating red sparks ----------
        const N = 70;
        const pos = new Float32Array(N * 3);
        const seed = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 6;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.5;
          seed[i] = Math.random() * 10;
        }
        const sparkGeo = new THREE.BufferGeometry();
        sparkGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const sparks = new THREE.Points(
          sparkGeo,
          new THREE.PointsMaterial({
            color: 0xff4d4d,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
          }),
        );
        scene.add(sparks);

        // ---------- soft shadow on the floor ----------
        const sc = document.createElement("canvas");
        sc.width = sc.height = 128;
        const sg = sc.getContext("2d")!;
        const grad = sg.createRadialGradient(64, 64, 4, 64, 64, 62);
        grad.addColorStop(0, "rgba(0,0,0,0.38)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        sg.fillStyle = grad;
        sg.fillRect(0, 0, 128, 128);
        const shadow = new THREE.Mesh(
          new THREE.PlaneGeometry(3.4, 3.4),
          new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(sc),
            transparent: true,
            depthWrite: false,
          }),
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -1.25;
        scene.add(shadow);

        // ---------- sizing ----------
        const resize = () => {
          const w = box.clientWidth || 1;
          const h = box.clientHeight || 1;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.position.z = Math.max(8.2, 2.2 / (Math.tan(THREE.MathUtils.degToRad(15)) * camera.aspect));
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(() => {
          resize();
          if (reduce) renderer.render(scene, camera);
        });
        ro.observe(box);

        // ---------- mouse / touch ----------
        let tx = 0,
          ty = 0; // follow pointer
        let spin = 0.0; // extra spin from dragging
        let dragging = false;
        let lastX = 0;
        const onMove = (e: PointerEvent) => {
          const r = box.getBoundingClientRect();
          tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
          if (dragging) {
            spin += (e.clientX - lastX) * 0.012;
            lastX = e.clientX;
          }
        };
        const onDown = (e: PointerEvent) => {
          dragging = true;
          lastX = e.clientX;
          canvas.style.cursor = "grabbing";
          canvas.setPointerCapture?.(e.pointerId);
        };
        const onUp = () => {
          dragging = false;
          canvas.style.cursor = "grab";
        };
        const onLeave = () => {
          tx = 0;
          ty = 0;
        };
        if (!reduce) {
          canvas.addEventListener("pointermove", onMove);
          canvas.addEventListener("pointerdown", onDown);
          canvas.addEventListener("pointerup", onUp);
          canvas.addEventListener("pointercancel", onUp);
          canvas.addEventListener("pointerleave", onLeave);
        } else {
          canvas.style.cursor = "default";
        }

        // ---------- loop (pauses when off-screen or tab hidden) ----------
        let raf = 0;
        let visible = true;
        let last = performance.now();
        let rotY = -0.5;
        let showed = false;
        const frame = (now: number) => {
          raf = 0;
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          const t = now / 1000;

          rotY += dt * 0.55 + spin;
          spin *= 0.94;
          tub.rotation.y = rotY;
          stage.rotation.y += (tx * 0.35 - stage.rotation.y) * 0.06;
          stage.rotation.x += (ty * 0.18 - stage.rotation.x) * 0.06;
          stage.position.y = Math.sin(t * 1.3) * 0.09;
          shadow.scale.setScalar(1 - Math.sin(t * 1.3) * 0.04);

          for (const p of plates) {
            const a = p.a + t * 0.45;
            p.mesh.position.set(
              Math.cos(a) * p.r,
              p.y + Math.sin(t * 1.1 + p.a) * 0.12,
              Math.sin(a) * 0.9 - 1.3,
            );
            p.mesh.rotation.set(0.25, 0.5 + Math.sin(t * 0.7 + p.a) * 0.6, t * 0.7 * p.s);
            p.mesh.scale.setScalar(p.s);
          }
          const arr = sparkGeo.attributes.position.array as Float32Array;
          for (let i = 0; i < N; i++) {
            arr[i * 3 + 1] += dt * (0.18 + (seed[i] % 1) * 0.25);
            if (arr[i * 3 + 1] > 2.4) arr[i * 3 + 1] = -2.4;
            arr[i * 3] += Math.sin(t + seed[i]) * dt * 0.12;
          }
          sparkGeo.attributes.position.needsUpdate = true;

          renderer.render(scene, camera);
          if (!showed) {
            showed = true;
            setReady(true);
          }
          if (visible && !document.hidden) raf = requestAnimationFrame(frame);
        };
        const start = () => {
          if (!raf && !reduce) {
            last = performance.now();
            raf = requestAnimationFrame(frame);
          }
        };

        if (reduce) {
          rotY = -0.35;
          tub.rotation.y = rotY;
          plates.forEach((p, i) => {
            p.mesh.position.set(i ? 1.6 : -1.6, p.y, -1.0);
            p.mesh.scale.setScalar(p.s);
            p.mesh.rotation.set(0.2, i ? -0.5 : 0.5, 0);
          });
          renderer.render(scene, camera);
          setReady(true);
        } else {
          start();
        }

        const io = new IntersectionObserver(([en]) => {
          visible = en.isIntersecting;
          if (visible) start();
        });
        io.observe(box);
        const onVis = () => {
          if (!document.hidden) start();
        };
        document.addEventListener("visibilitychange", onVis);

        cleanup = () => {
          if (raf) cancelAnimationFrame(raf);
          io.disconnect();
          ro.disconnect();
          document.removeEventListener("visibilitychange", onVis);
          canvas.removeEventListener("pointermove", onMove);
          canvas.removeEventListener("pointerdown", onDown);
          canvas.removeEventListener("pointerup", onUp);
          canvas.removeEventListener("pointercancel", onUp);
          canvas.removeEventListener("pointerleave", onLeave);
          scene.traverse((o) => {
            const m = o as InstanceType<typeof THREE.Mesh>;
            if (m.geometry) m.geometry.dispose();
            const mat = m.material as
              | InstanceType<typeof THREE.Material>
              | InstanceType<typeof THREE.Material>[]
              | undefined;
            if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
            else mat?.dispose();
          });
          labelTex.dispose();
          pmrem.dispose();
          renderer.dispose();
          canvas.remove();
        };
        if (disposed) cleanup();
      } catch {
        /* no 3D on this device: the still picture stays visible */
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative mx-auto aspect-[4/3] w-full max-w-[420px] select-none md:aspect-[5/6] md:max-w-[520px]"
      role="img"
      aria-label="3D view of a Teambull whey protein tub"
    >
      {/* picture shown while the 3D loads, or if 3D is not available */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-tub.svg"
        alt=""
        className={`absolute inset-0 m-auto h-4/5 w-4/5 object-contain transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
}
