import capaManifesto from "@/assets/capa-manifesto.jpg";

export interface Artigo {
  id: number;
  slug: string;
  titulo: string;
  subtitulo: string;
  autor: string;
  data: string;
  categoria: string;
  categoriaSlug: string;
  destaque: boolean;
  imagem: string;
  resumo: string;
  conteudo?: string[];
}

export const ARTIGOS: Artigo[] = [
  {
    id: 10,
    slug: "boas-vindas",
    titulo: "Boas-vindas: a literatura como subversão",
    subtitulo: "A palavra escrita como ato de resistência",
    autor: "Christian Siqueira",
    data: "21 de fevereiro de 2026",
    categoria: "Ensaios & Artigos",
    categoriaSlug: "ensaios",
    destaque: false,
    imagem: capaManifesto,
    resumo: "A Editora Espectro nasce da convicção de que a palavra escrita é, antes de tudo, um ato de resistência ao óbvio e ao previsível.",
    conteudo: [
      "A literatura nunca foi um lugar confortável — e ainda bem.",
      "A Editora Espectro nasce da convicção de que a palavra escrita é, antes de tudo, um ato de resistência. Resistência ao óbvio, ao previsível, ao silêncio que o mundo tantas vezes nos impõe. Aqui, o verso não obedece, a prosa não se acomoda, e o pensamento recusa a linha reta.",
      "Nosso nome não é provocação gratuita. É um manifesto. Espectro, no sentido mais honesto da palavra, significa aquilo que persiste — o que não se apaga, o que pulsa nas margens. É isso que buscamos em cada página: a voz que insiste em existir, a história que ainda não foi contada do jeito que merecia, a imagem que desestabiliza antes de iluminar.",
      "A Editora Espectro é um espaço para quem escreve com urgência e para quem lê com fome. Publicamos poesia, conto, crônica, ensaio, experimentação — tudo o que for capaz de fazer a linguagem suar, tremer, se reinventar. Não temos medo do inacabado, do híbrido, do que escapa às categorias.",
      "Se você chegou até aqui, provavelmente já sabe que a literatura não é entretenimento passivo. É encontro. É atrito. É o momento em que alguém coloca no papel exatamente aquilo que você nunca soube como dizer.",
      "Seja bem-vindo a esse lugar inquieto.",
      "**Leia, escreva, subverta.**",
    ],
  },
];

export interface Categoria {
  nome: string;
  slug: string;
}

export const CATEGORIAS: Categoria[] = [
  { nome: "Início", slug: "" },
  { nome: "Ensaios & Artigos", slug: "ensaios" },
  { nome: "Poesia", slug: "poesia" },
  { nome: "Conto", slug: "conto" },
  { nome: "Resenhas", slug: "resenhas" },
  { nome: "Envio de originais", slug: "envio" },
];
