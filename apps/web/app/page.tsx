import { Hero } from "@/components/landing/hero";
import { DemoPlayer } from "@/components/landing/demo-player";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CliGenerator } from "@/components/landing/cli-generator";
import { Features } from "@/components/landing/features";
import { Quickstart } from "@/components/landing/quickstart";
import { FAQ } from "@/components/landing/faq";

export default function Home() {
  return (
    <>
      <Hero />
      <DemoPlayer />
      <HowItWorks />
      <CliGenerator />
      <Features />
      <Quickstart />
      <FAQ />
    </>
  );
}
