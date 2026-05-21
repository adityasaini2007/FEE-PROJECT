/* ═══════════════════════════════════════════════
   AgriConnect – main script
   ═══════════════════════════════════════════════ */

// ── Global state ──────────────────────────────
let timerInterval;
let npkChartInstance = null;

// ── Boot ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initMobileMenu();

    const pathname = window.location.pathname.split('/').pop() || 'index.html';

    if (pathname === 'index.html' || pathname === '') {
        loadDashboard();
    } else if (pathname === 'policies.html') {
        loadPolicies();
    } else if (pathname === 'helpline.html') {
        loadHelplines();
    } else if (pathname === 'watering.html') {
        setupWateringTimer();
    } else if (pathname === 'diagnostic.html') {
        initDiagnostic();
    } else if (pathname === 'profit.html') {
        setupProfitLedger();
    } else if (pathname === 'feedback.html') {
        setupFeedback();
    }
});

// ── Mobile menu ───────────────────────────────
function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-toggle');
    const navLinks  = document.querySelector('.nav-links');
    if (!mobileBtn || !navLinks) return;

    mobileBtn.addEventListener('click', () => {
        const open = navLinks.style.display === 'flex';
        navLinks.style.display         = open ? 'none' : 'flex';
        navLinks.style.flexDirection   = 'column';
        navLinks.style.position        = 'absolute';
        navLinks.style.top             = '70px';
        navLinks.style.left            = '0';
        navLinks.style.right           = '0';
        navLinks.style.background      = 'var(--nav-bg)';
        navLinks.style.padding         = '1rem';
        navLinks.style.backdropFilter  = 'blur(10px)';
        navLinks.style.zIndex          = '999';
    });
}

/* ══════════════════════════════════════════════
   1. AUTH  (localStorage-backed)
   ══════════════════════════════════════════════ */

/**
 * Users are stored as:
 *   localStorage['agriUsers'] = JSON array of { name, soil, passHash }
 * Session is stored as:
 *   sessionStorage['farmerName'] / ['farmerSoil']
 */

function getUserStore() {
    return JSON.parse(localStorage.getItem('agriUsers') || '[]');
}
function saveUserStore(arr) {
    localStorage.setItem('agriUsers', JSON.stringify(arr));
}

function simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h.toString(16);
}

function initAuth() {
    const modal    = document.getElementById('onboardingModal');
    if (!modal) return;

    // On every page-load / refresh, require sign-in again
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
        sessionStorage.removeItem('farmerName');
        sessionStorage.removeItem('farmerSoil');
    }

    const name = sessionStorage.getItem('farmerName');
    const soil = sessionStorage.getItem('farmerSoil');

    if (!name || !soil) {
        modal.classList.remove('hidden');
    } else {
        showLogoutBtn();
    }

    /* ── Login button ── */
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const n = document.getElementById('loginName').value.trim();
            const p = document.getElementById('loginPass').value;
            const errEl = document.getElementById('loginError');

            const users = getUserStore();
            const user  = users.find(u => u.name.toLowerCase() === n.toLowerCase()
                                      && u.passHash === simpleHash(p));
            if (user) {
                sessionStorage.setItem('farmerName', user.name);
                sessionStorage.setItem('farmerSoil', user.soil);
                modal.classList.add('hidden');
                errEl.classList.add('hidden');
                showLogoutBtn();
                loadDashboard();
                showToast(`Welcome back, ${user.name}! 🌾`);
            } else {
                errEl.classList.remove('hidden');
            }
        });

        // Allow Enter key
        ['loginName', 'loginPass'].forEach(id => {
            document.getElementById(id)?.addEventListener('keydown', e => {
                if (e.key === 'Enter') loginBtn.click();
            });
        });
    }

    /* ── Register button ── */
    const regBtn = document.getElementById('registerBtn');
    if (regBtn) {
        regBtn.addEventListener('click', () => {
            const n    = document.getElementById('regName').value.trim();
            const soil = document.getElementById('regSoil').value;
            const p1   = document.getElementById('regPass').value;
            const p2   = document.getElementById('regPassConfirm').value;
            const errEl = document.getElementById('regError');

            if (!n || !soil || !p1) {
                errEl.textContent = 'Please fill in all fields.';
                errEl.classList.remove('hidden');
                return;
            }
            if (p1 !== p2) {
                errEl.textContent = 'Passwords do not match.';
                errEl.classList.remove('hidden');
                return;
            }

            const users = getUserStore();
            if (users.find(u => u.name.toLowerCase() === n.toLowerCase())) {
                errEl.textContent = 'That name is already registered. Please sign in.';
                errEl.classList.remove('hidden');
                return;
            }

            users.push({ name: n, soil, passHash: simpleHash(p1) });
            saveUserStore(users);

            sessionStorage.setItem('farmerName', n);
            sessionStorage.setItem('farmerSoil', soil);
            modal.classList.add('hidden');
            errEl.classList.add('hidden');
            showLogoutBtn();
            loadDashboard();
            showToast(`Account created! Welcome, ${n}! 🎉`);
        });
    }

    /* ── Logout button ── */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('farmerName');
            sessionStorage.removeItem('farmerSoil');
            logoutBtn.classList.add('hidden');
            modal.classList.remove('hidden');
            switchAuthTab('login');
            showToast('Signed out successfully.');
        });
    }
}

function showLogoutBtn() {
    const btn = document.getElementById('logoutBtn');
    if (btn) btn.classList.remove('hidden');
}

/** Switch between Sign In / Register tabs */
function switchAuthTab(tab) {
    const loginForm  = document.getElementById('loginForm');
    const regForm    = document.getElementById('registerForm');
    const tabLogin   = document.getElementById('tabLogin');
    const tabReg     = document.getElementById('tabReg');
    const loginError = document.getElementById('loginError');
    const regError   = document.getElementById('regError');

    if (tab === 'login') {
        loginForm?.classList.remove('hidden');
        regForm?.classList.add('hidden');
        tabLogin?.classList.add('active');
        tabReg?.classList.remove('active');
        loginError?.classList.add('hidden');
    } else {
        loginForm?.classList.add('hidden');
        regForm?.classList.remove('hidden');
        tabLogin?.classList.remove('active');
        tabReg?.classList.add('active');
        regError?.classList.add('hidden');
    }
}

/* ══════════════════════════════════════════════
   2. Dashboard
   ══════════════════════════════════════════════ */
function loadDashboard() {
    const name = sessionStorage.getItem('farmerName') || 'Farmer';
    const soil = sessionStorage.getItem('farmerSoil') || 'Alluvial';

    const nameEl = document.getElementById('displayFarmerName');
    const soilEl = document.getElementById('displaySoilType');
    if (nameEl) nameEl.innerText = name;
    if (soilEl) soilEl.innerText = soil;

    // Crop tags
    const cropContainer = document.getElementById('cropTags');
    if (cropContainer) {
        cropContainer.innerHTML = '';
        const crops = staticData.soilCropSuggestions[soil] || [];
        crops.forEach(crop => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.innerText = crop;
            cropContainer.appendChild(span);
        });
    }

    initChart(soil);

    // Chart soil filter dropdown
    const filter = document.getElementById('chartSoilFilter');
    if (filter) {
        filter.value = soil; // default to user's soil
        filter.addEventListener('change', () => {
            initChart(filter.value);
        });
    }
}

function initChart(soil) {
    const ctx = document.getElementById('npkChart');
    if (!ctx) return;

    if (npkChartInstance) npkChartInstance.destroy();

    const data = staticData.npkBySoil[soil] || staticData.npkBySoil['Alluvial'];

    // Update label badge
    const labelEl = document.getElementById('chartSoilLabel');
    if (labelEl) labelEl.textContent = `— ${soil} Soil`;

    npkChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Nitrogen (N)',
                    data: data.nitrogen,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52,152,219,0.08)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#3498db',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
                {
                    label: 'Phosphorus (P)',
                    data: data.phosphorus,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231,76,60,0.08)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#e74c3c',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
                {
                    label: 'Potassium (K)',
                    data: data.potassium,
                    borderColor: '#f1c40f',
                    backgroundColor: 'rgba(241,196,15,0.08)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#f1c40f',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 600, easing: 'easeInOutQuart' },
            plugins: {
                legend: {
                    labels: {
                        color: '#e4efe7',
                        font: { family: 'Outfit', size: 13 },
                        padding: 20,
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(18,24,20,0.9)',
                    titleColor: '#2ecc71',
                    bodyColor: '#e4efe7',
                    borderColor: 'rgba(46,204,113,0.3)',
                    borderWidth: 1,
                }
            },
            scales: {
                x: {
                    ticks: { color: '#a6b5ab', font: { family: 'Outfit' } },
                    grid:  { color: 'rgba(255,255,255,0.04)' }
                },
                y: {
                    ticks: { color: '#a6b5ab', font: { family: 'Outfit' } },
                    grid:  { color: 'rgba(255,255,255,0.04)' },
                    beginAtZero: true
                }
            }
        }
    });
}

/* ══════════════════════════════════════════════
   3. Policies
   ══════════════════════════════════════════════ */
function loadPolicies() {
    const pList  = document.getElementById('policyList');
    const sInput = document.getElementById('searchInput');
    if (!pList || !sInput) return;

    function renderPolFiltered(query) {
        query = query.toLowerCase();
        const fPol = staticData.policies.filter(p =>
            p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)
        );
        pList.innerHTML = fPol.map((p, index) => `
            <li class="stagger-item" style="animation-delay: ${index * 0.08}s">
                <h4>${p.title}</h4>
                <p>${p.desc}</p>
                <a href="${p.link}" target="_blank" class="tag" style="display:inline-block; margin-top:0.5rem;">Visit Official Portal ↗</a>
            </li>
        `).join('');
    }

    renderPolFiltered('');
    sInput.addEventListener('input', e => renderPolFiltered(e.target.value));
}

/* ══════════════════════════════════════════════
   4. Helplines
   ══════════════════════════════════════════════ */
function loadHelplines() {
    const hList  = document.getElementById('helplineList');
    const hInput = document.getElementById('helpSearchInput');
    if (!hList || !hInput) return;

    function renderHelpFiltered(query) {
        query = query.toLowerCase();
        const fHelp = staticData.helplines.filter(h =>
            h.department.toLowerCase().includes(query) ||
            h.category.toLowerCase().includes(query)   ||
            h.number.includes(query)
        );
        hList.innerHTML = fHelp.map((h, index) => `
            <li class="stagger-item" style="animation-delay: ${index * 0.08}s">
                <h4>${h.department} <span class="tag">${h.category}</span></h4>
                <p>📞 <a href="tel:${h.number}">${h.number}</a></p>
            </li>
        `).join('');
    }

    renderHelpFiltered('');
    hInput.addEventListener('input', e => renderHelpFiltered(e.target.value));
}

/* ══════════════════════════════════════════════
   5. Watering Timer
   ══════════════════════════════════════════════ */
function setupWateringTimer() {
    const fetchBtn  = document.getElementById('fetchWeatherBtn');
    const cityInput = document.getElementById('cityInput');
    if (fetchBtn && cityInput) {
        fetchBtn.addEventListener('click', () => fetchWeather(cityInput.value.trim()));
        cityInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') fetchWeather(cityInput.value.trim());
        });
    }

    const btn = document.getElementById('startTimerBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const last = parseFloat(document.getElementById('waterLast').value);
        const temp = parseFloat(document.getElementById('waterTemp').value);

        if (isNaN(last) || isNaN(temp)) {
            showToast('Please enter valid numbers');
            return;
        }

        const { cycle, label } = getWateringCycleHours(temp);
        let timeRemainingHours   = cycle - last;
        if (timeRemainingHours < 0) timeRemainingHours = 0;
        const timeRemainingSeconds = timeRemainingHours * 60; // demo: 1 hr → 1 min

        const infoEl = document.getElementById('timerCycleInfo');
        if (infoEl) {
            infoEl.innerHTML = `<span class="cycle-badge">${label}</span> — ${cycle}h cycle at ${temp}°C`;
        }

        startCountdown(timeRemainingSeconds, timeRemainingSeconds);
    });
}

function getWateringCycleHours(temp) {
    if (temp >= 40) return { cycle: 8,  label: '🔥 Extreme Heat' };
    if (temp >= 35) return { cycle: 12, label: '☀️ Very Hot'      };
    if (temp >= 28) return { cycle: 18, label: '🌤️ Warm'          };
    if (temp >= 20) return { cycle: 24, label: '🌿 Moderate'      };
    if (temp >= 10) return { cycle: 36, label: '🌥️ Cool'          };
    return                { cycle: 48, label: '❄️ Cold'           };
}

async function fetchWeather(city) {
    if (!city) { showToast('Please enter a city name'); return; }

    const btnText   = document.getElementById('weatherBtnText');
    const spinner   = document.getElementById('weatherBtnSpinner');
    const resultDiv = document.getElementById('weatherResult');
    const errorDiv  = document.getElementById('weatherError');

    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    try {
        const geoRes  = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();
        if (!geoData.results?.length) throw new Error('City not found');

        const { latitude, longitude, name, country } = geoData.results[0];

        const wxRes  = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
        );
        const wxData = await wxRes.json();
        const cur    = wxData.current;

        const temp     = Math.round(cur.temperature_2m);
        const humidity = cur.relative_humidity_2m;
        const wmoCode  = cur.weather_code;
        const { emoji, label: condition }  = getWMOCondition(wmoCode);
        const { cycle, label: cycleLabel } = getWateringCycleHours(temp);

        document.getElementById('weatherEmoji').textContent      = emoji;
        document.getElementById('weatherTempDisplay').textContent = temp;
        document.getElementById('weatherCondition').textContent   = condition;
        document.getElementById('weatherHumidity').textContent    = humidity + '%';
        document.getElementById('weatherLocation').textContent    = `${name}, ${country}`;

        const adviceEl = document.getElementById('weatherAdvice');
        adviceEl.innerHTML =
            `${cycleLabel} &nbsp;|&nbsp; At <strong>${temp}°C</strong>, recommended watering cycle is ` +
            `<strong>every ${cycle} hours</strong>. Timer adjusted automatically.`;
        adviceEl.className = `weather-advice advice-${getHeatClass(temp)}`;

        const tempInput = document.getElementById('waterTemp');
        if (tempInput) {
            tempInput.value = temp;
            document.getElementById('autoFillBadge')?.classList.remove('hidden');
        }

        resultDiv.classList.remove('hidden');
        showToast(`✅ Weather loaded for ${name}`);
    } catch (err) {
        errorDiv.classList.remove('hidden');
        console.error('Weather fetch error:', err);
    } finally {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

function getWMOCondition(code) {
    const map = [
        { max: 0,  emoji: '☀️',  label: 'Clear Sky'     },
        { max: 3,  emoji: '⛅',  label: 'Partly Cloudy' },
        { max: 48, emoji: '🌫️', label: 'Foggy'          },
        { max: 57, emoji: '🌦️', label: 'Drizzle'        },
        { max: 67, emoji: '🌧️', label: 'Rain'           },
        { max: 77, emoji: '❄️',  label: 'Snow'           },
        { max: 82, emoji: '🌦️', label: 'Rain Showers'   },
        { max: 86, emoji: '🌨️', label: 'Snow Showers'   },
        { max: 99, emoji: '⛈️',  label: 'Thunderstorm'  },
    ];
    for (const entry of map) {
        if (code <= entry.max) return { emoji: entry.emoji, label: entry.label };
    }
    return { emoji: '🌡️', label: 'Unknown' };
}

function getHeatClass(temp) {
    if (temp >= 40) return 'extreme';
    if (temp >= 35) return 'hot';
    if (temp >= 28) return 'warm';
    if (temp >= 20) return 'moderate';
    return 'cool';
}

function startCountdown(totalSeconds, currentSeconds) {
    clearInterval(timerInterval);
    const box    = document.getElementById('timerDisplay');
    const readout = document.getElementById('countdownReadout');
    const prog   = document.getElementById('waterProgressBar');

    box.classList.remove('hidden');

    timerInterval = setInterval(() => {
        currentSeconds--;

        if (currentSeconds <= 0) {
            clearInterval(timerInterval);
            readout.innerText      = '00:00:00';
            prog.style.width      = '100%';
            prog.style.background = 'var(--danger-color)';
            showToast('🌾 Time to water your crops!');

            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Time to water your crops!');
            } else if ('Notification' in window && Notification.permission !== 'denied') {
                Notification.requestPermission().then(p => {
                    if (p === 'granted') new Notification('Time to water your crops!');
                });
            }
            return;
        }

        const h = Math.floor(currentSeconds / 3600);
        const m = Math.floor((currentSeconds % 3600) / 60);
        const s = Math.floor(currentSeconds % 60);
        readout.innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

        const perc = ((totalSeconds - currentSeconds) / totalSeconds) * 100;
        prog.style.width = `${perc}%`;
    }, 1000);
}

/* ══════════════════════════════════════════════
   6. Diagnostic
   ══════════════════════════════════════════════ */
function initDiagnostic() {
    const container = document.getElementById('diagContainer');
    const resetBtn  = document.getElementById('resetDiagBtn');
    if (!container || !resetBtn) return;

    function renderNode(node) {
        container.innerHTML = '';
        if (node.result) {
            container.innerHTML = `
                <div class="diag-step fade-in">
                    <h3 style="margin-bottom:1rem;">Diagnosis Complete</h3>
                    <div class="diag-result"><strong>Result:</strong> ${node.result}</div>
                </div>`;
            resetBtn.classList.remove('hidden');
        } else {
            container.innerHTML = `
                <div class="diag-step fade-in">
                    <h3>${node.question}</h3>
                    <div class="diag-options" id="diagOptions"></div>
                </div>`;
            const optionsGroup = document.getElementById('diagOptions');
            node.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className   = 'secondary-btn';
                btn.textContent = opt.text;
                btn.onclick     = () => {
                    if (opt.next) renderNode(opt.next);
                    else          renderNode({ result: opt.result });
                };
                optionsGroup.appendChild(btn);
            });
            resetBtn.classList.add('hidden');
        }
    }

    renderNode(staticData.diagnosticTree);
    resetBtn.addEventListener('click', () => renderNode(staticData.diagnosticTree));
}

/* ══════════════════════════════════════════════
   7. Profit Ledger
   ══════════════════════════════════════════════ */
function setupProfitLedger() {
    const form      = document.getElementById('ledgerForm');
    const resultBox = document.getElementById('calcResult');
    const valDisplay = document.getElementById('profitValue');
    if (!form || !resultBox || !valDisplay) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const sc  = parseFloat(document.getElementById('seedCost').value)  || 0;
        const fc  = parseFloat(document.getElementById('fertCost').value)  || 0;
        const lc  = parseFloat(document.getElementById('laborCost').value) || 0;
        const rev = parseFloat(document.getElementById('exRevenue').value) || 0;

        const totalCost = sc + fc + lc;
        const net       = rev - totalCost;

        resultBox.classList.remove('hidden');
        const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
        valDisplay.innerText  = formatter.format(net);
        valDisplay.className  = 'massive-text ' + (net >= 0 ? 'profit-pos' : 'profit-neg');

        localStorage.setItem('lastLedgerEntry', JSON.stringify({
            date: new Date().toISOString(), totalCost, rev, net
        }));
        showToast('Ledger Calculated & Saved!');
    });
}

/* ══════════════════════════════════════════════
   8. Feedback
   ══════════════════════════════════════════════ */
function setupFeedback() {
    const form = document.getElementById('feedbackForm');
    const list = document.getElementById('pastFeedbackList');
    if (!form || !list) return;

    function renderFeedback() {
        const arr = JSON.parse(localStorage.getItem('agriFeedback') || '[]').reverse();
        list.innerHTML = arr.length === 0
            ? '<li><p>No feedback provided yet.</p></li>'
            : arr.map((item, i) => `
                <li class="stagger-item" style="animation-delay: ${i * 0.1}s">
                    <h4>${item.subject}</h4>
                    <p>${item.body}</p>
                    <small style="color:var(--text-secondary)">Submitted on: ${new Date(item.date).toLocaleDateString()}</small>
                </li>`).join('');
    }

    renderFeedback();

    form.addEventListener('submit', event => {
        event.preventDefault();
        const subjectText = document.getElementById('fbSubject').value.trim();
        const bodyText    = document.getElementById('fbBody').value.trim();

        if (subjectText && bodyText) {
            const arr = JSON.parse(localStorage.getItem('agriFeedback') || '[]');
            arr.push({ subject: subjectText, body: bodyText, date: new Date().toISOString() });
            localStorage.setItem('agriFeedback', JSON.stringify(arr));
            document.getElementById('fbSubject').value = '';
            document.getElementById('fbBody').value    = '';
            renderFeedback();
            showToast('Feedback Saved Locally!');
        }
    });
}

/* ══════════════════════════════════════════════
   Utility – Toast
   ══════════════════════════════════════════════ */
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}
