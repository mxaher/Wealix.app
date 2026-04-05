import { redirect } from 'next/navigation';

export default function PlanningPage() {
  redirect('/budget-planning?section=forecast');
}
