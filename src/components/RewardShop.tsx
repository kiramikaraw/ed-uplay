import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Coins, Check, Lock, Sparkles, Palette, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'avatar' | 'theme' | 'powerup';
  icon: string;
  color?: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Avatars
  { id: 'avatar_fox', name: 'Rubah Pintar', description: 'Avatar rubah yang cerdas', price: 500, category: 'avatar', icon: '🦊' },
  { id: 'avatar_owl', name: 'Burung Hantu Bijak', description: 'Simbol kebijaksanaan', price: 750, category: 'avatar', icon: '🦉' },
  { id: 'avatar_dragon', name: 'Naga Api', description: 'Kekuatan dan keberanian', price: 1000, category: 'avatar', icon: '🐉' },
  { id: 'avatar_unicorn', name: 'Unicorn Ajaib', description: 'Keajaiban dan impian', price: 1500, category: 'avatar', icon: '🦄' },
  { id: 'avatar_robot', name: 'Robot Genius', description: 'Teknologi masa depan', price: 2000, category: 'avatar', icon: '🤖' },
  { id: 'avatar_astronaut', name: 'Astronot Penjelajah', description: 'Menjelajah luar angkasa', price: 2500, category: 'avatar', icon: '👨‍🚀' },
  
  // Themes
  { id: 'theme_ocean', name: 'Tema Samudera', description: 'Warna biru laut yang menenangkan', price: 1000, category: 'theme', icon: '🌊', color: 'from-blue-400 to-cyan-500' },
  { id: 'theme_forest', name: 'Tema Hutan', description: 'Nuansa hijau alam', price: 1000, category: 'theme', icon: '🌲', color: 'from-green-400 to-emerald-500' },
  { id: 'theme_sunset', name: 'Tema Sunset', description: 'Warna senja yang hangat', price: 1500, category: 'theme', icon: '🌅', color: 'from-orange-400 to-pink-500' },
  { id: 'theme_galaxy', name: 'Tema Galaxy', description: 'Keindahan luar angkasa', price: 2000, category: 'theme', icon: '🌌', color: 'from-purple-500 to-indigo-600' },
  { id: 'theme_candy', name: 'Tema Permen', description: 'Warna-warni yang ceria', price: 1500, category: 'theme', icon: '🍬', color: 'from-pink-400 to-purple-400' },
  
  // Power-ups
  { id: 'powerup_2x', name: 'Double XP (1 Hari)', description: 'XP x2 selama 24 jam', price: 300, category: 'powerup', icon: '⚡' },
  { id: 'powerup_hint', name: 'Paket Hint (5x)', description: '5 hint gratis untuk quiz', price: 200, category: 'powerup', icon: '💡' },
  { id: 'powerup_time', name: 'Extra Time (3x)', description: '+30 detik untuk 3 game', price: 250, category: 'powerup', icon: '⏰' },
  { id: 'powerup_shield', name: 'Shield (3x)', description: 'Lindungi streak 3 kali', price: 500, category: 'powerup', icon: '🛡️' },
];

export const RewardShop = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(0);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'avatar' | 'theme' | 'powerup'>('avatar');
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);

  useEffect(() => {
    // Load user points and owned items from localStorage (would be DB in production)
    const savedPoints = localStorage.getItem(`eduplay_points_${user?.id}`);
    const savedItems = localStorage.getItem(`eduplay_items_${user?.id}`);
    
    if (savedPoints) setUserPoints(parseInt(savedPoints));
    else setUserPoints(1500); // Demo starting points
    
    if (savedItems) setOwnedItems(JSON.parse(savedItems));
  }, [user]);

  const purchaseItem = (item: ShopItem) => {
    if (userPoints < item.price) {
      toast({
        title: "Poin Tidak Cukup 😢",
        description: `Kamu butuh ${item.price - userPoints} poin lagi`,
        variant: "destructive",
      });
      return;
    }

    if (ownedItems.includes(item.id)) {
      toast({
        title: "Sudah Dimiliki",
        description: "Kamu sudah memiliki item ini",
      });
      return;
    }

    // Animate purchase
    setPurchaseAnimation(item.id);
    setTimeout(() => setPurchaseAnimation(null), 1000);

    // Update state
    const newPoints = userPoints - item.price;
    const newItems = [...ownedItems, item.id];
    
    setUserPoints(newPoints);
    setOwnedItems(newItems);

    // Save to localStorage
    localStorage.setItem(`eduplay_points_${user?.id}`, newPoints.toString());
    localStorage.setItem(`eduplay_items_${user?.id}`, JSON.stringify(newItems));

    toast({
      title: "Pembelian Berhasil! 🎉",
      description: `${item.name} sekarang milikmu!`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'avatar': return <User className="h-4 w-4" />;
      case 'theme': return <Palette className="h-4 w-4" />;
      case 'powerup': return <Sparkles className="h-4 w-4" />;
      default: return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const filteredItems = SHOP_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-primary to-purple hover:opacity-90">
          <ShoppingBag className="h-4 w-4" />
          Reward Shop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Reward Shop
            </span>
            <Badge variant="secondary" className="flex items-center gap-1 text-lg px-3 py-1">
              <Coins className="h-4 w-4 text-warning" />
              {userPoints.toLocaleString()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="avatar" className="w-full" onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="avatar" className="gap-2">
              <User className="h-4 w-4" />
              Avatar
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2">
              <Palette className="h-4 w-4" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="powerup" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Power-up
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[50vh] overflow-y-auto pr-2">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
              >
                {filteredItems.map((item) => {
                  const isOwned = ownedItems.includes(item.id);
                  const canAfford = userPoints >= item.price;
                  const isPurchasing = purchaseAnimation === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border transition-all ${
                        isOwned 
                          ? 'bg-success/10 border-success/30' 
                          : canAfford 
                            ? 'bg-card border-border hover:border-primary/50 cursor-pointer' 
                            : 'bg-muted/50 border-border/50 opacity-75'
                      }`}
                      onClick={() => !isOwned && purchaseItem(item)}
                    >
                      {isPurchasing && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.5, 0] }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <span className="text-6xl">✨</span>
                        </motion.div>
                      )}

                      <div className={`text-center ${isPurchasing ? 'opacity-0' : ''}`}>
                        {item.category === 'theme' && item.color ? (
                          <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-2`}>
                            {item.icon}
                          </div>
                        ) : (
                          <div className="text-4xl mb-2">{item.icon}</div>
                        )}
                        
                        <h4 className="font-semibold text-sm text-foreground">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        
                        <div className="mt-3">
                          {isOwned ? (
                            <Badge variant="default" className="bg-success gap-1">
                              <Check className="h-3 w-3" />
                              Dimiliki
                            </Badge>
                          ) : canAfford ? (
                            <Badge variant="secondary" className="gap-1">
                              <Coins className="h-3 w-3 text-warning" />
                              {item.price}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 opacity-50">
                              <Lock className="h-3 w-3" />
                              {item.price}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
