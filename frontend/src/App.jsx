import React, { useState, useEffect } from "react";
import MapComponent from "./components/MapComponent";

function App() {
  const [places, setPlaces] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [activePlace, setActivePlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/places")
      .then((res) => {
        if (!res.ok)
          throw new Error("Грешка при дърпане на данните от сървъра");
        return res.json();
      })
      .then((data) => {
        setPlaces(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const activeProps = activePlace?.properties;

  return (
    // md:flex-row сменя подредбата на хоризонтална за компютри, на телефон е flex-col (вертикално)
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-900 font-sans antialiased text-slate-200 relative">
      {/* Ляв панел / Bottom Sheet за телефон */}
      <div
        className="
        w-full md:w-96 
        h-[35vh] md:h-full 
        bg-slate-800 shadow-2xl z-10 
        flex flex-col 
        border-t md:border-t-0 md:border-r border-slate-700
        order-2 md:order-1
      "
      >
        {/* ЗАГЛАВНА ЧАСТ */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md transition-all duration-300 shrink-0">
          <h1 className="text-lg md:text-xl font-black tracking-tight uppercase min-h-[28px] md:min-h-[32px] flex items-center gap-2 truncate">
            {activeProps ? (
              <span className="text-emerald-200 animate-fade-in flex items-center gap-2 truncate">
                {activeProps.icon || "⛰️"} {activeProps.title}
              </span>
            ) : (
              "Местна Карта"
            )}
          </h1>
          <p className="text-[10px] md:text-xs text-emerald-100 mt-0.5 font-medium">
            {activeProps
              ? "Преглед на избраната местност"
              : "Дигитален регистър на местности и чукари"}
          </p>
        </div>

        {/* КОНТЕНТ ЗОНА */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto space-y-4">
          {loading && (
            <div className="flex items-center justify-center h-24 md:h-32 text-slate-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500 mr-2"></div>
              <span className="text-sm">Зареждане...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500 rounded-xl text-red-200 text-xs md:text-sm">
              ⚠️ {error}
            </div>
          )}

          {!loading &&
            !error &&
            (activeProps ? (
              <div className="space-y-4 md:space-y-5 animate-fade-in">
                {activeProps.image && (
                  <img
                    src={activeProps.image}
                    alt={activeProps.title}
                    className="w-full h-32 md:h-52 object-cover rounded-xl md:rounded-2xl shadow-lg border border-slate-700"
                  />
                )}

                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {activeProps.title}
                  </h2>
                  <div className="flex gap-2 mt-1.5">
                    {activeProps.elevation && (
                      <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-slate-700 text-emerald-400 rounded-lg text-[10px] md:text-xs font-semibold border border-slate-600">
                        ⛰️ {activeProps.elevation}
                      </span>
                    )}
                    {activeProps.difficulty && (
                      <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-slate-700 text-amber-400 rounded-lg text-[10px] md:text-xs font-semibold border border-slate-600">
                        🥾 {activeProps.difficulty}
                      </span>
                    )}
                    {/* Хитър бутон за затваряне/нулиране на селекцията на телефон */}
                    <button
                      onClick={() => setActivePlace(null)}
                      className="ml-auto text-[10px] md:hidden bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded-lg border border-slate-600 text-slate-300 font-bold"
                    >
                      Х ЗАТВОРИ
                    </button>
                  </div>
                </div>

                <hr className="border-slate-700" />

                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed text-xs md:text-sm whitespace-pre-line">
                    {activeProps.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 md:py-16 text-slate-500">
                <div className="text-3xl md:text-5xl mb-2 md:mb-4 opacity-40">
                  🗺️
                </div>
                <p className="text-xs md:text-sm font-medium px-4">
                  Кликни върху маркер на картата, за да прочетеш историята и да
                  я разгледаш.
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* КАРТА ЗОНА */}
      <div className="flex-1 h-[65vh] md:h-full order-1 md:order-2 bg-slate-950 relative">
        <MapComponent
          places={places}
          onSelectPlace={setActivePlace}
          activePlace={activePlace}
        />
      </div>
    </div>
  );
}

export default App;
