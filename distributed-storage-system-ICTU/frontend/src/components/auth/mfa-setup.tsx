'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, ShieldCheck, Copy, CheckCircle2, 
  Smartphone, Key, ShieldAlert, ArrowRight, RefreshCcw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export function MFASetup() {
  const [step, setStep] = useState<'loading' | 'qr' | 'verify' | 'success'>('loading');
  const [secretData, setSecretData] = useState<{ secret: string; otpauth_url: string } | null>(null);
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulation d'appel API pour récupérer le secret TOTP
    setTimeout(() => {
      setSecretData({
        secret: "KEMADJOU-NEXUS-777-X",
        otpauth_url: "otpauth://totp/NexusCloud:user@example.com?secret=KEMADJOU777X&issuer=NexusCloud"
      });
      setStep('qr');
    }, 1500);
  }, []);

  const handleCopy = () => {
    if (secretData) {
      navigator.clipboard.writeText(secretData.secret);
      toast({ title: "Copié !", description: "Clé de secours enregistrée." });
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setIsVerifying(true);
    // Simulation de vérification
    await new Promise(r => setTimeout(r, 1000));
    setStep('success');
    setIsVerifying(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ÉTAPE : CHARGEMENT */}
        {step === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
              <RefreshCcw className="w-12 h-12 text-blue-600 animate-spin relative" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Initialisation sécurisée...</p>
          </motion.div>
        )}

        {/* ÉTAPE : QR CODE */}
        {step === 'qr' && (
          <motion.div 
            key="qr"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tighter italic">ACTIVER LE MFA</h2>
              <p className="text-muted-foreground text-sm font-medium">Étape 1 : Scannez le code avec votre application TOTP</p>
            </div>

            <div className="relative flex justify-center group">
              <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all duration-500" />
              <div className="relative p-6 bg-white dark:bg-black rounded-[2.5rem] border-4 border-gray-100 dark:border-gray-800 shadow-2xl">
                {secretData && (
                  <QRCodeSVG 
                    value={secretData.otpauth_url} 
                    size={220} 
                    level="H"
                    className="rounded-lg"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Application</span>
                </div>
                <p className="text-xs font-medium text-muted-foreground">Utilisez Google Authenticator ou Authy pour scanner.</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-500">
                  <Key className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Manuel</span>
                </div>
                <button onClick={handleCopy} className="flex items-center justify-between w-full group">
                  <code className="text-[11px] font-mono font-bold truncate pr-2">{secretData?.secret}</code>
                  <Copy className="w-3 h-3 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </button>
              </div>
            </div>

            <Button onClick={() => setStep('verify')} className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-lg shadow-xl shadow-blue-500/25 gap-2">
              J'AI SCANNÉ LE CODE
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* ÉTAPE : VÉRIFICATION */}
        {step === 'verify' && (
          <motion.div 
            key="verify"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-8 py-4"
          >
             <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tighter italic">VÉRIFICATION</h2>
              <p className="text-muted-foreground text-sm font-medium">Saisissez le code à 6 chiffres généré par l'app.</p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-full max-w-[280px]">
                <Input 
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-20 text-center text-4xl font-black tracking-[0.4em] bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="000000"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p className="text-[11px] leading-relaxed font-bold uppercase tracking-tight">
                  Assurez-vous d'avoir sauvegardé votre clé secrète. En cas de perte de votre téléphone, l'accès au compte sera restreint.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('qr')} className="h-14 rounded-2xl px-6 border-2 font-bold">RETOUR</Button>
              <Button 
                onClick={handleVerify} 
                disabled={code.length !== 6 || isVerifying}
                className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-500/20 gap-2"
              >
                {isVerifying ? <Loader2 className="animate-spin" /> : "ACTIVER LA PROTECTION"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ÉTAPE : SUCCÈS */}
        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10 space-y-6 text-center"
          >
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl animate-ping" />
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter italic">PROTECTION ACTIVÉE</h2>
              <p className="text-muted-foreground font-medium">Votre compte est désormais protégé par une double authentification.</p>
            </div>

            <Button 
              onClick={() => window.location.href = '/drive'} 
              className="mt-4 h-14 px-10 rounded-2xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black uppercase tracking-widest shadow-xl"
            >
              Accéder à mes fichiers
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}