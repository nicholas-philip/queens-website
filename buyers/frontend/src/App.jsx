import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Contact from './pages/Contact';

// New Professional Pages
import About from './pages/About';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Phase 1 Essential Pages
import TrackOrder from './pages/TrackOrder';
import Rewards from './pages/Rewards';
import Blog from './pages/Blog';

// Phase 2 Interactive Extensibility Pages
import BeautyQuiz from './pages/BeautyQuiz';
import GiftCards from './pages/GiftCards';
import RequestReturn from './pages/RequestReturn';
import Wishlist from './pages/Wishlist';

// New Global Components
import CheckoutModal from './components/CheckoutModal';
import FloatingCart from './components/FloatingCart';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collections" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* New Professional Routes */}
            <Route path="/about" element={<About />} />
            <Route path="/shipping" element={<ShippingPolicy />} />
            <Route path="/returns-policy" element={<ReturnPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Phase 1 Core Feature Routes */}
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/blog" element={<Blog />} />

            {/* Phase 2 Interactive Extensibility Routes */}
            <Route path="/quiz" element={<BeautyQuiz />} />
            <Route path="/gift-cards" element={<GiftCards />} />
            <Route path="/returns" element={<RequestReturn />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Global Overlays */}
        <CheckoutModal />
        <FloatingCart />
      </div>
    </Router>
  );
};

export default App;