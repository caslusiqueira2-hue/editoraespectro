import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => (
  <footer className="border-t-4 border-accent bg-primary text-primary-foreground mt-16">
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="text-2xl font-black font-[family-name:var(--font-display)] tracking-tight">
            subverso
          </div>
          <p className="mt-2 text-primary-foreground/70 text-sm max-w-xs leading-relaxed">
            Uma revista de literatura, pensamento e cultura. Publicamos ensaios, poesia, ficção e resenhas.
          </p>
        </div>
        <div className="flex items-start gap-6 text-sm">
          <Link to="/envio" className="hover:text-accent transition-colors">
            Envio de originais
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
            <Instagram size={18} />
          </a>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-primary-foreground/15 text-xs text-primary-foreground/50 text-center">
        REVISTA SUBVERSO © 2026
      </div>
    </div>
  </footer>
);

export default Footer;
