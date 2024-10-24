import React, { useState } from "react"
import { LockIcon, MailIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt", { email, password, rememberMe });
    navigate('/upload');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="bg-gray-900 p-10 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-orange-500">Lost</span>
            <span className="text-white">Stories</span>
          </h1>
          <div className="mt-3 h-1 w-20 bg-orange-500 mx-auto rounded-full"></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-orange-500 hover:text-orange-400 transition-colors">
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            Log in
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <a href="#" className="text-orange-500 hover:text-orange-400 transition-colors font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}