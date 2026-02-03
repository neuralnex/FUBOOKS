import type { CartItem } from "@/types";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { apiService } from "@/services/api";

const DELIVERY_FEE = 500;

export default function CheckoutPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [fulfilmentMethod, setFulfilmentMethod] =
    useState<"pickup" | "delivery">("pickup");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        setCart([]);
      }
    }
  }, []);

  const itemsTotal = cart.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0,
  );
  const deliveryFee =
    fulfilmentMethod === "delivery" ? DELIVERY_FEE : 0;
  const grandTotal = itemsTotal + deliveryFee;

  if (!isAuthenticated) {
    return (
      <DefaultLayout>
        <div className="py-8">
          <h1 className={title()}>Checkout</h1>
          <div className="text-center py-12 space-y-4">
            <p className="text-default-500 text-lg">
              Please login to complete your order.
            </p>
            <Button color="primary" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (isAdmin) {
    return (
      <DefaultLayout>
        <div className="py-8">
          <h1 className={title()}>Checkout</h1>
          <div className="text-center py-12 space-y-4">
            <p className="text-default-500 text-lg">
              Admin accounts are for operations only and cannot place orders.
            </p>
            <Button color="primary" onClick={() => navigate("/admin")}>
              Go to Admin Panel
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <DefaultLayout>
        <div className="py-8">
          <h1 className={title()}>Checkout</h1>
          <div className="text-center py-12 space-y-4">
            <p className="text-default-500 text-lg">
              Your cart is empty.
            </p>
            <Button color="primary" onClick={() => navigate("/cart")}>
              Back to Cart
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const handlePlaceOrder = async () => {
    if (
      fulfilmentMethod === "delivery" &&
      (!deliveryAddress || deliveryAddress.length < 10)
    ) {
      showToast(
        "Please enter a valid Eziobodo or Umuchima delivery address (at least 10 characters)",
        "error",
      );

      return;
    }

    const cleanedPhone = phoneNumber.trim();
    if (!cleanedPhone || cleanedPhone.replace(/[^\d+]/g, "").length < 10) {
      showToast("Please enter a valid phone number", "error");

      return;
    }

    setLoading(true);
    try {
      const addressBase =
        fulfilmentMethod === "pickup"
          ? "SUG Building - Pickup Station"
          : deliveryAddress;
      const addressWithPhone = `Phone: ${cleanedPhone}\n${addressBase}`;

      const order = await apiService.createOrder({
        items: cart.map((item) => ({
          bookId: item.book.id,
          quantity: item.quantity,
        })),
        deliveryAddress: addressWithPhone,
        deliveryMethod: fulfilmentMethod,
      });

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      showToast("Order created. Proceed to payment.", "success");
      navigate(`/orders/${order.id}/payment`);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to create order",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="py-8">
        <h1 className={title()}>Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.book.id}
                className="bg-content1 rounded-lg p-4 shadow-md flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {item.book.title}
                  </h3>
                  <p className="text-sm text-default-600">
                    by {item.book.author}
                  </p>
                  <p className="text-primary font-bold mt-2">
                    ₦{Number(item.book.price).toFixed(2)} x{" "}
                    <span className="font-semibold">{item.quantity}</span>
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    ₦
                    {(Number(item.book.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-content1 rounded-lg p-6 shadow-md space-y-4">
              <h2 className="text-xl font-semibold mb-2 text-foreground">
                Delivery & Contact
              </h2>

              <div className="border border-default-200 rounded-lg p-3 space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Delivery Options
                </p>

                <button
                  className={`flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left transition ${
                    fulfilmentMethod === "pickup"
                      ? "border-primary bg-primary/5"
                      : "border-default-200 hover:bg-default-100/60"
                  }`}
                  type="button"
                  onClick={() => setFulfilmentMethod("pickup")}
                >
                  <span
                    className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      fulfilmentMethod === "pickup"
                        ? "border-primary"
                        : "border-default-300"
                    }`}
                  >
                    {fulfilmentMethod === "pickup" && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      Pick up at SUG Building
                    </span>
                    <span className="block text-xs text-default-500">
                      Free – collect your order at the SUG building pickup
                      station
                    </span>
                  </span>
                </button>

                <button
                  className={`flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left transition ${
                    fulfilmentMethod === "delivery"
                      ? "border-primary bg-primary/5"
                      : "border-default-200 hover:bg-default-100/60"
                  }`}
                  type="button"
                  onClick={() => setFulfilmentMethod("delivery")}
                >
                  <span
                    className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      fulfilmentMethod === "delivery"
                        ? "border-primary"
                        : "border-default-300"
                    }`}
                  >
                    {fulfilmentMethod === "delivery" && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      Deliver to Eziobodo / Umuchima
                    </span>
                    <span className="block text-xs text-default-500">
                      ₦{DELIVERY_FEE.toFixed(0)} delivery fee – enter your full
                      Eziobodo or Umuchima address below
                    </span>
                  </span>
                </button>
              </div>

              {fulfilmentMethod === "delivery" && (
                <Input
                  className="mb-1"
                  description="Minimum 10 characters"
                  label="Delivery Address"
                  placeholder="Eziobodo or Umuchima address (e.g. Lodge, room, landmarks)"
                  value={deliveryAddress}
                  variant="bordered"
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              )}

              <Input
                className="mb-1"
                label="Phone Number"
                placeholder="Phone number (e.g. 08012345678)"
                type="tel"
                value={phoneNumber}
                variant="bordered"
                onChange={(e) => setPhoneNumber(e.target.value)}
              />

              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Items total:</span>
                  <span className="text-foreground font-semibold">
                    ₦{itemsTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Delivery:</span>
                  <span className="text-foreground font-semibold">
                    {fulfilmentMethod === "pickup"
                      ? "Free (Pickup)"
                      : `₦${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-default-200">
                  <span className="text-foreground">Order total:</span>
                  <span className="text-primary">
                    ₦{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                color="primary"
                isLoading={loading}
                size="lg"
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}


