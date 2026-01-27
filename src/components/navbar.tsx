import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  const [, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const navItems = isAuthenticated
    ? siteConfig.navItems
        .filter((item) => item.href !== "/login")
        .filter((item) => (isAdmin ? item.href !== "/orders" && item.href !== "/cart" : true))
    : siteConfig.navItems.filter((item) => item.href === "/" || item.href === "/books");

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" onMenuOpenChange={setIsMenuOpen}>
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
          <form onSubmit={handleSearch} className="w-full max-w-xs">
            <Input
              aria-label="Search books"
              classNames={{
                inputWrapper: "bg-default-100",
                input: "text-sm",
              }}
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={
                <span className="text-default-400">🔍</span>
              }
              type="search"
            />
          </form>
        </NavbarItem>

        {!isAdmin && (
          <NavbarItem>
            <Button
              as={RouterLink}
              to="/cart"
              variant="light"
              isIconOnly
              className="relative"
            >
              <span className="text-xl">🛒</span>
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
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
              <Link as={RouterLink} to="/profile" color="foreground" className="text-sm">
                {user?.name}
              </Link>
            </NavbarItem>
            {isAdmin && (
              <NavbarItem>
                <Link as={RouterLink} to="/admin" color="primary" className="text-sm">
                  Admin
                </Link>
              </NavbarItem>
            )}
            <NavbarItem>
              <Button
                color="danger"
                variant="light"
                size="sm"
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
                to="/login"
                variant="light"
                size="sm"
              >
                Login
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={RouterLink}
                color="primary"
                to="/register"
                variant="solid"
                size="sm"
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
              as={RouterLink}
              to="/cart"
              variant="light"
              isIconOnly
              className="relative"
            >
              <span className="text-xl">🛒</span>
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<span className="text-default-400">🔍</span>}
              type="search"
            />
          </form>
        </div>

        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <Link
                as={RouterLink}
                color="foreground"
                to={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          {isAuthenticated && (
            <>
              {!isAdmin && (
                <NavbarMenuItem>
                  <Link as={RouterLink} to="/cart" color="foreground" size="lg">
                    Cart {getCartItemCount() > 0 && `(${getCartItemCount()})`}
                  </Link>
                </NavbarMenuItem>
              )}
              <NavbarMenuItem>
                <Link as={RouterLink} to="/profile" color="foreground" size="lg">
                  Profile
                </Link>
              </NavbarMenuItem>
              {isAdmin && (
                <NavbarMenuItem>
                  <Link as={RouterLink} to="/admin" color="primary" size="lg">
                    Admin Panel
                  </Link>
                </NavbarMenuItem>
              )}
              <NavbarMenuItem>
                <Link
                  color="danger"
                  href="#"
                  size="lg"
                  onClick={handleLogout}
                >
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
