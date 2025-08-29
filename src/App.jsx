import Packery from "packery";
import { useEffect } from "react";

function App() {
  var packeryObject = null;

  const gallery = Object.values(
    import.meta.glob("@arts/*.{png,jpg,jpeg,PNG,JPEG}", {
      eager: true,
      as: "url",
    })
  );

  useEffect(() => {
    initPackery();
  });

  function initPackery() {
    setTimeout(() => {
      if (packeryObject) return;
      packeryObject = new Packery("#gallery", {
        itemSelector: "img",
        gutter: 0,
      });
    }, 100);
  }

  return (
    <>
      <div id="gallery">
        {gallery &&
          gallery.map((image, index) => {
            return <img key={index} src={image} alt={`image №${index}`} />;
          })}
      </div>
    </>
  );
}
export default App;
