import type { Order, Book } from "@/types";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";

import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "books">("books");

  const getCoverSrc = (coverImage?: string) => {
    if (!coverImage) return undefined;
    return coverImage.startsWith("data:image")
      ? coverImage
      : `data:image/jpeg;base64,${coverImage}`;
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/dashboard");

      return;
    }
    loadData();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadData = async () => {
    try {
      const [ordersData, booksData] = await Promise.all([
        apiService.getAdminOrders(),
        apiService.getBooks(),
      ]);

      setOrders(ordersData);
      setBooks(booksData);
    } catch {
      alert("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update order status");
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <DefaultLayout>
      <div className="py-8">
        <h1 className={title()}>Admin Panel</h1>

        <div className="flex gap-4 mb-6 mt-6">
          <Button
            color={activeTab === "orders" ? "primary" : "default"}
            variant={activeTab === "orders" ? "solid" : "bordered"}
            onClick={() => setActiveTab("orders")}
          >
            Orders ({orders.length})
          </Button>
          <Button
            color={activeTab === "books" ? "primary" : "default"}
            variant={activeTab === "books" ? "solid" : "bordered"}
            onClick={() => setActiveTab("books")}
          >
            Books ({books.length})
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-default-500">Loading...</p>
          </div>
        ) : activeTab === "orders" ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-content1 rounded-lg p-6 shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-default-500">
                      Student: {order.student?.name} ({order.student?.email})
                    </p>
                    <p className="text-sm text-default-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold text-xl">
                      ₦{Number(order.totalAmount).toFixed(2)}
                    </p>
                    <p className="text-sm">Status: {order.orderStatus}</p>
                    <p className="text-sm">Payment: {order.paymentStatus}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm">
                    <strong>Delivery:</strong> {order.deliveryAddress}
                  </p>
                </div>

                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 rounded-lg border border-default-200 bg-background"
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleStatusUpdate(order.id, e.target.value)
                    }
                  >
                    <option value="processing">Processing</option>
                    <option value="purchased">Purchased</option>
                    <option value="delivering">Delivering</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              className="mb-4"
              color="primary"
              onClick={() => navigate("/admin/books/new")}
            >
              Add New Book
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-content1 rounded-lg p-4 shadow-md"
                >
                  {getCoverSrc(book.coverImage) && (
                    <img
                      alt={book.title}
                      className="w-full h-32 object-cover rounded mb-2"
                      src={getCoverSrc(book.coverImage)}
                    />
                  )}
                  <h3 className="font-semibold">{book.title}</h3>
                  <p className="text-sm text-default-600">{book.author}</p>
                  <p className="text-primary font-bold">
                    ₦{Number(book.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-default-500">
                    Stock: {book.stock}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      onClick={() => navigate(`/admin/books/${book.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      variant="light"
                      onClick={async () => {
                        if (
                          confirm("Are you sure you want to delete this book?")
                        ) {
                          try {
                            await apiService.deleteBook(book.id);
                            loadData();
                          } catch {
                            alert("Failed to delete book");
                          }
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
