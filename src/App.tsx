import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type Viewer from 'viewerjs';
import { Moon, Search, Sun } from 'lucide-react';
import { ArtworkCard } from '@/components/artwork-card';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFocusOnCtrlF } from '@/hooks/use-focus-on-ctrl-f';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { gallery } from '@/lib/gallery';
import { filterGallery } from '@/lib/search';
import { createViewer } from '@/lib/viewer';

const getInitialSearch = () => new URLSearchParams(window.location.search).get('q') ?? '';

export default function App() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const dark = theme === 'system' ? matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark';
  const themeLabel = dark ? t('theme.light') : t('theme.dark');

  // Сейчас язык один (en.json — пустая заглушка), но подписи просмотрщика пересоздаются при смене языка.
  const lang = i18n.resolvedLanguage;

  const [search, setSearch] = useState(getInitialSearch);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLUListElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  useFocusOnCtrlF(searchInputRef);

  const { width, height } = useWindowDimensions();
  const imageMinHeight = Math.min(width - 32, height - 96, 768);

  const artworks = useMemo(() => filterGallery(gallery, search), [search]);

  useEffect(() => {
    document.title = t('app.title');
  }, [t]);

  // Запрос синхронизируется с адресной строкой (?q=...), ссылкой с поиском можно поделиться.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (search) params.set('q', search);
    else params.delete('q');
    const query = params.toString();
    window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }, [search]);

  // Подписи просмотрщика переводятся при его создании, поэтому он пересоздаётся и при смене языка.
  useEffect(() => {
    if (!containerRef.current) return;
    const viewer = createViewer(containerRef.current, artworks, imageMinHeight);
    viewerRef.current = viewer;
    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [artworks, imageMinHeight, lang]);

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex w-full max-w-270 items-center gap-4 px-4 py-2">
          <h1 className="hidden items-center gap-2 font-medium sm:flex">
            <img src="./favicon.svg" alt="" className="size-6" />
            {t('app.title')}
          </h1>
          <div className="relative ml-auto min-w-0 grow sm:max-w-72">
            <Search className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              aria-label={t('search.label')}
              placeholder={t('search.placeholder')}
              className="ps-6"
              ref={searchInputRef}
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            title={themeLabel}
            aria-label={themeLabel}
            onClick={() => setTheme(dark ? 'light' : 'dark')}
          >
            {dark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-270 flex-1 p-4">
        {artworks.length === 0 && <p className="py-16 text-center text-muted-foreground">{t('search.empty')}</p>}
        <ul ref={containerRef} className="grid list-none grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {artworks.map((artwork, index) => (
            <ArtworkCard key={artwork.src} artwork={artwork} onOpen={() => viewerRef.current?.view(index)} />
          ))}
        </ul>
      </main>
    </div>
  );
}
