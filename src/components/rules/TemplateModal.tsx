'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { templateCategories, getTemplatesByCategory } from '@/lib/templates';
import { RuleTemplate, RuleFormValues } from '@/lib/validation/rule';

type TemplateModalProps = {
  onTemplateSelect: (template: RuleFormValues) => void;
  trigger?: React.ReactNode;
};

export function TemplateModal({ onTemplateSelect, trigger }: TemplateModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = getTemplatesByCategory(selectedCategory).filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateSelect = (template: RuleTemplate) => {
    const formValues: RuleFormValues = {
      name: template.name,
      condition_type: template.condition_type,
      value: template.value,
      window_minutes: template.window_minutes,
      message_template: template.message_template,
      webhook_url: '',
      enabled: true,
    };
    
    onTemplateSelect(formValues);
    setOpen(false);
    setSearchTerm('');
    setSelectedCategory('');
  };

  const previewMessage = (template: RuleTemplate) => {
    return template.message_template
      .replace('{{price}}', '65,432.10')
      .replace('{{variation}}', template.value.toString())
      .replace('{{window}}', template.window_minutes.toString());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Create from Template</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Rule Template</DialogTitle>
          <DialogDescription>
            Select from our pre-built templates to quickly create common Bitcoin price alerts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search templates</Label>
            <Input
              id="search"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Filter by category</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === '' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('')}
              >
                All Categories
              </Badge>
              {templateCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.icon} {category.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{template.icon}</span>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge className={template.color}>
                      {template.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>
                      <br />
                      <span className="text-muted-foreground">
                        {template.condition_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Value:</span>
                      <br />
                      <span className="text-muted-foreground">
                        {template.value}
                        {template.condition_type.includes('variation') ? '%' : 
                         template.condition_type.includes('price') ? '$' : ''}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Window:</span>
                      <br />
                      <span className="text-muted-foreground">
                        {template.window_minutes} min
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Message Preview:</Label>
                    <div className="p-2 bg-muted rounded text-sm">
                      {previewMessage(template)}
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full"
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No templates found matching your search.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 