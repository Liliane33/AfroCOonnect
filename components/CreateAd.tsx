import React, { useState } from 'react';
import { AdCategory, ServiceType, User } from '../types';
import { enhanceAdDescription } from '../services/geminiService';
import { Wand2, Loader2, Save } from 'lucide-react';

interface CreateAdProps {
  currentUser: User;
  onSubmit: (adData: any) => void;
  onCancel: () => void;
}

export const CreateAd: React.FC<CreateAdProps> = ({ currentUser, onSubmit, onCancel }) => {
  const [category, setCategory] = useState<AdCategory>(AdCategory.SERVICE);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [locationTo, setLocationTo] = useState(''); // Transport only
  const [date, setDate] = useState(''); // Transport only
  const [serviceType, setServiceType] = useState<string>(ServiceType.OTHER);
  
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhanceAI = async () => {
    if (!description || !title) {
      alert("Veuillez remplir le titre et une ébauche de description.");
      return;
    }
    setIsEnhancing(true);
    const enhanced = await enhanceAdDescription(description, category, title);
    setDescription(enhanced);
    setIsEnhancing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAd = {
      id: `ad-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      category,
      title,
      description,
      price: parseFloat(price),
      currency: category === AdCategory.TRANSPORT ? 'EUR/kg' : 'XOF',
      location,
      locationTo: category === AdCategory.TRANSPORT ? locationTo : undefined,
      date: category === AdCategory.TRANSPORT ? date : undefined,
      status: 'ACTIVE',
      tags: [category === AdCategory.SERVICE ? serviceType : 'Voyage'],
      image: category === AdCategory.SERVICE ? 'https://picsum.photos/400/300?random=1' : 'https://picsum.photos/400/300?random=2'
    };
    onSubmit(newAd);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden my-8">
      <div className="bg-primary p-6 text-white">
        <h2 className="text-2xl font-bold">Publier une annonce</h2>
        <p className="opacity-90">Proposez vos services ou votre espace bagage.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Type Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${category === AdCategory.SERVICE ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
            onClick={() => setCategory(AdCategory.SERVICE)}
          >
            Service
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${category === AdCategory.TRANSPORT ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
            onClick={() => setCategory(AdCategory.TRANSPORT)}
          >
            Colis / Voyage
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce</label>
          <input 
            type="text" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={category === AdCategory.SERVICE ? "Ex: Coiffure à domicile" : "Ex: Paris vers Abidjan, 10kg dispo"}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          />
        </div>

        {category === AdCategory.SERVICE && (
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Type de Service</label>
             <select 
               value={serviceType} 
               onChange={(e) => setServiceType(e.target.value)}
               className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
             >
               {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
             </select>
           </div>
        )}

        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
              <div className="relative">
                 <input 
                    type="number" 
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-4 pr-12 py-2 rounded-lg border border-gray-300 outline-none"
                 />
                 <span className="absolute right-3 top-2 text-gray-500 text-sm">
                   {category === AdCategory.TRANSPORT ? 'EUR/kg' : 'XOF'}
                 </span>
              </div>
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville de départ</label>
              <input 
                type="text" 
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Abidjan"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
              />
           </div>
        </div>

        {category === AdCategory.TRANSPORT && (
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                 <input 
                   type="text" 
                   required
                   value={locationTo}
                   onChange={(e) => setLocationTo(e.target.value)}
                   placeholder="Ex: Paris"
                   className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Date de départ</label>
                 <input 
                   type="date" 
                   required
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
                 />
              </div>
           </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <button 
              type="button"
              onClick={handleEnhanceAI}
              disabled={isEnhancing}
              className="text-xs flex items-center text-purple-600 hover:text-purple-800 font-semibold disabled:opacity-50"
            >
              {isEnhancing ? <Loader2 size={12} className="animate-spin mr-1"/> : <Wand2 size={12} className="mr-1"/>}
              Améliorer avec l'IA
            </button>
          </div>
          <textarea 
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Décrivez votre offre en détail..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-500/30 font-medium flex items-center"
          >
            <Save size={18} className="mr-2"/>
            Publier
          </button>
        </div>

      </form>
    </div>
  );
};
