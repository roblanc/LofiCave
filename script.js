var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        videoId: 'rPjez8z61rI', // Replace with the ID of your video
        playerVars: {
            'autoplay': 1,
            'controls': 0,  // Customize controls if needed
            'loop': 1,      // Loop the video  
            'playlist': 'rPjez8z61rI', // Loop a single video
            'modestbranding': 1, // Limit YouTube branding
            'rel': 0, // Do not show related videos on playback end
            'showinfo': 0 // Do not show video info
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

// Loop the video when it ends.
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        player.playVideo(); 
    }
}
