const QuoteBar = () => (
  <div className="bg-accent py-10 my-16">
    <div className="max-w-3xl mx-auto px-4 text-center">
      <blockquote className="font-[family-name:var(--font-display)] text-xl md:text-2xl italic text-accent-foreground font-medium">
        "A literatura é a pergunta que o mundo nunca soube que precisava fazer."
      </blockquote>
      <cite className="block mt-3 text-sm font-semibold text-accent-foreground/70 not-italic">
        — Revista Subverso
      </cite>
    </div>
  </div>
);

export default QuoteBar;
