import Image from "next/image";

export function Logo({ size = "small" }: { size?: "small" | "medium" | "large" }) {
  const width = size === "small" ? 28 : size === "medium" ? 40 : 56;
  const height = size === "small" ? 28 : size === "medium" ? 40 : 56;
  return (
    <Image
      src="/logo_light.png"
      alt="Sitecast Logo"
      width={width}
      height={height}
      className="object-contain dark:hidden"
    />
  );
}

export function LogoDark({ size = "small" }: { size?: "small" | "medium" | "large" }) {
  const width = size === "small" ? 28 : size === "medium" ? 40 : 56;
  const height = size === "small" ? 28 : size === "medium" ? 40 : 56;
  return (
    <Image
      src="/logo_dark.png"
      alt="Sitecast Logo"
      width={width}
      height={height}
      className="object-contain hidden dark:block"
    />
  );
}
