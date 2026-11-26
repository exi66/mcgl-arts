import { describe, expect, it } from 'vitest';
import { type Artwork, parseArtworkPath } from '@/lib/gallery';
import { filterGallery, parseQuery } from '@/lib/search';

const art = (name: string, author: string | null): Artwork => ({ src: `${author}/${name}.png`, name, author });
const gallery = [art('Дракон', 'TGeinz'), art('Дракон', 'MsEliza'), art('Ева', 'MsEliza'), art('Без автора', null)];
const names = (items: Artwork[]) => items.map((a) => `${a.name}/${a.author}`);

describe('parseQuery', () => {
  it('splits operators and the free term', () => {
    expect(parseQuery('author:TGeinz  Дракон ')).toEqual({ operators: { author: 'tgeinz' }, term: 'дракон' });
  });

  it('accepts quoted values', () => {
    expect(parseQuery('name:"Ночь в майнкрафте"').operators).toEqual({ name: 'ночь в майнкрафте' });
  });
});

describe('filterGallery', () => {
  it('returns everything for an empty query', () => {
    expect(filterGallery(gallery, '  ')).toBe(gallery);
  });

  it('searches the term in name and author', () => {
    expect(names(filterGallery(gallery, 'eliza'))).toEqual(['Дракон/MsEliza', 'Ева/MsEliza']);
    expect(names(filterGallery(gallery, 'дракон'))).toEqual(['Дракон/TGeinz', 'Дракон/MsEliza']);
  });

  it('with operators, the term matches the name only', () => {
    expect(names(filterGallery(gallery, 'author:mseliza дра'))).toEqual(['Дракон/MsEliza']);
    expect(filterGallery(gallery, 'author:tgeinz eliza')).toEqual([]);
  });
});

describe('parseArtworkPath', () => {
  it('takes the author from the folder and the name from the file', () => {
    expect(parseArtworkPath('../assets/artworks/TGeinz/Котик с шарфом.png')).toEqual({
      name: 'Котик с шарфом',
      author: 'TGeinz',
    });
  });

  it('treats the default folder as no author', () => {
    expect(parseArtworkPath('../assets/artworks/default/Ева.jpeg')).toEqual({ name: 'Ева', author: null });
  });
});
