import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
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
        <h1 className={title()}>My Profile</h1>

        <div className="max-w-2xl mt-8">
          <div className="bg-content1 rounded-lg p-6 shadow-md">
            <h2 className="font-semibold text-lg mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-default-600">Full Name</label>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div>
                <label className="text-sm text-default-600">Email</label>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-default-600">Registration Number</label>
                <p className="font-semibold">{user.regNumber}</p>
              </div>
              {user.accommodation && (
                <div>
                  <label className="text-sm text-default-600">Accommodation Address</label>
                  <p className="font-semibold">{user.accommodation}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-default-600">Role</label>
                <p className="font-semibold capitalize">{user.role}</p>
              </div>
              <div>
                <label className="text-sm text-default-600">Member Since</label>
                <p className="font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

