export interface HelpTopic {
  id: string;
  title: string;
  summary: string;
  content: string[];
  pageContexts?: string[];
  keywords: string[];
}

export interface HelpSection {
  id: string;
  title: string;
  description: string;
  topics: HelpTopic[];
}

export interface PageHelpContext {
  page: string;
  greeting: string;
  quickHelp: string[];
}

export const helpSections: HelpSection[] = [
  {
    id: 'quick-start',
    title: 'Quick Start',
    description: 'Set up Wealix as your personal wealth operating system in a few steps.',
    topics: [
      {
        id: 'what-is-wealix',
        title: 'What is Wealix?',
        summary: 'Wealix brings your income, expenses, portfolio, net worth, FIRE plan, and retirement view into one workspace.',
        content: [
          'Wealix is a Personal Wealth Operating System designed to track the financial picture that matters most: cash flow, investments, net worth, FIRE progress, and retirement readiness.',
          'It is built for Saudi and MENA investors, with SAR-first workflows, Shariah-friendly portfolio context, and support for local exchanges like TASI.',
          'Think of it as a private financial control room that keeps your financial data connected instead of scattered across spreadsheets and notes.',
        ],
        pageContexts: ['/dashboard', '/app'],
        keywords: ['what is wealix', 'about wealix', 'personal wealth operating system', 'wealth os'],
      },
      {
        id: 'first-steps',
        title: 'First steps for new users',
        summary: 'Start with income, add expenses, build your portfolio, and review your dashboard and FIRE baseline.',
        content: [
          '1. Add income from the Income page using salary, freelance, rental, or recurring entries.',
          '2. Log expenses manually or use receipt scanning and statement import on the Expenses page.',
          '3. Add investment holdings in Portfolio with your ticker, shares, and average cost.',
          '4. Set your net worth baseline by adding assets and liabilities in Net Worth.',
          '5. Review FIRE Tracker to understand your current FIRE Number and progress.',
          '6. Return to Dashboard to see a connected overview of everything in one place.',
        ],
        pageContexts: ['/dashboard', '/income', '/expenses', '/portfolio', '/net-worth', '/fire'],
        keywords: ['first steps', 'getting started', 'setup', 'start using wealix', 'onboarding'],
      },
    ],
  },
  {
    id: 'features',
    title: 'Feature Guide',
    description: 'Learn what each core area does and how to use it.',
    topics: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        summary: 'Your command center for net worth, portfolio value, FIRE progress, and monthly budget usage.',
        content: [
          'Dashboard consolidates your most important metrics: Net Worth, Portfolio Value, FIRE Progress, and Monthly Budget usage.',
          'Use Run AI Insight for a synthesized overview based on the financial data already stored in Wealix.',
          'The charts help you spot movement over time with Net Worth Trend and Spending Mix views.',
        ],
        pageContexts: ['/dashboard'],
        keywords: ['dashboard', 'net worth card', 'portfolio value', 'run ai insight', 'spending mix'],
      },
      {
        id: 'income',
        title: 'Income',
        summary: 'Track salary, freelance work, rental income, and recurring inflows.',
        content: [
          'Use + Add Income to log salary, freelance work, rental income, investment income, or one-time payments.',
          'Recurring entries can be marked so they automatically roll into the next period without re-entry.',
          'The page highlights total income this month, recurring income, and average entry size.',
        ],
        pageContexts: ['/income'],
        keywords: ['income', 'salary', 'recurring income', 'add income', 'freelance income'],
      },
      {
        id: 'expenses',
        title: 'Expenses',
        summary: 'Capture spending manually, from receipts, or from bank statements.',
        content: [
          'Expenses supports manual entries, OCR receipt scanning, and statement import from CSV, XLSX, or text-based PDF.',
          'Use Scan Receipt to extract merchant, amount, and date from a photo before reviewing and saving.',
          'Use Import Statement for a month-end bulk workflow when you want Wealix to parse and categorize bank transactions.',
        ],
        pageContexts: ['/expenses'],
        keywords: ['expenses', 'scan receipt', 'ocr', 'import statement', 'bank statement', 'expense categories'],
      },
      {
        id: 'portfolio',
        title: 'Investment Portfolio',
        summary: 'Manage holdings with market pricing, unrealized P&L, Shariah context, and AI analysis.',
        content: [
          'Portfolio tracks stocks, ETFs, and gold with current value, average cost, invested capital, and unrealized P&L.',
          'Analyze Portfolio generates an executive-style review across diversification, concentration, and risk signals.',
          'Decision Check helps you test a new buy against your current portfolio balance, liquidity position, and goals.',
        ],
        pageContexts: ['/portfolio'],
        keywords: ['portfolio', 'holdings', 'unrealized pnl', 'shariah', 'analyze portfolio', 'decision check'],
      },
      {
        id: 'fire-tracker',
        title: 'FIRE Tracker',
        summary: 'Measure progress toward financial independence using your savings rate and annual expenses.',
        content: [
          'FIRE Tracker estimates how far you are from financial independence using your FIRE Number and current net worth.',
          'Wealix uses the familiar FIRE math of annual expenses divided by a 4% withdrawal rate as the baseline.',
          'Use the Calculator, Savings Impact, and Scenarios views to compare different paths like LeanFIRE, FIRE, FatFIRE, or BaristaFIRE.',
        ],
        pageContexts: ['/fire'],
        keywords: ['fire', 'fire number', '4% rule', 'leanfire', 'fatfire', 'baristafire', 'years to fire'],
      },
      {
        id: 'net-worth',
        title: 'Net Worth',
        summary: 'Track the full balance between your assets and liabilities.',
        content: [
          'Net Worth is your total assets minus your total liabilities.',
          'Add property, cash, investments, and vehicles as assets, and loans, credit cards, or mortgages as liabilities.',
          'Use the history and trend views to watch whether wealth is compounding in the right direction over time.',
        ],
        pageContexts: ['/net-worth'],
        keywords: ['net worth', 'assets', 'liabilities', 'add asset', 'add liability'],
      },
      {
        id: 'budget-planning',
        title: 'Budget & Planning',
        summary: 'Monitor financial health, recurring obligations, and month-end or forward-looking forecasts.',
        content: [
          'Budget & Planning combines your spending behavior, savings rate, recurring obligations, and projected cash position.',
          'Use Daily Digest for a concise AI summary of what matters today and Forecast for your short- and medium-term outlook.',
          '30-Day Obligations highlights the fixed commitments that need to be covered soon.',
        ],
        pageContexts: ['/budget-planning', '/budget', '/planning'],
        keywords: ['budget', 'planning', 'forecast', 'daily digest', 'obligations', 'financial health score'],
      },
      {
        id: 'retirement',
        title: 'Retirement Planner',
        summary: 'Project your savings growth and retirement income against your target retirement age.',
        content: [
          'Retirement Planner lets you model current savings, monthly contributions, expected return, and target retirement age.',
          'Projection shows whether your current path supports the monthly income goal you set.',
          'Optimizer helps surface which input changes can improve your retirement trajectory.',
        ],
        pageContexts: ['/retirement'],
        keywords: ['retirement', 'projection', 'optimizer', 'monthly retirement income', 'retirement age'],
      },
      {
        id: 'wael',
        title: 'Wael AI Advisor',
        summary: 'Ask financial questions about your portfolio, FIRE path, and market decisions.',
        content: [
          'Wael is the financial advisor inside Wealix. He is for portfolio questions, market context, FIRE strategy, and decision support.',
          'Wael uses your Wealix data context in the advisor experience so answers are grounded in your actual setup.',
          'For product navigation, documentation, and how-to guidance, use Reem instead of Wael.',
        ],
        pageContexts: ['/advisor'],
        keywords: ['wael', 'ai advisor', 'financial advisor', 'portfolio health check', 'ask wael'],
      },
      {
        id: 'reports',
        title: 'Reports',
        summary: 'Generate downloadable summaries for net worth, cash flow, budgets, and portfolio reviews.',
        content: [
          'Reports help you export structured snapshots of your financial position and activity.',
          'Free reports cover core tracking views like net worth, income, expenses, budget, and monthly summaries.',
          'Advanced report types like portfolio analysis and annual review can be tied to Pro access depending on your subscription.',
        ],
        pageContexts: ['/reports'],
        keywords: ['reports', 'generate report', 'portfolio report', 'annual review', 'pro report'],
      },
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Common questions about security, calculations, and workflows.',
    topics: [
      {
        id: 'security',
        title: 'Is my financial data secure?',
        summary: 'Wealix is designed as a protected personal workspace for sensitive financial data.',
        content: [
          'Wealix treats your workspace as private financial infrastructure and is designed around protected personal data handling.',
          'The product surfaces this as Wealix Secure inside the app to reinforce that your data stays in your own workspace context.',
        ],
        pageContexts: ['/settings', '/dashboard'],
        keywords: ['secure', 'security', 'privacy', 'wealix secure', 'data protection'],
      },
      {
        id: 'health-score',
        title: 'How is the Financial Health score calculated?',
        summary: 'It blends savings behavior, obligation coverage, and budget discipline into a single score.',
        content: [
          'Financial Health is a composite signal, not a single raw formula.',
          'It reflects how well you are saving, whether your income comfortably covers obligations, and how closely your spending tracks your plan.',
          'Higher scores generally mean stronger day-to-day financial resilience.',
        ],
        pageContexts: ['/budget-planning', '/dashboard'],
        keywords: ['financial health score', 'health score', 'score out of 100'],
      },
      {
        id: 'receipt-scanner',
        title: 'How does the receipt scanner work?',
        summary: 'The scanner uses OCR to extract merchant, amount, and date before you confirm the result.',
        content: [
          'Receipt scanning uses OCR to read text from the uploaded image or captured photo.',
          'The extracted result is presented back to you for review before it becomes a saved expense entry.',
          'Clear, well-lit receipts produce better results than blurry or low-contrast images.',
        ],
        pageContexts: ['/expenses'],
        keywords: ['receipt scanner', 'ocr', 'scan receipt', 'merchant amount date'],
      },
      {
        id: 'statement-formats',
        title: 'What statement import formats are supported?',
        summary: 'CSV, XLSX, and text-based PDFs are the intended import formats.',
        content: [
          'The statement importer is designed for direct bank export files.',
          'CSV, XLSX, and text-based PDF statements are supported. Scanned image PDFs are not ideal for this flow.',
          'If an import fails, the first thing to check is whether the file came directly from the bank and is not password protected.',
        ],
        pageContexts: ['/expenses'],
        keywords: ['statement import', 'csv', 'xlsx', 'pdf', 'bank import formats'],
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Quick fixes for common issues.',
    topics: [
      {
        id: 'portfolio-prices',
        title: 'Portfolio prices are not updating',
        summary: 'Refresh market data first, then confirm the market is open.',
        content: [
          'Use the refresh or reload action on Portfolio first.',
          'If pricing still looks unchanged, the underlying market may be closed or the latest quote has not moved yet.',
          'If a holding remains stale after that, re-open the page and confirm the ticker and exchange are correct.',
        ],
        pageContexts: ['/portfolio'],
        keywords: ['prices not updating', 'refresh prices', 'market closed', 'stale portfolio'],
      },
      {
        id: 'fire-number-off',
        title: 'My FIRE Number looks too high or too low',
        summary: 'Check the annual expense input first because FIRE math is very sensitive to it.',
        content: [
          'The fastest check is to review your annual expenses inside FIRE Tracker.',
          'Because the FIRE Number is based on annual spending, even a modest change there can move the result significantly.',
          'If the output still feels off, compare it against your savings assumptions and current net worth baseline.',
        ],
        pageContexts: ['/fire'],
        keywords: ['fire number wrong', 'fire number too high', 'fire number too low'],
      },
      {
        id: 'ai-slow',
        title: 'AI analysis is taking too long',
        summary: 'AI tasks run asynchronously, so it is normal for them to finish in the background.',
        content: [
          'Wait for the in-app notification first because large analysis runs may complete asynchronously.',
          'If a task remains in a processing state for an unusually long time, refreshing the page is the next clean step.',
          'Use Wael for conversational analysis and Reem for product help while you wait.',
        ],
        pageContexts: ['/portfolio', '/advisor', '/dashboard'],
        keywords: ['ai slow', 'analysis taking too long', 'processing', 'stuck'],
      },
    ],
  },
];

export const pageHelpContexts: Record<string, PageHelpContext> = {
  '/dashboard': {
    page: 'Dashboard',
    greeting: 'You are on Dashboard, where Wealix brings your wealth picture into one view.',
    quickHelp: [
      'What does Net Worth mean here?',
      'How do I use Run AI Insight?',
      'What is FIRE Progress?',
    ],
  },
  '/income': {
    page: 'Income',
    greeting: 'You are on Income, where recurring and one-time inflows are tracked.',
    quickHelp: [
      'How do I add recurring income?',
      'What categories can I use for income?',
      'Does freelance income work here too?',
    ],
  },
  '/expenses': {
    page: 'Expenses',
    greeting: 'You are on Expenses, where you can log entries manually or import them in bulk.',
    quickHelp: [
      'How do I scan a receipt?',
      'How do I import a bank statement?',
      'What file formats are supported?',
    ],
  },
  '/portfolio': {
    page: 'Portfolio',
    greeting: 'You are on Portfolio, where holdings, pricing, and analysis all come together.',
    quickHelp: [
      'What is Unrealized P&L?',
      'How does Decision Check work?',
      'What does Shariah compliant mean?',
    ],
  },
  '/fire': {
    page: 'FIRE Tracker',
    greeting: 'You are on FIRE Tracker, where you model financial independence progress.',
    quickHelp: [
      'How is the FIRE Number calculated?',
      'What is the 4% rule?',
      'What is the difference between LeanFIRE and FatFIRE?',
    ],
  },
  '/net-worth': {
    page: 'Net Worth',
    greeting: 'You are on Net Worth, where assets and liabilities are combined into your clearest wealth metric.',
    quickHelp: [
      'How do I add an asset?',
      'How do I add a liability?',
      'What counts toward net worth?',
    ],
  },
  '/budget-planning': {
    page: 'Budget & Planning',
    greeting: 'You are on Budget & Planning, where daily discipline and future projections meet.',
    quickHelp: [
      'What is the Financial Health score?',
      'What are obligations?',
      'How do forecasts work?',
    ],
  },
  '/retirement': {
    page: 'Retirement',
    greeting: 'You are on Retirement Planner, where long-range savings and retirement income goals are projected.',
    quickHelp: [
      'How is my retirement projection calculated?',
      'What does the optimizer do?',
      'What does on track mean?',
    ],
  },
  '/advisor': {
    page: 'AI Advisor',
    greeting: 'You are on Wael, the financial advisor experience inside Wealix.',
    quickHelp: [
      'What can I ask Wael?',
      'What is the difference between Wael and Reem?',
      'Does Wael use my Wealix data?',
    ],
  },
  '/reports': {
    page: 'Reports',
    greeting: 'You are on Reports, where you can generate structured financial summaries.',
    quickHelp: [
      'Which reports are free vs Pro?',
      'How do I generate a report?',
      'What does the annual review include?',
    ],
  },
  '/help': {
    page: 'Help Center',
    greeting: 'You are in the Help Center, where documentation, FAQs, and Reem all work together.',
    quickHelp: [
      'What is Wealix?',
      'How do I get started?',
      'What is the difference between Reem and Wael?',
    ],
  },
};

export const allHelpTopics = helpSections.flatMap((section) => section.topics);

export function findHelpTopicByPrompt(input: string, currentPage: string) {
  const normalized = input.toLowerCase().trim();

  const scored = allHelpTopics
    .map((topic) => {
      let score = 0;

      for (const keyword of topic.keywords) {
        if (normalized.includes(keyword)) {
          score += 3;
        }
      }

      if (normalized.includes(topic.title.toLowerCase())) {
        score += 2;
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
