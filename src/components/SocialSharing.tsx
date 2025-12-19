import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, MessageCircle, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface SocialSharingProps {
  title: string;
  description: string;
  url?: string;
}

export default function SocialSharing({ title, description, url = window.location.href }: SocialSharingProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const shareText = `${title}\n${description}`;

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + url)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: t('copied') });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          {t('share')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('shareAchievement')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
              <Button onClick={shareToWhatsApp} className="w-full bg-green hover:bg-green/90">
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
              <Button onClick={shareToTwitter} className="w-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90">
                <Twitter className="h-5 w-5 mr-2" />
                Twitter
              </Button>
            </motion.div>
          </div>
          <Button variant="outline" onClick={copyLink} className="w-full">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? t('copied') : 'Copy Link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
