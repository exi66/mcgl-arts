import Packery from "packery";

function App() {
  const gallery = Object.values(
    import.meta.glob("@arts/*.{png,jpg,jpeg,PNG,JPEG}", {
      eager: true,
      as: "url",
    })
  );

  function initPackery() {
    const packeryObject = new Packery("#gallery", {
      itemSelector: "li",
      gutter: 0,
    });
    packeryObject.layout();
  }

  const onLoad = (index) => {
    if (index === gallery.length - 1) {
      setTimeout(() => {
        initPackery();
      }, 100);
    }
  };

  return (
    <>
      <ul id="gallery" style={{ padding: 0, overflowX: "hidden" }}>
        {gallery &&
          gallery.map((image, index) => {
            return (
              <li key={index} style={{ listStyle: "none", lineHeight: 0 }}>
                <img
                  src={image}
                  alt={`image №${index}`}
                  onLoad={() => onLoad(index)}
                />
              </li>
            );
          })}
      </ul>
    </>
  );
}
export default App;
