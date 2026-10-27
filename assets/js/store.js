/**
 * NOACH Transport Services — Unified Data Storage Layer
 * Manages customer vehicle requests, unique ID generation, real-time events,
 * and seamless fallback between local storage and backend REST API.
 */

(function () {
  const STORAGE_KEY = 'noach_vehicle_requests_v1';
  const listeners = [];

  class RequestStore {
    constructor() {
      this.init();
    }

    init() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Seed with realistic initial data
        const initial = window.NOACH_INITIAL_REQUESTS || [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    }

    // Subscribe to store updates
    subscribe(callback) {
      listeners.push(callback);
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      };
    }

    _notify() {
      const requests = this.getAll();
      listeners.forEach(cb => {
        try { cb(requests); } catch (e) { console.error('Store listener error:', e); }
      });
    }

    // Generate unique request ID: NOACH-2026-XXXXX
    generateId() {
      const year = new Date().getFullYear();
      const rand = Math.floor(10000 + Math.random() * 90000);
      return `NOACH-${year}-${rand}`;
    }

    // Get all requests
    getAll() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        const list = data ? JSON.parse(data) : [];
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (e) {
        console.error('Failed to parse requests from storage:', e);
        return [];
      }
    }

    // Get single request by ID
    getById(id) {
      const list = this.getAll();
      return list.find(r => r.id === id) || null;
    }

    // Add a new customer request
    async addRequest(formData) {
      const newRequest = {
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        customerName: formData.customerName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        companyName: formData.companyName ? formData.companyName.trim() : '',
        pickupLocation: formData.pickupLocation.trim(),
        deliveryLocation: formData.deliveryLocation.trim(),
        vehicleType: formData.vehicleType,
        transportDate: formData.transportDate,
        goodsType: formData.goodsType ? formData.goodsType.trim() : '',
        loadWeight: formData.loadWeight ? formData.loadWeight.trim() : '',
        additionalRequirements: formData.additionalRequirements ? formData.additionalRequirements.trim() : '',
        status: 'New', // Default status for fresh customer submissions
        notes: [
          {
            text: 'Vehicle request received via customer portal.',
            time: new Date().toISOString(),
            author: 'System Intake'
          }
        ]
      };

      // Try backend API first if online
      try {
        const res = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRequest)
        });
        if (res.ok) {
          const apiData = await res.json();
          if (apiData && apiData.request) {
            newRequest.id = apiData.request.id || newRequest.id;
          }
        }
      } catch (err) {
        // Backend offline or running static file; fallback gracefully to local store
      }

      // Save locally
      const list = this.getAll();
      list.unshift(newRequest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      this._notify();

      return newRequest;
    }

    // Update status: New, Contacted, Quotation Sent, Confirmed, Completed, Cancelled
    async updateStatus(id, newStatus, staffAuthor = 'Staff Operations') {
      const validStatuses = ['New', 'Contacted', 'Quotation Sent', 'Confirmed', 'Completed', 'Cancelled'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }

      const list = this.getAll();
      const target = list.find(r => r.id === id);
      if (!target) return null;

      const prevStatus = target.status;
      target.status = newStatus;
      target.updatedAt = new Date().toISOString();

      if (!target.notes) target.notes = [];
      target.notes.push({
        text: `Status changed from "${prevStatus}" to "${newStatus}".`,
        time: new Date().toISOString(),
        author: staffAuthor
      });

      // Try backend API
      try {
        await fetch(`/api/requests/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, author: staffAuthor })
        });
      } catch (e) {
        // Fallback local
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      this._notify();
      return target;
    }

    // Add internal staff note to a request
    async addNote(id, noteText, author = 'Staff') {
      if (!noteText || !noteText.trim()) return null;
      const list = this.getAll();
      const target = list.find(r => r.id === id);
      if (!target) return null;

      if (!target.notes) target.notes = [];
      target.notes.push({
        text: noteText.trim(),
        time: new Date().toISOString(),
        author: author
      });

      try {
        await fetch(`/api/requests/${id}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: noteText.trim(), author })
        });
      } catch (e) {}

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      this._notify();
      return target;
    }

    // Aggregate statistics
    getStats() {
      const list = this.getAll();
      return {
        total: list.length,
        new: list.filter(r => r.status === 'New').length,
        contacted: list.filter(r => r.status === 'Contacted').length,
        quotationSent: list.filter(r => r.status === 'Quotation Sent').length,
        confirmed: list.filter(r => r.status === 'Confirmed').length,
        completed: list.filter(r => r.status === 'Completed').length,
        cancelled: list.filter(r => r.status === 'Cancelled').length
      };
    }

    // Export requests as CSV
    exportCSV() {
      const list = this.getAll();
      if (!list.length) return;

      const headers = ['Request ID', 'Created At', 'Customer Name', 'Mobile Number', 'Company', 'Pickup', 'Delivery', 'Vehicle Type', 'Transport Date', 'Goods Type', 'Load Weight', 'Status'];
      const rows = list.map(r => [
        `"${r.id}"`,
        `"${new Date(r.createdAt).toLocaleString()}"`,
        `"${(r.customerName || '').replace(/"/g, '""')}"`,
        `"${(r.mobileNumber || '').replace(/"/g, '""')}"`,
        `"${(r.companyName || '').replace(/"/g, '""')}"`,
        `"${(r.pickupLocation || '').replace(/"/g, '""')}"`,
        `"${(r.deliveryLocation || '').replace(/"/g, '""')}"`,
        `"${r.vehicleType || ''}"`,
        `"${r.transportDate || ''}"`,
        `"${(r.goodsType || '').replace(/"/g, '""')}"`,
        `"${(r.loadWeight || '').replace(/"/g, '""')}"`,
        `"${r.status || ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NOACH_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  window.NoachStore = new RequestStore();
})();
