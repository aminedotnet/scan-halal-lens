import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getHistory, deleteFromHistory, clearHistory } from '@/utils/storage';
import { ScanHistory } from '@/types/product';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ScanHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    loadHistory();
    toast.success('تم الحذف بنجاح');
  };

  const handleClearAll = () => {
    clearHistory();
    loadHistory();
    toast.success('تم حذف السجل بالكامل');
  };

  const handleViewResult = (scan: ScanHistory) => {
    navigate('/result', { state: { result: scan.result, image: scan.image } });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'halal':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'suspicious':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'haram':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'halal': return '✅';
      case 'suspicious': return '⚠️';
      case 'haram': return '❌';
      default: return '❓';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">سجل الفحوصات</h1>
        </div>
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                حذف الكل
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف جميع سجلات الفحص بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>
                  حذف الكل
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              لا توجد فحوصات سابقة
            </h2>
            <p className="text-muted-foreground mb-6">
              ابدأ بفحص منتجك الأول لرؤية السجل هنا
            </p>
            <Button onClick={() => navigate('/scanner')}>
              فحص منتج الآن
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((scan) => (
              <Card
                key={scan.id}
                className="overflow-hidden hover:shadow-medium transition-shadow cursor-pointer animate-fade-in"
                onClick={() => handleViewResult(scan)}
              >
                <CardContent className="p-0">
                  <div className="flex gap-3">
                    {/* Image Thumbnail */}
                    <div className="w-24 h-24 flex-shrink-0 bg-muted relative">
                      <img
                        src={scan.image}
                        alt="Product thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 bg-background/90 backdrop-blur-sm rounded-full p-1">
                        {getStatusIcon(scan.result.status)}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 py-3 pr-3 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {getStatusEmoji(scan.result.status)} {
                            scan.result.status === 'halal' ? 'حلال' :
                            scan.result.status === 'suspicious' ? 'مشبوه' :
                            'غير حلال'
                          }
                        </h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex-shrink-0">
                          {scan.result.confidence}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {scan.result.mainReason}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(scan.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(scan.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
