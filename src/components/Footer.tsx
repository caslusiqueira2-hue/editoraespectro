import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Instagram } from "lucide-react";

const ADMIN_EMAIL = "christianlucas12@gmail.com";

const Footer = () => {
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const handleYearClick = () => {
    const next = clickCount + 1;
    setClickCount(next);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (next >= 3) {
      setClickCount(0);
      navigate("/admin");
      return;
    }

    timerRef.current = setTimeout(() => setClickCount(0), 1000);
  };

  return (
    <footer className="border-t border-border bg-background mt-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="text-3xl font-black font-[family-name:var(--font-display)] tracking-tight text-foreground uppercase">
              Espectro
            </div>
            <p className="mt-3 text-muted-foreground text-sm max-w-xs leading-relaxed">
              Uma editora de literatura, pensamento e cultura. Publicamos ensaios, poesia, ficção e resenhas.
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
          Editora Espectro ©{" "}
          <span onClick={handleYearClick} className="cursor-default select-none">
            2026
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
