import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-background mt-0">
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        <div>
          <div className="text-3xl font-black font-[family-name:var(--font-display)] tracking-tight text-foreground uppercase">
            Subverso
          </div>
          <p className="mt-3 text-muted-foreground text-sm max-w-xs leading-relaxed">
            Uma revista de literatura, pensamento e cultura. Publicamos ensaios, poesia, ficção e resenhas.
          </p>
        </div>
        <div className="flex items-start gap-8 text-xs uppercase tracking-widest text-muted-foreground">
          <Link to="/envio" className="hover:text-accent transition-colors">
            Envio
          </Link>
          <Link to="/" className="hover:text-accent transition-colors">
            Contato
          </Link>
          <a
            href="https://www.instagram.com/oversosub/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={16} />
          </a>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-border text-[10px] text-muted-foreground text-center uppercase tracking-[3px]">
        Revista Subverso © 2026
      </div>
    </div>
  </footer>
);

export default Footer;
