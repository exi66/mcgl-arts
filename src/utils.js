import { useState, useEffect } from "react";

export function patchViewer(viewer) {
  const originalInitImage = viewer.initImage;
  const patchedInitImage = function (done) {
    return originalInitImage.call(this, () => {
      const { imageData, viewerData, toolbar, options } = this;
      if (
        options.imageMinHeight &&
        imageData.naturalHeight < options.imageMinHeight
      ) {
        const toolbarHeight = toolbar?.clientHeight ?? 0;
        const viewerWidth = viewerData.width;
        const viewerHeight = viewerData.height - toolbarHeight;

        const initialZoomRatio = Math.floor(
          options.imageMinHeight / imageData.naturalHeight
        );

        const ratio = Math.min(
          (viewerWidth * options.initialCoverage) / imageData.naturalWidth,
          (viewerHeight * options.initialCoverage) / imageData.naturalHeight,
          initialZoomRatio
        );
        imageData.ratio = ratio;
        imageData.width = imageData.naturalWidth * ratio;
        imageData.height = imageData.naturalHeight * ratio;
        imageData.x = (viewerWidth - imageData.width) / 2;
        imageData.y = (viewerHeight - imageData.height) / 2;
      }
      if (done) done();
    });
  };
  viewer.initImage = patchedInitImage;
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
