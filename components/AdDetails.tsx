import React from 'react';
import { Ad, AdCategory } from '../types';
import { MapPin, Calendar, ArrowLeft, MessageCircle, ShieldCheck, Star, Share2, Clock, ExternalLink } from 'lucide-react';

interface AdDetailsProps {
  ad: Ad;
  onBack: () => void;
  onContact: () => void;
  onBook: () => void;
}

export const AdDetails: React.FC<AdDetailsProps> = ({ ad, onBack, onContact, onBook }) => {
  const isTransport = ad.category === AdCategory.TRANSPORT;
  
  // Génération de l'URL pour la map (version embed sans clé API pour la démo)
  const mapLocation = encodeURIComponent(ad.location);
  const mapUrl = `https://maps.google.com/maps?q=${mapLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-2xl md:shadow-sm md:border border-gray-100 md:my-8 overflow-hidden">
      {/* Header Mobile & Desktop nav */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 p-4 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-primary font-medium transition">
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="md:flex">
        {/* Left Column: Image & Key Info */}
        <div className="md:w-1/2">
          <div className="h-64 md:h-96 w-full relative bg-gray-100">
            <img 
              src={ad.image} 
              alt={ad.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
               <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${isTransport ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                {isTransport ? 'Transport & Colis' : 'Service à la personne'}
              </span>
            </div>
          </div>

          {/* Map Section Mobile/Desktop (Placed here for layout balance) */}
          <div className="hidden md:block p-6 border-b md:border-b-0 md:border-r border-gray-100">
             <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                <MapPin size={18} className="mr-2 text-primary" />
                Localisation
             </h3>
             <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner relative">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  title="map"
                  src={mapUrl}
                  className="filter grayscale hover:grayscale-0 transition duration-500"
                ></iframe>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${mapLocation}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2 right-2 bg-white shadow-sm px-2 py-1 text-xs font-bold rounded text-primary flex items-center gap-1 hover:bg-gray-50"
                >
                  Voir sur Maps <ExternalLink size={10} />
                </a>
            </div>
            <p className="text-sm text-gray-500 mt-2 ml-1">{ad.location}</p>
          </div>
        </div>

        {/* Right Column: Content & Actions */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{ad.title}</h1>
              <div className="text-xl font-bold text-primary whitespace-nowrap ml-4">
                {ad.price} <span className="text-sm font-normal text-gray-500">{ad.currency}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6 text-sm">
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <MapPin size={16} className="mr-1 text-gray-400" />
                <span>{ad.location} {isTransport && ad.locationTo && `➝ ${ad.locationTo}`}</span>
              </div>
              {isTransport && ad.date && (
                <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                  <Calendar size={16} className="mr-1" />
                  <span>{ad.date}</span>
                </div>
              )}
            </div>

            {/* Map Mobile Only */}
            <div className="md:hidden mb-6">
                 <div className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={mapUrl}
                      className="opacity-90"
                    ></iframe>
                 </div>
            </div>

            <div className="prose prose-sm text-gray-600 mb-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
              <p className="whitespace-pre-line leading-relaxed">{ad.description}</p>
            </div>

            {/* Author Block */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100 mb-8">
              <div className="flex items-center gap-3">
                <img src={ad.authorAvatar} alt={ad.authorName} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{ad.authorName}</p>
                  <div className="flex items-center text-xs text-yellow-500">
                    <Star size={12} fill="currentColor" />
                    <span className="ml-1 text-gray-600">4.8 (12 avis)</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 flex flex-col items-end">
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-500" /> Identité vérifiée</span>
                <span className="flex items-center gap-1 mt-1"><Clock size={12} /> Répond vite</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t border-gray-100 pt-6 mt-auto space-y-3">
            <button 
              onClick={onContact}
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 hover:text-primary hover:border-primary transition flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              Discuter avec {ad.authorName.split(' ')[0]}
            </button>
            
            <button 
              onClick={onBook}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition flex items-center justify-center gap-2"
            >
              {isTransport ? 'Réserver mes kilos' : 'Réserver ce service'} • {ad.price} {ad.currency}
            </button>
            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              <ShieldCheck size={12} /> Paiement sécurisé via la plateforme
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};