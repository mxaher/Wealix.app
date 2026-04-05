import { redirect } from 'next/navigation';

export default function BudgetPage() {
  redirect('/budget-planning?section=budget');
}
