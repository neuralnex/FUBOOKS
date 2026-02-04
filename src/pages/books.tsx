import type { Book } from "@/types";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { apiService } from "@/services/api";
import DefaultLayout from "@/layouts/default";
import { title, subtitle } from "@/components/primitives";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await apiService.getBooks();

      setBooks(data);
    } catch {
      alert("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const getCoverSrc = (coverImage?: string) => {
    if (!coverImage) return undefined;

    return coverImage.startsWith("data:image")
      ? coverImage
      : `data:image/jpeg;base64,${coverImage}`;
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || book.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const categories: string[] = [
    "all",
    "Textbook",
    "Manual",
    "Guide",
    "Past Paper",
  ];

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-default-500">Loading books...</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="py-8">
        <div className="mb-8">
          <h1 className={title()}>Browse Books</h1>
          <p className={subtitle({ class: "mt-2" })}>
            Discover and order your textbooks
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            className="flex-1"
            placeholder="Search by title or author..."
            startContent={<span className="text-default-400">🔍</span>}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                color={filterCategory === cat ? "primary" : "default"}
                size="sm"
                variant={filterCategory === cat ? "solid" : "bordered"}
                onClick={() => setFilterCategory(cat)}
              >
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-default-500 text-lg">No books found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Link key={book.id} to={`/books/${book.id}`}>
                <div className="bg-content1 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 h-full flex flex-col">
                  <div className="w-full aspect-[3/4] bg-default-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {getCoverSrc(book.coverImage) ? (
                      <img
                        alt={book.title}
                        className="w-full h-full object-contain"
                        src={getCoverSrc(book.coverImage)}
                      />
                    ) : (
                      <span className="text-default-400 text-sm">No Image</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-default-600 text-sm mb-2">
                    by {book.author}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-primary font-bold text-lg">
                      ₦{Number(book.price).toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        book.stock > 0
                          ? "bg-success-100 text-success"
                          : "bg-danger-100 text-danger"
                      }`}
                    >
                      {book.stock > 0
                        ? `In Stock (${book.stock})`
                        : "Out of Stock"}
                    </span>
                  </div>
                  {book.classFormLevel && (
                    <p className="text-xs text-default-500 mt-2">
                      Level: {book.classFormLevel}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
