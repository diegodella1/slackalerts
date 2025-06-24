# Real-time Alert System Testing Guide

This guide will walk you through testing the complete real-time Bitcoin price alert system.

## Prerequisites

1. ✅ Supabase project configured
2. ✅ Database tables created
3. ✅ Environment variables set
4. ✅ Development server running (`npm run dev`)

## Step 1: Create a Slack Webhook

### Option A: Create a Test Slack Workspace

1. Go to [slack.com](https://slack.com) and create a free workspace
2. Create a new channel called `#bitcoin-alerts`
3. Go to [api.slack.com/apps](https://api.slack.com/apps)
4. Click "Create New App" → "From scratch"
5. Name it "Bitcoin Price Alerts" and select your workspace
6. Go to "Incoming Webhooks" in the left sidebar
7. Click "Activate Incoming Webhooks"
8. Click "Add New Webhook to Workspace"
9. Select your `#bitcoin-alerts` channel
10. Copy the webhook URL (starts with `https://hooks.slack.com/services/...`)

### Option B: Use a Webhook Testing Service

If you don't want to set up Slack, use [webhook.site](https://webhook.site):

1. Go to [webhook.site](https://webhook.site)
2. Copy the unique URL provided
3. Use this URL as your webhook in the rules

## Step 2: Create a Test Rule

1. **Navigate to Rules**: Go to `http://localhost:3000/rules/new`

2. **Fill in the Rule Form**:
   ```
   Name: Test - Price Above $1
   Description: Test rule to trigger when Bitcoin price goes above $1
   Condition Type: Price Above
   Value: 1
   Message Template: 🚀 Bitcoin price alert! Current price: ${{price}} ({{variation}}% change)
   Webhook URL: [Your Slack webhook URL from Step 1]
   ```

3. **Save the Rule**: Click "Create Rule"

## Step 3: Start Real-time Monitoring

1. **Go to Price Dashboard**: Navigate to `http://localhost:3000/price`

2. **Start Auto Refresh**:
   - Click "Start Auto Refresh"
   - Set interval to 10 seconds (for faster testing)
   - You should see the "Auto" badge appear

3. **Monitor the Dashboard**:
   - Watch the price updates in real-time
   - Check the "Fetches" counter increasing
   - Look for the "Recent Alerts" section

## Step 4: Trigger an Alert

Since Bitcoin is currently above $1, your test rule should trigger immediately! You should see:

### In the Browser:
- ✅ Real-time notification popup in the top-right corner
- ✅ Alert appears in the "Recent Alerts" section
- ✅ Console logs showing triggered alerts

### In Slack (if using Slack webhook):
- ✅ Message appears in your `#bitcoin-alerts` channel
- ✅ Shows the alert message with price and variation

### In the Database:
- ✅ Alert saved in `alerts_sent` table
- ✅ Price data saved in `prices` and `current_price` tables

## Step 5: Test Different Scenarios

### Scenario 1: Price Variation Alert

1. Create a new rule:
   ```
   Name: Test - 5% Price Increase
   Condition Type: Variation Up
   Value: 5
   Message: 📈 Bitcoin surged {{variation}}% in 24h! Current price: ${{price}}
   ```

2. This will trigger when Bitcoin price increases by 5% or more

### Scenario 2: Price Drop Alert

1. Create another rule:
   ```
   Name: Test - Price Below $50,000
   Condition Type: Price Below
   Value: 50000
   Message: 📉 Bitcoin dropped below $50,000! Current price: ${{price}}
   ```

2. This will trigger if Bitcoin falls below $50,000

## Step 6: Monitor Alert History

1. **View Recent Alerts**: Check the "Recent Alerts" section on `/price`
2. **Full Alert History**: Go to `/alerts` to see all triggered alerts
3. **Filter Alerts**: Use the filters to search by date, rule, or text

## Step 7: Advanced Testing

### Test Multiple Rules Simultaneously

1. Create several rules with different conditions
2. Start auto refresh
3. Watch multiple alerts trigger when conditions are met

### Test Webhook Failures

1. Create a rule with an invalid webhook URL
2. Check console logs for webhook error messages
3. Verify alerts still save to database even if webhook fails

### Test Rule Disabling

1. Go to `/rules`
2. Disable a rule using the toggle
3. Verify it no longer triggers alerts

## Troubleshooting

### Alerts Not Triggering

**Check these common issues:**

1. **Rule Status**: Ensure rule is enabled
2. **Condition Values**: Verify the condition makes sense (e.g., price above $1 will always trigger)
3. **Console Logs**: Check browser console for error messages
4. **Network**: Ensure Roxom API is accessible

### Webhook Not Working

1. **URL Format**: Verify webhook URL starts with `https://hooks.slack.com/services/`
2. **Slack Permissions**: Check if the webhook is still active
3. **Network**: Test webhook URL in a tool like Postman
4. **Console Logs**: Look for webhook error messages

### Price Not Updating

1. **API Status**: Check if Roxom API is responding
2. **Network**: Verify internet connection
3. **Console Logs**: Look for API error messages
4. **Manual Fetch**: Try the "Manual Fetch" button

## Expected Behavior

### When Auto Refresh is Running:

- Price updates every 10-30 seconds (depending on interval)
- Rules are checked after each price fetch
- Alerts trigger immediately when conditions are met
- Notifications appear in real-time
- Database is updated with new data

### When Alerts Trigger:

- Browser notification appears
- Alert is saved to database
- Webhook is sent to Slack
- Alert appears in recent alerts list
- Console shows trigger details

## Performance Notes

- **API Rate Limits**: Roxom API may have rate limits
- **Database Performance**: Large alert history may slow queries
- **Browser Performance**: Long-running auto refresh may use resources
- **Webhook Reliability**: External webhooks may fail occasionally

## Next Steps

After successful testing:

1. **Create Production Rules**: Set up real trading rules
2. **Configure Slack**: Set up proper Slack workspace and channels
3. **Monitor Performance**: Watch for any performance issues
4. **Scale Up**: Consider adding more cryptocurrencies or conditions

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set
3. Ensure database tables are created correctly
4. Test with the manual fetch button first
5. Check Supabase logs for database errors 