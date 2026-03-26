'use client';

import { useAppStore, useSubscription, type SubscriptionTier } from '@/store/useAppStore';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { canAccess } = useSubscription();
  const locale = useAppStore((state) => state.locale);
  const updateUser = useAppStore((state) => state.updateUser);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isArabic = locale === 'ar';
  const { isSignedIn } = useUser();

  const handleStartTrial = async (_tier: SubscriptionTier) => {
    setShowUpgrade(false);

    if (!isSignedIn) {
      toast({
        title: isArabic ? 'أنشئ حساباً لبدء التجربة' : 'Create an account to start the trial',
        description: isArabic
          ? 'كل مستخدم جديد يحصل على تجربة مجانية لمدة 14 يوماً تلقائياً عند التسجيل لأول مرة.'
          : 'Every new user gets a 14-day free trial automatically on first signup.',
      });
      return;
    }

    try {
      const response = await fetch('/api/billing/trial/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate trial.');
      }

      updateUser({ subscriptionTier: data.effectiveTier });
      toast({
        title: isArabic ? 'تم تفعيل التجربة' : 'Trial activated',
        description: isArabic
          ? 'تم تفعيل التجربة المجانية لمدة 14 يوماً دون بطاقة ائتمان. بعد انتهائها ستختار Core أو Pro.'
          : 'Your 14-day free trial is now active with no credit card required. After it ends, you can choose Core or Pro.',
      });
    } catch (error) {
      toast({
        title: isArabic ? 'تعذّر تفعيل التجربة' : 'Trial activation failed',
        description: error instanceof Error ? error.message : 'Could not activate the trial.',
        variant: 'destructive',
      });
    }
  };

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div
        className="relative cursor-pointer"
        onClick={() => setShowUpgrade(true)}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <Button variant="outline" size="sm" className="gap-2">
            <Crown className="w-4 h-4 text-gold" />
            <span>Upgrade to Unlock</span>
          </Button>
        </div>
        <div className="opacity-30 pointer-events-none">{children}</div>
      </div>

      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              Start with a 14-day free trial with no credit card required, then continue on Core or Pro.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">Core</h4>
                <p className="text-2xl font-bold mt-2">
                  281 SAR<span className="text-sm font-normal">/mo</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">14-day free trial, no card required</p>
                <Button className="w-full mt-4" variant="outline" onClick={() => handleStartTrial('core')}>
                  Start Trial
                </Button>
              </div>
              <div className="p-4 border rounded-lg border-gold">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Pro</h4>
                  <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">
                    Best Value
                  </span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  371 SAR<span className="text-sm font-normal">/mo</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">14-day free trial, no card required</p>
                <Button className="w-full mt-4" onClick={() => handleStartTrial('pro')}>Start Trial</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowUpgrade(false)}>
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
