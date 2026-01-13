import Viewer from "viewerjs";
import { useState, useEffect, useRef } from "react";
import { patchViewer, useWindowDimensions } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

let viewer = null;

const useCtrlF = (onTrigger) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyF") {
        event.preventDefault();
        onTrigger();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onTrigger]);
};

const getGallery = () => {
  return Object.values(
    import.meta.glob("@artworks/*/*.{png,jpg,jpeg,PNG,JPEG}", {
      eager: true,
      query: "?url",
      import: "default",
    })
  ).map((image) => {
    const filename = image.replace(/^.*[\\/]/, "").replace(/\.[^/.]+$/, "");
    return {
      src: image,
      name: decodeURI(filename.split(".")[0]),
      author: decodeURI(filename.split(".")[1]) || null,
    };
  });
};

const initialGallery = getGallery();

const App = () => {
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const searchInputRef = useRef(null);
  const focusSearchInput = () => {
    searchInputRef.current?.focus();
  };
  useCtrlF(focusSearchInput);

  const { width, height } = useWindowDimensions();

  const gallery = initialGallery.filter((e) => {
    if (!search || search.trim() == "") return true;
    const query = search.toLocaleLowerCase();
    const regex = /(?:\s|^)([a-zA-Z]+):([^\s"']+|"[^"]*"|'[^']*')/g;
    const operators = {};
    let match;
    while ((match = regex.exec(query)) !== null) {
      operators[match[1]] = match[2].replace(/['"]/g, "");
    }
    const searchTerm = query.replace(regex, "").trim().replace(/\s+/g, " ");

    if (Object.keys(operators).length > 0) {
      for (const [key, value] of Object.entries(operators)) {
        if (!e[key]) return false;
        if (!e[key].toLocaleLowerCase().includes(value)) return false;
      }
      return searchTerm
        ? e.name.toLocaleLowerCase().includes(searchTerm)
        : true;
    } else {
      return (
        (e.author && e.author.toLocaleLowerCase().includes(searchTerm)) ||
        e.name.toLocaleLowerCase().includes(searchTerm)
      );
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (search) {
      params.set("q", search);
    } else {
      params.delete("q");
    }
    const newRelativePathQuery =
      window.location.pathname + "?" + params.toString();
    window.history.replaceState(null, "", newRelativePathQuery);
  }, [search]);

  useEffect(() => {
    if (viewer) {
      viewer.destroy();
    }
    viewer = new Viewer(document.getElementById("artworks-container"), {
      inline: false,
      scalable: false,
      rotatable: false,
      zoomRatio: 0.33,
      initialCoverage: 0.9,
      fullscreen: false,
      toolbar: 4,
      title: [
        true,
        (image, imageData) => {
          const { name, author } = gallery[viewer.index];
          const canvasWidth = Math.floor(imageData.naturalWidth / 64);
          const canvasHeight = Math.floor(imageData.naturalHeight / 64);
          const desc = [
            `Название: ${name}`,
            `Автор: ${author}`,
            `Размер: ${imageData.naturalWidth} × ${imageData.naturalHeight} (${canvasWidth} × ${canvasHeight})`,
          ];
          if (!author) desc.splice(1, 1);
          return desc.join("\r\n");
        },
      ],
      imageMinHeight: Math.min(width - 32, height - 96, 768),
    });
    patchViewer(viewer);
  }, [width, height, gallery]);

  return (
    <>
      <div className="max-w-266 p-4 mx-auto space-y-2">
        <header className="flex flex-row justify-between items-center">
          <h1 className="hidden sm:flex text-2xl font-bold items-center">
            <img src="favicon.svg" className="inline-block mr-2 w-8" />
            <span>Архив картин MCGL</span>
          </h1>
          <div className="relative grow sm:max-w-64">
            <Search className="absolute top-1/2 left-2 -translate-y-1/2 w-4 h-4" />
            <Input
              type="text"
              placeholder="Поиск по названию или автору"
              className="ps-8"
              ref={searchInputRef}
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>
        </header>
        <div className="border-b w-full h-px"></div>
        <main>
          <ul
            id="artworks-container"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 grid-flow-row gap-2 mx-auto list-none"
          >
            {gallery.map((item, index) => (
              <Card key={index} index={index} data={item} />
            ))}
          </ul>
        </main>
      </div>
    </>
  );
};

const Card = ({ index, data: { src, name, author } }) => {
  const [scaleRate, setscaleRate] = useState({ width: 1, height: 1 });
  const [dimensions, setDimensions] = useState({ width: null, height: null });

  function openViewer() {
    if (viewer) {
      viewer.view(index);
    }
  }

  return (
    <>
      <li
        className="aspect-square bg-muted cursor-pointer relative group"
        onClick={() => openViewer()}
      >
        <div className="bg-linear-to-t from-background to-transparent w-full h-full transition-all absolute top-0 left-0 rounded group-hover:opacity-100 opacity-0 flex flex-col justify-end">
          <div className="p-2">
            <p className="font-semibold">{name}</p>
            {author && <p className="font-semibold">by {author}</p>}
            <p>
              {dimensions.width} × {dimensions.height} (
              {Math.floor(dimensions.width / 64)} ×{" "}
              {Math.floor(dimensions.height / 64)})
            </p>
          </div>
        </div>
        <img
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.target;
            const { width, height } = e.target;
            setDimensions({ width: naturalWidth, height: naturalHeight });
            setscaleRate({
              width: width / naturalWidth,
              height: height / naturalHeight,
            });
          }}
          className="h-full w-full object-cover bg-muted"
          src={src}
          alt={name}
          style={{
            imageRendering:
              scaleRate.height >= 1 || scaleRate.width >= 1
                ? "pixelated"
                : "auto",
          }}
        />
      </li>
    </>
  );
};

export default App;
