const Ingredient = require('../models/Ingredient');

const calculateRisk = async (ingredientsList) => {
    // 🛡️ Guard Clause
    if (!ingredientsList || ingredientsList.length === 0) {
        return {
            status: "GREEN",
            totalRiskScore: 0,
            isChildSafe: true,
            harmfulIngredients: [],
            harmfulCount: 0,
            totalIngredientsScanned: 0
        };
    }

    // 1. Ingredients clean karo
    const productIngredients = ingredientsList.map(item => item.toLowerCase().trim());
    console.log("\n🔍 ANALYZING INGREDIENTS:", productIngredients);

    // 2. Load "All Poisons" from DB (Optimized: Sirf harmful load karo)
    // Ham har ingredient ke liye DB call nahi karenge, saare poisons ek baar me laayenge
    const allHarmful = await Ingredient.find({});

    let totalRiskScore = 0;
    let isChildSafe = true;
    const flaggedIngredients = [];

    // 3. THE DETECTIVE LOOP 🕵️‍♂️
    // Har ingredient ko check karo
    productIngredients.forEach(prodIng => {
        
        // Check against our Poison Database
        const foundPoison = allHarmful.find(dbPoison => {
            // Check 1: Exact Name Match
            if (prodIng === dbPoison.name) return true;

            // Check 2: Alias Match (Exact)
            if (dbPoison.aliases.includes(prodIng)) return true;

            // Check 3: Hidden Keyword Match (Partial Search)
            // Example: "Edible Vegetable Oil (Palmolein)" me "palmolein" dhundo
            if (prodIng.includes(dbPoison.name)) return true;
            
            // Aliases me bhi partial check karo
            return dbPoison.aliases.some(alias => prodIng.includes(alias));
        });

        if (foundPoison) {
            // Avoid duplicates in result (agar ek hi ingredient me 2 keyword mile)
            const alreadyFlagged = flaggedIngredients.find(i => i.name === foundPoison.name);
            
            if (!alreadyFlagged) {
                totalRiskScore += foundPoison.riskLevel;
                if (foundPoison.childUnsafe) isChildSafe = false;

                flaggedIngredients.push({
                    name: foundPoison.name,
                    riskCategory: foundPoison.riskCategory,
                    riskLevel: foundPoison.riskLevel,
                    description: foundPoison.description,
                    childUnsafe: foundPoison.childUnsafe,
                    detectedIn: prodIng // User ko dikhayenge ki kahan mila
                });
            }
        }
    });

    // 4. Status Determination
    let status = "GREEN";
    if (totalRiskScore >= 15) {
        status = "RED"; 
    } else if (totalRiskScore >= 7) {
        status = "YELLOW"; 
    }

    return {
        status,
        totalRiskScore,
        isChildSafe,
        harmfulIngredients: flaggedIngredients,
        harmfulCount: flaggedIngredients.length, // Corrected count
        totalIngredientsScanned: productIngredients.length
    };
};

module.exports = { calculateRisk };