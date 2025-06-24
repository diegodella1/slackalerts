'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export type Rule = {
  id: string;
  name: string;
  condition_type: 'variation_up' | 'variation_down' | 'price_above' | 'price_below' | 'volatility_extreme' | 'ath_break' | 'atl_break' | 'support_resistance' | 'volume_spike' | 'sentiment_change';
  value: number;
  window_minutes: number;
  enabled: boolean;
  created_at?: string;
};

type RuleListProps = {
  rules: Rule[];
};

export default function RuleList({ rules }: RuleListProps) {
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      const { error } = await supabase.from('rules').delete().match({ id });
      if (error) {
        alert('Error deleting rule: ' + error.message);
      } else {
        router.refresh();
      }
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('rules')
      .update({ enabled: !currentState })
      .match({ id });

    if (error) {
      alert('Error toggling rule: ' + error.message);
    } else {
      router.refresh();
    }
  };

  const getConditionDisplay = (conditionType: string) => {
    const displays = {
      variation_up: 'Price up',
      variation_down: 'Price down',
      price_above: 'Above',
      price_below: 'Below',
      volatility_extreme: 'Volatility',
      ath_break: 'New ATH',
      atl_break: 'New ATL',
      support_resistance: 'S/R Level',
      volume_spike: 'Volume spike',
      sentiment_change: 'Sentiment',
    };
    return displays[conditionType as keyof typeof displays] || conditionType;
  };

  const getValueDisplay = (rule: Rule) => {
    if (['ath_break', 'atl_break'].includes(rule.condition_type)) {
      return 'Auto';
    }
    
    if (rule.condition_type.includes('variation') || rule.condition_type === 'volatility_extreme') {
      return `${rule.value}%`;
    }
    
    if (rule.condition_type.includes('price') || rule.condition_type === 'support_resistance') {
      return `$${rule.value.toLocaleString()}`;
    }
    
    if (rule.condition_type === 'volume_spike') {
      return `${rule.value}%`;
    }
    
    return rule.value.toString();
  };

  return (
    <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Window</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rules.map((rule) => (
                    <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{getConditionDisplay(rule.condition_type)}</TableCell>
                        <TableCell>{getValueDisplay(rule)}</TableCell>
                        <TableCell>{rule.window_minutes} min</TableCell>
                        <TableCell>
                            <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                                {rule.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                            <Link href={`/rules/${rule.id}`}>
                                <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleToggle(rule.id, rule.enabled)}
                            >
                                {rule.enabled ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(rule.id)}
                            >
                                Delete
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
} 