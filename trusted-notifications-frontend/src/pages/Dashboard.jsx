import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState(null);

  // Filters
  const [filterEvent, setFilterEvent] = useState("All");
  const [filterChannel, setFilterChannel] = useState("All");
  const [filterSig, setFilterSig] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sendEvent = async (eventType) => {
    setSending(true);
    try {
      const template = {
        OTP: "Your login OTP is 123456. Do not share it.",
        PASSWORD_CHANGE: "Your password was changed.",
        LOGIN_ALERT: "A login was made to your account.",
        TRANSACTION_DEBIT: "Rs.1500 was debited.",
        EMI_REMINDER: "Your EMI of Rs.3,200 is due soon.",
        STATEMENT_READY: "Your monthly statement is ready.",
        DEVICE_REGISTRATION: "A new device was registered.",
        SUSPICIOUS_ACTIVITY: "Suspicious activity detected!",
        TRANSACTION_CREDIT: "Rs.2200 credited.",
        BILL_PAYMENT: "Your bill has been paid.",
        OFFER_ALERT: "New festive offer available!"
      }[eventType];

      await api.post("/notifications/send", {
        eventType,
        priority: eventType === "OTP" ? "CRITICAL" : "NORMAL",
        message: template,
        meta: {
          email: user.email,
          phone: "+91XXXXXXXXXX"
        }
      });

      await fetchNotifications();
    } catch (err) {
      console.error("Send error:", err);
    }
    setSending(false);
  };

  const filtered = notifications.filter((n) => {
    const matchesEvent = filterEvent === "All" || n.eventType === filterEvent;
    const matchesChannel = filterChannel === "All" || n.channelUsed === filterChannel;
    const matchesSig =
      filterSig === "All" ||
      (filterSig === "Valid" && n.signatureValid) ||
      (filterSig === "Invalid" && !n.signatureValid);

    const matchesSearch =
      search.trim() === "" ||
      n.message.toLowerCase().includes(search.toLowerCase());

    const date = new Date(n.createdAt);
    const matchesFrom = !dateFrom || date >= new Date(dateFrom);
    const matchesTo = !dateTo || date <= new Date(dateTo);

    return matchesEvent && matchesChannel && matchesSig && matchesSearch && matchesFrom && matchesTo;
  });

  const analytics = {
    total: notifications.length,
    retries: notifications.filter((n) => n.attempts > 1).length,
    retryRate:
      notifications.length === 0
        ? 0
        : Math.round(
            (notifications.filter((n) => n.attempts > 1).length / notifications.length) *
              100
          ),
    mostFailed:
      notifications.filter((n) => n.status === "FAILED")[0]?.eventType || "-"
  };

  const templatePreview = [
    { eventType: "OTP", example: "Your login OTP is 123456. Do not share it." },
    { eventType: "PASSWORD_CHANGE", example: "Your password was changed." },
    { eventType: "LOGIN_ALERT", example: "A login was made to your account." },
    { eventType: "DEVICE_REGISTRATION", example: "A new device was registered." },
    { eventType: "SUSPICIOUS_ACTIVITY", example: "Suspicious activity detected!" },
    { eventType: "TRANSACTION_DEBIT", example: "Rs.1500 was debited." },
    { eventType: "TRANSACTION_CREDIT", example: "Rs.2200 credited." },
    { eventType: "BILL_PAYMENT", example: "Your bill has been paid." },
    { eventType: "EMI_REMINDER", example: "Your EMI of Rs.3,200 is due soon." },
    { eventType: "STATEMENT_READY", example: "Your monthly statement is ready." },
    { eventType: "OFFER_ALERT", example: "New festive offer available!" },
  ];

  return (
    <div className="dashboard">
      <div className="card header-card">
        <h2>Trusted Notification Center</h2>
        <div>
          Logged in as <b>{user.name}</b>{" "}
          <button onClick={logout} style={{ marginLeft: "8px" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="card analytics">
        <div className="analytic-box">
          <p className="label">Total Notifications</p>
          <h3>{analytics.total}</h3>
        </div>
        <div className="analytic-box">
          <p className="label">Retries Triggered</p>
          <h3>{analytics.retries}</h3>
        </div>
        <div className="analytic-box">
          <p className="label">Retry Rate</p>
          <h3>{analytics.retryRate}%</h3>
        </div>
        <div className="analytic-box">
          <p className="label">Most Failed Event</p>
          <h3>{analytics.mostFailed}</h3>
        </div>
      </div>

      {/* Trigger Buttons */}
      <div className="card actions">
        <h3>Trigger Demo Events</h3>
        {[
          "OTP",
          "PASSWORD_CHANGE",
          "LOGIN_ALERT",
          "TRANSACTION_DEBIT",
          "EMI_REMINDER",
          "STATEMENT_READY",
          "DEVICE_REGISTRATION",
          "SUSPICIOUS_ACTIVITY",
          "TRANSACTION_CREDIT",
          "BILL_PAYMENT",
          "OFFER_ALERT"
        ].map((e) => (
          <button key={e} disabled={sending} onClick={() => sendEvent(e)}>
            {e.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card filters">
        <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
          <option>All</option>
          {[
            "OTP",
            "PASSWORD_CHANGE",
            "LOGIN_ALERT",
            "DEVICE_REGISTRATION",
            "SUSPICIOUS_ACTIVITY",
            "TRANSACTION_DEBIT",
            "TRANSACTION_CREDIT",
            "BILL_PAYMENT",
            "EMI_REMINDER",
            "STATEMENT_READY",
            "OFFER_ALERT"
          ].map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>

        <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)}>
          <option>All</option>
          <option>SMS</option>
          <option>EMAIL</option>
          <option>IN_APP</option>
        </select>

        <select value={filterSig} onChange={(e) => setFilterSig(e.target.value)}>
          <option>All</option>
          <option>Valid</option>
          <option>Invalid</option>
        </select>

        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />

        <input
          className="full"
          placeholder="Search message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Inbox Table */}
      <div className="card">
        <h3>Secure Inbox</h3>
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No notifications.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Message</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Signature</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n._id}>
                  <td>{n.eventType}</td>
                  <td>{n.message}</td>

                  <td>
                    <span
                      className={`status-pill ${
                        n.channelUsed === "SMS"
                          ? "status-blue"
                          : n.channelUsed === "EMAIL"
                          ? "status-yellow"
                          : "status-green"
                      }`}
                    >
                      {n.channelUsed}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-pill ${
                        n.status === "SENT" ? "status-green" : "status-red"
                      }`}
                    >
                      {n.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-pill ${
                        (n.signatureValid ?? Boolean(n.signature)) ? "status-green" : "status-red"
                      }`}
                    >
                      {(n.signatureValid ?? Boolean(n.signature)) ? "Valid" : "Invalid"}
                    </span>
                  </td>

                  <td>{new Date(n.createdAt).toLocaleString()}</td>

                  <td>
                    <button onClick={() => setSelected(n)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Template Preview */}
      <div className="card">
        <h3>Notification Templates</h3>
        <div className="template-grid">
          {templatePreview.map((t) => (
            <div className="template-card" key={t.eventType}>
              <b>{t.eventType.replace(/_/g, " ")}</b>
              <p>{t.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delivery Timeline</h3>
            <div className="timeline">
              <div className="timeline-step">Event: {selected.eventType}</div>
              <div className="timeline-step">Channel Used: {selected.channelUsed}</div>
              <div className="timeline-step">Attempts: {selected.attempts ?? 1}</div>
              <div className="timeline-step">Status: {selected.status}</div>
            </div>
            <button onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
