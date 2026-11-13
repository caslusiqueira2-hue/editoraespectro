import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { volumeNumber } from "@/lib/editorial";

interface MagazineCoverProps {
  volume: {
    numero: number;
    ano: number;
    capa_url: string | null;
  };
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}

const coverStyles = [
  { ink: "#e7c99a", paper: "#211a15", position: "0%" },
  { ink: "#d3dacf", paper: "#18211e", position: "50%" },
  { ink: "#ead0ca", paper: "#281d20", position: "100%" },
] as const;

export default function MagazineCover({ volume, className, priority, decorative = false }: MagazineCoverProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const { numero, ano, capa_url: coverUrl } = volume;
  const style = coverStyles[Number.isInteger(numero) && numero > 0 ? (numero - 1) % coverStyles.length : 0];
  const showUploaded = coverUrl && failedSrc !== coverUrl;
  const volumeLabel = `Volume ${volumeNumber(numero)}`;

  return (
    <div
      className={cn("magazine-cover", className)}
      style={{
        "--cover-ink": style.ink,
        "--cover-paper": style.paper,
        "--cover-position": style.position,
      } as CSSProperties}
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : `Capa da Revista Espectro, ${volumeLabel}, ${ano}`}
    >
      <div className="magazine-cover-heading">
        <span>Revista</span>
        <strong>Espectro</strong>
      </div>
      <div className="magazine-cover-art">
        {showUploaded && (
          <img
            src={coverUrl}
            alt=""
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailedSrc(coverUrl)}
          />
        )}
      </div>
      <div className="magazine-cover-imprint">
        <span>{volumeLabel}</span>
        <span>{ano}</span>
      </div>
    </div>
  );
}
