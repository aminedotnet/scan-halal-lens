import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzeProduct } from '@/services/ai';
import { saveToHistory } from '@/utils/storage';
import { toast } from 'sonner';

const ScannerPage = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('لا يمكن الوصول إلى الكاميرا');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureFromCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
        handleAnalyze(imageData);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setCapturedImage(imageData);
        handleAnalyze(imageData);
      };
      reader.readAsDataURL(file);
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
              onClick={() => {
                setCapturedImage(null);
                setIsCameraActive(false);
              }}
              variant="outline"
              className="w-full"
            >
              التقاط صورة جديدة
            </Button>
          </div>
        ) : (
          // Camera/Upload Options
          <div className="w-full max-w-md space-y-4">
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <Button
                    onClick={captureFromCamera}
                    size="lg"
                    className="rounded-full w-16 h-16"
                  >
                    <Camera className="h-6 w-6" />
                  </Button>
                  <Button
                    onClick={stopCamera}
                    size="lg"
                    variant="destructive"
                    className="rounded-full"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  onClick={startCamera}
                  size="lg"
                  className="w-full py-8 text-lg rounded-2xl"
                >
                  <Camera className="ml-2 h-6 w-6" />
                  <span>فتح الكاميرا</span>
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

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                  className="w-full py-8 text-lg rounded-2xl"
                >
                  <Upload className="ml-2 h-6 w-6" />
                  <span>اختيار صورة من المعرض</span>
                </Button>
              </>
            )}

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
