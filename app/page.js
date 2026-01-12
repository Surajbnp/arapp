"use client";

import { useEffect, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export default function ARPage() {
  const [ready, setReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // 1️⃣ Load A-Frame first, then MindAR (ORDER MATTERS)
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
      .then(() => {
        setReady(true);
      });
  }, []);

  // 2️⃣ Handle target found / lost
  useEffect(() => {
    if (!ready) return;

    const scene = document.querySelector("a-scene");
    const video = document.getElementById("ar-video") ;

    if (!scene || !video) return;

    scene.addEventListener("targetFound", () => {
      video.play();
    });

    scene.addEventListener("targetLost", () => {
      video.pause();
    });
  }, [ready]);

  // 3️⃣ FORCE WebGL canvas behind UI (CRITICAL FIX)
  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.style.position = "fixed";
        canvas.style.inset = "0";
        canvas.style.zIndex = "1"; // behind UI
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [ready]);

  // 4️⃣ Toggle sound (user gesture = allowed)
  const toggleSound = () => {
    const video = document.getElementById("ar-video");
    if (!video) return;

    video.muted = !video.muted;
    video.play();
    setIsMuted(video.muted);
  };

  // Loading state
  if (!ready) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
        }}
      >
        Loading AR…
      </div>
    );
  }

  return (
    <div
      id="ar-root"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {/* 🔊 UI OVERLAY (ALWAYS ON TOP) */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 99999,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={toggleSound}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>

      {/* 🎥 AR SCENE */}
      <a-scene
        mindar-image="imageTargetSrc: /targets.mind;"
        embedded
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
        }}
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

        <a-entity mindar-image-target="targetIndex: 0">
          <a-video
            src="#ar-video"
            width="1"
            height="0.6"
            position="0 0 0"
          />
        </a-entity>
      </a-scene>
    </div>
  );
}
