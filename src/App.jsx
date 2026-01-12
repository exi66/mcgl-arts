import Viewer from "viewerjs";
import { useState, useEffect } from "react";
import { patchViewer, useWindowDimensions } from "@/lib/utils";
import { Masonry } from "masonic";

let viewer = null;

function App() {
  const { width, height } = useWindowDimensions();

  const handleDocumentKeyDown = (event) => {
    const keyCode = event.keyCode || event.which || event.charCode;

    if (!viewer || !viewer.isShown) return;
    switch (keyCode) {
      case 27:
        viewer.hide();
        break;
      case 38:
        event.preventDefault();
        viewer.zoom(viewer.options.zoomRatio, true);
        break;
      case 40:
        event.preventDefault();
        viewer.zoom(-viewer.options.zoomRatio, true);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, []);

  const images = Object.values(
    import.meta.glob("@artworks/*.{png,jpg,jpeg,PNG,JPEG}", {
      eager: true,
      query: "?url",
      import: "default",
    })
  );

  const gallery = images.map((image) => {
    const filename = image.replace(/^.*[\\/]/, "").replace(/\.[^/.]+$/, "");
    return {
      src: image,
      name: filename.split(".")[0],
      author: filename.split(".")[1] || null,
    };
  });

  function createViewerInstance() {
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
      navbar: false,
      toolbar: {
        zoomIn: 4,
        zoomOut: 4,
        oneToOne: 4,
      },
      keyboard: false,
      slideOnTouch: false,
      title: [
        true,
        (image, imageData) => {
          const index = parseInt(
            viewer.images[viewer.index].id.replace("artwork-", "")
          );
          const { name, author } = gallery[index];
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
  }

  return (
    <>
      <main className="max-w-6xl px-4 py-4 mx-auto">
        <div className="flex flex-col gap-4 mb-4">
          <div className="border-b ">
            <h1 className="text-3xl font-bold text-center mb-4 flex items-center justify-center gap-1">
              <img src="favicon.svg" className="inline-block mr-2 w-8" />
              Архив картин MCGL
            </h1>
          </div>
        </div>
        <Masonry
          tabIndex={-1}
          className="outline-none"
          id="artworks-container"
          onRender={createViewerInstance}
          items={gallery}
          columnGutter={32}
          columnWidth={256}
          overscanBy={4}
          render={Card}
        />
      </main>
    </>
  );
}

const Card = ({ index, data: { src, name, author } }) => {
  const [scaleRate, setscaleRate] = useState({ width: 1, height: 1 });
  const [dimensions, setDimensions] = useState({ width: null, height: null });

  function openViewer() {
    if (viewer) {
      const images = viewer.images;
      const __index = images?.findIndex((img) => img.id === "artwork-" + index);
      if (__index && __index !== -1) {
        viewer.view(__index);
      } else {
        console.warn("Image not found in viewer:", "artwork-" + index);
      }
    }
  }

  return (
    <>
      <div
        className="rounded cursor-pointer relative group"
        onClick={() => openViewer()}
      >
        <div className="bg-linear-to-t from-background to-transparent w-full h-full transition-all duration-100 absolute top-0 left-0 rounded group-hover:opacity-100 opacity-0 flex items-end justify-start p-2">
          <div className="flex flex-col">
            <span className="font-semibold">{name}</span>
            {author && <span className="font-semibold">by {author}</span>}
            <span>
              {dimensions.width} × {dimensions.height} (
              {Math.floor(dimensions.width / 64)} ×{" "}
              {Math.floor(dimensions.height / 64)})
            </span>
          </div>
        </div>
        <img
          id={`artwork-${index}`}
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.target;
            const { width, height } = e.target;
            setDimensions({ width: naturalWidth, height: naturalHeight });
            setscaleRate({
              width: width / naturalWidth,
              height: height / naturalHeight,
            });
          }}
          className="w-full h-auto rounded min-w-64 bg-muted"
          src={src}
          alt={name}
          style={{
            imageRendering:
              scaleRate.height >= 1 || scaleRate.width >= 1
                ? "pixelated"
                : "auto",
          }}
        />
      </div>
    </>
  );
};

export default App;
