import { Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/public/Home";
import BrowseProviders from "./pages/public/BrowseProviders";
import ProviderProfile from "./pages/public/ProviderProfile";
import BrowseServices from "./pages/public/BrowseServices";
import ServiceDetail from "./pages/public/ServiceDetail";
import BrowsePortfolio from "./pages/public/BrowsePortfolio";
import ProjectDetail from "./pages/public/ProjectDetail";
import Categories from "./pages/public/Categories";
import CategoryDetail from "./pages/public/CategoryDetail";
import HowItWorks from "./pages/public/HowItWorks";
import About from "./pages/public/About";
import Trust from "./pages/public/Trust";
import Contact from "./pages/public/Contact";
import Terms from "./pages/public/Terms";
import Privacy from "./pages/public/Privacy";
import StartProject from "./pages/public/StartProject";
import NotFound from "./pages/public/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import InquiriesList from "./pages/dashboard/InquiriesList";
import InquiryDetail from "./pages/dashboard/InquiryDetail";
import Messages from "./pages/dashboard/Messages";
import Notifications from "./pages/dashboard/Notifications";
import Favorites from "./pages/dashboard/Favorites";
import Reviews from "./pages/dashboard/Reviews";
import Settings from "./pages/dashboard/Settings";
import ProviderOverview from "./pages/dashboard/ProviderOverview";
import ProviderProfileEditor from "./pages/dashboard/ProviderProfileEditor";
import ProviderServices from "./pages/dashboard/ProviderServices";
import ProviderPortfolio from "./pages/dashboard/ProviderPortfolio";
import Team from "./pages/dashboard/Team";
import AdminLayout from "./layouts/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminReports from "./pages/admin/AdminReports";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminSettings from "./pages/admin/AdminSettings";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="providers" element={<BrowseProviders />} />
        <Route path="providers/:slug" element={<ProviderProfile />} />
        <Route path="services" element={<BrowseServices />} />
        <Route path="services/:slug" element={<ServiceDetail />} />
        <Route path="portfolio" element={<BrowsePortfolio />} />
        <Route path="portfolio/:slug" element={<ProjectDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:slug" element={<CategoryDetail />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="about" element={<About />} />
        <Route path="trust" element={<Trust />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="start-project" element={<StartProject />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="inquiries" element={<InquiriesList />} />
          <Route path="inquiries/:id" element={<InquiryDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:conversationId" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="settings" element={<Settings />} />

          <Route element={<ProtectedRoute role="customer" />}>
            <Route path="reviews" element={<Reviews />} />
          </Route>

          <Route element={<ProtectedRoute role="provider" />}>
            <Route path="provider" element={<ProviderOverview />} />
            <Route path="provider/profile" element={<ProviderProfileEditor />} />
            <Route path="provider/services" element={<ProviderServices />} />
            <Route path="provider/portfolio" element={<ProviderPortfolio />} />
            <Route path="team" element={<Team />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="audit-logs" element={<AdminAudit />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
