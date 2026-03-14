const QuoteBar = () => (
  <div className="bg-secondary py-10 sm:py-16 my-0">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <div className="text-accent text-3xl sm:text-4xl mb-3 sm:mb-4">"</div>
      <blockquote className="font-[family-name:var(--font-display)] text-lg sm:text-xl md:text-3xl text-foreground font-bold leading-snug italic">
        A literatura é a pergunta que o mundo nunca soube que precisava fazer.
      </blockquote>
      <cite className="block mt-4 sm:mt-6 text-xs font-semibold text-muted-foreground not-italic uppercase tracking-[3px]">
        — Editora Espectro
      </cite>
    </div>
  </div>
);

export default QuoteBar;
