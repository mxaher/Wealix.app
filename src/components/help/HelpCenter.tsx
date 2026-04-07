'use client';

import { useMemo, useState } from 'react';
import { BookOpenText, Bot, ChevronDown, LifeBuoy, Search, ShieldCheck, Wrench } from 'lucide-react';
import { getLocalizedText, helpSections } from '@/lib/help/content';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const headerCards = [
  {
    id: 'docs',
    icon: BookOpenText,
    tone: 'text-sky-700 bg-sky-100',
    title: { en: 'Documentation', ar: 'التوثيق' },
    body: {
      en: 'Feature-by-feature guidance for every major area inside Wealix.',
      ar: 'شرح منظم لكل ميزة أساسية داخل Wealix.',
    },
  },
  {
    id: 'reem',
    icon: LifeBuoy,
    tone: 'text-emerald-700 bg-emerald-100',
    title: { en: 'Reem Help Agent', ar: 'ريم للمساعدة' },
    body: {
      en: 'Ask product and navigation questions without leaving the page you are on.',
      ar: 'اسأل عن التنقل والميزات بدون مغادرة الصفحة الحالية.',
    },
  },
  {
    id: 'wael',
    icon: Bot,
    tone: 'text-violet-700 bg-violet-100',
    title: { en: 'Wael Advisor', ar: 'وائل المستشار' },
    body: {
      en: 'Use Wael for financial analysis, portfolio decisions, and market questions.',
      ar: 'استخدم وائل للتحليل المالي وقرارات المحفظة وأسئلة السوق.',
    },
  },
];

export function HelpCenter() {
  const locale = useAppStore((state) => state.locale);
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');

  const filteredSections = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    if (!normalized) {
      return helpSections;
    }

    return helpSections
      .map((section) => ({
        ...section,
        topics: section.topics.filter((topic) => {
          return (
            topic.title.en.toLowerCase().includes(normalized) ||
            topic.title.ar.toLowerCase().includes(normalized) ||
            topic.summary.en.toLowerCase().includes(normalized) ||
            topic.summary.ar.toLowerCase().includes(normalized) ||
            topic.content.en.some((paragraph) => paragraph.toLowerCase().includes(normalized)) ||
            topic.content.ar.some((paragraph) => paragraph.toLowerCase().includes(normalized)) ||
            topic.keywords.en.some((keyword) => keyword.toLowerCase().includes(normalized)) ||
            topic.keywords.ar.some((keyword) => keyword.toLowerCase().includes(normalized))
          );
        }),
      }))
      .filter((section) => section.topics.length > 0);
  }, [query]);

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
        <div className="grid items-start gap-6 px-6 py-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
          <div className="space-y-4 self-start">
            <Badge variant="secondary" className={cn('rounded-full px-3 py-1 text-[11px] tracking-[0.14em]', !isArabic && 'uppercase')}>
              {isArabic ? 'مركز المعرفة' : 'Knowledge Base'}
            </Badge>
            <div className="space-y-3">
              <h1 className={cn('text-3xl font-semibold tracking-tight text-foreground', isArabic && 'text-right')}>
                {isArabic ? 'مركز المعرفة داخل Wealix' : 'Wealix Knowledge Base'}
              </h1>
              <p className={cn('max-w-3xl text-sm leading-7 text-muted-foreground md:text-base', isArabic && 'text-right')}>
                {isArabic
                  ? 'ابحث في مركز المعرفة، راجع الأسئلة المتكررة، واستخدم ريم لفهم أي جزء من التطبيق بسرعة.'
                  : 'Search the knowledge base, review common workflows, and use Reem when you want page-aware guidance without breaking your flow.'}
              </p>
            </div>

            <div className="relative max-w-xl">
              <Search className={cn('pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground', isArabic ? 'right-3' : 'left-3')} />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={isArabic ? 'ابحث في المواضيع والمصطلحات' : 'Search topics, workflows, and terms'}
                className={cn('h-12 rounded-2xl border-border bg-background', isArabic ? 'pr-10 text-right' : 'pl-10')}
              />
            </div>
          </div>

          <div className="grid gap-3 grid-cols-1">
            {headerCards.map((item) => (
              <Card key={item.id} className="border-border/80 bg-background/80">
                <CardHeader className={cn('space-y-3 pb-3', isArabic && 'text-right')}>
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', item.tone, isArabic && 'mr-auto')}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {isArabic ? item.title.ar : item.title.en}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm leading-6">
                      {isArabic ? item.body.ar : item.body.en}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          {
            icon: ShieldCheck,
            title: isArabic ? 'بياناتك في مساحة محمية' : 'Your data stays in a protected workspace',
            body: isArabic
              ? 'تجد إشارات Wealix Secure داخل التطبيق لتأكيد أن مساحة عملك المالية خاصة بك.'
              : 'Wealix surfaces a secure workspace model throughout the app so sensitive financial data stays grounded in your own environment.',
          },
          {
            icon: Wrench,
            title: isArabic ? 'سير عمل عملي' : 'Workflow-first guidance',
            body: isArabic
              ? 'كل قسم في هذا الدليل يشرح ماذا يفعل الجزء وكيف تستخدمه فعلياً.'
              : 'Each section is written to explain both what a feature does and how to use it in practice.',
          },
          {
            icon: BookOpenText,
            title: isArabic ? 'بحث عربي وإنجليزي' : 'Arabic and English search',
            body: isArabic
              ? 'يمكنك البحث بالعربية أو الإنجليزية داخل نفس الدليل والوصول إلى نفس المواضيع.'
              : 'You can search the same documentation in either Arabic or English and reach the same topics.',
          },
          {
            icon: LifeBuoy,
            title: isArabic ? 'ريم للملاحة والشرح' : 'Reem for navigation help',
            body: isArabic
              ? 'استخدم ريم لفهم الصفحات والميزات، واستخدم وائل لأسئلة الاستثمار والتحليل المالي.'
              : 'Use Reem for product guidance and navigation, then switch to Wael for investment and financial analysis.',
          },
        ].map((item) => (
          <Card key={item.title} className="border-border/80">
            <CardHeader className={cn('pb-3', isArabic && 'text-right')}>
              <div className={cn('mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground', isArabic && 'mr-auto')}>
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription className="text-sm leading-6">{item.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <Card key={section.id} className="overflow-hidden border-border/80">
              <CardHeader className={cn('border-b border-border/60 bg-muted/30 pb-4', isArabic && 'text-right')}>
                <CardTitle className="text-xl">{getLocalizedText(section.title, locale)}</CardTitle>
                <CardDescription className="text-sm leading-6">{getLocalizedText(section.description, locale)}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {section.topics.map((topic) => (
                    <AccordionItem key={topic.id} value={topic.id} className="border-border/60 px-6">
                      <AccordionTrigger className={cn('py-5 hover:no-underline', isArabic && 'text-right')}>
                        <div className={cn('space-y-1 text-left', isArabic && 'text-right')}>
                          <p className="text-base font-medium text-foreground">{getLocalizedText(topic.title, locale)}</p>
                          <p className="text-sm font-normal leading-6 text-muted-foreground">{getLocalizedText(topic.summary, locale)}</p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className={cn('space-y-3 pb-5 text-sm leading-7 text-muted-foreground', isArabic && 'text-right')}>
                        {topic.content[locale].map((paragraph, index) => (
                          <p key={`${topic.id}-${index}`}>{paragraph}</p>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed border-border/80">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <ChevronDown className="h-5 w-5 rotate-[-90deg] text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-foreground">
                  {isArabic ? 'لا توجد نتائج مطابقة' : 'No matching help topics'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isArabic
                    ? 'جرّب كلمات مختلفة أو استخدم ريم للمساعدة المباشرة.'
                    : 'Try a different phrase, or ask Reem for page-aware help.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
