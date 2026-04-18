import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm();

  const password = watch('password');

  // Countdown timer for resend OTP
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(60); // 60 seconds countdown
  };

  const handleSendOTP = async (data) => {
    setIsSendingOTP(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEmail(data.email);
        setShowOTPForm(true);
        startCountdown();
        toast.success('Verification code sent to your email!');
      } else {
        toast.error(result.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (data) => {
    setIsVerifyingOTP(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: data.otp
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Account created successfully! Welcome to CampusAI!');
        // Store token and redirect
        localStorage.setItem('token', result.token);
        navigate('/');
      } else {
        toast.error(result.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify code. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsSendingOTP(true);
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        startCountdown();
        toast.success('New verification code sent!');
      } else {
        toast.error(result.message || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend verification code');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const goBackToForm = () => {
    setShowOTPForm(false);
    setEmail('');
    setCountdown(0);
    reset();
  };

  return (
    <div className="min-h-screen w-full bg-transparent relative">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Black Basic Grid Background - Fixed */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "#000000",
          backgroundImage: `
            linear-gradient(to right, rgba(75, 85, 99, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(75, 85, 99, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-3xl blur-2xl"></div>
          
          {/* Main Card */}
          <div className="relative bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-3xl p-8 shadow-2xl shadow-yellow-400/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-between items-center mb-6">
                <Link
                  to="/"
                  className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
                <div className="flex-1"></div>
              </div>
              <div className="mx-auto h-20 w-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <span className="text-black font-bold text-3xl">C</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                {showOTPForm ? 'Verify Email' : 'Create your account'}
              </h2>
              <p className="text-gray-300">
                {showOTPForm 
                  ? 'Enter the 6-digit code sent to your email'
                  : 'Join CampusAI to explore colleges and get AI assistance'
                }
              </p>
            </div>

            {!showOTPForm ? (
              /* Registration Form */
              <form className="space-y-6" onSubmit={handleSubmit(handleSendOTP)}>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 text-gray-100 placeholder-gray-400 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 hover:border-yellow-400/50"
                        placeholder="Enter your full name"
                        {...register('name', {
                          required: 'Full name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters',
                          },
                        })}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 text-gray-100 placeholder-gray-400 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 hover:border-yellow-400/50"
                        placeholder="Enter your email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 text-gray-100 placeholder-gray-400 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 hover:border-yellow-400/50"
                        placeholder="Enter your phone number"
                        {...register('phone', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit phone number',
                          },
                        })}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Role - Hidden field for Student */}
                  <input
                    type="hidden"
                    {...register('role')}
                    value="student"
                  />

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 text-gray-100 placeholder-gray-400 rounded-xl px-4 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 hover:border-yellow-400/50"
                        placeholder="Create a password"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                          },
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-yellow-400 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 text-gray-100 placeholder-gray-400 rounded-xl px-4 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 hover:border-yellow-400/50"
                        placeholder="Confirm your password"
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) =>
                            value === password || 'Passwords do not match',
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-yellow-400 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-5 w-5 text-yellow-400 focus:ring-yellow-400 border-gray-500 rounded bg-gray-600 mt-0.5"
                    {...register('terms', {
                      required: 'You must accept the terms and conditions',
                    })}
                  />
                  <label htmlFor="terms" className="block text-sm text-gray-300 leading-relaxed">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                    >
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link
                      to="/privacy"
                      className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.terms.message}
                  </p>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSendingOTP}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-4 px-6 rounded-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSendingOTP ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Sending verification code...
                      </>
                    ) : (
                      <>
                        <span>Send verification code</span>
                        <span className="ml-2">📧</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sign in link */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            ) : (
              /* OTP Verification Form */
              <form className="space-y-6" onSubmit={handleSubmit(handleVerifyOTP)}>
                {/* Email Display */}
                <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <p className="text-sm text-gray-300 mb-1">Verification code sent to:</p>
                  <p className="text-yellow-400 font-medium">{email}</p>
                </div>

                {/* OTP Input */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                    Enter 6-digit code
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CheckCircle className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      maxLength="6"
                      className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 text-gray-100 placeholder-gray-400 rounded-xl px-4 py-3 pl-10 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 hover:border-yellow-400/50"
                      placeholder="000000"
                      {...register('otp', {
                        required: 'Verification code is required',
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: 'Please enter a valid 6-digit code',
                        },
                      })}
                    />
                  </div>
                  {errors.otp && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.otp.message}
                    </p>
                  )}
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isSendingOTP}
                    className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  >
                    {isSendingOTP ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend in {countdown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend code
                      </>
                    )}
                  </button>
                </div>

                {/* Verify Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isVerifyingOTP}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-4 px-6 rounded-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isVerifyingOTP ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <span>Verify Email</span>
                        <span className="ml-2">✅</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Back to Form */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={goBackToForm}
                    className="text-sm text-gray-400 hover:text-yellow-400 transition-colors flex items-center justify-center mx-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to registration
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Register;
