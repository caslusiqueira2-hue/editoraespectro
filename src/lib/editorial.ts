export const MAGAZINE_SECTIONS = {
  conto: "Contos",
  poesia: "Poesia",
  ensaio: "Ensaios",
  resenha: "Resenhas",
} as const;

export function volumeNumber(number: number) {
  if (!Number.isInteger(number) || number < 1 || number > 3999) return String(number);
  const numerals = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"],
    [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ] as const;
  let result = "";
  for (const [value, symbol] of numerals) {
    result += symbol.repeat(Math.floor(number / value));
    number %= value;
  }
  return result;
}

export function searchTerms(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR").trim();
}

export function plainText(html: string) {
  return new DOMParser().parseFromString(html.replace(/<[^>]*>/g, " "), "text/html")
    .body.textContent?.replace(/\s+/g, " ").trim() ?? "";
}
