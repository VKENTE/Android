
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ToiletCard from './components/ToiletCard';
import { findToilets } from './services/geminiService';
import { SearchResult, UserLocation } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get initial user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation permission denied or error:", err);
        }
      );
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent, isNearby = false) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await findToilets(
        userLocation?.latitude,
        userLocation?.longitude,
        isNearby ? undefined : query
      );
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Etwas ist schief gelaufen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-8">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Finden Sie die nächste <span className="text-blue-600">Saubere Toilette</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Nutzen Sie unsere KI-Suche, um öffentliche Toiletten in Ihrer Nähe zu finden – mit Bewertungen und Wegbeschreibungen.
          </p>
        </section>

        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200 border border-slate-100 mb-10">
          <form onSubmit={(e) => handleSearch(e)} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 placeholder-slate-400"
                placeholder="Stadt, Straße oder Ort eingeben..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || (!query && !userLocation)}
              className="bg-blue-600 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
            >
              {loading ? 'Suche läuft...' : 'Suchen'}
            </button>
            <button
              type="button"
              onClick={() => handleSearch(undefined, true)}
              disabled={loading || !userLocation}
              className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold px-6 py-4 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
              title="Toiletten in meiner Nähe suchen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="7" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="17"/><line x1="17" y1="12" x2="16" y2="12"/><line x1="8" y1="12" x2="7" y2="12"/></svg>
              <span>In der Nähe</span>
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium italic">Unsere KI sucht nach den besten Standorten...</p>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="prose prose-slate max-w-none bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Suche-Zusammenfassung</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{results.text}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.locations.map((loc, idx) => (
                <ToiletCard key={idx} location={loc} />
              ))}
            </div>

            {results.locations.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400">Keine spezifischen Orte in der Grounding-Antwort gefunden, aber schauen Sie oben in die Zusammenfassung.</p>
              </div>
            )}
          </div>
        )}

        {!results && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Sauberkeit</h4>
              <p className="text-sm text-slate-500">Filtern nach verifizierten Bewertungen für hygienische Standards.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Barrierefrei</h4>
              <p className="text-sm text-slate-500">Informationen über Rollstuhlgerechtigkeit auf einen Blick.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Öffnungszeiten</h4>
              <p className="text-sm text-slate-500">Immer wissen, welche Toilette gerade geöffnet ist.</p>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-4 mt-20 text-center text-slate-400 text-sm">
        <p>&copy; 2024 Toilet Finder Pro. Powered by Gemini Maps Grounding.</p>
      </footer>
    </div>
  );
};

export default App;
