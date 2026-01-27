import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function LoginPage() {
  const [emailOrRegNumber, setEmailOrRegNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(emailOrRegNumber, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
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
            <h1 className={title({ size: "md" })}>Login to FUBOOKS</h1>
            <p className="text-small text-default-500">
              Enter your credentials to access your account
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
                label="Email or Registration Number"
                placeholder="Enter your email or registration number"
                value={emailOrRegNumber}
                variant="bordered"
                onChange={(e) => setEmailOrRegNumber(e.target.value)}
              />

              <Input
                required
                label="Password"
                placeholder="Enter your password"
                type="password"
                value={password}
                variant="bordered"
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                className="w-full"
                color="primary"
                isLoading={loading}
                size="lg"
                type="submit"
              >
                Login
              </Button>

              <div className="text-center text-small">
                <span>Don&apos;t have an account? </span>
                <Link className="text-primary hover:underline" to="/register">
                  Register here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
