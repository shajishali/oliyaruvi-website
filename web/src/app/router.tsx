import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "../components/admin/AdminLayout";
import { PublicLayout } from "../components/public/PublicLayout";
import { AuditPage } from "../pages/admin/AuditPage";
import { DashboardPage } from "../pages/admin/DashboardPage";
import { FaqsPage } from "../pages/admin/FaqsPage";
import { BookingsAdminPage, EnquiriesAdminPage } from "../pages/admin/InboxAdminPage";
import { LiveAdminPage } from "../pages/admin/LiveAdminPage";
import { LoginPage } from "../pages/admin/LoginPage";
import { MediaPage } from "../pages/admin/MediaPage";
import { NavigationPage } from "../pages/admin/NavigationPage";
import { OrdersAdminPage } from "../pages/admin/OrdersAdminPage";
import { PageBuilderPage } from "../pages/admin/PageBuilderPage";
import { PagesListPage } from "../pages/admin/PagesListPage";
import { PhotographyAdminPage } from "../pages/admin/PhotographyAdminPage";
import { ProductsAdminPage } from "../pages/admin/ProductsAdminPage";
import { RequireStaff } from "../pages/admin/RequireStaff";
import { ContactDetailsPage, SeoDefaultsPage, SettingsPage } from "../pages/admin/SettingsPages";
import { TestimonialsPage } from "../pages/admin/TestimonialsPage";
import { ThemePage } from "../pages/admin/ThemePage";
import { UsersAdminPage } from "../pages/admin/UsersAdminPage";
import { VideographyAdminPage } from "../pages/admin/VideographyAdminPage";
import { AlbumPage } from "../pages/public/AlbumPage";
import { CmsPage } from "../pages/public/CmsPage";
import { PendingPage } from "../pages/public/PendingPage";
import { ProductPage } from "../pages/public/ProductPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="admin/login" element={<LoginPage />} />
      <Route path="admin" element={<RequireStaff />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="pages" element={<PagesListPage />} />
          <Route path="pages/:pageId" element={<PageBuilderPage />} />
          <Route path="navigation" element={<NavigationPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="photography" element={<PhotographyAdminPage />} />
          <Route path="videography" element={<VideographyAdminPage />} />
          <Route path="live" element={<LiveAdminPage />} />
          <Route path="printing" element={<ProductsAdminPage catalogue="printing" />} />
          <Route path="gifts" element={<ProductsAdminPage catalogue="gifts" />} />
          <Route path="bookings" element={<BookingsAdminPage />} />
          <Route path="enquiries" element={<EnquiriesAdminPage />} />
          <Route path="orders" element={<OrdersAdminPage />} />
          <Route path="users" element={<UsersAdminPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="faqs" element={<FaqsPage />} />
          <Route path="contact" element={<ContactDetailsPage />} />
          <Route path="seo" element={<SeoDefaultsPage />} />
          <Route path="theme" element={<ThemePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="*" element={<PendingPage title="Not built yet" />} />
        </Route>
      </Route>
      <Route element={<PublicLayout />}>
        <Route index element={<CmsPage slug="home" />} />
        <Route path="photography" element={<CmsPage slug="photography" />} />
        <Route path="photography/:slug" element={<AlbumPage />} />
        <Route path="videography" element={<CmsPage slug="videography" />} />
        <Route path="printing" element={<CmsPage slug="printing" />} />
        <Route path="printing/:slug" element={<ProductPage catalogue="printing" />} />
        <Route path="gifts" element={<CmsPage slug="gifts" />} />
        <Route path="gifts/:slug" element={<ProductPage catalogue="gifts" />} />
        <Route path="live" element={<CmsPage slug="live" />} />
        <Route path="about" element={<CmsPage slug="about" />} />
        <Route path="booking" element={<CmsPage slug="booking" />} />
        <Route path="contact" element={<CmsPage slug="contact" />} />
        <Route path="portfolio" element={<CmsPage slug="portfolio" />} />
        <Route path="*" element={<PendingPage title="Page not found" />} />
      </Route>
    </Routes>
  );
}
