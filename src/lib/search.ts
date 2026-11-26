import type { Artwork } from '@/lib/gallery';

const OPERATOR_REGEX = /(?:\s|^)(name|author):([^\s"']+|"[^"]*"|'[^']*')/g;

type Operator = 'name' | 'author';

export interface ParsedQuery {
  operators: Partial<Record<Operator, string>>;
  term: string;
}

/**
 * Разбирает поисковый запрос. Операторы `name:` и `author:` (значение можно взять в кавычки), остальной текст ищется
 * по названию и автору.
 *
 *   'author:TGeinz дракон' → { operators: { author: 'tgeinz' }, term: 'дракон' }
 */
export function parseQuery(query: string): ParsedQuery {
  const normalized = query.toLocaleLowerCase();
  const operators: ParsedQuery['operators'] = {};
  for (const [, key, value] of normalized.matchAll(OPERATOR_REGEX)) {
    operators[key as Operator] = value.replace(/['"]/g, '');
  }
  const term = normalized.replace(OPERATOR_REGEX, '').trim().replace(/\s+/g, ' ');
  return { operators, term };
}

const includes = (value: string | null, part: string) => !!value && value.toLocaleLowerCase().includes(part);

export function filterGallery(gallery: Artwork[], query: string): Artwork[] {
  if (!query.trim()) return gallery;
  const { operators, term } = parseQuery(query);
  const entries = Object.entries(operators) as [Operator, string][];

  return gallery.filter((item) => {
    if (entries.length > 0) {
      return entries.every(([key, value]) => includes(item[key], value)) && (!term || includes(item.name, term));
    }
    return includes(item.name, term) || includes(item.author, term);
  });
}
