const API_ENDPOINT = "/api/youtube";

async function searchYouTube(keyword) {
    keyword = keyword.trim();
    if (!keyword) return [];

    const response = await fetch(
        `${API_ENDPOINT}?type=search&q=${encodeURIComponent(keyword)}`
    );

    if (!response.ok) {
        throw new Error("検索に失敗しました");
    }

    return await response.json();
}

async function getVideoFromUrl(url) {
    const videoId = extractVideoId(url);

    if (!videoId) {
        throw new Error("URLが正しくありません");
    }

    const response = await fetch(
        `${API_ENDPOINT}?type=video&id=${encodeURIComponent(videoId)}`
    );

    if (!response.ok) {
        throw new Error("動画情報を取得できません");
    }

    return await response.json();
}

function extractVideoId(url) {
    try {
        const u = new URL(url);

        if (u.hostname.includes("youtube.com")) {
            if (u.searchParams.has("v")) {
                return u.searchParams.get("v");
            }

            if (u.pathname.startsWith("/shorts/")) {
                return u.pathname.split("/")[2];
            }

            if (u.pathname.startsWith("/embed/")) {
                return u.pathname.split("/")[2];
            }
        }

        if (u.hostname.includes("youtu.be")) {
            return u.pathname.split("/")[1];
        }

        return null;
    } catch {
        return null;
    }
}

function parseDuration(duration) {
    const match = duration.match(
        /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
    );

    if (!match) return 0;

    const h = Number(match[1] || 0);
    const m = Number(match[2] || 0);
    const s = Number(match[3] || 0);

    return h * 3600 + m * 60 + s;
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    return `${m}:${String(s).padStart(2, "0")}`;
}

function normalizeVideo(video) {
    const seconds = parseDuration(video.duration);

    return {
        videoId: video.videoId,
        title: video.title,
        channel: video.channel,
        thumbnail: video.thumbnail,
        duration: formatDuration(seconds),
        durationSeconds: seconds
    };
}
