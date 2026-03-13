import Header from "@/components/Header";
import Footer from "@/components/Footer";

const EnvioPage = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-20">
      <span className="text-[10px] font-bold uppercase tracking-[4px] text-accent block mb-3">
        submissões
      </span>
      <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-5xl font-black mb-8 uppercase">
        Envio de originais
      </h1>
      <div className="space-y-5 text-base leading-[1.8] text-foreground/85">
        <p>
          A Revista Subverso aceita submissões de textos originais e inéditos em língua portuguesa. 
          Publicamos ensaios, artigos, poesia, contos, crônicas e resenhas.
        </p>
        <p>
          Para enviar seu trabalho, entre em contato pelo e-mail{" "}
          <a href="mailto:contato@revistasubverso.com" className="text-accent hover:underline font-bold">
            contato@revistasubverso.com
          </a>
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mt-10 uppercase text-foreground">Diretrizes</h2>
        <ul className="list-none space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-accent mt-1">●</span>
            Textos originais e inéditos
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent mt-1">●</span>
            Em língua portuguesa
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent mt-1">●</span>
            Anexar em formato .doc, .docx ou .pdf
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent mt-1">●</span>
            Incluir breve nota biográfica do autor
          </li>
        </ul>
      </div>
    </main>
    <Footer />
  </div>
);

export default EnvioPage;
