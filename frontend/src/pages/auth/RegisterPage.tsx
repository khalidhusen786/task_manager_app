// ===== REGISTER PAGE =====
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { ROUTES, VALIDATION_RULES } from '../../constants';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert } from '../../components/ui';
import { useToast } from '../../components/ui/ToastProvider';

// Validation schema
const registerSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.NAME_MAX_LENGTH, `Name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
type RegisterApiPayload = Omit<RegisterFormData, 'confirmPassword'>;

const onSubmit = async (data: RegisterFormData) => {
  const payload: RegisterApiPayload = {
    name: data.name,
    email: data.email,
    password: data.password,
  };

  try {
    await dispatch(registerUser(payload)).unwrap();
    navigate(ROUTES.DASHBOARD);
    addToast({ type: 'success', message: 'Account created. Welcome!' });
  } catch (error) {
    addToast({ type: 'error', message: 'Registration failed. Please try again.' });
  }
};


  const clearErrorMessage = () => {
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary-600/90 shadow-sm shadow-primary-200 flex items-center justify-center">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign up</CardTitle>
              <CardDescription>Get started managing your tasks in minutes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <Alert variant="error" onClose={clearErrorMessage}>
                    {error}
                  </Alert>
                )}

                <div className="space-y-4">
                  <Input
                    {...register('name')}
                    type="text"
                    label="Full Name"
                    placeholder="Enter your full name"
                    leftIcon={<User className="h-5 w-5" />}
                    error={errors.name?.message}
                    autoComplete="name"
                  />

                  <Input
                    {...register('email')}
                    type="email"
                    label="Email address"
                    placeholder="Enter your email"
                    leftIcon={<Mail className="h-5 w-5" />}
                    error={errors.email?.message}
                    autoComplete="email"
                  />

                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Create a password"
                    leftIcon={<Lock className="h-5 w-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    }
                    error={errors.password?.message}
                    autoComplete="new-password"
                  />

                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    leftIcon={<Lock className="h-5 w-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    }
                    error={errors.confirmPassword?.message}
                    autoComplete="new-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
