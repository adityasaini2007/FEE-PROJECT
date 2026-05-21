const staticData = {
    policies: [
        { id: 1, title: "PM-Kisan Samman Nidhi", desc: "Financial support to landholding farmers.", link: "https://pmkisan.gov.in/" },
        { id: 2, title: "Pradhan Mantri Fasal Bima Yojana", desc: "Crop insurance to protect against non-preventable natural risks.", link: "https://pmfby.gov.in/" },
        { id: 3, title: "Kisan Credit Card (KCC)", desc: "Short-term credit for crop and animal/fish rearing needs.", link: "https://www.myscheme.gov.in/schemes/kcc" },
        { id: 4, title: "Paramparagat Krishi Vikas Yojana", desc: "Promotes organic farming practices.", link: "https://pgsindia-ncof.gov.in/" },
        { id: 5, title: "National Agriculture Market (e-NAM)", desc: "Pan-India electronic trading portal for agricultural commodities.", link: "https://www.enam.gov.in/" }
    ],
    helplines: [
        { department: "Kisan Call Center", number: "1800-180-1551", category: "General" },
        { department: "Agri-Clinic", number: "1800-180-1551", category: "Consulting" },
        { department: "National Weather Help", number: "1800-180-1717", category: "Weather" }
    ],
    soilCropSuggestions: {
        "Alluvial": ["Rice", "Wheat", "Sugarcane", "Cotton"],
        "Black":    ["Cotton", "Soybean", "Groundnut"],
        "Red":      ["Millets", "Pulses", "Tobacco"],
        "Laterite": ["Tea", "Coffee", "Rubber", "Coconut"],
        "Arid":     ["Bajra", "Pulses", "Guar"]
    },

    /* ── Per-soil NPK profiles (seasonal estimates) ── */
    npkBySoil: {
        "Alluvial": {
            labels:     ["Spring", "Summer", "Monsoon", "Winter"],
            nitrogen:   [55, 48, 38, 44],
            phosphorus: [28, 24, 20, 25],
            potassium:  [40, 33, 28, 32]
        },
        "Black": {
            labels:     ["Spring", "Summer", "Monsoon", "Winter"],
            nitrogen:   [42, 38, 30, 35],
            phosphorus: [22, 18, 14, 20],
            potassium:  [50, 44, 36, 42]
        },
        "Red": {
            labels:     ["Spring", "Summer", "Monsoon", "Winter"],
            nitrogen:   [28, 24, 18, 22],
            phosphorus: [12, 10, 8,  11],
            potassium:  [22, 18, 14, 17]
        },
        "Laterite": {
            labels:     ["Spring", "Summer", "Monsoon", "Winter"],
            nitrogen:   [20, 17, 13, 16],
            phosphorus: [8,  7,  5,  7 ],
            potassium:  [15, 12, 10, 13]
        },
        "Arid": {
            labels:     ["Spring", "Summer", "Monsoon", "Winter"],
            nitrogen:   [15, 12, 9,  12],
            phosphorus: [6,  5,  4,  5 ],
            potassium:  [10, 8,  6,  8 ]
        }
    },

    diagnosticTree: {
        question: "What is the primary symptom you see?",
        options: [
            {
                text: "Yellowing Leaves",
                next: {
                    question: "Are the spots also present?",
                    options: [
                        { text: "Yes, brown spots", result: "Likely Fungal Infection. Action: Apply neem oil spray or local organic fungicide." },
                        { text: "No, just yellowing", result: "Likely Nitrogen Deficiency. Action: Add compost or urea." }
                    ]
                }
            },
            {
                text: "Holes in leaves/Stem",
                next: {
                    question: "Do you see any insects?",
                    options: [
                        { text: "Yes, caterpillars", result: "Stem Borers or Leaf Folders. Action: Use pheromone traps or BT spray." },
                        { text: "No insects visible", result: "Likely nocturnal pests. Action: Set up light traps at night." }
                    ]
                }
            },
            {
                text: "White powdery patches",
                result: "Powdery Mildew. Action: Spray dilute mixture of baking soda and mild soap water."
            }
        ]
    }
};

window.staticData = staticData;
