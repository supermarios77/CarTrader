export type NavItem = {
  title: string;
  href: string;
  external?: boolean;
};

export type FooterLinkGroup = {
  title: string;
  items: NavItem[];
};

export const siteConfig = {
  name: "CarTrader",
  description:
    "Discover, compare, and secure your next ride with confidence. CarTrader connects serious buyers and trusted sellers with transparent pricing, verified listings, and flexible checkout.",
  links: {
    github: "https://github.com/supermarios77/CarTrader",
  },
  mainNav: [
    { title: "Browse Listings", href: "/listings" },
    { title: "Sell Your Vehicle", href: "/sell" },
    { title: "Financing", href: "/financing" },
    { title: "Support", href: "/support" },
  ] satisfies NavItem[],
  footerNav: [
    {
      title: "Marketplace",
      items: [
        { title: "Listings", href: "/listings" },
        { title: "Sell a Car", href: "/sell" },
        { title: "Financing", href: "/financing" },
      ],
    },
    {
      title: "Company",
      items: [
        { title: "About", href: "/about" },
        { title: "Careers", href: "/careers" },
        { title: "Press", href: "/press" },
      ],
    },
    {
      title: "Resources",
      items: [
        { title: "Support", href: "/support" },
        { title: "Safety", href: "/safety" },
        { title: "Blog", href: "/blog" },
      ],
    },
  ] satisfies FooterLinkGroup[],
};

export type SiteConfig = typeof siteConfig;

