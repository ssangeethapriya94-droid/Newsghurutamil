import React, { useState, useEffect } from "react";
import { onMessageListener, generateFCMToken } from "./firebase";
import API from "./config/api";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "./styles/global.css";

/* =========================================
   COMPONENTS
========================================= */

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BreakingNewsTicker from "./components/BreakingNewsTicker";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import InformationPopup from "./components/InformationPopup";
import AuthPopup from "./components/AuthPopup";
import NotificationBanner from "./components/NotificationBanner";

/* =========================================
   USER PAGES
========================================= */

import Home from "./pages/Home";
import LatestNews from "./pages/LatestNews";
import TamilNadu from "./pages/TamilNadu";
import India from "./pages/India";
import World from "./pages/World";
import Business from "./pages/Business";
import Sports from "./pages/Sports";
import Education from "./pages/Education";
import Politics from "./pages/Politics";
import Cinema from "./pages/Cinema";
import NewsDetails from "./pages/NewsDetails";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Disclaimer from "./pages/Disclaimer";
import AboutUs from "./pages/AboutUs";
import AdvertiseWithUs from "./pages/AdvertiseWithUs";
import Bookmarks from "./pages/Bookmarks";
import MobileBottomNav from "./components/MobileBottomNav";
import Tech from "./pages/Tech";
import GenericCategory from "./pages/GenericCategory";
import SubscribePlans from "./pages/SubscribePlans";

/* =========================================
   MAIN LAYOUT
========================================= */

function Layout({
  sidebar,
  setSidebar,
  darkMode,
  setDarkMode,
  authPopupVisible,
  setAuthPopupVisible,
  subscribeFlow,
  openSubscribePopup,
  openLoginPopup,
  onLoginSuccess,
  onLogout,
  currentUser,
  visitorCount,
  children,
}) {
  const location = useLocation();
  return (
    <div
      className={`app ${
        darkMode ? "dark-theme" : "light-theme"
      }`}
    >
      <InformationPopup />
      {authPopupVisible && (
        <AuthPopup 
          onClose={() => {
            setAuthPopupVisible(false);
          }} 
          onLoginSuccess={onLoginSuccess}
          isSubscribeFlow={subscribeFlow}
        />
      )}
      <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

      <Header
        setSidebar={setSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setAuthPopupVisible={setAuthPopupVisible}
        openLoginPopup={openLoginPopup}
        onLoginSuccess={onLoginSuccess}
        onLogout={onLogout}
        currentUser={currentUser}
        visitorCount={visitorCount}
      />

      <BreakingNewsTicker />

      <main className="main-content" key={location.pathname + location.search}>
        {children}
      </main>

      <Footer visitorCount={visitorCount} />
      <MobileBottomNav setSidebar={setSidebar} />

      {/* Browser Push Notification Permission Banner */}
      <NotificationBanner />
    </div>
  );
}

/* =========================================
   404 PAGE
========================================= */

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>பக்கம் கிடைக்கவில்லை</h2>
        <p>நீங்கள் தேடும் பக்கம் கிடைக்கவில்லை.</p>
      </div>
    </div>
  );
}

/* =========================================
   APP
========================================= */

function App() {
  const [sidebar, setSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [authPopupVisible, setAuthPopupVisible] = useState(false);
  const [subscribeFlow, setSubscribeFlow] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);
  
  // Track if user is logged in to force header rerender
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("readerToken"));
  
  // Reactive state for the currently logged-in user profile
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const dataStr = localStorage.getItem("readerData");
      return dataStr ? JSON.parse(dataStr) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // Sync user profile on mount or login to fetch up-to-date isPremium status
    const syncUserProfile = async () => {
      const token = localStorage.getItem("readerToken");
      if (token) {
        try {
          const res = await API.get("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data.success) {
            localStorage.setItem("readerData", JSON.stringify(res.data.user));
            setCurrentUser(res.data.user);
          }
        } catch (err) {
          console.error("Error syncing user profile:", err);
          if (err.response?.status === 401) {
            localStorage.removeItem("readerToken");
            localStorage.removeItem("readerData");
            setIsLoggedIn(false);
            setCurrentUser(null);
          }
        }
      }
    };
    syncUserProfile();
  }, [isLoggedIn]);

  // Visitor tracking: increment once per browser session using sessionStorage
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        if (!sessionStorage.getItem("ng_visited")) {
          // First visit this session — increment the counter
          const res = await API.post("/api/analytics/visitors/increment");
          if (res.data && res.data.success) {
            setVisitorCount(res.data.count);
            sessionStorage.setItem("ng_visited", "true");
          }
        } else {
          // Already visited this session — just fetch the count
          const res = await API.get("/api/analytics/visitors");
          if (res.data && res.data.success) {
            setVisitorCount(res.data.count);
          }
        }
      } catch (err) {
        console.error("Visitor tracking error:", err);
      }
    };
    trackVisitor();
  }, []);

  const handleLoginSuccess = () => {
    setAuthPopupVisible(false);
    setIsLoggedIn(true);
    try {
      const dataStr = localStorage.getItem("readerData");
      setCurrentUser(dataStr ? JSON.parse(dataStr) : null);
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("readerToken");
    localStorage.removeItem("readerData");
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const openSubscribePopup = () => {
    setSubscribeFlow(true);
    setAuthPopupVisible(true);
  };

  // Open regular login popup
  const openLoginPopup = () => {
    setSubscribeFlow(false);
    setAuthPopupVisible(true);
  };

  const [toast, setToast] = useState(null);
  const [toastHiding, setToastHiding] = useState(false);
  const toastTimeoutRef = React.useRef(null);

  const hideToast = () => {
    setToastHiding(true);
    setTimeout(() => {
      setToast(null);
      setToastHiding(false);
    }, 300);
  };

  useEffect(() => {
    document.body.className = darkMode
      ? "dark-theme"
      : "light-theme";
  }, [darkMode]);

  useEffect(() => {
    const handleOpenLogin = () => {
      setSubscribeFlow(true);
      setAuthPopupVisible(true);
    };
    window.addEventListener("open-reader-login", handleOpenLogin);
    return () => window.removeEventListener("open-reader-login", handleOpenLogin);
  }, []);

  // Listen for payment-success event dispatched by SubscribePlans after checkout
  useEffect(() => {
    const handlePaymentSuccess = (e) => {
      const updatedUser = e.detail?.user;
      if (updatedUser) {
        setCurrentUser(updatedUser);
        setIsLoggedIn(true);
      }
    };
    window.addEventListener("payment-success", handlePaymentSuccess);
    return () => window.removeEventListener("payment-success", handlePaymentSuccess);
  }, []);

  useEffect(() => {
    // Automatically generate/refresh FCM token on load if logged in and permission is already granted
    const refreshFCMToken = async () => {
      const token = localStorage.getItem("readerToken");
      if (token && Notification.permission === "granted") {
        try {
          const fcmToken = await generateFCMToken();
          if (fcmToken) {
            await API.post("/api/users/subscribe", { fcmToken }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("FCM Token auto-refreshed successfully");
          }
        } catch (err) {
          console.error("Failed to auto-refresh FCM token:", err);
        }
      }
    };
    refreshFCMToken();
  }, [isLoggedIn]);

  useEffect(() => {
    // Listen for foreground messages
    const unsubscribe = onMessageListener((payload) => {
      console.log("Foreground notification received:", payload);
      
      // 1. Native OS/Browser notification (Removed to prevent multiple notifications from open tabs)
      // We rely solely on the Custom In-App Visual Toast when the app is in the foreground.

      // 2. Custom in-app visual toast
      if (payload.notification) {
        setToast({
          title: payload.notification.title || "📰 NewsGhuru",
          body: payload.notification.body || "",
          link: payload.data?.link || "/"
        });
        setToastHiding(false);

        // Auto-dismiss after 8 seconds
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(() => {
          hideToast();
        }, 8000);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {toast && (
        <div className={`toast-container ${toastHiding ? "hiding" : ""}`}>
          <div className="toast-card">
            <div className="toast-header">
              <span className="toast-title">{toast.title}</span>
              <button className="toast-close" onClick={hideToast}>&times;</button>
            </div>
            <div className="toast-body">{toast.body}</div>
            <a href={toast.link} className="toast-action" onClick={hideToast}>Read Now &rarr;</a>
          </div>
        </div>
      )}
      <Router>
        <ScrollToTop />
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/latest-news"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <LatestNews />
            </Layout>
          }
        />

        <Route
          path="/tamilnadu"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <TamilNadu />
            </Layout>
          }
        />

        <Route
          path="/tamil"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <TamilNadu />
            </Layout>
          }
        />

        <Route
          path="/india"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <India />
            </Layout>
          }
        />

        <Route
          path="/world"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <World />
            </Layout>
          }
        />

        <Route
          path="/business"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Business />
            </Layout>
          }
        />

        <Route
          path="/sports"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Sports />
            </Layout>
          }
        />

        <Route
          path="/education"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Education />
            </Layout>
          }
        />

        <Route
          path="/politics"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Politics />
            </Layout>
          }
        />

        <Route
          path="/cinema"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Cinema />
            </Layout>
          }
        />

        <Route
          path="/tech"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Tech />
            </Layout>
          }
        />
        {/* NEWS DETAILS */}
        <Route
          path="/news/:id"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <NewsDetails />
            </Layout>
          }
        />

        <Route
          path="/privacy"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Privacy />
            </Layout>
          }
        />

        <Route
          path="/about"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <AboutUs />
            </Layout>
          }
        />

        <Route
          path="/about-us"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <AboutUs />
            </Layout>
          }
        />

        <Route
          path="/disclaimer"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Disclaimer />
            </Layout>
          }
        />

        <Route
          path="/terms"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Terms />
            </Layout>
          }
        />

        <Route
          path="/contact"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Contact />
            </Layout>
          }
        />

        <Route
          path="/advertise-with-us"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <AdvertiseWithUs />
            </Layout>
          }
        />

        <Route
          path="/bookmarks"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <Bookmarks />
            </Layout>
          }
        />

        <Route
          path="/category/:categoryName"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <GenericCategory />
            </Layout>
          }
        />

        <Route
          path="/subscribe"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout, currentUser, visitorCount }}>
              <SubscribePlans />
            </Layout>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Router>
    </>
  );
}

export default App;