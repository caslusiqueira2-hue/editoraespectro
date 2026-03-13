const QuoteBar = () => (
  <div className="bg-secondary py-16 my-0">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <div className="text-accent text-4xl mb-4">"</div>
      <blockquote className="font-[family-name:var(--font-display)] text-xl md:text-3xl text-foreground font-bold leading-snug uppercase">
        A literatura é a pergunta que o mundo nunca soube que precisava fazer.
      </blockquote>
      <cite className="block mt-6 text-xs font-semibold text-muted-foreground not-italic uppercase tracking-[3px]">
        — Editora Espectro
      </cite>
    </div>
  </div>
);

export default QuoteBar;
