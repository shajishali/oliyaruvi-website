import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { createLocalSession, localAdminEnabled, passwordMatches } from "./auth/local";
import { applyDocumentMeta, businessJsonLd, canonicalUrl, documentMeta } from "./html";
import { requireStaff, type VerifyToken } from "./middleware/require-staff";
import { adminRouter } from "./routes/admin";
import { publicRouter } from "./routes/public";
import { readStore, uploadsDir } from "./cms/store";
import { robotsTxt, sitemapXml } from "./cms/seo";
import { isAuthConfigured } from "./db/client";

export type CreateAppOptions = {
  verifyToken?: VerifyToken;
  authConfigured?: boolean;
  webDist?: string | null;
};

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "2mb" }));

  if (process.env.NODE_ENV !== "production") {
    app.use(
      cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      }),
    );
  }

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "oliyaruvi" });
  });

  app.post("/api/admin/local-login", (req, res) => {
    const configured = options.authConfigured ?? isAuthConfigured();
    if (!localAdminEnabled() || configured) {
      res.status(404).json({ error: "Local admin login is not available." });
      return;
    }
    const email = String(req.body?.email || "local@oliyaruvi.local");
    const password = String(req.body?.password || "");
    if (!passwordMatches(password)) {
      res.status(401).json({ error: "Invalid local admin password." });
      return;
    }
    const token = createLocalSession(email);
    res.json({
      token,
      admin: { id: "local-admin", email, roles: ["super_admin"] },
    });
  });

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(robotsTxt());
  });

  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(sitemapXml());
  });

  app.get(/^\/media\/(.+)$/, (req, res) => {
    const relative = String(req.params[0] || "").replace(/\\/g, "/");
    if (!relative || relative.includes("..") || relative.startsWith("private/")) {
      res.status(404).end();
      return;
    }
    const store = readStore();
    const asset = store.media.find(
      (item) => !item.deletedAt && (item.storagePath === relative || item.url === `/media/${relative}`),
    );
    if (!asset) {
      res.status(404).json({ error: "Media not found" });
      return;
    }
    const absolute = path.join(uploadsDir(), relative);
    if (!fs.existsSync(absolute)) {
      res.status(404).end();
      return;
    }
    res.set("Cache-Control", "public, max-age=86400");
    res.sendFile(absolute);
  });

  app.use("/api/public", publicRouter);
  app.use("/api/admin", requireStaff(options), adminRouter);
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  const webDist = options.webDist === undefined ? path.resolve(__dirname, "../../web/dist") : options.webDist;
  if (webDist && fs.existsSync(path.join(webDist, "index.html"))) {
    app.use(express.static(webDist, { index: false }));
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") {
        next();
        return;
      }
      const indexPath = path.join(webDist, "index.html");
      const raw = fs.readFileSync(indexPath, "utf8");
      const meta = documentMeta(req.path);
      let html = applyDocumentMeta(raw, {
        ...meta,
        canonical: canonicalUrl(req.path),
        ogImage: meta.ogImage,
      });
      if (req.path.startsWith("/admin")) {
        html = html.replace("</head>", `    <meta name="robots" content="noindex" />\n  </head>`);
      } else {
        html = html.replace(
          "</head>",
          `    <script type="application/ld+json">${businessJsonLd()}</script>\n  </head>`,
        );
      }
      res.type("html").send(html);
    });
  }

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    if (error instanceof Error && /Slug already exists|Invalid content|Unsupported/.test(error.message)) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Something went wrong." });
  });

  return app;
}
