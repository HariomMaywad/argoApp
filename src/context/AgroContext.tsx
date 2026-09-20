import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Retailer,
  Product,
  Company,
  Order,
  OrderStatus,
  Bill,
  Statement,
  PassbookEntry,
  Poster,
  AppNotification,
  PaymentReminder,
  ImportHistoryItem,
  DistributorProfile,
  CartItem
} from '../types';
import {
  INITIAL_DISTRIBUTOR_PROFILE,
  INITIAL_COMPANIES,
  INITIAL_PRODUCTS,
  INITIAL_RETAILERS,
  INITIAL_POSTERS,
  INITIAL_ORDERS,
  INITIAL_BILLS,
  INITIAL_STATEMENTS,
  INITIAL_PASSBOOK,
  INITIAL_REMINDERS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { verifyPin, hashPin } from '../utils/security';
import { getAutomaticProductPhoto } from '../utils/presets';

interface AgroContextType {
  // Auth & Mode Navigation
  currentUser: User | null;
  currentRetailer: Retailer | null;
  userRole: UserRole | null;
  role: UserRole;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  activeRetailerTab: string;
  setActiveRetailerTab: (tab: string) => void;
  loginRetailer: (mobile: string, pin: string) => { success: boolean; error?: string };
  loginAdmin: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  quickSwitchRole: (role: UserRole, retailerId?: string) => void;

  // Data
  distributorProfile: DistributorProfile;
  products: Product[];
  retailers: Retailer[];
  companies: Company[];
  orders: Order[];
  bills: Bill[];
  statements: Statement[];
  passbookEntries: PassbookEntry[];
  posters: Poster[];
  notifications: AppNotification[];
  paymentReminders: PaymentReminder[];
  importHistory: ImportHistoryItem[];

  // Retailer scoped data
  currentRetailerOrders: Order[];
  currentRetailerBills: Bill[];
  currentRetailerPassbook: PassbookEntry[];
  currentRetailerStatements: Statement[];

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartGstTotal: number;
  cartGrandTotal: number;

  // Actions
  placeOrder: (notes?: string) => { success: boolean; orderId?: string; id?: string; error?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus, adminNotes?: string) => void;
  saveProduct: (product: Partial<Product>) => void;
  toggleProductActive: (productId: string) => void;
  deleteProduct: (productId: string) => void;
  saveRetailer: (retailer: Partial<Retailer>, rawPin?: string) => void;
  toggleRetailerActive: (retailerId: string) => void;
  saveCompany: (company: Partial<Company>) => void;
  toggleCompanyActive: (companyId: string) => void;
  savePoster: (poster: Partial<Poster>, sendPushNotification?: boolean) => void;
  togglePosterActive: (posterId: string) => void;
  deletePoster: (posterId: string) => void;
  uploadBill: (retailerId: string, billNumber: string, amount: number, billDate: number, fileName: string, pdfUrl: string) => void;
  uploadStatement: (retailerId: string, documentType: string, title: string, period: string, fileName: string, pdfUrl: string) => void;
  addPassbookEntry: (retailerId: string, invoiceNumber: string, description: string, debit: number, credit: number) => void;
  createPaymentReminder: (retailerId: string, dueDate: number, message: string) => void;
  markReminderPaid: (reminderId: string) => void;
  deleteReminder: (reminderId: string) => void;
  sendNotification: (title: string, message: string, targetRetailerId: string, linkedType?: AppNotification['linkedType'], linkedId?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateDistributorProfile: (profile: DistributorProfile) => void;
  executeImport: (
    items: Partial<Product>[],
    importMode: 'NEW_ONLY' | 'NEW_AND_UPDATE',
    stockMode: 'REPLACE' | 'ADD',
    fileName: string
  ) => ImportHistoryItem;
  resetDemoData: () => void;
  resetToDefaults: () => void;
  changeRetailerPin: (oldPin: string, newPin: string) => boolean;
}

const AgroContext = createContext<AgroContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`agro_${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error(`Error loading agro_${key}`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`agro_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving agro_${key}`, e);
  }
}

export const AgroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage<User | null>('current_user', {
      id: 'admin_1',
      name: 'Distributor Admin',
      email: 'admin@agroretail.com',
      mobileNumber: '9876543210',
      role: 'ADMIN',
      retailerId: ''
    })
  );

  // Entities
  const [distributorProfile, setDistributorProfile] = useState<DistributorProfile>(() =>
    loadFromStorage('distributor_profile', INITIAL_DISTRIBUTOR_PROFILE)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage('products', INITIAL_PRODUCTS)
  );
  const [retailers, setRetailers] = useState<Retailer[]>(() =>
    loadFromStorage('retailers', INITIAL_RETAILERS)
  );
  const [companies, setCompanies] = useState<Company[]>(() =>
    loadFromStorage('companies', INITIAL_COMPANIES)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('orders', INITIAL_ORDERS)
  );
  const [bills, setBills] = useState<Bill[]>(() =>
    loadFromStorage('bills', INITIAL_BILLS)
  );
  const [statements, setStatements] = useState<Statement[]>(() =>
    loadFromStorage('statements', INITIAL_STATEMENTS)
  );
  const [passbookEntries, setPassbookEntries] = useState<PassbookEntry[]>(() =>
    loadFromStorage('passbook', INITIAL_PASSBOOK)
  );
  const [posters, setPosters] = useState<Poster[]>(() =>
    loadFromStorage('posters', INITIAL_POSTERS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>(() =>
    loadFromStorage('reminders', INITIAL_REMINDERS)
  );
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>(() =>
    loadFromStorage('import_history', [])
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage('cart', [])
  );

  // Sync to localStorage
  useEffect(() => saveToStorage('current_user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('distributor_profile', distributorProfile), [distributorProfile]);
  useEffect(() => saveToStorage('products', products), [products]);
  useEffect(() => saveToStorage('retailers', retailers), [retailers]);
  useEffect(() => saveToStorage('companies', companies), [companies]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('bills', bills), [bills]);
  useEffect(() => saveToStorage('statements', statements), [statements]);
  useEffect(() => saveToStorage('passbook', passbookEntries), [passbookEntries]);
  useEffect(() => saveToStorage('posters', posters), [posters]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('reminders', paymentReminders), [paymentReminders]);
  useEffect(() => saveToStorage('import_history', importHistory), [importHistory]);
  useEffect(() => saveToStorage('cart', cart), [cart]);

  const currentRetailer = currentUser?.role === 'RETAILER'
    ? retailers.find(r => r.id === currentUser.retailerId) || null
    : null;

  // Login methods
  const loginRetailer = (mobile: string, pin: string) => {
    const trimmedMobile = mobile.trim();
    const retailer = retailers.find(r => r.mobileNumber === trimmedMobile);
    if (!retailer) {
      return { success: false, error: 'Mobile number not registered. Please contact distributor.' };
    }
    if (!retailer.isActive) {
      return { success: false, error: 'Your account is deactivated. Please contact distributor.' };
    }
    if (!verifyPin(pin, retailer.pinHash)) {
      return { success: false, error: 'Invalid PIN entered. Please try again.' };
    }

    const user: User = {
      id: retailer.id,
      name: retailer.retailerName,
      email: retailer.email || `${trimmedMobile}@agroretail.com`,
      mobileNumber: retailer.mobileNumber,
      role: 'RETAILER',
      retailerId: retailer.id
    };
    setCurrentUser(user);
    return { success: true };
  };

  const loginAdmin = (email: string, pass: string) => {
    if (email.trim().toLowerCase() === 'admin@agroretail.com' && (pass === 'admin123' || pass === 'admin')) {
      const user: User = {
        id: 'admin_1',
        name: distributorProfile.ownerName || 'Distributor Admin',
        email: email.trim(),
        mobileNumber: distributorProfile.phone,
        role: 'ADMIN',
        retailerId: ''
      };
      setCurrentUser(user);
      return { success: true };
    }
    // Also accept any valid admin credentials for prototype ease
    if (pass.length >= 4) {
      const user: User = {
        id: 'admin_1',
        name: distributorProfile.ownerName || 'Distributor Admin',
        email: email.trim() || 'admin@agroretail.com',
        mobileNumber: distributorProfile.phone,
        role: 'ADMIN',
        retailerId: ''
      };
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, error: 'Invalid admin credentials.' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const quickSwitchRole = (role: UserRole, retailerId?: string) => {
    if (role === 'ADMIN') {
      setCurrentUser({
        id: 'admin_1',
        name: 'Distributor Admin',
        email: 'admin@agroretail.com',
        mobileNumber: distributorProfile.phone,
        role: 'ADMIN',
        retailerId: ''
      });
    } else {
      const targetRet = retailers.find(r => r.id === retailerId) || retailers[0];
      if (targetRet) {
        setCurrentUser({
          id: targetRet.id,
          name: targetRet.retailerName,
          email: targetRet.email || `${targetRet.mobileNumber}@agroretail.com`,
          mobileNumber: targetRet.mobileNumber,
          role: 'RETAILER',
          retailerId: targetRet.id
        });
      }
    }
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.sellingRate * item.quantity), 0);
  const cartGstTotal = cart.reduce((sum, item) => {
    const rateTotal = item.product.sellingRate * item.quantity;
    return sum + (rateTotal * (item.product.gstPercent / 100));
  }, 0);
  const cartGrandTotal = cartSubtotal + cartGstTotal;

  // Place order
  const placeOrder = (notes: string = ''): { success: boolean; orderId?: string; id?: string; error?: string } => {
    if (!currentRetailer) {
      return { success: false, error: 'Only logged-in retailers can place orders' };
    }
    if (cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    const orderId = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const items = cart.map(item => {
      const rate = item.product.sellingRate;
      const total = rate * item.quantity * (1 + item.product.gstPercent / 100);
      return {
        productId: item.product.id,
        itemCode: item.product.itemCode,
        itemName: item.product.itemName,
        packSize: item.product.packSize,
        quantity: item.quantity,
        rate,
        gstPercent: item.product.gstPercent,
        total,
        imageUrl: item.product.imageUrl
      };
    });

    const subTotal = cartSubtotal;
    const gstTotal = cartGstTotal;
    const grandTotal = cartGrandTotal;

    const newOrder: Order = {
      id: orderId,
      retailerId: currentRetailer.id,
      retailerName: currentRetailer.retailerName,
      retailerBusinessName: currentRetailer.businessName,
      retailerMobile: currentRetailer.mobileNumber,
      dateTime: Date.now(),
      items,
      subTotal,
      gstTotal,
      grandTotal,
      notes,
      status: 'Pending',
      adminNotes: '',
      updatedAt: Date.now()
    };

    // Deduct stock
    setProducts(prev =>
      prev.map(prod => {
        const cartItem = cart.find(ci => ci.product.id === prod.id);
        if (cartItem) {
          return {
            ...prod,
            currentStock: Math.max(0, prod.currentStock - cartItem.quantity)
          };
        }
        return prod;
      })
    );

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Notify Admin
    sendNotification(
      `New Order Received: ${orderId}`,
      `${currentRetailer.businessName} placed order worth ₹${grandTotal.toFixed(2)} (${items.length} items)`,
      'ADMIN',
      'ORDER',
      orderId
    );

    // Notify Retailer
    sendNotification(
      `Order Placed: ${orderId}`,
      `Your order for ₹${grandTotal.toFixed(2)} is received by ${distributorProfile.companyName} and is Pending confirmation.`,
      currentRetailer.id,
      'ORDER',
      orderId
    );

    return { success: true, orderId, id: orderId };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, adminNotes: string = '') => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updated = {
            ...ord,
            status,
            adminNotes: adminNotes || ord.adminNotes,
            updatedAt: Date.now()
          };

          // Send notification to retailer
          sendNotification(
            `Order ${status}: ${ord.id}`,
            `Status updated to "${status}". ${adminNotes ? 'Note: ' + adminNotes : ''}`,
            ord.retailerId,
            'ORDER',
            ord.id
          );

          return updated;
        }
        return ord;
      })
    );
  };

  // Product management
  const saveProduct = (prodData: Partial<Product>) => {
    const isEdit = !!prodData.id;
    const now = Date.now();
    const autoPhoto = prodData.imageUrl || getAutomaticProductPhoto(prodData.category || '', prodData.itemName || '');

    if (isEdit) {
      setProducts(prev =>
        prev.map(p => (p.id === prodData.id ? { ...p, ...prodData, updatedAt: now } as Product : p))
      );
    } else {
      const newProduct: Product = {
        id: `prod_${Date.now()}`,
        itemCode: prodData.itemCode || `ITEM-${Math.floor(1000 + Math.random() * 9000)}`,
        itemName: prodData.itemName || 'New Product',
        alias: prodData.alias || '',
        company: prodData.company || 'Bayer CropScience',
        category: prodData.category || 'Fungicides',
        subCategory: prodData.subCategory || '',
        unit: prodData.unit || 'Bottle',
        packSize: prodData.packSize || '500 ml',
        packing: prodData.packing || 'Box',
        purchaseRate: Number(prodData.purchaseRate) || 0,
        sellingRate: Number(prodData.sellingRate) || 0,
        mrp: Number(prodData.mrp) || 0,
        gstPercent: Number(prodData.gstPercent) || 18,
        hsnCode: prodData.hsnCode || '38089190',
        barcode: prodData.barcode || '',
        openingStock: Number(prodData.openingStock) || 0,
        currentStock: Number(prodData.currentStock ?? prodData.openingStock) || 0,
        description: prodData.description || '',
        imageUrl: autoPhoto,
        isActive: prodData.isActive ?? true,
        createdAt: now,
        updatedAt: now
      };
      setProducts(prev => [newProduct, ...prev]);
    }
  };

  const toggleProductActive = (productId: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, isActive: !p.isActive, updatedAt: Date.now() } : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Retailer management
  const saveRetailer = (retData: Partial<Retailer>, rawPin?: string) => {
    const isEdit = !!retData.id;
    const now = Date.now();
    const pinH = rawPin ? hashPin(rawPin) : (retData.pinHash || hashPin('1234'));

    if (isEdit) {
      setRetailers(prev =>
        prev.map(r => (r.id === retData.id ? { ...r, ...retData, pinHash: pinH, updatedAt: now } as Retailer : r))
      );
    } else {
      const newRet: Retailer = {
        id: `ret_${Date.now()}`,
        businessName: retData.businessName || 'New Agency',
        retailerName: retData.retailerName || 'Dealer',
        mobileNumber: retData.mobileNumber || '',
        alternatePhone: retData.alternatePhone || '',
        email: retData.email || '',
        pinHash: pinH,
        address: retData.address || '',
        city: retData.city || '',
        state: retData.state || '',
        gstNumber: retData.gstNumber || '',
        creditLimit: Number(retData.creditLimit) || 100000,
        outstandingAmount: Number(retData.outstandingAmount) || 0,
        isActive: retData.isActive ?? true,
        createdAt: now,
        updatedAt: now
      };
      setRetailers(prev => [...prev, newRet]);
    }
  };

  const toggleRetailerActive = (retailerId: string) => {
    setRetailers(prev =>
      prev.map(r => (r.id === retailerId ? { ...r, isActive: !r.isActive, updatedAt: Date.now() } : r))
    );
  };

  // Company management
  const saveCompany = (compData: Partial<Company>) => {
    const isEdit = !!compData.id;
    if (isEdit) {
      setCompanies(prev => prev.map(c => (c.id === compData.id ? { ...c, ...compData } as Company : c)));
    } else {
      const newComp: Company = {
        id: `comp_${Date.now()}`,
        name: compData.name || 'New Agro Co',
        logoUrl: compData.logoUrl || '',
        description: compData.description || '',
        contactPerson: compData.contactPerson || '',
        phone: compData.phone || '',
        email: compData.email || '',
        isActive: compData.isActive ?? true
      };
      setCompanies(prev => [...prev, newComp]);
    }
  };

  const toggleCompanyActive = (companyId: string) => {
    setCompanies(prev =>
      prev.map(c => (c.id === companyId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Poster management
  const savePoster = (posterData: Partial<Poster>, sendPushNotification = false) => {
    const isEdit = !!posterData.id;
    const now = Date.now();

    if (isEdit) {
      setPosters(prev =>
        prev.map(p => (p.id === posterData.id ? { ...p, ...posterData, updatedAt: now } as Poster : p))
      );
    } else {
      const newPoster: Poster = {
        id: `poster_${Date.now()}`,
        title: posterData.title || 'Special Agricultural Offer',
        description: posterData.description || '',
        imageUrl: posterData.imageUrl || INITIAL_POSTERS[0].imageUrl,
        fileType: posterData.fileType || 'IMAGE',
        startDate: posterData.startDate || now,
        endDate: posterData.endDate || now + (30 * 86400000),
        priority: posterData.priority || 1,
        isActive: posterData.isActive ?? true,
        createdAt: now,
        updatedAt: now,
        createdBy: 'Admin',
        notificationTitle: posterData.notificationTitle || `📢 ${posterData.title}`,
        notificationMessage: posterData.notificationMessage || posterData.description || ''
      };
      setPosters(prev => [newPoster, ...prev]);

      if (sendPushNotification) {
        sendNotification(
          newPoster.notificationTitle,
          newPoster.notificationMessage,
          'ALL',
          'POSTER',
          newPoster.id
        );
      }
    }
  };

  const togglePosterActive = (posterId: string) => {
    setPosters(prev =>
      prev.map(p => (p.id === posterId ? { ...p, isActive: !p.isActive, updatedAt: Date.now() } : p))
    );
  };

  const deletePoster = (posterId: string) => {
    setPosters(prev => prev.filter(p => p.id !== posterId));
  };

  // Bills & Invoices
  const uploadBill = (
    retailerId: string,
    billNumber: string,
    amount: number,
    billDate: number,
    fileName: string,
    pdfUrl: string
  ) => {
    const retailer = retailers.find(r => r.id === retailerId);
    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      billNumber,
      retailerId,
      retailerName: retailer?.businessName || 'Retailer',
      billDate,
      amount,
      pdfUrl: pdfUrl || `https://example.com/bills/${billNumber}.pdf`,
      originalFileName: fileName || `${billNumber}.pdf`,
      createdAt: Date.now()
    };
    setBills(prev => [newBill, ...prev]);

    // Automatically debit passbook ledger and update retailer outstanding
    addPassbookEntry(
      retailerId,
      billNumber,
      `Tax Invoice ${billNumber} Goods Purchase`,
      amount,
      0
    );

    // Update retailer outstanding amount
    setRetailers(prev =>
      prev.map(r => (r.id === retailerId ? { ...r, outstandingAmount: r.outstandingAmount + amount } : r))
    );

    // Notify retailer
    sendNotification(
      `New Invoice Uploaded: ${billNumber}`,
      `Invoice #${billNumber} for ₹${amount.toFixed(2)} has been added to your ledger.`,
      retailerId,
      'BILL',
      newBill.id
    );
  };

  // Statements
  const uploadStatement = (
    retailerId: string,
    documentType: string,
    title: string,
    period: string,
    fileName: string,
    pdfUrl: string
  ) => {
    const retailer = retailers.find(r => r.id === retailerId);
    const newStmt: Statement = {
      id: `stmt_${Date.now()}`,
      retailerId,
      retailerName: retailer?.businessName || 'Retailer',
      documentType,
      title,
      period,
      pdfUrl: pdfUrl || `https://example.com/statements/${fileName}.pdf`,
      originalFileName: fileName,
      uploadedAt: Date.now()
    };
    setStatements(prev => [newStmt, ...prev]);

    sendNotification(
      `New Statement Available: ${title}`,
      `Your ${documentType} for ${period} is now available to view & download.`,
      retailerId,
      'STATEMENT',
      newStmt.id
    );
  };

  // Passbook
  const addPassbookEntry = (
    retailerId: string,
    invoiceNumber: string,
    description: string,
    debit: number,
    credit: number
  ) => {
    setPassbookEntries(prev => {
      const retailerEntries = prev.filter(e => e.retailerId === retailerId);
      const lastEntry = retailerEntries[retailerEntries.length - 1];
      const previousBal = lastEntry ? lastEntry.runningBalance : 0;
      const runningBalance = previousBal + debit - credit;

      const newEntry: PassbookEntry = {
        id: `pb_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        retailerId,
        date: Date.now(),
        invoiceNumber,
        description,
        debit,
        credit,
        runningBalance
      };
      return [...prev, newEntry];
    });

    if (credit > 0) {
      // Payment received! Reduce outstanding
      setRetailers(prev =>
        prev.map(r => (r.id === retailerId ? { ...r, outstandingAmount: Math.max(0, r.outstandingAmount - credit) } : r))
      );
    }
  };

  // Payment reminders
  const createPaymentReminder = (retailerId: string, dueDate: number, message: string) => {
    const retailer = retailers.find(r => r.id === retailerId);
    if (!retailer) return;

    const newReminder: PaymentReminder = {
      id: `rem_${Date.now()}`,
      retailerId,
      retailerName: retailer.businessName,
      retailerMobile: retailer.mobileNumber,
      outstandingAmount: retailer.outstandingAmount,
      dueDate,
      message,
      createdAt: Date.now(),
      isPaid: false
    };

    setPaymentReminders(prev => [newReminder, ...prev]);

    sendNotification(
      'Payment Due Reminder',
      message || `Outstanding balance of ₹${retailer.outstandingAmount.toFixed(2)} is due.`,
      retailerId,
      'PAYMENT_REMINDER',
      newReminder.id
    );
  };

  const markReminderPaid = (reminderId: string) => {
    setPaymentReminders(prev =>
      prev.map(r => (r.id === reminderId ? { ...r, isPaid: true } : r))
    );
  };

  const deleteReminder = (reminderId: string) => {
    setPaymentReminders(prev => prev.filter(r => r.id !== reminderId));
  };

  // Notifications
  const sendNotification = (
    title: string,
    message: string,
    targetRetailerId: string,
    linkedType: AppNotification['linkedType'] = 'NONE',
    linkedId = ''
  ) => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      targetRetailerId,
      linkedType,
      linkedId,
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Distributor Profile
  const updateDistributorProfile = (profile: DistributorProfile) => {
    setDistributorProfile(profile);
  };

  // Excel / CSV Import execution
  const executeImport = (
    items: Partial<Product>[],
    importMode: 'NEW_ONLY' | 'NEW_AND_UPDATE',
    stockMode: 'REPLACE' | 'ADD',
    fileName: string
  ): ImportHistoryItem => {
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errorsCount = 0;
    const errorReport: string[] = [];

    const now = Date.now();
    const updatedProductsList = [...products];

    items.forEach((item, index) => {
      if (!item.itemName || !item.itemCode) {
        errorsCount++;
        errorReport.push(`Row ${index + 1}: Missing Item Code or Item Name.`);
        return;
      }

      const existingIndex = updatedProductsList.findIndex(
        p => p.itemCode.toLowerCase() === (item.itemCode || '').toLowerCase()
      );

      const parsedStock = Number(item.currentStock) || 0;

      if (existingIndex >= 0) {
        if (importMode === 'NEW_ONLY') {
          skippedCount++;
        } else {
          // NEW_AND_UPDATE
          const existing = updatedProductsList[existingIndex];
          const newStock = stockMode === 'ADD'
            ? existing.currentStock + parsedStock
            : parsedStock;

          updatedProductsList[existingIndex] = {
            ...existing,
            ...item,
            currentStock: newStock,
            imageUrl: item.imageUrl || existing.imageUrl || getAutomaticProductPhoto(item.category || existing.category, item.itemName),
            updatedAt: now
          } as Product;
          updatedCount++;
        }
      } else {
        // Brand new product
        const newProduct: Product = {
          id: `prod_imp_${now}_${index}`,
          itemCode: item.itemCode,
          itemName: item.itemName,
          alias: item.alias || '',
          company: item.company || 'Bayer CropScience',
          category: item.category || 'Fungicides',
          subCategory: item.subCategory || '',
          unit: item.unit || 'Bottle',
          packSize: item.packSize || '500 ml',
          packing: item.packing || 'Box',
          purchaseRate: Number(item.purchaseRate) || 0,
          sellingRate: Number(item.sellingRate) || 0,
          mrp: Number(item.mrp) || 0,
          gstPercent: Number(item.gstPercent) || 18,
          hsnCode: item.hsnCode || '38089190',
          barcode: item.barcode || '',
          openingStock: Number(item.openingStock) || parsedStock,
          currentStock: parsedStock,
          description: item.description || '',
          imageUrl: item.imageUrl || getAutomaticProductPhoto(item.category || '', item.itemName),
          isActive: true,
          createdAt: now,
          updatedAt: now
        };
        updatedProductsList.unshift(newProduct);
        importedCount++;
      }
    });

    setProducts(updatedProductsList);

    const historyItem: ImportHistoryItem = {
      id: `hist_${now}`,
      fileName,
      adminName: currentUser?.name || distributorProfile.ownerName,
      timestamp: now,
      totalRows: items.length,
      imported: importedCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorsCount,
      errorReport,
      stockImportMode: stockMode
    };

    setImportHistory(prev => [historyItem, ...prev]);
    return historyItem;
  };

  const resetDemoData = () => {
    localStorage.clear();
    setDistributorProfile(INITIAL_DISTRIBUTOR_PROFILE);
    setProducts(INITIAL_PRODUCTS);
    setRetailers(INITIAL_RETAILERS);
    setCompanies(INITIAL_COMPANIES);
    setOrders(INITIAL_ORDERS);
    setBills(INITIAL_BILLS);
    setStatements(INITIAL_STATEMENTS);
    setPassbookEntries(INITIAL_PASSBOOK);
    setPosters(INITIAL_POSTERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPaymentReminders(INITIAL_REMINDERS);
    setImportHistory([]);
    setCart([]);
  };

  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');
  const [activeRetailerTab, setActiveRetailerTab] = useState<string>('home');

  const effectiveRetailerId = currentRetailer?.id || currentUser?.retailerId || '';
  const currentRetailerOrders = orders.filter(o => o.retailerId === effectiveRetailerId);
  const currentRetailerBills = bills.filter(b => b.retailerId === effectiveRetailerId);
  const currentRetailerPassbook = passbookEntries.filter(p => p.retailerId === effectiveRetailerId);
  const currentRetailerStatements = statements.filter(s => s.retailerId === effectiveRetailerId);

  const changeRetailerPin = (oldPin: string, newPin: string): boolean => {
    if (!currentRetailer) return false;
    if (!verifyPin(oldPin, currentRetailer.pinHash)) {
      return false;
    }
    const newHash = hashPin(newPin);
    setRetailers(prev =>
      prev.map(r => (r.id === currentRetailer.id ? { ...r, pinHash: newHash, updatedAt: Date.now() } : r))
    );
    return true;
  };

  return (
    <AgroContext.Provider
      value={{
        currentUser,
        currentRetailer,
        userRole: currentUser?.role || null,
        role: currentUser?.role || 'ADMIN',
        activeAdminTab,
        setActiveAdminTab,
        activeRetailerTab,
        setActiveRetailerTab,
        loginRetailer,
        loginAdmin,
        logout,
        quickSwitchRole,

        distributorProfile,
        products,
        retailers,
        companies,
        orders,
        bills,
        statements,
        passbookEntries,
        posters,
        notifications,
        paymentReminders,
        importHistory,

        currentRetailerOrders,
        currentRetailerBills,
        currentRetailerPassbook,
        currentRetailerStatements,

        cart,
        addToCart,
        updateCartQuantity,
        updateCartItemQuantity: updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        cartGstTotal,
        cartGrandTotal,

        placeOrder,
        updateOrderStatus,
        saveProduct,
        toggleProductActive,
        deleteProduct,
        saveRetailer,
        toggleRetailerActive,
        saveCompany,
        toggleCompanyActive,
        savePoster,
        togglePosterActive,
        deletePoster,
        uploadBill,
        uploadStatement,
        addPassbookEntry,
        createPaymentReminder,
        markReminderPaid,
        deleteReminder,
        sendNotification,
        markNotificationRead,
        markAllNotificationsRead,
        updateDistributorProfile,
        executeImport,
        resetDemoData,
        resetToDefaults: resetDemoData,
        changeRetailerPin
      }}
    >
      {children}
    </AgroContext.Provider>
  );
};

export const useAgro = () => {
  const context = useContext(AgroContext);
  if (!context) {
    throw new Error('useAgro must be used within an AgroProvider');
  }
  return context;
};
