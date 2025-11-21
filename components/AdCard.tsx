import React from 'react';
import { Ad, AdCategory } from '../types';
import { MapPin, Calendar, ArrowRight, Star, MessageCircle } from 'lucide-react';

interface AdCardProps {
  ad: Ad;
  onClick: () => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onClick }) => {
  const isTransport = ad.category === AdCategory.TRANSPORT;

  return (
    <div onClick={onClick} className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all cursor-pointer flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={ad.image} 
          alt={ad.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${isTransport ? 'bg-blue-500' : 'bg-emerald-500'}`}>
            {isTransport ? 'Transport' : 'Service'}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-sm font-bold text-primary shadow-sm">
          {ad.price} {ad.currency}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">{ad.title}</h3>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-3 space-x-2">
          <MapPin size={14} />
          <span className="truncate">
            {ad.location} {isTransport && ad.locationTo && <span className="mx-1">➝ {ad.locationTo}</span>}
          </span>
        </div>

        {isTransport && ad.date && (
           <div className="flex items-center text-sm text-blue-600 bg-blue-50 p-2 rounded-md mb-3">
             <Calendar size={14} className="mr-2" />
             <span>Départ: {ad.date}</span>
           </div>
        )}

        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">{ad.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
          <div className="flex items-center space-x-2">
            <img src={ad.authorAvatar} alt={ad.authorName} className="w-6 h-6 rounded-full" />
            <span className="text-xs font-medium text-gray-600">{ad.authorName}</span>
          </div>
          <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition">
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
