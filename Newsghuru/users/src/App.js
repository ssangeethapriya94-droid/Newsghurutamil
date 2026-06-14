import React, { useState, useEffect } from "react";

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
            const token = localStorage.getItem("readerToken");
            if (token) {
              setAuthPopupVisible(false);
              sessionStorage.setItem("authClosed", "true");
            }
          }} 
          onLoginSuccess={onLoginSuccess}
        />
      )}
      <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

      <Header
        setSidebar={setSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setAuthPopupVisible={setAuthPopupVisible}
        onLoginSuccess={onLoginSuccess}
        onLogout={onLogout}
      />

      <DateBar />
      <Navbar />
      <BreakingNewsTicker />

      <main className="main-content" key={location.pathname + location.search}>
        {children}
      </main>

      <Footer />
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
  
  // Track if user is logged in to force header rerender
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("readerToken"));

  const handleLoginSuccess = () => {
    setAuthPopupVisible(false);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("readerToken");
    localStorage.removeItem("readerData");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    document.body.className = darkMode
      ? "dark-theme"
      : "light-theme";
  }, [darkMode]);

  // Require login to see the app
  useEffect(() => {
    const token = localStorage.getItem("readerToken");
    
    if (!token) {
      setAuthPopupVisible(true);
    }
  }, [isLoggedIn]);

  return (
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
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <LatestNews />
            </Layout>
          }
        />

        

        <Route
          path="/tamilnadu"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <TamilNadu />
            </Layout>
          }
        />

        <Route
          path="/india"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <India />
            </Layout>
          }
        />

        <Route
          path="/world"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <World />
            </Layout>
          }
        />

        <Route
          path="/business"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Business />
            </Layout>
          }
        />

        <Route
          path="/sports"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Sports />
            </Layout>
          }
        />

        <Route
          path="/education"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Education />
            </Layout>
          }
        />

        <Route
          path="/politics"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Politics />
            </Layout>
          }
        />

        <Route
          path="/cinema"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Cinema />
            </Layout>
          }
        />
        {/* NEWS DETAILS */}
        <Route
          path="/news/:id"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <NewsDetails />
            </Layout>
          }
        />

        <Route
          path="/privacy"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Privacy />
            </Layout>
          }
        />

        <Route
          path="/terms"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Terms />
            </Layout>
          }
        />

        <Route
          path="/contact"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode, authPopupVisible, setAuthPopupVisible, onLoginSuccess: handleLoginSuccess, onLogout: handleLogout }}>
              <Contact />
            </Layout>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Router>
  );
}

export default App;