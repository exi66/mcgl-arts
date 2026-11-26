import i18next from 'i18next';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import { type Artwork, toBlocks } from '@/lib/gallery';

interface ImageData {
  naturalWidth: number;
  naturalHeight: number;
  ratio: number;
  width: number;
  height: number;
  x: number;
  y: number;
}

type Options = Viewer.Options & { imageMinHeight?: number; initialCoverage: number };

/** Внутренности viewerjs, которые трогает патч (в типах пакета их нет). */
interface ViewerInternals {
  index: number;
  initImage: (done?: () => void) => void;
  imageData: ImageData;
  viewerData: { width: number; height: number };
  toolbar?: HTMLElement;
  options: Options;
}

/**
 * Пиксель-арты маленькие (часто 64–256 px), и viewerjs по умолчанию показывает их в натуральном размере. Патч
 * увеличивает такие картинки целым множителем (чтобы пиксели оставались ровными) до options.imageMinHeight.
 *
 * ВНИМАНИЕ: подменяется внутренний метод initImage — при обновлении viewerjs проверить, что патч работает (версия
 * зафиксирована в package.json, Renovate не обновляет её сам).
 */
function patchViewer(viewer: Viewer) {
  const internals = viewer as unknown as ViewerInternals;
  const originalInitImage = internals.initImage;
  internals.initImage = function (this: ViewerInternals, done) {
    return originalInitImage.call(this, () => {
      const { imageData, viewerData, toolbar, options } = this;
      if (options.imageMinHeight && imageData.naturalHeight < options.imageMinHeight) {
        const viewerWidth = viewerData.width;
        const viewerHeight = viewerData.height - (toolbar?.clientHeight ?? 0);

        const ratio = Math.min(
          (viewerWidth * options.initialCoverage) / imageData.naturalWidth,
          (viewerHeight * options.initialCoverage) / imageData.naturalHeight,
          Math.floor(options.imageMinHeight / imageData.naturalHeight),
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

function formatTitle({ name, author }: Artwork, { naturalWidth, naturalHeight }: ImageData) {
  return [
    i18next.t('viewer.name', { name }),
    author && i18next.t('viewer.author', { author }),
    i18next.t('viewer.size', {
      width: naturalWidth,
      height: naturalHeight,
      blocksWidth: toBlocks(naturalWidth),
      blocksHeight: toBlocks(naturalHeight),
    }),
  ]
    .filter(Boolean)
    .join('\r\n');
}

export function createViewer(container: HTMLElement, items: Artwork[], imageMinHeight: number): Viewer {
  const options: Options = {
    inline: false,
    scalable: false,
    rotatable: false,
    zoomRatio: 0.33,
    initialCoverage: 0.9,
    fullscreen: false,
    toolbar: 4,
    // 1 — заголовок виден на любой ширине экрана.
    title: [
      1,
      (_image: HTMLImageElement, imageData: ImageData) =>
        formatTitle(items[(viewer as unknown as ViewerInternals).index], imageData),
    ],
    imageMinHeight,
  };
  const viewer = new Viewer(container, options);
  patchViewer(viewer);
  return viewer;
}
