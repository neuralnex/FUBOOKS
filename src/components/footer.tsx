import { Link } from "@heroui/link";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-default-200 bg-content1">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">About FUBOOKS</h3>
            <p className="text-sm text-default-600 mb-4">
              Your trusted book ordering platform for students. We provide
              textbooks, manuals, guides, and past papers with fast delivery and
              secure payments.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link className="text-sm" color="foreground" href="/books">
                  Browse Books
                </Link>
              </li>
              <li>
                <Link className="text-sm" color="foreground" href="/books">
                  Categories
                </Link>
              </li>
              <li>
                <Link className="text-sm" color="foreground" href="/orders">
                  My Orders
                </Link>
              </li>
              <li>
                <Link className="text-sm" color="foreground" href="/dashboard">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link className="text-sm" color="foreground" href="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="text-sm" color="foreground" href="/contact">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link className="text-sm" color="foreground" href="/faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link className="text-sm" color="foreground" href="/shipping">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Connect With Us</h3>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-default-600">
                Email: support@fubooks.com
              </p>
              <p className="text-sm text-default-600">
                Phone: +234 XXX XXX XXXX
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                className="text-default-500 hover:text-primary"
                color="foreground"
                href="#"
              >
                <span className="text-xl">📘</span>
              </Link>
              <Link
                className="text-default-500 hover:text-primary"
                color="foreground"
                href="#"
              >
                <span className="text-xl">🐦</span>
              </Link>
              <Link
                className="text-default-500 hover:text-primary"
                color="foreground"
                href="#"
              >
                <span className="text-xl">📷</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-default-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-default-500">
            © {new Date().getFullYear()} FUBOOKS. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              className="text-sm text-default-500"
              color="foreground"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-sm text-default-500"
              color="foreground"
              href="/terms"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
