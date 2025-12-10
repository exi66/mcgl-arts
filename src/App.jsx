import Viewer from "viewerjs";
import { useEffect } from "react";
import { patchViewer, useWindowDimensions } from "./utils";

let viewer;

function App() {
  const { width, height } = useWindowDimensions();

  const gallery = Object.values(
    import.meta.glob("@arts/*.{png,jpg,jpeg,PNG,JPEG}", {
      eager: true,
      as: "url",
    })
  );

  useEffect(() => {
    if (viewer) {
      viewer.destroy();
    }
    viewer = new Viewer(document.getElementById("images"), {
      inline: false,
      scalable: false,
      rotatable: false,
      zoomRatio: 0.33,
      initialCoverage: 0.9,
      fullscreen: false,
      title: [
        4,
        (image, imageData) =>
          `${imageData.naturalWidth} × ${imageData.naturalHeight} (${Math.floor(
            imageData.naturalWidth / 64
          )} × ${Math.floor(imageData.naturalHeight / 64)} холста)`,
      ],
      imageMinHeight: Math.min(width - 32, height - 96, 768),
    });
    patchViewer(viewer);
  }, [width, height]);

  return (
    <>
      <ul
        id="images"
        className="grid grid-cols-3 md:grid-cols-6 grid-flow-row gap-3 p-4 max-w-6xl mx-auto list-none"
      >
        {gallery.map((item, index) => (
          <li
            onClick={() => viewer?.view(index)}
            key={index}
            className="aspect-square border border-white/20 rounded hover:scale-105 transition-all hover:bg-white/10 cursor-pointer bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${item})`,
              imageRendering: "pixelated",
            }}
          >
            <img src={item} className="sr-only" />
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
