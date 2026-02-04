import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useForm } from '@tanstack/react-form';

import { EyeOffIcon, EyeIcon } from "@/components/ui/icons";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useAuth } from "@/lib/auth";
import { paths } from "@/config/paths";

// Validation helpers
const isNotEmpty = (value: string): boolean => value.trim().length > 0;
const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    onSubmit: async ({ value }) => {
      try {
        setLoginError(null);
        await login(value);
        
        // Redirect to the intended page or dashboard
        const redirectTo = location.state?.redirectTo || paths.app.dashboard.getHref();
        navigate(redirectTo, { replace: true });
      } catch {
        setLoginError('Invalid email or password. Please try again.');
      }
    },
  });

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <Form onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}>
              <div className="space-y-6">
                <div>
                  <form.Field 
                    name="email" 
                    validators={{ 
                      onChange: ({ value }) => 
                        !isNotEmpty(value) ? 'Email is required' : 
                        !isEmail(value) ? 'Please enter a valid email' : undefined 
                    }}
                  >
                    {(field) => (
                      <div>
                        <Label htmlFor="email">
                          Email <span className="text-error-500">*</span>
                        </Label>
                        <Input 
                          type="email"
                          placeholder="admin@conscioustalent.com"
                          id="email"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          error={!!field.state.meta.errors.length}
                          hint={field.state.meta.errors.join(', ')}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
                
                <div>
                  <form.Field 
                    name="password" 
                    validators={{ 
                      onChange: ({ value }) => 
                        !isNotEmpty(value) ? 'Password is required' : 
                        value.length < 5 ? 'Password must be at least 5 characters' : undefined 
                    }}
                  >
                    {(field) => (
                      <div>
                        <Label htmlFor="password">
                          Password <span className="text-error-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            id="password"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={!!field.state.meta.errors.length}
                            hint={field.state.meta.errors.join(', ')}
                          />
                          <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                          >
                            {showPassword ? (
                              <EyeIcon className="fill-gray-500 size-5" />
                            ) : (
                              <EyeOffIcon className="fill-gray-500 size-5" />
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Login Error Message */}
                {loginError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {loginError}
                  </div>
                )}

                <div>
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                  >
                    {([canSubmit, isSubmittingForm]) => (
                      <button
                        type="submit"
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isSubmittingForm || !canSubmit ? 'opacity-70 cursor-not-allowed' : ''
                        } transition-colors duration-200`}
                        disabled={!canSubmit || isSubmittingForm}
                      >
                        {isSubmittingForm ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </span>
                        ) : (
                          'Sign in'
                        )}
                      </button>
                    )}
                  </form.Subscribe>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
