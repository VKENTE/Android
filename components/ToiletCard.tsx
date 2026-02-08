
import React from 'react';
import { ToiletLocation } from '../types';

interface ToiletCardProps {
  location: ToiletLocation;
}

const ToiletCard: React.FC<ToiletCardProps> = ({ location }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
          {location.title}
        </h3>
        <a 
          href={location.uri} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
          title="In Google Maps öffnen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4-4-4 4"/><path d="M12 8v8"/></svg>
        </a>
      </div>
      
      {location.snippets && location.snippets.length > 0 && (
        <div className="space-y-2 mb-4">
          {location.snippets.map((snippet, idx) => (
            <p key={idx} className="text-sm text-slate-600 italic leading-relaxed">
              "{snippet}"
            </p>
          ))}
        </div>
      )}

      <a 
        href={location.uri} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline gap-1"
      >
        Route in Google Maps anzeigen
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    </div>
  );
};

export default ToiletCard;
