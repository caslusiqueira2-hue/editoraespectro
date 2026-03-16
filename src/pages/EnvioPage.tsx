import { useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Image, CheckCircle2, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

function generateUUID(): string {
  try {
    return crypto.randomUUID();
  } catch {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    const hex = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
}

function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_DOC_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
];
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const GENEROS = ["Conto", "Crônica", "Poema", "Ensaio", "Resenha"] as const;

const formSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(200),
  email: z.string().trim().email("E-mail inválido").max(255),
  genero: z.string().min(1, "Selecione um gênero"),
  titulo: z.string().trim().min(1, "Título é obrigatório").max(300),
  mensagem: z.string().max(2000).optional(),
});

const EnvioPage = () => {
  const { data: envioVisible, isLoading } = useSiteSetting("envio_page_visible");
  const { data: revistaVisible } = useSiteSetting("envio_revista_visible");
  useTrackPageView("/envio", "page");
  useDocumentTitle("Envio de Originais");

  const [destino, setDestino] = useState<"site" | "revista">("site");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [genero, setGenero] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [textoFile, setTextoFile] = useState<File | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [aceite, setAceite] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const textoInputRef = useRef<HTMLInputElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = () => {
    const errs: Record<string, string> = {};
    if (!textoFile) {
      errs.texto = "Arquivo do texto é obrigatório";
    } else {
      if (!ACCEPTED_DOC_TYPES.includes(textoFile.type)) {
        errs.texto = "Apenas arquivos .doc, .docx ou .pdf são aceitos";
      }
      if (textoFile.size > MAX_FILE_SIZE) {
        errs.texto = "O arquivo deve ter no máximo 10 MB";
      }
    }
    if (fotoFile) {
      if (!ACCEPTED_IMAGE_TYPES.includes(fotoFile.type)) {
        errs.foto = "Apenas imagens JPG ou PNG são aceitas";
      }
      if (fotoFile.size > MAX_FILE_SIZE) {
        errs.foto = "A imagem deve ter no máximo 10 MB";
      }
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown || submitting) return;

    // Honeypot check
    if (honeypot) return;

    setErrors({});

    const result = formSchema.safeParse({ nome, email, genero, titulo, mensagem });
    const fileErrors = validateFiles();

    if (!aceite) {
      fileErrors.aceite = "Você deve concordar com as diretrizes e termos para enviar.";
    }

    if (!result.success || Object.keys(fileErrors).length > 0) {
      const fieldErrors: Record<string, string> = {};
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          fieldErrors[issue.path[0] as string] = issue.message;
        });
      }
      setErrors({ ...fieldErrors, ...fileErrors });
      return;
    }

    setSubmitting(true);

    try {
      const timestamp = Date.now();
      const safeNome = nome.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);

      // Upload text file
      const textoPath = `${safeNome}_${timestamp}/${sanitizeFileName(textoFile!.name)}`;
      const { error: textoError } = await supabase.storage
        .from("submissions")
        .upload(textoPath, textoFile!);

      if (textoError) throw new Error(`Erro ao enviar arquivo do texto: ${textoError.message}`);

      // Upload photo if provided
      let fotoPath: string | null = null;
      if (fotoFile) {
        fotoPath = `${safeNome}_${timestamp}/${sanitizeFileName(fotoFile.name)}`;
        const { error: fotoError } = await supabase.storage
          .from("submissions")
          .upload(fotoPath, fotoFile);
        if (fotoError) throw new Error(`Erro ao enviar foto: ${fotoError.message}`);
      }

      // Insert submission record
      const submissionId = generateUUID();
      const { error: insertError } = await supabase
        .from("submissions")
        .insert({
          id: submissionId,
          nome: result.data.nome,
          email: result.data.email,
          genero: result.data.genero,
          titulo: result.data.titulo,
          mensagem: result.data.mensagem || null,
          texto_url: textoPath,
          foto_url: fotoPath,
          destino,
        });

      if (insertError) {
        console.error("Insert error:", JSON.stringify(insertError));
        throw new Error(`Erro ao registrar submissão: ${insertError.message}`);
      }

      // Invoke edge function (fire and forget)
      supabase.functions.invoke("handle-submission", {
        body: { submission_id: submissionId },
      }).catch(() => {});

      setSuccess(true);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 30000);
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao enviar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background" />;
  if (envioVisible === false) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-20 w-full">
        <span className="text-[10px] font-bold uppercase tracking-[4px] text-accent block mb-3">
          submissões
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-5xl font-black mb-8 uppercase">
          Envio de originais
        </h1>

        {/* Introduction */}
        <div className="space-y-5 text-base leading-[1.8] text-foreground/85 mb-12">
          <p>
            A Editora Espectro aceita submissões de textos originais e inéditos em língua portuguesa.
            Publicamos ensaios, artigos, poesia, contos, crônicas e resenhas.
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mt-10 uppercase text-foreground">
            Diretrizes
          </h2>
          <ul className="list-none space-y-3 text-muted-foreground">
            {[
              "Textos originais e inéditos",
              "Em língua portuguesa",
              "Até 3 poemas de 1 página cada",
              "Demais textos até 3 páginas",
              "Enviar em formato .doc ou .docx",
              "Incluir breve nota biográfica do autor",
              "Tamanho máximo do arquivo: 10 MB",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-accent mt-1">●</span>
                {item}
              </li>
            ))}
          </ul>

          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mt-10 uppercase text-foreground">
            Formatação do texto
          </h2>
          <ul className="list-none space-y-3 text-muted-foreground">
            {[
              "Fonte: Times New Roman",
              "Margens 2,5 (esquerda, direita, antes e depois)",
              "Espaçamento: Simples",
              "Alinhamento do texto: justificado",
              "Título: centralizado",
              "Nome do autor: alinhado à esquerda",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-accent mt-1">●</span>
                {item}
              </li>
            ))}
          </ul>

          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mt-10 uppercase text-foreground">
            Autorização do autor
          </h2>
          <p className="text-muted-foreground">
            Ao submeter um texto, o autor declara que:
          </p>
          <ul className="list-none space-y-3 text-muted-foreground">
            {[
              "É titular dos direitos autorais da obra enviada",
              "Autoriza a equipe editorial a realizar correções gramaticais pontuais, caso necessário",
              "Autoriza a publicação de sua imagem de perfil no site e nas redes sociais da editora para fins de divulgação",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-accent mt-1">●</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground italic">
            Os direitos autorais da obra permanecem integralmente com o autor, que tem liberdade para publicar o texto em outros veículos, se assim desejar.
          </p>
        </div>

        {success ? (
          <div className="border border-accent/30 rounded-lg p-8 text-center space-y-4 bg-accent/5">
            <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase text-foreground">
              Texto enviado com sucesso
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
              Seu texto foi enviado com sucesso. A equipe editorial analisará o material e poderá entrar em contato.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot */}
            <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Destino */}
            <div className="space-y-2">
              <Label>Contribuir para *</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDestino("site")}
                  className={`flex-1 py-3 px-4 rounded-lg border text-sm font-bold uppercase tracking-wider transition-all ${
                    destino === "site"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  Site
                </button>
                {revistaVisible && (
                  <button
                    type="button"
                    onClick={() => setDestino("revista")}
                    className={`flex-1 py-3 px-4 rounded-lg border text-sm font-bold uppercase tracking-wider transition-all ${
                      destino === "revista"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    Revista
                  </button>
                )}
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                maxLength={200}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                maxLength={255}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Gênero */}
            <div className="space-y-2">
              <Label>Gênero *</Label>
              <Select value={genero} onValueChange={setGenero}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  {GENEROS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.genero && <p className="text-sm text-destructive">{errors.genero}</p>}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do texto *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título da obra"
                maxLength={300}
              />
              {errors.titulo && <p className="text-sm text-destructive">{errors.titulo}</p>}
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem (opcional)</Label>
              <Textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Informações adicionais para a equipe editorial"
                maxLength={2000}
                rows={4}
              />
            </div>

            {/* Arquivo do texto */}
            <div className="space-y-2">
              <Label>Arquivo do texto * <span className="text-muted-foreground font-normal">(.doc, .docx, .pdf)</span></Label>
              <input
                ref={textoInputRef}
                type="file"
                accept=".doc,.docx,.pdf"
                className="hidden"
                onChange={(e) => setTextoFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => textoInputRef.current?.click()}
                className="w-full flex items-center gap-3 border border-input rounded-md px-4 py-3 text-sm hover:bg-accent/10 transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-accent shrink-0" />
                <span className="truncate text-muted-foreground">
                  {textoFile ? textoFile.name : "Selecionar arquivo .doc, .docx ou .pdf"}
                </span>
              </button>
              {errors.texto && <p className="text-sm text-destructive">{errors.texto}</p>}
            </div>

            {/* Foto do autor */}
            <div className="space-y-2">
              <Label>Foto do autor <span className="text-muted-foreground font-normal">(opcional — JPG ou PNG)</span></Label>
              <input
                ref={fotoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fotoInputRef.current?.click()}
                className="w-full flex items-center gap-3 border border-input rounded-md px-4 py-3 text-sm hover:bg-accent/10 transition-colors text-left"
              >
                <Image className="w-5 h-5 text-accent shrink-0" />
                <span className="truncate text-muted-foreground">
                  {fotoFile ? fotoFile.name : "Selecionar imagem JPG ou PNG"}
                </span>
              </button>
              {errors.foto && <p className="text-sm text-destructive">{errors.foto}</p>}
              <p className="text-xs text-muted-foreground italic">Se possível, envie a foto no seguinte formato: 1080×1350 px</p>
            </div>

            {/* Aceite dos termos */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="aceite"
                  checked={aceite}
                  onCheckedChange={(v) => setAceite(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="aceite" className="text-sm leading-relaxed text-muted-foreground cursor-pointer">
                  Li e concordo com as diretrizes de envio e os termos de autorização do autor.
                </Label>
              </div>
              {errors.aceite && <p className="text-sm text-destructive">{errors.aceite}</p>}
            </div>

            <Button
              type="submit"
              disabled={submitting || cooldown}
              className="w-full uppercase tracking-widest font-bold"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Enviar texto
                </>
              )}
            </Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EnvioPage;
