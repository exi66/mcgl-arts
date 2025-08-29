import { PhotoProvider, PhotoView } from "react-photo-view";

function App() {
  const gallery = Object.values(
    import.meta.glob("@arts/*.{png,jpg,jpeg,PNG,JPEG}", {
      eager: true,
      as: "url",
    })
  );

  return (
    <>
      <PhotoProvider>
        <div className="grid grid-cols-6 grid-flow-row gap-3 p-4">
          {gallery.map((item, index) => (
            <PhotoView key={index} src={item}>
              <div
                className="aspect-square border border-white/20 rounded hover:scale-105 transition-all hover:bg-white/10 cursor-pointer bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${item})`,
                  imageRendering: "pixelated",
                }}
              ></div>
            </PhotoView>
          ))}
        </div>
      </PhotoProvider>
    </>
  );
}

export default App;
