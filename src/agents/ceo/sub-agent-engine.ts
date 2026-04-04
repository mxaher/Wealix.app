import { db } from '@/lib/db';
import { getCatalogPriceIds, getCycleFromPriceId, getPlanFromPriceId } from '@/lib/stripe-billing';
import { getStripe } from '@/lib/stripe';
import { runAgentModel } from './ai-client';
import type {
  AgentConfidence,
  AgentHealth,
  AgentRole,
  Alert,
  CompanyMetric,
  CompanyMetricMap,
  CompanyState,
  DecisionLog,
  SubAgentBriefing,
  TaskExecutionResult,
} from './types';

type CompanyDataBundle = {
  companyState: CompanyState;
  metrics: CompanyMetric[];
  metricMap: CompanyMetricMap;
  agentStatuses: Record<AgentRole, AgentHealth>;
  roleContexts: Partial<Record<AgentRole, Record<string, unknown>>>;
};

type RoleContextInput = {
  companyState: CompanyState;
  alerts: Alert[];
  recentDecisions: DecisionLog[];
  metrics: CompanyMetricMap;
  userQuery?: string;
  roleContexts: Partial<Record<AgentRole, Record<string, unknown>>>;
};

const ROLE_ORDER: AgentRole[] = ['finance', 'growth', 'portfolio', 'market', 'risk', 'infrastructure'];

const ROLE_PROMPTS: Record<AgentRole, string> = {
  ceo: 'You are the CEO of Wealix.',
  finance:
    'You are the CFO/finance agent of Wealix. Focus on revenue quality, subscription health, pricing, and runway-sensitive signals.',
  growth:
    'You are the growth and CMO agent of Wealix. Focus on acquisition, onboarding completion, activation, SEO, campaigns, and retention.',
  portfolio:
    'You are the portfolio intelligence agent of Wealix. Focus on customer portfolio concentration, diversification, and product opportunities tied to holdings behavior.',
  market:
    'You are the market data agent of Wealix. Focus on price-feed freshness, quote coverage, stale data, and external market-readiness.',
  risk:
    'You are the risk agent of Wealix. Focus on business, operational, concentration, and customer-risk signals. Be explicit about severity and downside.',
  infrastructure:
    'You are the CTO/infrastructure agent of Wealix. Focus on reliability, unresolved alerts, deployment risk, degraded systems, and engineering follow-up.',
};

export class SubAgentEngine {
  async collectCompanyData(alerts: Alert[]): Promise<CompanyDataBundle> {
    const [
      totalUsers,
      onboardingCompleted,
      activeSubscriptionsFromDb,
      portfolioStats,
      recentSignups,
      recentPaidUsers,
      marketStats,
      financeStats,
      alertSummary,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { onboardingDone: true } }),
      db.user.count({ where: { subscriptionTier: { in: ['core', 'pro'] } } }),
      loadPortfolioStats(),
      db.user.count({ where: { createdAt: { gte: daysAgo(7) } } }),
      db.user.count({
        where: {
          subscriptionTier: { in: ['core', 'pro'] },
          updatedAt: { gte: daysAgo(30) },
        },
      }),
      loadMarketStats(),
      loadFinanceStats(),
      summarizeAlerts(alerts),
    ]);

    const companyState: CompanyState = {
      totalUsers,
      totalAUM: portfolioStats.totalAum,
      monthlyRevenue: financeStats.monthlyRevenue,
      activeSubscriptions: financeStats.activeSubscriptions || activeSubscriptionsFromDb,
      criticalIssues: alertSummary.criticalIssues,
      lastUpdated: new Date(),
    };

    const financeMetrics: CompanyMetric[] = [
      metric('Estimated MRR', financeStats.monthlyRevenue > 0 ? usd(financeStats.monthlyRevenue) : 'Unavailable', financeStats.monthlyRevenue > 0 ? 'up' : 'stable'),
      metric('Active subscriptions', financeStats.activeSubscriptions || activeSubscriptionsFromDb, 'stable'),
      metric('Trialing subscriptions', financeStats.trialingSubscriptions, financeStats.trialingSubscriptions > 0 ? 'up' : 'stable'),
      metric('Pro share', `${financeStats.proSharePct.toFixed(1)}%`, financeStats.proSharePct >= 30 ? 'up' : 'stable'),
    ];

    const growthMetrics: CompanyMetric[] = [
      metric('New users (7d)', recentSignups, recentSignups > 0 ? 'up' : 'stable'),
      metric('Onboarding completion', `${percentage(onboardingCompleted, totalUsers).toFixed(1)}%`, percentage(onboardingCompleted, totalUsers) >= 60 ? 'up' : 'down'),
      metric('Paid user share', `${percentage(activeSubscriptionsFromDb, totalUsers).toFixed(1)}%`, percentage(activeSubscriptionsFromDb, totalUsers) >= 5 ? 'up' : 'stable'),
      metric('New paid users (30d)', recentPaidUsers, recentPaidUsers > 0 ? 'up' : 'stable'),
    ];

    const portfolioMetrics: CompanyMetric[] = [
      metric('Portfolio accounts', portfolioStats.accountsWithHoldings, portfolioStats.accountsWithHoldings > 0 ? 'up' : 'stable'),
      metric('Tracked holdings', portfolioStats.totalHoldings, portfolioStats.totalHoldings > 0 ? 'up' : 'stable'),
      metric('Distinct tickers', portfolioStats.uniqueTickers, portfolioStats.uniqueTickers > 10 ? 'up' : 'stable'),
      metric('Top holding concentration', `${portfolioStats.topConcentrationPct.toFixed(1)}%`, portfolioStats.topConcentrationPct > 30 ? 'down' : 'stable'),
    ];

    const marketMetrics: CompanyMetric[] = [
      metric('Market data rows', marketStats.totalRows, marketStats.totalRows > 0 ? 'stable' : 'down'),
      metric('Stale quotes (>24h)', marketStats.staleRows, marketStats.staleRows > 0 ? 'down' : 'stable'),
      metric('Freshness (hours)', marketStats.maxAgeHours.toFixed(1), marketStats.maxAgeHours > 24 ? 'down' : 'stable'),
      metric('Top mover', marketStats.topMover || 'N/A', 'stable'),
    ];

    const riskMetrics: CompanyMetric[] = [
      metric('Critical alerts', alertSummary.criticalCount, alertSummary.criticalCount > 0 ? 'down' : 'stable'),
      metric('Warning alerts', alertSummary.warningCount, alertSummary.warningCount > 0 ? 'down' : 'stable'),
      metric('Top concentration', `${portfolioStats.topConcentrationPct.toFixed(1)}%`, portfolioStats.topConcentrationPct > 30 ? 'down' : 'stable'),
      metric('Market stale rows', marketStats.staleRows, marketStats.staleRows > 0 ? 'down' : 'stable'),
    ];

    const infrastructureMetrics: CompanyMetric[] = [
      metric('Open alerts', alerts.length, alerts.length > 0 ? 'down' : 'stable'),
      metric('Critical infra alerts', alertSummary.infrastructureCriticalCount, alertSummary.infrastructureCriticalCount > 0 ? 'down' : 'stable'),
      metric('Latest market data age', `${marketStats.maxAgeHours.toFixed(1)}h`, marketStats.maxAgeHours > 24 ? 'down' : 'stable'),
      metric('Data freshness warnings', marketStats.staleRows, marketStats.staleRows > 0 ? 'down' : 'stable'),
    ];

    const metricMap: CompanyMetricMap = {
      company: [
        metric('Total users', totalUsers, recentSignups > 0 ? 'up' : 'stable'),
        metric('Estimated AUM', usd(companyState.totalAUM), companyState.totalAUM > 0 ? 'up' : 'stable'),
        metric('Estimated MRR', companyState.monthlyRevenue > 0 ? usd(companyState.monthlyRevenue) : 'Unavailable', companyState.monthlyRevenue > 0 ? 'up' : 'stable'),
        metric('Active subscriptions', companyState.activeSubscriptions, companyState.activeSubscriptions > 0 ? 'up' : 'stable'),
      ],
      finance: financeMetrics,
      growth: growthMetrics,
      portfolio: portfolioMetrics,
      market: marketMetrics,
      risk: riskMetrics,
      infrastructure: infrastructureMetrics,
    };

    return {
      companyState,
      metrics: [...(metricMap.company ?? []), ...financeMetrics.slice(0, 1), ...growthMetrics.slice(0, 1), ...infrastructureMetrics.slice(0, 1)],
      metricMap,
      agentStatuses: {
        ceo: 'healthy',
        finance: financeStats.monthlyRevenue > 0 ? 'healthy' : 'degraded',
        growth: recentSignups > 0 ? 'healthy' : 'degraded',
        portfolio: portfolioStats.totalHoldings > 0 ? 'healthy' : 'degraded',
        market: marketStats.staleRows > 0 ? 'degraded' : 'healthy',
        risk: alertSummary.criticalCount > 0 ? 'degraded' : 'healthy',
        infrastructure: alertSummary.infrastructureCriticalCount > 0 ? 'degraded' : 'healthy',
      },
      roleContexts: {
        finance: financeStats.rawContext,
        growth: {
          totalUsers,
          recentSignups,
          onboardingCompletionPct: percentage(onboardingCompleted, totalUsers),
          activeSubscriptions: activeSubscriptionsFromDb,
          recentPaidUsers,
        },
        portfolio: portfolioStats.rawContext,
        market: marketStats.rawContext,
        risk: {
          criticalAlerts: alertSummary.criticalIssues,
          topConcentrationPct: portfolioStats.topConcentrationPct,
          staleQuotes: marketStats.staleRows,
        },
        infrastructure: {
          openAlerts: alerts.map((alert) => `${alert.severity}:${alert.source}:${alert.message}`),
          criticalInfrastructureAlerts: alertSummary.infrastructureCriticalCount,
          latestMarketDataAgeHours: marketStats.maxAgeHours,
        },
      },
    };
  }

  async runBriefings(input: RoleContextInput): Promise<SubAgentBriefing[]> {
    return Promise.all(
      ROLE_ORDER.map((role) =>
        this.generateBriefing({
          role,
          companyState: input.companyState,
          alerts: input.alerts,
          recentDecisions: input.recentDecisions,
          metrics: input.metrics[role] ?? [],
          rawContext: input.roleContexts[role] ?? {},
          userQuery: input.userQuery,
        })
      )
    );
  }

  async executeTask(role: AgentRole, instruction: string, context: Record<string, unknown>): Promise<TaskExecutionResult> {
    const fallback = buildFallbackExecution(role, instruction, context);
    const prompt = `
${ROLE_PROMPTS[role]}

You are executing a CEO-delegated task for Wealix.
Return valid JSON only with:
{
  "summary": "string",
  "recommendations": ["string"],
  "confidence": "high|medium|low"
}

Task instruction:
${instruction}

Task context:
${JSON.stringify(context, null, 2)}
    `.trim();

    const parsed = await runAgentModel<{
      summary?: string;
      recommendations?: string[];
      confidence?: AgentConfidence;
    }>({
      prompt,
      fallback: {
        summary: fallback.summary,
        recommendations: fallback.recommendations,
        confidence: fallback.confidence,
      },
    });

    return {
      summary: parsed.summary || fallback.summary,
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
        ? parsed.recommendations.filter(Boolean)
        : fallback.recommendations,
      confidence: parsed.confidence === 'high' || parsed.confidence === 'medium' || parsed.confidence === 'low'
        ? parsed.confidence
        : fallback.confidence,
      generatedAt: new Date(),
    };
  }

  private async generateBriefing(params: {
    role: AgentRole;
    companyState: CompanyState;
    alerts: Alert[];
    recentDecisions: DecisionLog[];
    metrics: CompanyMetric[];
    rawContext: Record<string, unknown>;
    userQuery?: string;
  }): Promise<SubAgentBriefing> {
    const fallback = buildFallbackBriefing(params.role, params.metrics, params.rawContext);
    const prompt = `
${ROLE_PROMPTS[params.role]}

You are contributing to the CEO briefing for Wealix.
Return valid JSON only with:
{
  "headline": "string",
  "summary": "string",
  "findings": ["string"],
  "recommendations": ["string"],
  "confidence": "high|medium|low"
}

Company state:
${JSON.stringify({
  totalUsers: params.companyState.totalUsers,
  totalAUM: params.companyState.totalAUM,
  monthlyRevenue: params.companyState.monthlyRevenue,
  activeSubscriptions: params.companyState.activeSubscriptions,
  criticalIssues: params.companyState.criticalIssues,
  lastUpdated: params.companyState.lastUpdated.toISOString(),
}, null, 2)}

Role metrics:
${JSON.stringify(params.metrics, null, 2)}

Role context:
${JSON.stringify(params.rawContext, null, 2)}

Active alerts:
${JSON.stringify(params.alerts.map((alert) => ({
  severity: alert.severity,
  source: alert.source,
  message: alert.message,
})), null, 2)}

Recent decisions:
${JSON.stringify(params.recentDecisions.slice(0, 5), null, 2)}

${params.userQuery ? `Operator query:\n${params.userQuery}` : ''}
      `.trim();

    const parsed = await runAgentModel<{
      headline?: string;
      summary?: string;
      findings?: string[];
      recommendations?: string[];
      confidence?: AgentConfidence;
    }>({
      prompt,
      fallback: {
        headline: fallback.headline,
        summary: fallback.summary,
        findings: fallback.findings,
        recommendations: fallback.recommendations,
        confidence: fallback.confidence,
      },
    });

    return {
      role: params.role,
      headline: parsed.headline || fallback.headline,
      summary: parsed.summary || fallback.summary,
      findings: Array.isArray(parsed.findings) && parsed.findings.length > 0 ? parsed.findings.filter(Boolean) : fallback.findings,
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0 ? parsed.recommendations.filter(Boolean) : fallback.recommendations,
      metrics: params.metrics,
      confidence: parsed.confidence === 'high' || parsed.confidence === 'medium' || parsed.confidence === 'low'
        ? parsed.confidence
        : fallback.confidence,
      generatedAt: new Date(),
      rawContext: params.rawContext,
    };
  }
}

async function loadPortfolioStats() {
  const rows = await db.$queryRawUnsafe<Array<{
    total_aum: number | null;
    total_holdings: number | null;
    unique_tickers: number | null;
    accounts_with_holdings: number | null;
    top_position_value: number | null;
  }>>(
    `SELECT
      COALESCE(SUM(COALESCE(m.price, h.avgCostPrice) * h.shares), 0) AS total_aum,
      COUNT(*) AS total_holdings,
      COUNT(DISTINCT h.ticker) AS unique_tickers,
      COUNT(DISTINCT h.userId) AS accounts_with_holdings,
      COALESCE(MAX(COALESCE(m.price, h.avgCostPrice) * h.shares), 0) AS top_position_value
     FROM PortfolioHolding h
     LEFT JOIN MarketData m ON m.ticker = h.ticker`
  );

  const row = rows[0] ?? {
    total_aum: 0,
    total_holdings: 0,
    unique_tickers: 0,
    accounts_with_holdings: 0,
    top_position_value: 0,
  };

  const totalAum = Number(row.total_aum ?? 0);
  const topPositionValue = Number(row.top_position_value ?? 0);
  return {
    totalAum,
    totalHoldings: Number(row.total_holdings ?? 0),
    uniqueTickers: Number(row.unique_tickers ?? 0),
    accountsWithHoldings: Number(row.accounts_with_holdings ?? 0),
    topConcentrationPct: totalAum > 0 ? (topPositionValue / totalAum) * 100 : 0,
    rawContext: {
      totalAum,
      totalHoldings: Number(row.total_holdings ?? 0),
      uniqueTickers: Number(row.unique_tickers ?? 0),
      accountsWithHoldings: Number(row.accounts_with_holdings ?? 0),
      topConcentrationPct: totalAum > 0 ? Number(((topPositionValue / totalAum) * 100).toFixed(2)) : 0,
    },
  };
}

async function loadMarketStats() {
  const totalRows = await db.marketData.count();
  const allRows = await db.marketData.findMany({
    select: {
      ticker: true,
      changePercent: true,
      updatedAt: true,
    },
    take: 200,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const staleCutoff = daysAgo(1);
  const staleRows = allRows.filter((row) => row.updatedAt < staleCutoff).length;
  const oldestTimestamp = allRows.reduce<Date | null>((oldest, row) => {
    if (!oldest || row.updatedAt < oldest) {
      return row.updatedAt;
    }
    return oldest;
  }, null);

  const topMover = [...allRows]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))[0];
  const maxAgeHours = oldestTimestamp ? (Date.now() - oldestTimestamp.getTime()) / (60 * 60 * 1000) : 0;

  return {
    totalRows,
    staleRows,
    maxAgeHours,
    topMover: topMover ? `${topMover.ticker} ${topMover.changePercent.toFixed(2)}%` : null,
    rawContext: {
      totalRows,
      staleRows,
      maxAgeHours: Number(maxAgeHours.toFixed(2)),
      topMover: topMover ? { ticker: topMover.ticker, changePercent: topMover.changePercent } : null,
    },
  };
}

async function loadFinanceStats() {
  const fallbackCounts = await db.user.groupBy({
    by: ['subscriptionTier'],
    _count: {
      _all: true,
    },
  });

  const coreCount = fallbackCounts.find((row) => row.subscriptionTier === 'core')?._count._all ?? 0;
  const proCount = fallbackCounts.find((row) => row.subscriptionTier === 'pro')?._count._all ?? 0;

  try {
    const stripe = getStripe();
    const priceIds = getCatalogPriceIds();
    const priceList = await Promise.all(priceIds.map((priceId) => stripe.prices.retrieve(priceId)));
    const priceMap = new Map(priceList.map((price) => [price.id, price]));

    let monthlyRevenue = 0;
    let activeSubscriptions = 0;
    let trialingSubscriptions = 0;

    let startingAfter: string | undefined;

    do {
      const page = await stripe.subscriptions.list({
        status: 'all',
        limit: 100,
        expand: ['data.items.data.price'],
        starting_after: startingAfter,
      });

      for (const subscription of page.data) {
        if (subscription.status !== 'active' && subscription.status !== 'trialing') {
          continue;
        }

        const item = subscription.items.data[0];
        const priceId = item?.price?.id;
        const price = (priceId ? priceMap.get(priceId) : item?.price) ?? null;
        const unitAmount = Number(price?.unit_amount ?? 0) / 100;
        const cycle = getCycleFromPriceId(price?.id ?? null);

        activeSubscriptions += 1;
        if (subscription.status === 'trialing') {
          trialingSubscriptions += 1;
        }

        if (unitAmount > 0) {
          monthlyRevenue += cycle === 'annual' ? unitAmount / 12 : unitAmount;
        }
      }

      startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
    } while (startingAfter);

    return {
      activeSubscriptions,
      trialingSubscriptions,
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      proSharePct: percentage(proCount, coreCount + proCount),
      rawContext: {
        source: 'stripe',
        activeSubscriptions,
        trialingSubscriptions,
        monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
        configuredPriceIds: priceIds,
      },
    };
  } catch {
    return {
      activeSubscriptions: coreCount + proCount,
      trialingSubscriptions: 0,
      monthlyRevenue: 0,
      proSharePct: percentage(proCount, coreCount + proCount),
      rawContext: {
        source: 'db-fallback',
        coreCount,
        proCount,
      },
    };
  }
}

function summarizeAlerts(alerts: Alert[]) {
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical');
  const warningAlerts = alerts.filter((alert) => alert.severity === 'warning');
  const infrastructureCriticalCount = criticalAlerts.filter((alert) => alert.source === 'infrastructure').length;

  return {
    criticalCount: criticalAlerts.length,
    warningCount: warningAlerts.length,
    infrastructureCriticalCount,
    criticalIssues: criticalAlerts.map((alert) => `${alert.source}: ${alert.message}`),
  };
}

function metric(name: string, value: number | string, trend: CompanyMetric['trend']): CompanyMetric {
  return { name, value, trend };
}

function buildFallbackBriefing(role: AgentRole, metrics: CompanyMetric[], rawContext: Record<string, unknown>): Omit<SubAgentBriefing, 'role' | 'generatedAt' | 'metrics' | 'rawContext'> {
  const findings = metrics.slice(0, 3).map((item) => `${item.name}: ${item.value}`);
  return {
    headline: `${capitalize(role)} review ready`,
    summary: `${capitalize(role)} agent produced a deterministic fallback summary because the model response was unavailable.`,
    findings,
    recommendations: [
      `Review the ${role} metrics above and prioritize the first issue that is trending down.`,
      'Run the delegated task again after verifying the underlying data source is healthy.',
    ],
    confidence: 'medium',
  };
}

function buildFallbackExecution(role: AgentRole, instruction: string, context: Record<string, unknown>) {
  return {
    summary: `${capitalize(role)} queued the CEO instruction: ${instruction}`,
    recommendations: [
      'Validate the underlying context before applying changes.',
      `Use this context in the next ${role} execution cycle: ${Object.keys(context).slice(0, 5).join(', ') || 'none provided'}.`,
    ],
    confidence: 'medium' as AgentConfidence,
  };
}

function percentage(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  return (part / total) * 100;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function usd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
