import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { TOOLS } from "./lib/tools";

const WheelPage = lazy(() => import("./pages/WheelPage"));
const ToolPageRoute = lazy(() => import("./pages/ToolPageRoute"));
const ToolsIndex = lazy(() => import("./pages/ToolsIndex"));
const TeachersPage = lazy(() => import("./pages/TeachersPage"));
const StreamersPage = lazy(() => import("./pages/StreamersPage"));
const GuidesIndex = lazy(() => import("./pages/GuidesPages").then((m) => ({ default: m.GuidesIndex })));
const GuideArticlePage = lazy(() => import("./pages/GuidesPages").then((m) => ({ default: m.GuideArticlePage })));
const BlogIndex = lazy(() => import("./pages/BlogPages").then((m) => ({ default: m.BlogIndex })));
const BlogArticlePage = lazy(() => import("./pages/BlogPages").then((m) => ({ default: m.BlogArticlePage })));
const AboutPage = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.TermsPage })));
const ContactPage = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.NotFoundPage })));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-500" />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<ToolsIndex />} />
              <Route path="/wheel-spinner" element={<WheelPage />} />
              {TOOLS.filter((t) => t.slug !== "wheel-spinner").map((t) => (
                <Route key={t.slug} path={`/${t.slug}`} element={<ToolPageRoute slug={t.slug} />} />
              ))}
              <Route path="/for-teachers" element={<TeachersPage />} />
              <Route path="/for-streamers" element={<StreamersPage />} />
              <Route path="/guides" element={<GuidesIndex />} />
              <Route path="/guides/:slug" element={<GuideArticlePage />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogArticlePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  );
}
