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
  const [loading, setLoading] = useState(false);

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

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0,
  );

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

    if (!deliveryAddress || deliveryAddress.length < 10) {
      alert("Please enter a valid delivery address (at least 10 characters)");

      return;
    }

    setLoading(true);
    try {
      const order = await apiService.createOrder({
        items: cart.map((item) => ({
          bookId: item.book.id,
          quantity: item.quantity,
        })),
        deliveryAddress,
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
            <div className="bg-content1 rounded-lg p-6 shadow-md sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <Input
                className="mb-4"
                description="Minimum 10 characters"
                label="Delivery Address"
                placeholder="Enter your delivery address"
                value={deliveryAddress}
                variant="bordered"
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₦{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">
                    ₦{totalAmount.toFixed(2)}
                  </span>
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
