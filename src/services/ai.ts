import ingredientsDB from '@/data/ingredientsDB.json';

export type ProductStatus = 'halal' | 'suspicious' | 'haram';

export interface IngredientInfo {
  name: string;
  status: ProductStatus;
  reason: string;
}

export interface AnalysisResult {
  status: ProductStatus;
  confidence: number;
  ingredients: IngredientInfo[];
  mainReason: string;
  detectedText?: string;
}

// دالة لتحليل النص المستخرج من الصورة
function analyzeIngredients(text: string): AnalysisResult {
  const lowerText = text.toLowerCase();
  const detectedIngredients: IngredientInfo[] = [];
  let worstStatus: ProductStatus = 'halal';
  
  // البحث عن المكونات في قاعدة البيانات
  ingredientsDB.ingredients.forEach(ingredient => {
    const searchTerms = [
      ingredient.name.toLowerCase(),
      ingredient.nameEn.toLowerCase()
    ];
    
    const found = searchTerms.some(term => lowerText.includes(term));
    
    if (found) {
      detectedIngredients.push({
        name: ingredient.name,
        status: ingredient.status as ProductStatus,
        reason: ingredient.reason
      });
      
      // تحديد أسوأ حالة
      if (ingredient.status === 'haram') {
        worstStatus = 'haram';
      } else if (ingredient.status === 'suspicious' && worstStatus !== 'haram') {
        worstStatus = 'suspicious';
      }
    }
  });
  
  // إذا لم يتم العثور على مكونات مشبوهة أو محرمة
  if (detectedIngredients.length === 0) {
    return {
      status: 'halal',
      confidence: 75,
      ingredients: [{
        name: 'لم يتم العثور على مكونات مشبوهة',
        status: 'halal',
        reason: 'المكونات الظاهرة لا تحتوي على مواد محرمة معروفة'
      }],
      mainReason: 'لم يتم العثور على مكونات مشبوهة أو محرمة في النص',
      detectedText: text
    };
  }
  
  // حساب نسبة الثقة والسبب الرئيسي
  const statusConfidence: Record<ProductStatus, number> = {
    'halal': 85,
    'suspicious': 70,
    'haram': 95
  };
  
  const confidence = statusConfidence[worstStatus];
  
  let mainReason = 'جميع المكونات المكتشفة حلال';
  const haramIngredients = detectedIngredients.filter(i => i.status === 'haram');
  const suspiciousIngredients = detectedIngredients.filter(i => i.status === 'suspicious');
  
  if (haramIngredients.length > 0) {
    mainReason = `يحتوي على مكونات محرمة: ${haramIngredients.map(i => i.name).join('، ')}`;
  } else if (suspiciousIngredients.length > 0) {
    mainReason = `يحتوي على مكونات مشبوهة تحتاج للتحقق: ${suspiciousIngredients.map(i => i.name).join('، ')}`;
  }
  
  return {
    status: worstStatus,
    confidence,
    ingredients: detectedIngredients,
    mainReason,
    detectedText: text
  };
}

// دالة تحليل وهمية للتطوير - ستربط لاحقاً بـ Gemini AI
export async function analyzeProduct(imageData: string): Promise<AnalysisResult> {
  // محاكاة وقت المعالجة
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // في المستقبل، سيتم هنا:
  // 1. إرسال الصورة إلى Gemini Vision API
  // 2. استخراج النصوص من الصورة
  // 3. تحليل المكونات
  
  // حالياً: تحليل تجريبي عشوائي
  const sampleTexts = [
    'دقيق، سكر، زيت نباتي، ملح، خميرة',
    'دقيق، سكر، جيلاتين، نكهة طبيعية، ملح',
    'دقيق، سكر، شحم الخنزير، ملح، بيكون',
    'دقيق، سكر، زيت نباتي، إي 471، ملح، كحول',
    'ماء، سكر، حليب، فانيليا، إي 476'
  ];
  
  const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  
  return analyzeIngredients(randomText);
}

// دالة للتحليل باستخدام Gemini AI (جاهزة للربط لاحقاً)
export async function analyzeProductWithGemini(imageData: string): Promise<AnalysisResult> {
  // TODO: الربط مع Gemini Vision API
  // const apiKey = 'YOUR_GEMINI_API_KEY';
  // const response = await fetch(geminiEndpoint, {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${apiKey}` },
  //   body: JSON.stringify({ image: imageData })
  // });
  
  // حالياً: استخدام التحليل التجريبي
  return analyzeProduct(imageData);
}
