import type { Order } from "@/types";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@heroui/button";

import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      const data = await apiService.getOrders();

      setOrders(data);
    } catch {
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-success";
      case "delivering":
        return "text-primary";
      case "purchased":
        return "text-warning";
      default:
        return "text-default";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-success";
      case "pending":
        return "text-warning";
      case "failed":
        return "text-danger";
      default:
        return "text-default";
    }
  };

  if (!isAuthenticated) {
    return (
      <DefaultLayout>
        <div className="text-center py-12">
          <p className="text-default-500 text-lg mb-4">
            Please login to view your orders
          </p>
          <Button as={Link} color="primary" to="/login">
            Login
          </Button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="py-8">
        <h1 className={title()}>My Orders</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-default-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-default-500 text-lg mb-4">
              You have no orders yet
            </p>
            <Button as={Link} color="primary" to="/books">
              Browse Books
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-8">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-content1 rounded-lg p-6 shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-default-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold text-xl">
                      ₦{order.totalAmount.toFixed(2)}
                    </p>
                    <p
                      className={`text-sm ${getPaymentStatusColor(order.paymentStatus)}`}
                    >
                      Payment: {order.paymentStatus}
                    </p>
                    <p
                      className={`text-sm ${getStatusColor(order.orderStatus)}`}
                    >
                      Status: {order.orderStatus}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-default-600">
                    <strong>Delivery Address:</strong> {order.deliveryAddress}
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.book.title} x {item.quantity}
                        </span>
                        <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.paymentStatus === "pending" && (
                  <Button
                    as={Link}
                    color="primary"
                    size="sm"
                    to={`/orders/${order.id}/payment`}
                  >
                    Complete Payment
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
