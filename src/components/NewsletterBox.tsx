import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";
import { useSubscribe } from "@/hooks/useNewsletter";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const subscribe = useSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Insira um e-mail válido.");
      return;
    }

    try {
      await subscribe.mutateAsync(trimmed);
      setSuccess(true);
      setEmail("");
    } catch {
      setErrorMsg("Não foi possível registrar seu e-mail. Tente novamente.");
    }
  };

  return (
    <section className="border-y border-foreground bg-secondary px-4 py-7 sm:px-8 sm:py-10" aria-labelledby="newsletter-title">
      <div className="flex items-center gap-2 mb-3">
        <Mail size={16} className="text-accent" />
        <span className="editorial-label">Newsletter</span>
      </div>

      <h3 id="newsletter-title" className="text-3xl leading-tight sm:text-4xl">
        Frequência Espectro
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Cadastre seu e-mail na lista da Editora Espectro.
      </p>

      {success ? (
        <div className="mt-5 flex items-center gap-2 text-accent text-sm font-medium" role="status">
          <Check size={18} />
          Cadastro recebido. Obrigado!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-3">
          <label htmlFor="newsletter-email" className="sr-only">Seu e-mail</label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="min-w-0 max-w-md flex-1 bg-background text-foreground text-sm px-4 py-3 rounded-none border border-border outline-none focus:ring-2 focus:ring-accent placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="bg-accent text-accent-foreground px-6 py-3 rounded-none text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {subscribe.isPending ? "Inscrevendo…" : (
              <>Inscrever-se <ArrowRight size={14} /></>
            )}
          </button>
        </form>
      )}
      {errorMsg && <p className="mt-2 text-destructive text-sm" role="alert">{errorMsg}</p>}
    </section>
  );
}
