import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'ar' | 'en';
export type Theme = 'dark' | 'light' | 'system';
export type SubscriptionTier = 'free' | 'core' | 'pro';
export type AppMode = 'demo' | 'live';
export type IncomeSource = 'salary' | 'freelance' | 'business' | 'investment' | 'rental' | 'other';
export type IncomeFrequency = 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type PortfolioExchange = 'TASI' | 'EGX' | 'NASDAQ' | 'NYSE';
export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Shopping'
  | 'Housing'
  | 'Other';
export type PaymentMethod = 'Cash' | 'Card' | 'Transfer' | 'Wallet' | 'Other';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  locale: Locale;
  currency: string;
  subscriptionTier: SubscriptionTier;
  onboardingDone: boolean;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  priceAlerts: boolean;
  budgetAlerts: boolean;
  weeklyDigest: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  read: boolean;
  href: string;
}

export interface LocalProfile {
  id: string;
  label: string;
  email: string;
  avatarUrl: string | null;
  appMode: AppMode;
  user: User | null;
  notificationPreferences: NotificationPreferences;
  notificationFeed: NotificationItem[];
  incomeEntries: IncomeEntry[];
  expenseEntries: ExpenseEntry[];
  receiptScans: ReceiptScanResult[];
  portfolioHoldings: PortfolioHolding[];
}

export interface IncomeEntry {
  id: string;
  amount: number;
  currency: string;
  source: IncomeSource;
  sourceName: string;
  frequency: IncomeFrequency;
  date: string;
  isRecurring: boolean;
  notes?: string | null;
}

export interface ExpenseEntry {
  id: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  merchantName?: string | null;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  receiptId?: string | null;
}

export interface ReceiptScanResult {
  id: string;
  merchantName: string;
  amount: number;
  date: string;
  currency: string;
  confidence: number;
  suggestedCategory: ExpenseCategory;
  rawText: string;
  imageName: string;
}

export interface PortfolioHolding {
  id: string;
  ticker: string;
  name: string;
  exchange: PortfolioExchange;
  shares: number;
  avgCost: number;
  currentPrice: number;
  sector: string;
  isShariah: boolean;
}

const defaultUser: User = {
  id: 'demo-user',
  email: 'demo@wealix.app',
  name: 'Demo User',
  avatarUrl: null,
  locale: 'ar',
  currency: 'SAR',
  subscriptionTier: 'free',
  onboardingDone: true,
};

const defaultNotificationPreferences: NotificationPreferences = {
  email: true,
  push: true,
  priceAlerts: true,
  budgetAlerts: true,
  weeklyDigest: false,
};

const defaultNotificationFeed: NotificationItem[] = [
  {
    id: 'rebalance',
    title: 'Portfolio review available',
    titleAr: 'مراجعة المحفظة جاهزة',
    description: 'Your portfolio allocation changed this week.',
    descriptionAr: 'توزيع محفظتك تغيّر هذا الأسبوع.',
    read: false,
    href: '/portfolio',
  },
  {
    id: 'budget',
    title: 'Budget alert triggered',
    titleAr: 'تم تفعيل تنبيه الميزانية',
    description: 'Your food budget is close to its monthly cap.',
    descriptionAr: 'ميزانية الطعام اقتربت من حدها الشهري.',
    read: false,
    href: '/settings?tab=preferences',
  },
  {
    id: 'report',
    title: 'Weekly digest is ready',
    titleAr: 'الملخص الأسبوعي جاهز',
    description: 'Open your latest wealth summary.',
    descriptionAr: 'افتح أحدث ملخص لثروتك.',
    read: true,
    href: '/reports',
  },
];

const defaultIncomeEntries: IncomeEntry[] = [
  {
    id: 'income-salary',
    amount: 18500,
    currency: 'SAR',
    source: 'salary',
    sourceName: 'Monthly Salary',
    frequency: 'monthly',
    date: new Date().toISOString().slice(0, 10),
    isRecurring: true,
    notes: null,
  },
  {
    id: 'income-freelance',
    amount: 3200,
    currency: 'SAR',
    source: 'freelance',
    sourceName: 'Product Design Client',
    frequency: 'one_time',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    isRecurring: false,
    notes: null,
  },
];

const defaultExpenseEntries: ExpenseEntry[] = [
  {
    id: 'expense-grocery',
    amount: 420,
    currency: 'SAR',
    category: 'Food',
    description: 'Weekly groceries',
    merchantName: 'Danube',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Card',
    notes: null,
    receiptId: null,
  },
  {
    id: 'expense-transport',
    amount: 84,
    currency: 'SAR',
    category: 'Transport',
    description: 'Ride sharing',
    merchantName: 'Uber',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    paymentMethod: 'Card',
    notes: null,
    receiptId: null,
  },
];

const defaultPortfolioHoldings: PortfolioHolding[] = [
  { id: '1', ticker: '2222.SR', name: 'Saudi Aramco', exchange: 'TASI', shares: 100, avgCost: 32.5, currentPrice: 35.2, sector: 'Energy', isShariah: true },
  { id: '2', ticker: '1120.SR', name: 'Al Rajhi Bank', exchange: 'TASI', shares: 50, avgCost: 98, currentPrice: 105.5, sector: 'Banking', isShariah: true },
  { id: '3', ticker: '1180.SR', name: 'Maaden', exchange: 'TASI', shares: 75, avgCost: 45, currentPrice: 48.2, sector: 'Mining', isShariah: true },
  { id: '4', ticker: 'COMI.CA', name: 'CIB Egypt', exchange: 'EGX', shares: 200, avgCost: 45, currentPrice: 52.3, sector: 'Banking', isShariah: false },
  { id: '5', ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', shares: 25, avgCost: 175, currentPrice: 182.5, sector: 'Technology', isShariah: false },
  { id: '6', ticker: '1050.SR', name: 'SABIC', exchange: 'TASI', shares: 30, avgCost: 85, currentPrice: 92.4, sector: 'Materials', isShariah: true },
];

const defaultReceiptScans: ReceiptScanResult[] = [
  {
    id: 'receipt-demo-1',
    merchantName: 'Danube',
    amount: 420,
    date: new Date().toISOString().slice(0, 10),
    currency: 'SAR',
    confidence: 91,
    suggestedCategory: 'Food',
    rawText: 'DANUBE MARKET TOTAL 420 SAR',
    imageName: 'danube-demo-receipt.jpg',
  },
];

function buildDemoState() {
  return {
    appMode: 'demo' as const,
    user: defaultUser,
    notificationFeed: defaultNotificationFeed,
    incomeEntries: defaultIncomeEntries,
    expenseEntries: defaultExpenseEntries,
    receiptScans: defaultReceiptScans,
    portfolioHoldings: defaultPortfolioHoldings,
  };
}

function buildLiveState() {
  return {
    appMode: 'live' as const,
    user: null,
    notificationFeed: [] as NotificationItem[],
    incomeEntries: [] as IncomeEntry[],
    expenseEntries: [] as ExpenseEntry[],
    receiptScans: [] as ReceiptScanResult[],
    portfolioHoldings: [] as PortfolioHolding[],
  };
}

function createProfileSnapshot(
  id: string,
  label: string,
  email: string,
  state: ReturnType<typeof buildDemoState> | ReturnType<typeof buildLiveState>,
  overrides?: {
    user?: User | null;
    notificationPreferences?: NotificationPreferences;
  }
): LocalProfile {
  return {
    id,
    label,
    email,
    avatarUrl: overrides?.user?.avatarUrl ?? state.user?.avatarUrl ?? null,
    appMode: state.appMode,
    user: overrides?.user ?? state.user,
    notificationPreferences: overrides?.notificationPreferences ?? defaultNotificationPreferences,
    notificationFeed: state.notificationFeed,
    incomeEntries: state.incomeEntries,
    expenseEntries: state.expenseEntries,
    receiptScans: state.receiptScans,
    portfolioHoldings: state.portfolioHoldings,
  };
}

function snapshotActiveProfile(state: AppState): LocalProfile {
  const existing = state.profiles.find((profile) => profile.id === state.activeProfileId);
  return {
    id: state.activeProfileId,
    label: state.user?.name?.trim() || existing?.label || 'User',
    email: state.user?.email || existing?.email || '',
    avatarUrl: state.user?.avatarUrl || existing?.avatarUrl || null,
    appMode: state.appMode,
    user: state.user,
    notificationPreferences: state.notificationPreferences,
    notificationFeed: state.notificationFeed,
    incomeEntries: state.incomeEntries,
    expenseEntries: state.expenseEntries,
    receiptScans: state.receiptScans,
    portfolioHoldings: state.portfolioHoldings,
  };
}

function upsertProfile(profiles: LocalProfile[], nextProfile: LocalProfile) {
  const existing = profiles.some((profile) => profile.id === nextProfile.id);
  if (!existing) {
    return [...profiles, nextProfile];
  }

  return profiles.map((profile) => (profile.id === nextProfile.id ? nextProfile : profile));
}

function syncActiveProfileState(state: AppState, partial: Partial<AppState>) {
  const nextState = { ...state, ...partial } as AppState;
  const nextProfile = snapshotActiveProfile(nextState);
  return {
    ...partial,
    profiles: upsertProfile(state.profiles, nextProfile),
  };
}

function profileToState(profile: LocalProfile) {
  return {
    appMode: profile.appMode,
    user: profile.user,
    notificationPreferences: profile.notificationPreferences,
    notificationFeed: profile.notificationFeed,
    incomeEntries: profile.incomeEntries,
    expenseEntries: profile.expenseEntries,
    receiptScans: profile.receiptScans,
    portfolioHoldings: profile.portfolioHoldings,
  };
}

const initialDemoProfile = createProfileSnapshot('profile-demo', 'Demo User', 'demo@wealix.app', buildDemoState(), {
  user: defaultUser,
  notificationPreferences: defaultNotificationPreferences,
});

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Locale & Theme
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => void;
  notificationFeed: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  profiles: LocalProfile[];
  activeProfileId: string;
  createProfile: (label: string, email?: string) => void;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  incomeEntries: IncomeEntry[];
  addIncomeEntry: (entry: IncomeEntry) => void;
  deleteIncomeEntry: (id: string) => void;
  expenseEntries: ExpenseEntry[];
  addExpenseEntry: (entry: ExpenseEntry) => void;
  deleteExpenseEntry: (id: string) => void;
  receiptScans: ReceiptScanResult[];
  addReceiptScan: (receipt: ReceiptScanResult) => void;
  portfolioHoldings: PortfolioHolding[];
  addPortfolioHolding: (holding: PortfolioHolding) => void;
  deletePortfolioHolding: (id: string) => void;
  replacePortfolioHoldings: (holdings: PortfolioHolding[]) => void;
  clearAllData: () => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Dashboard widgets
  activeDashboardTab: string;
  setActiveDashboardTab: (tab: string) => void;
  
  // Portfolio
  selectedExchange: string;
  setSelectedExchange: (exchange: string) => void;
  shariahFilterEnabled: boolean;
  toggleShariahFilter: () => void;
  
  // Budget
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  
  // AI Advisor
  activeChatSession: string | null;
  setActiveChatSession: (sessionId: string | null) => void;
  attachPortfolioContext: boolean;
  setAttachPortfolioContext: (attach: boolean) => void;
  
  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: initialDemoProfile.user,
      setUser: (user) => set((state) => syncActiveProfileState(state, { user })),
      updateUser: (updates) => set((state) =>
        syncActiveProfileState(state, {
          user: { ...(state.user ?? defaultUser), ...updates },
        })
      ),
      
      // Locale & Theme
      locale: 'ar',
      setLocale: (locale) => set({ locale }),
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      appMode: initialDemoProfile.appMode,
      setAppMode: (mode) => set((state) => {
        const seeded = mode === 'demo' ? buildDemoState() : buildLiveState();
        const user =
          mode === 'demo'
            ? defaultUser
            : {
                ...(state.user ?? defaultUser),
                id: state.activeProfileId,
                name: state.user?.name ?? '',
                email: state.user?.email ?? '',
                avatarUrl: state.user?.avatarUrl ?? null,
                subscriptionTier: state.user?.subscriptionTier ?? 'free',
              };

        return syncActiveProfileState(state, {
          ...seeded,
          user,
          notificationPreferences: defaultNotificationPreferences,
          sidebarCollapsed: false,
          activeDashboardTab: 'overview',
          selectedExchange: 'all',
          shariahFilterEnabled: false,
          selectedMonth: new Date().toISOString().slice(0, 7),
          activeChatSession: null,
          attachPortfolioContext: false,
          isLoading: false,
        });
      }),
      notificationPreferences: initialDemoProfile.notificationPreferences,
      updateNotificationPreferences: (updates) => set((state) =>
        syncActiveProfileState(state, {
          notificationPreferences: {
            ...state.notificationPreferences,
            ...updates,
          },
        })
      ),
      notificationFeed: initialDemoProfile.notificationFeed,
      markNotificationAsRead: (id) => set((state) =>
        syncActiveProfileState(state, {
          notificationFeed: state.notificationFeed.map((item) =>
            item.id === id ? { ...item, read: true } : item
          ),
        })
      ),
      markAllNotificationsRead: () => set((state) =>
        syncActiveProfileState(state, {
          notificationFeed: state.notificationFeed.map((item) => ({
            ...item,
            read: true,
          })),
        })
      ),
      profiles: [initialDemoProfile],
      activeProfileId: initialDemoProfile.id,
      createProfile: (label, email = '') =>
        set((state) => {
          const currentSnapshot = snapshotActiveProfile(state);
          const id = `profile-${Date.now()}`;
          const trimmedLabel = label.trim() || `User ${state.profiles.length + 1}`;
          const liveUser: User = {
            id,
            email: email.trim(),
            name: trimmedLabel,
            avatarUrl: null,
            locale: state.locale,
            currency: 'SAR',
            subscriptionTier: 'free',
            onboardingDone: true,
          };
          const liveProfile = createProfileSnapshot(id, trimmedLabel, email.trim(), buildLiveState(), {
            user: liveUser,
            notificationPreferences: defaultNotificationPreferences,
          });

          return {
            ...profileToState(liveProfile),
            profiles: [...upsertProfile(state.profiles, currentSnapshot), liveProfile],
            activeProfileId: id,
          };
        }),
      switchProfile: (id) =>
        set((state) => {
          if (id === state.activeProfileId) {
            return {};
          }

          const target = state.profiles.find((profile) => profile.id === id);
          if (!target) {
            return {};
          }

          return {
            ...profileToState(target),
            profiles: upsertProfile(state.profiles, snapshotActiveProfile(state)),
            activeProfileId: id,
          };
        }),
      deleteProfile: (id) =>
        set((state) => {
          const syncedProfiles = upsertProfile(state.profiles, snapshotActiveProfile(state));
          const remainingProfiles = syncedProfiles.filter((profile) => profile.id !== id);

          if (remainingProfiles.length === 0) {
            return {
              ...profileToState(initialDemoProfile),
              profiles: [initialDemoProfile],
              activeProfileId: initialDemoProfile.id,
            };
          }

          if (id !== state.activeProfileId) {
            return {
              profiles: remainingProfiles,
            };
          }

          const nextActive = remainingProfiles[0];
          return {
            ...profileToState(nextActive),
            profiles: remainingProfiles,
            activeProfileId: nextActive.id,
          };
        }),
      incomeEntries: initialDemoProfile.incomeEntries,
      addIncomeEntry: (entry) => set((state) =>
        syncActiveProfileState(state, {
          incomeEntries: [entry, ...state.incomeEntries],
        })
      ),
      deleteIncomeEntry: (id) => set((state) =>
        syncActiveProfileState(state, {
          incomeEntries: state.incomeEntries.filter((entry) => entry.id !== id),
        })
      ),
      expenseEntries: initialDemoProfile.expenseEntries,
      addExpenseEntry: (entry) => set((state) =>
        syncActiveProfileState(state, {
          expenseEntries: [entry, ...state.expenseEntries],
        })
      ),
      deleteExpenseEntry: (id) => set((state) =>
        syncActiveProfileState(state, {
          expenseEntries: state.expenseEntries.filter((entry) => entry.id !== id),
        })
      ),
      receiptScans: initialDemoProfile.receiptScans,
      addReceiptScan: (receipt) => set((state) =>
        syncActiveProfileState(state, {
          receiptScans: [receipt, ...state.receiptScans].slice(0, 20),
        })
      ),
      portfolioHoldings: initialDemoProfile.portfolioHoldings,
      addPortfolioHolding: (holding) => set((state) =>
        syncActiveProfileState(state, {
          portfolioHoldings: [holding, ...state.portfolioHoldings],
        })
      ),
      deletePortfolioHolding: (id) => set((state) =>
        syncActiveProfileState(state, {
          portfolioHoldings: state.portfolioHoldings.filter((holding) => holding.id !== id),
        })
      ),
      replacePortfolioHoldings: (holdings) => set((state) =>
        syncActiveProfileState(state, {
          portfolioHoldings: holdings,
        })
      ),
      setSubscriptionTier: (tier) => set((state) =>
        syncActiveProfileState(state, {
          user: {
            ...(state.user ?? defaultUser),
            subscriptionTier: tier,
          },
        })
      ),
      clearAllData: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('wealthos-storage');
        }

        set((state) =>
          syncActiveProfileState(state, {
            ...buildLiveState(),
            user: null,
            locale: 'ar',
            theme: 'dark',
            notificationPreferences: defaultNotificationPreferences,
            sidebarCollapsed: false,
            activeDashboardTab: 'overview',
            selectedExchange: 'all',
            shariahFilterEnabled: false,
            selectedMonth: new Date().toISOString().slice(0, 7),
            activeChatSession: null,
            attachPortfolioContext: false,
            isLoading: false,
            isMobile: false,
          })
        );
      },
      
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      setSidebarCollapsed: (collapsed) => set({ 
        sidebarCollapsed: collapsed 
      }),
      
      // Dashboard
      activeDashboardTab: 'overview',
      setActiveDashboardTab: (tab) => set({ 
        activeDashboardTab: tab 
      }),
      
      // Portfolio
      selectedExchange: 'all',
      setSelectedExchange: (exchange) => set({ 
        selectedExchange: exchange 
      }),
      shariahFilterEnabled: false,
      toggleShariahFilter: () => set((state) => ({ 
        shariahFilterEnabled: !state.shariahFilterEnabled 
      })),
      
      // Budget
      selectedMonth: new Date().toISOString().slice(0, 7),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      
      // AI Advisor
      activeChatSession: null,
      setActiveChatSession: (sessionId) => set({ 
        activeChatSession: sessionId 
      }),
      attachPortfolioContext: false,
      setAttachPortfolioContext: (attach) => set({ 
        attachPortfolioContext: attach 
      }),
      
      // UI State
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      isMobile: false,
      setIsMobile: (isMobile) => set({ isMobile }),
    }),
    {
      name: 'wealthos-storage',
      partialize: (state) => ({
        user: state.user,
        locale: state.locale,
        theme: state.theme,
        appMode: state.appMode,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        notificationPreferences: state.notificationPreferences,
        notificationFeed: state.notificationFeed,
        incomeEntries: state.incomeEntries,
        expenseEntries: state.expenseEntries,
        receiptScans: state.receiptScans,
        portfolioHoldings: state.portfolioHoldings,
        sidebarCollapsed: state.sidebarCollapsed,
        shariahFilterEnabled: state.shariahFilterEnabled,
      }),
    }
  )
);

// Feature gating based on subscription
export const useSubscription = () => {
  const user = useAppStore((state) => state.user);
  const tier = user?.subscriptionTier || 'free';
  
  return {
    tier,
    isFree: tier === 'free',
    isCore: tier === 'core',
    isPro: tier === 'pro',
    canAccess: (feature: string) => {
      const features: Record<string, SubscriptionTier[]> = {
        // Portfolio
        'portfolio.unlimited': ['core', 'pro'],
        'portfolio.ai_analysis': ['pro'],
        
        // FIRE
        'fire.scenarios': ['pro'],
        
        // Budget
        'budget.history': ['core', 'pro'],
        
        // AI
        'ai.advisor': ['pro'],
        'ai.portfolio_analysis': ['pro'],
        
        // Reports
        'reports.basic': ['core', 'pro'],
        'reports.full': ['pro'],
        
        // Alerts
        'alerts.unlimited': ['pro'],
        'alerts.3max': ['core', 'pro'],
        
        // Data
        'data.export': ['core', 'pro'],
      };
      
      return features[feature]?.includes(tier as SubscriptionTier) ?? false;
    },
  };
};

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: string = 'SAR',
  locale: Locale = 'ar'
): string => {
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

// Number formatting with Arabic numerals option
export const formatNumber = (
  number: number,
  locale: Locale = 'ar',
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(
    locale === 'ar' ? 'ar-SA' : 'en-US',
    options
  ).format(number);
};

// Date formatting
export const formatDate = (
  date: Date | string,
  locale: Locale = 'ar',
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(
    locale === 'ar' ? 'ar-SA' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }
  ).format(d);
};

// Percentage formatting
export const formatPercent = (
  value: number,
  locale: Locale = 'ar',
  decimals: number = 2
): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatNumber(value, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
};
