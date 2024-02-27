var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        videoId: 'rPjez8z61rI', // Replace with the ID of your video
        playerVars: { 
            'autoplay': 1, 
            'controls': 0,  // Customize controls if needed
            'loop': 1,      // Loop the video  
            'playlist': 'rPjez8z61rI' // Loop a single video
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}
