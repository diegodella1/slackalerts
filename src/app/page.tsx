import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Settings, DollarSign, ArrowRight, Play } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Bitcoin Price Alerts
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Monitor Bitcoin price in real-time with persistent auto-fetch and get instant notifications when your conditions are met
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/price">
                <Button size="lg" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Start Monitoring
                </Button>
              </Link>
              <Link href="/rules/new">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Create Alert
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  Real-Time Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get live Bitcoin price updates every 30 seconds with auto-fetch functionality that persists across page navigation.
                </p>
                <Link href="/price">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    View Dashboard
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  Smart Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create custom price alerts with conditions like price above/below thresholds and percentage changes.
                </p>
                <Link href="/rules/new">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    Create Rule
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  Easy Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage all your alert rules in one place. Enable, disable, edit, or delete rules as needed.
                </p>
                <Link href="/rules">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    Manage Rules
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Start Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the floating control panel to start persistent price monitoring that continues across all pages.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Create Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up alert rules with your desired conditions and notification preferences.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Get Notified</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive real-time notifications when your conditions are met, with optional Slack integration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Start?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Quick Start Guide</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-primary">1.</span>
                      <span>Go to Price page and start monitoring from the floating control panel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-primary">2.</span>
                      <span>Create your first alert rule in the Rules section</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-primary">3.</span>
                      <span>Monitor alerts and adjust rules as needed</span>
                    </li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Key Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Persistent auto-fetch across all pages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Real-time price monitoring every 30 seconds</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Customizable alert conditions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Slack webhook integration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
