import type { Order } from "@/types";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";

import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");

      return;
    }
    if (id) {
      loadOrder();
    }
  }, [id, isAuthenticated, navigate]);

  const loadOrder = async () => {
    try {
      const data = await apiService.getOrderById(id!);

      setOrder(data);
    } catch {
      alert("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleCashierPayment = async () => {
    if (!order) return;

    setProcessing(true);
    try {
      const response = await apiService.initiateCashierPayment(order.id);

      if (response.cashierUrl) {
        window.location.href = response.cashierUrl;
      } else {
        alert("Payment URL not available. Please try again.");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="text-center py-12">
          <p className="text-default-500">Loading payment details...</p>
        </div>
      </DefaultLayout>
    );
  }

  if (!order) {
    return (
      <DefaultLayout>
        <div className="text-center py-12">
          <p className="text-default-500 text-lg mb-4">Order not found</p>
          <Button onClick={() => navigate("/orders")}>Back to Orders</Button>
        </div>
      </DefaultLayout>
    );
  }

  if (order.paymentStatus === "paid") {
    return (
      <DefaultLayout>
        <div className="py-8">
          <div className="text-center py-12">
            <div className="text-success text-4xl mb-4">✓</div>
            <h1 className={title()}>Payment Successful!</h1>
            <p className="text-default-600 mt-4 mb-8">
              Your order has been paid successfully.
            </p>
            <Button color="primary" onClick={() => navigate("/orders")}>
              View Orders
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="py-8">
        <h1 className={title()}>Complete Payment</h1>

        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-content1 rounded-lg p-6 shadow-md mb-6">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-semibold">{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="text-primary font-bold text-xl">
                  ₦{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-content1 rounded-lg p-6 shadow-md">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <p className="text-default-600 mb-6">
              Click the button below to proceed with OPay payment
            </p>
            <Button
              className="w-full"
              color="primary"
              isLoading={processing}
              size="lg"
              onClick={handleCashierPayment}
            >
              {processing ? "Processing..." : "Pay with OPay"}
            </Button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
