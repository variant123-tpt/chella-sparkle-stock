// Local Storage operations for Chella Crackers

export interface Product {
  barcode: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  image?: string;
  createdAt: string;
}

export interface BillItem {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Bill {
  id: string;
  customerName?: string;
  customerMobile?: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
}

// Products Operations
export const addProduct = (product: Omit<Product, 'createdAt'>): void => {
  const products = getAllProducts();
  const existingIndex = products.findIndex(p => p.barcode === product.barcode);
  
  if (existingIndex >= 0) {
    // Update existing product quantity
    products[existingIndex] = {
      ...products[existingIndex],
      ...product,
      quantity: products[existingIndex].quantity + product.quantity,
    };
  } else {
    // Add new product
    products.push({
      ...product,
      createdAt: new Date().toISOString(),
    });
  }
  
  localStorage.setItem('chella_products', JSON.stringify(products));
};

export const getAllProducts = (): Product[] => {
  const products = localStorage.getItem('chella_products');
  return products ? JSON.parse(products) : [];
};

export const getProductByBarcode = (barcode: string): Product | null => {
  const products = getAllProducts();
  return products.find(p => p.barcode === barcode) || null;
};

export const updateStock = (barcode: string, quantity: number): void => {
  const products = getAllProducts();
  const productIndex = products.findIndex(p => p.barcode === barcode);
  
  if (productIndex >= 0) {
    products[productIndex].quantity = quantity;
    localStorage.setItem('chella_products', JSON.stringify(products));
  }
};

export const updateProduct = (barcode: string, updates: Partial<Product>): void => {
  const products = getAllProducts();
  const productIndex = products.findIndex(p => p.barcode === barcode);
  
  if (productIndex >= 0) {
    products[productIndex] = { ...products[productIndex], ...updates };
    localStorage.setItem('chella_products', JSON.stringify(products));
  }
};

export const deleteProduct = (barcode: string): void => {
  const products = getAllProducts();
  const filtered = products.filter(p => p.barcode !== barcode);
  localStorage.setItem('chella_products', JSON.stringify(filtered));
};

// Bills Operations
export const generateBill = (bill: Omit<Bill, 'id' | 'date'>): Bill => {
  const bills = getAllBills();
  const newBill: Bill = {
    ...bill,
    id: `BILL-${Date.now()}`,
    date: new Date().toISOString(),
  };
  
  bills.push(newBill);
  localStorage.setItem('chella_bills', JSON.stringify(bills));
  
  // Update stock quantities
  bill.items.forEach(item => {
    const product = getProductByBarcode(item.barcode);
    if (product) {
      updateStock(item.barcode, product.quantity - item.quantity);
    }
  });
  
  return newBill;
};

export const getAllBills = (): Bill[] => {
  const bills = localStorage.getItem('chella_bills');
  return bills ? JSON.parse(bills) : [];
};

export const getCustomerBills = (customerNameOrMobile: string): Bill[] => {
  const bills = getAllBills();
  return bills.filter(
    b => b.customerName === customerNameOrMobile || b.customerMobile === customerNameOrMobile
  );
};

export const getBillById = (id: string): Bill | null => {
  const bills = getAllBills();
  return bills.find(b => b.id === id) || null;
};

// Statistics
export const getTodayStats = () => {
  const bills = getAllBills();
  const today = new Date().toDateString();
  
  const todayBills = bills.filter(b => new Date(b.date).toDateString() === today);
  
  return {
    totalSales: todayBills.reduce((sum, b) => sum + b.total, 0),
    billsCount: todayBills.length,
  };
};

export const getTotalStats = () => {
  const products = getAllProducts();
  const bills = getAllBills();
  
  const uniqueCustomers = new Set(
    bills.map(b => b.customerMobile || b.customerName).filter(Boolean)
  );
  
  return {
    totalProducts: products.length,
    totalCustomers: uniqueCustomers.size,
    totalRevenue: bills.reduce((sum, b) => sum + b.total, 0),
  };
};
