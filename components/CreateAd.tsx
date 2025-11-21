import React, { useState } from 'react';
import { AdCategory, ServiceType, User } from '../types';
import { enhanceAdDescription, predictCategoryAndType } from '../services/geminiService';
import { Wand2, Loader2, Save, Sparkles, CheckCircle, MapPin, PartyPopper } from 'lucide-react';

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
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionSuccess, setPredictionSuccess] = useState(false);
  
  // Location & Success states
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleAutoCategorize = async () => {
    if (!title || title.length < 3) {
      alert("Veuillez entrer un titre plus explicite.");
      return;
    }
    setIsPredicting(true);
    setPredictionSuccess(false);
    
    const prediction = await predictCategoryAndType(title);
    
    if (prediction) {
      if (prediction.category === 'SERVICE') {
        setCategory(AdCategory.SERVICE);
        if (prediction.serviceType) {
          setServiceType(prediction.serviceType);
        }
      } else if (prediction.category === 'TRANSPORT') {
        setCategory(AdCategory.TRANSPORT);
      }
      setPredictionSuccess(true);
      setTimeout(() => setPredictionSuccess(false), 3000);
    }
    
    setIsPredicting(false);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Tentative de reverse geocoding via OpenStreetMap (gratuit)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
          
          if (city) {
            setLocation(city);
          } else {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          console.error("Erreur geocoding:", error);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Erreur position:", error);
        alert("Impossible de récupérer votre position.");
        setIsLoadingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Afficher l'écran de succès d'abord
    setShowSuccess(true);

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

    // Attendre 2.5 secondes pour que l'utilisateur voie le message de félicitations
    setTimeout(() => {
      onSubmit(newAd);
    }, 2500);
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden my-8 p-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <PartyPopper size={48} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Félicitations ! 🎉</h2>
        <p className="text-xl text-gray-600 mb-6">Votre annonce <span className="font-bold text-primary">"{title}"</span> est maintenant en ligne.</p>
        <p className="text-gray-500">Vous recevrez un email dès qu'un utilisateur sera intéressé.</p>
        <div className="mt-8">
          <Loader2 className="animate-spin mx-auto text-primary" size={24} />
          <p className="text-xs text-gray-400 mt-2">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden my-8">
      <div className="bg-primary p-6 text-white">
        <h2 className="text-2xl font-bold">Publier une annonce</h2>
        <p className="opacity-90">Proposez vos services ou votre espace bagage.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Title Input with AI Magic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce</label>
          <div className="relative">
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={category === AdCategory.SERVICE ? "Ex: Coiffure à domicile" : "Ex: Paris vers Abidjan, 10kg dispo"}
              className="w-full pl-4 pr-32 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
            <button
              type="button"
              onClick={handleAutoCategorize}
              disabled={isPredicting || !title}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md text-xs font-medium transition disabled:opacity-50"
              title="Détecter la catégorie automatiquement"
            >
              {isPredicting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : predictionSuccess ? (
                <>
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-green-600">Adapté !</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Catégorie ?</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Utilisez le bouton magique pour détecter automatiquement la catégorie.</p>
        </div>

        {/* Type Switcher */}
        <div className={`flex p-1 bg-gray-100 rounded-lg transition-all duration-500 ${predictionSuccess ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
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

        {category === AdCategory.SERVICE && (
           <div className={`transition-all duration-500 ${predictionSuccess ? 'animate-pulse' : ''}`}>
             <label className="block text-sm font-medium text-gray-700 mb-1">Type de Service</label>
             <select 
               value={serviceType} 
               onChange={(e) => setServiceType(e.target.value)}
               className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-primary"
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
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Abidjan"
                  className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleGeolocation}
                  disabled={isLoadingLocation}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition"
                  title="Utiliser ma position actuelle"
                >
                  {isLoadingLocation ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Cliquez sur l'épingle pour vous localiser.</p>
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