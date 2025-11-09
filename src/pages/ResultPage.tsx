import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalysisResult, ProductStatus } from '@/types/product';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, image } = location.state as { result: AnalysisResult; image: string };

  if (!result) {
    navigate('/');
    return null;
  }

  const getStatusConfig = (status: ProductStatus) => {
    switch (status) {
      case 'halal':
        return {
          icon: CheckCircle,
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          label: '✅ حلال',
          message: 'هذا المنتج حلال ومناسب للاستخدام'
        };
      case 'suspicious':
        return {
          icon: AlertCircle,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          label: '⚠️ مشبوه',
          message: 'يحتوي على مكونات تحتاج للتحقق'
        };
      case 'haram':
        return {
          icon: XCircle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
          label: '❌ غير حلال',
          message: 'هذا المنتج غير حلال ولا ينصح باستخدامه'
        };
    }
  };

  const config = getStatusConfig(result.status);
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 flex items-center gap-3 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">نتيجة الفحص</h1>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4 pb-24">
        {/* Product Image */}
        {image && (
          <Card className="overflow-hidden animate-fade-in">
            <img
              src={image}
              alt="Scanned product"
              className="w-full h-48 object-cover"
            />
          </Card>
        )}

        {/* Result Status */}
        <Card className={`${config.bgColor} border-2 ${config.borderColor} animate-scale-in`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className={`h-8 w-8 ${config.color}`} />
                <span className={config.color}>{config.label}</span>
              </CardTitle>
              <Badge variant="secondary" className="text-lg">
                {result.confidence}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground font-medium">{config.message}</p>
            <p className="text-muted-foreground mt-2 text-sm">{result.mainReason}</p>
          </CardContent>
        </Card>

        {/* Detected Ingredients */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>المكونات المكتشفة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-2xl flex-shrink-0">
                  {ingredient.status === 'halal' ? '✅' : 
                   ingredient.status === 'suspicious' ? '⚠️' : '❌'}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{ingredient.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{ingredient.reason}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Detected Text (if available) */}
        {result.detectedText && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>النص المكتشف</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {result.detectedText}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            onClick={() => navigate('/scanner')}
            variant="outline"
            className="flex-1"
          >
            فحص منتج آخر
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="flex-1"
          >
            <Home className="ml-2 h-4 w-4" />
            الصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
