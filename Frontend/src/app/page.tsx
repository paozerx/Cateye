"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { API_BASE_URL } from "@/lib/api";

type Game = {
  id: string;
  title: string;
  genre: string;
  platform: string;
  hours: string;
  lastPlayed: string;
  note: string;
  cover: string;
  accent: string;
};

type Session = { id: number; gameId: string; date: string; duration: string; mood: string; notes: string; next: string };

const games: Game[] = [
  { id: "ember", title: "Ember Hollow", genre: "Action RPG", platform: "PS5", hours: "38 ชม.", lastPlayed: "47 วันก่อน", note: "บทที่ 4 · 23 sessions", cover: "✦", accent: "ember" },
  { id: "starfall", title: "Starfall Odyssey", genre: "Sci-fi RPG", platform: "PC", hours: "112 ชม.", lastPlayed: "12 วันก่อน", note: "ยานจอดสถานีวงแหวน 3 · Vex ยังโกรธ", cover: "☾", accent: "starfall" },
  { id: "moonlit", title: "Moonlit Farm", genre: "Cozy simulation", platform: "Switch", hours: "64 ชม.", lastPlayed: "3 วันก่อน", note: "ปีที่ 2 ใบไม้ร่วง · วันเกิด Lina พรุ่งนี้", cover: "☼", accent: "moonlit" },
  { id: "iron", title: "Iron Tide", genre: "Adventure", platform: "Xbox", hours: "22 ชม.", lastPlayed: "210 วันก่อน", note: "ภารกิจ 14 · ยังไม่ได้ปลดล็อกเรือ", cover: "⚓", accent: "iron" },
];

const navigation = [
  { id: "home", label: "หน้าหลัก", icon: "⌂" },
  { id: "library", label: "คลังเกม", icon: "▤" },
  { id: "quests", label: "เควสทั้งหมด", icon: "✧" },
  { id: "characters", label: "ตัวละคร & NPC", icon: "♙" },
  { id: "timeline", label: "ไทม์ไลน์", icon: "◷" },
  { id: "gallery", label: "อัลบั้มภาพ", icon: "▧" },
];

export default function Home() {
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unavailable">("checking");
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string; display_name: string } | null>(null);
  const [activeNav, setActiveNav] = useState("home");
  const [selectedGameId, setSelectedGameId] = useState("ember");
  const [libraryGames, setLibraryGames] = useState<Game[]>(games);
  const [query, setQuery] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [story, setStory] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [mood, setMood] = useState("สนุก");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/me`, { credentials: "include" })
      .then((response) => {
        if (response.status === 401) { window.location.replace("/login"); return; }
        if (!response.ok) { setAuthStatus("unavailable"); return; }
        return response.json().then((user: { id: number; email: string; display_name: string }) => {
          setCurrentUser(user);
          setAuthStatus("authenticated");
        });
      })
      .catch(() => setAuthStatus("unavailable"));
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated" || !currentUser) return;
    const gamesKey = `cateye-games-${currentUser.id}`;
    const sessionsKey = `cateye-sessions-${currentUser.id}`;
    const storedGames = window.localStorage.getItem(gamesKey);
    if (storedGames) {
      try { setLibraryGames(JSON.parse(storedGames) as Game[]); } catch { window.localStorage.removeItem(gamesKey); }
    }
    const stored = window.localStorage.getItem(sessionsKey);
    if (stored) {
      try { setSessions(JSON.parse(stored) as Session[]); } catch { window.localStorage.removeItem(sessionsKey); }
    }
  }, [authStatus, currentUser]);

  const selectedGame = libraryGames.find((game) => game.id === selectedGameId) ?? libraryGames[0] ?? games[0];
  const visibleGames = useMemo(() => libraryGames.filter((game) => `${game.title} ${game.genre} ${game.note}`.toLowerCase().includes(query.toLowerCase())), [libraryGames, query]);
  const gameSessions = sessions.filter((session) => session.gameId === selectedGame.id);
  const latestSession = gameSessions[0];

  function saveSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!story.trim()) return;
    const entry: Session = { id: Date.now(), gameId: selectedGame.id, date: new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date()), duration: "บันทึกใหม่", mood, notes: story.trim(), next: nextStep.trim() || "ยังไม่ได้ระบุ" };
    const updated = [entry, ...sessions];
    setSessions(updated);
    window.localStorage.setItem(`cateye-sessions-${currentUser!.id}`, JSON.stringify(updated));
    setStory(""); setNextStep(""); setSaved(true); setSessionOpen(false);
    window.setTimeout(() => setSaved(false), 3000);
  }

  async function signOut() {
    await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => undefined);
    window.location.replace("/login");
  }

  if (authStatus !== "authenticated" || !currentUser) {
    return <main className="auth-page auth-check"><div className="auth-brand"><span className="brand-mark"><span>•</span><span>•</span></span><span>CATEYE</span></div><section className="auth-card"><div className="auth-cat"><span>• •</span><b>ω</b></div><h1>{authStatus === "checking" ? "กำลังตรวจสอบบัญชี…" : "เชื่อมต่อ Cateye ไม่ได้"}</h1><p className="auth-subtitle">{authStatus === "checking" ? "ขอสักครู่ เรากำลังเตรียมสมุดบันทึกของคุณ" : "ตรวจสอบว่า backend และฐานข้อมูลกำลังทำงาน แล้วลองใหม่อีกครั้ง"}</p>{authStatus === "unavailable" && <button className="primary-button auth-submit" onClick={() => window.location.reload()}>ลองอีกครั้ง <span>↻</span></button>}</section></main>;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => setActiveNav("home")}><span className="brand-mark"><span>•</span><span>•</span></span><span>CATEYE</span></a>
        <div className="side-label">YOUR SPACE</div>
        <nav className="side-nav" aria-label="เมนูหลัก">
          {navigation.map((item) => <button key={item.id} className={`nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{item.id === "library" && <span className="nav-count">{libraryGames.length}</span>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <button className="primary-button full" onClick={() => setSessionOpen(true)}><span>＋</span> บันทึก session</button>
            <div className="profile"><div className="avatar">{currentUser.display_name.slice(0, 1).toUpperCase()}</div><div><strong>{currentUser.display_name}</strong><small>{currentUser.email}</small></div><button className="more-button" aria-label="ออกจากระบบ" title="ออกจากระบบ" onClick={signOut}>↪</button></div>
        </div>
      </aside>

      <section className="workspace" id="home">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark"><span>•</span><span>•</span></span>CATEYE</div><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาเกม, เควส, NPC…" aria-label="ค้นหาเกม เควส หรือตัวละคร" /><kbd>⌘ K</kbd></label><button className="icon-button notification" aria-label="การแจ้งเตือน">♧<i /></button><button className="signout-button" onClick={signOut} title="ออกจากระบบ" aria-label="ออกจากระบบ">ออกจากระบบ <span>↪</span></button></header>

        <div className="page-content">
          <div className="welcome-row"><div><p className="eyebrow">GOOD EVENING, {currentUser.display_name.toUpperCase()} <span>✦</span></p><h1>{activeNav === "home" ? "วันนี้จะเล่นเกมไหนต่อ?" : navigation.find((item) => item.id === activeNav)?.label}</h1><p className="welcome-copy">ทุกการผจญภัยมีเรื่องราว เก็บช่วงเวลาที่อยากจำไว้ที่นี่</p></div><div className="date-chip"><span>◷</span> วันอาทิตย์ที่ 11 ตุลาคม</div></div>

          {activeNav !== "home" && activeNav !== "library" ? <section className="empty-section"><div className="empty-icon">{navigation.find((item) => item.id === activeNav)?.icon}</div><p className="eyebrow">COMING UP IN YOUR JOURNEY</p><h2>{navigation.find((item) => item.id === activeNav)?.label}</h2><p>ส่วนนี้พร้อมต่อยอดจากบันทึกเกมของคุณ<br />เริ่มจากเพิ่ม session เพื่อสร้างเรื่องราวของคุณ</p><button className="primary-button" onClick={() => setSessionOpen(true)}>＋ บันทึก session แรก</button></section> : <>
            {activeNav === "home" && <section className="continue-card"><div className="continue-main"><div className="section-kicker"><span className="live-dot" /> LAST SAVE <span className="muted">· {latestSession ? "เพิ่งบันทึก" : selectedGame.lastPlayed}</span></div><div className="continue-title"><div className={`game-cover cover-${selectedGame.accent}`}><span>{selectedGame.cover}</span><small>{selectedGame.title.split(" ").map((word) => word[0]).join("")}</small></div><div><h2>{selectedGame.title}</h2><p>{selectedGame.note}</p></div></div><div className="recap-box"><div className="cat-speech"><div className="cat-avatar"><span>• •</span><b>ω</b></div><div><span className="section-kicker">MIU สรุปให้</span><p>{latestSession ? latestSession.notes : "คุณเพิ่งชนะบอส Ash Warden แล้วเดินมาถึงประตูหอคอยเหนือ แต่ประตูล็อก — ต้องไปเอากุญแจทองแดงจาก Orrin ที่ท่าเรือ"}</p></div></div><div className="next-up"><div className="section-kicker">NEXT UP <span className="muted">· ทำต่อเลย</span></div><ul><li><span className="check-square" />{latestSession?.next ?? "หาแร่เหล็กดำ 3 ชิ้น (เหมืองตะวันตก)"}</li><li><span className="check-square" />เอาแร่ไปให้ Orrin แลกกุญแจ</li><li><span className="check-square" />เข้าหอคอยเหนือ</li></ul></div></div><div className="continue-footer"><span className="forgot-tip">☼ <span>ปุ่มที่ลืม:</span> ปัดหลบ = RB · ฮีล = ↓ D-pad</span><button className="text-button" onClick={() => setActiveNav("timeline")}>เปิดสมุดเกมนี้ <span>↗</span></button></div></div><div className="continue-side"><div className="miu-orbit"><div className="orbit-ring"/><div className="miu-large"><span>• •</span><b>ω</b></div><span className="spark spark-one">✦</span><span className="spark spark-two">✧</span></div><p className="side-quote">“จำได้ทุกเรื่อง<br/>เพื่อให้คุณได้เล่นต่อ”</p><span className="miu-caption">MIU · YOUR GAME COMPANION</span><button onClick={() => setActiveNav("timeline")}>อ่านสรุปเกมทั้งหมด <span>→</span></button></div></section>}

            <section className="library-section"><div className="section-heading"><div><p className="eyebrow">YOUR COLLECTION</p><h2>{activeNav === "library" ? "คลังเกมของคุณ" : "คลังเกม"}<span className="heading-count">{visibleGames.length}</span></h2></div><div className="sort-control">เรียงตาม <button>เล่นล่าสุด <span>⌄</span></button></div></div>{visibleGames.length ? <div className="game-grid">{visibleGames.map((game) => <button key={game.id} className={`game-card ${selectedGameId === game.id ? "selected" : ""}`} onClick={() => { setSelectedGameId(game.id); setActiveNav("home"); }}><div className={`card-art cover-${game.accent}`}><span className="art-symbol">{game.cover}</span><span className="art-title">{game.title}</span><span className="art-platform">{game.platform}</span></div><div className="game-info"><div className="game-name-row"><h3>{game.title}</h3><span className="game-menu">···</span></div><p>{game.note}</p><div className="game-meta"><span>{game.genre}</span><span>{game.hours} <i>·</i> {game.lastPlayed}</span></div></div></button>)}</div> : <div className="no-results">ไม่พบเกมที่ตรงกับ “{query}”</div>}<button className="add-game-card" onClick={() => { const name = window.prompt("ชื่อเกมใหม่"); if (name?.trim()) { const newGame: Game = { id: `game-${Date.now()}`, title: name.trim(), genre: "เกมใหม่", platform: "ยังไม่ระบุ", hours: "0 ชม.", lastPlayed: "ยังไม่ได้เล่น", note: "เพิ่มลงในคลังแล้ว · เริ่มบันทึกการผจญภัย", cover: "✦", accent: "starfall" }; const updated = [...libraryGames, newGame]; setLibraryGames(updated); setSelectedGameId(newGame.id); window.localStorage.setItem(`cateye-games-${currentUser.id}`, JSON.stringify(updated)); } }}><span>＋</span><b>เพิ่มเกมใหม่</b><small>เพิ่มเกมเข้าสู่คลังของคุณ</small></button></section>

            <section className="recent-section"><div className="section-heading"><div><p className="eyebrow">YOUR MEMORIES</p><h2>session ล่าสุด</h2></div><button className="text-button" onClick={() => setActiveNav("timeline")}>ดูทั้งหมด <span>→</span></button></div><div className="session-list">{gameSessions.slice(0, 2).map((session) => <article className="session-row" key={session.id}><div className="session-date"><span>{session.date.split(" ")[0]}</span><small>{session.date.split(" ").slice(1).join(" ")}</small></div><div className="session-marker"><i /></div><div className="session-description"><strong>Session #{session.id}</strong><p>{session.notes}</p><span className="session-tags">◷ {session.duration} <i>·</i> ☺ {session.mood}</span></div><button className="row-arrow" aria-label={`เปิด session ${session.id}`}>↗</button></article>)}{!gameSessions.length && <p className="session-empty">ยังไม่มีบันทึกสำหรับเกมนี้ ลองบันทึก session แรกของคุณ</p>}</div></section>
          </>}
          <footer className="app-footer"><span>✦ CATEYE</span><span>เก็บทุกการผจญภัยไว้ในที่เดียว</span><span>MADE FOR YOUR NEXT QUEST</span></footer>
        </div>
      </section>

      {sessionOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSessionOpen(false); }}><section className="session-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><div><p className="eyebrow">{selectedGame.title} · SESSION #{gameSessions.length + 24}</p><h2 id="modal-title">บันทึกการผจญภัย</h2></div><button className="close-button" onClick={() => setSessionOpen(false)} aria-label="ปิด">×</button></header><form onSubmit={saveSession}><label className="field-label" htmlFor="story">เกิดอะไรขึ้นบ้าง? <span>WHAT HAPPENED</span></label><textarea id="story" autoFocus value={story} onChange={(event) => setStory(event.target.value)} placeholder="เล่าเรื่องราวที่เกิดขึ้น… เช่น เจอใคร ทำเควสอะไร หรือมีช่วงไหนที่อยากจำ" required /><div className="field-row"><label className="field-label" htmlFor="mood">อารมณ์ตอนเล่น</label><select id="mood" value={mood} onChange={(event) => setMood(event.target.value)}><option>สนุก</option><option>ภูมิใจ</option><option>ตื่นเต้น</option><option>หงุดหงิด</option><option>ผ่อนคลาย</option></select></div><label className="field-label" htmlFor="next-step">หยุดตรงไหน · ทำอะไรต่อดี?</label><input id="next-step" value={nextStep} onChange={(event) => setNextStep(event.target.value)} placeholder="เช่น ตามหาเศษกระจกจันทรา 4 ชิ้น" /><div className="modal-hint"><span>✦</span> บันทึกไว้ในเครื่องนี้โดยอัตโนมัติ</div><footer className="modal-actions"><button type="button" className="secondary-button" onClick={() => setSessionOpen(false)}>ยกเลิก</button><button type="submit" className="primary-button">บันทึก session <span>↗</span></button></footer></form></section></div>}
      {saved && <div className="toast">✦ บันทึก session เรียบร้อยแล้ว</div>}
    </main>
  );
}
