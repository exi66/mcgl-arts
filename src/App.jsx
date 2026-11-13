import { useState, useEffect, useMemo, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ArtworkCard } from "@/components/ArtworkCard";
import { gallery } from "@/lib/gallery";
import { filterGallery } from "@/lib/search";
import { createViewer } from "@/lib/viewer";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useFocusOnCtrlF } from "@/hooks/useFocusOnCtrlF";

const getInitialSearch = () =>
  new URLSearchParams(window.location.search).get("q") ?? "";

const App = () => {
  const [search, setSearch] = useState(getInitialSearch);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  useFocusOnCtrlF(searchInputRef);

  const { width, height } = useWindowDimensions();
  const imageMinHeight = Math.min(width - 32, height - 96, 768);

  const artworks = useMemo(() => filterGallery(gallery, search), [search]);

  // Синхронизация запроса с адресной строкой (?q=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (search) params.set("q", search);
    else params.delete("q");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname
    );
  }, [search]);

  useEffect(() => {
    const viewer = createViewer(containerRef.current, artworks, imageMinHeight);
    viewerRef.current = viewer;
    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [artworks, imageMinHeight]);

  return (
    <div className="max-w-270 p-4 mx-auto space-y-2">
      <header className="flex flex-row justify-between items-center">
        <h1 className="hidden sm:flex text-2xl font-bold items-center">
          <img src="favicon.svg" alt="" className="inline-block mr-2 w-8" />
          <span>Архив картин MCGL</span>
        </h1>
        <div className="relative grow sm:max-w-64">
          <Search className="absolute top-1/2 left-2 -translate-y-1/2 w-4 h-4" />
          <Input
            id="search"
            type="search"
            aria-label="Поиск"
            placeholder="Поиск по названию или автору"
            className="ps-8"
            ref={searchInputRef}
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>
      </header>
      <div className="border-b w-full h-px" />
      <main>
        {artworks.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            Ничего не найдено
          </p>
        )}
        <ul
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mx-auto list-none"
        >
          {artworks.map((artwork, index) => (
            <ArtworkCard
              key={artwork.src}
              artwork={artwork}
              onOpen={() => viewerRef.current?.view(index)}
            />
          ))}
        </ul>
      </main>
    </div>
  );
};

export default App;
