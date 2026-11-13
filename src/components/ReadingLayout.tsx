import type { ReactNode } from "react";
import OptimizedImage from "@/components/OptimizedImage";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface ReadingLayoutProps {
  breadcrumbs: ReactNode;
  section: string;
  title: string;
  subtitle?: string | null;
  author: string;
  date?: string;
  image?: string | null;
  poetry?: boolean;
  content: string;
  children?: ReactNode;
}

export default function ReadingLayout({
  breadcrumbs, section, title, subtitle, author, date, image, poetry, content, children,
}: ReadingLayoutProps) {
  return (
    <main className="editorial-wrap flex-1 py-6 sm:py-10">
      <article className="reading-page mx-auto">
        <header className="border-y border-border py-5 sm:py-7">
          <nav aria-label="Localização" className="reading-crumbs">
            {breadcrumbs}
          </nav>
          <p className="editorial-label mt-5 sm:mt-7">{section}</p>
          <h1 className="editorial-headline mt-2 text-balance">{title}</h1>
          {subtitle && <p className="reading-subtitle mt-3 text-xl text-muted-foreground sm:text-2xl">{subtitle}</p>}
          <div className="reading-byline mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span>{author}</span>
            {date && (
              <time dateTime={date} className="text-muted-foreground">
                {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(date))}
              </time>
            )}
          </div>
        </header>
        {image && (
          <OptimizedImage
            src={image}
            alt=""
            priority
            containerClassName="reading-illustration mt-4 sm:mt-7"
            className="absolute inset-0"
          />
        )}
        <div
          className={cn("prose-editor editorial-reading reading-copy mt-6 sm:mt-9", poetry && "reading-poetry")}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />
      </article>
      {children && <div className="reading-after reading-page mx-auto mt-12 border-t border-border pt-6 sm:mt-16">{children}</div>}
    </main>
  );
}
