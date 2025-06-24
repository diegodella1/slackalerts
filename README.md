# Bitcoin Price Alert Dashboard

A real-time Bitcoin price monitoring dashboard with automatic alerts and Slack integration built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Supabase Auth with GitHub OAuth and Magic Link
- 📊 **Real-time Price Monitoring**: Continuous price fetching from Roxom API
- ⚡ **Automatic Alerts**: Configurable rules with multiple condition types
- 🔔 **Slack Integration**: Webhook notifications to Slack channels
- 🌙 **Dark Mode**: Full dark/light theme support
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎯 **Rule Templates**: Pre-built templates for common alert scenarios
- 📈 **Price History**: Track price movements over time
- 📋 **Alert History**: Complete audit trail of all triggered alerts

## Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account
- GitHub account (for OAuth)

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database_schema_updates.sql`
4. Run the SQL commands to create all necessary tables and policies

### 5. Supabase Configuration

1. **Authentication Setup**:
   - Go to Authentication > Settings
   - Add your site URL (e.g., `http://localhost:3000` for development)
   - Configure GitHub OAuth provider
   - Set redirect URLs

2. **Row Level Security (RLS)**:
   - The SQL script automatically enables RLS
   - Policies are created to ensure users can only access their own data

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Testing the System

### Step 1: Authentication

1. Click "Login" on the homepage
2. Sign in with GitHub
3. You'll be redirected back to the dashboard

### Step 2: Create Your First Rule

1. Navigate to `/rules/new`
2. Fill in the rule details:
   - **Name**: "Test Price Alert"
   - **Condition**: "Price Above"
   - **Value**: Enter a low value (e.g., 1)
   - **Message Template**: "🚀 Bitcoin price is now ${price}!"
   - **Webhook URL**: Your Slack webhook URL (optional)
3. Save the rule

### Step 3: Test Real-time Monitoring

1. Go to `/price` dashboard
2. Click "Fetch New" to get current Bitcoin price
3. Enable "Auto Refresh" with 30-second interval
4. Watch for real-time updates

### Step 4: Monitor Alerts

- View triggered alerts on the price dashboard
- Check `/alerts` for complete alert history
- Monitor your Slack channel for webhook notifications

## Slack Webhook Setup

1. **Create Slack App**:
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Name your app and select workspace

2. **Enable Incoming Webhooks**:
   - Go to "Features" → "Incoming Webhooks"
   - Toggle "Activate Incoming Webhooks"
   - Click "Add New Webhook to Workspace"
   - Select channel and authorize

3. **Copy Webhook URL**:
   - Copy the webhook URL
   - Add it to your rule configuration

## Rule Types

- **Price Above**: Trigger when Bitcoin price exceeds threshold
- **Price Below**: Trigger when Bitcoin price falls below threshold
- **Variation Up**: Trigger on positive percentage change
- **Variation Down**: Trigger on negative percentage change

## Message Templates

Use these placeholders in your message templates:

- `{price}`: Current Bitcoin price
- `{target}`: Rule threshold value
- `{change}`: Price change percentage
- `{timestamp}`: Current timestamp

Example: `🚀 Bitcoin is now ${price}! Target was ${target}.`

## API Endpoints

- `POST /api/fetch-price`: Fetch latest price and check rules
- `GET /api/fetch-price`: Get current price data

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── alerts/            # Alert history page
│   ├── auth/              # Authentication
│   ├── price/             # Real-time price dashboard
│   └── rules/             # Rule management
├── components/            # React components
│   ├── alerts/           # Alert components
│   ├── rules/            # Rule components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and config
│   ├── supabase/         # Supabase client setup
│   └── validation/       # Zod schemas
└── types/                # TypeScript types
```

## Database Schema

### Tables

- **rules**: User-defined alert rules
- **price_history**: Historical price data
- **alerts_sent**: Triggered alerts log

### Key Features

- Row Level Security (RLS) enabled
- Automatic timestamps
- Foreign key relationships
- Optimized indexes

## Development

### Testing Setup

Run the test script to verify your setup:

```bash
node scripts/testSetup.js
```

### Adding New Features

1. **New Rule Types**: Update validation schemas and API logic
2. **UI Components**: Use shadcn/ui components for consistency
3. **Database Changes**: Update schema and run migrations

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Zod for runtime validation

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### Supabase Production Setup

1. Update Site URL in Auth settings
2. Configure production redirect URLs
3. Set up custom domain (optional)

## Troubleshooting

### Common Issues

1. **Authentication not working**:
   - Check Supabase Auth settings
   - Verify redirect URLs
   - Ensure GitHub OAuth is configured

2. **Alerts not triggering**:
   - Verify rule is enabled
   - Check condition values
   - Test webhook URL separately

3. **Price not updating**:
   - Check Roxom API status
   - Verify network connectivity
   - Check browser console for errors

4. **Database errors**:
   - Run database schema script
   - Check RLS policies
   - Verify user permissions

### Debug Mode

Enable debug logging:

```bash
NEXT_PUBLIC_DEBUG=true
```

### Support

- Check browser console for errors
- Review Supabase logs
- Test API endpoints directly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
