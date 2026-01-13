// Team Roster
const ROSTER = [
    "Abram Yehle", "Andrew Swanson", "Beck Buskirk", "Blake Musfeldt",
    "Dan Lepsch", "Daniel Sawai", "Elliot Frank", "Evan Callahan",
    "Jonas Soegard", "Juan Castillo", "Kaeden Batz", "Noah Sentnor",
    "Oscar Lechner", "Quincy Roy", "Zeke Dameron", "Loic Masters",
    "Zackary Bacon", "Eli Beard", "Ian Ledford", "Jimmy Tran",
    "Leo Gold", "Liam Vanderwyk", "Paul Masters", "Quinn Jarvis",
    "Simon Alaimo", "Utkarsh Mandivilli"
];

// Field dimensions (in yards)
const FIELD_WIDTH = 40;
const ENDZONE_DEPTH = 20;
const PLAYING_LENGTH = 70;
const TOTAL_LENGTH = ENDZONE_DEPTH + PLAYING_LENGTH + ENDZONE_DEPTH;

// App State
const state = {
    onField: [],
    score: { us: 0, them: 0 },
    playerStats: {},
    events: [],
    currentPossession: null, // player name who has disc
    lastCatchPos: null, // {x, y} in pixels
    clickedPos: null, // temporary storage for clicked position
    pointActive: false,
    catches: [], // array of {from: {x,y}, to: {x,y}, player} for drawing arrows

    // Game settings
    opponentName: '',
    gameLength: 15,
    halfPoint: 8,
    weStartedOnOffense: true,

    // Offense/Defense tracking
    weAreOnOffense: true,
    awaitingPull: false,
    halftimeOccurred: false
};

// Canvas setup
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
let scale = 1;

// Initialize stats for all roster
ROSTER.forEach(name => {
    state.playerStats[name] = {
        throws: 0,
        receives: 0,
        goals: 0,
        assists: 0
    };
});

// Resize canvas to fit container
function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();

    // Get available space (subtract space for labels)
    const containerWidth = rect.width;
    const containerHeight = rect.height - 20; // Account for top and bottom labels

    // Calculate scale based on both width and height constraints
    // Use whichever is MORE restrictive (smaller scale)
    const scaleByWidth = containerWidth / FIELD_WIDTH;
    const scaleByHeight = containerHeight / TOTAL_LENGTH;
    scale = Math.min(scaleByWidth, scaleByHeight);

    // Set canvas dimensions
    canvas.width = FIELD_WIDTH * scale;
    canvas.height = TOTAL_LENGTH * scale;

    drawField();
}

// Draw the field
function drawField() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw playing field
    ctx.fillStyle = '#2e8b57';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw endzones
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, 0, canvas.width, ENDZONE_DEPTH * scale);

    ctx.fillStyle = '#1a5f1a';
    ctx.fillRect(0, canvas.height - ENDZONE_DEPTH * scale, canvas.width, ENDZONE_DEPTH * scale);

    // Draw field lines
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    // Endzone lines
    ctx.beginPath();
    ctx.moveTo(0, ENDZONE_DEPTH * scale);
    ctx.lineTo(canvas.width, ENDZONE_DEPTH * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height - ENDZONE_DEPTH * scale);
    ctx.lineTo(canvas.width, canvas.height - ENDZONE_DEPTH * scale);
    ctx.stroke();

    // Midfield line (dashed)
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Field outline
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw arrows for previous catches
    state.catches.forEach(catchData => {
        drawArrow(catchData.from, catchData.to);
    });

    // Draw dots for catches
    state.catches.forEach((catchData, index) => {
        const isLatest = index === state.catches.length - 1;
        drawDot(catchData.to, catchData.player, isLatest);
    });
}

// Draw arrow between two points
function drawArrow(from, to) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLength = 15;

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
        to.x - headLength * Math.cos(angle - Math.PI / 6),
        to.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
        to.x - headLength * Math.cos(angle + Math.PI / 6),
        to.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
}

// Draw dot for catch
function drawDot(pos, player, isLatest) {
    const radius = isLatest ? 10 : 8;

    // Draw circle
    ctx.fillStyle = isLatest ? '#ffa500' : 'white';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw player name
    if (isLatest) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        const firstName = player.split(' ')[0];
        ctx.strokeText(firstName, pos.x, pos.y - 20);
        ctx.fillText(firstName, pos.x, pos.y - 20);
    }
}

// Calculate distance between two points in yards
function calculateDistance(from, to) {
    const dx = (to.x - from.x) / scale;
    const dy = (to.y - from.y) / scale;
    return Math.sqrt(dx * dx + dy * dy);
}

// Update on-field players display
function updateOnFieldDisplay() {
    const container = document.getElementById('onFieldPlayers');
    container.innerHTML = '';

    state.onField.forEach(player => {
        const chip = document.createElement('div');
        chip.className = 'player-chip';
        if (player === state.currentPossession) {
            chip.classList.add('has-disc');
        }
        chip.textContent = player.split(' ')[0]; // First name only
        container.appendChild(chip);
    });
}

// Update score display
function updateScore() {
    document.getElementById('ourScore').textContent = state.score.us;
    document.getElementById('theirScore').textContent = state.score.them;
}

// Canvas click handler
canvas.addEventListener('click', (e) => {
    if (!state.pointActive) {
        alert('Start a new point first!');
        return;
    }

    if (state.onField.length !== 7) {
        alert('Select 7 players before starting!');
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    state.clickedPos = { x, y };

    // Show action panel
    showActionPanel();
});

// Show action panel
function showActionPanel() {
    document.getElementById('actionPanel').classList.remove('hidden');
}

// Hide action panel
function hideActionPanel() {
    document.getElementById('actionPanel').classList.add('hidden');
    document.getElementById('playerArc').classList.add('hidden');
}

// Handle catch button - show player arc with drag detection
let touchStartTime;
let isDragging = false;
let currentHoveredPlayer = null;
const catchBtn = document.getElementById('catchBtn');
const playerArc = document.getElementById('playerArc');

catchBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartTime = Date.now();
    isDragging = false;
    currentHoveredPlayer = null;
    showPlayerArc();
});

catchBtn.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (Date.now() - touchStartTime > 50) {
        isDragging = true;
        handleTouchMove(e);
    }
});

catchBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (isDragging && currentHoveredPlayer) {
        handleCatch(currentHoveredPlayer);
    }
    hideActionPanel();
});

catchBtn.addEventListener('click', (e) => {
    // For desktop testing
    if (playerArc.classList.contains('hidden')) {
        showPlayerArc();
    }
});

function handleTouchMove(e) {
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    // Check which player button is under the touch
    const element = document.elementFromPoint(x, y);

    if (element && element.classList.contains('arc-player')) {
        const player = element.dataset.player;

        // Update visual feedback
        document.querySelectorAll('.arc-player').forEach(btn => {
            btn.classList.remove('hover');
        });
        element.classList.add('hover');
        currentHoveredPlayer = player;
    } else {
        document.querySelectorAll('.arc-player').forEach(btn => {
            btn.classList.remove('hover');
        });
        currentHoveredPlayer = null;
    }
}

function showPlayerArc() {
    playerArc.innerHTML = '';

    // Get available players (exclude current possession holder)
    let availablePlayers = state.onField.filter(p => p !== state.currentPossession);

    if (availablePlayers.length === 0) {
        availablePlayers = [...state.onField];
    }

    // Create container for arc
    const arcContainer = document.createElement('div');
    arcContainer.className = 'arc-container';

    // Calculate positions in a semicircle
    const numPlayers = availablePlayers.length;
    const arcWidth = Math.min(window.innerWidth - 60, 400);
    const arcHeight = 130;
    const centerX = arcWidth / 2;

    availablePlayers.forEach((player, index) => {
        const btn = document.createElement('button');
        btn.className = 'arc-player';
        btn.textContent = player.split(' ')[0];
        btn.dataset.player = player;

        // Calculate position on semicircle
        // Spread players across 140 degrees (70 degrees on each side of vertical)
        const angleRange = 140;
        const startAngle = 90 - angleRange / 2;
        const angle = startAngle + (angleRange / (numPlayers - 1)) * index;
        const radians = (angle * Math.PI) / 180;

        const radius = arcHeight;
        const x = centerX + Math.cos(radians) * radius;
        const y = arcHeight - Math.sin(radians) * radius;

        btn.style.left = `${x}px`;
        btn.style.bottom = `${y}px`;
        btn.style.transform = 'translate(-50%, 50%)';

        btn.addEventListener('click', () => {
            handleCatch(player);
        });

        arcContainer.appendChild(btn);
    });

    playerArc.appendChild(arcContainer);
    playerArc.classList.remove('hidden');
}

// Handle catch
function handleCatch(catcher) {
    const pos = state.clickedPos;
    const y = pos.y / scale;

    // Check if in attacking endzone (top)
    const inAttackingEndzone = y < ENDZONE_DEPTH;

    let thrower = state.currentPossession;
    let distance = 0;

    // Calculate distance if there was a previous catch
    if (state.lastCatchPos && thrower) {
        distance = calculateDistance(state.lastCatchPos, pos);

        // Update stats
        state.playerStats[thrower].throws += distance;
        state.playerStats[catcher].receives += distance;

        // Record arrow
        state.catches.push({
            from: state.lastCatchPos,
            to: pos,
            player: catcher
        });
    } else {
        // First catch of the point
        state.catches.push({
            from: pos,
            to: pos,
            player: catcher
        });
    }

    // Record event
    state.events.push({
        type: 'catch',
        player: catcher,
        thrower: thrower,
        pos: pos,
        distance: distance,
        timestamp: new Date().toISOString()
    });

    // Check for goal
    if (inAttackingEndzone && thrower && state.weAreOnOffense) {
        // Goal!
        state.playerStats[catcher].goals += 1;
        state.playerStats[thrower].assists += 1;
        state.score.us += 1;

        state.events.push({
            type: 'goal',
            scorer: catcher,
            assister: thrower,
            timestamp: new Date().toISOString()
        });

        alert(`GOAL! ${catcher.split(' ')[0]} scores! Assist: ${thrower.split(' ')[0]}`);
        updateScore();

        // Switch to defense for next point
        state.weAreOnOffense = false;

        // Reset possession
        state.currentPossession = null;
        state.lastCatchPos = null;
    } else {
        // Normal catch
        state.currentPossession = catcher;
        state.lastCatchPos = pos;
    }

    drawField();
    updateOnFieldDisplay();
    hideActionPanel();
}

// Handle throwaway
document.querySelector('[data-action="throwaway"]').addEventListener('click', () => {
    if (!state.currentPossession) {
        alert('Select who threw it away from the on-field players');
        return;
    }

    state.events.push({
        type: 'throwaway',
        player: state.currentPossession,
        pos: state.clickedPos,
        timestamp: new Date().toISOString()
    });

    // Turnover
    state.currentPossession = null;
    state.lastCatchPos = null;

    updateOnFieldDisplay();
    hideActionPanel();
});

// Handle block
document.querySelector('[data-action="block"]').addEventListener('click', () => {
    // Show player selection for who got the block
    const blocker = prompt('Who got the block? Enter first name:');
    if (!blocker) return;

    const fullName = state.onField.find(p => p.split(' ')[0].toLowerCase() === blocker.toLowerCase());

    if (!fullName) {
        alert('Player not found on field');
        return;
    }

    state.events.push({
        type: 'block',
        player: fullName,
        pos: state.clickedPos,
        timestamp: new Date().toISOString()
    });

    // We get possession back
    state.currentPossession = fullName;
    state.lastCatchPos = state.clickedPos;

    // Add to catches array
    state.catches.push({
        from: state.clickedPos,
        to: state.clickedPos,
        player: fullName
    });

    drawField();
    updateOnFieldDisplay();
    hideActionPanel();
});

// Handle opponent goal
document.querySelector('[data-action="opponent-goal"]').addEventListener('click', () => {
    state.score.them += 1;

    state.events.push({
        type: 'opponent_goal',
        timestamp: new Date().toISOString()
    });

    alert(`Opponent scores. Score: ${state.score.us} - ${state.score.them}`);
    updateScore();

    // Switch to offense for next point
    state.weAreOnOffense = true;

    // Reset possession
    state.currentPossession = null;
    state.lastCatchPos = null;

    hideActionPanel();
});

// Player selection modal
document.getElementById('selectPlayersBtn').addEventListener('click', () => {
    const modal = document.getElementById('playerModal');
    const rosterList = document.getElementById('rosterList');

    rosterList.innerHTML = '';

    ROSTER.forEach(player => {
        const item = document.createElement('div');
        item.className = 'roster-item';
        if (state.onField.includes(player)) {
            item.classList.add('selected');
        }
        item.textContent = player;

        item.addEventListener('click', () => {
            if (item.classList.contains('selected')) {
                item.classList.remove('selected');
                state.onField = state.onField.filter(p => p !== player);
            } else {
                if (state.onField.length >= 7) {
                    alert('Only 7 players allowed on field');
                    return;
                }
                item.classList.add('selected');
                state.onField.push(player);
            }
        });

        rosterList.appendChild(item);
    });

    modal.classList.remove('hidden');
});

document.getElementById('confirmPlayers').addEventListener('click', () => {
    if (state.onField.length !== 7) {
        alert('Please select exactly 7 players');
        return;
    }

    document.getElementById('playerModal').classList.add('hidden');
    updateOnFieldDisplay();
});

// (Start new point handler moved to end of file with pull mechanics)

// Stats modal
document.getElementById('statsBtn').addEventListener('click', () => {
    showStats();
});

document.getElementById('closeStats').addEventListener('click', () => {
    document.getElementById('statsModal').classList.add('hidden');
});

function showStats() {
    const statsContent = document.getElementById('statsContent');
    statsContent.innerHTML = '';

    // Overall stats
    const overall = document.createElement('div');
    overall.className = 'stat-category';
    overall.innerHTML = `
        <h3>Game Score</h3>
        <div class="stat-row">
            <span class="stat-player">Our Team</span>
            <span class="stat-value">${state.score.us}</span>
        </div>
        <div class="stat-row">
            <span class="stat-player">Opponent</span>
            <span class="stat-value">${state.score.them}</span>
        </div>
    `;
    statsContent.appendChild(overall);

    // Player stats sorted by different metrics
    const categories = [
        { title: 'Goals', key: 'goals' },
        { title: 'Assists', key: 'assists' },
        { title: 'Throwing Yards', key: 'throws' },
        { title: 'Receiving Yards', key: 'receives' }
    ];

    categories.forEach(cat => {
        const section = document.createElement('div');
        section.className = 'stat-category';

        const players = Object.entries(state.playerStats)
            .filter(([name, stats]) => stats[cat.key] > 0)
            .sort((a, b) => b[1][cat.key] - a[1][cat.key])
            .slice(0, 10);

        if (players.length === 0) return;

        let html = `<h3>${cat.title}</h3>`;
        players.forEach(([name, stats]) => {
            const value = cat.key === 'throws' || cat.key === 'receives'
                ? stats[cat.key].toFixed(1) + ' yds'
                : stats[cat.key];
            html += `
                <div class="stat-row">
                    <span class="stat-player">${name}</span>
                    <span class="stat-value">${value}</span>
                </div>
            `;
        });

        section.innerHTML = html;
        statsContent.appendChild(section);
    });

    document.getElementById('statsModal').classList.remove('hidden');
}

// Export CSV
document.getElementById('exportStats').addEventListener('click', () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Events CSV
    let eventsCSV = 'timestamp,type,player,thrower,distance\n';
    state.events.forEach(e => {
        eventsCSV += `${e.timestamp},${e.type},${e.player || ''},${e.thrower || ''},${e.distance || ''}\n`;
    });

    // Stats CSV
    let statsCSV = 'player,throws_yds,receives_yds,goals,assists\n';
    Object.entries(state.playerStats).forEach(([name, stats]) => {
        statsCSV += `${name},${stats.throws.toFixed(1)},${stats.receives.toFixed(1)},${stats.goals},${stats.assists}\n`;
    });

    // Download events
    downloadCSV(eventsCSV, `ultimate_events_${timestamp}.csv`);

    // Download stats
    setTimeout(() => {
        downloadCSV(statsCSV, `ultimate_stats_${timestamp}.csv`);
    }, 100);

    alert('Stats exported! Check your downloads.');
});

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Game Setup Modal
document.getElementById('startGame').addEventListener('click', () => {
    const opponentInput = document.getElementById('opponentName').value.trim();
    const gameLength = parseInt(document.getElementById('gameLength').value);
    const startOffense = document.querySelector('input[name="startOffense"]:checked').value;

    if (!opponentInput) {
        alert('Please enter opponent team name');
        return;
    }

    state.opponentName = opponentInput;
    state.gameLength = gameLength;
    state.halfPoint = gameLength === 15 ? 8 : gameLength === 13 ? 7 : 6;
    state.weStartedOnOffense = (startOffense === 'us');
    state.weAreOnOffense = state.weStartedOnOffense;

    document.getElementById('gameSetupModal').classList.add('hidden');

    alert(`Game setup complete! ${state.weAreOnOffense ? 'We receive the pull.' : 'We are pulling.'}`);
});

// Start new point with pull mechanics
document.getElementById('startPointBtn').addEventListener('click', () => {
    if (state.onField.length !== 7) {
        alert('Select 7 players first');
        return;
    }

    // Clear field
    state.currentPossession = null;
    state.lastCatchPos = null;
    state.catches = [];
    state.pointActive = true;

    // Check if halftime just occurred
    const totalScore = state.score.us + state.score.them;
    if (totalScore === state.halfPoint && !state.halftimeOccurred) {
        state.halftimeOccurred = true;
        state.weAreOnOffense = !state.weStartedOnOffense;
        alert(`Halftime! Switching sides. ${state.weAreOnOffense ? 'We now receive.' : 'We now pull.'}`);
    }

    state.events.push({
        type: 'start_point',
        onField: [...state.onField],
        weAreOnOffense: state.weAreOnOffense,
        timestamp: new Date().toISOString()
    });

    drawField();
    updateOnFieldDisplay();

    // If we are on offense, await pull reception
    if (state.weAreOnOffense) {
        state.awaitingPull = true;
        alert('Click on the field where the pull was caught, then select the player who caught it.');
    } else {
        alert('Point started! We pulled. Click to record events when we get the disc.');
    }
});

// Handle pull reception or dropped pull
function handlePullReception(catcher, pos, dropped = false) {
    state.awaitingPull = false;

    if (dropped) {
        // Dropped pull = turnover
        state.events.push({
            type: 'dropped_pull',
            player: catcher,
            pos: pos,
            timestamp: new Date().toISOString()
        });

        // We are now on defense
        state.weAreOnOffense = false;
        alert(`Dropped pull by ${catcher.split(' ')[0]}! Turnover.`);
    } else {
        // Normal pull catch
        state.events.push({
            type: 'pull_catch',
            player: catcher,
            pos: pos,
            timestamp: new Date().toISOString()
        });

        state.catches.push({
            from: pos,
            to: pos,
            player: catcher
        });

        state.currentPossession = catcher;
        state.lastCatchPos = pos;
    }

    drawField();
    updateOnFieldDisplay();
    hideActionPanel();
}

// Modified canvas click to handle pull
const originalCanvasClick = canvas.onclick;
canvas.removeEventListener('click', originalCanvasClick);

canvas.addEventListener('click', (e) => {
    if (!state.pointActive) {
        alert('Start a new point first!');
        return;
    }

    if (state.onField.length !== 7) {
        alert('Select 7 players before starting!');
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    state.clickedPos = { x, y };

    // If awaiting pull, show pull options
    if (state.awaitingPull) {
        showPullOptions();
    } else {
        // Show normal action panel
        showActionPanel();
    }
});

function showPullOptions() {
    const modal = confirm('Was the pull caught cleanly?\n\nOK = Caught\nCancel = Dropped/Out of Bounds');

    if (modal) {
        // Caught - show player selection
        showPlayerArcForPull(false);
    } else {
        // Dropped or OOB
        const droppedOrOOB = confirm('OK = Dropped Pull (turnover)\nCancel = Out of Bounds');

        if (droppedOrOOB) {
            // Dropped pull
            showPlayerArcForPull(true);
        } else {
            // Out of bounds - handle brick
            handleOutOfBoundsPull();
        }
    }
}

function showPlayerArcForPull(isDropped) {
    // Reuse existing player arc mechanism
    playerArc.innerHTML = '';

    const arcContainer = document.createElement('div');
    arcContainer.className = 'arc-container';

    const numPlayers = state.onField.length;
    const arcWidth = Math.min(window.innerWidth - 60, 400);
    const arcHeight = 130;
    const centerX = arcWidth / 2;

    state.onField.forEach((player, index) => {
        const btn = document.createElement('button');
        btn.className = 'arc-player';
        btn.textContent = player.split(' ')[0];
        btn.dataset.player = player;

        const angleRange = 140;
        const startAngle = 90 - angleRange / 2;
        const angle = startAngle + (angleRange / (numPlayers - 1)) * index;
        const radians = (angle * Math.PI) / 180;

        const radius = arcHeight;
        const x = centerX + Math.cos(radians) * radius;
        const y = arcHeight - Math.sin(radians) * radius;

        btn.style.left = `${x}px`;
        btn.style.bottom = `${y}px`;
        btn.style.transform = 'translate(-50%, 50%)';

        btn.addEventListener('click', () => {
            handlePullReception(player, state.clickedPos, isDropped);
        });

        arcContainer.appendChild(btn);
    });

    playerArc.appendChild(arcContainer);
    playerArc.classList.remove('hidden');
    document.getElementById('actionPanel').classList.remove('hidden');
}

function handleOutOfBoundsPull() {
    const useBrick = confirm('Take it at the brick mark?\n\nOK = Brick\nCancel = Where it went out');

    let pos;
    if (useBrick) {
        // Brick is at midfield, centered
        pos = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
    } else {
        pos = state.clickedPos;
    }

    state.events.push({
        type: 'oob_pull',
        usedBrick: useBrick,
        pos: pos,
        timestamp: new Date().toISOString()
    });

    state.awaitingPull = false;
    state.currentPossession = null;
    state.lastCatchPos = pos;

    alert('Out of bounds pull. Click to continue play from the chosen spot.');
    drawField();
}

// Initialize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateScore();
updateOnFieldDisplay();
