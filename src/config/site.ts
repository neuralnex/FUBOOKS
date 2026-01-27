export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "FUBOOKS",
  description: "Your trusted book ordering platform for students",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Books",
      href: "/books",
    },
    {
      label: "My Orders",
      href: "/orders",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "My Orders",
      href: "/orders",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Admin Panel",
      href: "/admin",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com",
    twitter: "https://twitter.com",
    docs: "https://bookmate-n9wh.onrender.com/api-docs/",
  },
};
