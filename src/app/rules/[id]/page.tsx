'use client';

import { EnhancedRuleForm } from '@/components/rules/EnhancedRuleForm';
import { Navigation } from '@/components/Navigation';

export default function EditRulePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <EnhancedRuleForm />
    </div>
  );
} 