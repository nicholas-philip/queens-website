import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Package, Loader2 } from 'lucide-react';
import api from '../../libs/api';

export default function LowStockWidget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We assume api.get('/admin/products/low-stock') is correctly mapped in your axios instance
    // If not, we'll use the raw axios/fetch if needed, but usually there's a pattern
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const { data } = await api.get('/admin/products/low-stock?threshold=5');
      // Flatten items to show specific variants if they are the reason for low stock
      const flattened = [];
      data.products.forEach(p => {
        if (p.hasVariants) {
          p.variants.forEach(v => {
            if (v.stockQuantity <= 5) {
              flattened.push({
                _id: p._id,
                title: p.title,
                size: v.attributes?.size || v.attributes?.Size,
                color: v.attributes?.color || v.attributes?.Color,
                stock: v.stockQuantity,
                image: v.image || p.images?.[0]
              });
            }
          });
        } else {
          flattened.push({
            _id: p._id,
            title: p.title,
            stock: p.stockQuantity,
            image: p.images?.[0]
          });
        }
      });
      setItems(flattened.slice(0, 6)); // Show top 6 alerts
    } catch (err) {
      console.error('Failed to fetch low stock alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 transition-all hover:border-yellow-600/20">
      <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-yellow-500/5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-yellow-500" />
          <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Inventory Alerts</h3>
        </div>
        <Link to="/products/low-stock" className="text-[10px] font-black uppercase text-yellow-500 hover:underline tracking-widest">
          Resolve All
        </Link>
      </div>

      <div className="p-2 space-y-1">
        {items.map((item, i) => (
          <Link
            key={`${item._id}-${i}`}
            to={`/products/${item._id}`}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-neutral-800 overflow-hidden border border-neutral-700 flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                  <Package size={16} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-neutral-200 truncate pr-2">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {(item.size || item.color) && (
                  <span className="text-[9px] font-black uppercase text-neutral-500 border border-neutral-800 px-1.5 py-0.5 rounded">
                    {item.size} {item.color}
                  </span>
                )}
                <span className={`text-[9px] font-black uppercase tracking-widest ${item.stock <= 2 ? 'text-red-500' : 'text-yellow-500'}`}>
                   {item.stock} LEFT
                </span>
              </div>
            </div>

            <ChevronRight size={14} className="text-neutral-700 group-hover:text-yellow-500 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="px-6 py-4 bg-neutral-800/20 text-center">
         <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">
           Proactive Stock replenishment recommended
         </p>
      </div>
    </div>
  );
}
