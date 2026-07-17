const STORAGE_KEY = "ten-minute-set-maker";
const RESULT_STORAGE_KEY = "ten-minute-set-maker-results";

let candidateVideos = [];

function loadVideos() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        candidateVideos = [];
        return;
    }

    try {
        candidateVideos = JSON.parse(data);
    } catch {
        candidateVideos = [];
    }
}

function saveVideos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidateVideos));
}

function addVideo(video) {
    candidateVideos.push({
        id: crypto.randomUUID(),
        videoId: video.videoId,
        title: video.title,
        channel: video.channel,
        duration: video.duration,
        durationSeconds: video.durationSeconds,
        thumbnail: video.thumbnail,
        checked: true
    });

    saveVideos();
}

function removeVideo(id) {
    candidateVideos = candidateVideos.filter(video => video.id !== id);
    saveVideos();
}

function toggleVideo(id) {
    const video = candidateVideos.find(item => item.id === id);
    if (!video) return;

    video.checked = !video.checked;
    saveVideos();
}

function checkAllVideos() {
    candidateVideos.forEach(video => video.checked = true);
    saveVideos();
}

function uncheckAllVideos() {
    candidateVideos.forEach(video => video.checked = false);
    saveVideos();
}

function getCheckedVideos() {
    return candidateVideos.filter(video => video.checked);
}

function getAllVideos() {
    return candidateVideos;
}

function saveResultSets(sets) {
    localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(sets));
}

function loadResultSets() {
    const data = localStorage.getItem(RESULT_STORAGE_KEY);
    if (!data) return [];

    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function clearResultSets() {
    localStorage.removeItem(RESULT_STORAGE_KEY);
}

loadVideos();
