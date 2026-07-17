const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");

const candidateList = document.getElementById("candidateList");

const urlInput = document.getElementById("urlInput");
const urlButton = document.getElementById("urlButton");

const searchTab = document.getElementById("searchTab");
const urlTab = document.getElementById("urlTab");

const searchArea = document.getElementById("searchArea");
const urlArea = document.getElementById("urlArea");

const checkAllButton = document.getElementById("checkAll");
const uncheckAllButton = document.getElementById("uncheckAll");

const generateButton = document.getElementById("generateButton");
const resultList = document.getElementById("resultList");

let currentSearchVideos = [];

renderCandidateList();

const savedSets = loadResultSets();

if (savedSets.length > 0) {
    renderResultList(savedSets);
}

initTabs();
initEvents();

function initTabs() {
    searchTab.onclick = () => {
        searchTab.classList.add("active");
        urlTab.classList.remove("active");
        searchArea.classList.remove("hidden");
        urlArea.classList.add("hidden");
    };

    urlTab.onclick = () => {
        urlTab.classList.add("active");
        searchTab.classList.remove("active");
        urlArea.classList.remove("hidden");
        searchArea.classList.add("hidden");
    };
}

function initEvents() {
    searchButton.onclick = searchAction;
    urlButton.onclick = addUrlAction;

    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") searchAction();
    });

    urlInput.addEventListener("keydown", e => {
        if (e.key === "Enter") addUrlAction();
    });

    checkAllButton.onclick = () => {
        checkAllVideos();
        renderCandidateList();
    };

    uncheckAllButton.onclick = () => {
        uncheckAllVideos();
        renderCandidateList();
    };

    generateButton.onclick = generateAction;
}

async function searchAction() {
    const keyword = searchInput.value.trim();
    if (!keyword) return;

    searchButton.disabled = true;

    try {
        const result = await searchYouTube(keyword);
        currentSearchVideos = result.map(video => normalizeVideo(video));
        renderSearchResults(currentSearchVideos);
    } catch (e) {
        alert(e.message);
    }

    searchButton.disabled = false;
}

async function addUrlAction() {
    const url = urlInput.value.trim();
    if (!url) return;

    urlButton.disabled = true;

    try {
        const video = await getVideoFromUrl(url);
        addVideo(normalizeVideo(video));
        renderCandidateList();
        urlInput.value = "";
    } catch (e) {
        alert(e.message);
    }

    urlButton.disabled = false;
}

function renderSearchResults(videos) {
    searchResults.innerHTML = "";

    if (videos.length === 0) {
        searchResults.innerHTML = `
            <div class="empty">
                検索結果がありません
            </div>
        `;
        return;
    }

    const addSelectedButton = document.createElement("button");
    addSelectedButton.type = "button";
    addSelectedButton.className = "search-add-selected";
    addSelectedButton.textContent = "選択した動画を追加";
    addSelectedButton.onclick = addSelectedSearchVideos;

    searchResults.appendChild(addSelectedButton);

    videos.forEach((v, index) => {
        const card = document.createElement("div");
        card.className = "search-item";

        card.innerHTML = `
            <input
                type="checkbox"
                class="search-select"
                data-index="${index}"
            >

            <div class="search-thumbnail">
                <img src="${v.thumbnail}" alt="thumbnail">
            </div>

            <div class="search-content">
                <div class="search-title">${escapeHtml(v.title)}</div>

                <div class="search-meta">
                    <span class="search-channel">${escapeHtml(v.channel)}</span>
                    <span class="search-duration">${v.duration}</span>
                </div>
            </div>
        `;

        searchResults.appendChild(card);
    });
}

function addSelectedSearchVideos() {
    const checkedBoxes = document.querySelectorAll(".search-select:checked");

    if (checkedBoxes.length === 0) {
        alert("追加する動画を選択してください");
        return;
    }

    checkedBoxes.forEach(box => {
        const index = Number(box.dataset.index);
        const video = currentSearchVideos[index];

        if (video) {
            addVideo(video);
        }
    });

    renderCandidateList();
    closeSearchResults();
}

function closeSearchResults() {
    searchResults.innerHTML = "";
    searchInput.value = "";
    currentSearchVideos = [];
}

function renderCandidateList() {
    const videos = getAllVideos();
    candidateList.innerHTML = "";

    if (videos.length === 0) {
        candidateList.innerHTML = `
            <div class="empty">
                動画を追加するとここに表示されます
            </div>
        `;
        return;
    }

    videos.forEach(video => {
        candidateList.appendChild(createCandidateCard(video));
    });
}

function createCandidateCard(video) {
    const card = document.createElement("div");
    card.className = "candidate-item";

    card.innerHTML = `
        <div class="candidate-thumbnail">
            <img src="${video.thumbnail}" alt="thumbnail">
        </div>

        <div class="candidate-content">
            <div class="candidate-title">${escapeHtml(video.title)}</div>

            <div class="candidate-meta">
                <span class="candidate-channel">${escapeHtml(video.channel)}</span>
                <span class="candidate-duration">${video.duration}</span>
            </div>

            <div class="candidate-bottom">
                <input
                    type="checkbox"
                    class="candidate-check"
                    ${video.checked ? "checked" : ""}
                >

                <button type="button" class="delete-button">×</button>
            </div>
        </div>
    `;

    card.querySelector(".candidate-check").onchange = () => {
        toggleVideo(video.id);
        renderCandidateList();
    };

    card.querySelector(".delete-button").onclick = () => {
        removeVideo(video.id);
        renderCandidateList();
    };

    return card;
}

async function generateAction() {
    showLoading();

    await new Promise(resolve => requestAnimationFrame(resolve));

    const sets = generateSets();

    renderResultList(sets);
    saveResultSets(sets);

    hideLoading();
}

function renderResultList(resultSets) {
    resultList.innerHTML = "";

    if (resultSets.length === 0) {
        resultList.innerHTML = `
            <div class="empty">
                条件を満たすセットを作成できませんでした
            </div>
        `;
        return;
    }

    resultSets.forEach((set, index) => {
        resultList.appendChild(createResultCard(set, index + 1));
    });

    document.querySelectorAll(".share-button").forEach(button => {
        button.onclick = () => {
            const index = Number(button.dataset.index);
            shareSet(resultSets[index]);
        };
    });
}

function createResultCard(set, number) {
    const card = document.createElement("div");
    card.className = "result-card";

    let html = `
        <div class="result-header">
            <div class="result-time">
                合計 ${formatTotalTime(set)}
            </div>
        </div>

        <div class="result-video-list">
    `;

    set.forEach(video => {
        html += `
            <div class="result-video">
                <div class="result-thumbnail">
                    <img src="${video.thumbnail}" alt="thumbnail">
                </div>

                <div class="result-content">
                    <div class="result-title">${escapeHtml(video.title)}</div>

                    <div class="result-meta">
                        <span class="result-channel">${escapeHtml(video.channel)}</span>
                        <span class="result-duration">${video.duration}</span>
                    </div>

                    <a
                        class="result-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://youtu.be/${video.videoId}"
                    >
                        YouTubeで開く
                    </a>
                </div>
            </div>
        `;
    });

    html += `
        </div>

        <div class="result-footer">
            <button
                type="button"
                class="share-button"
                data-index="${number - 1}"
            >
                Xで共有
            </button>
        </div>
    `;

    card.innerHTML = html;

    return card;
}

function showLoading() {
    document.getElementById("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
    document.getElementById("loadingOverlay").classList.add("hidden");
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
