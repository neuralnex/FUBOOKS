import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/icons";

export const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCartItemCount = () => {
    if (typeof window === "undefined") return 0;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    return cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
  };

  useEffect(() => {
    // Update cart count on mount and when location changes
    setCartCount(getCartItemCount());

    // Listen for storage changes (when cart is updated in other tabs/windows)
    const handleStorageChange = () => {
      setCartCount(getCartItemCount());
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom cart update events
    const handleCartUpdate = () => {
      setCartCount(getCartItemCount());
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    // Poll for changes (in case localStorage is updated in same tab)
    const interval = setInterval(() => {
      const newCount = getCartItemCount();
      if (newCount !== cartCount) {
        setCartCount(newCount);
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      clearInterval(interval);
    };
  }, [location.pathname]);

  const navItems = isAuthenticated
    ? siteConfig.navItems
        .filter((item) => item.href !== "/login")
        .filter((item) =>
          isAdmin ? item.href !== "/orders" && item.href !== "/cart" : true,
        )
    : siteConfig.navItems.filter(
        (item) => item.href === "/" || item.href === "/books",
      );

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </Link>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                as={RouterLink}
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                to={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex">
          <form className="w-full max-w-xs" onSubmit={handleSearch}>
            <Input
              aria-label="Search books"
              classNames={{
                inputWrapper: "bg-default-100",
                input: "text-sm",
              }}
              placeholder="Search books..."
              startContent={<span className="text-default-400">🔍</span>}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </NavbarItem>

        {!isAdmin && (
          <NavbarItem>
            <Button
              isIconOnly
              as={RouterLink}
              className="relative"
              to="/cart"
              variant="light"
            >
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Button>
          </NavbarItem>
        )}

        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>

        {isAuthenticated ? (
          <>
            <NavbarItem>
              <Link
                as={RouterLink}
                className="text-sm"
                color="foreground"
                to="/profile"
              >
                {user?.name}
              </Link>
            </NavbarItem>
            {isAdmin && (
              <NavbarItem>
                <Link
                  as={RouterLink}
                  className="text-sm"
                  color="primary"
                  to="/admin"
                >
                  Admin
                </Link>
              </NavbarItem>
            )}
            <NavbarItem>
              <Button
                color="danger"
                size="sm"
                variant="light"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <Button
                as={RouterLink}
                color="default"
                size="sm"
                to="/login"
                variant="light"
              >
                Login
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={RouterLink}
                color="primary"
                size="sm"
                to="/register"
                variant="solid"
              >
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        {!isAdmin && (
          <NavbarItem>
            <Button
              isIconOnly
              as={RouterLink}
              className="relative"
              to="/cart"
              variant="light"
            >
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Button>
          </NavbarItem>
        )}
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 mb-4">
          <form onSubmit={handleSearch}>
            <Input
              placeholder="Search books..."
              startContent={<span className="text-default-400">🔍</span>}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <Link as={RouterLink} color="foreground" size="lg" to={item.href}>
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          {isAuthenticated && (
            <>
              {!isAdmin && (
                <NavbarMenuItem>
                  <Link as={RouterLink} color="foreground" size="lg" to="/cart">
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </Link>
                </NavbarMenuItem>
              )}
              <NavbarMenuItem>
                <Link
                  as={RouterLink}
                  color="foreground"
                  size="lg"
                  to="/profile"
                >
                  Profile
                </Link>
              </NavbarMenuItem>
              {isAdmin && (
                <NavbarMenuItem>
                  <Link as={RouterLink} color="primary" size="lg" to="/admin">
                    Admin Panel
                  </Link>
                </NavbarMenuItem>
              )}
              <NavbarMenuItem>
                <Link color="danger" href="#" size="lg" onClick={handleLogout}>
                  Logout
                </Link>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
