import Packery from "packery";
import { useEffect } from "react";

var packeryObject = null;

function App() {
  const gallery = Object.values(
    import.meta.glob("@arts/*.{png,jpg,jpeg,PNG,JPEG}", {
      eager: true,
      as: "url",
    })
  );

  useEffect(() => {
    if (!packeryObject) {
      packeryObject = new Packery("#gallery", {
        itemSelector: "img",
        gutter: 0,
      });
    }
  });

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
