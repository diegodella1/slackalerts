import { RulesPageClient } from "@/components/rules/RulesPageClient";
import { Navigation } from "@/components/Navigation";

export default async function RulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <RulesPageClient />
    </div>
  );
} 