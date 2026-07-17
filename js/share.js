const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_KEY = window.SUPABASE_KEY;

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function saveSharedSet(videos) {
    const payload = videos.map(video => ({
        videoId: video.videoId,
        title: video.title,
        channel: video.channel,
        duration: video.duration,
        thumbnail: video.thumbnail
    }));

    const { data, error } = await supabaseClient
        .from("shared_sets")
        .insert({
            videos: payload
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data.id;
}

function createShareUrl(id) {
    return `${location.origin}/api/share?id=${id}`;
}

function openXShare(url) {
    const text = "#BandZAI10分セット";

    const shareUrl =
        "https://twitter.com/intent/tweet?" +
        new URLSearchParams({
            text,
            url
        }).toString();

    window.open(
        shareUrl,
        "_blank",
        "noopener,noreferrer"
    );
}

async function shareSet(videos) {
    try {
        showLoading();

        const id = await saveSharedSet(videos);
        const url = createShareUrl(id);

        hideLoading();

        openXShare(url);
    } catch (e) {
        hideLoading();
        alert("共有に失敗しました");
        console.error(e);
    }
}
