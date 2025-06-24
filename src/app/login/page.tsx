'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Github, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isEmailSent, setIsEmailSent] = useState(false)

  // Registration form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        setMessage({ type: 'error', text: error.message })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Validate email domain
    const emailDomain = registerData.email.split('@')[1]
    if (!['roxom.com', 'roxom.tv'].includes(emailDomain)) {
      setMessage({ 
        type: 'error', 
        text: 'Only @roxom.com and @roxom.tv email addresses are allowed' 
      })
      setIsLoading(false)
      return
    }

    // Validate password
    if (registerData.password.length < 6) {
      setMessage({ 
        type: 'error', 
        text: 'Password must be at least 6 characters long' 
      })
      setIsLoading(false)
      return
    }

    // Validate password confirmation
    if (registerData.password !== registerData.confirmPassword) {
      setMessage({ 
        type: 'error', 
        text: 'Passwords do not match' 
      })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.fullName,
          },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setIsEmailSent(true)
        setMessage({ 
          type: 'success', 
          text: 'Registration successful! Please check your email to verify your account.' 
        })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Login successful! Redirecting...' 
        })
        // Redirect will be handled by Supabase auth
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (form: 'register' | 'login', field: string, value: string) => {
    if (form === 'register') {
      setRegisterData(prev => ({ ...prev, [field]: value }))
    } else {
      setLoginData(prev => ({ ...prev, [field]: value }))
    }
    setMessage(null)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Bitcoin Price Alerts</CardTitle>
            <CardDescription>
              Sign in to manage your Bitcoin price alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@roxom.com"
                        value={loginData.email}
                        onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button 
                  onClick={handleGitHubLogin} 
                  variant="outline" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Continue with GitHub
                </Button>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-fullname">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="register-fullname"
                        type="text"
                        placeholder="John Doe"
                        value={registerData.fullName}
                        onChange={(e) => handleInputChange('register', 'fullName', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@roxom.com or your@roxom.tv"
                        value={registerData.email}
                        onChange={(e) => handleInputChange('register', 'email', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Only @roxom.com and @roxom.tv email addresses are allowed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={registerData.password}
                        onChange={(e) => handleInputChange('register', 'password', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => handleInputChange('register', 'confirmPassword', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button 
                  onClick={handleGitHubLogin} 
                  variant="outline" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Continue with GitHub
                </Button>
              </TabsContent>
            </Tabs>

            {/* Message Display */}
            {message && (
              <Alert className={`mt-4 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Email Verification Notice */}
            {isEmailSent && (
              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-600">
                  Please check your email and click the verification link to complete your registration.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 