//Player
var app = {
    playersParametersArray: [{
        height: '600',
        width: '800',
        playerVars: {
            wmode: 'opaque',
            controls: 0, 
            playsinline: 1, 
            rel: 0, 
            showinfo: 0, 
            autohide: 1, 
            fs: 0, 
            iv_load_policy: 3, 
            loop: 1, 
            mute: 0, 
            listType: 'playlist', 
            autoplay: 0, 
            cc_load_policy: 0, 
            color: 'white', 
            disablekb: 0, 
            enablejsapi: 0, 
            hl: 'it', 
            modestbranding: 1, 
            theme: 'dark' 
        }
    }],
    ytPlayers: [],
    iFrames: [],
    onTouch: (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) ? 'touchstart' : 'click',
}


function onYouTubeIframeAPIReady() {
    if (typeof app.playersParametersArray === 'undefined')
        return;

    if (app.onTouch === 'touchstart') {
        $('.ytplayer').addClass('on-touch');
        $('.controls').css({
            'display': 'none'
        });
        $('.controls__volume').css({
            'display': 'none'
        });
    }

    var videoIdList = [];
    var playlistIDs = [];

    $(".ytplayer__iframe").each(function() {
        videoIdList.push($(this).attr("data-video"));
    });
    $(".ytplayer__iframe").each(function() {
        playlistIDs.push($(this).attr("data-playlist"));
    });

    for (var i = 0; i < videoIdList.length; i++) {

        var videoID = videoIdList[i] || playlistIDs[i];
        var playlistID = playlistIDs[i];
        var playerID = $('[data-video=' + videoID + ']').attr('id') || $('[data-playlist=' + videoID + ']').attr('id');
        var playerParameters = app.playersParametersArray[i];

        createPlayer(playerParameters, playerID, videoID, playlistID);
    }
}


function createPlayer(playerParameters, playerID, videoID, playlistID) {

    if (playlistID != null) {
        playerParameters.playerVars.playlist = '' + playlistID + '';
        playerParameters.playerVars.list = '' + playlistID + '';

    } else {
        playerParameters.videoId = videoID;
    }

    var ytPlayer = new YT.Player(playerID, playerParameters);

    app.ytPlayers.push(ytPlayer);

    ytPlayer.addEventListener('onReady', function(event) {
        YTManager = new PlayerManager(ytPlayer, videoID);
    });

}

var __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
};


function PlayerManager(ytPlayerRef, videoID) {

    this.ytPlayer = ytPlayerRef;

    if (videoID.length == 11) {
        var playerContainer = $('[data-video=' + videoID + ']').parent('.ytplayer');
    } else {
        var playerContainer = $('[data-playlist=' + videoID + ']').parent('.ytplayer');
    }

    this.playerContainer = playerContainer;
    this.playButton = playerContainer.find('.controls__btn--play');
    this.overlayButton = playerContainer.find('.controls__btn--overlay');
    this.overlayWrap = playerContainer.find('.overlay');
    this.overlayElements = playerContainer.find('.overlay__element');
    this.skipButton = playerContainer.find('.controls__btn--skip');
    this.playerState = YT.PlayerState.UNSTARTED;
    this.volumeSlider = playerContainer.find('.controls__slider');
    this.muteBtn = playerContainer.find('.controls__btn--mute');
    this.overlayCarousel = playerContainer.find('.overlay__carousel');
    this.carouselElements = this.overlayCarousel.find('.overlay__element');


    var mngr = this;
    this.ytPlayer.addEventListener('onStateChange', __bind(mngr.onPlayerStateChange, mngr));

    this.listeners();

    this.ytpIndex = [];

    this.carouselElements.each(function() {
        mngr.ytpIndex.push($(this).attr("data-ytp-index"));
    });

}


PlayerManager.prototype.listeners = function() {

    var $playerManager = this;


    this.playButton.on(app.onTouch, function(e) {
        e.preventDefault();

        $playerManager.playerState = $playerManager.ytPlayer.getPlayerState();
        var isMute = $playerManager.ytPlayer.isMuted();


        if (
            $playerManager.playerState == YT.PlayerState.UNSTARTED ||
            $playerManager.playerState == YT.PlayerState.CUED ||
            $playerManager.playerState == YT.PlayerState.PAUSED ||
            $playerManager.playerState == YT.PlayerState.BUFFERING
        ) {

            $playerManager.ytPlayer.playVideo();
            $playerManager.playerContainer.removeClass('on-pause on-overlay');
            $playerManager.playerContainer.addClass('on-play');

        } else if ($playerManager.playerState == YT.PlayerState.PLAYING) {
            $playerManager.ytPlayer.pauseVideo();
            $playerManager.playerContainer.removeClass('on-play');

            $playerManager.playerContainer.addClass('on-pause');

        }
    });

    this.overlayButton.on(app.onTouch, function(e) {
        e.preventDefault();

        var isMute = $playerManager.ytPlayer.isMuted();

        $playerManager.playerState = $playerManager.ytPlayer.getPlayerState();

        if ($playerManager.playerContainer.hasClass('on-overlay')) {
            $playerManager.playerContainer.removeClass('on-overlay');
        } else {

            if (
                $playerManager.playerState == YT.PlayerState.UNSTARTED ||
                $playerManager.playerState == YT.PlayerState.CUED ||
                $playerManager.playerState == YT.PlayerState.PAUSED ||
                $playerManager.playerState == YT.PlayerState.BUFFERING
            ) {
                $playerManager.playerContainer.addClass('on-overlay');

            } else if ($playerManager.playerState == YT.PlayerState.PLAYING) {

                $playerManager.playerContainer.addClass('on-overlay');

            }
        }
    });

    this.overlayElements.on(app.onTouch, function(e) {
        e.preventDefault();
        var yptIndex = $(this).attr('data-ytp-index');

        if ($(this).hasClass('overlay__element--hide')) {
            if ($playerManager.playerContainer.hasClass('on-play')) {
                $playerManager.ytPlayer.pauseVideo();
                $playerManager.playerContainer.addClass('on-pause');
                $playerManager.playerContainer.removeClass('on-play on-overlay');
            } else {
                $playerManager.ytPlayer.playVideo();
                $playerManager.playerContainer.removeClass('on-pause on-overlay');
                $playerManager.playerContainer.addClass('on-play');
            }
        } else {
            $playerManager.ytPlayer.playVideoAt(yptIndex);
            $playerManager.playerContainer.removeClass('on-overlay on-pause');
            $playerManager.playerContainer.addClass('on-play');
        }
    });

    this.skipButton.on(app.onTouch, function(e) {
        e.preventDefault();
        $playerManager.playerContainer.addClass('on-play');

        if ($(this).hasClass('controls__btn--prev')) {

            $playerManager.ytPlayer.previousVideo();
        } else {
            $playerManager.ytPlayer.nextVideo();
        }
    });

    this.volumeSlider.on('input', function(e) {
        e.preventDefault();

        var volume = $(this).val();

        $playerManager.ytPlayer.setVolume(volume);

        if (volume == 0) {
            $playerManager.muteBtn.addClass('on-mute');
        } else {
            $playerManager.muteBtn.removeClass('on-mute');
        }

    });

    this.muteBtn.on(app.onTouch, function(e) {
        e.preventDefault();
        var isMute = $playerManager.ytPlayer.isMuted();


        if (isMute == true) {
            $playerManager.ytPlayer.unMute();
            $playerManager.muteBtn.removeClass('on-mute');
        } else {
            $playerManager.ytPlayer.mute();
            $playerManager.muteBtn.addClass('on-mute');
        }

    });
}


PlayerManager.prototype.onPlayerStateChange = function() {


    var $playerManager = this;
    var isMute = $playerManager.ytPlayer.isMuted();
    console.log('change ' + $playerManager.playerState);

    $playerManager.playerState = $playerManager.ytPlayer.getPlayerState();

    if (
        $playerManager.playerState == YT.PlayerState.UNSTARTED ||
        $playerManager.playerState == YT.PlayerState.CUED ||
        $playerManager.playerState == YT.PlayerState.PAUSED ||
        $playerManager.playerState == YT.PlayerState.ENDED
    ) {
        $playerManager.playerContainer.removeClass('on-play');

        $playerManager.playerContainer.addClass('on-pause');
    } else if ($playerManager.playerState == YT.PlayerState.BUFFERING) {

        var playlistIndex = $playerManager.ytPlayer.getPlaylistIndex();

        for (var i = 0; i < $playerManager.ytpIndex.length; i++) {
            if ($playerManager.ytpIndex[i] == playlistIndex) {

                this.carouselElements.removeClass('now-playing');
                $("[data-ytp-index=" + $playerManager.ytpIndex[i] + "]").addClass('now-playing');
            }
        }

    } else {
        $playerManager.playerContainer.removeClass('on-pause');
        $playerManager.playerContainer.addClass('on-play');
    }
}

$(function() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});



var inputRange = document.getElementsByClassName('range')[0],
    maxValue = 100, 
    speed = 5,
    currValue, rafID;

inputRange.min = 0;
inputRange.max = maxValue;

function unlockStartHandler() {
    window.cancelAnimationFrame(rafID);
    currValue = +this.value;
}

function unlockEndHandler() {

    currValue = +this.value;

    if (currValue >= maxValue) {
        successHandler();
    } else {
        rafID = window.requestAnimationFrame(animateHandler);
    }
}

function animateHandler() {

    var transX = currValue - maxValue;

    inputRange.value = currValue;

    if (currValue < 20) {
        inputRange.classList.remove('ltpurple');
    }
    if (currValue < 40) {
        inputRange.classList.remove('purple');
    }
    if (currValue < 60) {
        inputRange.classList.remove('pink');
    }

    if (currValue > -1) {
        window.requestAnimationFrame(animateHandler);
    }

    currValue = currValue - speed;
}

inputRange.addEventListener('mousedown', unlockStartHandler, false);
inputRange.addEventListener('mousestart', unlockStartHandler, false);
inputRange.addEventListener('mouseup', unlockEndHandler, false);
inputRange.addEventListener('touchend', unlockEndHandler, false);
inputRange.addEventListener('input', function() {
    if (this.value > 20) {
        inputRange.classList.add('ltpurple');
    }
    if (this.value > 40) {
        inputRange.classList.add('purple');
    }
    if (this.value > 60) {
        inputRange.classList.add('pink');
    }

    if (this.value < 20) {
        inputRange.classList.remove('ltpurple');
    }
    if (this.value < 40) {
        inputRange.classList.remove('purple');
    }
    if (this.value < 60) {
        inputRange.classList.remove('pink');
    }
});