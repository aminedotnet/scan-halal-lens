# 📱 دليل إعداد تطبيق حلال للأندرويد

## 🚀 الخطوات المطلوبة لتصدير التطبيق كـ APK

### 1️⃣ نقل المشروع إلى GitHub
1. اذهب إلى زر "Export to GitHub" في Lovable
2. انقل المشروع إلى مستودع GitHub الخاص بك
3. استنسخ المشروع على جهازك:
```bash
git clone <YOUR_GITHUB_URL>
cd <PROJECT_NAME>
```

### 2️⃣ تثبيت المتطلبات
تأكد من تثبيت:
- **Node.js & npm** (الإصدار 16 أو أحدث)
- **Android Studio** (مع Android SDK)
- **Java JDK** (الإصدار 11 أو أحدث)

```bash
# تثبيت الحزم
npm install
```

### 3️⃣ تهيئة Capacitor
```bash
# تهيئة Capacitor (إذا لم يتم بعد)
npx cap init

# بناء المشروع
npm run build

# إضافة منصة الأندرويد
npx cap add android

# مزامنة الملفات
npx cap sync android
```

### 4️⃣ إعداد معرفات AdMob الحقيقية

#### أ. الحصول على معرفات AdMob:
1. اذهب إلى [Google AdMob Console](https://admob.google.com/)
2. أنشئ تطبيق جديد أو اختر تطبيق موجود
3. أنشئ وحدات إعلانية:
   - **Banner Ad Unit** - للإعلان البانر
   - **Interstitial Ad Unit** - للإعلان البيني
4. احفظ معرفات الإعلانات (تبدأ بـ `ca-app-pub-...`)

#### ب. تحديث المعرفات في الكود:
افتح `src/services/admob.ts` واستبدل المعرفات الاختبارية:

```typescript
const AD_UNITS = {
  banner: 'ca-app-pub-XXXXXX/XXXXXX', // معرف البانر الخاص بك
  interstitial: 'ca-app-pub-XXXXXX/XXXXXX', // معرف البيني الخاص بك
};
```

#### ج. إضافة معرف التطبيق في AndroidManifest.xml:
افتح `android/app/src/main/AndroidManifest.xml` وأضف:

```xml
<manifest>
  <application>
    <!-- ... -->
    <meta-data
      android:name="com.google.android.gms.ads.APPLICATION_ID"
      android:value="ca-app-pub-XXXXXX~XXXXXX"/> <!-- معرف تطبيق AdMob -->
  </application>
</manifest>
```

### 5️⃣ إعداد أذونات الكاميرا

تأكد من وجود الأذونات في `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
  <!-- أذونات الكاميرا -->
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
  
  <!-- أذونات الإنترنت للإعلانات -->
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
  
  <uses-feature android:name="android.hardware.camera" android:required="false" />
  <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
</manifest>
```

### 6️⃣ فتح المشروع في Android Studio
```bash
npx cap open android
```

### 7️⃣ بناء APK للاختبار

في Android Studio:
1. اذهب إلى `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. انتظر حتى يكتمل البناء
3. ستجد ملف APK في: `android/app/build/outputs/apk/debug/app-debug.apk`

### 8️⃣ بناء APK للإنتاج (للنشر)

#### أ. إنشاء Keystore:
```bash
keytool -genkey -v -keystore halal-release.keystore -alias halal -keyalg RSA -keysize 2048 -validity 10000
```

#### ب. إعداد ملف gradle.properties:
أضف في `android/gradle.properties`:
```properties
HALAL_RELEASE_STORE_FILE=halal-release.keystore
HALAL_RELEASE_KEY_ALIAS=halal
HALAL_RELEASE_STORE_PASSWORD=your_password
HALAL_RELEASE_KEY_PASSWORD=your_password
```

#### ج. تحديث build.gradle:
في `android/app/build.gradle`، أضف:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file(HALAL_RELEASE_STORE_FILE)
            storePassword HALAL_RELEASE_STORE_PASSWORD
            keyAlias HALAL_RELEASE_KEY_ALIAS
            keyPassword HALAL_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### د. بناء Release APK:
```bash
cd android
./gradlew assembleRelease
```

ستجد APK في: `android/app/build/outputs/apk/release/app-release.apk`

## 🧪 الاختبار

### اختبار على جهاز حقيقي:
1. قم بتفعيل خيارات المطور على هاتفك
2. صل الهاتف بالكمبيوتر
3. شغل:
```bash
npx cap run android
```

### اختبار AdMob:
- استخدم معرفات الاختبار أثناء التطوير
- **مهم جداً**: لا تنقر على إعلاناتك الحقيقية! قد يؤدي ذلك لحظر حسابك
- للاختبار على جهازك، أضف معرف الجهاز في `testingDevices`

### الحصول على معرف جهاز الاختبار:
```bash
adb logcat | grep "Device ID"
```

## 🔄 تحديث التطبيق

عند إجراء تغييرات على الكود:
```bash
npm run build
npx cap sync android
```

## 📦 النشر على Google Play Store

1. اذهب إلى [Google Play Console](https://play.google.com/console)
2. أنشئ تطبيقاً جديداً
3. املأ معلومات التطبيق (الوصف، الصور، إلخ)
4. ارفع ملف AAB (Android App Bundle):
```bash
cd android
./gradlew bundleRelease
```
5. ستجد الملف في: `android/app/build/outputs/bundle/release/app-release.aab`
6. اتبع خطوات النشر في Play Console

## ⚠️ ملاحظات مهمة

1. **معرفات AdMob**: استبدل جميع معرفات الاختبار بمعرفاتك الحقيقية قبل النشر
2. **الأذونات**: تأكد من شرح سبب طلب كل إذن في وصف التطبيق
3. **سياسة الخصوصية**: أنشئ سياسة خصوصية وأضفها في Play Console
4. **الاختبار**: اختبر التطبيق جيداً قبل النشر
5. **معرف التطبيق**: لا تغير `appId` في `capacitor.config.ts` بعد النشر

## 🆘 استكشاف الأخطاء

### مشكلة في AdMob:
- تأكد من إضافة معرف التطبيق في AndroidManifest.xml
- تحقق من معرفات الوحدات الإعلانية
- تأكد من تفعيل الإعلانات في حساب AdMob

### مشكلة في الكاميرا:
- تأكد من منح الأذونات في إعدادات التطبيق
- تحقق من AndroidManifest.xml

### مشكلة في البناء:
```bash
# تنظيف وإعادة البناء
cd android
./gradlew clean
cd ..
npm run build
npx cap sync android
```

## 📞 الدعم

للمزيد من المساعدة:
- [Capacitor Docs](https://capacitorjs.com/docs)
- [AdMob Plugin Docs](https://github.com/capacitor-community/admob)
- [Android Developer Docs](https://developer.android.com/)

---

**تم إنشاء التطبيق بواسطة Lovable** 💙
