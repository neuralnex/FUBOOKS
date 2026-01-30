import type { CartItem } from "@/types";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function CartPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [fulfilmentMethod, setFulfilmentMethod] = useState<
    "pickup" | "delivery"
  >("pickup");
  const [loading, setLoading] = useState(false);

  const DELIVERY_FEE = 500;

  const getCoverSrc = (coverImage?: string) => {
    if (!coverImage) return undefined;

    return coverImage.startsWith("data:image")
      ? coverImage
      : `data:image/jpeg;base64,${coverImage}`;
  };

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");

    setCart(savedCart);
  };

  const updateQuantity = (bookId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(bookId);

      return;
    }
    const updatedCart = cart.map((item) =>
      item.book.id === bookId ? { ...item, quantity: newQuantity } : item,
    );

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (bookId: string) => {
    const updatedCart = cart.filter((item) => item.book.id !== bookId);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const itemsTotal = cart.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0,
  );

  const deliveryFee = fulfilmentMethod === "delivery" ? DELIVERY_FEE : 0;
  const grandTotal = itemsTotal + deliveryFee;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login");

      return;
    }

    if (isAdmin) {
      alert(
        "Admin accounts cannot place orders. Use a student account to checkout.",
      );

      return;
    }

    if (
      fulfilmentMethod === "delivery" &&
      (!deliveryAddress || deliveryAddress.length < 10)
    ) {
      alert(
        "Please enter a valid Eziobodo or Umuchima delivery address (at least 10 characters)",
      );

      return;
    }

    setLoading(true);
    try {
      const order = await apiService.createOrder({
        items: cart.map((item) => ({
          bookId: item.book.id,
          quantity: item.quantity,
        })),
        deliveryAddress:
          fulfilmentMethod === "pickup"
            ? "SUG Building - Pickup Station"
            : deliveryAddress,
        deliveryMethod: fulfilmentMethod,
      });

      localStorage.removeItem("cart");
      setCart([]);

      navigate(`/orders/${order.id}/payment`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <DefaultLayout>
        <div className="py-8">
          <h1 className={title()}>Shopping Cart</h1>
          <div className="text-center py-12">
            <p className="text-default-500 text-lg mb-4">
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
          <h1 className={title()}>Shopping Cart</h1>
          <div className="text-center py-12">
            <p className="text-default-500 text-lg mb-4">Your cart is empty</p>
            <Button color="primary" onClick={() => navigate("/books")}>
              Browse Books
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="py-8">
        <h1 className={title()}>Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.book.id}
                className="bg-content1 rounded-lg p-4 shadow-md flex gap-4"
              >
                {getCoverSrc(item.book.coverImage) && (
                  <img
                    alt={item.book.title}
                    className="w-24 h-24 object-cover rounded"
                    src={getCoverSrc(item.book.coverImage)}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.book.title}</h3>
                  <p className="text-sm text-default-600">
                    by {item.book.author}
                  </p>
                  <p className="text-primary font-bold mt-2">
                    ₦{Number(item.book.price).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      onClick={() =>
                        updateQuantity(item.book.id, item.quantity - 1)
                      }
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <Button
                      isDisabled={item.quantity >= item.book.stock}
                      size="sm"
                      variant="bordered"
                      onClick={() =>
                        updateQuantity(item.book.id, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-sm font-semibold">
                    ₦{(Number(item.book.price) * item.quantity).toFixed(2)}
                  </p>
                  <Button
                    color="danger"
                    size="sm"
                    variant="light"
                    onClick={() => removeItem(item.book.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-content1 rounded-lg p-6 shadow-md sticky top-4 space-y-4">
              <h2 className="text-xl font-semibold mb-2">Order Summary</h2>

              <div className="border border-default-200 rounded-lg p-3 space-y-3">
                <p className="text-sm font-semibold text-default-700">
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
                    <span className="block text-sm font-semibold">
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
                    <span className="block text-sm font-semibold">
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

              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-sm">
                  <span>Items total:</span>
                  <span>₦{itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery:</span>
                  <span>
                    {fulfilmentMethod === "pickup"
                      ? "Free (Pickup)"
                      : `₦${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Order total:</span>
                  <span className="text-primary">₦{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="space-y-2">
                  <p className="text-sm text-default-600 text-center mb-2">
                    Please login to proceed with checkout
                  </p>
                  <Button
                    className="w-full"
                    color="primary"
                    size="lg"
                    onClick={() => navigate("/login")}
                  >
                    Login to Checkout
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  color="primary"
                  isLoading={loading}
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
