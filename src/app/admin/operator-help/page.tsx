import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminPanelShell } from '@/components/admin/AdminPanelShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdminPanelPageAccess } from '@/lib/admin-panel-auth';

export const metadata: Metadata = {
  title: 'Operator Help | Wealix',
  description: 'Private operator guide for running agents, autonomous workflows, and messaging operations inside Wealix.',
};

const taskStatuses = [
  ['queued', 'Task is accepted and waiting for pickup.'],
  ['assigned', 'Task has been reserved by an agent but has not started execution yet.'],
  ['in_progress', 'Task is actively running.'],
  ['completed', 'Task finished successfully and should include a result note or logs.'],
  ['failed', 'Task ended with an error and needs operator review.'],
  ['cancelled', 'Task was intentionally stopped before completion.'],
] as const;

const supportedChannels = [
  'Email through Cloudflare Email when email env vars are configured.',
  'SMS through sent.dm.',
  'WhatsApp through sent.dm.',
] as const;

const proposedTelegramCommands = [
  ['/help', 'Show this operator guide summary and the current command set.'],
  ['/status', 'Return overall company operating status, active agents, queue size, and last sync.'],
  ['/agents', 'List all agents, their status, current task count, and capabilities.'],
  ['/agent <agentId>', 'Return a focused status card for one agent.'],
  ['/broadcast <message>', 'Send an instruction to all agents or the selected one.'],
  ['/task <agentId> <taskType> <priority>', 'Create a task and attach a JSON payload in the next message or inline.'],
  ['/cancel <taskId>', 'Cancel a queued, assigned, or in-progress task.'],
  ['/run_daily <userId>', 'Trigger a daily planning run for one user.'],
  ['/run_daily_all', 'Trigger daily planning for all live workspaces.'],
  ['/notify_test <channel>', 'Send a test notification through email, SMS, or WhatsApp.'],
] as const;

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-border bg-muted/40 p-4 text-xs leading-6 text-foreground">
      <code>{children}</code>
    </pre>
  );
}

export default async function AdminOperatorHelpPage() {
  await requireAdminPanelPageAccess();

  return (
    <AdminPanelShell
      title="Operator Help"
      description="Private operating guide for the worker-only Wealix admin panel."
    >
      <article className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                Private Operator Guide
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Wealix Company Operations Help
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                  This page is your internal playbook for running agents, operating Wealix autonomously,
                  and standardizing messaging commands. It reflects the current codebase first, then marks
                  any recommended conventions that are not wired yet.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/admin/agents">Open Agent Command Center</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Current Reality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>The admin UI for agents is already implemented at <code>/admin/agents</code>.</p>
              <p>The app proxies agent operations to an external company-agents service through <code>WEALIX_COMPANY_AGENTS_URL</code>.</p>
              <p>Internal automation endpoints use <code>x-agent-secret</code> with <code>AGENTS_SECRET_KEY</code>.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messaging Reality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Telegram commands are not implemented in this repository today.</p>
              <p>The repo currently supports operational notifications through email, SMS, and WhatsApp.</p>
              <p>Webhook verification exists for <code>sent.dm</code>, not for Telegram.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Autonomy Reality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Daily planning can be triggered internally for one user or all users.</p>
              <p>This repo does not include a built-in scheduler for company-wide autonomy.</p>
              <p>You need an external scheduler such as Cloudflare Cron, GitHub Actions, or another worker.</p>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>1. Run Agents From The App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-7 text-muted-foreground">
            <div>
              <p>
                Use the Agent Command Center at <code>/admin/agents</code> for day-to-day operations. The page
                loads agent inventory, task queue state, and direct broadcast controls from the company-agents service.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Workflow</h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Open the command center and select an agent from the left panel.</li>
                <li>Choose a task type from that agent&apos;s advertised capabilities.</li>
                <li>Set priority to <code>low</code>, <code>medium</code>, <code>high</code>, or <code>critical</code>.</li>
                <li>Paste the task payload as JSON. This is the main instruction envelope the agent receives.</li>
                <li>Optionally set <code>targetUserId</code> when the work is for a specific customer.</li>
                <li>Optionally schedule the task for later using the datetime field.</li>
                <li>Press <code>Queue Task</code> and watch the status column and logs.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Task Statuses</h2>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/50 text-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {taskStatuses.map(([status, description]) => (
                      <tr key={status}>
                        <td className="px-4 py-3 font-mono text-foreground">{status}</td>
                        <td className="px-4 py-3">{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Broadcast Usage</h2>
              <p>
                Use broadcast when you need to inject a short instruction across the fleet, like pausing risky work,
                prioritizing one queue, or forcing a new operating rule. The UI sends broadcasts to a selected agent
                or to <code>all</code>.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Suggested Payload Shapes</h2>
              <CodeBlock>{`{
  "scope": "portfolio",
  "objective": "review concentration risk",
  "userId": "user_123",
  "notes": "Prioritize liquid cash and obligations before new buys."
}`}</CodeBlock>
              <CodeBlock>{`{
  "scope": "growth",
  "objective": "draft the next 7-day operating plan",
  "markets": ["saudi", "uae"],
  "prioritySignals": ["revenue", "activation", "retention"]
}`}</CodeBlock>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Run The Company Autonomously</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-7 text-muted-foreground">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Required Configuration</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li><code>WEALIX_COMPANY_AGENTS_URL</code>: base URL for the external company-agents service.</li>
                <li><code>AGENTS_SECRET_KEY</code>: shared secret for internal agent endpoints and service-to-service calls.</li>
                <li><code>NVIDIA_API_KEY</code>: required for internal company-agent prompting and daily planning runs.</li>
                <li><code>SENTDM_API_KEY</code>, <code>SENTDM_SENDER_ID</code>, and <code>SENTDM_WEBHOOK_SIGNING_SECRET</code>: required for SMS and WhatsApp delivery.</li>
                <li><code>NEXT_PUBLIC_APP_URL</code>: used to build destination links in notifications.</li>
                <li><code>CLOUDFLARE_EMAIL_*</code>: optional, but needed if email should be part of the notification mix.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Autonomy Pattern That Matches This Repo</h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>External scheduler calls internal Wealix routes at fixed operating windows.</li>
                <li>Daily planning snapshots are generated per user or for all live workspaces.</li>
                <li>Notifications are dispatched through sent.dm and optional Cloudflare Email.</li>
                <li>The company-agents service manages agent queueing, execution, and broadcasts.</li>
                <li>You step in only for failures, unusual queue growth, or strategic broadcasts.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Recommended Daily Operating Loop</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>06:00 to 08:00 local time: run daily planning for all live workspaces.</li>
                <li>Every 5 to 15 minutes: let the external agents service poll and drain queued work.</li>
                <li>Every hour: run health checks on agent status, failure count, and notification delivery.</li>
                <li>On incident: broadcast a fleet-wide rule change from the admin UI.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Internal Endpoint Examples</h2>
              <CodeBlock>{`curl -X POST "$APP_URL/api/internal/daily-planning/run" \\
  -H "Content-Type: application/json" \\
  -H "x-agent-secret: $AGENTS_SECRET_KEY" \\
  -d '{"runForAllUsers": true, "snapshotDate": "2026-04-10"}'`}</CodeBlock>
              <CodeBlock>{`curl -X POST "$APP_URL/api/internal/daily-planning/run" \\
  -H "Content-Type: application/json" \\
  -H "x-agent-secret: $AGENTS_SECRET_KEY" \\
  -d '{"userId": "user_123", "snapshotDate": "2026-04-10"}'`}</CodeBlock>
              <CodeBlock>{`curl -X POST "$APP_URL/api/internal/ai/agents" \\
  -H "Content-Type: application/json" \\
  -H "x-agent-secret: $AGENTS_SECRET_KEY" \\
  -d '{
    "prompt": "Summarize urgent company risks in one page.",
    "response_format": "text"
  }'`}</CodeBlock>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Operational Guardrails</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>Do not expose <code>AGENTS_SECRET_KEY</code> to the browser or client-side config.</li>
                <li>Use admin-only access for the command center and any future operator routes.</li>
                <li>Review failed tasks before retrying them blindly.</li>
                <li>Prefer scheduled tasks for routine work and broadcasts for exceptional changes.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Messaging And Telegram Commands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-7 text-muted-foreground">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="font-medium text-foreground">Current implementation status</p>
              <p>
                Telegram bot commands are not present in this codebase. There are no Telegram env vars, webhook routes,
                or command handlers today. The supported delivery channels right now are:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {supportedChannels.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">How To Use Messaging Today</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>Configure notification preferences in the app settings.</li>
                <li>Use WhatsApp or SMS via sent.dm for planning updates and reminders.</li>
                <li>Use Cloudflare Email when you want links back into a specific Wealix route.</li>
                <li>Verify sent.dm callbacks through the webhook route before trusting delivery status.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Recommended Telegram Command Set</h2>
              <p>
                The following commands are a proposed operator contract you can adopt when you add Telegram. They are
                recommendations, not current live functionality.
              </p>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/50 text-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Command</th>
                      <th className="px-4 py-3 font-semibold">What It Should Do</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {proposedTelegramCommands.map(([command, description]) => (
                      <tr key={command}>
                        <td className="px-4 py-3 font-mono text-foreground">{command}</td>
                        <td className="px-4 py-3">{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Recommended Telegram Rules</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>Require operator allow-listing by Telegram user ID before accepting any command.</li>
                <li>Restrict destructive actions like cancel or broadcast behind an explicit confirmation step.</li>
                <li>Return short acknowledgements first, then a task ID or incident ID for traceability.</li>
                <li>Map Telegram commands to the same agent queue and internal endpoints already documented above.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </article>
    </AdminPanelShell>
  );
}
