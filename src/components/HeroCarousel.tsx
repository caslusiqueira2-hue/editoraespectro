import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { Post } from "@/hooks/usePosts";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  posts: Post[];
  isLoading?: boolean;
}

const HeroCarousel = ({ posts, isLoading }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroPosts = posts.slice(0, 5); // Display top 5 latest posts

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroPosts.length);
  }, [heroPosts.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroPosts.length) % heroPosts.length);
  }, [heroPosts.length]);

  useEffect(() => {
    if (isPaused || heroPosts.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, heroPosts.length]);

  if (isLoading) {
    return (
      <section className="relative h-[70vh] sm:h-[85vh] bg-muted animate-pulse" />
    );
  }

  if (heroPosts.length === 0) return null;

  return (
    <section 
      className="relative h-[70vh] sm:h-[85vh] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        {heroPosts.map((post, index) => (
          index === currentIndex && (
            <motion.div
              key={post.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {/* Image with Ken Burns effect */}
              <motion.div
                initial={{ scale: 1.05 }}
                animate={{ scale: 1.15 }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute inset-0"
              >
                <OptimizedImage
                  src={post.imagem_url || ""}
                  alt={post.titulo}
                  priority={index === 0}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-3xl"
                  >
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[4px] text-accent mb-4 font-[family-name:var(--font-ui)]">
                      {post.categories?.nome}
                    </span>
                    <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.95] italic mb-6">
                      {post.titulo}
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-lg max-w-lg leading-relaxed mb-8 line-clamp-3">
                      {post.resumo}
                    </p>
                    <div className="flex flex-wrap items-center gap-6">
                      <Link
                        to={`/artigo/${post.slug}`}
                        className="bg-accent text-accent-foreground px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-full hover:opacity-90 transition-all transform hover:scale-105 font-[family-name:var(--font-ui)]"
                      >
                        Explorar
                      </Link>
                      <span className="text-xs text-muted-foreground tracking-widest font-[family-name:var(--font-ui)] uppercase">
                        por {post.autor}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Manual Navigation */}
      {heroPosts.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-foreground/50 hover:text-foreground transition-colors hidden md:block"
            aria-label="Anterior"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-foreground/50 hover:text-foreground transition-colors hidden md:block"
            aria-label="Próximo"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-3 h-1 max-w-sm">
            {heroPosts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className="flex-1 h-full bg-foreground/10 overflow-hidden rounded-full transition-all"
                aria-label={`Slide ${i + 1}`}
              >
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: i === currentIndex ? "100%" : i < currentIndex ? "100%" : "0%" 
                  }}
                  transition={{ 
                    duration: i === currentIndex ? 6 : 0.3, 
                    ease: "linear" 
                  }}
                />
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-muted-foreground tracking-[3px] font-[family-name:var(--font-ui)]">
            <span className="text-foreground">0{currentIndex + 1}</span>
            <div className="w-8 h-[1px] bg-muted-foreground/30" />
            <span>0{heroPosts.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
