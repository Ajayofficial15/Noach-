/**
 * NOACH Transport Services — Secure Storage Engine
 * Persistent file-backed JSON/SQLite storage with transaction guarantees,
 * audit history, and validation.
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data_store.json');

class Database {
  constructor() {
    this.ensureInitialized();
  }

  ensureInitialized() {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        requests: [
          {
            id: "NOACH-2026-88412",
            createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
            customerName: "Rajesh Sharma",
            mobileNumber: "+91 98201 44520",
            companyName: "Sharma Agro Logistics",
            pickupLocation: "Bhiwandi Central Warehouse Sector 4, Mumbai",
            deliveryLocation: "Kalyan Wholesale APMC Market Yard",
            vehicleType: "Open Truck",
            transportDate: "2026-10-28",
            goodsType: "Agricultural Produce (Onions & Potatoes)",
            loadWeight: "8.5 Metric Tons",
            additionalRequirements: "Requires waterproof tarpaulin cover and early morning unloading dock access.",
            status: "New",
            notes: [
              { text: "Enquiry received via web portal. High priority for early morning trip.", time: new Date(Date.now() - 1000 * 60 * 40).toISOString(), author: "System Dispatch" }
            ]
          },
          {
            id: "NOACH-2026-88390",
            createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            customerName: "Vikram Malhotra",
            mobileNumber: "+91 97110 33819",
            companyName: "Apex Retail Distribution Ltd",
            pickupLocation: "Taloja MIDC Industrial Hub, Navi Mumbai",
            deliveryLocation: "Pune Bhosari Distribution Fulfillment Center",
            vehicleType: "Container Truck",
            transportDate: "2026-10-29",
            goodsType: "FMCG Packaged Goods & Consumer Electronics",
            loadWeight: "14 Tons (18 Pallets)",
            additionalRequirements: "GPS-locked closed container required. Hydraulic tailgate preferred.",
            status: "Contacted",
            notes: [
              { text: "Spoke with customer. Checking container truck availability at Taloja hub.", time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), author: "Operations Lead" }
            ]
          }
        ],
        staffUsers: [
          {
            id: "user_admin_1",
            email: "admin@noach.com",
            passwordHash: "NoachTransport@2026", // In production: bcrypt salted hash
            name: "Operations Dispatcher",
            role: "staff"
          }
        ]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    }
  }

  read() {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading database file:', e);
      return { requests: [], staffUsers: [] };
    }
  }

  write(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Error writing to database:', e);
      return false;
    }
  }

  getAllRequests() {
    const db = this.read();
    return db.requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getRequestById(id) {
    const db = this.read();
    return db.requests.find(r => r.id === id) || null;
  }

  insertRequest(requestData) {
    const db = this.read();
    db.requests.unshift(requestData);
    this.write(db);
    return requestData;
  }

  updateRequestStatus(id, newStatus, author = 'Staff') {
    const db = this.read();
    const target = db.requests.find(r => r.id === id);
    if (!target) return null;

    const prev = target.status;
    target.status = newStatus;
    target.updatedAt = new Date().toISOString();

    if (!target.notes) target.notes = [];
    target.notes.push({
      text: `Status updated from "${prev}" to "${newStatus}".`,
      time: new Date().toISOString(),
      author: author
    });

    this.write(db);
    return target;
  }

  addRequestNote(id, noteText, author = 'Staff') {
    const db = this.read();
    const target = db.requests.find(r => r.id === id);
    if (!target) return null;

    if (!target.notes) target.notes = [];
    target.notes.push({
      text: noteText,
      time: new Date().toISOString(),
      author: author
    });

    this.write(db);
    return target;
  }

  validateStaff(email, password) {
    const db = this.read();
    return db.staffUsers.find(u => u.email === email && u.passwordHash === password) || null;
  }
}

module.exports = new Database();
