# New Features: Webhook Management & Refresh Settings

## 🎯 Overview

This update adds two major features to the Bitcoin Price Alert system:

1. **Webhook Management**: Users can now create and manage Slack webhooks directly from the application
2. **Refresh Rate Configuration**: Users can choose between 10 or 30-second refresh intervals for price updates

## 🔧 Setup Instructions

### 1. Database Setup

Run the SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of webhook_and_refresh_setup.sql
```

This will create:
- `webhooks` table for storing user webhooks
- `refresh_settings` table for user preferences
- Proper RLS policies and indexes
- Validation functions for webhook URLs

### 2. Test the Setup

Run the test script to verify everything is working:

```bash
node scripts/testNewFeatures.js
```

## 📱 New UI Components

### Settings Page (`/settings`)

The new settings page includes:

- **Refresh Settings**: Choose between 10 or 30-second intervals
- **Webhook Manager**: Create, edit, and delete Slack webhooks
- **Help Section**: Instructions for setting up Slack webhooks

### Enhanced Rule Form

The rule creation form now includes:

- **Webhook Selection**: Choose from saved webhooks when creating rules
- **Better Template Variables**: Support for `{{price}}`, `{{condition_type}}`, `{{value}}`, etc.

## 🔗 Webhook Management

### Creating Slack Webhooks

1. Go to your Slack workspace
2. Create a new app at https://api.slack.com/apps
3. Enable "Incoming Webhooks"
4. Create a webhook for your desired channel
5. Copy the webhook URL
6. Add it in the app's Settings page

### Webhook Features

- ✅ **Multiple webhooks per user**
- ✅ **Webhook validation** (Slack URLs must start with `https://hooks.slack.com/`)
- ✅ **Soft delete** (webhooks are marked inactive, not deleted)
- ✅ **Type support** (Slack, Discord, Generic webhooks)
- ✅ **Rich Slack messages** with formatting

## ⚡ Refresh Rate Configuration

### Available Options

- **10 seconds**: Fast updates, more responsive alerts
- **30 seconds**: Standard rate, balanced performance

### How It Works

- Each user has their own refresh settings
- Settings are stored in the `refresh_settings` table
- Default is 30 seconds for new users
- Changes take effect immediately

## 🚀 API Updates

### Enhanced Price Fetch API

The `/api/fetch-price` endpoint now:

- ✅ **Uses webhooks from database** instead of environment variables
- ✅ **Sends rich Slack messages** with proper formatting
- ✅ **Tracks webhook success/failure** in alerts
- ✅ **Better error handling** for webhook delivery
- ✅ **Improved message templating** with more variables

### Webhook Message Format

Slack messages now include:

```json
{
  "text": "Alert message",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Alert message"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "💰 Current Price: $65,432 | 📈 Change: +2.5%"
        }
      ]
    }
  ]
}
```

## 📊 Database Schema

### New Tables

#### `webhooks`
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'slack',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `refresh_settings`
```sql
CREATE TABLE refresh_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  refresh_interval_seconds INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Updated Tables

#### `rules`
- Added `webhook_id` column to reference saved webhooks

## 🧪 Testing

### Manual Testing

1. **Start the app**: `npm run dev`
2. **Visit settings**: Go to `/settings`
3. **Add a webhook**: Create a test Slack webhook
4. **Set refresh rate**: Choose 10 or 30 seconds
5. **Create a rule**: Go to `/rules/new` and select your webhook
6. **Test alerts**: Wait for price conditions to trigger

### Automated Testing

```bash
# Test new features
node scripts/testNewFeatures.js

# Test authentication
node scripts/testAuth.js

# Test price fetching
node scripts/fetchPrice.js
```

## 🔒 Security Features

- ✅ **Row Level Security** on all new tables
- ✅ **User isolation** (users can only see their own webhooks/settings)
- ✅ **URL validation** for webhook URLs
- ✅ **Soft deletes** to prevent data loss
- ✅ **Input sanitization** for all user inputs

## 🎨 UI/UX Improvements

- ✅ **Modern card-based layout** for settings
- ✅ **Real-time feedback** for form submissions
- ✅ **Loading states** and error handling
- ✅ **Responsive design** for mobile devices
- ✅ **Dark mode support** throughout
- ✅ **Intuitive navigation** with new Settings link

## 📈 Performance Optimizations

- ✅ **Efficient database queries** with proper indexes
- ✅ **Lazy loading** of webhook lists
- ✅ **Optimized webhook delivery** with timeouts
- ✅ **Cached refresh settings** to reduce database calls

## 🚨 Troubleshooting

### Common Issues

1. **"Webhooks table not found"**
   - Run the SQL script in Supabase
   - Check that RLS policies are enabled

2. **"Invalid webhook URL"**
   - Ensure Slack URLs start with `https://hooks.slack.com/`
   - Check that the webhook is active in Slack

3. **"Webhook not sending"**
   - Verify the webhook URL is correct
   - Check Slack app permissions
   - Review webhook response in alerts history

4. **"Refresh rate not updating"**
   - Check browser console for errors
   - Verify user is authenticated
   - Check database for refresh_settings record

### Debug Commands

```bash
# Check database schema
node scripts/testNewFeatures.js

# Test webhook delivery
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H "Content-Type: application/json" \
  -d '{"text":"Test message"}'

# Check API status
curl http://localhost:3000/api/fetch-price
```

## 🔄 Migration Guide

### For Existing Users

1. **No data migration required** - new features are additive
2. **Existing rules continue working** with old webhook URLs
3. **Users can gradually migrate** to new webhook system
4. **Refresh settings created automatically** on first visit to settings

### For Developers

1. **Update environment variables** if needed
2. **Run database migrations** (SQL script)
3. **Test new features** with provided scripts
4. **Update documentation** for your team

## 📝 Future Enhancements

- 🔮 **Discord webhook support** (UI ready, backend needs Discord API)
- 🔮 **Email notifications** as alternative to webhooks
- 🔮 **Custom refresh intervals** (beyond 10/30 seconds)
- 🔮 **Webhook templates** for different message formats
- 🔮 **Bulk webhook operations** (import/export)
- 🔮 **Webhook analytics** (success rates, delivery times) 