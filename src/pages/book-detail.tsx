import type { Book } from "@/types";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";

import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    try {
      const data = await apiService.getBookById(id!);

      setBook(data);
    } catch {
      alert("Failed to load book");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");

      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = existingCart.find(
      (item: any) => item.book.id === book?.id,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      existingCart.push({ book, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    setAddingToCart(true);
    setTimeout(() => {
      setAddingToCart(false);
      navigate("/cart");
    }, 500);
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-default-500">Loading book details...</p>
        </div>
      </DefaultLayout>
    );
  }

  if (!book) {
    return (
      <DefaultLayout>
        <div className="text-center py-12">
          <p className="text-default-500 text-lg">Book not found</p>
          <Button className="mt-4" onClick={() => navigate("/books")}>
            Back to Books
          </Button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="py-8">
        <Button
          className="mb-4"
          variant="light"
          onClick={() => navigate("/books")}
        >
          ← Back to Books
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {book.coverImage ? (
              <img
                alt={book.title}
                className="w-full rounded-lg shadow-lg"
                src={`data:image/jpeg;base64,${book.coverImage}`}
              />
            ) : (
              <div className="w-full h-96 bg-default-200 rounded-lg flex items-center justify-center">
                <span className="text-default-400">No Image Available</span>
              </div>
            )}
          </div>

          <div>
            <h1 className={title({ size: "lg" })}>{book.title}</h1>
            <p className="text-default-600 text-lg mt-2">by {book.author}</p>

            <div className="mt-6 space-y-4">
              <div>
                <span className="text-default-500">Price:</span>
                <span className="text-primary font-bold text-2xl ml-2">
                  ₦{Number(book.price).toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-default-500">Category:</span>
                <span className="ml-2">{book.category}</span>
              </div>

              {book.classFormLevel && (
                <div>
                  <span className="text-default-500">Level:</span>
                  <span className="ml-2">{book.classFormLevel}</span>
                </div>
              )}

              <div>
                <span className="text-default-500">Stock:</span>
                <span
                  className={`ml-2 font-semibold ${
                    book.stock > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {book.stock > 0 ? `${book.stock} available` : "Out of Stock"}
                </span>
              </div>
            </div>

            {book.stock > 0 && !isAdmin && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-default-500">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      size="sm"
                      variant="bordered"
                      onClick={() =>
                        setQuantity(Math.min(book.stock, quantity + 1))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  color="primary"
                  isDisabled={quantity > book.stock}
                  isLoading={addingToCart}
                  size="lg"
                  onClick={handleAddToCart}
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
