const OPERATOR_REGEX = /(?:\s|^)(name|author):([^\s"']+|"[^"]*"|'[^']*')/g;

/**
 * Разбирает поисковый запрос.
 * Поддерживает операторы `name:` и `author:` (значение можно взять в кавычки),
 * остальной текст ищется по названию и автору.
 *
 *   'author:TGeinz дракон' → { operators: { author: "tgeinz" }, term: "дракон" }
 */
export function parseQuery(query) {
  const normalized = query.toLocaleLowerCase();
  const operators = {};
  for (const [, key, value] of normalized.matchAll(OPERATOR_REGEX)) {
    operators[key] = value.replace(/['"]/g, "");
  }
  const term = normalized
    .replace(OPERATOR_REGEX, "")
    .trim()
    .replace(/\s+/g, " ");
  return { operators, term };
}

const includes = (value, part) =>
  !!value && value.toLocaleLowerCase().includes(part);

export function filterGallery(gallery, query) {
  if (!query.trim()) return gallery;
  const { operators, term } = parseQuery(query);
  const entries = Object.entries(operators);

  return gallery.filter((item) => {
    if (entries.length > 0) {
      return (
        entries.every(([key, value]) => includes(item[key], value)) &&
        (!term || includes(item.name, term))
      );
    }
    return includes(item.name, term) || includes(item.author, term);
  });
}
