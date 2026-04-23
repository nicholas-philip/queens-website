const bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "No products provided." });
    }

    // Basic validation and formatting for each product
    const formatted = products.map(p => {
      // ✅ Generate SKU manually since insertMany skips hooks
      const random = Math.floor(1000 + Math.random() * 9000);
      const prefix = (p.title || "PRD").substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
      const generatedSKU = `${prefix}-${Date.now().toString().slice(-4)}-${random}`;

      return {
        ...p,
        SKU: p.SKU || generatedSKU,
        price: Number(p.price) || 0,
        priceSuffix: p.priceSuffix || "",
        stockQuantity: Number(p.stockQuantity) || 0,
        status: p.status || "Draft",
        slug: p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(-4)
      };
    });

    console.log(`📦 Attempting bulk insert of ${formatted.length} products...`);
    const created = await Product2.insertMany(formatted);
    
    // Update category counts
    const catCounts = {};
    created.forEach(p => { 
      if (p.category) {
        const id = p.category.toString();
        catCounts[id] = (catCounts[id] || 0) + 1;
      }
    });

    await Promise.all(
      Object.entries(catCounts).map(([id, n]) => 
        Category2.findByIdAndUpdate(id, { $inc: { productCount: n } })
      )
    );

    await logActivity3(req, "BULK_CREATED_PRODUCTS", `Created ${created.length} products`);
    res.status(201).json({ success: true, message: `Successfully created ${created.length} products.`, count: created.length });
  } catch (error) {
    console.error("Bulk Creation Error:", error);
    res.status(500).json({ success: false, message: error.message || "Bulk creation failed." });
  }
};
