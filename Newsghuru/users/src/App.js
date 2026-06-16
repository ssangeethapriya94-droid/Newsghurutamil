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
import DateBar from "./components/DateBar";
import Navbar from "./components/Navbar";
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
      />

      <DateBar />
      <Navbar />
      <BreakingNewsTicker />

      <main className="main-content" key={location.pathname + location.search}>
        {children}
      </main>

      <Footer openSubscribePopup={openSubscribePopup} />

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
  
  // Track if user is logged in to force header rerender
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("readerToken"));

  const handleLoginSuccess = () => {
    // If it's subscribe flow, let AuthPopup handle the close after subscribing
    // Otherwise close immediately
    if (!subscribeFlow) {
      setAuthPopupVisible(false);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("readerToken");
    localStorage.removeItem("readerData");
    setIsLoggedIn(false);
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
            <Layout
              sidebar={sidebar}
              setSidebar={setSidebar}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              authPopupVisible={authPopupVisible}
              setAuthPopupVisible={setAuthPopupVisible}
              subscribeFlow={subscribeFlow}
              openSubscribePopup={openSubscribePopup}
              openLoginPopup={openLoginPopup}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            >
              <Home />
            </Layout>
          }
        />

        <Route
          path="/latest-news"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <LatestNews />
            </Layout>
          }
        />

        

        <Route
          path="/tamilnadu"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <TamilNadu />
            </Layout>
          }
        />

        <Route
          path="/india"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <India />
            </Layout>
          }
        />

        <Route
          path="/world"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <World />
            </Layout>
          }
        />

        <Route
          path="/business"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Business />
            </Layout>
          }
        />

        <Route
          path="/sports"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Sports />
            </Layout>
          }
        />

        <Route
          path="/education"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Education />
            </Layout>
          }
        />

        <Route
          path="/politics"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Politics />
            </Layout>
          }
        />

        <Route
          path="/cinema"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Cinema />
            </Layout>
          }
        />
        {/* NEWS DETAILS */}
        <Route
          path="/news/:id"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <NewsDetails />
            </Layout>
          }
        />

        <Route
          path="/privacy"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Privacy />
            </Layout>
          }
        />

        <Route
          path="/terms"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Terms />
            </Layout>
          }
        />

        <Route
          path="/contact"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, subscribeFlow, openSubscribePopup, openLoginPopup, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Contact />
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