import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import authApiService from "../../services/AuthApiService"; // Ensure path is correct

const CloudBackground = () => {
  const clouds = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        size: Math.floor(Math.random() * 100) + 60,
        opacity: Math.random() * 0.3 + 0.2,
        duration: Math.random() * 50 + 40,
        delay: Math.random() * 20,
        top: Math.random() * 90,
        initialX: Math.random() * 100 - 50,
        direction: i % 2 === 0 ? "left" : "right",
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute"
          style={{
            top: `${cloud.top}%`,
            left:
              cloud.direction === "left"
                ? `calc(100% + ${cloud.initialX}vw)`
                : undefined,
            right:
              cloud.direction === "right"
                ? `calc(100% + ${cloud.initialX}vw)`
                : undefined,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
            opacity: cloud.opacity,
          }}
          initial={{
            x: cloud.direction === "left" ? 0 : 0,
            y: Math.random() * 30 - 15,
          }}
          animate={{
            x: cloud.direction === "left" ? `-250vw` : `250vw`,
            y: Math.random() * 30 - 15,
          }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <svg viewBox="0 0 120 70" className="w-full h-full drop-shadow-sm">
            <path
              fill="currentColor"
              className="text-white/80"
              d="M10.7,45.3c-3.9-0.3-7.1-3.4-7.1-7.2c0-4,3.3-7.3,7.4-7.3c0.6,0,1.1,0.1,1.7,0.2C14.8,22.9,22.2,17,31,17 c8.4,0,15.5,5.4,18.2,12.8c1.3-0.5,2.7-0.8,4.2-0.8c7.2,0,13.1,5.9,13.1,13.1c0,0.1,0,0.1,0,0.2h0.1c5.1,0,9.2,4.1,9.2,9.2 c0,5.1-4.1,9.2-9.2,9.2H19.9c-5.1,0-9.2-4.1-9.2-9.2C10.7,45.4,10.7,45.4,10.7,45.3z M35.3,53.1c0.1,0,0.1,0,0.2,0h49.8 c2.6,0,4.7-2.1,4.7-4.7c0-2.6-2.1-4.7-4.7-4.7h-0.1c0-0.1,0-0.1,0-0.2c0-4.7-3.8-8.6-8.6-8.6c-1.7,0-3.3,0.5-4.7,1.4 c-0.6-0.9-1.2-1.8-2-2.6C70.5,24.6,62.5,20,53.3,20c-9.3,0-17.1,6.3-19.5,14.7c-0.4-0.1-0.8-0.1-1.2-0.1c-1.9,0-3.5,1.6-3.5,3.5 c0,1.9,1.6,3.5,3.5,3.5h3.3c0.1,0,0.1,0,0.2,0C35.3,53.1,35.3,53.1,35.3,53.1z"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!form.username || !form.password) {
      setError("Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.");
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApiService.login(form.username, form.password);

      console.log("Login successful, userData:", userData);

      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: userData.userId,
          username: userData.username, 
          email: userData.email,
          role: userData.role,
        })
      );
      localStorage.setItem("authToken", userData.authToken);

      if (userData.role === "admin" || userData.role === "staff") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (apiError) {
      console.error("Login failed:", apiError);
      let errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      if (apiError.data && apiError.data.message) {
        errorMessage = apiError.data.message;
      } else if (apiError.message) {
        if (apiError.status === 401) {
          errorMessage = "Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.";
        } else if (
          apiError.status === 404 &&
          apiError.message?.toLowerCase().includes("user not found")
        ) {
          errorMessage = "Tài khoản không tồn tại.";
        } else {
          errorMessage = apiError.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-200 via-indigo-200 to-purple-300 relative overflow-hidden">
      <CloudBackground />
      <motion.div
        /* Sun element */ className="absolute top-10 right-10 w-20 h-20 md:w-28 md:h-28 rounded-full bg-yellow-300/40 shadow-xl shadow-yellow-400/30 z-10"
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0.9, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute bottom-0 left-0 w-full h-20 md:h-32 bg-gradient-to-t from-indigo-800/10 to-transparent z-10 opacity-50" />

      <motion.div
        className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 relative z-20 border border-white/30"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
      >
        <div className="text-center">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-1 tracking-tight"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Welcome Back!
          </motion.h1>
          <motion.p
            className="text-gray-600 text-sm"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Sign in to continue your Retrend journey.
          </motion.p>
        </div>

        {error && (
          <motion.div
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm text-center"
            initial={{ opacity: 0, scaleY: 0.8 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* --- MODIFIED: Username Input --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <label
              htmlFor="username"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <div className="relative">
              <input
                type="text" // Keep as text for username
                id="username"
                name="username" // Changed from email to username
                value={form.username} // Bind to form.username
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="Enter your username" // Changed placeholder
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                {/* User Icon */}
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
          {/* --- END USERNAME INPUT --- */}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="Enter your password"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
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
            <div className="text-right mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
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
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {isLoading ? (
                <>
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </motion.div>
        </form>

        <motion.div
          className="text-center text-gray-600 pt-3 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <p>
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
            >
              Sign Up Now
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
