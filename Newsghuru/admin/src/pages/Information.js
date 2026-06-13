import { useState, useEffect, useCallback } from "react";
import API from "../config/api";
import "../styles/Information.css";

function Information() {
  const [message, setMessage] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState({ type: "", text: "" });

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchCurrentMessage = useCallback(async () => {
    try {
      setFetching(true);
      const res = await API.get("/api/information");
      if (res.data && res.data.message) {
        setMessage(res.data.message);
        setCurrentMessage(res.data.message);
      } else {
        setMessage("");
        setCurrentMessage("");
      }
    } catch (err) {
      console.error("Error fetching message:", err);
      showStatus("error", "Failed to load current message");
    } finally {
      setFetching(false);
    }
  }, []); // Dependencies: empty array as this function doesn't rely on external state

  // Fetch current message on mount
  useEffect(() => {
    fetchCurrentMessage();
  }, [fetchCurrentMessage]); // Now safely includes the memoized function

  const showStatus = (type, text) => {
    setStatus({ type, text });
    setTimeout(() => {
      setStatus({ type: "", text: "" });
    }, 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showStatus("error", "Please write a message before saving.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/api/information", { message });
      setCurrentMessage(res.data.message);
      showStatus("success", "Message updated and published successfully! 🎉");
    } catch (err) {
      console.error("Error saving message:", err);
      showStatus("error", "Failed to save message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!currentMessage) {
      showStatus("error", "No active message to clear.");
      return;
    }

    if (window.confirm("Are you sure you want to clear the announcement popup?")) {
      try {
        setLoading(true);
        await API.delete("/api/information");
        setMessage("");
        setCurrentMessage("");
        showStatus("success", "Popup message cleared successfully.");
      } catch (err) {
        console.error("Error clearing message:", err);
        showStatus("error", "Failed to clear message.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="information-page">
      <div className="information-container">
        <h1 className="information-title">Announcement Popup</h1>
        <p className="information-subtitle">
          Create an announcement message that will instantly display as a pop-up modal to all visitors on the website.
        </p>

        {fetching ? (
          <div className="info-loading">Loading configuration...</div>
        ) : (
          <form onSubmit={handleSave} className="information-form">
            {currentMessage ? (
              <div className="active-message-banner">
                <strong>Current Active Message:</strong>
                <p>"{currentMessage}"</p>
              </div>
            ) : (
              <div className="no-message-banner">
                <p>No active popup message. The popup is currently disabled.</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="message">Write Popup Message</label>
              <textarea
                id="message"
                placeholder="Type the message you want visitors to see..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={400}
                required
              />
              <div className="char-count">{message.length}/400 characters</div>
            </div>

            {status.text && (
              <div className={`status-message ${status.type}`}>
                {status.text}
              </div>
            )}

            <div className="info-actions">
              <button
                type="submit"
                disabled={loading}
                className="save-btn"
              >
                {loading ? "Saving..." : "Publish Popup"}
              </button>

              {currentMessage && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="clear-btn"
                >
                  Clear Announcement
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Information;