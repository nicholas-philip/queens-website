const mongoose = require("mongoose");
require("dotenv").config();

const run = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI not found in .env");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        
        const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({}, { strict: false }));
        const Category = mongoose.models.Category || mongoose.model("Category", new mongoose.Schema({}, { strict: false }));

        const products = await Product.find().lean();
        const categories = await Category.find().lean();

        console.log(`\n--- ALL CATEGORIES ---`);
        const catMap = {};
        categories.forEach(c => {
            console.log(`- ${c.name.padEnd(20)} | ID: ${c._id} | Slug: ${c.slug}`);
            catMap[c._id.toString()] = c.name;
            if (c.slug) catMap[c.slug] = c.name;
        });

        console.log(`\n--- PRODUCT CATEGORY AUDIT ---`);
        let inconsistentCount = 0;
        for (const p of products) {
            const catVal = p.category;
            const isActualObjectId = catVal instanceof mongoose.Types.ObjectId;
            const isStringObjectId = typeof catVal === 'string' && mongoose.Types.ObjectId.isValid(catVal);
            
            let status = "OK";
            if (!catVal) status = "MISSING";
            else if (isStringObjectId) {
                status = "INCONSISTENT (String format instead of ObjectId)";
                inconsistentCount++;
            } else if (!isActualObjectId && typeof catVal !== 'object') {
                status = "INCONSISTENT (Non-ObjectId type: " + typeof catVal + ")";
                inconsistentCount++;
            }

            console.log(`- ${p.title.padEnd(30)} | CatVal: ${String(catVal).padEnd(24)} | Status: ${p.status.padEnd(10)} | Audit: ${status}`);
        }

        console.log(`\nFound ${inconsistentCount} inconsistent products out of ${products.length}.`);
        process.exit(0);
    } catch (err) {
        console.error("Fatal Error:", err);
        process.exit(1);
    }
};

run();
