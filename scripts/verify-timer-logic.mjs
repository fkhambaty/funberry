/**
 * Standalone verification of timer countdown logic.
 * Tests the full lifecycle: start -> countdown -> lock -> PIN verify -> decision -> extend/stop.
 */

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function fresh(totalSeconds) {
  return {
    isActive: true,
    totalSeconds,
    remainingSeconds: totalSeconds,
    isLocked: false,
    isPaused: false,
    awaitingDecision: false,
  };
}

function tick(s) {
  if (!s.isActive || s.isLocked || s.isPaused) return s;
  if (s.remainingSeconds <= 1) {
    return { ...s, remainingSeconds: 0, isLocked: true, isActive: false, isPaused: true };
  }
  return { ...s, remainingSeconds: s.remainingSeconds - 1 };
}

function verifyPin(s, enteredPin, parentPin) {
  if (enteredPin !== parentPin) return { ok: false, state: s };
  return {
    ok: true,
    state: { ...s, isLocked: false, awaitingDecision: true, isPaused: true },
  };
}

function extendTimer(minutes) {
  const totalSec = minutes * 60;
  return {
    isActive: true, totalSeconds: totalSec, remainingSeconds: totalSec,
    isLocked: false, isPaused: false, awaitingDecision: false,
  };
}

function endSession() {
  return {
    isActive: false, totalSeconds: 0, remainingSeconds: 0,
    isLocked: false, isPaused: false, awaitingDecision: false,
  };
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Test 1: Basic countdown to lock ──
console.log("\n🧪 Test 1: Basic countdown (5s → lock)");
{
  let s = fresh(5);
  for (let i = 0; i < 4; i++) s = tick(s);
  assert(s.remainingSeconds === 1, "After 4 ticks: 1s left");
  s = tick(s);
  assert(s.remainingSeconds === 0, "After 5 ticks: 0s");
  assert(s.isLocked === true, "isLocked = true");
  assert(s.isActive === false, "isActive = false");
  assert(s.isPaused === true, "isPaused = true (game paused)");
  assert(s.awaitingDecision === false, "Not yet awaiting decision");
}

// ── Test 2: Ticks do nothing once locked/paused ──
console.log("\n🧪 Test 2: Locked state is stable");
{
  let s = { ...fresh(2), remainingSeconds: 0, isLocked: true, isActive: false, isPaused: true };
  const before = JSON.stringify(s);
  s = tick(s);
  assert(JSON.stringify(s) === before, "Tick is a no-op when locked");
}

// ── Test 3: PIN verification → decision phase ──
console.log("\n🧪 Test 3: PIN verify → decision phase");
{
  let s = { ...fresh(1), remainingSeconds: 0, isLocked: true, isActive: false, isPaused: true };
  const parentPin = "0000";

  let r = verifyPin(s, "1234", parentPin);
  assert(!r.ok, "Wrong PIN rejected");
  assert(r.state.isLocked === true, "Still locked after wrong PIN");

  r = verifyPin(s, "0000", parentPin);
  assert(r.ok, "Correct PIN accepted");
  assert(r.state.isLocked === false, "isLocked = false");
  assert(r.state.awaitingDecision === true, "awaitingDecision = true");
  assert(r.state.isPaused === true, "Game still paused during decision");
}

// ── Test 4: Extend timer after decision ──
console.log("\n🧪 Test 4: Extend timer (10 min)");
{
  const s = extendTimer(10);
  assert(s.isActive === true, "Active after extend");
  assert(s.totalSeconds === 600, "Total = 600s");
  assert(s.remainingSeconds === 600, "Remaining = 600s");
  assert(s.isLocked === false, "Not locked");
  assert(s.isPaused === false, "Not paused → game resumes");
  assert(s.awaitingDecision === false, "Decision cleared");

  let ticked = tick(s);
  assert(ticked.remainingSeconds === 599, "Countdown resumes");
}

// ── Test 5: End session after decision ──
console.log("\n🧪 Test 5: End session");
{
  const s = endSession();
  assert(s.isActive === false, "Not active");
  assert(s.totalSeconds === 0, "Total = 0");
  assert(s.remainingSeconds === 0, "Remaining = 0");
  assert(s.isLocked === false, "Not locked");
  assert(s.isPaused === false, "Not paused");
  assert(s.awaitingDecision === false, "No decision pending");
}

// ── Test 6: Full lifecycle (start → play → expire → PIN → extend → play → expire → PIN → stop) ──
console.log("\n🧪 Test 6: Full lifecycle");
{
  let s = fresh(3);
  assert(s.isActive && !s.isPaused, "Phase 1: playing");

  for (let i = 0; i < 3; i++) s = tick(s);
  assert(s.isLocked && s.isPaused, "Phase 2: timer expired, game paused");

  let r = verifyPin(s, "0000", "0000");
  s = r.state;
  assert(s.awaitingDecision && s.isPaused, "Phase 3: parent deciding, game still paused");

  s = extendTimer(2);
  for (let i = 0; i < 1; i++) s = tick(s);
  assert(s.remainingSeconds === 119, "Phase 4: extended timer counting down");

  for (let i = 0; i < 119; i++) s = tick(s);
  assert(s.isLocked && s.isPaused, "Phase 5: expired again");

  r = verifyPin(s, "0000", "0000");
  s = r.state;
  assert(s.awaitingDecision, "Phase 6: parent deciding again");

  s = endSession();
  assert(!s.isActive && !s.isPaused && !s.isLocked, "Phase 7: session ended cleanly");
}

// ── Test 7: Timer badge visibility conditions ──
console.log("\n🧪 Test 7: Badge visibility");
{
  const shouldShowBadge = (s) => s.isActive && !s.isLocked && !s.isPaused;
  const shouldShowLock = (s) => s.isLocked || s.awaitingDecision;

  let s = fresh(60);
  assert(shouldShowBadge(s), "Badge visible while playing");
  assert(!shouldShowLock(s), "Lock hidden while playing");

  for (let i = 0; i < 60; i++) s = tick(s);
  assert(!shouldShowBadge(s), "Badge hidden when locked");
  assert(shouldShowLock(s), "Lock visible when expired");

  const r = verifyPin(s, "0000", "0000");
  s = r.state;
  assert(!shouldShowBadge(s), "Badge hidden during decision");
  assert(shouldShowLock(s), "Lock/decision screen still visible");

  s = extendTimer(5);
  assert(shouldShowBadge(s), "Badge visible again after extend");
  assert(!shouldShowLock(s), "Lock hidden after extend");
}

// ── Test 8: Format edge cases ──
console.log("\n🧪 Test 8: Time formatting");
{
  assert(formatTime(0) === "0:00", "0 → 0:00");
  assert(formatTime(59) === "0:59", "59 → 0:59");
  assert(formatTime(60) === "1:00", "60 → 1:00");
  assert(formatTime(600) === "10:00", "600 → 10:00");
  assert(formatTime(3600) === "60:00", "3600 → 60:00");
}

// ── Test 9: Warning/critical thresholds ──
console.log("\n🧪 Test 9: Warning/critical thresholds");
{
  const check = (r) => ({ warn: r <= 120, crit: r <= 60 });
  assert(!check(300).warn, "5 min: no warn");
  assert(check(120).warn && !check(120).crit, "2 min: warn only");
  assert(check(60).warn && check(60).crit, "1 min: warn + crit");
}

// ── Summary ──
console.log(`\n${"═".repeat(50)}`);
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log(`${"═".repeat(50)}\n`);

if (failed > 0) {
  console.error("💥 SOME TESTS FAILED");
  process.exit(1);
} else {
  console.log("🎉 ALL TESTS PASSED — timer logic is solid!");
  process.exit(0);
}
