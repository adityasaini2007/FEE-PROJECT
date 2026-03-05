/* 
   SIMPLE AGRI-HUB LOGIC
   Everything in one file for simplicity!
*/

// --- DASHBOARD DATA ---
const centers = [
    { name: "Central Agri-Hub", location: "North District", type: "Service Center" },
    { name: "Green Soil Lab", location: "East Valley", type: "Soil Testing" },
    { name: "Farmers First Center", location: "South Ridge", type: "Service Center" }
];

function showTable(data) {
    const body = document.getElementById('tableBody');
    if (!body) return;
    body.innerHTML = '';
    data.forEach(item => {
        body.innerHTML += `<tr><td>${item.name}</td><td>${item.location}</td><td>${item.type}</td></tr>`;
    });
}

// --- TIMER LOGIC ---
let timeLeft = 3600;
function startTimer() {
    const timerDiv = document.getElementById('timer');
    if (!timerDiv) return;
    setInterval(() => {
        timeLeft--;
        let mins = Math.floor(timeLeft / 60);
        let secs = timeLeft % 60;
        timerDiv.innerText = mins + ":" + (secs < 10 ? "0" + secs : secs);
    }, 1000);
}

// --- FEEDBACK LOGIC ---
function nextStep(step) {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('success').style.display = 'none';
    document.getElementById(step).style.display = 'block';
}

// --- POLICIES DATA ---
const policies = [
    { title: "PM-Kisan Samman Nidhi", desc: "Direct income support of ₹6,000 per year to farmer families in three equal installments." },
    { title: "Pradhan Mantri Fasal Bima Yojana", desc: "Comprehensive crop insurance scheme to provide financial support to farmers suffering crop loss due to natural calamities." },
    { title: "Kisan Credit Card (KCC) Scheme", desc: "Provides adequate and timely credit support from the banking system for cultivation and other needs." },
    { title: "Soil Health Card Scheme", desc: "Helps farmers to improve soil health and increase productivity by providing nutrient status of their soil." },
    { title: "Solar Pump Subsidy (KUSUM)", desc: "Financial support for installing solar pumps for irrigation, reducing dependency on diesel and electricity." },
    { title: "Paramparagat Krishi Vikas Yojana", desc: "Promotion of organic farming through cluster approach and PGS certification." },
    { title: "National Mission on Edible Oils", desc: "Subsidies and support for oil palm cultivation to increase domestic production of edible oils." },
    { title: "Agriculture Infrastructure Fund", desc: "Medium-long term debt financing facility for investment in viable projects for post-harvest management infrastructure." }
];

function showPolicies(data) {
    const list = document.getElementById('policyList');
    if (!list) return;
    list.innerHTML = '';
    if (data.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:var(--text-light);">No policies found matching your search.</p>';
        return;
    }
    data.forEach(item => {
        list.innerHTML += `
            <div class="policy-item">
                <div class="policy-title">${item.title}</div>
                <div class="policy-desc">${item.desc}</div>
            </div>
        `;
    });
}

// --- RUN EVERYTHING ---
document.addEventListener('DOMContentLoaded', () => {
    showTable(centers);
    showPolicies(policies);
    startTimer();

    // Simple search for the table
    const search = document.getElementById('tableSearch');
    if (search) {
        search.oninput = () => {
            const val = search.value.toLowerCase();
            const filtered = centers.filter(c => c.name.toLowerCase().includes(val));
            showTable(filtered);
        };
    }

    // Simple search for policies
    const pSearch = document.getElementById('policySearch');
    if (pSearch) {
        pSearch.oninput = () => {
            const val = pSearch.value.toLowerCase();
            const filtered = policies.filter(p => 
                p.title.toLowerCase().includes(val) || 
                p.desc.toLowerCase().includes(val)
            );
            showPolicies(filtered);
        };
    }
});
