import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
  sitemap: "https://tong-an-photography-3-nntn.vercel.app/sitemap.xml",
  };
}
