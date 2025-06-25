'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Filter, Copy, Loader2 } from 'lucide-react';
import RuleList from './RuleList';
import { TemplateModal } from './TemplateModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RuleFormValues } from '@/lib/validation/rule';

export type Rule = {
  id: string;
  name: string;
  condition_type: 'variation_up' | 'variation_down' | 'price_above' | 'price_below' | 'volatility_extreme' | 'ath_break' | 'atl_break' | 'support_resistance' | 'volume_spike' | 'sentiment_change';
  value: number;
  window_minutes: number;
  enabled: boolean;
  created_at?: string;
};

export function RulesPageClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch user's rules
  useEffect(() => {
    const fetchRules = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('You must be logged in to view rules');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('rules')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError(`Error loading rules: ${fetchError.message}`);
        } else {
          setRules(data || []);
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRules();
  }, [supabase]);

  const handleTemplateSelect = (template: RuleFormValues) => {
    // Navigate to the new rule page with template data
    const params = new URLSearchParams();
    Object.entries(template).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    window.location.href = `/rules/new?${params.toString()}`;
  };

  // Filter rules based on search and status
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.condition_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && rule.enabled) ||
                         (statusFilter === 'inactive' && !rule.enabled);
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading rules...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Alert Rules</h1>
            <p className="text-muted-foreground">
              Create and manage price alert rules with custom conditions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TemplateModal 
              onTemplateSelect={handleTemplateSelect}
              trigger={
                <Button variant="outline" className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Templates
                </Button>
              }
            />
            <Link href="/rules/new">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Rule
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search rules by name or condition..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rules ({rules.length})</SelectItem>
                    <SelectItem value="active">Active ({rules.filter(r => r.enabled).length})</SelectItem>
                    <SelectItem value="inactive">Inactive ({rules.filter(r => !r.enabled).length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules List */}
        {filteredRules.length > 0 ? (
          <RuleList rules={filteredRules} />
        ) : rules.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No rules yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first alert rule to start monitoring Bitcoin price conditions
            </p>
            <div className="flex justify-center gap-2">
              <TemplateModal 
                onTemplateSelect={handleTemplateSelect}
                trigger={
                  <Button variant="outline">
                    Browse Templates
                  </Button>
                }
              />
              <Link href="/rules/new">
                <Button>Create Rule</Button>
              </Link>
            </div>
          </div>
        ) : (
          /* No search results */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No rules found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 