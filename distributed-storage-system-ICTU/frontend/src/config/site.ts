export const siteConfig = {
  name: "NexusCloud",
  description: "Système de stockage distribué haute performance.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/images/og-image.png",
  links: {
    twitter: "https://twitter.com/nexuscloud",
    github: "https://github.com/your-repo/nexuscloud",
  },
  mainNav: [
    { title: "Drive", href: "/drive" },
    { title: "Partagés", href: "/drive/shared-with-me" },
    { title: "Récent", href: "/drive/recent" },
  ],
  storage: {
    freePlanLimit: 5 * 1024 * 1024 * 1024, // 5 GB
    maxFileUploadSize: 2 * 1024 * 1024 * 1024, // 2 GB
  }
};

export type SiteConfig = typeof siteConfig;