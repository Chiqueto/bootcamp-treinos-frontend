import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "horizontal" | "symbol" | "full";
  asLink?: boolean;
  light?: boolean;
}

export function Logo({
  className = "",
  size = "md",
  variant = "horizontal",
  asLink = false,
  light = false,
}: LogoProps) {
  let content: React.ReactNode;

  if (variant === "full") {
    // Logo horizontal completa com lettering e slogan (1024x260)
    const heights = {
      sm: "h-8 w-[126px]",
      md: "h-11 w-[173px]",
      lg: "h-14 w-[220px]",
      xl: "h-16 w-[252px]",
    };

    content = (
      <div className={`relative ${heights[size]} shrink-0 ${className}`}>
        <Image
          src="/logo.png"
          alt="Trainvy - Seu treino. Sua evolução."
          fill
          priority
          className="object-contain"
        />
      </div>
    );
  } else if (variant === "symbol") {
    // Apenas o símbolo gráfico (ícone do halter)
    const heights = {
      sm: "h-5 w-[30px]",
      md: "h-7 w-[42px]",
      lg: "h-9 w-[54px]",
      xl: "h-12 w-[72px]",
    };

    content = (
      <div className={`relative ${heights[size]} shrink-0 ${className}`}>
        <Image
          src="/symbol.png"
          alt="Trainvy"
          fill
          priority
          className="object-contain"
        />
      </div>
    );
  } else {
    // Variante horizontal: Ícone oficial + Typography Trainvy
    const symbolSizes = {
      sm: "h-5 w-[28px]",
      md: "h-6 w-[34px]",
      lg: "h-7 w-[40px]",
      xl: "h-9 w-[50px]",
    };

    const textSizes = {
      sm: "text-[18px]",
      md: "text-[21px]",
      lg: "text-[26px]",
      xl: "text-[32px]",
    };

    content = (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        <div className={`relative ${symbolSizes[size]} shrink-0`}>
          <Image
            src="/symbol.png"
            alt="Trainvy"
            fill
            priority
            className="object-contain"
          />
        </div>
        <span
          className={`font-anton uppercase tracking-wide leading-none ${textSizes[size]} ${
            light ? "text-white" : "text-foreground"
          }`}
          style={{ fontFamily: "var(--font-anton)" }}
        >
          Trainvy
        </span>
      </div>
    );
  }

  if (asLink) {
    return (
      <Link
        href="/"
        className="inline-flex items-center outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
