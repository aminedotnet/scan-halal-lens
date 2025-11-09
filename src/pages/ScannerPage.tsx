import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzeProduct } from '@/services/ai';
import { saveToHistory } from '@/utils/storage';
import { toast } from 'sonner';
import { captureFromCamera, pickFromGallery, requestCameraPermissions } from '@/services/camera';
import { showBannerAd, showInterstitialAdIfReady } from '@/services/admob';
import { Capacitor } from '@capacitor/core';

const ScannerPage = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  
  useEffect(() => {
    // طلب أذونات الكاميرا عند تحميل الصفحة
    if (Capacitor.isNativePlatform()) {
      requestCameraPermissions().then(granted => {
        setHasPermissions(granted);
        if (!granted) {
          toast.error('يرجى منح إذن الوصول للكاميرا');
        }
      });
    } else {
      setHasPermissions(true);
    }
    
    // عرض إعلان البانر
    showBannerAd();
  }, []);

  const handleCameraCapture = async () => {
    if (!hasPermissions) {
      const granted = await requestCameraPermissions();
      if (!granted) {
        toast.error('يرجى منح إذن الوصول للكاميرا');
        return;
      }
      setHasPermissions(true);
    }

    try {
      const imageData = await captureFromCamera();
      setCapturedImage(imageData);
      handleAnalyze(imageData);
    } catch (error) {
      console.error('Error capturing from camera:', error);
      toast.error('فشل التقاط الصورة');
    }
  };

  const handleGalleryPick = async () => {
    try {
      const imageData = await pickFromGallery();
      setCapturedImage(imageData);
      handleAnalyze(imageData);
    } catch (error) {
      console.error('Error picking from gallery:', error);
      toast.error('فشل اختيار الصورة');
    }
  };

  const handleAnalyze = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeProduct(imageData);
      
      // حفظ في السجل
      const scanRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        image: imageData,
        result
      };
      saveToHistory(scanRecord);
      
      // عرض إعلان بيني إذا حان الوقت (بعد كل 3 فحوصات)
      await showInterstitialAdIfReady();
      
      // الانتقال لصفحة النتائج
      navigate('/result', { state: { result, image: imageData } });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('حدث خطأ أثناء التحليل');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          disabled={isAnalyzing}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">فحص المنتج</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {isAnalyzing ? (
          // Loading State
          <div className="text-center animate-fade-in">
            <div className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 animate-pulse">
              <Camera className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              جاري التحليل...
            </h2>
            <p className="text-muted-foreground">
              يرجى الانتظار قليلاً
            </p>
          </div>
        ) : capturedImage ? (
          // Image Preview
          <div className="w-full max-w-md animate-fade-in">
            <img
              src={capturedImage}
              alt="Captured product"
              className="w-full rounded-2xl shadow-medium mb-4"
            />
            <Button
              onClick={() => setCapturedImage(null)}
              variant="outline"
              className="w-full"
            >
              التقاط صورة جديدة
            </Button>
          </div>
        ) : (
          // Camera/Upload Options
          <div className="w-full max-w-md space-y-4">
            <Button
              onClick={handleCameraCapture}
              size="lg"
              disabled={!hasPermissions}
              className="w-full py-8 text-lg rounded-2xl"
            >
              <Camera className="ml-2 h-6 w-6" />
              <span>التقاط صورة</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  أو
                </span>
              </div>
            </div>

            <Button
              onClick={handleGalleryPick}
              variant="outline"
              size="lg"
              className="w-full py-8 text-lg rounded-2xl"
            >
              <Upload className="ml-2 h-6 w-6" />
              <span>اختيار صورة من المعرض</span>
            </Button>

            <div className="mt-8 p-4 bg-muted/50 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">نصائح للحصول على أفضل نتيجة:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>تأكد من وضوح قائمة المكونات</li>
                <li>التقط الصورة في إضاءة جيدة</li>
                <li>اقترب من المنتج لوضوح أفضل</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScannerPage;
