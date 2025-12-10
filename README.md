# 🔐 Trusted Notifications — Reliable, Safe & Timely  
A multi-channel **secure notification delivery system** with intelligent fallback, anti-spoof verification, real-time inbox, analytics, and event-based templates.

This project ensures users always receive important alerts such as **OTPs, transaction updates, login alerts, suspicious activity**, etc., even if one channel fails (SMS, Email, or App Inbox).

---

## 🚀 Features

### ✅ **1. Multi-Channel Notification Delivery**
- **SMS (Twilio)**
- **Email (Nodemailer + SMTP)**
- **In-App Secure Inbox**

### ✅ **2. Smart Fallback Logic**
If one channel fails, the system tries the next:
SMS → Email → In-App
Email → In-App
In-App → (No fallback)

### ✅ **3. Trusted Message Signatures**
Each notification is signed with **HMAC SHA256** ensuring:
- No tampering  
- No spoofing  
- Authenticity verification  

### ✅ **4. Event-Based Templates**
Pre-designed templates for:
- OTP  
- Password Change  
- Transaction Debit/Credit  
- Statement Ready  
- EMI Reminder  
- Suspicious Activity  
- Offer Alerts  

### ✅ **5. Secure Inbox Dashboard (Frontend)**
- View all notifications in real time  
- Filter by event, channel, date, validity  
- Search through messages  
- View timeline of delivery  
- Analytics & retry rate  

### ✅ **6. Advanced Analytics**
- Total notifications  
- Retry count  
- Retry percentage  
- Most failed event type  

---

## 🏗️ Tech Stack

### **Frontend**
- React.js  
- Axios  
- Auth Context + JWT  
- CSS-based UI  
- Local secure inbox rendering  

### **Backend**
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- Twilio SMS API  
- Nodemailer (Email)  
- HMAC Signature Generation  
- JWT Authentication  

---

## 📂 Project Structure
```
trusted-notifications/
│
├── backend/
│ ├── routes/
│ ├── controllers/
│ ├── models/
│ ├── utils/
│ ├── templates/
│ ├── server.js
│ └── .env
│
└── frontend/
├── src/
│ ├── pages/
│ ├── components/
│ ├── AuthContext.jsx
│ ├── api.js
│ └── App.jsx
└── package.json
```
---

## 🔧 How It Works

### 1️⃣ Frontend sends a notification event:
```json
{
  "eventType": "OTP",
  "priority": "CRITICAL",
  "message": "Your login OTP is 123456",
  "meta": {
    "email": "user@example.com",
    "phone": "+91XXXXXXXXXX"
  }
}
```

### 2️⃣ Backend chooses the primary channel:
```

- **OTP** → SMS  
- **Transaction Alerts** → SMS  
- **Offers** → In-App  
- **Device Registration** → Email
```
### 3️⃣ Fallback Logic
```
- **If SMS fails** → Email → In-App  
- **If Email fails** → In-App  
- **If In-App fails** → Mark notification as **FAILED**
```
### 3️⃣ Fallback Logic
```
- **If SMS fails** → Email → In-App  
- **If Email fails** → In-App  
- **If In-App fails** → Mark notification as **FAILED**  

---
```

### 4️⃣ Notification is saved with:
```
- **Event type**  
- **Message content**  
- **Channel used** (SMS / Email / In-App)  
- **Number of attempts**  
- **Final status** (SENT / FAILED)  
- **HMAC security signature**  
- **Timestamp (createdAt)**  

---
```
### 5️⃣ Frontend Dashboard displays:
```
- **Secure Inbox** of all notifications  
- **Analytics** (retry count, retry rate, most failed event)  
- **Filters** by event, channel, signature validity, and date  
- **Search bar** for finding notifications  
- **Notification templates preview**  
- **Delivery timeline modal** showing event → channel → attempts → status
```

---
🏆 Why This Project Matters

Banks, fintech apps, and digital services depend on secure and timely notifications.

This system solves real problems:

  Missed OTPs

  Spoofed alerts

  SMS/email failures

  No audit trail

Your solution adds:

  Multi-channel reliability

  Anti-spoof message signatures

  Transparent analytics

  User trust
  
---
  
👨‍💻 Author

Lamjingba Ningombam
CSE Student — Assam Don Bosco University
 
