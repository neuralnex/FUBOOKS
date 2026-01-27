import type { Book } from "@/types";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";

import { title, subtitle } from "@/components/primitives";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewArrivals();
  }, []);

  const loadNewArrivals = async () => {
    try {
      const books = await apiService.getBooks();
      const sorted = [...books].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setNewArrivals(sorted.slice(0, 8));
    } catch {
      alert("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for subscribing! We'll keep you updated.");
    setNewsletterEmail("");
  };

  const categories = [
    {
      name: "Textbooks",
      description: "Academic textbooks for all levels",
      image: "📚",
      href: "/books?category=Textbook",
    },
    {
      name: "Manuals",
      description: "Study manuals and guides",
      image: "📖",
      href: "/books?category=Manual",
    },
    {
      name: "Guides",
      description: "Study guides and reference materials",
      image: "📘",
      href: "/books?category=Guide",
    },
    {
      name: "Past Papers",
      description: "Past examination papers",
      image: "📝",
      href: "/books?category=Past Paper",
    },
  ];

  const staffPicks = [
    {
      title: "Bestsellers",
      description: "Most popular books this month",
      books: newArrivals.slice(0, 4),
    },
    {
      title: "Recommended for You",
      description: "Curated selection based on your interests",
      books: newArrivals.slice(4, 8),
    },
  ];

  return (
    <DefaultLayout>
      <section className="flex flex-col md:flex-row items-center justify-between gap-8 py-12 md:py-20">
        <div className="flex-1">
          <h1 className={title({ size: "lg" })}>
            Welcome to{" "}
            <span className={title({ color: "violet", size: "lg" })}>
              FUBOOKS
            </span>
          </h1>
          <p className={subtitle({ class: "mt-4 text-lg" })}>
            Your trusted book ordering platform. Discover textbooks, manuals,
            guides, and past papers. Fast delivery, secure payments, and
            excellent service.
          </p>
          <div className="flex gap-3 mt-6">
            {isAuthenticated ? (
              isAdmin ? (
                <Button
                  as={Link}
                  className={buttonStyles({
                    color: "primary",
                    radius: "full",
                    variant: "shadow",
                    size: "lg",
                  })}
                  to="/admin"
                >
                  Go to Admin Panel
                </Button>
              ) : (
                <Button
                  as={Link}
                  className={buttonStyles({
                    color: "primary",
                    radius: "full",
                    variant: "shadow",
                    size: "lg",
                  })}
                  to="/books"
                >
                  Shop Now
                </Button>
              )
            ) : (
              <>
                <Button
                  as={Link}
                  className={buttonStyles({
                    color: "primary",
                    radius: "full",
                    variant: "shadow",
                    size: "lg",
                  })}
                  to="/register"
                >
                  Get Started
                </Button>
                <Button
                  as={Link}
                  className={buttonStyles({
                    variant: "bordered",
                    radius: "full",
                    size: "lg",
                  })}
                  to="/login"
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="w-32 h-40 bg-gradient-to-br from-primary-200 to-primary-500 rounded-lg shadow-lg transform rotate-3" />
              <div className="w-32 h-40 bg-gradient-to-br from-secondary-200 to-secondary-500 rounded-lg shadow-lg transform -rotate-3 mt-8" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-40 bg-gradient-to-br from-success-200 to-success-500 rounded-lg shadow-lg transform rotate-6" />
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className={title({ size: "md" })}>Shop by Category</h2>
        <p className={subtitle({ class: "mt-2" })}>
          Browse our collection by category
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {categories.map((category) => (
            <Link key={category.name} to={category.href}>
              <div className="bg-content1 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center h-full">
                <div className="text-6xl mb-4">{category.image}</div>
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-sm text-default-600 mb-4">
                  {category.description}
                </p>
                <Button color="primary" size="sm" variant="light">
                  Browse →
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={title({ size: "md" })}>New Arrivals</h2>
            <p className={subtitle({ class: "mt-2" })}>
              Latest additions to our collection
            </p>
          </div>
          <Button as={Link} color="primary" to="/books" variant="light">
            View All →
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-default-500">Loading books...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="flex gap-4 pb-4"
              style={{ minWidth: "max-content" }}
            >
              {newArrivals.map((book) => (
                <Link
                  key={book.id}
                  className="flex-shrink-0 w-48 bg-content1 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  to={`/books/${book.id}`}
                >
                  {book.coverImage ? (
                    <img
                      alt={book.title}
                      className="w-full h-64 object-cover"
                      src={`data:image/jpeg;base64,${book.coverImage}`}
                    />
                  ) : (
                    <div className="w-full h-64 bg-default-200 flex items-center justify-center">
                      <span className="text-default-400">No Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-default-600 mb-2">
                      {book.author}
                    </p>
                    <p className="text-primary font-bold">
                      ₦{Number(book.price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="py-12">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Special Offer: Free Delivery on Orders Over ₦5,000
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Get your books delivered to your accommodation at no extra cost!
          </p>
          <Button
            as={Link}
            className="bg-white text-primary"
            color="default"
            size="lg"
            to="/books"
            variant="solid"
          >
            Shop Now
          </Button>
        </div>
      </section>

      <section className="py-12">
        <h2 className={title({ size: "md" })}>
          Staff Picks & Curated Collections
        </h2>
        <p className={subtitle({ class: "mt-2" })}>
          Handpicked selections for you
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {staffPicks.map((collection, idx) => (
            <div key={idx} className="bg-content1 rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-xl mb-2">{collection.title}</h3>
              <p className="text-sm text-default-600 mb-4">
                {collection.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {collection.books.map((book) => (
                  <Link key={book.id} to={`/books/${book.id}`}>
                    {book.coverImage ? (
                      <img
                        alt={book.title}
                        className="w-full h-32 object-cover rounded"
                        src={`data:image/jpeg;base64,${book.coverImage}`}
                      />
                    ) : (
                      <div className="w-full h-32 bg-default-200 rounded flex items-center justify-center">
                        <span className="text-xs text-default-400">
                          No Image
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-2xl mx-auto text-center bg-content1 rounded-lg p-8 shadow-md">
          <h2 className={title({ size: "md" })}>Stay Updated</h2>
          <p className={subtitle({ class: "mt-2" })}>
            Subscribe to our newsletter for new arrivals, special offers, and
            updates
          </p>
          <form
            className="flex gap-3 mt-6 max-w-md mx-auto"
            onSubmit={handleNewsletterSubmit}
          >
            <Input
              required
              className="flex-1"
              placeholder="Enter your email"
              type="email"
              value={newsletterEmail}
              variant="bordered"
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <Button color="primary" size="lg" type="submit">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </DefaultLayout>
  );
}
