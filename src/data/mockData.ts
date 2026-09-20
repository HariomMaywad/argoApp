import {
  DistributorProfile,
  Company,
  Product,
  Retailer,
  Poster,
  Order,
  Bill,
  Statement,
  PassbookEntry,
  PaymentReminder,
  AppNotification
} from '../types';
import { hashPin } from '../utils/security';
import {
  DEFAULT_FUNGICIDE,
  DEFAULT_PESTICIDE_BOTTLE,
  DEFAULT_FERTILIZER_BAG,
  DEFAULT_SEEDS_PACK,
  DEFAULT_HERBICIDE,
  POSTER_PRESETS
} from '../utils/presets';

export const INITIAL_DISTRIBUTOR_PROFILE: DistributorProfile = {
  companyName: "AgroRetail Distributors Pvt Ltd",
  ownerName: "Suresh Sharma",
  email: "contact@agroretaildistributors.com",
  phone: "9876543210",
  gstin: "07AAAAA0000A1Z5",
  address: "Main Mandi Road, Sector 14, Karnal, Haryana",
  city: "Karnal",
  state: "Haryana",
  bankName: "State Bank of India",
  accountNumber: "389201948210",
  ifscCode: "SBIN0001234",
  upiId: "agrodistributor@sbi"
};

export const INITIAL_COMPANIES: Company[] = [
  {
    id: "comp_1",
    name: "Bayer CropScience",
    logoUrl: "",
    description: "Leading global agricultural solutions, fungicides, and crop protection products.",
    contactPerson: "Amit Deshmukh",
    phone: "9823456781",
    email: "bayer.india@cropscience.com",
    isActive: true
  },
  {
    id: "comp_2",
    name: "Syngenta India",
    logoUrl: "",
    description: "Premier seeds, insecticides, and modern weed control technologies.",
    contactPerson: "Rajiv Saxena",
    phone: "9823456782",
    email: "contact@syngenta.in",
    isActive: true
  },
  {
    id: "comp_3",
    name: "UPL Limited",
    logoUrl: "",
    description: "Global sustainable agriculture products, bio-solutions, and herbicides.",
    contactPerson: "Vikram Singhania",
    phone: "9823456783",
    email: "support@upl-ltd.com",
    isActive: true
  },
  {
    id: "comp_4",
    name: "IFFCO",
    logoUrl: "",
    description: "World's largest farmers cooperative: Nano Urea, DAP, and water soluble fertilizers.",
    contactPerson: "Dr. S. K. Verma",
    phone: "9823456784",
    email: "info@iffco.in",
    isActive: true
  },
  {
    id: "comp_5",
    name: "Coromandel International",
    logoUrl: "",
    description: "Gromor brand high-quality specialty plant nutrition and crop protection.",
    contactPerson: "M. K. Reddy",
    phone: "9823456785",
    email: "gromor@coromandel.biz",
    isActive: true
  },
  {
    id: "comp_6",
    name: "Mahyco Seeds",
    logoUrl: "",
    description: "Hybrid seeds pioneer in cotton, maize, pearl millet, and vegetables.",
    contactPerson: "Pooja Barwale",
    phone: "9823456786",
    email: "sales@mahyco.com",
    isActive: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    itemCode: "BAY-NAT-100",
    itemName: "Nativo Fungicide",
    alias: "Nativo 75WG",
    company: "Bayer CropScience",
    category: "Fungicides",
    subCategory: "Systemic Fungicide",
    unit: "Grams",
    packSize: "100 gm",
    packing: "Pouch Box",
    purchaseRate: 720.0,
    sellingRate: 785.0,
    mrp: 890.0,
    gstPercent: 18.0,
    hsnCode: "38089290",
    barcode: "890123456001",
    openingStock: 120.0,
    currentStock: 85.0,
    description: "Tebuconazole 50% + Trifloxystrobin 25% WG broad spectrum fungicide for blast and sheath blight.",
    imageUrl: DEFAULT_FUNGICIDE,
    isActive: true,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 30 * 86400000
  },
  {
    id: "prod_2",
    itemCode: "SYN-AMP-200",
    itemName: "Ampligo Insecticide",
    alias: "Ampligo ZC",
    company: "Syngenta India",
    category: "Insecticides",
    subCategory: "Caterpillar & Borer Control",
    unit: "ml",
    packSize: "200 ml",
    packing: "Pet Bottle",
    purchaseRate: 1150.0,
    sellingRate: 1240.0,
    mrp: 1420.0,
    gstPercent: 18.0,
    hsnCode: "38089190",
    barcode: "890123456002",
    openingStock: 80.0,
    currentStock: 46.0,
    description: "Chlorantraniliprole 9.3% + Lambda-cyhalothrin 4.6% ZC for quick knockdown and long duration control.",
    imageUrl: DEFAULT_PESTICIDE_BOTTLE,
    isActive: true,
    createdAt: Date.now() - 28 * 86400000,
    updatedAt: Date.now() - 28 * 86400000
  },
  {
    id: "prod_3",
    itemCode: "IFF-NANO-500",
    itemName: "IFFCO Nano Urea Liquid",
    alias: "Nano Urea 4% N",
    company: "IFFCO",
    category: "Fertilizers",
    subCategory: "Nano Technology",
    unit: "Bottle",
    packSize: "500 ml",
    packing: "Carton of 24",
    purchaseRate: 205.0,
    sellingRate: 225.0,
    mrp: 240.0,
    gstPercent: 5.0,
    hsnCode: "31021000",
    barcode: "890123456003",
    openingStock: 500.0,
    currentStock: 320.0,
    description: "Eco-friendly liquid nitrogen fertilizer that replaces 1 conventional bag of urea.",
    imageUrl: DEFAULT_FERTILIZER_BAG,
    isActive: true,
    createdAt: Date.now() - 25 * 86400000,
    updatedAt: Date.now() - 25 * 86400000
  },
  {
    id: "prod_4",
    itemCode: "UPL-SAAF-500",
    itemName: "Saaf Fungicide",
    alias: "Saaf WP",
    company: "UPL Limited",
    category: "Fungicides",
    subCategory: "Dual Action",
    unit: "Grams",
    packSize: "500 gm",
    packing: "Pkt",
    purchaseRate: 380.0,
    sellingRate: 420.0,
    mrp: 485.0,
    gstPercent: 18.0,
    hsnCode: "38089210",
    barcode: "890123456004",
    openingStock: 200.0,
    currentStock: 140.0,
    description: "Carbendazim 12% + Mancozeb 63% WP proven contact and systemic fungicide.",
    imageUrl: DEFAULT_FUNGICIDE,
    isActive: true,
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 20 * 86400000
  },
  {
    id: "prod_5",
    itemCode: "COR-NPK-1KG",
    itemName: "Gromor NPK 19:19:19",
    alias: "100% Water Soluble 19-19-19",
    company: "Coromandel International",
    category: "Fertilizers",
    subCategory: "Water Soluble",
    unit: "Kg",
    packSize: "1 Kg",
    packing: "Polybags Box",
    purchaseRate: 125.0,
    sellingRate: 145.0,
    mrp: 175.0,
    gstPercent: 5.0,
    hsnCode: "31052000",
    barcode: "890123456005",
    openingStock: 350.0,
    currentStock: 210.0,
    description: "Balanced foliar grade fertilizer containing macro-nutrients in fully chelated form.",
    imageUrl: DEFAULT_FERTILIZER_BAG,
    isActive: true,
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 15 * 86400000
  },
  {
    id: "prod_6",
    itemCode: "MAH-COT-450",
    itemName: "Mahyco Bollgard II Cotton Seed",
    alias: "MRC-7351 BG II",
    company: "Mahyco Seeds",
    category: "Seeds",
    subCategory: "Bt Hybrid Cotton",
    unit: "Pkt",
    packSize: "475 gm",
    packing: "Certified Packet",
    purchaseRate: 780.0,
    sellingRate: 853.0,
    mrp: 853.0,
    gstPercent: 0.0,
    hsnCode: "12072100",
    barcode: "890123456006",
    openingStock: 150.0,
    currentStock: 90.0,
    description: "High yielding bollgard II hybrid cotton seed with excellent sucking pest tolerance.",
    imageUrl: DEFAULT_SEEDS_PACK,
    isActive: true,
    createdAt: Date.now() - 12 * 86400000,
    updatedAt: Date.now() - 12 * 86400000
  },
  {
    id: "prod_7",
    itemCode: "UPL-SWEEP-1L",
    itemName: "Sweep Power Herbicide",
    alias: "Glufosinate Ammonium 13.5% SL",
    company: "UPL Limited",
    category: "Herbicides",
    subCategory: "Non-Selective Weedicide",
    unit: "Ltr",
    packSize: "1 Ltr",
    packing: "Canister",
    purchaseRate: 690.0,
    sellingRate: 760.0,
    mrp: 880.0,
    gstPercent: 18.0,
    hsnCode: "38089340",
    barcode: "890123456007",
    openingStock: 100.0,
    currentStock: 58.0,
    description: "Fast acting broad-spectrum contact herbicide for plantation and non-cropped areas.",
    imageUrl: DEFAULT_HERBICIDE,
    isActive: true,
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 10 * 86400000
  },
  {
    id: "prod_8",
    itemCode: "BAY-CONF-100",
    itemName: "Confidor Insecticide",
    alias: "Imidacloprid 17.8% SL",
    company: "Bayer CropScience",
    category: "Insecticides",
    subCategory: "Neonicotinoid Systemic",
    unit: "ml",
    packSize: "100 ml",
    packing: "Bottle",
    purchaseRate: 290.0,
    sellingRate: 330.0,
    mrp: 390.0,
    gstPercent: 18.0,
    hsnCode: "38089120",
    barcode: "890123456008",
    openingStock: 180.0,
    currentStock: 115.0,
    description: "Effective against sucking pests like aphids, jassids, thrips, and whiteflies in various crops.",
    imageUrl: DEFAULT_PESTICIDE_BOTTLE,
    isActive: true,
    createdAt: Date.now() - 8 * 86400000,
    updatedAt: Date.now() - 8 * 86400000
  }
];

export const INITIAL_RETAILERS: Retailer[] = [
  {
    id: "ret_1",
    businessName: "Kisan Agro Agency",
    retailerName: "Ramesh Kumar",
    mobileNumber: "9876543210",
    pinHash: hashPin("1234"),
    address: "Shop 14, Mandi Complex, GT Road",
    city: "Karnal",
    state: "Haryana",
    gstNumber: "06AAAAA1234A1Z5",
    creditLimit: 200000.0,
    outstandingAmount: 38500.0,
    isActive: true,
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 1 * 86400000
  },
  {
    id: "ret_2",
    businessName: "Jai Kisan Beej Bhandar",
    retailerName: "Suresh Patel",
    mobileNumber: "9812345678",
    pinHash: hashPin("4321"),
    address: "Near Anaj Mandi, Station Road",
    city: "Ujjain",
    state: "Madhya Pradesh",
    gstNumber: "23BBBBB5678B1Z2",
    creditLimit: 150000.0,
    outstandingAmount: 14200.0,
    isActive: true,
    createdAt: Date.now() - 50 * 86400000,
    updatedAt: Date.now() - 2 * 86400000
  },
  {
    id: "ret_3",
    businessName: "Annapurna Krishi Kendra",
    retailerName: "Anil Sharma",
    mobileNumber: "9765432109",
    pinHash: hashPin("9999"),
    address: "Main Market, Bus Stand Road",
    city: "Nashik",
    state: "Maharashtra",
    gstNumber: "27CCCCC9012C1Z8",
    creditLimit: 300000.0,
    outstandingAmount: 0.0,
    isActive: true,
    createdAt: Date.now() - 40 * 86400000,
    updatedAt: Date.now() - 5 * 86400000
  }
];

const now = Date.now();

export const INITIAL_POSTERS: Poster[] = [
  {
    id: "poster_1",
    title: "Monsoon Mega Scheme: 10% Extra Margin",
    description: "Book 50+ boxes of Bayer Nativo or Ampligo this week and get an instant 10% volume discount voucher plus free transport.",
    imageUrl: POSTER_PRESETS[0].url,
    fileType: "IMAGE",
    startDate: now - (2 * 86400000),
    endDate: now + (25 * 86400000),
    priority: 1,
    isActive: true,
    createdAt: now - (2 * 86400000),
    updatedAt: now - (2 * 86400000),
    createdBy: "Admin",
    notificationTitle: "📢 Monsoon Mega Scheme Announced!",
    notificationMessage: "Enjoy 10% extra retailer margin on Nativo & Ampligo bookings."
  },
  {
    id: "poster_2",
    title: "Early Bird Booking: Certified Seeds",
    description: "High yielding certified wheat & mustard seeds now in stock. Guaranteed germination tested batches.",
    imageUrl: POSTER_PRESETS[1].url,
    fileType: "IMAGE",
    startDate: now - (5 * 86400000),
    endDate: now + (45 * 86400000),
    priority: 2,
    isActive: true,
    createdAt: now - (5 * 86400000),
    updatedAt: now - (5 * 86400000),
    createdBy: "Admin",
    notificationTitle: "🌾 Certified Seeds Available",
    notificationMessage: "Pre-book your seed quota now before stocks run out."
  },
  {
    id: "poster_3",
    title: "IFFCO Nano Fertilizer Stock Arrival",
    description: "Fresh stock of IFFCO Nano Urea & Nano DAP bottles arrived. Special dealer display racks provided on bulk orders.",
    imageUrl: POSTER_PRESETS[2].url,
    fileType: "IMAGE",
    startDate: now - (1 * 86400000),
    endDate: now + (20 * 86400000),
    priority: 3,
    isActive: true,
    createdAt: now - (1 * 86400000),
    updatedAt: now - (1 * 86400000),
    createdBy: "Admin",
    notificationTitle: "⚡ Nano Urea Fresh Stock",
    notificationMessage: "Stock up on high-demand Nano Urea 500ml."
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-2026-104821",
    retailerId: "ret_1",
    retailerName: "Ramesh Kumar",
    retailerBusinessName: "Kisan Agro Agency",
    retailerMobile: "9876543210",
    dateTime: now - (2 * 86400000),
    items: [
      {
        productId: "prod_1",
        itemCode: "BAY-NAT-100",
        itemName: "Nativo Fungicide",
        packSize: "100 gm",
        quantity: 20,
        rate: 785.0,
        gstPercent: 18.0,
        total: 18526.0,
        imageUrl: DEFAULT_FUNGICIDE
      },
      {
        productId: "prod_3",
        itemCode: "IFF-NANO-500",
        itemName: "IFFCO Nano Urea Liquid",
        packSize: "500 ml",
        quantity: 50,
        rate: 225.0,
        gstPercent: 5.0,
        total: 11812.5,
        imageUrl: DEFAULT_FERTILIZER_BAG
      }
    ],
    subTotal: 26950.0,
    gstTotal: 3388.5,
    grandTotal: 30338.5,
    notes: "Please dispatch via Karnal Transport Co.",
    status: "Dispatched",
    adminNotes: "LR No. 89123 attached",
    updatedAt: now - (1 * 86400000)
  },
  {
    id: "ORD-2026-105193",
    retailerId: "ret_1",
    retailerName: "Ramesh Kumar",
    retailerBusinessName: "Kisan Agro Agency",
    retailerMobile: "9876543210",
    dateTime: now - (3 * 3600000),
    items: [
      {
        productId: "prod_2",
        itemCode: "SYN-AMP-200",
        itemName: "Ampligo Insecticide",
        packSize: "200 ml",
        quantity: 10,
        rate: 1240.0,
        gstPercent: 18.0,
        total: 14632.0,
        imageUrl: DEFAULT_PESTICIDE_BOTTLE
      }
    ],
    subTotal: 12400.0,
    gstTotal: 2232.0,
    grandTotal: 14632.0,
    notes: "Urgent requirement for local farmers",
    status: "Pending",
    adminNotes: "",
    updatedAt: now - (3 * 3600000)
  }
];

export const INITIAL_BILLS: Bill[] = [
  {
    id: "bill_1",
    billNumber: "INV-2026-0842",
    retailerId: "ret_1",
    retailerName: "Kisan Agro Agency",
    billDate: now - (15 * 86400000),
    amount: 45000.0,
    pdfUrl: "https://example.com/bills/INV-2026-0842.pdf",
    originalFileName: "Tax_Invoice_0842.pdf",
    createdAt: now - (15 * 86400000)
  },
  {
    id: "bill_2",
    billNumber: "INV-2026-0915",
    retailerId: "ret_1",
    retailerName: "Kisan Agro Agency",
    billDate: now - (5 * 86400000),
    amount: 30338.5,
    pdfUrl: "https://example.com/bills/INV-2026-0915.pdf",
    originalFileName: "Tax_Invoice_0915.pdf",
    createdAt: now - (5 * 86400000)
  }
];

export const INITIAL_STATEMENTS: Statement[] = [
  {
    id: "stmt_1",
    retailerId: "ret_1",
    retailerName: "Kisan Agro Agency",
    documentType: "Account Statement",
    title: "Monthly Ledger Statement - Aug 2026",
    period: "01 Aug 2026 - 31 Aug 2026",
    pdfUrl: "https://example.com/statements/ret_1_aug26.pdf",
    originalFileName: "Statement_Aug_2026.pdf",
    uploadedAt: now - (18 * 86400000)
  },
  {
    id: "stmt_2",
    retailerId: "ret_1",
    retailerName: "Kisan Agro Agency",
    documentType: "Passbook",
    title: "Quarterly Passbook Summary Q2",
    period: "01 Jun 2026 - 31 Aug 2026",
    pdfUrl: "https://example.com/statements/ret_1_passbook_q2.pdf",
    originalFileName: "Passbook_Q2_Summary.pdf",
    uploadedAt: now - (10 * 86400000)
  }
];

export const INITIAL_PASSBOOK: PassbookEntry[] = [
  {
    id: "pb_1",
    retailerId: "ret_1",
    date: now - (30 * 86400000),
    invoiceNumber: "OB-AUG-26",
    description: "Opening Balance",
    debit: 18500.0,
    credit: 0.0,
    runningBalance: 18500.0
  },
  {
    id: "pb_2",
    retailerId: "ret_1",
    date: now - (20 * 86400000),
    invoiceNumber: "PAY-NEFT-9182",
    description: "Payment received via NEFT Bank Ref 9182",
    debit: 0.0,
    credit: 25000.0,
    runningBalance: 0.0
  },
  {
    id: "pb_3",
    retailerId: "ret_1",
    date: now - (15 * 86400000),
    invoiceNumber: "INV-2026-0842",
    description: "Tax Invoice INV-2026-0842 Goods Purchase",
    debit: 45000.0,
    credit: 0.0,
    runningBalance: 45000.0
  },
  {
    id: "pb_4",
    retailerId: "ret_1",
    date: now - (8 * 86400000),
    invoiceNumber: "PAY-UPI-0291",
    description: "Payment via UPI GPay Ref 0291",
    debit: 0.0,
    credit: 36838.5,
    runningBalance: 8161.5
  },
  {
    id: "pb_5",
    retailerId: "ret_1",
    date: now - (5 * 86400000),
    invoiceNumber: "INV-2026-0915",
    description: "Tax Invoice INV-2026-0915 Goods Purchase",
    debit: 30338.5,
    credit: 0.0,
    runningBalance: 38500.0
  }
];

export const INITIAL_REMINDERS: PaymentReminder[] = [
  {
    id: "rem_1",
    retailerId: "ret_1",
    retailerName: "Kisan Agro Agency",
    retailerMobile: "9876543210",
    outstandingAmount: 38500.0,
    dueDate: now + (5 * 86400000),
    message: "Dear Ramesh ji, please clear your outstanding invoice balance of ₹38,500 by this Friday.",
    createdAt: now - (1 * 86400000),
    isPaid: false
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif_1",
    title: "Order Dispatched: ORD-2026-104821",
    message: "Your order has been dispatched via Karnal Transport Co. LR No. 89123.",
    targetRetailerId: "ret_1",
    linkedType: "ORDER",
    linkedId: "ORD-2026-104821",
    timestamp: now - (1 * 86400000),
    isRead: false
  },
  {
    id: "notif_2",
    title: "New bill uploaded",
    message: "Bill #INV-2026-0915 for ₹30,338.50 has been uploaded to your account.",
    targetRetailerId: "ret_1",
    linkedType: "BILL",
    linkedId: "bill_2",
    timestamp: now - (5 * 86400000),
    isRead: true
  },
  {
    id: "notif_3",
    title: "📢 Special Offer: Monsoon Mega Scheme",
    message: "Enjoy 10% extra retailer margin on Nativo & Ampligo bookings.",
    targetRetailerId: "ALL",
    linkedType: "POSTER",
    linkedId: "poster_1",
    timestamp: now - (2 * 86400000),
    isRead: false
  }
];
