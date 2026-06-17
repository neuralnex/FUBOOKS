import type { Order, Book, OrderStatus, PaymentStatus } from "@/types";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { card } from "@heroui/theme";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { Pagination } from "@/components/Pagination";

// Note: For full chart support, install: npm install recharts
// Using dynamic imports for recharts to avoid build-time dependency
// Card component wrapper using HeroUI theme
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardClasses = card();
  return <div className={`${cardClasses.base()} ${className}`}>{children}</div>;
};

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardClasses = card();
  return <div className={`${cardClasses.header()} ${className}`}>{children}</div>;
};

const CardBody = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardClasses = card();
  return <div className={`${cardClasses.body()} ${className}`}>{children}</div>;
};

const CardFooter = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardClasses = card();
  return <div className={`${cardClasses.footer()} ${className}`}>{children}</div>;
};

// Colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#A4DE6C",
  "#D0ED57",
  "#FF6B6B",
];

const statusColorMap: Record<OrderStatus, string> = {
  processing: "#FFBB28",
  purchased: "#00C49F",
  delivering: "#0088FE",
  delivered: "#8884D8",
};

const paymentStatusColorMap: Record<PaymentStatus, string> = {
  paid: "#00C49F",
  pending: "#FFBB28",
  failed: "#FF6B6B",
};

export default function AdminDashboardPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalRevenue: number;
    totalBooksSold: number;
    ordersByStatus: Record<string, number>;
    ordersByPaymentStatus: Record<string, number>;
    dailyRevenue: Array<{ date: string; revenue: number }>;
    topSellingBooks: Array<{
      bookId: string;
      title: string;
      author: string;
      quantity: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "books">(
    "overview",
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    category: "",
    search: "",
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/dashboard");

      return;
    }

    loadData();
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    } else if (activeTab === "books") {
      loadBooks();
    }
  }, [activeTab, currentPage, filters]);

  const loadData = async () => {
    try {
      // Load stats
      const statsData = await apiService.getAdminStats();

      setStats(statsData);

      // Load initial orders and books
      const [ordersData, booksData] = await Promise.all([
        apiService.getAdminOrdersPaginated(1, itemsPerPage),
        apiService.getBooksPaginated(1, itemsPerPage),
      ]);

      setOrders(ordersData.orders);
      setBooks(booksData.books);
      setTotalPages(Math.max(ordersData.totalPages, booksData.totalPages));
    } catch (error: unknown) {
      alert(`Failed to load admin data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await apiService.getAdminOrdersPaginated(
        currentPage,
        itemsPerPage,
        {
          status: filters.status as any,
          paymentStatus: filters.paymentStatus as any,
          sortBy: "createdAt",
          sortOrder: "DESC",
        },
      );

      setOrders(data.orders);

      setTotalPages(data.totalPages);
    } catch (error: unknown) {
      alert(`Failed to load orders: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const loadBooks = async () => {
    try {
      const data = await apiService.getBooksPaginated(
        currentPage,
        itemsPerPage,
        {
          category: filters.category as any,
          search: filters.search,
          sortBy: "createdAt",
          sortOrder: "DESC",
        },
      );

      setBooks(data.books);

      setTotalPages(data.totalPages);
    } catch (error: unknown) {
      alert(`Failed to load books: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, status);

      await loadOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update order status");
    }
  };

  const getCoverSrc = (coverImage?: string) => {
    if (!coverImage) return undefined;

    return coverImage.startsWith("data:image")
      ? coverImage
      : `data:image/jpeg;base64,${coverImage}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <DefaultLayout>
        <div className="py-8">
          <div className="text-center py-12">
            <p className="text-default-500">Loading admin dashboard...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Prepare chart data
  const statusData = stats?.ordersByStatus
    ? Object.entries(stats.ordersByStatus).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: statusColorMap[status as OrderStatus],
      }))
    : [];

  const paymentStatusData = stats?.ordersByPaymentStatus
    ? Object.entries(stats.ordersByPaymentStatus).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: paymentStatusColorMap[status as PaymentStatus],
      }))
    : [];

  const dailyRevenueData = stats?.dailyRevenue || [];

  const topBooksData =
    stats?.topSellingBooks.map((book, index) => ({
      ...book,
      color: COLORS[index % COLORS.length],
    })) || [];

  return (
    <DefaultLayout>
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className={title()}>Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button
              color={activeTab === "overview" ? "primary" : "default"}
              variant={activeTab === "overview" ? "solid" : "bordered"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </Button>
            <Button
              color={activeTab === "orders" ? "primary" : "default"}
              variant={activeTab === "orders" ? "solid" : "bordered"}
              onClick={() => setActiveTab("orders")}
            >
              Orders ({stats?.totalOrders || 0})
            </Button>
            <Button
              color={activeTab === "books" ? "primary" : "default"}
              variant={activeTab === "books" ? "solid" : "bordered"}
              onClick={() => setActiveTab("books")}
            >
              Books
            </Button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-col items-start">
                  <p className="text-sm font-medium opacity-90">Total Orders</p>
                </CardHeader>
                <CardBody>
                  <div className="text-3xl font-bold">
                    {stats?.totalOrders || 0}
                  </div>
                </CardBody>
                <CardFooter className="text-sm opacity-90">All time</CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-col items-start">
                  <p className="text-sm font-medium opacity-90">
                    Total Revenue
                  </p>
                </CardHeader>
                <CardBody>
                  <div className="text-3xl font-bold">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </div>
                </CardBody>
                <CardFooter className="text-sm opacity-90">All time</CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-col items-start">
                  <p className="text-sm font-medium opacity-90">Books Sold</p>
                </CardHeader>
                <CardBody>
                  <div className="text-3xl font-bold">
                    {stats?.totalBooksSold || 0}
                  </div>
                </CardBody>
                <CardFooter className="text-sm opacity-90">All time</CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-col items-start">
                  <p className="text-sm font-medium opacity-90">
                    Avg. Order Value
                  </p>
                </CardHeader>
                <CardBody>
                  <div className="text-3xl font-bold">
                    {stats?.totalOrders
                      ? formatCurrency(stats.totalRevenue / stats.totalOrders)
                      : formatCurrency(0)}
                  </div>
                </CardBody>
                <CardFooter className="text-sm opacity-90">
                  Per order
                </CardFooter>
              </Card>
            </div>

            <Divider />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Revenue Chart */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    Daily Revenue (Last 7 Days)
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#0088FE"
                          strokeWidth={3}
                          fill="#0088FE"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Order Status Distribution */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    Order Status Distribution
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }: { name?: string; percent?: number }) =>
                            name && percent !== undefined ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                          }
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Status Distribution */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    Payment Status Distribution
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#00C49F" name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Top Selling Books */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Top Selling Books</h3>
                </CardHeader>
                <CardBody>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topBooksData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="title" type="category" width={120} />
                        <Tooltip />
                        <Bar
                          dataKey="quantity"
                          fill="#8884d8"
                          name="Quantity Sold"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Divider />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    color="primary"
                    onClick={() => {
                      setActiveTab("books");
                      setCurrentPage(1);
                    }}
                    className="h-16"
                  >
                    Manage Books
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      setActiveTab("orders");
                      setCurrentPage(1);
                    }}
                    className="h-16"
                  >
                    View All Orders
                  </Button>
                  <Button
                    color="success"
                    onClick={() => navigate("/admin/books/new")}
                    className="h-16"
                  >
                    Add New Book
                  </Button>
                  <Button
                    color="secondary"
                    onClick={() => navigate("/admin/stats/export")}
                    className="h-16"
                  >
                    Export Reports
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Orders Management</h3>
              </CardHeader>
              <CardBody>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <select
                    className="px-4 py-2 border border-default-200 rounded-lg bg-background"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                  >
                    <option value="">All Statuses</option>
                    <option value="processing">Processing</option>
                    <option value="purchased">Purchased</option>
                    <option value="delivering">Delivering</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <select
                    className="px-4 py-2 border border-default-200 rounded-lg bg-background"
                    value={filters.paymentStatus}
                    onChange={(e) =>
                      setFilters({ ...filters, paymentStatus: e.target.value })
                    }
                  >
                    <option value="">All Payment Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  <Button
                    color="primary"
                    onClick={() =>
                      setFilters({
                        status: "",
                        paymentStatus: "",
                        category: "",
                        search: "",
                      })
                    }
                  >
                    Clear Filters
                  </Button>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-content1 rounded-lg p-6 shadow-sm border border-default-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">
                            Order #{order.id.slice(0, 8)}
                          </h4>
                          <p className="text-sm text-default-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-default-500 mt-1">
                            Student: {order.student?.name} (
                            {order.student?.email})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-bold text-xl">
                            {formatCurrency(Number(order.totalAmount))}
                          </p>
                          <div className="flex gap-2 mt-2 justify-end">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium`}
                              style={{
                                backgroundColor:
                                  statusColorMap[order.orderStatus],
                                color: "#fff",
                              }}
                            >
                              {order.orderStatus}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium`}
                              style={{
                                backgroundColor:
                                  paymentStatusColorMap[order.paymentStatus],
                                color: "#fff",
                              }}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm">
                          <strong>Delivery:</strong> {order.deliveryAddress}
                        </p>
                        <p className="text-sm">
                          <strong>Items:</strong> {order.orderItems.length}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <select
                          className="px-3 py-2 rounded-lg border border-default-200 bg-background"
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusUpdate(
                              order.id,
                              e.target.value as OrderStatus,
                            )
                          }
                        >
                          <option value="processing">Processing</option>
                          <option value="purchased">Purchased</option>
                          <option value="delivering">Delivering</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <Button
                          size="sm"
                          variant="bordered"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Divider className="my-6" />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    setCurrentPage(page);
                  }}
                />
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === "books" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Books Management</h3>
              <Button
                color="primary"
                onClick={() => navigate("/admin/books/new")}
              >
                Add New Book
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book) => (
                <Card key={book.id} className="p-4">
                  {getCoverSrc(book.coverImage) && (
                    <img
                      alt={book.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      src={getCoverSrc(book.coverImage)}
                    />
                  )}
                  <CardHeader className="p-0 mb-2">
                    <h4 className="font-semibold text-lg">{book.title}</h4>
                  </CardHeader>
                  <CardBody className="p-0">
                    <p className="text-sm text-default-600">
                      Author: {book.author}
                    </p>
                    <p className="text-primary font-bold text-lg">
                      {formatCurrency(Number(book.price))}
                    </p>
                    <p className="text-xs text-default-500">
                      Category: {book.category} | Stock: {book.stock}
                    </p>
                  </CardBody>
                  <CardFooter className="p-0 mt-3">
                    <div className="flex gap-2">
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
                            confirm(
                              `Are you sure you want to delete "${book.title}"?`,
                            )
                          ) {
                            try {
                              await apiService.deleteBook(book.id);
                              await loadBooks();
                            } catch {
                              alert("Failed to delete book");
                            }
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Divider className="my-6" />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
            />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
