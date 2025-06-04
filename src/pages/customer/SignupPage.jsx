// src/pages/SignUpPage.js
import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import authApiService from "../../services/AuthApiService";

// Star background component for night theme
const StarBackground = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 150 }).map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 10 + 5,
        delay: Math.random() * 5,
        top: Math.random() * 100,
        left: Math.random() * 100,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.3, star.opacity],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function SignUpPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApiService.registerCustomer(
        form.email,
        form.username,
        form.password
      );

      if (response.success) {
        setSuccessMessage(
          response.messages ||
            "Registration successful! You will be redirected to login."
        );
        setForm({ username: "", email: "", password: "", confirmPassword: "" });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.messages || "Registration failed. Please try again.");
      }
    } catch (apiError) {
      console.error("Registration failed:", apiError);
      setError(
        apiError.data?.message ||
          apiError.message ||
          "An error occurred during registration."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-indigo-900 to-black relative overflow-hidden">
      {/* Night sky elements */}
      <StarBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-0"></div>

      {/* Moon element */}
      <motion.div
        className="absolute top-10 right-10 w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-gray-200 to-yellow-100 shadow-[0_0_40px_15px_rgba(255,255,230,0.2)] z-10"
        animate={{
          scale: [1, 1.03, 1],
          boxShadow: [
            "0 0 40px 15px rgba(255,255,230,0.2)",
            "0 0 50px 20px rgba(255,255,230,0.3)",
            "0 0 40px 15px rgba(255,255,230,0.2)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Moon craters */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-gray-300/30"></div>
        <div className="absolute top-1/3 right-1/4 w-5 h-5 rounded-full bg-gray-300/40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-6 h-6 rounded-full bg-gray-300/20"></div>
      </motion.div>

      {/* Floating mountains silhouette */}
      <div className="absolute bottom-0 left-0 w-full h-32 z-0">
        <svg viewBox="0 0 1200 120" className="w-full h-full">
          <path
            fill="#0f172a"
            d="M0,96L48,85.3C96,75,192,53,288,53.3C384,53,480,75,576,96C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Form card */}
      <motion.div
        className="w-full max-w-md bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 relative z-20 border border-gray-700/30"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
      >
        <div className="text-center">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Create Account
          </motion.h1>
          <motion.p
            className="text-gray-400 text-sm"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Join our community under the moon
          </motion.p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm text-center backdrop-blur-sm"
              initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
              exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              className="bg-green-900/30 border border-green-700 text-green-200 px-4 py-3 rounded-lg text-sm text-center backdrop-blur-sm"
              initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
              exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                placeholder="Choose a username"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                placeholder="you@example.com"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                placeholder="Create a password (min. 6 characters)"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                placeholder="Confirm your password"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-sm relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </button>
          </motion.div>
        </form>

        <motion.div
          className="text-center text-gray-400 pt-3 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-300 hover:text-indigo-200 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
