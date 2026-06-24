import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import "./App.css";

import AddNews from "./pages/AddNews";
import AllNews from "./pages/AllNews";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import ReporterSidebar from "./components/ReporterSidebar";
import Topbar from "./components/Topbar";
import Information from "./pages/Information";
import Account from "./pages/Account";
import WebsiteSettings from "./pages/WebsiteSettings";
import Revenue from "./pages/Revenue";

// Placeholder Reporter Pages
import ReporterCreateNews from "./pages/ReporterCreateNews";
import ReporterMyArticles from "./pages/ReporterMyArticles";
import ReporterNotifications from "./pages/ReporterNotifications";
import ReporterProfile from "./pages/ReporterProfile";

// Placeholder Editor Pages
import EditorSidebar from "./components/EditorSidebar";
import EditorArticlesList from "./pages/EditorArticlesList";
import EditorReviewNews from "./pages/EditorReviewNews";

import AdminDashboard from "./pages/AdminDashboard";
import AdminArticlesList from "./pages/AdminArticlesList";
import AdminReviewNews from "./pages/AdminReviewNews";
import Categories from "./pages/Categories";
import UsersManagement from "./pages/UsersManagement";
import MediaLibrary from "./pages/MediaLibrary";
import ContactQueries from "./pages/ContactQueries";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import Shorts from "./pages/Shorts";
import PhotoStories from "./pages/PhotoStories";
import HomepageBuilder from "./pages/HomepageBuilder";

// Anmigam Pages
import AnmigamRasiPalanList from "./pages/AnmigamRasiPalanList";
import AnmigamRasiPalanCreate from "./pages/AnmigamRasiPalanCreate";
import AnmigamTempleBlogsList from "./pages/AnmigamTempleBlogsList";
import AnmigamTempleBlogCreate from "./pages/AnmigamTempleBlogCreate";

// Advertisement pages
import AdDashboard from "./pages/AdDashboard";
import AllAds from "./pages/AllAds";
import AddAd from "./pages/AddAd";
import AdRequests from "./pages/AdRequests";
import AdAnalytics from "./pages/AdAnalytics";
import AdSettings from "./pages/AdSettings";

const isLoggedIn = () => {
  return localStorage.getItem("token") && localStorage.getItem("role");
};

const getUserRole = () => {
  return localStorage.getItem("role");
};

// protected route (with optional role requirement)
const ProtectedRoute = ({ children, requiredRole }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole) {
    const role = getUserRole();
    const hasRole = Array.isArray(requiredRole) 
      ? requiredRole.includes(role) 
      : role === requiredRole;
      
    if (!hasRole) {
      if (role === "admin") return <Navigate to="/admin/dashboard" />;
      if (role === "editor") return <Navigate to="/editor/pending" />;
      if (role === "reporter") return <Navigate to="/reporter/create-news" />;
      return <Navigate to="/" />;
    }
  }

  return children;
};
// layout wrapper (controls sidebar visibility and topbar)
function Layout({ children }) {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const role = getUserRole();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (hideSidebar || !isLoggedIn()) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      {role === "reporter" ? (
        <ReporterSidebar isOpen={sidebarOpen} />
      ) : role === "editor" ? (
        <EditorSidebar isOpen={sidebarOpen} />
      ) : (
        <Sidebar isOpen={sidebarOpen} />
      )}
      
      {/* Click overlay to close sidebar on mobile */}
      {sidebarOpen && (
        <div 
          style={{position: 'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:90}}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="main-content">
        <Topbar toggleSidebar={toggleSidebar} role={role} />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN (NO SIDEBAR) */}
        <Route path="/login" element={<Login />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/"
          element={<Navigate to="/admin/dashboard" />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-news"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <AddNews />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pending"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <AdminArticlesList defaultFilter="pending" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/all-news"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <AllNews />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/published"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <AdminArticlesList defaultFilter="published" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/review/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <AdminReviewNews />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <ReporterNotifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <ReporterProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/account"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <Account />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/pages"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <WebsiteSettings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={<Navigate to="/admin/settings/account" replace />}
        />



        {/* Real routes connecting admin dashboard pages */}
        <Route path="/admin/breaking" element={<ProtectedRoute requiredRole="admin"><Layout><AdminArticlesList defaultFilter="all" /></Layout></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute requiredRole={["admin", "reporter"]}><Layout><Categories /></Layout></ProtectedRoute>} />
        <Route path="/admin/edit-news/:id" element={<ProtectedRoute requiredRole="admin"><Layout><ReporterCreateNews /></Layout></ProtectedRoute>} />
        <Route path="/admin/media" element={<ProtectedRoute requiredRole="admin"><Layout><MediaLibrary /></Layout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><Layout><UsersManagement /></Layout></ProtectedRoute>} />
        <Route path="/admin/contact-queries" element={<ProtectedRoute requiredRole="admin"><Layout><ContactQueries /></Layout></ProtectedRoute>} />
        <Route path="/admin/subscriptions" element={<ProtectedRoute requiredRole="admin"><Layout><SubscriptionPlans /></Layout></ProtectedRoute>} />
        <Route path="/admin/revenue" element={<ProtectedRoute requiredRole="admin"><Layout><Revenue /></Layout></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/shorts" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><Shorts /></Layout></ProtectedRoute>} />
        <Route path="/admin/photo-stories" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><PhotoStories /></Layout></ProtectedRoute>} />
        <Route path="/admin/homepage-builder" element={<ProtectedRoute requiredRole="admin"><Layout><HomepageBuilder /></Layout></ProtectedRoute>} />

        {/* ANMIGAM ROUTES */}
        <Route path="/admin/anmigam/rasi-palan" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><AnmigamRasiPalanList /></Layout></ProtectedRoute>} />
        <Route path="/admin/anmigam/rasi-palan/new" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><AnmigamRasiPalanCreate /></Layout></ProtectedRoute>} />
        <Route path="/admin/anmigam/rasi-palan/edit/:id" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><AnmigamRasiPalanCreate /></Layout></ProtectedRoute>} />
        <Route path="/admin/anmigam/temple-blogs" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><AnmigamTempleBlogsList /></Layout></ProtectedRoute>} />
        <Route path="/admin/anmigam/temple-blogs/new" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><AnmigamTempleBlogCreate /></Layout></ProtectedRoute>} />
        <Route path="/admin/anmigam/temple-blogs/edit/:id" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><AnmigamTempleBlogCreate /></Layout></ProtectedRoute>} />

        {/* ADVERTISEMENT MANAGEMENT MODULE ROUTES */}
        <Route path="/admin/ads/dashboard" element={<ProtectedRoute requiredRole="admin"><Layout><AdDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/ads/all" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><AllAds /></Layout></ProtectedRoute>} />
        <Route path="/admin/ads/add" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><AddAd /></Layout></ProtectedRoute>} />
        <Route path="/admin/ads/edit/:id" element={<ProtectedRoute requiredRole={["admin", "editor"]}><Layout><AddAd /></Layout></ProtectedRoute>} />
        <Route path="/admin/ads/requests" element={<ProtectedRoute requiredRole="admin"><Layout><AdRequests /></Layout></ProtectedRoute>} />
        <Route path="/admin/ads/analytics" element={<ProtectedRoute requiredRole="admin"><Layout><AdAnalytics /></Layout></ProtectedRoute>} />
        <Route path="/admin/ads/settings" element={<ProtectedRoute requiredRole="admin"><Layout><AdSettings /></Layout></ProtectedRoute>} />

        {/* REPORTER ROUTES */}
        <Route
          path="/reporter/create-news"
          element={
            <ProtectedRoute requiredRole="reporter">
              <Layout>
                <ReporterCreateNews />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reporter/edit-news/:id"
          element={
            <ProtectedRoute requiredRole="reporter">
              <Layout>
                <ReporterCreateNews />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reporter/my-articles"
          element={
            <ProtectedRoute requiredRole="reporter">
              <Layout>
                <ReporterMyArticles defaultFilter="all" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reporter/notifications"
          element={
            <ProtectedRoute requiredRole="reporter">
              <Layout>
                <ReporterNotifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reporter/profile"
          element={
            <ProtectedRoute requiredRole="reporter">
              <Layout>
                <ReporterProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reporter/drafts"
          element={
            <ProtectedRoute requiredRole="reporter">
              <Layout>
                <ReporterMyArticles defaultFilter="draft" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reporter/submitted"
          element={
            <ProtectedRoute requiredRole="reporter">
              <Layout>
                <ReporterMyArticles defaultFilter="submitted" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reporter/rejected"
          element={
            <ProtectedRoute requiredRole="reporter">
              <Layout>
                <ReporterMyArticles defaultFilter="rejected" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reporter/published"
          element={
            <ProtectedRoute requiredRole="reporter">
              <Layout>
                <ReporterMyArticles defaultFilter="published" />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* EDITOR ROUTES */}
        <Route
          path="/editor/dashboard"
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <EditorArticlesList defaultFilter="pending" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/pending"
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <EditorArticlesList defaultFilter="pending" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/review"
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <EditorArticlesList defaultFilter="pending" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/approved"
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <EditorArticlesList defaultFilter="approved" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/rejected"
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <EditorArticlesList defaultFilter="rejected" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/review/:id"
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <EditorReviewNews />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/notifications"
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <ReporterNotifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/profile"
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <ReporterProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all or Dashboard placeholder routes */}
        <Route path="/dashboard" element={<Navigate to="/" />} />
        <Route path="/reporter/dashboard" element={<Navigate to="/reporter/create-news" />} />
        
        {/* Catch-all for unimplemented sidebar links to prevent console errors */}
        <Route 
          path="*" 
          element={
            <ProtectedRoute>
              <Layout>
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <h2>Page Under Construction</h2>
                  <p>This section is currently being built. Please check back later.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;