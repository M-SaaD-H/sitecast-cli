import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      id: "faq-1",
      q: "Is Sitecast CLI completely free to use?",
      a: "Yes. Sitecast CLI is open source software distributed under the MIT license. You can install and run it for unlimited recordings in personal or commercial projects with zero fees or subscriptions.",
    },
    {
      id: "faq-2",
      q: "Does Sitecast send any data or recordings to external servers?",
      a: "No. Sitecast operates 100% locally on your machine. Chromium renders the web page locally, and FFmpeg encodes the MP4 file directly to your disk. No network requests are made to any Sitecast backend.",
    },
    {
      id: "faq-3",
      q: "Which operating systems are supported?",
      a: "Sitecast currently targets Linux operating systems (including Ubuntu, Debian, Arch Linux, Fedora, and WSL2 on Windows). It requires Xvfb for headless virtual display rendering.",
    },
    {
      id: "faq-4",
      q: "How does natural scrolling work during recording?",
      a: "Sitecast calculates the target page's scroll height and drives Chromium's scroll position at realistic human reading speeds. It pauses briefly at major layout sections to capture hero elements, feature grids, and footer content.",
    },
    {
      id: "faq-5",
      q: "What video formats and codecs are generated?",
      a: "By default, Sitecast outputs an MP4 file encoded using FFmpeg libx264 with CRF 23 compression and yuv420p color pixel format. This guarantees high visual clarity and compatibility across all modern video players and browser web containers.",
    },
    {
      id: "faq-6",
      q: "What if I get a missing Chromium or Xvfb error?",
      a: "Run 'sitecast doctor' in your terminal to see missing system packages. You can install Chromium using 'sitecast setup' or install FFmpeg and Xvfb using your Linux distribution package manager (apt or pacman).",
    },
  ];

  return (
    <section className="py-16 border-t border-border bg-surface/30">
      <div className="container max-w-3xl mx-auto px-4 md:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Common questions regarding Sitecast CLI setup and features.
          </p>
        </div>

        <Accordion defaultValue={["faq-1"]} className="rounded-lg border border-border bg-background px-6">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

