import { Camera, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { initializeAdMob, showBannerAd } from '@/services/admob';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // تهيئة AdMob عند تحميل التطبيق
    initializeAdMob();
    
    // عرض إعلان البانر
    showBannerAd();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-secondary flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="w-10 h-10" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/history')}
          className="text-white hover:bg-white/10"
        >
          <History className="h-6 w-6" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* App Logo/Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-4 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-strong">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            حلال
          </h1>
          <p className="text-white/80 text-lg font-light">
            تحقق من المنتجات بسهولة
          </p>
        </div>

        {/* Scan Button */}
        <Button
          onClick={() => navigate('/scanner')}
          size="lg"
          className="group relative bg-white text-primary hover:bg-white/90 shadow-strong hover:shadow-xl transition-all duration-300 hover:scale-105 px-12 py-8 rounded-2xl text-xl font-bold"
        >
          <Camera className="ml-3 h-7 w-7 transition-transform group-hover:scale-110" />
          <span>فحص منتج</span>
        </Button>

        {/* Features */}
        <div className="mt-16 grid grid-cols-3 gap-4 w-full max-w-md">
          <FeatureCard emoji="✅" title="حلال" />
          <FeatureCard emoji="⚠️" title="مشبوه" />
          <FeatureCard emoji="❌" title="غير حلال" />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-white/60 text-sm">
        <p>تطبيق حلال - للتحقق من المنتجات الغذائية والتجميلية</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ emoji, title }: { emoji: string; title: string }) => (
  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center hover:bg-white/20 transition-colors">
    <div className="text-3xl mb-2">{emoji}</div>
    <p className="text-white text-sm font-medium">{title}</p>
  </div>
);

export default HomePage;
