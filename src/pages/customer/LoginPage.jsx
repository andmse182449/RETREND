import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApiService from "../../services/AuthApiService"; // Adjust path as needed

export default function LoginPage() {
  // The login API endpoint expects 'username', but your form uses 'email'.
  // We'll send the 'email' field as 'username' to the API.
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setIsLoading(true);

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      // Assuming the 'email' field from your form should be used as 'username' for the login API
      const userData = await authApiService.login(form.email, form.password);
      console.log("Login successful:", userData);

      // Store user information and token
      // The API returns: { userId, username, email, role, status, authToken }
      localStorage.setItem("user", JSON.stringify({
        userId: userData.userId,
        username: userData.username,
        email: userData.email, // This is the email confirmed by the API
        role: userData.role,
        status: userData.status,
      }));
      localStorage.setItem("authToken", userData.authToken); // Store the auth token separately or as part of the user object

      // Navigate based on role
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/"); // Navigate to a general dashboard or home page for other roles
      }
    } catch (apiError) {
      console.error("Login failed:", apiError);
      // Use the error message from the API if available, otherwise a generic one
      setError(apiError.data?.message || apiError.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex justify-center items-start pt-20 bg-beige px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center">
          Sign In
        </h1>
        {error && <p className="text-red-600 text-center py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address / Username
            </label>
            <input
              type="text" // Changed to text to be more generic for username, but email type offers some validation
              id="email"
              name="email" // This will be sent as 'username' to the API
              value={form.email}
              onChange={handleChange}
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
              placeholder="you@example.com or your_username"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading} // Disable button while loading
            className="w-full bg-gray-900 text-white py-3 rounded-md font-semibold hover:bg-gray-700 transition disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup" // Assuming you have a /signup route for registration
            className="text-gray-900 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}