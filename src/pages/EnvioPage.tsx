import Header from "@/components/Header";
import Footer from "@/components/Footer";

const EnvioPage = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black mb-6">
        Envio de originais
      </h1>
      <div className="prose max-w-none text-base leading-relaxed space-y-4">
        <p>
          A Revista Subverso aceita submissões de textos originais e inéditos em língua portuguesa. 
          Publicamos ensaios, artigos, poesia, contos, crônicas e resenhas.
        </p>
        <p>
          Para enviar seu trabalho, entre em contato pelo e-mail{" "}
          <a href="mailto:contato@revistasubverso.com" className="text-accent hover:underline font-semibold">
            contato@revistasubverso.com
          </a>
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mt-8">Diretrizes</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Textos originais e inéditos</li>
          <li>Em língua portuguesa</li>
          <li>Anexar em formato .doc, .docx ou .pdf</li>
          <li>Incluir breve nota biográfica do autor</li>
        </ul>
      </div>
    </main>
    <Footer />
  </div>
);

export default EnvioPage;
