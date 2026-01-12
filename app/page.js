"use client";

import { useEffect, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export default function ARPage() {
  const [ready, setReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // 1️⃣ Load A-Frame → then MindAR (ORDER IS CRITICAL)
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    loadScript("https://aframe.io/releases/1.4.2/aframe.min.js")
      .then(() =>
        loadScript(
          "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"
        )
      )
      .then(() => setReady(true));
  }, []);

  // 2️⃣ Play / pause video on image found / lost
  useEffect(() => {
    if (!ready) return;

    const scene = document.querySelector("a-scene");
    const video = document.getElementById("ar-video");

    if (!scene || !video) return;

    scene.addEventListener("targetFound", () => video.play());
    scene.addEventListener("targetLost", () => video.pause());
  }, [ready]);

  // 3️⃣ Force WebGL canvas behind UI (mandatory for overlays)
  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.style.position = "fixed";
        canvas.style.inset = "0";
        canvas.style.zIndex = "1";
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [ready]);

  // 4️⃣ Toggle audio (user gesture)
  const toggleSound = () => {
    const video = document.getElementById("ar-video");
    if (!video) return;

    video.muted = !video.muted;
    video.play();
    setIsMuted(video.muted);
  };

  if (!ready) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading AR…
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {/* 🔊 UI OVERLAY */}
      <div style={{ position: "fixed", bottom: 20, left: 20, zIndex: 99999 }}>
        <button
          onClick={toggleSound}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>

      {/* 🎥 AR SCENE */}
      <a-scene
        mindar-image="
          imageTargetSrc: /targetsnew.mind;
          filterMinCF: 0.0005;
          filterBeta: 15;
        "
        embedded
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: true"
        style={{ position: "fixed", inset: 0, zIndex: 1 }}
      >
        <a-assets>
          <video
            id="ar-video"
            src="https://res.cloudinary.com/dddnxiqpq/video/upload/f_auto,vc_auto,q_auto,w_1280/Road_Safety_1_vph2hz.mp4"
            preload="auto"
            loop
            muted
            playsInline
            crossOrigin="anonymous"
          />
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false" />

        {/* 🧲 STABILIZED IMAGE ANCHOR */}
        <a-entity mindar-image-target="targetIndex: 0" rotation="0 0 0">
          {/* 🔒 INVISIBLE STABILITY PLANE */}
          <a-plane
            width="1"
            height="0.6"
            position="0 0 0"
            rotation="0 0 0"
            material="opacity: 0"
          >
            {/* 🎬 VIDEO LOCKED INSIDE IMAGE */}
            <a-video
              src="#ar-video"
              width="0.92"
              height="0.52"
              position="0 0 0.01"
              rotation="0 0 0"
              scale="1 1 1"
              smooth="true"
              smoothCount="18"
              smoothTolerance="0.004"
              smoothThreshold="1"
            />
          </a-plane>
        </a-entity>
      </a-scene>
    </div>
  );
}
