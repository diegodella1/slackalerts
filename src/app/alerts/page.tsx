import { AlertsPageClient } from "@/components/alerts/AlertsPageClient";
import { Navigation } from "@/components/Navigation";

export default async function AlertsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AlertsPageClient />
    </div>
  );
} 