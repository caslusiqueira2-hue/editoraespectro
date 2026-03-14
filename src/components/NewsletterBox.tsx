import { useState } from "react";
import { motion } from "framer-motion";
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
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao inscrever.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border border-border rounded-2xl p-6 sm:p-10 bg-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <Mail size={16} className="text-accent" />
        <span className="text-[10px] font-bold uppercase tracking-[4px] text-accent">
          Frequência Espectro
        </span>
      </div>

      <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-black text-foreground uppercase leading-tight">
        Receba novos textos da Editora Espectro
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Contos, poemas e textos insólitos diretamente no seu e-mail.
      </p>

      {success ? (
        <div className="mt-5 flex items-center gap-2 text-accent text-sm font-medium">
          <Check size={18} />
          Inscrição confirmada! Obrigado.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="flex-1 bg-secondary text-foreground text-sm px-4 py-3 rounded-full border border-border outline-none focus:ring-2 focus:ring-accent placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="bg-accent text-accent-foreground px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {subscribe.isPending ? "Inscrevendo…" : (
              <>Inscrever-se <ArrowRight size={14} /></>
            )}
          </button>
        </form>
      )}
      {errorMsg && <p className="mt-2 text-destructive text-sm">{errorMsg}</p>}
    </motion.section>
  );
}
