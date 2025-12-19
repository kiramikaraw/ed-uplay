import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface LogoOption {
  style: string;
  name: string;
  description: string;
  imageUrl?: string;
  loading?: boolean;
}

const logoStyles: LogoOption[] = [
  {
    style: 'mascot',
    name: 'Mascot Logo',
    description: 'Owl dengan topi wisuda & controller'
  },
  {
    style: 'abstract',
    name: 'Abstract Modern',
    description: 'Buku + controller dalam bentuk geometris'
  },
  {
    style: 'typography',
    name: 'Typography',
    description: 'EduPlay dengan huruf P sebagai play button'
  },
  {
    style: 'puzzle',
    name: 'Puzzle Learning',
    description: 'Puzzle pieces membentuk huruf E'
  }
];

export const LogoGenerator = () => {
  const [logos, setLogos] = useState<LogoOption[]>(logoStyles);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);

  const generateLogo = async (style: string) => {
    setLogos(prev => prev.map(logo => 
      logo.style === style ? { ...logo, loading: true } : logo
    ));

    try {
      const { data, error } = await supabase.functions.invoke('generate-logo', {
        body: { style }
      });

      if (error) throw error;

      if (data.imageUrl) {
        setLogos(prev => prev.map(logo => 
          logo.style === style ? { ...logo, imageUrl: data.imageUrl, loading: false } : logo
        ));
        toast.success(`Logo ${style} berhasil dibuat!`);
      }
    } catch (error: any) {
      console.error('Error generating logo:', error);
      toast.error(error.message || 'Gagal generate logo');
      setLogos(prev => prev.map(logo => 
        logo.style === style ? { ...logo, loading: false } : logo
      ));
    }
  };

  const generateAllLogos = async () => {
    setGeneratingAll(true);
    for (const logo of logoStyles) {
      await generateLogo(logo.style);
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setGeneratingAll(false);
  };

  const downloadLogo = (imageUrl: string, style: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `eduplay-logo-${style}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Logo berhasil didownload!');
  };

  const selectLogo = (style: string) => {
    setSelectedLogo(style);
    toast.success('Logo dipilih! Kamu bisa download logo ini.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Logo Generator</h2>
          <p className="text-muted-foreground">Generate dan pilih logo untuk EduPlay</p>
        </div>
        <Button 
          onClick={generateAllLogos} 
          disabled={generatingAll}
          className="bg-primary hover:bg-primary/90"
        >
          {generatingAll ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Semua Logo
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {logos.map((logo) => (
          <Card 
            key={logo.style}
            className={`overflow-hidden transition-all ${
              selectedLogo === logo.style 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{logo.name}</span>
                {selectedLogo === logo.style && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{logo.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {logo.loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Generating...</span>
                  </div>
                ) : logo.imageUrl ? (
                  <img 
                    src={logo.imageUrl} 
                    alt={logo.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Klik generate untuk membuat logo</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateLogo(logo.style)}
                  disabled={logo.loading || generatingAll}
                  className="flex-1"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${logo.loading ? 'animate-spin' : ''}`} />
                  {logo.imageUrl ? 'Regenerate' : 'Generate'}
                </Button>
                
                {logo.imageUrl && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadLogo(logo.imageUrl!, logo.style)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => selectLogo(logo.style)}
                      className={selectedLogo === logo.style ? 'bg-green-600' : ''}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedLogo && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white">
                <img 
                  src={logos.find(l => l.style === selectedLogo)?.imageUrl}
                  alt="Selected logo"
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Logo Terpilih: {logos.find(l => l.style === selectedLogo)?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Download logo ini dan gunakan sebagai favicon/icon aplikasi
                </p>
              </div>
              <Button 
                onClick={() => downloadLogo(
                  logos.find(l => l.style === selectedLogo)?.imageUrl!,
                  selectedLogo
                )}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Logo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
