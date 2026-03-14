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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_DOC_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
  useTrackPageView("/envio", "page");
  useDocumentTitle("Envio de Originais");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [genero, setGenero] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [textoFile, setTextoFile] = useState<File | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState("");
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
        errs.texto = "Apenas arquivos .doc ou .docx são aceitos";
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
      const textoPath = `${safeNome}_${timestamp}/${textoFile!.name}`;
      const { error: textoError } = await supabase.storage
        .from("submissions")
        .upload(textoPath, textoFile!);

      if (textoError) throw new Error("Erro ao enviar arquivo do texto");

      // Upload photo if provided
      let fotoPath: string | null = null;
      if (fotoFile) {
        fotoPath = `${safeNome}_${timestamp}/${fotoFile.name}`;
        const { error: fotoError } = await supabase.storage
          .from("submissions")
          .upload(fotoPath, fotoFile);
        if (fotoError) throw new Error("Erro ao enviar foto do autor");
      }

      // Insert submission record
      const { data: submission, error: insertError } = await supabase
        .from("submissions")
        .insert({
          nome: result.data.nome,
          email: result.data.email,
          genero: result.data.genero,
          titulo: result.data.titulo,
          mensagem: result.data.mensagem || null,
          texto_url: textoPath,
          foto_url: fotoPath,
        })
        .select("id")
        .single();

      if (insertError) throw new Error("Erro ao registrar submissão");

      // Invoke edge function (fire and forget)
      supabase.functions.invoke("handle-submission", {
        body: { submission_id: submission.id },
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
              <Label>Arquivo do texto * <span className="text-muted-foreground font-normal">(.doc, .docx)</span></Label>
              <input
                ref={textoInputRef}
                type="file"
                accept=".doc,.docx"
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
                  {textoFile ? textoFile.name : "Selecionar arquivo .doc ou .docx"}
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
