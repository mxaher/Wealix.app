import type { Locale } from '@/store/useAppStore';

export interface LocalizedText {
  en: string;
  ar: string;
}

export interface HelpTopic {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  content: {
    en: string[];
    ar: string[];
  };
  pageContexts?: string[];
  keywords: {
    en: string[];
    ar: string[];
  };
}

export interface HelpSection {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  topics: HelpTopic[];
}

export interface PageHelpContext {
  page: LocalizedText;
  greeting: LocalizedText;
  quickHelp: {
    en: string[];
    ar: string[];
  };
}

export const helpSections: HelpSection[] = [
  {
    id: 'quick-start',
    title: { en: 'Quick Start', ar: 'البداية السريعة' },
    description: {
      en: 'Set up Wealix as your personal wealth operating system in a few steps.',
      ar: 'جهّز Wealix كنظام تشغيل ثروتك الشخصية عبر خطوات واضحة وسريعة.',
    },
    topics: [
      {
        id: 'what-is-wealix',
        title: { en: 'What is Wealix?', ar: 'ما هو Wealix؟' },
        summary: {
          en: 'Wealix brings your income, expenses, portfolio, net worth, FIRE plan, and retirement view into one workspace.',
          ar: 'يجمع Wealix الدخل والمصروفات والمحفظة وصافي الثروة وخطة FIRE والتقاعد في مساحة واحدة.',
        },
        content: {
          en: [
            'Wealix is a Personal Wealth Operating System designed to track the financial picture that matters most: cash flow, investments, net worth, FIRE progress, and retirement readiness.',
            'It is built for Saudi and MENA investors, with SAR-first workflows, Shariah-friendly portfolio context, and support for local exchanges like TASI.',
            'Think of it as a private financial control room that keeps your financial data connected instead of scattered across spreadsheets and notes.',
          ],
          ar: [
            'Wealix هو نظام تشغيل للثروة الشخصية مصمم لمتابعة الصورة المالية الكاملة: التدفق النقدي، الاستثمارات، صافي الثروة، التقدم نحو FIRE، والاستعداد للتقاعد.',
            'تم تصميمه للمستثمرين في السعودية والمنطقة، مع تدفقات عمل تركز على الريال السعودي، وإشارات التوافق الشرعي، ودعم أسواق مثل تداول.',
            'فكّر فيه كغرفة تحكم مالية خاصة تجمع بياناتك في مكان واحد بدلاً من تشتتها بين الجداول والملاحظات.',
          ],
        },
        pageContexts: ['/dashboard', '/app', '/help'],
        keywords: {
          en: ['what is wealix', 'about wealix', 'personal wealth operating system', 'wealth os'],
          ar: ['ما هو ويليكس', 'ما هو wealix', 'عن ويليكس', 'نظام تشغيل الثروة الشخصية', 'ما الذي يفعله wealix'],
        },
      },
      {
        id: 'first-steps',
        title: { en: 'First steps for new users', ar: 'الخطوات الأولى للمستخدم الجديد' },
        summary: {
          en: 'Start with income, add expenses, build your portfolio, and review your dashboard and FIRE baseline.',
          ar: 'ابدأ بإضافة الدخل ثم المصروفات ثم المحفظة، وبعدها راجع لوحة التحكم وخط الأساس لـ FIRE.',
        },
        content: {
          en: [
            '1. Add income from the Income page using salary, freelance, rental, or recurring entries.',
            '2. Log expenses manually or use receipt scanning and statement import on the Expenses page.',
            '3. Add investment holdings in Portfolio with your ticker, shares, and average cost.',
            '4. Set your net worth baseline by adding assets and liabilities in Net Worth.',
            '5. Review FIRE Tracker to understand your current FIRE Number and progress.',
            '6. Return to Dashboard to see a connected overview of everything in one place.',
          ],
          ar: [
            '1. أضف الدخل من صفحة الدخل مثل الراتب أو العمل الحر أو الدخل المتكرر.',
            '2. سجّل المصروفات يدوياً أو استخدم مسح الإيصال واستيراد كشف الحساب في صفحة المصروفات.',
            '3. أضف ممتلكاتك الاستثمارية في صفحة المحفظة مع الرمز وعدد الأسهم ومتوسط التكلفة.',
            '4. أنشئ نقطة بداية لصافي الثروة عبر إضافة الأصول والالتزامات في صفحة صافي الثروة.',
            '5. راجع متعقب FIRE لفهم رقم FIRE الحالي ومستوى التقدم.',
            '6. ارجع إلى لوحة التحكم لرؤية الصورة المالية المترابطة في مكان واحد.',
          ],
        },
        pageContexts: ['/dashboard', '/income', '/expenses', '/portfolio', '/net-worth', '/fire'],
        keywords: {
          en: ['first steps', 'getting started', 'setup', 'start using wealix', 'onboarding'],
          ar: ['البدء', 'البداية', 'الخطوات الأولى', 'كيف أبدأ', 'إعداد التطبيق', 'تهيئة ويليكس'],
        },
      },
    ],
  },
  {
    id: 'features',
    title: { en: 'Feature Guide', ar: 'دليل الميزات' },
    description: {
      en: 'Learn what each core area does and how to use it.',
      ar: 'تعرّف على وظيفة كل قسم أساسي وكيفية استخدامه.',
    },
    topics: [
      {
        id: 'dashboard',
        title: { en: 'Dashboard', ar: 'لوحة التحكم' },
        summary: {
          en: 'Your command center for net worth, portfolio value, FIRE progress, and monthly budget usage.',
          ar: 'مركز القيادة الذي يجمع صافي الثروة وقيمة المحفظة وتقدم FIRE واستخدام الميزانية الشهرية.',
        },
        content: {
          en: [
            'Dashboard consolidates your most important metrics: Net Worth, Portfolio Value, FIRE Progress, and Monthly Budget usage.',
            'Use Run AI Insight for a synthesized overview based on the financial data already stored in Wealix.',
            'The charts help you spot movement over time with Net Worth Trend and Spending Mix views.',
          ],
          ar: [
            'تجمع لوحة التحكم أهم مؤشراتك: صافي الثروة، قيمة المحفظة، تقدم FIRE، ونسبة استخدام الميزانية الشهرية.',
            'استخدم زر تشغيل التحليل الذكي للحصول على قراءة مختصرة مبنية على البيانات المالية المسجلة داخل Wealix.',
            'تساعدك الرسوم على متابعة التغير مع الوقت من خلال اتجاه صافي الثروة وتوزيع المصروفات.',
          ],
        },
        pageContexts: ['/dashboard'],
        keywords: {
          en: ['dashboard', 'net worth card', 'portfolio value', 'run ai insight', 'spending mix'],
          ar: ['لوحة التحكم', 'صافي الثروة', 'قيمة المحفظة', 'تشغيل التحليل الذكي', 'توزيع المصروفات'],
        },
      },
      {
        id: 'income',
        title: { en: 'Income', ar: 'الدخل' },
        summary: {
          en: 'Track salary, freelance work, rental income, and recurring inflows.',
          ar: 'تابع الراتب والعمل الحر والدخل الإيجاري وأي تدفقات مالية متكررة.',
        },
        content: {
          en: [
            'Use + Add Income to log salary, freelance work, rental income, investment income, or one-time payments.',
            'Recurring entries can be marked so they automatically roll into the next period without re-entry.',
            'The page highlights total income this month, recurring income, and average entry size.',
          ],
          ar: [
            'استخدم زر إضافة دخل لتسجيل الراتب أو العمل الحر أو الإيجار أو الدخل الاستثماري أو الدفعات لمرة واحدة.',
            'يمكن وضع علامة على الدخل المتكرر ليظهر تلقائياً في الفترات القادمة دون إدخال جديد.',
            'تعرض الصفحة إجمالي دخل هذا الشهر والدخل المتكرر ومتوسط قيمة الإدخال.',
          ],
        },
        pageContexts: ['/income'],
        keywords: {
          en: ['income', 'salary', 'recurring income', 'add income', 'freelance income'],
          ar: ['الدخل', 'الراتب', 'دخل متكرر', 'إضافة دخل', 'العمل الحر'],
        },
      },
      {
        id: 'expenses',
        title: { en: 'Expenses', ar: 'المصروفات' },
        summary: {
          en: 'Capture spending manually, from receipts, or from bank statements.',
          ar: 'سجّل الإنفاق يدوياً أو من الإيصالات أو من كشوف الحساب البنكي.',
        },
        content: {
          en: [
            'Expenses supports manual entries, OCR receipt scanning, and statement import from CSV, XLSX, or text-based PDF.',
            'Use Scan Receipt to extract merchant, amount, and date from a photo before reviewing and saving.',
            'Use Import Statement for a month-end bulk workflow when you want Wealix to parse and categorize bank transactions.',
          ],
          ar: [
            'تدعم صفحة المصروفات الإدخال اليدوي ومسح الإيصالات بتقنية OCR واستيراد الكشوف من CSV وXLSX وPDF النصي.',
            'استخدم مسح الإيصال لاستخراج اسم المتجر والمبلغ والتاريخ من الصورة ثم راجع البيانات قبل الحفظ.',
            'استخدم استيراد كشف الحساب عندما تريد رفع معاملات الشهر دفعة واحدة ليقوم Wealix بتحليلها وتصنيفها.',
          ],
        },
        pageContexts: ['/expenses'],
        keywords: {
          en: ['expenses', 'scan receipt', 'ocr', 'import statement', 'bank statement', 'expense categories'],
          ar: ['المصروفات', 'مسح الإيصال', 'استيراد كشف الحساب', 'كشف بنكي', 'ocr', 'تصنيف المصروفات'],
        },
      },
      {
        id: 'portfolio',
        title: { en: 'Investment Portfolio', ar: 'المحفظة الاستثمارية' },
        summary: {
          en: 'Manage holdings with market pricing, unrealized P&L, Shariah context, and AI analysis.',
          ar: 'أدر ممتلكاتك مع الأسعار السوقية والربح والخسارة غير المحققة والسياق الشرعي والتحليل الذكي.',
        },
        content: {
          en: [
            'Portfolio tracks stocks, ETFs, and gold with current value, average cost, invested capital, and unrealized P&L.',
            'Analyze Portfolio generates an executive-style review across diversification, concentration, and risk signals.',
            'Decision Check helps you test a new buy against your current portfolio balance, liquidity position, and goals.',
          ],
          ar: [
            'تتابع صفحة المحفظة الأسهم والصناديق والذهب مع القيمة الحالية ومتوسط التكلفة ورأس المال المستثمر والربح أو الخسارة غير المحققة.',
            'ينتج تحليل المحفظة قراءة تنفيذية عن التنويع والتركيز والمخاطر.',
            'يساعدك فحص القرار على اختبار شراء جديد مقارنة بتوازن المحفظة والسيولة والأهداف الحالية.',
          ],
        },
        pageContexts: ['/portfolio'],
        keywords: {
          en: ['portfolio', 'holdings', 'unrealized pnl', 'shariah', 'analyze portfolio', 'decision check'],
          ar: ['المحفظة', 'الممتلكات', 'الربح غير المحقق', 'التوافق الشرعي', 'تحليل المحفظة', 'فحص القرار'],
        },
      },
      {
        id: 'fire-tracker',
        title: { en: 'FIRE Tracker', ar: 'متعقب FIRE' },
        summary: {
          en: 'Measure progress toward financial independence using your savings rate and annual expenses.',
          ar: 'قس تقدمك نحو الاستقلال المالي باستخدام معدل الادخار والمصروفات السنوية.',
        },
        content: {
          en: [
            'FIRE Tracker estimates how far you are from financial independence using your FIRE Number and current net worth.',
            'Wealix uses the familiar FIRE math of annual expenses divided by a 4% withdrawal rate as the baseline.',
            'Use the Calculator, Savings Impact, and Scenarios views to compare different paths like LeanFIRE, FIRE, FatFIRE, or BaristaFIRE.',
          ],
          ar: [
            'يقدّر متعقب FIRE مدى قربك من الاستقلال المالي باستخدام رقم FIRE وصافي ثروتك الحالي.',
            'يعتمد Wealix على معادلة FIRE الشائعة وهي المصروفات السنوية مقسومة على معدل سحب 4% كنقطة أساس.',
            'استخدم الحاسبة وتأثير الادخار والسيناريوهات لمقارنة مسارات مثل LeanFIRE وFIRE وFatFIRE وBaristaFIRE.',
          ],
        },
        pageContexts: ['/fire'],
        keywords: {
          en: ['fire', 'fire number', '4% rule', 'leanfire', 'fatfire', 'baristafire', 'years to fire'],
          ar: ['فاير', 'رقم fire', 'قاعدة 4%', 'لين فاير', 'فات فاير', 'باريستا فاير', 'سنوات الوصول'],
        },
      },
      {
        id: 'net-worth',
        title: { en: 'Net Worth', ar: 'صافي الثروة' },
        summary: {
          en: 'Track the full balance between your assets and liabilities.',
          ar: 'تابع التوازن الكامل بين أصولك والتزاماتك.',
        },
        content: {
          en: [
            'Net Worth is your total assets minus your total liabilities.',
            'Add property, cash, investments, and vehicles as assets, and loans, credit cards, or mortgages as liabilities.',
            'Use the history and trend views to watch whether wealth is compounding in the right direction over time.',
          ],
          ar: [
            'صافي الثروة هو إجمالي الأصول ناقص إجمالي الالتزامات.',
            'أضف العقار والنقد والاستثمارات والمركبات كأصول، وأضف القروض والبطاقات الائتمانية والرهون كالتزامات.',
            'استخدم السجل والاتجاه الشهري لمراقبة ما إذا كانت ثروتك تنمو في الاتجاه الصحيح.',
          ],
        },
        pageContexts: ['/net-worth'],
        keywords: {
          en: ['net worth', 'assets', 'liabilities', 'add asset', 'add liability'],
          ar: ['صافي الثروة', 'الأصول', 'الالتزامات', 'إضافة أصل', 'إضافة التزام'],
        },
      },
      {
        id: 'budget-planning',
        title: { en: 'Budget & Planning', ar: 'الميزانية والتخطيط' },
        summary: {
          en: 'Monitor financial health, recurring obligations, and month-end or forward-looking forecasts.',
          ar: 'تابع الصحة المالية والالتزامات المتكررة وتوقعات نهاية الشهر والفترات القادمة.',
        },
        content: {
          en: [
            'Budget & Planning combines your spending behavior, savings rate, recurring obligations, and projected cash position.',
            'Use Daily Digest for a concise AI summary of what matters today and Forecast for your short- and medium-term outlook.',
            '30-Day Obligations highlights the fixed commitments that need to be covered soon.',
          ],
          ar: [
            'تجمع صفحة الميزانية والتخطيط بين سلوك الإنفاق ومعدل الادخار والالتزامات المتكررة والمركز النقدي المتوقع.',
            'استخدم الملخص اليومي للحصول على قراءة ذكية سريعة، واستخدم التوقعات لرؤية المدى القصير والمتوسط.',
            'يبرز قسم التزامات 30 يوماً المدفوعات الثابتة التي يجب تغطيتها قريباً.',
          ],
        },
        pageContexts: ['/budget-planning', '/budget', '/planning'],
        keywords: {
          en: ['budget', 'planning', 'forecast', 'daily digest', 'obligations', 'financial health score'],
          ar: ['الميزانية', 'التخطيط', 'التوقعات', 'الملخص اليومي', 'الالتزامات', 'درجة الصحة المالية'],
        },
      },
      {
        id: 'retirement',
        title: { en: 'Retirement Planner', ar: 'مخطط التقاعد' },
        summary: {
          en: 'Project your savings growth and retirement income against your target retirement age.',
          ar: 'توقع نمو مدخراتك ودخل التقاعد مقابل العمر المستهدف للتقاعد.',
        },
        content: {
          en: [
            'Retirement Planner lets you model current savings, monthly contributions, expected return, and target retirement age.',
            'Projection shows whether your current path supports the monthly income goal you set.',
            'Optimizer helps surface which input changes can improve your retirement trajectory.',
          ],
          ar: [
            'يسمح لك مخطط التقاعد بمحاكاة المدخرات الحالية والمساهمات الشهرية والعائد المتوقع وعمر التقاعد المستهدف.',
            'يوضح قسم التوقعات ما إذا كان المسار الحالي يحقق هدف الدخل الشهري الذي وضعته.',
            'يساعدك قسم التحسين على معرفة أي تغييرات قد ترفع فرص الوصول لهدف التقاعد.',
          ],
        },
        pageContexts: ['/retirement'],
        keywords: {
          en: ['retirement', 'projection', 'optimizer', 'monthly retirement income', 'retirement age'],
          ar: ['التقاعد', 'التوقعات', 'المحسن', 'دخل التقاعد الشهري', 'عمر التقاعد'],
        },
      },
      {
        id: 'wael',
        title: { en: 'Wael AI Advisor', ar: 'وائل المستشار الذكي' },
        summary: {
          en: 'Ask financial questions about your portfolio, FIRE path, and market decisions.',
          ar: 'اسأل عن المحفظة ومسار FIRE والقرارات المالية والأسواق.',
        },
        content: {
          en: [
            'Wael is the financial advisor inside Wealix. He is for portfolio questions, market context, FIRE strategy, and decision support.',
            'Wael uses your Wealix data context in the advisor experience so answers are grounded in your actual setup.',
            'For product navigation, documentation, and how-to guidance, use Reem instead of Wael.',
          ],
          ar: [
            'وائل هو المستشار المالي داخل Wealix، ومخصص لأسئلة المحفظة والسوق واستراتيجية FIRE ودعم القرار.',
            'يستخدم وائل سياق بياناتك داخل Wealix ليقدم إجابات مرتبطة بوضعك المالي الفعلي.',
            'أما شرح الميزات والتنقل داخل التطبيق والتوثيق فمكانه ريم وليس وائل.',
          ],
        },
        pageContexts: ['/advisor'],
        keywords: {
          en: ['wael', 'ai advisor', 'financial advisor', 'portfolio health check', 'ask wael'],
          ar: ['وائل', 'المستشار الذكي', 'المستشار المالي', 'فحص صحة المحفظة', 'اسأل وائل'],
        },
      },
      {
        id: 'reports',
        title: { en: 'Reports', ar: 'التقارير' },
        summary: {
          en: 'Generate downloadable summaries for net worth, cash flow, budgets, and portfolio reviews.',
          ar: 'أنشئ ملخصات قابلة للتنزيل لصافي الثروة والتدفق النقدي والميزانيات ومراجعات المحفظة.',
        },
        content: {
          en: [
            'Reports help you export structured snapshots of your financial position and activity.',
            'Free reports cover core tracking views like net worth, income, expenses, budget, and monthly summaries.',
            'Advanced report types like portfolio analysis and annual review can be tied to Pro access depending on your subscription.',
          ],
          ar: [
            'تساعدك التقارير على تصدير لقطات منظمة عن وضعك المالي ونشاطك خلال الفترة.',
            'تشمل التقارير المجانية المشاهد الأساسية مثل صافي الثروة والدخل والمصروفات والميزانية والملخصات الشهرية.',
            'أما التقارير المتقدمة مثل تحليل المحفظة والمراجعة السنوية فقد ترتبط بخطة Pro حسب اشتراكك.',
          ],
        },
        pageContexts: ['/reports'],
        keywords: {
          en: ['reports', 'generate report', 'portfolio report', 'annual review', 'pro report'],
          ar: ['التقارير', 'إنشاء تقرير', 'تقرير المحفظة', 'المراجعة السنوية', 'تقرير برو'],
        },
      },
    ],
  },
  {
    id: 'faq',
    title: { en: 'FAQ', ar: 'الأسئلة الشائعة' },
    description: {
      en: 'Common questions about security, calculations, and workflows.',
      ar: 'إجابات سريعة عن الأمان والحسابات وسير العمل.',
    },
    topics: [
      {
        id: 'security',
        title: { en: 'Is my financial data secure?', ar: 'هل بياناتي المالية آمنة؟' },
        summary: {
          en: 'Wealix is designed as a protected personal workspace for sensitive financial data.',
          ar: 'تم تصميم Wealix كمساحة شخصية محمية للتعامل مع البيانات المالية الحساسة.',
        },
        content: {
          en: [
            'Wealix treats your workspace as private financial infrastructure and is designed around protected personal data handling.',
            'The product surfaces this as Wealix Secure inside the app to reinforce that your data stays in your own workspace context.',
          ],
          ar: [
            'يتعامل Wealix مع مساحة عملك كبنية مالية خاصة ومحمية، وتم تصميم التجربة حول حماية البيانات الشخصية الحساسة.',
            'ولهذا تظهر لك إشارات Wealix Secure داخل التطبيق لتأكيد أن بياناتك تبقى ضمن مساحة عملك الخاصة.',
          ],
        },
        pageContexts: ['/settings', '/dashboard'],
        keywords: {
          en: ['secure', 'security', 'privacy', 'wealix secure', 'data protection'],
          ar: ['آمن', 'الأمان', 'الخصوصية', 'ويليكس سيكيور', 'حماية البيانات'],
        },
      },
      {
        id: 'health-score',
        title: { en: 'How is the Financial Health score calculated?', ar: 'كيف يتم حساب درجة الصحة المالية؟' },
        summary: {
          en: 'It blends savings behavior, obligation coverage, and budget discipline into a single score.',
          ar: 'تجمع بين سلوك الادخار وتغطية الالتزامات والانضباط في الميزانية داخل درجة واحدة.',
        },
        content: {
          en: [
            'Financial Health is a composite signal, not a single raw formula.',
            'It reflects how well you are saving, whether your income comfortably covers obligations, and how closely your spending tracks your plan.',
            'Higher scores generally mean stronger day-to-day financial resilience.',
          ],
          ar: [
            'درجة الصحة المالية مؤشر مركب وليست معادلة أحادية بسيطة.',
            'هي تعكس جودة الادخار، ومدى تغطية الدخل للالتزامات، ومدى التزامك بخطة الإنفاق.',
            'كلما ارتفعت الدرجة دل ذلك غالباً على مرونة مالية أفضل في حياتك اليومية.',
          ],
        },
        pageContexts: ['/budget-planning', '/dashboard'],
        keywords: {
          en: ['financial health score', 'health score', 'score out of 100'],
          ar: ['درجة الصحة المالية', 'الصحة المالية', 'درجة من 100'],
        },
      },
      {
        id: 'receipt-scanner',
        title: { en: 'How does the receipt scanner work?', ar: 'كيف يعمل ماسح الإيصالات؟' },
        summary: {
          en: 'The scanner uses OCR to extract merchant, amount, and date before you confirm the result.',
          ar: 'يستخدم الماسح OCR لاستخراج المتجر والمبلغ والتاريخ قبل التأكيد.',
        },
        content: {
          en: [
            'Receipt scanning uses OCR to read text from the uploaded image or captured photo.',
            'The extracted result is presented back to you for review before it becomes a saved expense entry.',
            'Clear, well-lit receipts produce better results than blurry or low-contrast images.',
          ],
          ar: [
            'يعتمد مسح الإيصال على OCR لقراءة النص من الصورة المرفوعة أو الملتقطة بالكاميرا.',
            'يتم عرض النتيجة المستخرجة عليك أولاً للمراجعة قبل تحويلها إلى مصروف محفوظ.',
            'تحقق الإيصالات الواضحة وذات الإضاءة الجيدة نتائج أفضل من الصور الضبابية أو منخفضة التباين.',
          ],
        },
        pageContexts: ['/expenses'],
        keywords: {
          en: ['receipt scanner', 'ocr', 'scan receipt', 'merchant amount date'],
          ar: ['ماسح الإيصالات', 'مسح الإيصال', 'ocr', 'اسم المتجر', 'المبلغ والتاريخ'],
        },
      },
      {
        id: 'statement-formats',
        title: { en: 'What statement import formats are supported?', ar: 'ما الصيغ المدعومة لاستيراد كشف الحساب؟' },
        summary: {
          en: 'CSV, XLSX, and text-based PDFs are the intended import formats.',
          ar: 'الصيغ المقصودة للاستيراد هي CSV وXLSX وPDF النصي.',
        },
        content: {
          en: [
            'The statement importer is designed for direct bank export files.',
            'CSV, XLSX, and text-based PDF statements are supported. Scanned image PDFs are not ideal for this flow.',
            'If an import fails, the first thing to check is whether the file came directly from the bank and is not password protected.',
          ],
          ar: [
            'تم تصميم مستورد الكشوف للعمل مع الملفات المصدرة مباشرة من البنك.',
            'الملفات المدعومة هي CSV وXLSX وكشوف PDF النصية. أما ملفات PDF المصورة فليست الأنسب لهذا المسار.',
            'إذا فشل الاستيراد فابدأ بالتأكد أن الملف صادر من البنك مباشرة وليس محمياً بكلمة مرور.',
          ],
        },
        pageContexts: ['/expenses'],
        keywords: {
          en: ['statement import', 'csv', 'xlsx', 'pdf', 'bank import formats'],
          ar: ['استيراد كشف الحساب', 'csv', 'xlsx', 'pdf', 'صيغ الاستيراد البنكي'],
        },
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: { en: 'Troubleshooting', ar: 'استكشاف الأخطاء' },
    description: {
      en: 'Quick fixes for common issues.',
      ar: 'حلول سريعة للمشكلات الشائعة.',
    },
    topics: [
      {
        id: 'portfolio-prices',
        title: { en: 'Portfolio prices are not updating', ar: 'أسعار المحفظة لا تتحدث' },
        summary: {
          en: 'Refresh market data first, then confirm the market is open.',
          ar: 'حدّث الأسعار أولاً ثم تأكد أن السوق مفتوح.',
        },
        content: {
          en: [
            'Use the refresh or reload action on Portfolio first.',
            'If pricing still looks unchanged, the underlying market may be closed or the latest quote has not moved yet.',
            'If a holding remains stale after that, re-open the page and confirm the ticker and exchange are correct.',
          ],
          ar: [
            'ابدأ باستخدام تحديث الأسعار أو إعادة تحميل صفحة المحفظة.',
            'إذا بقيت الأسعار كما هي فقد يكون السوق مغلقاً أو لم تتغير آخر الأسعار بعد.',
            'إذا استمر أصل معين بلا تحديث فافتح الصفحة مرة أخرى وتأكد من صحة الرمز والسوق.',
          ],
        },
        pageContexts: ['/portfolio'],
        keywords: {
          en: ['prices not updating', 'refresh prices', 'market closed', 'stale portfolio'],
          ar: ['الأسعار لا تتحدث', 'تحديث الأسعار', 'السوق مغلق', 'بيانات المحفظة متأخرة'],
        },
      },
      {
        id: 'fire-number-off',
        title: { en: 'My FIRE Number looks too high or too low', ar: 'رقم FIRE يبدو مرتفعاً أو منخفضاً بشكل غير منطقي' },
        summary: {
          en: 'Check the annual expense input first because FIRE math is very sensitive to it.',
          ar: 'راجع المصروف السنوي أولاً لأن معادلة FIRE شديدة الحساسية له.',
        },
        content: {
          en: [
            'The fastest check is to review your annual expenses inside FIRE Tracker.',
            'Because the FIRE Number is based on annual spending, even a modest change there can move the result significantly.',
            'If the output still feels off, compare it against your savings assumptions and current net worth baseline.',
          ],
          ar: [
            'أسرع خطوة هي مراجعة المصروفات السنوية داخل متعقب FIRE.',
            'وبما أن رقم FIRE مبني على الإنفاق السنوي، فإن أي تعديل بسيط هناك قد يغيّر النتيجة بشكل واضح.',
            'إذا بقيت النتيجة غير منطقية فقارنها أيضاً بافتراضات الادخار وخط الأساس لصافي الثروة.',
          ],
        },
        pageContexts: ['/fire'],
        keywords: {
          en: ['fire number wrong', 'fire number too high', 'fire number too low'],
          ar: ['رقم fire خطأ', 'رقم fire مرتفع', 'رقم fire منخفض'],
        },
      },
      {
        id: 'ai-slow',
        title: { en: 'AI analysis is taking too long', ar: 'التحليل الذكي يستغرق وقتاً طويلاً' },
        summary: {
          en: 'AI tasks run asynchronously, so it is normal for them to finish in the background.',
          ar: 'تعمل مهام الذكاء الاصطناعي في الخلفية، لذلك من الطبيعي ألا تظهر فوراً.',
        },
        content: {
          en: [
            'Wait for the in-app notification first because large analysis runs may complete asynchronously.',
            'If a task remains in a processing state for an unusually long time, refreshing the page is the next clean step.',
            'Use Wael for conversational analysis and Reem for product help while you wait.',
          ],
          ar: [
            'انتظر إشعار التطبيق أولاً لأن التحليلات الكبيرة قد تكتمل بشكل غير متزامن في الخلفية.',
            'إذا بقيت المهمة في حالة المعالجة لمدة طويلة بشكل غير معتاد، فقم بتحديث الصفحة كخطوة تالية.',
            'يمكنك استخدام وائل للتحليل الحواري وريم للمساعدة داخل المنتج أثناء الانتظار.',
          ],
        },
        pageContexts: ['/portfolio', '/advisor', '/dashboard'],
        keywords: {
          en: ['ai slow', 'analysis taking too long', 'processing', 'stuck'],
          ar: ['الذكاء الاصطناعي بطيء', 'التحليل متأخر', 'قيد المعالجة', 'عالق'],
        },
      },
    ],
  },
];

export const pageHelpContexts: Record<string, PageHelpContext> = {
  '/dashboard': {
    page: { en: 'Dashboard', ar: 'لوحة التحكم' },
    greeting: {
      en: 'You are on Dashboard, where Wealix brings your wealth picture into one view.',
      ar: 'أنت الآن في لوحة التحكم، حيث يجمع Wealix صورتك المالية في شاشة واحدة.',
    },
    quickHelp: {
      en: ['What does Net Worth mean here?', 'How do I use Run AI Insight?', 'What is FIRE Progress?'],
      ar: ['ماذا يعني صافي الثروة هنا؟', 'كيف أستخدم التحليل الذكي؟', 'ما هو تقدم FIRE؟'],
    },
  },
  '/income': {
    page: { en: 'Income', ar: 'الدخل' },
    greeting: {
      en: 'You are on Income, where recurring and one-time inflows are tracked.',
      ar: 'أنت الآن في صفحة الدخل، حيث تتم متابعة التدفقات المتكررة وغير المتكررة.',
    },
    quickHelp: {
      en: ['How do I add recurring income?', 'What categories can I use for income?', 'Does freelance income work here too?'],
      ar: ['كيف أضيف دخلاً متكرراً؟', 'ما التصنيفات المتاحة للدخل؟', 'هل يمكنني إضافة دخل العمل الحر؟'],
    },
  },
  '/expenses': {
    page: { en: 'Expenses', ar: 'المصروفات' },
    greeting: {
      en: 'You are on Expenses, where you can log entries manually or import them in bulk.',
      ar: 'أنت الآن في صفحة المصروفات، ويمكنك هنا الإدخال يدوياً أو الاستيراد دفعة واحدة.',
    },
    quickHelp: {
      en: ['How do I scan a receipt?', 'How do I import a bank statement?', 'What file formats are supported?'],
      ar: ['كيف أمسح إيصالاً؟', 'كيف أستورد كشف حساب بنكي؟', 'ما الصيغ المدعومة؟'],
    },
  },
  '/portfolio': {
    page: { en: 'Portfolio', ar: 'المحفظة' },
    greeting: {
      en: 'You are on Portfolio, where holdings, pricing, and analysis all come together.',
      ar: 'أنت الآن في المحفظة، حيث تجتمع الممتلكات والأسعار والتحليل في مكان واحد.',
    },
    quickHelp: {
      en: ['What is Unrealized P&L?', 'How does Decision Check work?', 'What does Shariah compliant mean?'],
      ar: ['ما هو الربح والخسارة غير المحققة؟', 'كيف يعمل فحص القرار؟', 'ماذا يعني التوافق الشرعي؟'],
    },
  },
  '/fire': {
    page: { en: 'FIRE Tracker', ar: 'متعقب FIRE' },
    greeting: {
      en: 'You are on FIRE Tracker, where you model financial independence progress.',
      ar: 'أنت الآن في متعقب FIRE، حيث تحاكي تقدمك نحو الاستقلال المالي.',
    },
    quickHelp: {
      en: ['How is the FIRE Number calculated?', 'What is the 4% rule?', 'What is the difference between LeanFIRE and FatFIRE?'],
      ar: ['كيف يتم حساب رقم FIRE؟', 'ما هي قاعدة 4%؟', 'ما الفرق بين LeanFIRE وFatFIRE؟'],
    },
  },
  '/net-worth': {
    page: { en: 'Net Worth', ar: 'صافي الثروة' },
    greeting: {
      en: 'You are on Net Worth, where assets and liabilities are combined into your clearest wealth metric.',
      ar: 'أنت الآن في صافي الثروة، حيث يتم جمع الأصول والالتزامات في أوضح مؤشر لثروتك.',
    },
    quickHelp: {
      en: ['How do I add an asset?', 'How do I add a liability?', 'What counts toward net worth?'],
      ar: ['كيف أضيف أصلاً؟', 'كيف أضيف التزاماً؟', 'ما الذي يدخل ضمن صافي الثروة؟'],
    },
  },
  '/budget-planning': {
    page: { en: 'Budget & Planning', ar: 'الميزانية والتخطيط' },
    greeting: {
      en: 'You are on Budget & Planning, where daily discipline and future projections meet.',
      ar: 'أنت الآن في الميزانية والتخطيط، حيث يلتقي الانضباط اليومي مع التوقعات المستقبلية.',
    },
    quickHelp: {
      en: ['What is the Financial Health score?', 'What are obligations?', 'How do forecasts work?'],
      ar: ['ما هي درجة الصحة المالية؟', 'ما المقصود بالالتزامات؟', 'كيف تعمل التوقعات؟'],
    },
  },
  '/retirement': {
    page: { en: 'Retirement', ar: 'التقاعد' },
    greeting: {
      en: 'You are on Retirement Planner, where long-range savings and retirement income goals are projected.',
      ar: 'أنت الآن في مخطط التقاعد، حيث يتم توقع نمو المدخرات وأهداف دخل التقاعد.',
    },
    quickHelp: {
      en: ['How is my retirement projection calculated?', 'What does the optimizer do?', 'What does on track mean?'],
      ar: ['كيف يُحسب توقع التقاعد؟', 'ماذا يفعل المحسن؟', 'ماذا يعني أنني على المسار؟'],
    },
  },
  '/advisor': {
    page: { en: 'AI Advisor', ar: 'المستشار الذكي' },
    greeting: {
      en: 'You are on Wael, the financial advisor experience inside Wealix.',
      ar: 'أنت الآن مع وائل، تجربة المستشار المالي داخل Wealix.',
    },
    quickHelp: {
      en: ['What can I ask Wael?', 'What is the difference between Wael and Reem?', 'Does Wael use my Wealix data?'],
      ar: ['ماذا يمكنني أن أسأل وائل؟', 'ما الفرق بين وائل وريم؟', 'هل يستخدم وائل بيانات Wealix الخاصة بي؟'],
    },
  },
  '/reports': {
    page: { en: 'Reports', ar: 'التقارير' },
    greeting: {
      en: 'You are on Reports, where you can generate structured financial summaries.',
      ar: 'أنت الآن في التقارير، حيث يمكنك إنشاء ملخصات مالية منظمة.',
    },
    quickHelp: {
      en: ['Which reports are free vs Pro?', 'How do I generate a report?', 'What does the annual review include?'],
      ar: ['أي التقارير مجانية وأيها ضمن Pro؟', 'كيف أنشئ تقريراً؟', 'ماذا تتضمن المراجعة السنوية؟'],
    },
  },
  '/help': {
    page: { en: 'Help Center', ar: 'مركز المساعدة' },
    greeting: {
      en: 'You are in the Help Center, where documentation, FAQs, and Reem all work together.',
      ar: 'أنت الآن في مركز المساعدة، حيث تعمل الوثائق والأسئلة الشائعة وريم معاً.',
    },
    quickHelp: {
      en: ['What is Wealix?', 'How do I get started?', 'What is the difference between Reem and Wael?'],
      ar: ['ما هو Wealix؟', 'كيف أبدأ؟', 'ما الفرق بين ريم ووائل؟'],
    },
  },
};

export const allHelpTopics = helpSections.flatMap((section) => section.topics);

export function getLocalizedText(value: LocalizedText, locale: Locale) {
  return value[locale];
}

export function getTopicParagraphs(topic: HelpTopic, locale: Locale) {
  return topic.content[locale];
}

export function getTopicKeywords(topic: HelpTopic, locale: Locale) {
  return topic.keywords[locale];
}

export function getQuickHelp(context: PageHelpContext, locale: Locale) {
  return context.quickHelp[locale];
}

export function findHelpTopicByPrompt(input: string, currentPage: string, locale: Locale) {
  const normalized = input.toLowerCase().trim();

  const scored = allHelpTopics
    .map((topic) => {
      let score = 0;
      const localeKeywords = topic.keywords[locale];
      const alternateKeywords = topic.keywords[locale === 'ar' ? 'en' : 'ar'];
      const titleMatch = topic.title[locale].toLowerCase();
      const alternateTitleMatch = topic.title[locale === 'ar' ? 'en' : 'ar'].toLowerCase();

      for (const keyword of localeKeywords) {
        if (normalized.includes(keyword.toLowerCase())) {
          score += 4;
        }
      }

      for (const keyword of alternateKeywords) {
        if (normalized.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }

      if (normalized.includes(titleMatch)) {
        score += 3;
      }

      if (normalized.includes(alternateTitleMatch)) {
        score += 1;
      }

      if (topic.pageContexts?.includes(currentPage)) {
        score += 1;
      }

      return { topic, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  return scored[0]?.topic ?? null;
}

export function getPageHelpContext(pathname: string) {
  return pageHelpContexts[pathname] ?? pageHelpContexts['/dashboard'];
}
