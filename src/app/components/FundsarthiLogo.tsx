interface FundsarthiLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function FundsarthiLogo({ size = "md", showTagline = true }: FundsarthiLogoProps) {

  const sizeClasses = {
    sm: { logo: "h-10", title: "text-xl", tagline: "text-xs" },
    md: { logo: "h-14", title: "text-3xl", tagline: "text-sm" },
    lg: { logo: "h-20", title: "text-4xl", tagline: "text-base" }
  };

  const sizes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center">

      {/* Official Logo */}
      <img
        src="https://i.postimg.cc/NfdzfQwM/logo2_removebg_preview.png"
        alt="Fundsarthi Logo"
        className={`${sizes.logo} w-auto mb-3`}
      />

      {/* Brand Name */}
      {/* <h1 className={`${sizes.title} text-foreground mb-1 font-semibold`}>
        Fundsarthi
      </h1> */}

      {/* Tagline */}
      {/* {showTagline && (
        <p className={`${sizes.tagline} text-muted-foreground`}>
          Guiding Your Finances
        </p>
      )} */}

    </div>
  );
}