import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  containerClassName?: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide" | "auto" | "3/4" | "4/3";
  priority?: boolean;
}

const aspectClasses = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  "3/4": "aspect-[3/4]",
  "4/3": "aspect-[4/3]",
  wide: "aspect-[21/9]",
  auto: "",
};

function ImageContent({ src, alt, className, priority, onError, ...props }: OptimizedImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="editorial-image-placeholder absolute inset-0" aria-hidden="true" />;
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "auto" : "async"}
      {...(priority ? { fetchpriority: "high" } : {})}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      className={cn("block w-full h-full object-cover", className)}
    />
  );
}

export default function OptimizedImage({ src, containerClassName, aspectRatio = "auto", ...props }: OptimizedImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-secondary", aspectClasses[aspectRatio], containerClassName)}>
      <ImageContent key={src} src={src} {...props} />
    </div>
  );
}
