# Authentication Setup Guide

This application uses Supabase for email/password authentication. Users can register and login with any email address.

## Features

- ✅ Email/password registration and login
- ✅ Email verification required for new accounts
- ✅ Password minimum length: 6 characters
- ✅ No domain restrictions (any email allowed)
- ✅ Secure session management
- ✅ Automatic redirects for authenticated/unauthenticated users

## Configuration

### 1. Supabase Setup

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Settings**
3. Ensure **Email Auth** is enabled
4. Configure **Email Templates** if needed
5. Set **Site URL** to your production domain (e.g., `https://your-app.vercel.app`)

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Email Configuration

In Supabase dashboard:
1. Go to **Authentication** > **Email Templates**
2. Customize the confirmation email template
3. Set the **Redirect URL** to: `https://your-domain.com/auth/callback`

## User Flow

### Registration
1. User visits `/login` and clicks "Register" tab
2. Fills out: Full Name, Email, Password, Confirm Password
3. Clicks "Create Account"
4. Receives confirmation email
5. Clicks confirmation link
6. Account is activated

### Login
1. User visits `/login`
2. Enters email and password
3. Clicks "Sign In"
4. Redirected to dashboard if successful

## Testing

Run the authentication test script:

```bash
node scripts/testAuth.js
```

This will verify:
- Supabase connection
- Registration flow
- Email confirmation setup

## Security Features

- Password minimum length validation
- Email verification required
- Secure session management
- Protected routes with middleware
- Automatic logout on session expiry

## Troubleshooting

### Common Issues

1. **"Email not confirmed" error**
   - Check spam folder
   - Verify email template configuration in Supabase
   - Ensure redirect URL is correct

2. **"Invalid login credentials"**
   - Verify email is confirmed
   - Check password is correct
   - Ensure account exists

3. **Build errors with environment variables**
   - Create `.env.local` file
   - Add Supabase URL and key
   - Restart development server

### Supabase Dashboard Settings

Make sure these settings are configured in Supabase:

- **Authentication** > **Providers** > **Email**: Enabled
- **Authentication** > **Settings** > **Site URL**: Your production URL
- **Authentication** > **Email Templates** > **Confirm signup**: Configured

## Migration from GitHub OAuth

If you previously used GitHub OAuth:

1. Remove GitHub provider from Supabase dashboard
2. Update any hardcoded GitHub references in code
3. Test email/password flow
4. Update documentation

## Production Deployment

For Vercel deployment:

1. Add environment variables in Vercel dashboard
2. Set **Site URL** in Supabase to your Vercel domain
3. Update email template redirect URLs
4. Test registration and login flow 