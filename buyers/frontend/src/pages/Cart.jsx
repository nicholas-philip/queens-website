import React from 'react';
import { useCartStore } from '../store/useCartStore';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCartStore();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-24 bg-gray-50 px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 uppercase tracking-tight">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">Looks like you haven't added anything to your cart yet. Discover our latest collections.</p>
        <Link to="/shop" className="bg-black text-white px-8 py-4 rounded-md font-medium text-lg hover:bg-gray-800 transition-colors shadow-lg">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-10 uppercase">Your Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="lg:w-2/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.product._id} className="flex flex-col sm:flex-row gap-6 p-4 border border-gray-100 rounded-lg relative hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-32 aspect-square bg-gray-100 rounded-md overflow-hidden shrink-0">
                    <img 
                      src={item.product.images?.[0] || 'https://via.placeholder.com/150'} 
                      alt={item.product.name} 
                      className="object-cover w-full h-full object-center"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <Link to={`/product/${item.product._id}`} className="text-lg font-bold text-gray-900 hover:underline">
                          {item.product.name}
                        </Link>
                        <p className="font-semibold text-gray-900 hidden sm:block">
                          GHS {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{item.product.category}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button 
                          onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-l-md font-medium"
                        >-</button>
                        <span className="px-3 py-1 text-center w-10 font-medium border-x border-gray-300">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-r-md font-medium"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  {/* Mobile price */}
                  <div className="absolute top-4 right-4 sm:hidden">
                    <p className="font-semibold text-gray-900">
                      GHS {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-28">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6 uppercase">Order Summary</h2>
              
              <div className="space-y-4 text-gray-600 mb-8 border-b border-gray-100 pb-8">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">GHS {cartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Estimation</span>
                  <span className="font-medium text-gray-900">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">GHS 0.00</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-8">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">GHS {cartTotal().toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-4 px-8 bg-black text-white rounded-md font-medium text-lg hover:bg-gray-900 transition-colors shadow-lg shadow-gray-200 uppercase tracking-wide"
              >
                Proceed to Checkout
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-6 mt-4 flex items-center justify-center gap-2">
                🔒 Secure SSL encrypted payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
