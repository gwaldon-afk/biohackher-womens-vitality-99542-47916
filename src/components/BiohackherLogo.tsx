import { cn } from "@/lib/utils";

interface BiohackherLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
}

const sizeClasses = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-5xl",
  hero: "text-5xl md:text-6xl lg:text-7xl",
};

export const BiohackherLogo = ({ className, size = "hero" }: BiohackherLogoProps) => {
  return (
    <h1 
      className={cn(
        "font-serif font-bold tracking-tight text-foreground select-none",
        sizeClasses[size],
        className
      )}
    >
      <span>Biohack</span>
      <span className="italic">her</span>
    </h1>
  );
};

export default BiohackherLogo;
