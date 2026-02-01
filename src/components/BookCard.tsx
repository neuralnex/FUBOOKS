import type { Book } from "@/types";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface BookCardProps {
  book: Book;
  onCartUpdate?: () => void;
}

export function BookCard({ book, onCartUpdate }: BookCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const getCoverSrc = (coverImage?: string) => {
    if (!coverImage) return undefined;

    return coverImage.startsWith("data:image")
      ? coverImage
      : `data:image/jpeg;base64,${coverImage}`;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");

      return;
    }

    if (isAdmin) {
      alert("Admin accounts cannot add items to cart");

      return;
    }

    if (book.stock < quantity) {
      alert("Insufficient stock");

      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = existingCart.find(
      (item: any) => item.book.id === book.id,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      existingCart.push({ book, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    // Dispatch custom event to update navbar cart count
    window.dispatchEvent(new Event("cartUpdated"));
    setAddingToCart(true);
    setTimeout(() => {
      setAddingToCart(false);
      if (onCartUpdate) {
        onCartUpdate();
      }
      showToast("Book added to cart successfully! 🎉", "success");
      setQuantity(1);
    }, 500);
  };

  const handleQuantityChange = (change: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newQuantity = quantity + change;

    if (newQuantity >= 1 && newQuantity <= book.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Link
      className="bg-content1 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full"
      to={`/books/${book.id}`}
    >
      <div className="w-full aspect-[3/4] bg-default-100 flex items-center justify-center overflow-hidden">
        {getCoverSrc(book.coverImage) ? (
          <img
            alt={book.title}
            className="w-full h-full object-contain"
            src={getCoverSrc(book.coverImage)}
          />
        ) : (
          <span className="text-default-400 text-xs">No Image</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
          {book.title}
        </h3>
        <p className="text-xs text-default-600 mb-2">{book.author}</p>
        <p className="text-primary font-bold mb-3">
          ₦{Number(book.price).toFixed(2)}
        </p>

        <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-success-100 text-success px-2 py-0.5">
            <span className="text-[8px]">●</span> SUG pickup
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary px-2 py-0.5">
            Eziobodo / Umuchima delivery
          </span>
        </div>

        {book.stock > 0 && !isAdmin && (
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-center gap-3">
              <Button
                isIconOnly
                isDisabled={quantity <= 1}
                size="sm"
                variant="bordered"
                onClick={(e) => handleQuantityChange(-1, e)}
              >
                -
              </Button>
              <span className="w-8 text-center text-sm font-semibold text-foreground">
                {quantity}
              </span>
              <Button
                isIconOnly
                isDisabled={quantity >= book.stock}
                size="sm"
                variant="bordered"
                onClick={(e) => handleQuantityChange(1, e)}
              >
                +
              </Button>
            </div>
            <Button
              className="w-full"
              color="primary"
              isDisabled={quantity > book.stock}
              isLoading={addingToCart}
              size="sm"
              onClick={handleAddToCart}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        )}

        <div className="mt-2 flex justify-center">
          <span
            className={`text-xs px-2 py-1 rounded ${
              book.stock > 0
                ? "bg-success-100 text-success"
                : "bg-danger-100 text-danger"
            }`}
          >
            {book.stock > 0 ? `In Stock (${book.stock})` : "Out of Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
