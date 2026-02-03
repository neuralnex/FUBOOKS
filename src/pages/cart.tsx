import type { CartItem } from "@/types";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@heroui/button";

import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function CartPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading] = useState(false);

  const getCoverSrc = (coverImage?: string) => {
    if (!coverImage) return undefined;

    return coverImage.startsWith("data:image")
      ? coverImage
      : `data:image/jpeg;base64,${coverImage}`;
  };

  // Reload cart on mount and when navigating to this page
  useEffect(() => {
    loadCart();
  }, [location.pathname]);

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
    // Dispatch custom event to update navbar cart count
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (bookId: string) => {
    const updatedCart = cart.filter((item) => item.book.id !== bookId);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    // Dispatch custom event to update navbar cart count
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const clearCart = () => {
    if (confirm("Are you sure you want to remove all items from your cart?")) {
      setCart([]);
      localStorage.removeItem("cart");
      // Dispatch custom event to update navbar cart count
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const itemsTotal = cart.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0,
  );

  const goToCheckout = () => {
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

    navigate("/checkout");
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
        <div className="flex justify-between items-center mb-8">
          <h1 className={title()}>Shopping Cart</h1>
          <Button
            color="danger"
            variant="bordered"
            size="sm"
            onClick={clearCart}
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.book.id}
                className="bg-content1 rounded-lg p-4 shadow-md flex flex-col sm:flex-row gap-4"
              >
                {getCoverSrc(item.book.coverImage) && (
                  <img
                    alt={item.book.title}
                    className="w-24 h-24 object-cover rounded flex-shrink-0"
                    src={getCoverSrc(item.book.coverImage)}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{item.book.title}</h3>
                  <p className="text-sm text-default-600">
                    by {item.book.author}
                  </p>
                  <p className="text-primary font-bold mt-2">
                    ₦{Number(item.book.price).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
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
                    <span className="w-12 text-center text-foreground font-semibold">{item.quantity}</span>
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
                  <p className="text-sm font-semibold text-foreground">
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
              <h2 className="text-xl font-semibold mb-2 text-foreground">
                Cart Summary
              </h2>

              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Items total:</span>
                  <span className="text-foreground font-semibold">
                    ₦{itemsTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                color="primary"
                isLoading={loading}
                size="lg"
                onClick={goToCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
