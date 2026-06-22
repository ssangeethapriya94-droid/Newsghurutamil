import React, { useState, useEffect } from "react";
import API from "../config/api";
import useSEO from "../hooks/useSEO";
import "../styles/InfoPages.css";
import { FaPaperPlane } from "react-icons/fa";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState("");
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Contact Us | Newsghuru",
    description: "Get in touch with Newsghuru for inquiries, feedback, or support.",
    keywords: "contact us, contact newsghuru, support, feedback"
  });

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/pages/contact?language=en");
        if (res.data && res.data.success) {
          setDescriptionContent(res.data.content || "");
        }
      } catch (err) {
        console.error("Error fetching contact page content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContactDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      try {
        await API.post("/api/contact", form);
        setSubmitted(true);
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } catch (error) {
        console.error("Submit error:", error);
        alert("Error sending message. Please try again.");
      }
    }
  };

  return (
    <div className="info-page">
      <div className="info-header">
        <h1>Contact Us</h1>
        <p>Get in touch with us if you have any questions or feedback</p>
      </div>

      <div className="info-card">
        <div className="contact-grid">
          {/* DYNAMIC CONTACT INFO FROM CMS */}
          <div className="contact-info" style={{ display: "block", color: "var(--text-secondary)", lineHeight: "1.8" }}>
            {loading ? (
              <p>Loading details...</p>
            ) : (
              <div 
                className="contact-cms-content"
                dangerouslySetInnerHTML={{ __html: descriptionContent }}
                style={{ fontSize: "16px" }}
              />
            )}
          </div>

          {/* CONTACT FORM */}
          <div className="contact-form-container">
            <h3>Send a Message</h3>
            {submitted && (
              <div className="alert-success">
                Your message has been sent successfully! Thank you.
              </div>
            )}
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your Name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Your Email"
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows="5"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                <FaPaperPlane /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
