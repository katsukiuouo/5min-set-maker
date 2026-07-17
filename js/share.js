/* ==========================================
   Supabase
========================================== */

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_KEY = window.SUPABASE_KEY;

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* ==========================================
   Params
========================================== */

const params = new URLSearchParams(location.search);
const id = params.get("id");


/* ==========================================
   Start
========================================== */

loadSharedSet();


/* ==========================================
   Load
========================================== */

async function loadSharedSet() {
    const root = document.getElementById("sharedResult");

    if (!id) {
        root.innerHTML = `
            <div class="empty">
                セットが見つかりません
            </div>
        `;
        return;
    }

    const { data, error } = await supabaseClient
        .from("shared_sets")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        root.innerHTML = `
            <div class="empty">
                セットが見つかりません
            </div>
        `;
        return;
    }

    renderSharedSet(data.videos);
}


/* ==========================================
   Render
========================================== */

function renderSharedSet(videos) {
    const root = document.getElementById("sharedResult");

    root.innerHTML = "";

    const card = document.createElement("div");
    card.className = "result-card";

    let html = `
        <div class="result-video-list">
    `;

    videos.forEach(video => {
        html += `
            <div class="result-video">
                <div class="result-thumbnail">
                    <img src="${escapeHtml(video.thumbnail)}" alt="thumbnail">
                </div>

                <div class="result-content">
                    <div class="result-title">
                        ${escapeHtml(video.title)}
                    </div>

                    <div class="result-channel">
                        ${escapeHtml(video.channel)}
                    </div>

                    <div class="result-duration">
                        ${escapeHtml(video.duration)}
                    </div>

                    <a
                        class="result-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://youtu.be/${escapeHtml(video.videoId)}"
                    >
                        YouTubeで開く
                    </a>
                </div>
            </div>
        `;
    });

    html += `
        </div>
    `;

    card.innerHTML = html;
    root.appendChild(card);
}


/* ==========================================
   Escape
========================================== */

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
