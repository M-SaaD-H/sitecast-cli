export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Install the CLI",
      command: "npm install -g sitecast",
      description: "Install globally using Node.js 18+. Run sitecast doctor to confirm your local FFmpeg, Xvfb, and Chromium setup.",
    },
    {
      step: "02",
      title: "Run the Renderer",
      command: "sitecast render https://your-site.com",
      description: "Sitecast launches a headed Chromium instance, scrolls through the website naturally, and records every animation.",
    },
    {
      step: "03",
      title: "Get Your Video",
      command: "./sitecast-1725200000.mp4",
      description: "High-quality MP4 encoded locally using FFmpeg with libx264 at CRF 23. Ready for sharing, demos, or documentation.",
    },
  ];

  return (
    <section className="py-16 border-t border-border bg-surface/30">
      <div className="container max-w-5xl mx-auto px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">How Sitecast Works</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Record full-page web walkthroughs in three quick steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-border bg-background flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-muted-foreground px-2 py-0.5 rounded border border-border bg-surface">
                    STEP {item.step}
                  </span>
                </div>
                <h3 className="font-medium text-base tracking-tight mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="mt-2 p-2.5 rounded bg-surface border border-border font-mono text-xs text-foreground overflow-x-auto">
                <code>{item.command}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
