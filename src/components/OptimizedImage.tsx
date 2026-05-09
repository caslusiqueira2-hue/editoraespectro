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
  const isSupabaseUrl = src.includes("supabase.co/storage/v1/object/public/");

  // Generate transformation URL for Supabase
  const getTransformedUrl = (width?: number, quality = 80, format: "webp" | "avif" | "origin" = "webp") => {
    if (!isSupabaseUrl) return src;
    
    // Supabase image transformation params
    // Note: This requires the project to have image transformation enabled
    const params = new URLSearchParams();
    if (width) params.append("width", width.toString());
    params.append("quality", quality.toString());
    if (format !== "origin") params.append("format", format);
    
    // If it already has params, we need to handle that, but usually getPublicUrl doesn't add them
    return `${src}?${params.toString()}`;
  };

  // Generate srcset for Supabase images
  const generateSrcSet = () => {
    if (!isSupabaseUrl) return undefined;
    
    const widths = [400, 800, 1200, 1600, 2000];
    return widths
      .map((w) => `${getTransformedUrl(w, 80, "webp")} ${w}w`)
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

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted/20",
        aspectRatio !== "auto" && aspectClasses[aspectRatio as keyof typeof aspectClasses],
        containerClassName
      )}
    >
      {/* Blur Placeholder */}
      {!isLoaded && !error && (
        <img
          src={placeholderUrl}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-full object-cover blur-2xl scale-110 transition-opacity duration-500",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
        />
      )}

      {/* Main Image */}
      <img
        src={isSupabaseUrl ? getTransformedUrl(undefined, 85, "webp") : src}
        srcSet={generateSrcSet()}
        sizes={props.sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={cn(
          "w-full h-full object-cover transition-all duration-700",
          !isLoaded ? "opacity-0 scale-105" : "opacity-100 scale-100",
          className
        )}
        {...props}
      />

      {/* Edge fallbacks for AVIF if supported/needed could be added here via <picture> 
          but for simplicity and because Supabase handles format via query params, 
          using <img> with a default webp is very efficient. */}
    </div>
  );
};

export default OptimizedImage;
