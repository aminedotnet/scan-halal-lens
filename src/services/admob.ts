import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// معرفات الإعلانات - استبدلها بمعرفاتك الحقيقية
// هذه معرفات اختبار Google AdMob
const AD_UNITS = {
  banner: 'ca-app-pub-3940256099942544/6300978111', // Banner Test ID
  interstitial: 'ca-app-pub-3940256099942544/1033173712', // Interstitial Test ID
};

let interstitialAdLoaded = false;
let scanCount = 0;

// تهيئة AdMob
export async function initializeAdMob(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('AdMob is only available on native platforms');
    return;
  }

  try {
    await AdMob.initialize({
      testingDevices: ['YOUR_DEVICE_ID'], // استبدل بمعرف جهازك للاختبار
      initializeForTesting: true,
    });
    
    console.log('AdMob initialized successfully');
    
    // تحميل أول إعلان بيني
    await loadInterstitialAd();
    
  } catch (error) {
    console.error('Error initializing AdMob:', error);
  }
}

// عرض إعلان بانر في أسفل الصفحة
export async function showBannerAd(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const options: BannerAdOptions = {
      adId: AD_UNITS.banner,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    };

    await AdMob.showBanner(options);
    console.log('Banner ad shown');
  } catch (error) {
    console.error('Error showing banner ad:', error);
  }
}

// إخفاء إعلان البانر
export async function hideBannerAd(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.hideBanner();
    console.log('Banner ad hidden');
  } catch (error) {
    console.error('Error hiding banner ad:', error);
  }
}

// تحميل إعلان بيني
async function loadInterstitialAd(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.prepareInterstitial({
      adId: AD_UNITS.interstitial,
    });
    
    interstitialAdLoaded = true;
    console.log('Interstitial ad loaded');
    
    // الاستماع لحدث انتهاء الإعلان لتحميل التالي
    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, async () => {
      console.log('Interstitial ad dismissed');
      interstitialAdLoaded = false;
      // تحميل الإعلان التالي
      await loadInterstitialAd();
    });
    
  } catch (error) {
    console.error('Error loading interstitial ad:', error);
    interstitialAdLoaded = false;
  }
}

// عرض إعلان بيني بعد كل 3 فحوصات
export async function showInterstitialAdIfReady(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  scanCount++;
  
  // عرض الإعلان بعد كل 3 فحوصات
  if (scanCount >= 3 && interstitialAdLoaded) {
    try {
      await AdMob.showInterstitial();
      console.log('Interstitial ad shown');
      scanCount = 0; // إعادة تعيين العداد
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
    }
  }
}

// إزالة جميع المستمعين عند إلغاء التحميل
export async function cleanupAdMob(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await hideBannerAd();
  } catch (error) {
    console.error('Error cleaning up AdMob:', error);
  }
}
