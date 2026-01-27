import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
import { title, subtitle } from "@/components/primitives";

export default function DashboardPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DefaultLayout>
      <div className="py-8">
        <div className="mb-8">
          <h1 className={title()}>Welcome back, {user.name}!</h1>
          <p className={subtitle({ class: "mt-2" })}>
            {isAdmin ? "Admin Dashboard" : "Student Dashboard"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-content1 rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-2">Browse Books</h3>
            <p className="text-default-600 text-sm mb-4">
              Explore our collection of textbooks and materials
            </p>
            <Button as={Link} to="/books" color="primary" className="w-full">
              View Books
            </Button>
          </div>

          <div className="bg-content1 rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-2">My Orders</h3>
            <p className="text-default-600 text-sm mb-4">
              Track and manage your book orders
            </p>
            <Button as={Link} to="/orders" color="primary" variant="bordered" className="w-full">
              View Orders
            </Button>
          </div>

          {isAdmin && (
            <div className="bg-content1 rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-2">Admin Panel</h3>
              <p className="text-default-600 text-sm mb-4">
                Manage books, orders, and system settings
              </p>
              <Button as={Link} to="/admin" color="primary" variant="bordered" className="w-full">
              Go to Admin
            </Button>
            </div>
          )}

          <div className="bg-content1 rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-2">Profile</h3>
            <p className="text-default-600 text-sm mb-4">
              View and update your account information
            </p>
            <Button as={Link} to="/profile" color="primary" variant="bordered" className="w-full">
              View Profile
            </Button>
          </div>
        </div>

        <div className="mt-8 bg-content1 rounded-lg p-6 shadow-md">
          <h3 className="font-semibold text-lg mb-4">Account Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-default-600">Name:</span>
              <span className="font-semibold">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-600">Email:</span>
              <span className="font-semibold">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-600">Registration Number:</span>
              <span className="font-semibold">{user.regNumber}</span>
            </div>
            {user.accommodation && (
              <div className="flex justify-between">
                <span className="text-default-600">Accommodation:</span>
                <span className="font-semibold">{user.accommodation}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-default-600">Role:</span>
              <span className="font-semibold capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

