"use client";

import React, { useRef, useState } from "react";
import { IconPlayerPlay, IconPlayerPause, IconMaximize } from "@tabler/icons-react";

export function DemoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <section className="py-12 bg-background">
      <div className="container max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Sample Output Demo
          </span>
        </div>

        {/* Browser Window Frame */}
        <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
          {/* Header Controls */}
          <div className="h-10 border-b border-border bg-muted/40 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-border" />
              <div className="w-3 h-3 rounded-full bg-border" />
              <div className="w-3 h-3 rounded-full bg-border" />
            </div>

            <div className="flex-1 max-w-md mx-4">
              <div className="bg-background/80 border border-border rounded-md px-3 py-1 text-center font-mono text-xs text-muted-foreground truncate">
                sitecast render https://example.com --output output.mp4
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <IconPlayerPause className="w-4 h-4" /> : <IconPlayerPlay className="w-4 h-4" />}
              </button>
              <button
                onClick={handleFullscreen}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Fullscreen"
              >
                <IconMaximize className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src="/demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
