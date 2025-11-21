
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Phone, MapPin, ChevronDown, AlertCircle, MessageSquare, CheckCircle, KeyRound, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const COUNTRY_CODES = [
  { code: '+225', country: 'CI', flag: '🇨🇮', name: 'Côte d\'Ivoire' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+221', country: 'SN', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+237', country: 'CM', flag: '🇨🇲', name: 'Cameroun' },
  { code: '+223', country: 'ML', flag: '🇲🇱', name: 'Mali' },
  { code: '+226', country: 'BF', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+229', country: 'BJ', flag: '🇧🇯', name: 'Bénin' },
  { code: '+228', country: 'TG', flag: '🇹🇬', name: 'Togo' },
  { code: '+241', country: 'GA', flag: '🇬🇦', name: 'Gabon' },
  { code: '+242', country: 'CG', flag: '🇨🇬', name: 'Congo' },
  { code: '+243', country: 'CD', flag: '🇨🇩', name: 'RDC' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'USA' },
  { code: '+44', country: 'UK', flag: '🇬🇧', name: 'UK' },
];

// Clé pour le stockage local (simulation de BDD)
const STORAGE_KEY = 'afroconnect_users_db';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LOGIN');
  const [step, setStep] = useState<'FORM' | 'VERIFICATION' | 'RESET_NEW_PASSWORD'>('FORM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Pour le reset
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code);
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [rememberMe, setRememberMe] = useState(false);

  // Verification States
  const [verificationCode, setVerificationCode] = useState('');

  // Initialisation de la "Base de données" locale avec les utilisateurs mockés
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      const initialDB: Record<string, any> = {};
      // On ajoute les utilisateurs de démo avec un mot de passe par défaut
      MOCK_USERS.forEach(u => {
        initialDB[u.email] = {
          ...u,
          password: 'password123!' // Mot de passe par défaut pour la démo
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDB));
    }
  }, []);

  if (!isOpen) return null;

  // Helpers pour la BDD Locale
  const getLocalUsers = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const saveLocalUser = (userData: any) => {
    const users = getLocalUsers();
    users[userData.email] = userData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
        return "Le mot de passe doit faire au moins 6 caractères.";
    }
    if (pwd.length > 20) {
      return "Le mot de passe ne doit pas dépasser 20 caractères.";
    }
    // Regex simple pour démo : juste check longueur et un caractère spécial optionnel
    // Pour être strict comme demandé :
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(pwd)) {
       return "Ajoutez au moins un caractère spécial (!@#$...).";
    }
    return null;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    // --- LOGIQUE LOGIN ---
    if (mode === 'LOGIN') {
        setTimeout(() => {
            const users = getLocalUsers();
            const user = users[email];

            if (!user) {
                setError("Cet email ne correspond à aucun compte.");
                setLoading(false);
                return;
            }

            if (user.password !== password) {
                setError("Mot de passe incorrect.");
                setLoading(false);
                return;
            }

            // Succès
            setLoading(false);
            onLogin(user); // On passe l'objet user (sans le mot de passe idéalement, mais ici on prend tout)
            onClose();
            resetForm();
        }, 1000);
    } 
    
    // --- LOGIQUE REGISTER ---
    else if (mode === 'REGISTER') {
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        // Vérifier si l'email existe déjà
        const users = getLocalUsers();
        if (users[email]) {
            setError("Un compte existe déjà avec cet email.");
            setLoading(false);
            return;
        }

        // Simulation d'envoi du code
        setTimeout(() => {
            setLoading(false);
            setStep('VERIFICATION');
        }, 1000);
    }

    // --- LOGIQUE FORGOT PASSWORD (STEP 1: EMAIL) ---
    else if (mode === 'FORGOT_PASSWORD' && step === 'FORM') {
        setTimeout(() => {
            const users = getLocalUsers();
            if (!users[email]) {
                // Par sécurité, on ne dit pas toujours si l'email n'existe pas, mais pour l'UX ici on le dit
                setError("Aucun compte associé à cet email.");
                setLoading(false);
                return;
            }

            setLoading(false);
            setSuccessMsg(`Un lien de réinitialisation a été envoyé à ${email}`);
            
            // Simulation : on passe directement à l'étape de nouveau mot de passe après 1.5s
            setTimeout(() => {
                setSuccessMsg(null);
                setStep('RESET_NEW_PASSWORD');
            }, 1500);
        }, 1000);
    }
    
    // --- LOGIQUE RESET PASSWORD (STEP 3: NEW PASSWORD) ---
    else if (mode === 'FORGOT_PASSWORD' && step === 'RESET_NEW_PASSWORD') {
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }
        
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        setTimeout(() => {
            const users = getLocalUsers();
            if (users[email]) {
                users[email].password = password; // Mise à jour du mot de passe
                localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
                
                setLoading(false);
                setSuccessMsg("Mot de passe modifié avec succès !");
                
                setTimeout(() => {
                    setMode('LOGIN');
                    setStep('FORM');
                    setPassword('');
                    setConfirmPassword('');
                    setSuccessMsg(null);
                }, 1500);
            } else {
                setLoading(false);
                setError("Erreur technique. Veuillez réessayer.");
            }
        }, 1000);
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length < 4) {
      setError("Code invalide.");
      return;
    }
    setLoading(true);

    // Finalisation de l'inscription
    setTimeout(() => {
      const fullPhone = `${countryCode} ${phone}`;
      
      const newUser = {
        id: `u-${Date.now()}`,
        name: name,
        email: email,
        password: password, // Sauvegarde du mot de passe
        phone: fullPhone,
        address: address,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        role: role,
        rating: 5.0,
        reviewsCount: 0,
        walletBalance: 0
      };
      
      saveLocalUser(newUser); // Sauvegarde persistence
      
      setLoading(false);
      onLogin(newUser);
      onClose();
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
      setTimeout(() => {
        setStep('FORM');
        setVerificationCode('');
        setMode('LOGIN');
        setError(null);
        setSuccessMsg(null);
        setPassword('');
        setConfirmPassword('');
      }, 500);
  };

  const handleModeSwitch = (newMode: 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD') => {
    setMode(newMode);
    setError(null); 
    setSuccessMsg(null);
    setStep('FORM');
    setPassword('');
  };

  // Rendu dynamique du titre
  const getTitle = () => {
      if (mode === 'FORGOT_PASSWORD') {
          if (step === 'RESET_NEW_PASSWORD') return "Nouveau mot de passe";
          return "Réinitialisation";
      }
      if (mode === 'REGISTER') {
          if (step === 'VERIFICATION') return "Vérification";
          return "Créer un compte";
      }
      return "Bon retour !";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col relative animate-fade-in-up max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 bg-white rounded-full p-1">
          <X size={24} />
        </button>

        {/* Header Back Button for Forgot Password flow */}
        {mode === 'FORGOT_PASSWORD' && step === 'FORM' && (
            <button onClick={() => handleModeSwitch('LOGIN')} className="absolute top-4 left-4 text-gray-400 hover:text-primary z-10">
                <ArrowLeft size={24} />
            </button>
        )}

        <div className="p-8 overflow-y-auto scrollbar-hide">
          
          <div className="text-center mb-6">
            {/* Icone dynamique */}
            <div className="w-16 h-16 bg-teal-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                {mode === 'FORGOT_PASSWORD' ? <KeyRound size={32} /> : 
                 step === 'VERIFICATION' ? <MessageSquare size={32} /> : 
                 mode === 'LOGIN' ? <Lock size={32} /> : <UserIcon size={32} />}
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {getTitle()}
            </h2>
            
            {mode === 'LOGIN' && <p className="text-gray-500 text-sm">Connectez-vous à votre compte AfroConnect.</p>}
            {mode === 'REGISTER' && step === 'FORM' && <p className="text-gray-500 text-sm">Rejoignez la communauté dès aujourd'hui.</p>}
            {mode === 'FORGOT_PASSWORD' && step === 'FORM' && <p className="text-gray-500 text-sm">Entrez votre email pour recevoir un lien.</p>}
            {mode === 'FORGOT_PASSWORD' && step === 'RESET_NEW_PASSWORD' && <p className="text-gray-500 text-sm">Choisissez un mot de passe sécurisé.</p>}
            {step === 'VERIFICATION' && <p className="text-gray-500 text-sm">Code envoyé à <b>{email}</b></p>}
          </div>

          {/* Messages d'erreur et succès */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm animate-pulse">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-start gap-2 text-green-700 text-sm animate-fade-in-down">
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* --- FORMULAIRE PRINCIPAL (LOGIN / REGISTER / EMAIL FORGOT) --- */}
          {step === 'FORM' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {mode === 'REGISTER' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Nom complet</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Moussa Diop"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Téléphone</label>
                    <div className="flex gap-2">
                      <div className="relative w-1/3">
                          <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="w-full h-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                              {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                      {c.flag} {c.code}
                                  </option>
                              ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      <div className="relative w-2/3">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                          type="tel" 
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="07070707"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Adresse</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex: Cocody, Abidjan"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: contact@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              </div>

              {mode !== 'FORGOT_PASSWORD' && (
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Mot de passe</label>
                    <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    />
                    </div>
                    {mode === 'REGISTER' && (
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">
                        Min. 6 caractères, 1 caractère spécial (!@#$...) requis.
                    </p>
                    )}
                </div>
              )}

              {mode === 'LOGIN' && (
                <div className="flex justify-between items-center text-sm">
                  <label className="flex items-center text-gray-600 cursor-pointer hover:text-gray-800 select-none">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary" 
                    />
                    Rester connecté
                  </label>
                  <button 
                    type="button" 
                    onClick={() => handleModeSwitch('FORGOT_PASSWORD')}
                    className="text-primary font-medium hover:underline hover:text-teal-700"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              {mode === 'REGISTER' && (
                 <div>
                   <div className="mb-4">
                     <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Je suis principalement</label>
                     <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole(UserRole.CLIENT)}
                          className={`py-2 rounded-lg text-sm font-medium border ${role === UserRole.CLIENT ? 'bg-primary/10 border-primary text-primary' : 'border-gray-200 text-gray-500'}`}
                        >
                          Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole(UserRole.PROVIDER)}
                          className={`py-2 rounded-lg text-sm font-medium border ${role === UserRole.PROVIDER ? 'bg-primary/10 border-primary text-primary' : 'border-gray-200 text-gray-500'}`}
                        >
                          Prestataire
                        </button>
                     </div>
                   </div>
                 </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-500/30 transition transform active:scale-[0.99] flex items-center justify-center"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                ) : (
                  <>
                    {mode === 'FORGOT_PASSWORD' ? 'Envoyer le lien' : 'Continuer'}
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* --- NOUVEAU MOT DE PASSE --- */}
          {mode === 'FORGOT_PASSWORD' && step === 'RESET_NEW_PASSWORD' && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Nouveau mot de passe</label>
                    <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Confirmer le mot de passe</label>
                    <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-500/30 transition transform active:scale-[0.99] flex items-center justify-center"
                  >
                    {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Réinitialiser'}
                  </button>
              </form>
          )}

          {/* --- VERIFICATION CODE (INSCRIPTION) --- */}
          {step === 'VERIFICATION' && (
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
               <div>
                  <label className="block text-sm font-bold text-gray-700 text-center mb-3">Code de sécurité</label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-bold tracking-[1em] py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition"
                  />
                  <p className="text-center text-xs text-gray-400 mt-2">Vérifiez votre boîte mail (y compris les spams).</p>
               </div>

               <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-500/30 transition transform active:scale-[0.99] flex items-center justify-center"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                ) : (
                  <>
                    Valider le compte
                    <CheckCircle size={18} className="ml-2" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="text-sm text-gray-500 hover:text-gray-800 underline"
                >
                  Modifier mes informations
                </button>
              </div>
            </form>
          )}

          {step === 'FORM' && mode !== 'FORGOT_PASSWORD' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {mode === 'LOGIN' ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button 
                  onClick={() => handleModeSwitch(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                  className="ml-1 font-bold text-primary hover:underline"
                >
                  {mode === 'LOGIN' ? "S'inscrire" : "Se connecter"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
