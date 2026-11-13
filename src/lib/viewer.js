import Viewer from "viewerjs";
import { CANVAS_BLOCK } from "@/lib/gallery";

/**
 * Пиксель-арты маленькие (часто 64–256 px), и viewerjs по умолчанию показывает их
 * в натуральном размере. Патч увеличивает такие картинки целым множителем
 * (чтобы пиксели оставались ровными) до options.imageMinHeight.
 *
 * ВНИМАНИЕ: подменяется внутренний метод initImage — при обновлении viewerjs
 * проверить, что патч работает (версия зафиксирована в package.json).
 */
function patchViewer(viewer) {
  const originalInitImage = viewer.initImage;
  viewer.initImage = function (done) {
    return originalInitImage.call(this, () => {
      const { imageData, viewerData, toolbar, options } = this;
      if (
        options.imageMinHeight &&
        imageData.naturalHeight < options.imageMinHeight
      ) {
        const toolbarHeight = toolbar?.clientHeight ?? 0;
        const viewerWidth = viewerData.width;
        const viewerHeight = viewerData.height - toolbarHeight;

        const ratio = Math.min(
          (viewerWidth * options.initialCoverage) / imageData.naturalWidth,
          (viewerHeight * options.initialCoverage) / imageData.naturalHeight,
          Math.floor(options.imageMinHeight / imageData.naturalHeight)
        );
        imageData.ratio = ratio;
        imageData.width = imageData.naturalWidth * ratio;
        imageData.height = imageData.naturalHeight * ratio;
        imageData.x = (viewerWidth - imageData.width) / 2;
        imageData.y = (viewerHeight - imageData.height) / 2;
      }
      done?.();
    });
  };
}

function formatTitle({ name, author }, { naturalWidth, naturalHeight }) {
  return [
    `Название: ${name}`,
    author && `Автор: ${author}`,
    `Размер: ${naturalWidth} × ${naturalHeight} (${Math.floor(
      naturalWidth / CANVAS_BLOCK
    )} × ${Math.floor(naturalHeight / CANVAS_BLOCK)})`,
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function createViewer(container, items, imageMinHeight) {
  const viewer = new Viewer(container, {
    inline: false,
    scalable: false,
    rotatable: false,
    zoomRatio: 0.33,
    initialCoverage: 0.9,
    fullscreen: false,
    toolbar: 4,
    title: [
      true,
      (image, imageData) => formatTitle(items[viewer.index], imageData),
    ],
    imageMinHeight,
  });
  patchViewer(viewer);
  return viewer;
}
