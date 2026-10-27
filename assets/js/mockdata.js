// Initial seed data for NOACH Transport Services
// Provides realistic operations records for the Admin Dashboard demonstration

const INITIAL_REQUESTS = [
  {
    id: "NOACH-2026-88412",
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(), // 42 mins ago
    customerName: "Rajesh Sharma",
    mobileNumber: "+91 98201 44520",
    companyName: "Sharma Agro Logistics",
    pickupLocation: "Bhiwandi Central Warehouse Sector 4, Mumbai",
    deliveryLocation: "Kalyan Wholesale APMC Market Yard",
    vehicleType: "Open Truck",
    transportDate: "2026-10-28",
    goodsType: "Agricultural Produce (Onions & Potatoes in gunny sacks)",
    loadWeight: "8.5 Metric Tons",
    additionalRequirements: "Requires waterproof tarpaulin cover and early morning unloading dock access before 7:00 AM.",
    status: "New",
    notes: [
      { text: "Enquiry received via web portal. High priority for early morning trip.", time: new Date(Date.now() - 1000 * 60 * 40).toISOString(), author: "System Dispatch" }
    ]
  },
  {
    id: "NOACH-2026-88390",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    customerName: "Vikram Malhotra",
    mobileNumber: "+91 97110 33819",
    companyName: "Apex Retail Distribution Ltd",
    pickupLocation: "Taloja MIDC Industrial Hub, Navi Mumbai",
    deliveryLocation: "Pune Bhosari Distribution Fulfillment Center",
    vehicleType: "Container Truck",
    transportDate: "2026-10-29",
    goodsType: "FMCG Packaged Goods & Consumer Electronics",
    loadWeight: "14 Tons (18 Pallets)",
    additionalRequirements: "GPS-locked closed container required. Hydraulic tailgate preferred for ground unloading.",
    status: "Contacted",
    notes: [
      { text: "Spoke with Mr. Malhotra. Requested 32ft MXL Container. Checking fleet availability at Taloja hub.", time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), author: "Operations Lead" }
    ]
  },
  {
    id: "NOACH-2026-88315",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
    customerName: "Anita Desmond",
    mobileNumber: "+91 94480 61290",
    companyName: "Horizon Fabrications & Machinery",
    pickupLocation: "Chakan Industrial Phase II, Pune",
    deliveryLocation: "Hazira Port Logistics Terminal, Surat",
    vehicleType: "Open Truck",
    transportDate: "2026-10-31",
    goodsType: "Industrial Steel Beams & Fabricated Structural Units",
    loadWeight: "22 Tons",
    additionalRequirements: "Heavy duty trailer required with certified strapping. Side railing mandatory.",
    status: "Quotation Sent",
    notes: [
      { text: "Detailed commercial quote ₹48,500 sent via WhatsApp & email. Awaiting clearance from billing manager.", time: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), author: "Pricing Desk" }
    ]
  },
  {
    id: "NOACH-2026-88204",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    customerName: "Karthik Subramanian",
    mobileNumber: "+91 98450 12891",
    companyName: "Metro Electronics Hub",
    pickupLocation: "Hosur Road Industrial Area, Bengaluru",
    deliveryLocation: "Whitefield Tech Park Warehouse 3",
    vehicleType: "Mini Truck",
    transportDate: "2026-10-27",
    goodsType: "Computer Hardware & IT Peripherals in boxes",
    loadWeight: "1.2 Tons (35 boxes)",
    additionalRequirements: "Intra-city express transit. Fragile handling requested.",
    status: "Confirmed",
    notes: [
      { text: "Assigned Mini Truck (MH-04-ET-9182). Driver: Ramesh Kumar (+91 98112 00412). Gate pass issued.", time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), author: "Dispatch Coordinator" }
    ]
  },
  {
    id: "NOACH-2026-88102",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    customerName: "Sanjay Singhania",
    mobileNumber: "+91 98220 77114",
    companyName: "Singhania Paper Mills",
    pickupLocation: "Vapi GIDC Industrial Estate, Gujarat",
    deliveryLocation: "Bhiwandi Sector 6 Packaging Hub",
    vehicleType: "Container Truck",
    transportDate: "2026-10-24",
    goodsType: "Corrugated Paper Rolls & Raw Packaging Material",
    loadWeight: "16 Tons",
    additionalRequirements: "Moisture-sealed container required. All rolls strapped.",
    status: "Completed",
    notes: [
      { text: "Trip successfully delivered. Clean POD (Proof of Delivery) acknowledged by receiving manager.", time: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), author: "Fleet Manager" }
    ]
  }
];

// Export to window
window.NOACH_INITIAL_REQUESTS = INITIAL_REQUESTS;
