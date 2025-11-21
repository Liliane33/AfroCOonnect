import React, { useState } from 'react';
import { X, Smartphone, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  recipientName: string;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, recipientName, onSuccess }) => {
  const [method, setMethod] = useState<'MOBILE' | 'CARD'>('MOBILE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'SELECT' | 'PROCESS' | 'SUCCESS'>('SELECT');

  if (!isOpen) return null;

  const handlePay = () => {
    setStep('PROCESS');
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep('SELECT');
      }, 2000);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">Paiement Sécurisé</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'SELECT' && (
            <>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Montant à payer à {recipientName}</p>
                <p className="text-3xl font-bold text-primary">{amount.toLocaleString()} XOF</p>
                <p className="text-xs text-gray-400 mt-2">+ 10% de frais de service (inclus)</p>
              </div>

              <div className="space-y-3 mb-6">
                <button 
                  onClick={() => setMethod('MOBILE')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition ${method === 'MOBILE' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                      <Smartphone size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">Mobile Money</p>
                      <p className="text-xs text-gray-500">Orange, MTN, Moov</p>
                    </div>
                  </div>
                  {method === 'MOBILE' && <div className="w-4 h-4 rounded-full bg-orange-500"></div>}
                </button>

                <button 
                  onClick={() => setMethod('CARD')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition ${method === 'CARD' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">Carte Bancaire</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard</p>
                    </div>
                  </div>
                  {method === 'CARD' && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
                </button>
              </div>

              <button 
                onClick={handlePay}
                className="w-full py-3 bg-primary hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95"
              >
                Confirmer le paiement
              </button>
            </>
          )}

          {step === 'PROCESS' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 size={48} className="text-primary animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Traitement de la transaction...</p>
              <p className="text-sm text-gray-400 mt-2">Veuillez valider sur votre téléphone si nécessaire.</p>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Paiement Réussi !</h4>
              <p className="text-gray-600">Les fonds sont bloqués jusqu'à la finalisation du service.</p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck size={12} /> Transactions sécurisées par AfroPay
          </p>
        </div>
      </div>
    </div>
  );
};
