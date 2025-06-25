import { WebhookManager } from '@/components/WebhookManager';
import { RefreshSettings } from '@/components/RefreshSettings';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your Bitcoin price alert preferences and webhooks
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Refresh Settings */}
          <div>
            <RefreshSettings />
          </div>

          {/* Webhook Management */}
          <div>
            <WebhookManager />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-4">How to set up Slack webhooks</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>1. Go to your Slack workspace and create a new app</p>
            <p>2. Enable &quot;Incoming Webhooks&quot; in your app settings</p>
            <p>3. Create a new webhook for your desired channel</p>
            <p>4. Copy the webhook URL and paste it in the form above</p>
            <p>5. Give your webhook a descriptive name (e.g., &quot;Bitcoin Alerts&quot;)</p>
            <p>6. Save the webhook and select it when creating alert rules</p>
          </div>
        </div>
      </div>
    </div>
  );
} 