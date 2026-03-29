const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Base fetch helper
const fetchFromApi = async (endpoint, options = {}) => {
  const url = `${API_URL}/api${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    // Some endpoints returning non-JSON errors might exist, safely parse JSON
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.message || 'API Request Failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
};

// Store & Products
export const fetchFeaturedProducts = () => fetchFromApi('/products/featured');
export const fetchAllProducts = () => fetchFromApi('/products');
export const fetchCategories = () => fetchFromApi('/products/categories');
export const fetchProductById = (id) => fetchFromApi(`/products/${id}`);

// Orders & Checkout
export const submitOrder = (orderData) => fetchFromApi('/orders', {
  method: 'POST',
  body: JSON.stringify(orderData)
});

export const initializePayment = (paymentData) => fetchFromApi('/payment/initialize', {
  method: 'POST',
  body: JSON.stringify(paymentData)
});

// Contact Support
export const submitContactForm = (contactData) => fetchFromApi('/contact/send', {
  method: 'POST',
  body: JSON.stringify(contactData)
});
