/* ==========================================
   Constants
========================================== */

const TARGET_SECONDS = 600;

const MAX_RESULT_COUNT = 20;

const RANDOM_RETRY = 250;

/* ==========================================
   Shuffle
========================================== */

function shuffle(array) {

    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];

    }

    return result;

}

/* ==========================================
   Total Seconds
========================================== */

function totalSeconds(videos) {

    return videos.reduce(

        (sum, video) =>

            sum + video.durationSeconds,

        0

    );

}

/* ==========================================
   Has Channel
========================================== */

function hasChannel(set, channel) {

    return set.some(

        video => video.channel === channel

    );

}

/* ==========================================
   Used
========================================== */

function alreadyUsed(video, usedIds) {

    return usedIds.has(video.id);

}

/* ==========================================
   Create One Set
========================================== */

function createOneSet(videos, usedIds) {

    let best = null;

    let bestDiff = Infinity;

    for (let retry = 0; retry < RANDOM_RETRY; retry++) {

        const shuffled = shuffle(videos);

        const current = [];

        let seconds = 0;

        for (const video of shuffled) {

            if (alreadyUsed(video, usedIds)) {

                continue;

            }

            if (hasChannel(current, video.channel)) {

                continue;

            }

            current.push(video);

            seconds += video.durationSeconds;

            if (seconds >= TARGET_SECONDS) {

                const diff = seconds - TARGET_SECONDS;

                if (diff < bestDiff) {

                    best = [...current];

                    bestDiff = diff;

                }

                break;

            }

        }

    }

    return best;

}

/* ==========================================
   Generate Sets
========================================== */

function generateSets() {

    const source = getCheckedVideos();

    if (source.length === 0) {

        return [];

    }

    const usedIds = new Set();

    const result = [];

    while (result.length < MAX_RESULT_COUNT) {

        const set = createOneSet(source, usedIds);

        if (!set) {

            break;

        }

        result.push(set);

        set.forEach(video => {

            usedIds.add(video.id);

        });

    }

    return result;

}

/* ==========================================
   Format Total Time
========================================== */

function formatTotalTime(videos) {

    return formatDuration(

        totalSeconds(videos)

    );

}

/* ==========================================
   Shuffle Source
========================================== */

function shuffledCandidates() {

    return shuffle(

        getCheckedVideos()

    );

}

/* ==========================================
   Regenerate
========================================== */

function regenerateSets() {

    const source = shuffledCandidates();

    const usedIds = new Set();

    const result = [];

    while (result.length < MAX_RESULT_COUNT) {

        const set = createOneSet(

            source,

            usedIds

        );

        if (!set) {

            break;

        }

        result.push(set);

        set.forEach(video => {

            usedIds.add(video.id);

        });

    }

    return result;

}

/* ==========================================
   Render Result
========================================== */

function renderResultList(resultSets) {

    const resultList = document.getElementById("resultList");

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

        resultList.appendChild(

            createResultCard(

                set,

                index + 1

            )

        );

    });

}

/* ==========================================
   Generate Button
========================================== */

async function generateAction() {

    showLoading();

    await new Promise(resolve => {

        requestAnimationFrame(resolve);

    });

    const sets = generateSets();

    renderResultList(sets);

    hideLoading();

}

/* ==========================================
   Regenerate Button
========================================== */

async function regenerateAction() {

    showLoading();

    await new Promise(resolve => {

        requestAnimationFrame(resolve);

    });

    const sets = regenerateSets();

    renderResultList(sets);

    hideLoading();

}

/* ==========================================
   Score
========================================== */

function scoreSet(videos) {

    const seconds = totalSeconds(videos);

    if (seconds < TARGET_SECONDS) {

        return Infinity;

    }

    return seconds - TARGET_SECONDS;

}

/* ==========================================
   Available
========================================== */

function availableVideos(videos, usedIds) {

    return videos.filter(video => {

        return !alreadyUsed(video, usedIds);

    });

}

/* ==========================================
   Can Create
========================================== */

function canCreateSet(videos, usedIds) {

    return availableVideos(videos, usedIds).length > 0;

}

/* ==========================================
   Mark Used
========================================== */

function markAsUsed(videos, usedIds) {

    videos.forEach(video => {

        usedIds.add(video.id);

    });

}

/* ==========================================
   Sort
========================================== */

function sortResult(result) {

    result.sort((a, b) => {

        return scoreSet(a) - scoreSet(b);

    });

}

/* ==========================================
   Build
========================================== */

function buildSets() {

    const source = getCheckedVideos();

    const usedIds = new Set();

    const result = [];

    while (

        result.length < MAX_RESULT_COUNT &&

        canCreateSet(source, usedIds)

    ) {

        const set = createOneSet(

            source,

            usedIds

        );

        if (!set) {

            break;

        }

        result.push(set);

        markAsUsed(set, usedIds);

    }

    sortResult(result);

    return result;

}

function generateSets() {

    return buildSets();

}

function regenerateSets() {

    return buildSets();

}

/* ==========================================
   Result Card
========================================== */

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

<img src="${video.thumbnail}">

</div>

<div class="result-content">

<div class="result-title">

${escapeHtml(video.title)}

</div>

<div class="result-channel">

${escapeHtml(video.channel)}

</div>

<div class="result-duration">

${video.duration}

</div>

<a
class="result-link"
target="_blank"
href="https://youtu.be/${video.videoId}">

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
class="share-button"
data-index="${number-1}">

Xで共有

</button>

</div>

`;

    card.innerHTML = html;

    return card;

}
