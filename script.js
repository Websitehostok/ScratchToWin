// =============================
// INDIAN SCRATCH CARD - BUG FIXED VERSION
// =============================
// Fixed: 0 rupees probability, celebration for secret earnings, 
// white screen lag, ad availability, admin panel security
// =============================

// Game Elements
const canvas = document.getElementById("scratch");
const context = canvas.getContext("2d");
const scratchCard = document.getElementById("scratchCard");
const cardPrizeAmount = document.getElementById("cardPrizeAmount");
const progressBar = document.getElementById("progressBar");
const prizeDisplay = document.getElementById("prizeDisplay");
const prizeValue = prizeDisplay.querySelector(".prize-value");
const resultMessage = document.getElementById("resultMessage");
const balanceAmount = document.getElementById("balanceAmount");
const winningsAmount = document.getElementById("winningsAmount");
const unlockBtn = document.getElementById("unlockBtn");
const scratchOverlay = document.getElementById("scratchOverlay");
const adZoneInfo = document.getElementById("adZoneInfo");
const cooldownIndicator = document.getElementById("cooldownIndicator");
const celebration = document.getElementById("celebration");
const adOverlay = document.getElementById("adOverlay");

// Prize Configuration
const prizeConfig = {
    zeroPercentage: parseInt(document.getElementById('prizeConfig')?.dataset?.zeroPercentage || "30"),
    commonMin: parseInt(document.getElementById('prizeConfig')?.dataset?.commonMin || "2"),
    commonMax: parseInt(document.getElementById('prizeConfig')?.dataset?.commonMax || "8"),
    rareMin: parseInt(document.getElementById('prizeConfig')?.dataset?.rareMin || "10"),
    rareMax: parseInt(document.getElementById('prizeConfig')?.dataset?.rareMax || "15"),
    epicMin: parseInt(document.getElementById('prizeConfig')?.dataset?.epicMin || "15"),
    epicMax: parseInt(document.getElementById('prizeConfig')?.dataset?.epicMax || "25")
};

// Rarity/UI extras
const rarityBadge = document.getElementById("rarityBadge");
const scratchSheen = document.getElementById("scratchSheen");
const scratchContainer = document.querySelector(".scratch-container");
const winModal = document.getElementById("winModal");
const withdrawModal = document.getElementById("withdrawModal");
const closeWinModal = document.getElementById("closeWinModal");
const closeWithdrawModal = document.getElementById("closeWithdrawModal");

// Withdrawal Elements
const withdrawBalance = document.getElementById("withdrawBalance");
const requiredBalance = document.getElementById("requiredBalance");
const withdrawAmount = document.getElementById("withdrawAmount");
// CORRECT:
const paytmInput = document.getElementById("paytmInput");
const emailError = document.getElementById("emailError");
const withdrawBtn = document.getElementById("withdrawBtn");
const historyList = document.getElementById("historyList");
const queuePosition = document.getElementById("queuePosition");
const withdrawMessage = document.getElementById("withdrawMessage");

// Stats Elements
const totalScratches = document.getElementById("totalScratches");
const cardsWon = document.getElementById("cardsWon");
const winRate = document.getElementById("winRate");
const totalWinnings = document.getElementById("totalWinnings");
const todayWinnings = document.getElementById("todayWinnings");
const currentStreak = document.getElementById("currentStreak");
const leaderboardList = document.getElementById("leaderboardList");

// Ticker Element
const tickerContent = document.getElementById("tickerContent");

// Secret earning 2 elements
const se2DailyInfo = document.getElementById('se2DailyInfo');
const se2ConfigEl = document.getElementById('se2Config');
const se2OffersDataEl = document.getElementById('se2OffersData');
const se2OfferList = document.getElementById('se2OfferList');
// Reset controls
const se2ResetConfigEl = document.getElementById('se2ResetConfig');
const se2PassA = document.getElementById('se2PassA');
const se2PassB = document.getElementById('se2PassB');
const se2ResetBtn = document.getElementById('se2ResetBtn');
const se2ResetStatus = document.getElementById('se2ResetStatus');
const se2ResetBlock = document.getElementById('se2ResetBlock');
const eggTriggers = document.querySelectorAll('.easter-egg');

// Game State
let gameState = {
    balance: 10,
    winnings: 0,
    totalWinnings: 0,
    scratchCount: 0,
    winCount: 0,
    currentPrize: 0,
    isScratched: false,
    isUnlocked: false,
    withdrawalHistory: [],
    todayDate: new Date().toDateString(),
    currentStreak: 0,
    lastPlayDate: null,
    adWatchCount: 0,
    lastAdWatchTime: null, // ADD THIS LINE
    cooldownEndTime: null
};

// Ad cooldown settings
const AD_COOLDOWN_MINUTES = 1;
const MAX_ADS_PER_COOLDOWN = 2;
const SHORT_COOLDOWN_SECONDS = 10; // Add this line

// Secret Earning daily limits
const SE_LIMIT = 10;
const SE_WINDOW_MS = 25 * 60 * 60 * 1000;
const DAILY_KEYS = { se2: 'daily:se2' };

// Withdrawal settings
const WITHDRAWAL_AMOUNT = 2000;
const REQUIRED_BALANCE = 2000;

// Player names for ticker and leaderboard
const playerNames = [
    "Raj Kumar", "Priya Sharma", "Amit Patel", "Sneha Singh", "Vikram Yadav",
    "Anjali Gupta", "Rahul Verma", "Pooja Mishra", "Sanjay Kumar", "Neha Joshi",
    "Arun Sharma", "Divya Reddy", "Karan Malhotra", "Sunita Das", "Rohit Tiwari"
];

// Ad zones configuration
const adZones = [
    { id: '10187883', name: 'Zone1', weight: 10 },
    { id: '10187879', name: 'Zone2', weight: 10 },
    { id: '10187871', name: 'Zone3', weight: 10 },
    { id: '10187867', name: 'Zone4', weight: 10 },
    { id: '10187596', name: 'Zone5', weight: 10 },
    { id: '10187592', name: 'Zone6', weight: 10 },
    { id: '10187587', name: 'Zone7', weight: 10 },
    { id: '10080962', name: 'Zone8', weight: 10 },
    { id: '10075905', name: 'Zone9', weight: 10 },
    { id: '10035122', name: 'Zone9', weight: 10 },
];

// Rarity tiers with weighted odds and prize pools
const rarities = [
    { key: 'common', name: 'Common', weight: 70 },
    { key: 'rare', name: 'Rare', weight: 25 },
    { key: 'epic', name: 'Epic', weight: 5 }
];

const pickRarity = () => {
    const total = rarities.reduce((s, r) => s + r.weight, 0);
    let r = Math.random() * total;
    for (const tier of rarities) {
        r -= tier.weight;
        if (r <= 0) return tier;
    }
    return rarities[0];
};

const generatePrize = (tier) => {
    // Check if we should give 0 based on configured percentage
    if (Math.random() * 100 < prizeConfig.zeroPercentage) {
        return 0;
    }
    
    // Generate prize based on tier
    switch(tier.key) {
        case 'common':
            return Math.floor(Math.random() * (prizeConfig.commonMax - prizeConfig.commonMin + 1)) + prizeConfig.commonMin;
        case 'rare':
            return Math.floor(Math.random() * (prizeConfig.rareMax - prizeConfig.rareMin + 1)) + prizeConfig.rareMin;
        case 'epic':
            return Math.floor(Math.random() * (prizeConfig.epicMax - prizeConfig.epicMin + 1)) + prizeConfig.epicMin;
        default:
            return prizeConfig.commonMin;
    }
};

const applyRarityStyles = (tier) => {
    scratchCard.classList.remove('rarity-common', 'rarity-rare', 'rarity-epic');
    scratchCard.classList.add(`rarity-${tier.key}`);
    if (rarityBadge) {
        rarityBadge.textContent = tier.name;
    }
};

// Initialize game
const init = () => {
    loadGameState();
    updateUI();
    createNewCard();
    setupTicker();
    setupLeaderboard();

    // FIXED: Add missing paytmInput reference
    const paytmInput = document.getElementById("paytmInput");

    // Event listeners
    unlockBtn.addEventListener("click", unlockCard);
    closeWinModal.addEventListener("click", () => winModal.style.display = "none");
    closeWithdrawModal.addEventListener("click", () => withdrawModal.style.display = "none");
    withdrawBtn.addEventListener("click", processWithdrawal);
    
    // FIXED: Add email validation listener
    if (paytmInput) {
        paytmInput.addEventListener("input", validateEmail);
    }

    // FIXED: Tab navigation - improved version
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs and panels
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding panel
            const panelId = `${tab.dataset.tab}-panel`;
            const targetPanel = document.getElementById(panelId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                
                // Update specific tab content
                if (tab.dataset.tab === 'stats') {
                    updateStats();
                } else if (tab.dataset.tab === 'secret') {
                    initSecret2Tab();
                } else if (tab.dataset.tab === 'withdraw') {
                    updateUI(); // Refresh balance display
                }
            }
        });
        
        // Add keyboard accessibility
        tab.setAttribute('tabindex', '0');
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tab.click();
            }
        });
    });

    // Initialize scratch area
    initScratchArea();

    // Initialize Secret Earning 2
    initSecret2Tab();
    initResetSections();
    initEasterEggs();

    // Update cooldown + daily displays periodically
    updateCooldownDisplay();
    setInterval(updateCooldownDisplay, 1000);
    updateSeDailyInfo(DAILY_KEYS.se2, se2DailyInfo);
    setInterval(() => {
        updateSeDailyInfo(DAILY_KEYS.se2, se2DailyInfo);
    }, 1000);

    // Reinitialize scratch area on window resize
    window.addEventListener('resize', () => {
        setTimeout(initScratchArea, 100);
    });
};

// Load game state from localStorage
const loadGameState = () => {
    try {
        const savedState = localStorage.getItem('scratchCardGameState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);

            // Check if it's a new day
            const today = new Date().toDateString();
            if (parsedState.todayDate !== today) {
                // Reset daily winnings for new day
                parsedState.winnings = 0;
                parsedState.todayDate = today;

                // Check streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (parsedState.lastPlayDate === yesterday.toDateString()) {
                    parsedState.currentStreak += 1;
                } else if (parsedState.lastPlayDate !== today) {
                    parsedState.currentStreak = 0;
                }
            }

            parsedState.lastPlayDate = today;
            gameState = { ...gameState, ...parsedState };
        }
    } catch (error) {
        console.error('Error loading game state:', error);
        // Reset to default state
        localStorage.removeItem('scratchCardGameState');
    }
};

// Save game state to localStorage
const saveGameState = () => {
    try {
        localStorage.setItem('scratchCardGameState', JSON.stringify(gameState));
    } catch (error) {
        console.error('Error saving game state:', error);
    }
};

// Initialize scratch area (optimized - no lag)
const initScratchArea = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Match canvas buffer to CSS size for crisp rendering
    const displayWidth = Math.max(1, Math.floor(rect.width));
    const displayHeight = Math.max(1, Math.floor(rect.height));
    
    // Only resize if dimensions changed (prevents unnecessary redraws)
    if (canvas.width !== Math.floor(displayWidth * dpr) || canvas.height !== Math.floor(displayHeight * dpr)) {
        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);
    }

    // Reset and apply scale
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);

    // Clear and draw coating in CSS pixels
    context.clearRect(0, 0, displayWidth, displayHeight);

    // === Optimized metallic texture ===
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 16; // Smaller pattern for better performance
    patternCanvas.height = 16;
    const pctx = patternCanvas.getContext("2d");
    pctx.fillStyle = "#b0b0b0";
    pctx.fillRect(0, 0, 16, 16);
    pctx.strokeStyle = "#dcdcdc";
    pctx.lineWidth = 1;
    pctx.beginPath();
    pctx.moveTo(0, 8);
    pctx.lineTo(16, 8);
    pctx.stroke();

    const metallicPattern = context.createPattern(patternCanvas, "repeat");

    // === Draw coating ===
    context.globalCompositeOperation = "source-over";
    context.fillStyle = metallicPattern;
    context.fillRect(0, 0, displayWidth, displayHeight);

    // Add silver gradient overlay
    const gradient = context.createLinearGradient(0, 0, displayWidth, displayHeight);
    gradient.addColorStop(0, "rgba(255,255,255,0.35)");
    gradient.addColorStop(1, "rgba(0,0,0,0.12)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, displayWidth, displayHeight);

    // Text hint
    context.fillStyle = "#666";
    context.font = "bold 20px Poppins, sans-serif";
    context.textAlign = "center";
    context.fillText("Scratch Here", displayWidth / 2, displayHeight / 2);
    context.font = "14px Poppins, sans-serif";
    context.fillText("to reveal your prize", displayWidth / 2, displayHeight / 2 + 25);
};

// Create a new scratch card (with controlled zero probability)
const createNewCard = () => {
    gameState.isScratched = false;
    gameState.isUnlocked = false;
    gameState.currentPrize = 0;
    scratchOverlay.style.display = "flex";
    scratchCard.style.display = "flex";
    progressBar.style.width = "0%";
    if (scratchSheen) scratchSheen.style.opacity = '0';

    // Reset prize display
    prizeValue.textContent = "?";
    cardPrizeAmount.textContent = "?";
    prizeDisplay.style.background = "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)";

    // Pick rarity and generate prize with controlled zero probability
    const tier = pickRarity();
    applyRarityStyles(tier);
    const prize = generatePrize(tier);
    gameState.currentPrize = prize;

    // Update card display with prize (hidden until scratched)
    if (gameState.currentPrize > 0) {
        cardPrizeAmount.textContent = `${gameState.currentPrize} ₹`;
    } else {
        cardPrizeAmount.textContent = "No Prize";
    }

    // Reset result message
    resultMessage.innerHTML = `<i class="fas fa-gift"></i><span>${tier.name} card ready. Watch ad to unlock and scratch!</span>`;
    resultMessage.className = "result-message";

    // Update UI
    updateUI();

    // Initialize scratch area with slight delay to prevent white flash
    setTimeout(initScratchArea, 50);
};

// Enhanced ad cooldown system
const canWatchAd = () => {
    const now = Date.now();
    
    // Reset count if cooldown period has passed
    if (gameState.cooldownEndTime && now > gameState.cooldownEndTime) {
        gameState.adWatchCount = 0;
        gameState.cooldownEndTime = null;
        gameState.lastAdWatchTime = null;
        saveGameState();
        return { 
            canWatch: true, 
            message: "",
            adsLeft: MAX_ADS_PER_COOLDOWN,
            nextAdIn: 0
        };
    }

    // Check if user can watch more ads
    if (gameState.adWatchCount >= MAX_ADS_PER_COOLDOWN) {
        const timeLeft = gameState.cooldownEndTime - now;
        const minutesLeft = Math.ceil(timeLeft / (1000 * 60));
        return {
            canWatch: false,
            message: `Ad limit reached! Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`,
            adsLeft: 0,
            nextAdIn: timeLeft
        };
    }

    // Check for short cooldown between ads (10 seconds)
    if (gameState.lastAdWatchTime) {
        const timeSinceLastAd = now - gameState.lastAdWatchTime;
        const shortCooldownMs = 10 * 1000; // 10 seconds
        
        if (timeSinceLastAd < shortCooldownMs) {
            const waitSeconds = Math.ceil((shortCooldownMs - timeSinceLastAd) / 1000);
            return {
                canWatch: false,
                message: `Please wait ${waitSeconds} seconds before next ad`,
                adsLeft: MAX_ADS_PER_COOLDOWN - gameState.adWatchCount,
                nextAdIn: shortCooldownMs - timeSinceLastAd
            };
        }
    }

    return { 
        canWatch: true, 
        message: "",
        adsLeft: MAX_ADS_PER_COOLDOWN - gameState.adWatchCount,
        nextAdIn: 0
    };
};

// Format mm:ss
const formatMMSS = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// Update cooldown display (ENHANCED - FIXED)
const updateCooldownDisplay = () => {
    const now = Date.now();
    const cooldownCheck = canWatchAd();
    
    // Reset classes
    cooldownIndicator.classList.remove('blocked', 'short', 'ready');
    
    if (!cooldownCheck.canWatch) {
        // Show blocking message
        if (cooldownCheck.nextAdIn > 60000) { // More than 1 minute
            const minutesLeft = Math.ceil(cooldownCheck.nextAdIn / (1000 * 60));
            cooldownIndicator.classList.add('blocked');
            cooldownIndicator.style.display = 'flex';
            cooldownIndicator.innerHTML = `<span>Ad limit reached. Try again in</span> <span class="timer">${minutesLeft}m</span>`;
        } else { // Short cooldown (seconds)
            const secondsLeft = Math.ceil(cooldownCheck.nextAdIn / 1000);
            cooldownIndicator.classList.add('blocked', 'short');
            cooldownIndicator.style.display = 'flex';
            cooldownIndicator.innerHTML = `<span>Wait</span> <span class="timer">${secondsLeft}s</span> <span>for next ad</span>`;
        }
        
        if (unlockBtn && !gameState.isUnlocked) {
            unlockBtn.disabled = true;
            unlockBtn.classList.remove('available');
            unlockBtn.innerHTML = `<i class="fas fa-clock"></i> Wait ${Math.ceil(cooldownCheck.nextAdIn/1000)}s`;
        }
    } else {
        // Ready to watch ads
        if (cooldownCheck.adsLeft > 0) {
            cooldownIndicator.classList.add('ready');
            cooldownIndicator.style.display = 'block';
            cooldownIndicator.innerHTML = `Ads available: <strong>${cooldownCheck.adsLeft}</strong> / ${MAX_ADS_PER_COOLDOWN}`;
        } else {
            cooldownIndicator.style.display = 'none';
        }
        
        if (unlockBtn && !gameState.isUnlocked) {
            const canClick = cooldownCheck.adsLeft > 0;
            unlockBtn.disabled = !canClick;
            unlockBtn.classList.toggle('available', canClick);
            unlockBtn.innerHTML = `<i class="fas fa-unlock"></i> Watch Ad to Unlock (${cooldownCheck.adsLeft} left)`;
        }
    }
};

// Get next ad zone with smart rotation
const getNextAdZone = () => {
    // Get user's ad history from localStorage
    let userAdPattern = JSON.parse(localStorage.getItem('userAdPattern') || '[]');

    // If no history, start fresh
    if (userAdPattern.length === 0) {
        const randomStart = Math.floor(Math.random() * adZones.length);
        userAdPattern = [randomStart];
    }

    // Avoid showing same ad twice in a row
    const lastAdIndex = userAdPattern[userAdPattern.length - 1];
    const availableZones = adZones
        .map((zone, index) => ({ ...zone, index }))
        .filter(zone => zone.index !== lastAdIndex);

    // If no available zones, fallback to all zones
    const zonesToUse = availableZones.length > 0 ? availableZones : adZones.map((zone, index) => ({ ...zone, index }));

    // Weighted random selection from available zones
    const totalWeight = zonesToUse.reduce((sum, zone) => sum + zone.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedZone = zonesToUse[0];

    for (const zone of zonesToUse) {
        random -= zone.weight;
        if (random <= 0) {
            selectedZone = zone;
            break;
        }
    }

    // Update user pattern (keep last 5 sessions)
    userAdPattern.push(selectedZone.index);
    if (userAdPattern.length > 5) userAdPattern.shift();
    localStorage.setItem('userAdPattern', JSON.stringify(userAdPattern));

    return selectedZone;
};

// Unlock card by watching ad (UPDATED)
const unlockCard = async () => {
    if (gameState.isUnlocked) return;

    // Check cooldown
    const cooldownCheck = canWatchAd();
    if (!cooldownCheck.canWatch) {
        showMessage(cooldownCheck.message, "lose");
        return;
    }

    adOverlay.style.display = "flex";
    unlockBtn.disabled = true;

    try {
        const adZone = getNextAdZone();
        adZoneInfo.textContent = `Ad Zone: ${adZone.name}`;

        // Check if ad function exists
        const adFunction = window[`show_${adZone.id}`];

        if (typeof adFunction === 'function') {
            // Use actual ad function
            await adFunction();

            // Ad successful - update cooldown state
            gameState.adWatchCount++;
            gameState.lastAdWatchTime = Date.now(); // Track when ad was watched
            
            if (gameState.adWatchCount >= MAX_ADS_PER_COOLDOWN) {
                gameState.cooldownEndTime = Date.now() + (AD_COOLDOWN_MINUTES * 60 * 1000);
            }

            // Prepare a fresh card and unlock scratching
            createNewCard();
            adOverlay.style.display = "none";
            gameState.isUnlocked = true;
            scratchOverlay.style.display = "none";
            unlockBtn.disabled = true;
            unlockBtn.innerHTML = '<i class="fas fa-check"></i> Unlocked';
            resultMessage.innerHTML = '<i class="fas fa-gift"></i><span>Scratch to reveal your prize!</span>';
            saveGameState();
            updateCooldownDisplay();

        } else {
            // Fallback for testing
            console.warn(`⚠️ Ad zone ${adZone.id} not available, using fallback`);
            setTimeout(() => {
                gameState.adWatchCount++;
                gameState.lastAdWatchTime = Date.now(); // Track when ad was watched
                
                if (gameState.adWatchCount >= MAX_ADS_PER_COOLDOWN) {
                    gameState.cooldownEndTime = Date.now() + (AD_COOLDOWN_MINUTES * 60 * 1000);
                }
                
                // Prepare a fresh card and unlock scratching
                createNewCard();
                adOverlay.style.display = "none";
                gameState.isUnlocked = true;
                scratchOverlay.style.display = "none";
                unlockBtn.disabled = true;
                unlockBtn.innerHTML = '<i class="fas fa-check"></i> Unlocked';
                resultMessage.innerHTML = '<i class="fas fa-gift"></i><span>Scratch to reveal your prize!</span>';
                saveGameState();
                updateCooldownDisplay();
            }, 1000);
        }
    } catch (error) {
        adOverlay.style.display = "none";
        unlockBtn.disabled = false;
        showMessage("Ad was skipped or failed. Please try again.", "lose");
    }
};

// Update UI elements
const updateUI = () => {
    balanceAmount.textContent = gameState.balance;
    winningsAmount.textContent = gameState.winnings;
    withdrawBalance.textContent = `${gameState.balance} ₹`;
    requiredBalance.textContent = `${REQUIRED_BALANCE} ₹`;
    withdrawAmount.textContent = WITHDRAWAL_AMOUNT;

    // Enable/disable buttons
    withdrawBtn.disabled = gameState.balance < REQUIRED_BALANCE;

    // Update withdrawal history
    updateWithdrawalHistory();

    saveGameState();
};

// Update withdrawal history
const updateWithdrawalHistory = () => {
    historyList.innerHTML = "";

    if (gameState.withdrawalHistory.length === 0) {
        historyList.innerHTML = '<div class="no-history">No withdrawal history yet</div>';
        return;
    }

    // Show latest 5 withdrawals
    const recentHistory = gameState.withdrawalHistory.slice(-5).reverse();

    recentHistory.forEach(withdrawal => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";
        historyItem.innerHTML = `
            <div class="history-details">
                <div class="history-amount">₹${withdrawal.amount}</div>
                <div class="history-date">${withdrawal.date}</div>
            </div>
            <div class="history-status">${withdrawal.status}</div>
        `;
        historyList.appendChild(historyItem);
    });
};

// Update stats
const updateStats = () => {
    totalScratches.textContent = gameState.scratchCount;
    cardsWon.textContent = gameState.winCount;

    // Calculate win rate
    const winRateValue = gameState.scratchCount > 0
        ? Math.round((gameState.winCount / gameState.scratchCount) * 100)
        : 0;
    winRate.textContent = `${winRateValue}%`;

    totalWinnings.textContent = `${gameState.totalWinnings} ₹`;
    todayWinnings.textContent = `${gameState.winnings} ₹`;
    currentStreak.textContent = gameState.currentStreak;
};

// Setup live ticker
const setupTicker = () => {
    const updateTicker = () => {
        let html = '';
        for (let i = 0; i < 8; i++) {
            const name = playerNames[Math.floor(Math.random() * playerNames.length)];
            const amount = Math.floor(Math.random() * 200) + 50;
            html += `<span class="ticker-item">🔥 ${name} won ${amount} ₹! </span>`;
        }
        tickerContent.innerHTML = html;
    };

    updateTicker();
    setInterval(updateTicker, 25000);
};

// Setup leaderboard
const setupLeaderboard = () => {
    // Generate random leaderboard data
    const leaderboardData = [];

    for (let i = 0; i < 5; i++) {
        const name = playerNames[Math.floor(Math.random() * playerNames.length)];
        const points = Math.floor(Math.random() * 5000) + 1000;
        leaderboardData.push({ name, points, rank: i + 1 });
    }

    // Add current user to leaderboard
    leaderboardData.push({
        name: "You",
        points: gameState.balance,
        rank: leaderboardData.length + 1,
        isCurrentUser: true
    });

    // Sort by points
    leaderboardData.sort((a, b) => b.points - a.points);

    // Update ranks
    leaderboardData.forEach((player, index) => {
        player.rank = index + 1;
    });

    // Display leaderboard
    leaderboardList.innerHTML = "";
    leaderboardData.forEach(player => {
        const leaderItem = document.createElement("div");
        leaderItem.className = `leader-item ${player.isCurrentUser ? 'current-user' : ''}`;
        leaderItem.innerHTML = `
            <div class="leader-rank">${player.rank}</div>
            <div class="leader-name">${player.name}</div>
            <div class="leader-points">${player.points} ₹</div>
        `;
        leaderboardList.appendChild(leaderItem);
    });
};

// Show message with animation
const showMessage = (message, type) => {
    const icon = type === "win" ? "fas fa-trophy" :
        type === "lose" ? "fas fa-sad-tear" : "fas fa-info-circle";

    resultMessage.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    resultMessage.className = `result-message ${type}`;
};

// Calculate scratched percentage (optimized)
const calculateScratchedPercentage = () => {
    if (!coverageCanvas) {
        coverageCanvas = document.createElement('canvas');
        coverageCanvas.width = 32; // Even smaller for better performance
        coverageCanvas.height = 24;
        coverageCtx = coverageCanvas.getContext('2d');
    }
    
    const w = coverageCanvas.width;
    const h = coverageCanvas.height;
    
    // Draw main canvas into small coverage canvas
    coverageCtx.clearRect(0, 0, w, h);
    coverageCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, w, h);
    const data = coverageCtx.getImageData(0, 0, w, h).data;
    let cleared = 0;
    const total = w * h;
    
    // Sample every 4th pixel for even better performance
    for (let i = 0; i < data.length; i += 16) {
        const alpha = data[i + 3];
        if (alpha < 32) cleared++; // treat near transparent as cleared
    }
    return (cleared / (total / 4)) * 100; // Adjust for sampling rate
};

// Check for win condition
const checkForWin = () => {
    if (gameState.currentPrize > 0) {
        // Update game state
        gameState.balance += gameState.currentPrize;
        gameState.winnings += gameState.currentPrize;
        gameState.totalWinnings += gameState.currentPrize;
        gameState.winCount++;

        // Show win message and celebration
        showWinModal(gameState.currentPrize);
        celebrate("win");
        if (navigator.vibrate) navigator.vibrate(40);

        // Update prize display
        prizeValue.textContent = `${gameState.currentPrize} ₹`;
        prizeValue.classList.add('revealed');
        setTimeout(() => prizeValue.classList.remove('revealed'), 600);
        prizeDisplay.style.background = "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)";
    } else {
        // No prize
        showMessage("No prize this time. Try again!", "lose");
        celebrate("lose");

        // Update prize display
        prizeValue.textContent = "No Prize";
        prizeDisplay.style.background = "linear-gradient(135deg, #868f96 0%, #596164 100%)";
    }

    gameState.scratchCount++;
    updateUI();
    updateStats();
    saveGameState();

    // Lock for next card: require watching another ad
    setTimeout(() => {
        gameState.isUnlocked = false;
        if (scratchSheen) scratchSheen.style.opacity = '0';
        scratchOverlay.style.display = "flex";
        const cooldownCheck = canWatchAd();
        unlockBtn.disabled = !cooldownCheck.canWatch;
        unlockBtn.innerHTML = '<i class="fas fa-unlock"></i> Watch Ad to Unlock';
        updateCooldownDisplay();
        saveGameState();
    }, 1200);
};

// Show win modal
const showWinModal = (prize) => {
    const winEmoji = document.getElementById("winEmoji");
    const winAmount = document.getElementById("winAmount");

    // Set random emoji
    const emojis = ["🎉", "💰", "🏆", "🎁", "💎"];
    winEmoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    // Count-up animation for amount
    const duration = 700;
    const start = performance.now();
    const animate = (t) => {
        const p = Math.min(1, (t - start) / duration);
        const value = Math.floor(prize * p);
        winAmount.textContent = `+${value} ₹`;
        if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    winModal.style.display = "flex";
};

// Celebration effects
const celebrate = (type) => {
    celebration.classList.add("active");

    if (type === "win") {
        // Confetti celebration for win
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
            });

            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                });
            }, 250);

            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                });
            }, 500);
        } else {
            // fallback simple emoji burst
            celebration.innerHTML = `<div style="position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); font-size:80px;">🎉</div>`;
        }
    } else {
        // Sad animation for loss
        const sadEmojis = ["😢", "😞", "😔", "😩", "😫"];
        const emoji = sadEmojis[Math.floor(Math.random() * sadEmojis.length)];

        celebration.innerHTML = `
            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); 
                       font-size:80px; animation: fallDown 2s forwards;">
                ${emoji}
            </div>
        `;

        // Add CSS for animation (only once)
        if (!document.querySelector('#sadAnimation')) {
            const style = document.createElement('style');
            style.id = 'sadAnimation';
            style.textContent = `
                @keyframes fallDown {
                    0% { transform: translate(-50%, -100px); opacity: 0; }
                    50% { transform: translate(-50%, -50%); opacity: 1; }
                    100% { transform: translate(-50%, 50px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Hide celebration after delay
    setTimeout(() => {
        celebration.classList.remove("active");
        celebration.innerHTML = "";
    }, 3000);
};

// ===== Secret Earning 2 (URL + Password) =====
let se2Offers = [];
const SE2_MIN_PAYOUT = 6;
const SE2_MAX_PAYOUT = 11;
const SE2_COOLDOWN_MS = 25 * 60 * 60 * 1000;
const SE2_COOLDOWN_KEY = 'se2OfferCooldowns';
let se2Cooldowns = {};

const loadSe2Cooldowns = () => {
    try { se2Cooldowns = JSON.parse(localStorage.getItem(SE2_COOLDOWN_KEY) || '{}') || {}; } catch { se2Cooldowns = {}; }
};

const saveSe2Cooldowns = () => {
    try { localStorage.setItem(SE2_COOLDOWN_KEY, JSON.stringify(se2Cooldowns)); } catch {}
};

const se2MsRemainingFor = (offer) => {
    const key = offer?.url || '';
    const until = se2Cooldowns[key] || 0;
    return Math.max(0, until - Date.now());
};

const parseSe2Offers = () => {
    try {
        const raw = se2OffersDataEl?.textContent?.trim();
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) return arr;
    } catch {}
    return [];
};

const creditAmount = (amount) => {
    gameState.balance += amount;
    gameState.winnings += amount;
    gameState.totalWinnings += amount;
    updateUI();
    updateStats();
    
    // ADDED: Celebration for secret earnings
    if (amount > 0) {
        celebrate("win");
        showMessage(`Congratulations! You earned ${amount} ₹ from secret offer!`, "win");
    }
};

const renderSe2Offers = () => {
    if (!se2OfferList) return;
    se2OfferList.innerHTML = '';

    // Build only offers that are not on cooldown
    const available = se2Offers.filter(o => se2MsRemainingFor(o) <= 0);

    if (available.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-offers';
        empty.innerHTML = 'All offers are completed. New offers will unlock as timers reset. Please check back later.';
        se2OfferList.appendChild(empty);
        return;
    }

    available.forEach((offer) => {
        const row = document.createElement('div');
        row.className = 'offer-card';
        row.innerHTML = `
            <div class=\"offer-main\">
                <div class=\"offer-title\">${offer.title || 'Offer'}</div>
                <div class=\"offer-potential\">Win up to ₹1,00,000</div>
            </div>
            <div class=\"offer-actions\">
                <a class=\"btn btn-primary open-url\" href=\"${offer.url}\" target=\"_blank\" rel=\"noopener\">Open URL</a>
                <div class=\"pw-wrap\">
                    <input class=\"pw-input\" type=\"password\" placeholder=\"Enter password\" aria-label=\"Enter password for ${offer.title || 'offer'}\">
                    <button class=\"btn btn-withdraw submit\">Submit</button>
                </div>
                <div class=\"row-status\" aria-live=\"polite\"></div>
            </div>
        `;
        const submitBtn = row.querySelector('.submit');
        const input = row.querySelector('.pw-input');
        const status = row.querySelector('.row-status');

        submitBtn.addEventListener('click', async () => {
            const { left, msLeft } = updateSeDailyInfo(DAILY_KEYS.se2, se2DailyInfo);
            if (left <= 0) {
                status.textContent = `Daily limit reached. Resets in ${formatDuration(msLeft)}.`;
                status.className = 'row-status error';
                return;
            }
            const val = (input.value || '').trim();
            if (!val) {
                status.textContent = 'Please enter the password.';
                status.className = 'row-status error';
                return;
            }
            const expected = String(offer.password || '');
            if (expected && val === expected) {
                // Credit payout (random 8–12)
                const amount = Math.floor(Math.random() * (SE2_MAX_PAYOUT - SE2_MIN_PAYOUT + 1)) + SE2_MIN_PAYOUT;
                creditAmount(amount);
                // Count this completion in SE2 daily
                incDaily(DAILY_KEYS.se2);
                updateSeDailyInfo(DAILY_KEYS.se2, se2DailyInfo);
                // Set per-offer cooldown and hide this row
                se2Cooldowns[offer.url] = Date.now() + SE2_COOLDOWN_MS;
                saveSe2Cooldowns();
                status.textContent = 'Success! Reward credited. This offer will be available again after 25 hours.';
                status.className = 'row-status success';
                input.value = '';
                // Remove from DOM with a short delay for feedback
                setTimeout(() => {
                    row.remove();
                    // If list becomes empty, render empty state
                    if (se2OfferList.children.length === 0) {
                        const empty = document.createElement('div');
                        empty.className = 'empty-offers';
                        empty.innerHTML = 'All offers are completed. New offers will unlock as timers reset. Please check back later.';
                        se2OfferList.appendChild(empty);
                    }
                }, 600);
            } else {
                status.textContent = 'Incorrect password. Please try again after completing the tasks.';
                status.className = 'row-status error';
            }
        });

        se2OfferList.appendChild(row);
    });
};

function initSecret2Tab() {
    // Load config
    const limitAttr = parseInt(se2ConfigEl?.dataset?.limit || `${SE_LIMIT}`, 10);
    const windowHoursAttr = parseInt(se2ConfigEl?.dataset?.windowHours || `${SE_WINDOW_MS / 3600000}`, 10);
    loadSe2Cooldowns();
    se2Offers = parseSe2Offers();
    renderSe2Offers();
    // Periodically refresh list so offers reappear when timers expire
    setInterval(() => {
        renderSe2Offers();
        updateSeDailyInfo(DAILY_KEYS.se2, se2DailyInfo);
    }, 60 * 1000);
}

// ===== Utility for Secret Earning daily limits =====
const getDailyState = (key) => {
    try {
        let s = JSON.parse(localStorage.getItem(key) || 'null');
        if (!s || typeof s.resetAt !== 'number' || Date.now() > s.resetAt) {
            s = { count: 0, resetAt: Date.now() + SE_WINDOW_MS };
            localStorage.setItem(key, JSON.stringify(s));
        }
        return s;
    } catch {
        const s = { count: 0, resetAt: Date.now() + SE_WINDOW_MS };
        try { localStorage.setItem(key, JSON.stringify(s)); } catch {}
        return s;
    }
};

const incDaily = (key) => {
    const s = getDailyState(key);
    s.count += 1;
    try { localStorage.setItem(key, JSON.stringify(s)); } catch {}
    return s;
};

const two = (n) => String(n).padStart(2, '0');

const formatDuration = (ms) => {
    const t = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    return `${two(h)}:${two(m)}`;
};

const updateSeDailyInfo = (key, el) => {
    const s = getDailyState(key);
    const left = Math.max(0, SE_LIMIT - s.count);
    const msLeft = Math.max(0, s.resetAt - Date.now());
    if (el) el.textContent = `${left} uses left • resets in ${formatDuration(msLeft)}h`;
    return { left, msLeft };
};

// Scratch functionality
let isDragged = false;
let lastScratchTime = 0;
let lastPoint = null;

// Brush + fast coverage sampling
const BRUSH_RADIUS = 22;
let brushCanvas = null;
let coverageCanvas = null;
let coverageCtx = null;

const createNoiseBrush = () => {
    const size = BRUSH_RADIUS * 2;
    brushCanvas = document.createElement('canvas');
    brushCanvas.width = size;
    brushCanvas.height = size;
    const bctx = brushCanvas.getContext('2d');
    const img = bctx.createImageData(size, size);
    const center = BRUSH_RADIUS;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x - center;
            const dy = y - center;
            const dist = Math.sqrt(dx*dx + dy*dy) / BRUSH_RADIUS;
            let alpha = 0;
            if (dist <= 1) {
                // Soft edge with subtle noise for realistic scratch
                alpha = Math.max(0, 1 - Math.pow(dist, 1.5));
                // Grain
                alpha *= 0.85 + Math.random() * 0.3;
            }
            const i = (y * size + x) * 4;
            img.data[i] = 255;
            img.data[i+1] = 255;
            img.data[i+2] = 255;
            img.data[i+3] = Math.floor(alpha * 255);
        }
    }
    bctx.putImageData(img, 0, 0);
};

const ensureCoverageSampler = () => {
    if (!coverageCanvas) {
        coverageCanvas = document.createElement('canvas');
        // Downsampled grid for fast coverage checks
        coverageCanvas.width = 32;
        coverageCanvas.height = 24;
        coverageCtx = coverageCanvas.getContext('2d');
    }
};

// Sheen updater (UI polish)
const updateSheenFromEvent = (e) => {
    if (!scratchContainer || !scratchSheen) return;
    const rect = scratchContainer.getBoundingClientRect();
    let clientX, clientY;
    if (e.type && e.type.includes('touch')) {
        if (!e.touches || e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX ?? (e.pageX - window.scrollX);
        clientY = e.clientY ?? (e.pageY - window.scrollY);
    }
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    scratchSheen.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
};

const scratch = (x, y) => {
    if (gameState.isScratched || !gameState.isUnlocked) return;

    // Performance optimization - limit scratch rate
    const now = Date.now();
    if (now - lastScratchTime < 16) return; // ~60fps
    lastScratchTime = now;

    // Create brush if not exists
    if (!brushCanvas) {
        createNoiseBrush();
    }

    // Stamp noise brush along the path for realistic scratch
    context.save();
    context.globalCompositeOperation = "destination-out";

    if (lastPoint) {
        const dx = x - lastPoint.x;
        const dy = y - lastPoint.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        const step = BRUSH_RADIUS * 0.5;
        const steps = Math.ceil(dist / step);
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = lastPoint.x + dx * t;
            const py = lastPoint.y + dy * t;
            context.drawImage(brushCanvas, px - BRUSH_RADIUS, py - BRUSH_RADIUS);
        }
    } else {
        context.drawImage(brushCanvas, x - BRUSH_RADIUS, y - BRUSH_RADIUS);
    }

    context.restore();
    lastPoint = { x, y };

    // Update progress bar (optimized sampling)
    const scratchPercentage = calculateScratchedPercentage();
    progressBar.style.width = `${Math.min(100, scratchPercentage)}%`;

    // Check if enough area is scratched
    if (scratchPercentage >= 30 && !gameState.isScratched) {
        gameState.isScratched = true;
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(checkForWin, 250);
    }
};

// Get exact x and y position on canvas
const getXY = (e) => {
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;

    if (e.type.includes('touch')) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    // Use CSS pixels since context is scaled by DPR already
    const x = (clientX - rect.left);
    const y = (clientY - rect.top);

    return { x, y };
};

// Event listeners for scratch functionality
["mousedown", "touchstart"].forEach((event) => {
    canvas.addEventListener(event, (e) => {
        if (gameState.isScratched || !gameState.isUnlocked) return;

        isDragged = true;
        const { x, y } = getXY(e);
        lastPoint = { x, y };
        if (scratchSheen) {
            updateSheenFromEvent(e);
            scratchSheen.style.opacity = '1';
        }
        scratch(x, y);
    });
});

["mousemove", "touchmove"].forEach((event) => {
    canvas.addEventListener(event, (e) => {
        if (gameState.isUnlocked && scratchSheen) {
            updateSheenFromEvent(e);
            if (!isDragged) scratchSheen.style.opacity = '1';
        }
        if (isDragged && !gameState.isScratched && gameState.isUnlocked) {
            e.preventDefault();
            const { x, y } = getXY(e);
            scratch(x, y);
        }
    });
});

["mouseup", "touchend", "mouseleave"].forEach((event) => {
    canvas.addEventListener(event, () => {
        isDragged = false;
        lastPoint = null;
        if (scratchSheen) scratchSheen.style.opacity = '0';
    });
});

// Withdrawal functionality
const validateEmail = () => {
    const paytmInput = document.getElementById("paytmInput"); // ADD THIS LINE
    if (!paytmInput) return false; // Safety check
    
    const email = paytmInput.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(email)) {
        paytmInput.classList.remove("error");
        emailError.style.display = "none";
        return true;
    } else {
        paytmInput.classList.add("error"); // FIXED: was paytm.classList.add("error")
        if (email.length > 0) {
            emailError.style.display = "block";
        } else {
            emailError.style.display = "none";
        }
        return false;
    }
};

const processWithdrawal = () => {
    const paytmInput = document.getElementById("paytmInput"); // ADD THIS LINE
    if (!paytmInput) {
        showWithdrawMessage("System error: Cannot find email input", "error");
        return;
    }
    
    const email = paytmInput.value.trim();

    if (!validateEmail(email)) {
        showWithdrawMessage("Please enter a valid Paytm email", "error");
        return;
    }

    if (gameState.balance < REQUIRED_BALANCE) {
        showWithdrawMessage(`You need at least ${REQUIRED_BALANCE} ₹ to withdraw`, "error");
        return;
    }

    // Process withdrawal
    gameState.balance -= REQUIRED_BALANCE;

    // Add to withdrawal history
    const withdrawal = {
        amount: WITHDRAWAL_AMOUNT,
        date: new Date().toLocaleDateString(),
        status: "Processing",
        email: email
    };

    gameState.withdrawalHistory.push(withdrawal);

    // Save immediately after withdrawal
    saveGameState();

    // Update UI
    updateUI();
    updateStats();

    // Show success modal
    queuePosition.textContent = Math.floor(Math.random() * 100) + 900;
    withdrawMessage.textContent = `Your ₹${WITHDRAWAL_AMOUNT} is being sent to: ${email}. Due to high volume, processing may take 1-3 hours.`;
    withdrawModal.style.display = "flex";

    // Clear input - FIXED: was paytm.value = ""
    paytmInput.value = "";

    // Confetti celebration
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // Auto-close withdraw modal after 3 seconds
    setTimeout(() => {
        withdrawModal.style.display = "none";
    }, 3000);
};

const showWithdrawMessage = (message, type) => {
    // Keep this simple for demo: show alert + small inline message
    alert(message);
};

function verifyDoublePassword(configEl, inputA, inputB) {
    if (!configEl) return { ok: false, msg: 'Reset is not configured.' };
    const p1 = (configEl.dataset?.pass1 || '').trim();
    const p2 = (configEl.dataset?.pass2 || '').trim();
    const v1 = (inputA?.value || '').trim();
    const v2 = (inputB?.value || '').trim();
    if (!v1 || !v2) return { ok: false, msg: 'Enter both passwords.' };
    if (!p1 || !p2) return { ok: false, msg: 'Reset passwords not set.' };
    if (v1 !== p1 || v2 !== p2) return { ok: false, msg: 'Incorrect passwords.' };
    return { ok: true };
}

function initResetSections() {
    // Ensure reset block is hidden on startup
    if (se2ResetBlock) {
        se2ResetBlock.classList.add('hidden');
    }
    
    if (se2ResetBtn) {
        se2ResetBtn.addEventListener('click', () => {
            const res = verifyDoublePassword(se2ResetConfigEl, se2PassA, se2PassB);
            if (!res.ok) {
                if (se2ResetStatus) { se2ResetStatus.textContent = res.msg; se2ResetStatus.className = 'reset-status error'; }
                return;
            }
            // Reset SE2 window and per-offer cooldowns
            const s = { count: 0, resetAt: Date.now() + SE_WINDOW_MS };
            try { localStorage.setItem(DAILY_KEYS.se2, JSON.stringify(s)); } catch {}
            se2Cooldowns = {}; saveSe2Cooldowns();
            renderSe2Offers();
            updateSeDailyInfo(DAILY_KEYS.se2, se2DailyInfo);
            if (se2ResetStatus) { se2ResetStatus.textContent = 'Reset successful for Secret Earning 2. Offers unlocked.'; se2ResetStatus.className = 'reset-status success'; }
            if (se2PassA) se2PassA.value = '';
            if (se2PassB) se2PassB.value = '';
            // Auto-hide after success
            if (se2ResetBlock) se2ResetBlock.classList.add('hidden');
        });
    }
}

function initEasterEggs() {
    const pressMs = 5000;
    eggTriggers.forEach(tr => {
        let timer = null;
        const targetId = tr.getAttribute('data-target');
        const block = document.getElementById(targetId);
        
        // Ensure block is hidden initially
        if (block) block.classList.add('hidden');
        
        const start = (e) => {
            e.preventDefault();
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                if (block) {
                    block.classList.remove('hidden');
                    block.style.display = 'block';
                }
            }, pressMs);
        };
        const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
        tr.addEventListener('pointerdown', start);
        tr.addEventListener('pointerup', cancel);
        tr.addEventListener('pointerleave', cancel);
        tr.addEventListener('pointercancel', cancel);
        // Touch fallback if pointer events aren't available
        tr.addEventListener('touchstart', start, { passive: false });
        tr.addEventListener('touchend', cancel);
        tr.addEventListener('mousedown', start);
        tr.addEventListener('mouseup', cancel);
    });
}

// Initialize game when page loads
window.onload = init;
