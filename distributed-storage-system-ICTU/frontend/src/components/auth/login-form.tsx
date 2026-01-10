'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '@/lib/validators';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await authService.login(data.email, data.password);
      toast({ 
        title: "Succès", 
        description: "Content de vous revoir sur NexusCloud !",
      });
      router.push('/drive');
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: "Identifiants invalides. Veuillez réessayer." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Champ Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Identifiant
          </label>
          <div className="relative group">
            <Mail className={cn(
              "absolute left-3 top-3 h-4 w-4 transition-colors duration-200",
              errors.email ? "text-red-500" : "text-muted-foreground group-focus-within:text-blue-500"
            )} />
            <Input 
              {...register('email')}
              placeholder="votre@email.com"
              className={cn(
                "pl-10 h-11 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              )}
              disabled={isLoading}
            />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11px] font-bold text-red-500 ml-1"
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Champ Mot de passe */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Mot de passe
            </label>
            <button type="button" className="text-[10px] font-bold text-blue-500 hover:underline underline-offset-4">
              Oublié ?
            </button>
          </div>
          <div className="relative group">
            <Lock className={cn(
              "absolute left-3 top-3 h-4 w-4 transition-colors duration-200",
              errors.password ? "text-red-500" : "text-muted-foreground group-focus-within:text-blue-500"
            )} />
            <Input 
              {...register('password')}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={cn(
                "pl-10 pr-10 h-11 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <AnimatePresence>
            {errors.password && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11px] font-bold text-red-500 ml-1"
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Bouton de soumission */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button 
            type="submit" 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Accéder au Cloud
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
      
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Nouveau sur NexusCloud ?{' '}
        <button onClick={() => router.push('/register')} className="font-bold text-blue-500 hover:underline underline-offset-4">
          Créer un compte
        </button>
      </p>
    </motion.div>
  );
}