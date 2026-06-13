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
      <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

      <Header
        setSidebar={setSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
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

  useEffect(() => {
    document.body.className = darkMode
      ? "dark-theme"
      : "light-theme";
  }, [darkMode]);

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
            >
              <Home />
            </Layout>
          }
        />

        <Route
          path="/latest-news"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <LatestNews />
            </Layout>
          }
        />

        

        <Route
          path="/tamilnadu"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <TamilNadu />
            </Layout>
          }
        />

        <Route
          path="/india"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <India />
            </Layout>
          }
        />

        <Route
          path="/world"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <World />
            </Layout>
          }
        />

        <Route
          path="/business"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <Business />
            </Layout>
          }
        />

        <Route
          path="/sports"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <Sports />
            </Layout>
          }
        />

        <Route
          path="/education"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <Education />
            </Layout>
          }
        />

        <Route
          path="/politics"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <Politics />
            </Layout>
          }
        />

        <Route
          path="/cinema"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <Cinema />
            </Layout>
          }
        />
        {/* NEWS DETAILS */}
        <Route
          path="/news/:id"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <NewsDetails />
            </Layout>
          }
        />

        <Route
          path="/privacy"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <Privacy />
            </Layout>
          }
        />

        <Route
          path="/terms"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
              <Terms />
            </Layout>
          }
        />

        <Route
          path="/contact"
          element={
            <Layout {...{ sidebar, setSidebar, darkMode, setDarkMode }}>
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