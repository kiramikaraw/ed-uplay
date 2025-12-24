import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Gamepad2, Trophy, Users, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export default function OnboardingTutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const { t } = useLanguage();

  const steps: OnboardingStep[] = [
    { icon: <Sparkles className="h-12 w-12" />, title: t('welcomeToEduverse'), description: 'Platform edukasi interaktif #1 Indonesia!', color: 'from-primary to-pink-500' },
    { icon: <BookOpen className="h-12 w-12" />, title: t('onboardingStep1'), description: 'Tersedia berbagai mata pelajaran sesuai jenjang pendidikanmu.', color: 'from-secondary to-teal-500' },
    { icon: <Gamepad2 className="h-12 w-12" />, title: t('onboardingStep2'), description: 'Kuis, Puzzle, Memory Game, dan Drag & Drop!', color: 'from-accent to-yellow-500' },
    { icon: <Trophy className="h-12 w-12" />, title: t('onboardingStep3'), description: 'Kumpulkan poin dan XP untuk naik level!', color: 'from-orange to-red-500' },
    { icon: <Users className="h-12 w-12" />, title: t('onboardingStep4'), description: 'Ajak temanmu untuk Quiz Battle!', color: 'from-purple to-indigo-500' }
  ];

  const handleComplete = async () => {
    if (user) {
      await supabase.from('user_preferences').upsert({ user_id: user.id, onboarding_completed: true }, { onConflict: 'user_id' });
    }
    onComplete();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else handleComplete();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Progress value={((currentStep + 1) / steps.length) * 100} className="flex-1 mr-4" />
            <Button variant="ghost" size="icon" onClick={handleComplete}><X className="h-5 w-5" /></Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center text-white`}>
                {steps[currentStep].icon}
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground mb-8">{steps[currentStep].description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <motion.div key={index} animate={{ scale: index === currentStep ? 1.2 : 1, backgroundColor: index === currentStep ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }} className="w-2 h-2 rounded-full cursor-pointer" onClick={() => setCurrentStep(index)} />
            ))}
          </div>

          <div className="flex gap-4">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1"><ChevronLeft className="mr-2 h-4 w-4" />{t('previous')}</Button>
            ) : (
              <Button variant="ghost" onClick={handleComplete} className="flex-1">{t('skip')}</Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentStep === steps.length - 1 ? t('getStarted') : t('next')}
              {currentStep < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
