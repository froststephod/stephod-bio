import { getAllProfiles } from '@/lib/storage';
import Dashboard from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const profiles = getAllProfiles();
  return <Dashboard initialProfiles={profiles} />;
}
