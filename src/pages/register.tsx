import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    regNumber: "",
    password: "",
    confirmPassword: "",
    accommodation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");

      return;
    }

    if (formData.regNumber.length !== 11 || !/^\d+$/.test(formData.regNumber)) {
      setError("Registration number must be exactly 11 digits");

      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        regNumber: formData.regNumber,
        password: formData.password,
        accommodation: formData.accommodation,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md bg-content1 rounded-lg shadow-lg p-6">
          <div className="flex flex-col gap-1 mb-6">
            <h1 className={title({ size: "md" })}>Create Account</h1>
            <p className="text-small text-default-500">
              Join FUBOOKS to order your books
            </p>
          </div>
          <div>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-danger-50 text-danger text-sm">
                  {error}
                </div>
              )}

              <Input
                required
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                variant="bordered"
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <Input
                required
                label="Email"
                placeholder="Enter your email"
                type="email"
                value={formData.email}
                variant="bordered"
                onChange={(e) => handleChange("email", e.target.value)}
              />

              <Input
                required
                description="Must be exactly 11 digits"
                label="Registration Number"
                maxLength={11}
                placeholder="Enter 11-digit registration number"
                value={formData.regNumber}
                variant="bordered"
                onChange={(e) => handleChange("regNumber", e.target.value)}
              />

              <Input
                required
                label="Accommodation Address"
                placeholder="Enter your accommodation address"
                value={formData.accommodation}
                variant="bordered"
                onChange={(e) => handleChange("accommodation", e.target.value)}
              />

              <Input
                required
                endContent={
                  <button
                    className="text-xs text-default-400 hover:text-foreground focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                }
                label="Password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                variant="bordered"
                onChange={(e) => handleChange("password", e.target.value)}
              />

              <Input
                required
                endContent={
                  <button
                    className="text-xs text-default-400 hover:text-foreground focus:outline-none"
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                }
                label="Confirm Password"
                placeholder="Confirm your password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                variant="bordered"
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
              />

              <Button
                className="w-full"
                color="primary"
                isLoading={loading}
                size="lg"
                type="submit"
              >
                Register
              </Button>

              <div className="text-center text-small">
                <span>Already have an account? </span>
                <Link className="text-primary hover:underline" to="/login">
                  Login here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
