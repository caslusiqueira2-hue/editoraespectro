import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide" | "auto" | "3/4" | "4/3";
  priority?: boolean;
}

const OptimizedImage = ({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = "auto",
  priority = false,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Helper to determine if the URL is from Supabase Storage
  const isSupabaseUrl = src?.includes("supabase.co/storage/v1/object/public/");

  // Generate transformation URL for Supabase
  const getTransformedUrl = (width?: number, quality = 80, format: "webp" | "avif" | "origin" = "webp") => {
    if (!isSupabaseUrl || !src) return src;
    
    try {
      const url = new URL(src);
      if (width) url.searchParams.append("width", width.toString());
      url.searchParams.append("quality", quality.toString());
      if (format !== "origin") url.searchParams.append("format", format);
      return url.toString();
    } catch (e) {
      return src;
    }
  };

  // Generate srcset for a specific format
  const generateSrcSet = (format: "webp" | "avif" = "webp") => {
    if (!isSupabaseUrl || !src) return undefined;
    
    const widths = [400, 800, 1200, 1600, 2000];
    return widths
      .map((w) => `${getTransformedUrl(w, 85, format)} ${w}w`)
      .join(", ");
  };

  const placeholderUrl = isSupabaseUrl 
    ? getTransformedUrl(20, 10, "webp") 
    : src;

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    "3/4": "aspect-[3/4]",
    "4/3": "aspect-[4/3]",
    wide: "aspect-[21/9]",
    auto: "",
  };

  // Using transform and opacity for GPU acceleration
  const containerStyle = {
    transform: "translateZ(0)", // Force GPU layer
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted/10",
        aspectRatio !== "auto" && aspectClasses[aspectRatio as keyof typeof aspectClasses],
        containerClassName
      )}
      style={containerStyle}
    >
      {/* Blur Placeholder */}
      {!isLoaded && !error && src && (
        <img
          src={placeholderUrl}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-full object-cover blur-2xl scale-110 transition-opacity duration-700",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
        />
      )}

      {/* Main Picture Element for AVIF/WebP support */}
      <picture>
        {isSupabaseUrl && (
          <>
            <source
              type="image/avif"
              srcSet={generateSrcSet("avif")}
              sizes={props.sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            />
            <source
              type="image/webp"
              srcSet={generateSrcSet("webp")}
              sizes={props.sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            />
          </>
        )}
        <img
          src={isSupabaseUrl ? getTransformedUrl(undefined, 85, "webp") : src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          loading={priority ? "eager" : "lazy"}
          {...(priority ? { fetchpriority: "high" } : {})}
          className={cn(
            "w-full h-full object-cover transition-all duration-1000 ease-out",
            !isLoaded ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100",
            className
          )}
          {...props}
        />
      </picture>

      {/* Subtle sharpening effect overlay could be added via CSS but better to keep it clean */}
    </div>
  );
};

export default OptimizedImage;
