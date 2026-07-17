// api/youtube.js

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (!YOUTUBE_API_KEY) {
        return res.status(500).json({
            error: "YouTube API key is not set"
        });
    }

    const { type, q, id } = req.query;

    try {
        if (type === "search") {
            return await searchVideos(q, res);
        }

        if (type === "video") {
            return await getVideo(id, res);
        }

        return res.status(400).json({
            error: "Invalid request type"
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message || "Server error"
        });
    }
}

async function searchVideos(query, res) {
    if (!query) {
        return res.status(400).json({
            error: "Query is required"
        });
    }

    const searchUrl =
        "https://www.googleapis.com/youtube/v3/search?" +
        new URLSearchParams({
            key: YOUTUBE_API_KEY,
            part: "snippet",
            type: "video",
            maxResults: "12",
            q: query
        });

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
        return res.status(searchResponse.status).json(searchData);
    }

    const ids = searchData.items
        .map(item => item.id.videoId)
        .filter(Boolean);

    if (ids.length === 0) {
        return res.status(200).json([]);
    }

    return await getVideosByIds(ids, res);
}

async function getVideo(videoId, res) {
    if (!videoId) {
        return res.status(400).json({
            error: "Video ID is required"
        });
    }

    return await getVideosByIds([videoId], res, true);
}

async function getVideosByIds(ids, res, single = false) {
    const detailUrl =
        "https://www.googleapis.com/youtube/v3/videos?" +
        new URLSearchParams({
            key: YOUTUBE_API_KEY,
            part: "snippet,contentDetails",
            id: ids.join(",")
        });

    const detailResponse = await fetch(detailUrl);
    const detailData = await detailResponse.json();

    if (!detailResponse.ok) {
        return res.status(detailResponse.status).json(detailData);
    }

    const videos = detailData.items.map(item => ({
        videoId: item.id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail:
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url,
        duration: item.contentDetails.duration
    }));

    if (single) {
        if (videos.length === 0) {
            return res.status(404).json({
                error: "Video not found"
            });
        }

        return res.status(200).json(videos[0]);
    }

    return res.status(200).json(videos);
}

