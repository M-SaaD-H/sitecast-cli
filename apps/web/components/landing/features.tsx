import {
  IconDeviceDesktop,
  IconVideo,
  IconLock,
  IconCpu,
  IconSunMoon,
  IconCheck
} from "@tabler/icons-react";

export function Features() {
  const featureList = [
    {
      icon: IconDeviceDesktop,
      title: "Natural Human-like Pacing",
      description: "Scrolls top to bottom with natural pauses, capturing initial page-load animations and hero content smoothly.",
    },
    {
      icon: IconVideo,
      title: "FFmpeg & libx264 Recording",
      description: "Encodes directly to MP4 using CRF 23 near-lossless compression and broad yuv420p player compatibility.",
    },
    {
      icon: IconLock,
      title: "100% Local & Private",
      description: "No cloud dependencies, no API keys, and no telemetry. All web content and video data remain on your machine.",
    },
    {
      icon: IconCpu,
      title: "Headless Xvfb Integration",
      description: "Uses Xvfb virtual X11 display server on Linux to record authentic headed Chromium output cleanly.",
    },
    {
      icon: IconSunMoon,
      title: "Dark Scheme & Custom Frame",
      description: "Pass --dark-mode for native dark preference, or --no-browser-frame to record full screen kiosk mode.",
    },
    {
      icon: IconCheck,
      title: "Environment Diagnostics",
      description: "Built-in sitecast doctor and sitecast setup tools diagnose system libraries and install Chromium automatically.",
    },
  ];

  return (
    <section className="py-16 border-t border-border bg-surface/30">
      <div className="container max-w-5xl mx-auto px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Built for Developers &amp; Creators</h2>
          <p className="text-sm text-muted-foreground mt-2">
            A standalone CLI tool designed for reproducible, high-quality website video generation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-lg border border-border bg-background flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-md bg-surface border border-border flex items-center justify-center mb-4 text-foreground">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-base tracking-tight mb-1.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
