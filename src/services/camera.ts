import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CameraOptions {
  source?: 'camera' | 'gallery';
}

// التقاط صورة باستخدام Capacitor Camera
export async function captureImage(options: CameraOptions = {}): Promise<string> {
  // إذا لم يكن على منصة أصلية، استخدم واجهة الويب
  if (!Capacitor.isNativePlatform()) {
    return captureImageWeb();
  }

  try {
    const source = options.source === 'gallery' ? CameraSource.Photos : CameraSource.Camera;
    
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: source,
      width: 1920, // حد أقصى للعرض
      height: 1920, // حد أقصى للارتفاع
      correctOrientation: true,
    });

    // إرجاع البيانات كـ base64 data URL
    return image.dataUrl || '';
  } catch (error) {
    console.error('Error capturing image:', error);
    throw new Error('فشل التقاط الصورة');
  }
}

// التقاط صورة من الكاميرا
export async function captureFromCamera(): Promise<string> {
  return captureImage({ source: 'camera' });
}

// اختيار صورة من المعرض
export async function pickFromGallery(): Promise<string> {
  return captureImage({ source: 'gallery' });
}

// نسخة احتياطية للمتصفح (fallback للويب)
function captureImageWeb(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error('فشل قراءة الصورة'));
        };
        reader.readAsDataURL(file);
      } else {
        reject(new Error('لم يتم اختيار صورة'));
      }
    };
    
    input.click();
  });
}

// طلب إذن الكاميرا
export async function requestCameraPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return true; // على الويب، الأذونات يتم طلبها تلقائياً
  }

  try {
    const permissions = await Camera.requestPermissions({
      permissions: ['camera', 'photos']
    });
    
    return permissions.camera === 'granted' && permissions.photos === 'granted';
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return false;
  }
}

// التحقق من حالة الأذونات
export async function checkCameraPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return true;
  }

  try {
    const permissions = await Camera.checkPermissions();
    return permissions.camera === 'granted' && permissions.photos === 'granted';
  } catch (error) {
    console.error('Error checking camera permissions:', error);
    return false;
  }
}
