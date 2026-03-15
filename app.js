/* ============================================
   JASMIN C4ISR – Symulator Sztabowy
   Main Application Logic
   ============================================ */

// ==================== CONSTANTS ====================
const GRID_W = 20;
const GRID_H = 15;
const SIM_START_HOUR = 6;

// Terrain types
const T = {
    PLAIN: 'plain', FOREST: 'forest', URBAN: 'urban',
    RIVER: 'river', ROAD: 'road', BRIDGE: 'bridge'
};

// Terrain cover bonuses (damage reduction)
const TERRAIN_COVER = {
    [T.PLAIN]: 0.0, [T.FOREST]: 0.4, [T.URBAN]: 0.5,
    [T.RIVER]: 0.2, [T.ROAD]: 0.0, [T.BRIDGE]: 0.1
};

// Fuel cost per terrain
const FUEL_COST = {
    [T.PLAIN]: 10, [T.FOREST]: 20, [T.URBAN]: 12,
    [T.RIVER]: 999, [T.ROAD]: 8, [T.BRIDGE]: 8
};

// Unit definitions
const UNIT_DEFS = {
    'KTO Rosomak': { hp: 80, ammo: 100, fuel: 100, baseDmg: 25, armor: 40, range: 3, sight: 3, symbol: 'mech_inf', speed: 2 },
    'AHS Krab':    { hp: 60, ammo: 80,  fuel: 100, baseDmg: 45, armor: 20, range: 6, sight: 2, symbol: 'arty',     speed: 1 },
    'Rozpoznanie': { hp: 50, ammo: 60,  fuel: 120, baseDmg: 15, armor: 15, range: 2, sight: 5, symbol: 'recon',    speed: 3 },
    'Leopard 2PL': { hp: 120, ammo: 80, fuel: 80,  baseDmg: 55, armor: 75, range: 3, sight: 3, symbol: 'armor',    speed: 1 },
    'Spike ATGM':  { hp: 40, ammo: 40,  fuel: 40,  baseDmg: 60, armor: 10, range: 4, sight: 4, symbol: 'mech_inf', speed: 1 },
    'FOB Rogoźno': { hp: 500, ammo: 999, fuel: 999, baseDmg: 0,  armor: 50, range: 0, sight: 2, symbol: 'supply',   speed: 0 },
    'Artyleria':   { hp: 55,  ammo: 80, fuel: 100, baseDmg: 40, armor: 15, range: 6, sight: 2, symbol: 'arty',     speed: 1 },
    'T-72':        { hp: 100, ammo: 80, fuel: 100, baseDmg: 40, armor: 60, range: 3, sight: 3, symbol: 'armor',    speed: 2 },
    'BMP-2':       { hp: 70,  ammo: 90, fuel: 100, baseDmg: 22, armor: 30, range: 3, sight: 3, symbol: 'mech_inf', speed: 2 },
    'Mi-24':       { hp: 80,  ammo: 100, fuel: 120, baseDmg: 35, armor: 40, range: 4, sight: 5, symbol: 'recon',    speed: 4 },
    'Cysterna':    { hp: 40,  ammo: 0,   fuel: 500, baseDmg: 0,  armor: 5,  range: 0, sight: 2, symbol: 'fuel',     speed: 3 },
    'FlyEye':      { hp: 20,  ammo: 0,   fuel: 200, baseDmg: 0,  armor: 5,  range: 0, sight: 6, symbol: 'uav',      speed: 5 },
    'Radar Liwiec':{ hp: 50,  ammo: 0,   fuel: 100, baseDmg: 0,  armor: 20, range: 8, sight: 3, symbol: 'radar',    speed: 2 },
    'Wóz Inż':     { hp: 70,  ammo: 20,  fuel: 120, baseDmg: 10, armor: 35, range: 1, sight: 2, symbol: 'eng',      speed: 2 },
    'Wóz Dowodzenia':{ hp: 80, ammo: 40,  fuel: 120, baseDmg: 15, armor: 40, range: 2, sight: 3, symbol: 'hq',       speed: 2 },
    'Mina':        { hp: 1,   ammo: 0,   fuel: 0,   baseDmg: 60, armor: 0,  range: 0, sight: 2, symbol: 'mine',     speed: 0 }
};

// Reinforcement Costs & Points
let playerRP = 50;
const UNIT_COSTS = {
    'KTO Rosomak': 35,
    'AHS Krab': 50,
    'Rozpoznanie': 20,
    'Leopard 2PL': 65,
    'Spike ATGM': 30,
    'Cysterna': 15,
    'FlyEye': 12,
    'Radar Liwiec': 35,
    'Wóz Inż': 30
};

// ==================== MAP LAYOUT (Wielkopolska - okolice Rogoźna) ====================
// 20x15 grid: simplified representation
// Key: p=plain, f=forest, u=urban, r=river, d=road, b=bridge
const MAP_RAW = [
    // y=0  (north)
    'fffdppppppffppppppff',  // 0 - lasy na północy, droga N-S
    'fffdppppppffppfpppff',  // 1
    'pppdppffppppppfppppp',  // 2 - droga wchodzi w równinę
    'pppdppffpppppppppppp',  // 3
    'ddddddddddddddddddd',  // 4 - główna droga E-W (DK11)
    'pppdppppppuppppppppp',  // 5 - Oborniki (urban)
    'pppdppppppuppppppppp',  // 6
    'rrrbrrrrrrrrrrrrrrpp',  // 7 - rzeka Wełna z mostem (bridge col 3)
    'pppdpppppppppppppppp',  // 8
    'pppdppppuupppppppppp',  // 9 - Rogoźno (urban)
    'pppdppppuupppppppppp',  // 10
    'pppdppppppppppffpppp',  // 11
    'fffdppppppppppffpppp',  // 12 - lasy na południu
    'fffdppppppppppffpppp',  // 13
    'fffdppppppppppffffpp',  // 14
];

function parseMap() {
    const charMap = { p: T.PLAIN, f: T.FOREST, u: T.URBAN, r: T.RIVER, d: T.ROAD, b: T.BRIDGE };
    const grid = [];
    for (let y = 0; y < GRID_H; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_W; x++) {
            grid[y][x] = charMap[MAP_RAW[y][x]] || T.PLAIN;
        }
    }
    return grid;
}

const TERRAIN_ICONS = {
    [T.FOREST]: '🌲', [T.URBAN]: '🏘', [T.RIVER]: '〜',
    [T.ROAD]: '═', [T.BRIDGE]: '🌉'
};

// ==================== NATO APP-6 SVG SYMBOLS ====================
function natoSVG(type, faction) {
    const fill = faction === 'PL' ? '#4488ff' : '#ff4444';
    const fillBg = faction === 'PL' ? 'rgba(68,136,255,0.2)' : 'rgba(255,68,68,0.2)';
    const stroke = faction === 'PL' ? '#6699ff' : '#ff6666';

    // APP-6 frame: rectangle for friendly, diamond for hostile
    let frame, interior;

    if (faction === 'PL') {
        // Friendly: rectangle frame
        frame = `<rect x="3" y="6" width="28" height="20" fill="${fillBg}" stroke="${stroke}" stroke-width="2" rx="1"/>`;
    } else {
        // Hostile: diamond frame
        frame = `<polygon points="17,2 32,17 17,32 2,17" fill="${fillBg}" stroke="${stroke}" stroke-width="2"/>`;
    }

    // Interior symbols based on unit type
    switch(type) {
        case 'mech_inf':
            // Mechanized Infantry: X with oval
            interior = `
                <line x1="8" y1="10" x2="26" y2="22" stroke="${fill}" stroke-width="2"/>
                <line x1="26" y1="10" x2="8" y2="22" stroke="${fill}" stroke-width="2"/>
                <ellipse cx="17" cy="16" rx="5" ry="3" fill="none" stroke="${fill}" stroke-width="1.5"/>
            `;
            break;
        case 'armor':
            // Armor: oval/ellipse
            interior = `
                <ellipse cx="17" cy="16" rx="9" ry="6" fill="none" stroke="${fill}" stroke-width="2.5"/>
            `;
            break;
        case 'arty':
            // Artillery: filled circle
            interior = `<circle cx="17" cy="16" r="5" fill="${fill}"/>`;
            break;
        case 'recon':
            // Recon: diagonal slash
            interior = `<line x1="10" y1="22" x2="24" y2="10" stroke="${fill}" stroke-width="2.5"/>`;
            break;
        case 'supply':
            // Supply: Two vertical bars
            interior = `
                <line x1="13" y1="10" x2="13" y2="22" stroke="${fill}" stroke-width="3"/>
                <line x1="21" y1="10" x2="21" y2="22" stroke="${fill}" stroke-width="3"/>
            `;
            break;
        case 'fuel':
            // Fuel: rectangle with a drop (represented as an upright rectangle with diagonal top)
            interior = `
                <rect x="12" y="10" width="10" height="12" fill="none" stroke="${fill}" stroke-width="2"/>
                <path d="M12 10 L17 6 L22 10" fill="none" stroke="${fill}" stroke-width="2"/>
            `;
            break;
        case 'uav':
            // UAV: V shape / wings
            interior = `<path d="M5 14 L17 22 L29 14 M17 10 L17 22" fill="none" stroke="${fill}" stroke-width="2"/>`;
            break;
        case 'radar':
            // Radar: stylized dish / arc
            interior = `<path d="M8 22 A12 12 0 0 1 26 22 M17 14 L17 22" fill="none" stroke="${fill}" stroke-width="2"/>`;
            break;
        case 'eng':
            // Engineering: gear
            interior = `<circle cx="17" cy="16" r="6" fill="none" stroke="${fill}" stroke-width="2" stroke-dasharray="3,3"/>`;
            break;
        case 'mine':
            // Mine: circle with M
            interior = `<circle cx="17" cy="16" r="5" fill="none" stroke="${fill}" stroke-width="2"/>
                        <text x="14" y="20" font-size="10" fill="${fill}" font-weight="bold">M</text>`;
            break;
        case 'hq':
            // HQ: standard NATO box with black corner
            interior = `<rect x="5" y="8" width="24" height="16" fill="none" stroke="${fill}" stroke-width="2"/>
                        <rect x="5" y="8" width="8" height="8" fill="${fill}"/>`;
            break;
        default:
            interior = `<circle cx="17" cy="16" r="4" fill="${fill}"/>`;
    }

    return `<svg viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">${frame}${interior}</svg>`;
}

// ==================== STATE ====================
let terrain = parseMap();
let units = [];
let turn = 0;
let simMinutes = 0;
let selectedUnitId = null;
let actionMode = null; // 'move' | 'fire' | null
let opforPhase = 1;
let airSupportCooldown = 0;
const AIR_SUPPORT_MAX_COOLDOWN = 8;
let reinforcementsCalled = false;

// Custom Scenarios Logic
let creatorMode = false;
let activeScenarioId = null;
let customScenarios = [];

// Advanced C4ISR State
let persistentReconMap = Array(GRID_H).fill().map(() => Array(GRID_W).fill(false));
let batteryMarkers = []; // {x, y, age} for counter-battery
let environment = { isNight: false, weather: 'clear' };
let c2Nodes = []; // References to C2 units for network check

// ==================== INITIAL UNITS ====================
function createInitialUnits() {
    let id = 0;
    const u = (faction, type, x, y, name) => ({
        id: id++, faction, type, x, y, name,
        hp: UNIT_DEFS[type].hp,
        maxHp: UNIT_DEFS[type].hp,
        ammo: UNIT_DEFS[type].ammo,
        maxAmmo: UNIT_DEFS[type].ammo,
        fuel: UNIT_DEFS[type].fuel,
        maxFuel: UNIT_DEFS[type].fuel,
        morale: 1.0,
        jammed: false,
        jammedTurns: 0,
        alive: true
    });

    return [
        // === PL Forces (Obrona) ===
        // Kompania zmotoryzowana KTO Rosomak – przy moście
        u('PL', 'KTO Rosomak', 3, 8, '1. Kp Zmot'),
        u('PL', 'KTO Rosomak', 4, 8, '2. Kp Zmot'),
        u('PL', 'KTO Rosomak', 2, 9, '3. Kp Zmot'),

        // Bateria AHS Krab – w lesie na południu
        u('PL', 'AHS Krab', 13, 12, '1. Bat Art'),
        u('PL', 'AHS Krab', 14, 13, '2. Bat Art'),

        // Pluton rozpoznawczy – na przedpolu
        u('PL', 'Rozpoznanie', 3, 5, '1. Plut Rozp'),
        u('PL', 'Rozpoznanie', 5, 4, '2. Plut Rozp'),

        // === OPFOR Forces (Natarcie ze wschodu/północy) ===
        // Kompania czołgów T-72
        u('OPFOR', 'T-72', 17, 1, 'T-72 Alpha'),
        u('OPFOR', 'T-72', 18, 1, 'T-72 Bravo'),
        u('OPFOR', 'T-72', 19, 2, 'T-72 Charlie'),

        // Kompania BMP z piechotą – flankuje od północy
        u('OPFOR', 'BMP-2', 15, 0, 'BMP-2 Alpha'),
        u('OPFOR', 'BMP-2', 16, 0, 'BMP-2 Bravo'),
        u('OPFOR', 'BMP-2', 14, 1, 'BMP-2 Charlie'),

        // Artyleria OPFOR – z tyłu
        u('OPFOR', 'Artyleria', 18, 0, 'Art. OPFOR 1'),
        u('OPFOR', 'Artyleria', 19, 0, 'Art. OPFOR 2'),

        // Advanced Specialized Units
        u('PL', 'Wóz Dowodzenia', 8, 11, 'C2 Dowodzenie'),
        u('PL', 'Radar Liwiec', 12, 11, 'Radar Liwiec'),
        u('PL', 'Wóz Inż', 9, 10, 'Pluton Inż'),
        u('PL', 'FlyEye', 5, 10, 'Bezzałogowiec FlyEye'),

        // Support & Logistics
        u('PL', 'FOB Rogoźno', 8, 9, 'FOB Rogoźno'),
        u('PL', 'Spike ATGM', 4, 9, 'Plut. Spike'),
        u('PL', 'Cysterna', 7, 9, 'Jelcz Cysterna'),
    ];
}

function spawnReinforcements() {
    if (reinforcementsCalled) return;
    const u = (faction, type, x, y, name) => {
        const unit = {
            id: units.length, faction, type, x, y, name,
            hp: UNIT_DEFS[type].hp,
            maxHp: UNIT_DEFS[type].hp,
            ammo: UNIT_DEFS[type].ammo,
            maxAmmo: UNIT_DEFS[type].ammo,
            fuel: UNIT_DEFS[type].fuel,
            maxFuel: UNIT_DEFS[type].fuel,
            morale: 1.0,
            jammed: false,
            jammedTurns: 0,
            alive: true
        };
        units.push(unit);
        return unit;
    };

    u('PL', 'Leopard 2PL', 3, 14, 'Leo 2PL Alpha');
    u('PL', 'Leopard 2PL', 4, 14, 'Leo 2PL Bravo');

    addLog('system', '🛡 PRZYBYŁY POSIŁKI: Pluton Leopard 2PL wkroczył na południową flankę.');
    showToast('PRZYBYŁY POSIŁKI!', 'success');
    reinforcementsCalled = true;
}

// ==================== COMBAT LOG ====================
function addLog(type, message) {
    const logEl = document.getElementById('combat-log');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;

    const h = Math.floor((SIM_START_HOUR * 60 + simMinutes) / 60) % 24;
    const m = (SIM_START_HOUR * 60 + simMinutes) % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

    const tags = {
        move: 'RUCH', combat: 'WALKA', logistics: 'LOGISTYKA',
        wre: 'WRE', recon: 'ROZPOZNANIE', loss: 'STRATY', system: 'SYSTEM'
    };

    entry.innerHTML = `<span class="timestamp">[${timeStr}]</span><span class="tag">[${tags[type] || 'INFO'}]</span> ${message}`;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

// ==================== TOAST ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; }, 3000);
    setTimeout(() => toast.remove(), 3500);
}

// ==================== RENDERING ====================
function renderMap() {
    const grid = document.getElementById('map-grid');
    grid.innerHTML = '';

    // Build fog map
    const fogMap = buildFogMap();

    for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
            const cell = document.createElement('div');
            cell.className = `map-cell terrain-${terrain[y][x]}`;
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Fog
            if (fogMap[y][x]) {
                cell.classList.add('fog');
            }

            // Terrain icon
            const icon = TERRAIN_ICONS[terrain[y][x]];
            if (icon) {
                const ti = document.createElement('span');
                ti.className = 'terrain-icon';
                ti.textContent = icon;
                cell.appendChild(ti);
            }

            // Unit on this cell
            const unit = units.find(u => u.alive && u.x === x && u.y === y);
            if (unit) {
                const marker = createUnitMarker(unit);
                cell.appendChild(marker);
            }

            // Highlights
            if (selectedUnitId !== null && actionMode) {
                const su = units.find(u => u.id === selectedUnitId);
                if (su) {
                    const dist = Math.abs(x - su.x) + Math.abs(y - su.y);
                    if (actionMode === 'move' && dist > 0 && dist <= UNIT_DEFS[su.type].speed) {
                        if (terrain[y][x] !== T.RIVER && !units.some(u2 => u2.alive && u2.x === x && u2.y === y)) {
                            cell.classList.add('highlight-move');
                        }
                    } else if (actionMode === 'fire' && dist > 0 && dist <= UNIT_DEFS[su.type].range) {
                        const target = units.find(u2 => u2.alive && u2.x === x && u2.y === y && u2.faction !== su.faction);
                        if (target && !fogMap[y][x]) {
                            cell.classList.add('highlight-fire');
                        }
                    } else if ((actionMode === 'place-mine' || actionMode === 'repair-bridge') && dist === 1) {
                        cell.classList.add('highlight-move');
                    }
                }
            }
            if (actionMode === 'air-support') {
                const su = units.find(u => u.id === selectedUnitId); // Selected unit is irrelevant here
                cell.classList.add('highlight-fire');
                cell.style.borderColor = 'var(--accent-cyan)';
            }

            // Selected highlight
            if (unit && unit.id === selectedUnitId) {
                cell.classList.add('selected');
            }

            cell.addEventListener('click', () => onCellClick(x, y));
            grid.appendChild(cell);
        }
    }
}

function createUnitMarker(unit) {
    const marker = document.createElement('div');
    marker.className = `unit-marker faction-${unit.faction.toLowerCase()}`;
    if (unit.id === selectedUnitId) marker.classList.add('selected');
    if (unit.jammed) marker.classList.add('jammed');
    if (!unit.alive) marker.classList.add('destroyed');
    marker.innerHTML = natoSVG(UNIT_DEFS[unit.type].symbol, unit.faction);
    marker.title = `${unit.name} (${unit.type})`;

    // Mini resource bars
    const bars = document.createElement('div');
    bars.className = 'unit-bars';
    const hpPct = (unit.hp / unit.maxHp) * 100;
    const ammoPct = (unit.ammo / unit.maxAmmo) * 100;
    const fuelPct = (unit.fuel / unit.maxFuel) * 100;
    bars.innerHTML = `
        <div class="unit-bar unit-bar-hp" style="width:${hpPct}%"></div>
        <div class="unit-bar unit-bar-ammo" style="width:${ammoPct}%"></div>
        <div class="unit-bar unit-bar-fuel" style="width:${fuelPct}%"></div>
    `;
    marker.appendChild(bars);

    return marker;
}

// ==================== FOG OF WAR ====================
function buildFogMap() {
    const fog = Array(GRID_H).fill().map(() => Array(GRID_W).fill(true));
    
    // Check C2 Network Status for PL units
    const c2Units = units.filter(u => u.alive && u.faction === 'PL' && u.type === 'Wóz Dowodzenia' && !u.jammed);
    
    units.filter(u => u.alive && u.faction === 'PL').forEach(unit => {
        let sight = UNIT_DEFS[unit.type].sight;
        
        // Night penalty: -50% sight unless it's a Leopard 2PL (Thermal) or UAV
        if (environment.isNight && unit.type !== 'Leopard 2PL' && unit.type !== 'FlyEye') {
            sight = Math.max(1, Math.floor(sight * 0.5));
        }

        // C2 Connectivity check
        const inNetwork = c2Units.some(c2 => Math.abs(c2.x - unit.x) + Math.abs(c2.y - unit.y) <= 10);
        const hasComm = inNetwork || unit.type === 'Wóz Dowodzenia';

        // Reveal area around unit
        for (let dy = -sight; dy <= sight; dy++) {
            for (let dx = -sight; dx <= sight; dx++) {
                const nx = unit.x + dx, ny = unit.y + dy;
                if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist <= sight) {
                        // If has comms, reveal on global fog. If not, only reveal if we are the SELECTED unit
                        if (hasComm) {
                            fog[ny][nx] = false;
                        } else if (selectedUnitId === unit.id) {
                            fog[ny][nx] = false;
                        }
                        
                        // Persistent Recon for UAVs
                        if (unit.type === 'FlyEye') {
                            persistentReconMap[ny][nx] = true;
                        }
                    }
                }
            }
        }
    });

    // Apply persistent recon
    for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
            if (persistentReconMap[y][x]) fog[y][x] = false;
        }
    }

    return fog;
}

// ==================== UNIT INFO PANEL ====================
function updateUnitInfo() {
    const panel = document.getElementById('unit-info-content');
    if (selectedUnitId === null) {
        panel.innerHTML = '<p class="placeholder-text">Kliknij jednostkę na mapie…</p>';
        document.getElementById('btn-move').disabled = true;
        document.getElementById('btn-fire').disabled = true;
        return;
    }

    const u = units.find(u => u.id === selectedUnitId);
    if (!u) return;

    const isPL = u.faction === 'PL';
    const fClass = isPL ? 'friendly' : 'hostile';
    const def = UNIT_DEFS[u.type];

    const barHTML = (cls, val, max) => {
        const pct = Math.round((val / max) * 100);
        const low = (pct < 25 && max > 0) ? ' low' : '';
        return `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="stat-bar ${cls}">
                    <span class="stat-bar-fill${low}" style="width:${pct}%"></span>
                </span>
                <span style="min-width: 45px; text-align: right;">${val}</span>
            </div>
        `;
    };

    panel.innerHTML = `
        <div class="unit-info-grid">
            <span class="label">NAZWA:</span><span class="value ${fClass}">${u.name}</span>
            <span class="label">TYP:</span><span class="value">${u.type}</span>
            <span class="label">FRAKCJA:</span><span class="value ${fClass}">${u.faction}</span>
            <span class="label">POZ:</span><span class="value">[${u.x}, ${u.y}]</span>
            <span class="label">HP:</span><span class="value">${barHTML('stat-hp', u.hp, u.maxHp)}</span>
            <span class="label">AMUN:</span><span class="value">${barHTML('stat-ammo', u.ammo, u.maxAmmo)}</span>
            <span class="label">PALIWO:</span><span class="value">${barHTML('stat-fuel', u.fuel, u.maxFuel)}</span>
            <span class="label">MORALE:</span><span class="value">${barHTML('stat-morale', Math.round(u.morale * 100), 100)}</span>
            <span class="label">ZASIĘG:</span><span class="value">${def.range} pól</span>
            <span class="label">RADAR:</span><span class="value">${def.sight} pól</span>
            <span class="label">STATUS:</span><span class="value">${u.jammed ? '⚡ ZAKŁÓCONA' : u.alive ? '✔ SPRAWNA' : '✕ ZNISZCZONA'}</span>
            <span class="label">TEREN:</span><span class="value">${terrain[u.y][u.x]} (osłona: ${Math.round(TERRAIN_COVER[terrain[u.y][u.x]] * 100)}%)</span>
        </div>
    `;

    // Enable controls for PL units
    document.getElementById('btn-move').disabled = !isPL || u.jammed || u.fuel <= 0 || !u.alive;
    document.getElementById('btn-fire').disabled = !isPL || u.ammo <= 0 || !u.alive;
}

// ==================== INTERACTION ====================
function onCellClick(x, y) {
    const clickedUnit = units.find(u => u.alive && u.x === x && u.y === y);

    if (actionMode === 'move' && selectedUnitId !== null) {
        handleMove(x, y);
        return;
    }

    if (actionMode === 'fire' && selectedUnitId !== null) {
        handleFire(x, y);
        return;
    }

    if (actionMode === 'air-support') {
        handleAirSupport(x, y);
        return;
    }

    if (actionMode === 'place-mine') {
        handlePlaceMine(x, y);
        return;
    }

    if (actionMode === 'repair-bridge') {
        handleRepairBridge(x, y);
        return;
    }

    // Select unit
    if (clickedUnit) {
        selectedUnitId = clickedUnit.id;
        actionMode = null;
        updateUnitInfo();
        updateButtons();
        renderMap();
    } else {
        deselectUnit();
    }
}

function updateButtons() {
    const unit = units.find(u => u.id === selectedUnitId);
    const actionArea = document.querySelector('.action-buttons');
    
    // 1. Generic HUD state
    document.getElementById('btn-move').classList.toggle('active', actionMode === 'move');
    document.getElementById('btn-fire').classList.toggle('active', actionMode === 'fire');
    document.getElementById('btn-air-support').classList.toggle('active', actionMode === 'air-support');
    
    const airBtn = document.getElementById('btn-air-support');
    if (airSupportCooldown > 0) {
        airBtn.disabled = true;
        airBtn.textContent = `✈ LOTNICTWO (${airSupportCooldown})`;
    } else {
        airBtn.disabled = false;
        airBtn.textContent = `✈ LOTNICTWO`;
    }

    // 2. Specialty buttons
    if (actionArea) {
        const existingSpecial = actionArea.querySelectorAll('.btn-special');
        existingSpecial.forEach(b => b.remove());

        if (unit && unit.alive && unit.faction === 'PL' && !unit.jammed) {
            document.getElementById('btn-move').disabled = false;
            document.getElementById('btn-fire').disabled = false;

            if (unit.type === 'Wóz Inż') {
                const btnMine = document.createElement('button');
                btnMine.className = 'btn-secondary btn-special';
                btnMine.textContent = '💣 ZAMINUJ';
                btnMine.onclick = () => { actionMode = 'place-mine'; showToast('Wskaż sąsiednie pole do zaminowania', 'info'); };
                actionArea.appendChild(btnMine);

                const btnRepair = document.createElement('button');
                btnRepair.className = 'btn-secondary btn-special';
                btnRepair.textContent = '🔧 NAPRAW MOST';
                btnRepair.onclick = () => { actionMode = 'repair-bridge'; showToast('Wskaż rzekę/most do naprawy', 'info'); };
                actionArea.appendChild(btnRepair);
            }

            if (unit.type === 'FOB Rogoźno') {
                const btnRecruit = document.createElement('button');
                btnRecruit.className = 'btn-primary btn-special';
                btnRecruit.style.borderColor = 'var(--accent-amber)';
                btnRecruit.style.color = 'var(--accent-amber)';
                btnRecruit.textContent = '🏗 WEZWIJ POSIŁKI';
                btnRecruit.onclick = toggleRecruit;
                actionArea.appendChild(btnRecruit);
            }
        } else {
            document.getElementById('btn-move').disabled = true;
            document.getElementById('btn-fire').disabled = true;
        }
    }
}

function handlePlaceMine(x, y) {
    const eng = units.find(u => u.id === selectedUnitId);
    if (!eng || eng.type !== 'Wóz Inż') return;

    const dist = Math.abs(x - eng.x) + Math.abs(y - eng.y);
    if (dist !== 1) { showToast('Mina musi być obok jednostki!', 'combat'); return; }
    if (eng.ammo < 5) { showToast('Brak materiałów minujących!', 'combat'); return; }

    eng.ammo -= 5;
    const mine = {
        id: units.length, faction: 'PL', type: 'Mina', x, y, name: 'Pole Minowe',
        hp: 1, maxHp: 1, ammo: 0, maxAmmo: 0, fuel: 0, maxFuel: 0, morale: 1.0, jammed: false, alive: true
    };
    units.push(mine);
    addLog('logistics', `💣 ${eng.name} postawił POLE MINOWE na [${x},${y}]`);
    
    actionMode = null;
    updateUnitInfo();
    renderMap();
}

function handleRepairBridge(x, y) {
    const eng = units.find(u => u.id === selectedUnitId);
    if (!eng || eng.type !== 'Wóz Inż') return;

    const dist = Math.abs(x - eng.x) + Math.abs(y - eng.y);
    if (dist !== 1) { showToast('Podjedź do rzeki, aby naprawić!', 'combat'); return; }

    if (terrain[y][x] === T.RIVER) {
        terrain[y][x] = T.BRIDGE;
        addLog('logistics', `🔧 ${eng.name} wybudował MOST w punkcie [${x},${y}]`);
        showToast('Most wybudowany!', 'success');
    } else {
        showToast('Tu nie ma rzeki do naprawy!', 'info');
    }

    actionMode = null;
    updateUnitInfo();
    renderMap();
}

function handleMove(x, y) {
    const unit = units.find(u => u.id === selectedUnitId);
    if (!unit || !unit.alive || unit.jammed) return;

    const dist = Math.abs(x - unit.x) + Math.abs(y - unit.y);
    const def = UNIT_DEFS[unit.type];

    if (dist > def.speed || dist === 0) return;
    if (terrain[y][x] === T.RIVER) { showToast('Nie można przejść przez rzekę!', 'combat'); return; }
    if (units.some(u => u.alive && u.x === x && u.y === y)) { showToast('Pole zajęte!', 'combat'); return; }

    const fuelCost = FUEL_COST[terrain[y][x]];
    if (unit.fuel < fuelCost) { showToast('Brak paliwa!', 'combat'); return; }

    const oldFuel = unit.fuel;
    unit.fuel = Math.max(0, unit.fuel - fuelCost);
    const oldX = unit.x, oldY = unit.y;
    unit.x = x; unit.y = y;

    addLog('move', `${unit.name} przesunięto [${oldX},${oldY}] → [${x},${y}] (paliwo: ${oldFuel} → ${unit.fuel})`);
    addLog('logistics', `${unit.name}: zużycie MPS -${fuelCost} (teren: ${terrain[y][x]})`);
    showToast(`⛽ ${unit.name}: paliwo ${oldFuel} → ${unit.fuel} (-${fuelCost})`, 'info');

    actionMode = null;
    updateButtons();
    updateUnitInfo();
    renderMap();
}

function handleFire(x, y) {
    const attacker = units.find(u => u.id === selectedUnitId);
    if (!attacker || !attacker.alive) return;

    const target = units.find(u => u.alive && u.x === x && u.y === y && u.faction !== attacker.faction);
    if (!target) { showToast('Brak celu!', 'combat'); return; }

    const dist = Math.abs(x - attacker.x) + Math.abs(y - attacker.y);
    const def = UNIT_DEFS[attacker.type];

    if (dist > def.range) { showToast('Cel poza zasięgiem!', 'combat'); return; }
    if (attacker.ammo <= 0) { showToast('Brak amunicji!', 'combat'); return; }

    // Ammo cost
    const ammoCost = def.symbol === 'arty' ? 20 : 10;
    attacker.ammo = Math.max(0, attacker.ammo - ammoCost);

    // Calculate damage
    const damage = calculateDamage(attacker, target);
    
    // Counter-Battery: Mark artillery position
    if (def.symbol === 'arty') {
        batteryMarkers.push({ x: attacker.x, y: attacker.y, faction: attacker.faction, age: 0 });
        if (attacker.faction === 'OPFOR') {
            addLog('recon', `📡 WYKRYTO BŁYSK ARTYLERII! Radar szuka pozycji...`);
        }
    }

    target.hp -= damage;
    addLog('combat', `${attacker.name} → ${target.name}: obrażenia ${damage} HP (penetracja: ${Math.round(penetrationRatio(attacker, target) * 100)}%)`);
    addLog('logistics', `${attacker.name}: zużycie ŚSP -${ammoCost} (pozostało: ${attacker.ammo})`);

    // Show explosion
    showExplosion(x, y);

    if (target.hp <= 0) {
        target.hp = 0;
        target.alive = false;
        addLog('loss', `💥 ${target.name} (${target.type}) ZNISZCZONA!`);
        showToast(`${target.name} zniszczona!`, 'combat');
        // Morale impact on nearby allies
        applyMoraleLoss(target);
    }

    actionMode = null;
    updateButtons();
    updateUnitInfo();
    renderMap();
}

function handleAirSupport(x, y) {
    if (airSupportCooldown > 0) {
        showToast(`Lotnictwo niedostępne (oczekiwanie: ${airSupportCooldown} tur)`, 'combat');
        return;
    }
    callAirSupport(x, y);
}

function callAirSupport(targetX, targetY) {
    addLog('recon', '✈ WEZWANIE WSPARCIA LOTNICZEGO (F-16)...');
    showToast('F-16 W DRODZE!', 'info');

    // Strike area 3x3
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const nx = targetX + dx, ny = targetY + dy;
            if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                const target = units.find(u => u.alive && u.x === nx && u.y === ny && u.faction === 'OPFOR');
                showExplosion(nx, ny);
                if (target) {
                    const dmg = 40 + Math.random() * 30;
                    target.hp -= Math.round(dmg);
                    addLog('combat', `💥 Uderzenie CAS: ${target.name} otrzymał ${Math.round(dmg)} HP obrażeń obszarowych`);
                    if (target.hp <= 0) {
                        target.hp = 0; target.alive = false;
                        addLog('loss', `💥 ${target.name} ZNISZCZONA przez nalot F-16!`);
                        applyMoraleLoss(target);
                    }
                }
            }
        }
    }

    airSupportCooldown = AIR_SUPPORT_MAX_COOLDOWN;
    actionMode = null;
    updateButtons();
    renderMap();
}

function showExplosion(x, y) {
    const cells = document.querySelectorAll('.map-cell');
    const idx = y * GRID_W + x;
    if (cells[idx]) {
        const eff = document.createElement('div');
        eff.className = 'explosion-effect';
        cells[idx].appendChild(eff);
        setTimeout(() => eff.remove(), 600);
    }
}

// ==================== DAMAGE MODEL ====================
function penetrationRatio(attacker, target) {
    const atkDef = UNIT_DEFS[attacker.type];
    const tgtDef = UNIT_DEFS[target.type];
    return Math.min(atkDef.baseDmg / (tgtDef.armor + 1), 2.0);
}

function calculateDamage(attacker, target) {
    const atkDef = UNIT_DEFS[attacker.type];
    const pen = penetrationRatio(attacker, target);
    const cover = TERRAIN_COVER[terrain[target.y][target.x]];
    const morale = attacker.morale;

    // damage = baseDmg * penetrationFactor * (1 - coverBonus) * moraleFactor
    let dmg = atkDef.baseDmg * pen * (1 - cover) * morale;

    // Randomness ±20%
    dmg *= 0.8 + Math.random() * 0.4;

    return Math.max(1, Math.round(dmg));
}

function applyMoraleLoss(destroyed) {
    const allies = units.filter(u =>
        u.alive && u.faction === destroyed.faction &&
        Math.abs(u.x - destroyed.x) + Math.abs(u.y - destroyed.y) <= 3
    );
    for (const ally of allies) {
        ally.morale = Math.max(0.3, ally.morale - 0.1);
        addLog('system', `${ally.name}: spadek morale → ${Math.round(ally.morale * 100)}%`);
    }
}

// ==================== FOB & LOGISTICS ====================
function processFOB() {
    const fob = units.find(u => u.alive && u.type === 'FOB Rogoźno');
    if (!fob) return;

    const nearbyPL = units.filter(u =>
        u.alive && u.faction === 'PL' && u.type !== 'FOB Rogoźno' &&
        Math.abs(u.x - fob.x) + Math.abs(u.y - fob.y) <= 2
    );

    if (nearbyPL.length > 0) {
        addLog('logistics', '📦 FOB Rogoźno: Zaopatrywanie jednostek w zasięgu...');
    }

    for (const u of nearbyPL) {
        const hpGain = Math.round(u.maxHp * 0.05);
        const fuelGain = 20;
        const ammoGain = 20;

        u.hp = Math.min(u.maxHp, u.hp + hpGain);
        u.fuel = Math.min(u.maxFuel, u.fuel + fuelGain);
        u.ammo = Math.min(u.maxAmmo, u.ammo + ammoGain);

        addLog('logistics', `✔ ${u.name}: +${hpGain} HP, +${fuelGain} MPS, +${ammoGain} ŚSP`);
    }
}
function processWRE() {
    if (turn % 3 !== 0) return;

    addLog('wre', '── SKAN WIDMA ELEKTROMAGNETYCZNEGO ──');

    // Unjam previously jammed units
    for (const u of units) {
        if (u.jammed && u.jammedTurns > 0) {
            u.jammedTurns--;
            if (u.jammedTurns <= 0) {
                u.jammed = false;
                addLog('wre', `${u.name}: łączność przywrócona.`);
            }
        }
    }

    // Jam PL units (30% chance per alive unit, max 2)
    const plAlive = units.filter(u => u.alive && u.faction === 'PL' && !u.jammed);
    let jammed = 0;
    for (const u of plAlive) {
        if (jammed >= 2) break;
        if (Math.random() < 0.30) {
            u.jammed = true;
            u.jammedTurns = 1;
            jammed++;
            addLog('wre', `⚡ ${u.name} – ODCIĘTA OD DOWODZENIA!`);
            showToast(`WRE: ${u.name} zakłócona!`, 'wre');
        }
    }

    // Jam OPFOR units (15%)
    const opforAlive = units.filter(u => u.alive && u.faction === 'OPFOR' && !u.jammed);
    for (const u of opforAlive) {
        if (Math.random() < 0.15) {
            u.jammed = true;
            u.jammedTurns = 1;
            addLog('wre', `⚡ ${u.name} (OPFOR) – sygnał zakłócony!`);
        }
    }
}

// ==================== OPFOR AI ====================
function processOpforAI() {
    const opfor = units.filter(u => u.alive && u.faction === 'OPFOR' && !u.jammed);
    if (opfor.length === 0) {
        addLog('system', '🏳 Wszystkie siły OPFOR zniszczone! MISJA ZAKOŃCZONA SUKCESEM!');
        showToast('ZWYCIĘSTWO! Wszystkie siły OPFOR zniszczone!', 'success');
        return;
    }

    // Check PL forces
    const plAlive = units.filter(u => u.alive && u.faction === 'PL');
    if (plAlive.length === 0) {
        addLog('system', '💀 Wszystkie siły PL zniszczone! MISJA PRZEGRANA!');
        showToast('PORAŻKA! Siły PL zniszczone!', 'combat');
        return;
    }

    // Phase transitions
    updateOpforPhase();

    addLog('system', `── FAZA OPFOR: ${opforPhase === 1 ? 'ROZPOZNANIE' : opforPhase === 2 ? 'NATARCIE' : 'EKSPLOATACJA'} ──`);

    for (const u of opfor) {
        const def = UNIT_DEFS[u.type];

        // 1. Try to fire at visible PL units in range
        const targets = plAlive.filter(pl => {
            const d = Math.abs(pl.x - u.x) + Math.abs(pl.y - u.y);
            return d <= def.range && pl.alive;
        });

        if (targets.length > 0 && u.ammo > 0) {
            // Pick weakest target
            const target = targets.reduce((a, b) => a.hp < b.hp ? a : b);
            const ammoCost = def.symbol === 'arty' ? 20 : 10;
            u.ammo = Math.max(0, u.ammo - ammoCost);

            const damage = calculateDamage(u, target);
            target.hp -= damage;

            addLog('combat', `${u.name} → ${target.name}: obrażenia ${damage} HP`);
            showExplosion(target.x, target.y);

            if (target.hp <= 0) {
                target.hp = 0;
                target.alive = false;
                addLog('loss', `💥 ${target.name} ZNISZCZONA przez ${u.name}!`);
                showToast(`${target.name} stracona!`, 'combat');
                applyMoraleLoss(target);
            }
            continue;
        }

        // 2. Move towards objective based on phase
        const moveTarget = getOpforMoveTarget(u);
        if (moveTarget && u.fuel > 0) {
            moveOpforUnit(u, moveTarget);
        }
    }
}

function updateOpforPhase() {
    if (opforPhase === 1 && turn >= 4) {
        opforPhase = 2;
        addLog('recon', '🔴 OPFOR przechodzi do FAZY NATARCIA!');
        showToast('OPFOR: Faza natarcia!', 'combat');
        updatePhaseIndicator();
    }
    // Phase 3: if any OPFOR unit crossed the bridge (y >= 8)
    if (opforPhase === 2) {
        const crossed = units.some(u => u.alive && u.faction === 'OPFOR' && u.y >= 8);
        if (crossed) {
            opforPhase = 3;
            addLog('recon', '🔴 OPFOR przeszedł most! FAZA EKSPLOATACJI!');
            showToast('OPFOR: Eksploatacja przełomu!', 'combat');
            updatePhaseIndicator();
        }
    }
}

function getOpforMoveTarget(unit) {
    switch (opforPhase) {
        case 1: // Recon - move south along road
            if (unit.type === 'Artyleria') return null; // arty stays
            return { x: 3, y: Math.min(unit.y + 1, 6) }; // towards bridge
        case 2: // Attack - tanks go for bridge, BMP flanks
            if (unit.type === 'Artyleria') return null;
            if (unit.type === 'T-72') return { x: 3, y: 7 }; // bridge
            if (unit.type === 'BMP-2') return { x: 8, y: 6 }; // flank through forest
            return { x: 3, y: 7 };
        case 3: // Exploit - push to Rogoźno
            if (unit.type === 'Artyleria') return null;
            return { x: 8, y: 9 }; // Rogoźno
        default:
            return null;
    }
}

function moveOpforUnit(unit, target) {
    const def = UNIT_DEFS[unit.type];
    let bestX = unit.x, bestY = unit.y;
    let bestDist = Math.abs(target.x - unit.x) + Math.abs(target.y - unit.y);

    // Simple pathfinding: try all adjacent cells within speed
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (Math.abs(dx) + Math.abs(dy) > 1) continue; // only cardinal
            const nx = unit.x + dx, ny = unit.y + dy;
            if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
            if (terrain[ny][nx] === T.RIVER) continue;
            if (units.some(u => u.alive && u.x === nx && u.y === ny)) continue;

            const dist = Math.abs(target.x - nx) + Math.abs(target.y - ny);
            if (dist < bestDist) {
                bestDist = dist;
                bestX = nx; bestY = ny;
            }
        }
    }

    if (bestX !== unit.x || bestY !== unit.y) {
        const cost = FUEL_COST[terrain[bestY][bestX]];
        if (unit.fuel >= cost) {
            unit.fuel -= cost;
            const oldX = unit.x, oldY = unit.y;
            unit.x = bestX; unit.y = bestY;
            addLog('move', `${unit.name} (OPFOR) [${oldX},${oldY}] → [${bestX},${bestY}]`);
        }
    }
}

// ==================== TURN PROCESSING ====================
function nextTurn() {
    turn++;
    simMinutes += 15;
    playerRP += 10; // Gain 10 RP per turn
    updateRPDisplay();

    addLog('system', `════════ TURA ${turn} ════════`);

    // 1. Environment updates (Day/Night)
    updateEnvironment();

    // 2. WRE
    processWRE();

    // 3. OPFOR AI
    processOpforAI();

    // 4. FOB Logistics
    processFOB();

    // 5. Mobile Refuel
    processMobileRefuel();

    // 6. Counter-Battery Radar
    processCounterBattery();

    // 7. Mines Logic
    processMines();

    // 8. Cooldowns
    if (airSupportCooldown > 0) airSupportCooldown--;

    // 7. Reinforcements (Tura 10)
    if (turn === 10) spawnReinforcements();

    // 8. Update UI
    updateTurnDisplay();
    updateUnitInfo();
    renderMap();
}

function updateEnvironment() {
    // Every 12 turns (3 hours) toggle Day/Night
    // Turn 1-12: Day, 13-24: Night, etc.
    const cycle = Math.floor((turn-1) / 12);
    const wasNight = environment.isNight;
    environment.isNight = (cycle % 2 === 1);

    if (wasNight !== environment.isNight) {
        const state = environment.isNight ? 'NOC' : 'DZIEŃ';
        addLog('system', `🌅 ZMIANA WARUNKÓW: Rozpoczyna się ${state}.`);
        showToast(`Zmiana warunków: ${state}`, 'info');
        
        // Visual indicator in UI (body class)
        if (environment.isNight) document.body.classList.add('night-ops');
        else document.body.classList.remove('night-ops');
    }
}

function processMobileRefuel() {
    units.filter(u => u.alive && u.faction === 'PL' && u.type === 'Cysterna').forEach(cysterna => {
        units.filter(u => u.alive && u.faction === 'PL' && u !== cysterna && u.type !== 'FOB Rogoźno').forEach(unit => {
            const dist = Math.abs(cysterna.x - unit.x) + Math.abs(cysterna.y - unit.y);
            if (dist <= 1 && unit.fuel < unit.maxFuel) {
                const amount = Math.min(30, unit.maxFuel - unit.fuel);
                unit.fuel += amount;
                addLog('logistics', `⛽ ${cysterna.name} zatankował ${unit.name} (+${amount} MPS)`);
            }
        });
    });
}

function updateTurnDisplay() {
    const totalMin = SIM_START_HOUR * 60 + simMinutes;
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    document.getElementById('sim-clock').textContent = `⏱ ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
    document.getElementById('turn-counter').textContent = `TURA: ${turn}`;
}

function updatePhaseIndicator() {
    const el = document.getElementById('phase-indicator');
    el.className = '';
    switch (opforPhase) {
        case 1:
            el.className = 'phase-recon';
            el.textContent = 'FAZA: ROZPOZNANIE';
            break;
        case 2:
            el.className = 'phase-attack';
            el.textContent = 'FAZA: NATARCIE';
            break;
        case 3:
            el.className = 'phase-exploit';
            el.textContent = 'FAZA: EKSPLOATACJA';
            break;
    }
}

// ==================== UI HELPERS ====================
function deselectUnit() {
    selectedUnitId = null;
    actionMode = null;
    updateButtons();
    updateUnitInfo();
    renderMap();
}


function togglePanel(id) {
    document.getElementById(id).classList.toggle('open');
}

// ==================== SUPABASE INTEGRATION ====================
let supabaseClient = null;

function initSupabase() {
    const savedUrl = localStorage.getItem('jasmin_sb_url');
    const savedKey = localStorage.getItem('jasmin_sb_key');

    if (savedUrl && savedKey) {
        document.getElementById('sb-url').value = savedUrl;
        document.getElementById('sb-key').value = savedKey;
        document.getElementById('auth-sb-url').value = savedUrl;
        document.getElementById('auth-sb-key').value = savedKey;
        connectToSupabase(savedUrl, savedKey);
    } else {
        document.getElementById('sb-config-form').style.display = 'block';
        document.getElementById('auth-sb-config').style.display = 'block';
    }
}

async function connectToSupabase(url, key) {
    setSupabaseStatus('Łączenie...', 'info');
    try {
        const client = supabase.createClient(url, key);
        
        // Listen for auth state changes
        client.auth.onAuthStateChange((event, session) => {
            handleAuthStateChange(event, session);
        });

        // Test connection by checking if we can get the session or a simple select
        const { data: { session }, error: authError } = await client.auth.getSession();
        if (authError) throw authError;

        supabaseClient = client;
        localStorage.setItem('jasmin_sb_url', url);
        localStorage.setItem('jasmin_sb_key', key);
        
        updateSupabaseUI(true);
        if (session) {
            handleAuthStateChange('SIGNED_IN', session);
            await fetchScenarios(); // Load custom scenarios list
        }
        
        setSupabaseStatus('Połączono pomyślnie.', 'success');
        showToast('Supabase: Połączenie aktywne', 'success');
    } catch (err) {
        console.error('Supabase Connection Error:', err);
        updateSupabaseUI(false);
        const errorMsg = err.message || err.details || 'Błąd połączenia';
        setSupabaseStatus(`Błąd: ${errorMsg}`, 'error');
        showToast(`Supabase Error: ${errorMsg}`, 'combat');
        document.getElementById('sb-config-form').style.display = 'block';
    }
}

// ==================== AUTHENTICATION LOGIC ====================
function handleAuthStateChange(event, session) {
    console.log('Auth Event:', event);
    const overlay = document.getElementById('auth-overlay');
    const logoutBtn = document.getElementById('btn-logout');

    if (session) {
        // User is logged in
        overlay.style.display = 'none';
        logoutBtn.style.display = 'block';
        showToast(`Zalogowano: ${session.user.email}`, 'success');
        addLog('system', `🔓 Operator zalogowany: ${session.user.email}`);
    } else {
        // User is logged out
        overlay.style.display = 'flex';
        logoutBtn.style.display = 'none';
    }
}

async function signIn() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const errorBox = document.getElementById('auth-error');

    if (!supabaseClient) {
        document.getElementById('auth-sb-config').style.display = 'block';
        showToast('Brak połączenia! Skonfiguruj Supabase poniżej.', 'combat');
        return;
    }

    try {
        errorBox.style.display = 'none';
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
    } catch (err) {
        errorBox.textContent = `BŁĄD: ${err.message}`;
        errorBox.style.display = 'block';
    }
}

async function signUp() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const errorBox = document.getElementById('auth-error');

    if (!supabaseClient) {
        showToast('Brak połączenia z Supabase!', 'combat');
        return;
    }

    try {
        errorBox.style.display = 'none';
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;
        showToast('Rejestracja pomyślna! Sprawdź e-mail lub zaloguj się.', 'success');
        setSupabaseStatus('Rejestracja pomyślna. Zaloguj się.', 'success');
    } catch (err) {
        errorBox.textContent = `BŁĄD: ${err.message}`;
        errorBox.style.display = 'block';
    }
}

async function signOut() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
        showToast('Wylogowano operatora', 'info');
        addLog('system', '🔒 Operator wylogowany.');
    }
}

function updateSupabaseUI(connected) {
    const dot = document.querySelector('.status-dot');
    const text = document.querySelector('.status-text');
    const configForm = document.getElementById('sb-config-form');
    const actions = document.getElementById('sb-actions');

    if (connected) {
        dot.classList.add('connected');
        text.textContent = 'POŁĄCZONO';
        configForm.style.display = 'none';
        actions.style.display = 'flex';
    } else {
        dot.classList.remove('connected');
        text.textContent = 'NIEPOŁĄCZONO';
        actions.style.display = 'none';
    }
}

function setSupabaseStatus(msg, type = '') {
    const el = document.getElementById('sb-status');
    el.textContent = msg;
    el.className = type;
}

// ==================== SCENARIO & DATABASE LOGIC ====================
async function fetchScenarios() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient.from('scenariusze_ratyfikowane').select('*');
        if (error) throw error;
        
        customScenarios = data || [];
        const select = document.getElementById('sb-scenario-select');
        select.innerHTML = '<option value="">Wybierz z listy...</option>';
        select.innerHTML += '<option value="DEFAULT">-- Scenariusz Domyślny (Wielkopolska) --</option>';
        
        customScenarios.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.nazwa;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Błąd ładowania scenariuszy:', err);
    }
}

function enterCreatorMode() {
    creatorMode = true;
    activeScenarioId = null;
    units = [ units.find(u => u.type === 'FOB Rogoźno' && u.alive) ].filter(Boolean); // Keep only FOB if exists, or nothing
    if (units.length === 0) {
        units.push({
            id: 0, faction: 'PL', type: 'FOB Rogoźno', name: 'Główne Dowództwo',
            x: 9, y: 7, hp: 500, maxHp: 500, ammo: 999, maxAmmo: 999, fuel: 999, maxFuel: 999,
            morale: 1.0, jammed: false, jammedTurns: 0, alive: true
        });
    }
    
    // Clear map and reset state
    turn = 0;
    simMinutes = 0;
    playerRP = 999; // Infinite RP for creator
    document.getElementById('rp-display').style.color = 'var(--accent-green)';
    document.getElementById('rp-count').textContent = '∞';
    
    addLog('system', '🛠 TRYB KREATORA AKTYWNY. Wciśnij "WEZWIJ POSIŁKI" na FOB, aby rozstawiać jednostki (0 RP). Mgła wojny wyłączona.');
    showToast('Tryb Kreatora Uruchomiony', 'success');
    
    deselectUnit();
}

async function loadMission() {
    if (!supabaseClient) {
        showToast('Najpierw połącz z Supabase!', 'combat');
        return;
    }

    const select = document.getElementById('sb-scenario-select');
    activeScenarioId = select.value;

    if (!activeScenarioId) {
        showToast('Wybierz scenariusz z listy!', 'combat');
        return;
    }

    // Default Fallback
    if (activeScenarioId === 'DEFAULT') {
        creatorMode = false;
        units = createInitialUnits();
        turn = 0;
        simMinutes = 0;
        playerRP = 50;
        updateRPDisplay();
        document.getElementById('rp-display').style.color = 'var(--accent-amber)';
        addLog('system', '📥 Załadowano Scenariusz Wielkopolski (Domyślny).');
        renderMap();
        return;
    }

    setSupabaseStatus('Wczytywanie scenariusza...', 'info');
    try {
        const { data, error } = await supabaseClient.from('jednostki_taktyczne').select('*').eq('scenariusz_id', activeScenarioId);
        if (error) throw error;

        if (!data || data.length === 0) {
            setSupabaseStatus('Brak danych w tabeli.', 'error');
            return;
        }

        // Map Supabase data to local units
        units = data.map((row, i) => {
            const type = row.typ_sprzetu;
            const def = UNIT_DEFS[type] || UNIT_DEFS['KTO Rosomak'];
            return {
                id: i,
                faction: row.frakcja,
                type: type,
                x: row.pozycja_x,
                y: row.pozycja_y,
                hp: row.hp,
                maxHp: def.hp,
                ammo: row.amunicja,
                maxAmmo: def.ammo,
                fuel: row.paliwo,
                maxFuel: def.fuel,
                morale: row.morale || 1.0,
                jammed: row.jammed || false,
                jammedTurns: 0,
                alive: row.hp > 0,
                name: `${type} #${i + 1}`
            };
        });

        selectedUnitId = null;
        actionMode = null;
        renderMap();
        updateUnitInfo();
        addLog('system', `📥 Załadowano ${data.length} jednostek z Supabase.`);
        setSupabaseStatus(`Załadowano ${data.length} jednostek.`, 'success');
        showToast('Misja załadowana!', 'success');
    } catch (e) {
        setSupabaseStatus(`Błąd: ${e.message}`, 'error');
        addLog('system', `❌ Błąd ładowania: ${e.message}`);
    }
}

async function saveMission() {
    if (!supabaseClient) {
        showToast('Najpierw połącz z Supabase!', 'combat');
        return;
    }

    if (activeScenarioId === 'DEFAULT') {
        showToast('Nie można nadpisać domyślnego scenariusza. Stwórz nowy!', 'combat');
        return;
    }

    let targetScenarioId = activeScenarioId;

    if (creatorMode || !targetScenarioId) {
        const scenarioName = prompt("Podaj nazwę nowego scenariusza:");
        if (!scenarioName) return;

        setSupabaseStatus('Tworzenie scenariusza...', 'info');
        const { data: newScen, error: scenErr } = await supabaseClient
            .from('scenariusze_ratyfikowane')
            .insert([{ nazwa: scenarioName }])
            .select()
            .single();

        if (scenErr) {
            console.error('Błąd tworzenia scenariusza:', scenErr);
            showToast('Nazwa zajęta lub błąd bazy.', 'error');
            return;
        }

        targetScenarioId = newScen.id;
        activeScenarioId = targetScenarioId;
        creatorMode = false;
        await fetchScenarios();
        document.getElementById('sb-scenario-select').value = targetScenarioId;
    }

    setSupabaseStatus('Zapisywanie stanu...');
    try {
        // Clear old data for this scenario
        const { error: deleteError } = await supabaseClient.from('jednostki_taktyczne').delete().eq('scenariusz_id', targetScenarioId);
        if (deleteError) {
            console.error('Delete Error:', deleteError);
        }

        const dataToSave = units.filter(u => u.alive).map(u => ({
            scenariusz_id: targetScenarioId,
            frakcja: u.faction,
            typ_sprzetu: u.type,
            pozycja_x: u.x,
            pozycja_y: u.y,
            hp: u.hp,
            amunicja: u.ammo,
            paliwo: u.fuel,
            morale: u.morale,
            jammed: u.jammed || false
        }));

        const { error } = await supabaseClient.from('jednostki_taktyczne').insert(dataToSave);
        if (error) throw error;

        setSupabaseStatus('Misja zapisana pomyślnie!', 'success');
        addLog('system', '💾 Stan misji został utrwalony w Supabase.');
        showToast('Zapisano w Supabase!', 'success');
    } catch (err) {
        console.error('Save Error:', err);
        setSupabaseStatus('Błąd zapisu.', 'error');
    }
}

// ==================== INITIALIZATION ====================
function init() {
    // Create units
    units = createInitialUnits();

    // Render
    renderMap();
    updateTurnDisplay();
    updatePhaseIndicator();

    // Initial log
    addLog('system', '═══ JASMIN C4ISR – SYMULATOR SZTABOWY v1.0 ═══');
    addLog('system', 'Scenariusz: Obrona Wielkopolski – Okolice Rogoźna');
    addLog('system', `Siły PL: ${units.filter(u => u.faction === 'PL').length} jednostek`);
    addLog('system', `Siły OPFOR: ${units.filter(u => u.faction === 'OPFOR').length} jednostek`);
    addLog('recon', 'Wykryto aktywność OPFOR na północno-wschodniej flance.');
    addLog('system', 'Akcja → kliknij jednostkę PL, potem RUCH/OGIEŃ.');

    // Event listeners
    document.getElementById('btn-sb-new-scenario').addEventListener('click', enterCreatorMode);
    document.getElementById('btn-next-turn').addEventListener('click', nextTurn);

    document.getElementById('btn-move').addEventListener('click', () => {
        if (actionMode === 'move') { actionMode = null; } else { actionMode = 'move'; }
        updateButtons();
        renderMap();
    });

    document.getElementById('btn-fire').addEventListener('click', () => {
        if (actionMode === 'fire') { actionMode = null; } else { actionMode = 'fire'; }
        updateButtons();
        renderMap();
    });

    document.getElementById('btn-air-support').addEventListener('click', () => {
        if (actionMode === 'air-support') { actionMode = null; } else { actionMode = 'air-support'; }
        updateButtons();
        renderMap();
        if (actionMode === 'air-support') {
            showToast('Wybierz cel nalotu F-16 na mapie', 'info');
        }
    });

    document.getElementById('btn-deselect').addEventListener('click', deselectUnit);

    document.getElementById('btn-clear-log').addEventListener('click', () => {
        document.getElementById('combat-log').innerHTML = '';
        addLog('system', 'Dziennik wyczyszczony.');
    });

    document.getElementById('btn-auto').addEventListener('click', () => {
        autoMode = !autoMode;
        const btn = document.getElementById('btn-auto');
        if (autoMode) {
            btn.classList.add('active');
            btn.style.borderColor = 'var(--accent-amber)';
            btn.style.color = 'var(--accent-amber)';
            autoInterval = setInterval(nextTurn, 2000);
            addLog('system', '▶ Auto-symulacja WŁĄCZONA (co 2s)');
        } else {
            btn.classList.remove('active');
            btn.style.borderColor = '';
            btn.style.color = '';
            clearInterval(autoInterval);
            addLog('system', '⏸ Auto-symulacja WYŁĄCZONA');
        }
    });

        // Auth buttons
        document.getElementById('btn-login').addEventListener('click', signIn);
        document.getElementById('btn-register').addEventListener('click', signUp);
        document.getElementById('btn-logout').addEventListener('click', signOut);

        document.getElementById('btn-auth-sb-connect').addEventListener('click', () => {
            const url = document.getElementById('auth-sb-url').value.trim();
            const key = document.getElementById('auth-sb-key').value.trim();
            if (url && key) {
                connectToSupabase(url, key);
            } else {
                showToast('Wypełnij pola konfiguracji!', 'combat');
            }
        });

        // Supabase actions
    document.getElementById('btn-sb-load').addEventListener('click', loadMission);
    document.getElementById('btn-sb-save').addEventListener('click', saveMission);

    document.getElementById('btn-sb-config').addEventListener('click', () => {
        const form = document.getElementById('sb-config-form');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('btn-sb-connect').addEventListener('click', () => {
        const url = document.getElementById('sb-url').value.trim();
        const key = document.getElementById('sb-key').value.trim();
        if (url && key) {
            connectToSupabase(url, key);
        } else {
            setSupabaseStatus('Wypełnij oba pola!', 'error');
        }
    });

    // Start
    initSupabase();
    initWiki();
    updateRPDisplay();
}

// Start
document.addEventListener('DOMContentLoaded', init);

function processCounterBattery() {
    // Age markers
    batteryMarkers.forEach(m => m.age++);
    batteryMarkers = batteryMarkers.filter(m => m.age < 3); // Markers vanish after 3 turns

    // Check radars
    const radars = units.filter(u => u.alive && u.faction === 'PL' && u.type === 'Radar Liwiec' && !u.jammed);
    radars.forEach(radar => {
        batteryMarkers.filter(m => m.faction === 'OPFOR').forEach(marker => {
            const dist = Math.abs(radar.x - marker.x) + Math.abs(radar.y - marker.y);
            if (dist <= 8) {
                // Reveal the unit at that position if it's there
                const hiddenArty = units.find(u => u.alive && u.x === marker.x && u.y === marker.y && u.faction === 'OPFOR');
                if (hiddenArty) {
                    addLog('recon', `🎯 RADAR LIWIEC: Zlokalizowano baterię ${hiddenArty.name} na [${marker.x},${marker.y}]!`);
                    showToast('Wykryto artylerię wroga!', 'combat');
                    // We can mark the cell in persistentRecon for the turn
                    persistentReconMap[marker.y][marker.x] = true; 
                }
            }
        });
    });
}

function processMines() {
    units.filter(u => u.alive && u.type === 'Mina').forEach(mine => {
        const victim = units.find(u => u.alive && u.faction !== mine.faction && u.x === mine.x && u.y === mine.y);
        if (victim) {
            victim.hp -= 50;
            mine.alive = false;
            addLog('combat', `💥 POLE MINOWE: ${victim.name} wszedł na minę! (-50 HP)`);
            showToast('Eksplozja miny!', 'combat');
            showExplosion(mine.x, mine.y);
        }
    });
}
// ==================== JASMINWIKI LOGIC ====================
function initWiki() {
    const unitList = document.getElementById('wiki-unit-list');
    const wikiBtn = document.getElementById('btn-wiki');
    
    if (wikiBtn) {
        wikiBtn.onclick = toggleWiki;
    }

    // Populate list
    unitList.innerHTML = '';
    Object.keys(UNIT_DEFS).forEach(name => {
        const def = UNIT_DEFS[name];
        // Heuristic for OPFOR detection in Wiki
        const wikiFaction = (name === 'T-72' || name === 'BMP-2' || name === 'Mi-24' || name === 'Artyleria') ? 'OPFOR' : 'PL';
        const item = document.createElement('div');
        item.className = 'wiki-unit-item';
        item.innerHTML = `
            <div class="unit-mini-icon">
                <svg viewBox="0 0 34 34" style="width:100%; height:100%;">
                    ${natoSVG(def.symbol, wikiFaction)}
                </svg>
            </div>
            <div class="unit-name">${name}</div>
        `;
        item.onclick = () => showWikiDetail(name);
        unitList.appendChild(item);
    });
}

function toggleWiki() {
    const modal = document.getElementById('wiki-modal');
    modal.classList.toggle('open');
}

function filterWiki() {
    const query = document.getElementById('wiki-search').value.toLowerCase();
    const items = document.querySelectorAll('.wiki-unit-item');
    items.forEach(item => {
        const name = item.querySelector('.unit-name').textContent.toLowerCase();
        item.style.display = name.includes(query) ? 'flex' : 'none';
    });
}

function showWikiDetail(name) {
    const def = UNIT_DEFS[name];
    const data = WIKI_DATA[name] || { role: 'N/A', description: 'Brak danych taktycznych.', tactics: 'Brak specyficznych porad.', features: [] };
    const container = document.getElementById('wiki-details');
    const wikiFaction = (name === 'T-72' || name === 'BMP-2' || name === 'Mi-24' || name === 'Artyleria') ? 'OPFOR' : 'PL';

    // Highlight active in list
    document.querySelectorAll('.wiki-unit-item').forEach(el => {
        el.classList.toggle('active', el.querySelector('.unit-name').textContent === name);
    });

    container.innerHTML = `
        <div class="wiki-header">
            <div class="wiki-big-symbol">
                <svg viewBox="0 0 34 34" style="width:100%; height:100%;">
                    ${natoSVG(def.symbol, wikiFaction)}
                </svg>
            </div>
            <div class="wiki-title-group">
                <h2>${name}</h2>
                <div class="role-tag">${data.role}</div>
            </div>
        </div>

        <div class="wiki-metrics">
            <div class="wiki-metric-card">
                <label>Wytrzymałość</label>
                <div class="value">${def.hp}</div>
            </div>
            <div class="wiki-metric-card">
                <label>Pancerz</label>
                <div class="value">${def.armor}</div>
            </div>
            <div class="wiki-metric-card">
                <label>Zasięg Ognia</label>
                <div class="value">${def.range}</div>
            </div>
            <div class="wiki-metric-card">
                <label>Zasięg Wzroku</label>
                <div class="value">${def.sight}</div>
            </div>
        </div>

        <div class="wiki-section">
            <h3>Opis Charakterystyki</h3>
            <p class="wiki-text">${data.description}</p>
        </div>

        <div class="wiki-section">
            <h3>Zastosowanie Taktyczne</h3>
            <p class="wiki-text">${data.tactics}</p>
        </div>

        <div class="wiki-features">
            ${data.features.map(f => `<span class="feature-chip">${f}</span>`).join('')}
        </div>
    `;
}
// ==================== REINFORCEMENT LOGIC ====================
function updateRPDisplay() {
    const counts = document.querySelectorAll('#rp-count, #rp-available');
    counts.forEach(el => el.textContent = playerRP);
}

function toggleRecruit() {
    const modal = document.getElementById('recruit-modal');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    if (modal.style.display === 'flex') initRecruitList();
}

function initRecruitList() {
    const list = document.getElementById('recruit-list');
    list.innerHTML = '';
    
    // Function to create a card
    const addCard = (type, faction, baseCost) => {
        const cost = creatorMode ? 0 : baseCost;
        const canAfford = playerRP >= cost || creatorMode;
        const def = UNIT_DEFS[type];
        
        const card = document.createElement('div');
        card.className = 'wiki-unit-item';
        card.style.opacity = canAfford ? '1' : '0.5';
        card.style.pointerEvents = canAfford ? 'auto' : 'none';
        card.style.border = '1px solid var(--border)';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'flex-start';
        card.style.gap = '5px';
        
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; width:100%;">
                <div style="width:40px; height:40px;">
                    <svg viewBox="0 0 34 34" style="width:100%; height:100%;">${natoSVG(def.symbol, faction)}</svg>
                </div>
                <div>
                    <div style="font-weight:bold; color:var(--text-primary); font-size:16px;">${type} <span style="font-size:10px; color:${faction==='PL'?'var(--accent-blue)':'var(--accent-amber)'}">${faction}</span></div>
                    <div style="color:var(--accent-amber); font-family:var(--font-mono); font-size:14px;">Koszt: ${cost} RP</div>
                </div>
            </div>
            <div style="font-size:11px; color:var(--text-dim); line-height:1.2;">${WIKI_DATA[type] ? WIKI_DATA[type].role : ''}</div>
            <button class="btn-primary" style="width:100%; margin-top:10px; font-size:12px; height:24px; pointer-events:none;">
                REKRUTUJ
            </button>
        `;
        
        card.onclick = () => recruitUnit(type, cost, faction);
        list.appendChild(card);
    };

    // Add PL units
    Object.keys(UNIT_COSTS).forEach(type => addCard(type, 'PL', UNIT_COSTS[type]));

    // In creator mode, add OPFOR units too
    if (creatorMode) {
        const opforTypes = ['T-72', 'BMP-2', 'Artyleria', 'Mi-24', 'Rozpoznanie', 'Spike ATGM', 'Mina'];
        opforTypes.forEach(type => addCard(type, 'OPFOR', 0));
    }
}

function recruitUnit(type, cost, faction) {
    if (!creatorMode && playerRP < cost) return;

    // Find free space near FOB
    const fob = units.find(u => u.alive && u.type === 'FOB Rogoźno');
    if (!fob) {
        showToast('Brak FOB na mapie!', 'combat');
        return;
    }

    let spawnCell = null;
    const neighbors = [
        {x: fob.x+1, y: fob.y}, {x: fob.x-1, y: fob.y},
        {x: fob.x, y: fob.y+1}, {x: fob.x, y: fob.y-1},
        {x: fob.x+1, y: fob.y+1}, {x: fob.x-1, y: fob.y-1},
        {x: fob.x+1, y: fob.y-1}, {x: fob.x-1, y: fob.y+1}
    ];

    for (const n of neighbors) {
        if (n.x >= 0 && n.x < GRID_W && n.y >= 0 && n.y < GRID_H) {
            const isOccupied = units.some(u => u.alive && u.x === n.x && u.y === n.y);
            const isRiver = terrain[n.y][n.x] === T.RIVER;
            if (!isOccupied && !isRiver) {
                spawnCell = n;
                break;
            }
        }
    }

    if (!spawnCell) {
        showToast('Brak wolnego miejsca wokół bazy!', 'combat');
        return;
    }

    // Process payment
    if (!creatorMode) {
        playerRP -= cost;
        updateRPDisplay();
    }

    // Create unit
    const def = UNIT_DEFS[type];
    const newUnit = {
        id: units.length,
        faction: faction,
        type: type,
        name: `${type} Posiłki`,
        x: spawnCell.x,
        y: spawnCell.y,
        hp: def.hp, maxHp: def.hp,
        ammo: def.ammo, maxAmmo: def.ammo,
        fuel: def.fuel, maxFuel: def.fuel,
        morale: 1.0,
        jammed: false,
        jammedTurns: 0,
        alive: true
    };
    
    units.push(newUnit);
    addLog('system', `📦 POSIŁKI: Wezwano ${type} (${faction}) na pozycję [${spawnCell.x},${spawnCell.y}].`);
    showToast(`Posiłki przybyły: ${type}`, 'success');
    
    if (!creatorMode) toggleRecruit(); // Keep open in creator mode for multiple placements
    renderMap();
}

