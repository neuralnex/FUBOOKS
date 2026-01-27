import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Book, BookCategory } from "@/types";

export default function AdminBookFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const [formState, setFormState] = useState<{
    title: string;
    author: string;
    price: string;
    category: BookCategory | "";
    classFormLevel: string;
    stock: string;
  }>({
    title: "",
    author: "",
    price: "",
    category: "",
    classFormLevel: "",
    stock: "",
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/dashboard");
      return;
    }

    if (isEdit && id) {
      loadBook(id);
    } else {
      setInitialLoading(false);
    }
  }, [isAuthenticated, isAdmin, isEdit, id, navigate]);

  const loadBook = async (bookId: string) => {
    try {
      const book: Book = await apiService.getBookById(bookId);
      setFormState({
        title: book.title,
        author: book.author,
        price: String(book.price),
        category: book.category,
        classFormLevel: book.classFormLevel || "",
        stock: String(book.stock),
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load book");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", formState.title);
      formData.append("author", formState.author);
      formData.append("price", formState.price);
      if (formState.category) {
        formData.append("category", formState.category);
      }
      if (formState.classFormLevel) {
        formData.append("classFormLevel", formState.classFormLevel);
      }
      formData.append("stock", formState.stock);
      if (coverFile) {
        formData.append("coverImage", coverFile);
      }

      if (isEdit && id) {
        await apiService.updateBook(id, formData);
      } else {
        await apiService.createBook(formData);
      }

      navigate("/admin");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save book");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (initialLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-default-500">Loading...</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="py-8 max-w-2xl mx-auto">
        <Button variant="light" className="mb-4" onClick={() => navigate("/admin")}>
          ← Back to Admin
        </Button>

        <h1 className={title()}>{isEdit ? "Edit Book" : "Add New Book"}</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <p className="text-danger text-sm">{error}</p>}

          <Input
            label="Title"
            name="title"
            value={formState.title}
            onChange={handleChange}
            required
          />

          <Input
            label="Author"
            name="author"
            value={formState.author}
            onChange={handleChange}
            required
          />

          <Input
            type="number"
            label="Price (₦)"
            name="price"
            value={formState.price}
            onChange={handleChange}
            required
            min={0}
            step="0.01"
          />

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              name="category"
              value={formState.category}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, category: e.target.value as BookCategory | "" }))
              }
              required
              className="w-full px-3 py-2 rounded-md border border-default-200 bg-background text-foreground"
            >
              <option value="">Select category</option>
              <option value="Textbook">Textbook</option>
              <option value="Manual">Manual</option>
              <option value="Guide">Guide</option>
              <option value="Past Paper">Past Paper</option>
            </select>
          </div>

          <Input
            label="Class/Form Level (optional)"
            name="classFormLevel"
            value={formState.classFormLevel}
            onChange={handleChange}
          />

          <Input
            type="number"
            label="Stock"
            name="stock"
            value={formState.stock}
            onChange={handleChange}
            required
            min={0}
            step="1"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-default-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/80"
            />
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={loading}
          >
            {isEdit ? "Save Changes" : "Create Book"}
          </Button>
        </form>
      </div>
    </DefaultLayout>
  );
}


