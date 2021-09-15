//var ps = require("python-shell")
let { PythonShell } = require('python-shell')
let moment = require('moment-timezone')
let play = require('audio-play');
let load = require('audio-loader');
var speechSynthesis = require('speech-synthesis'); // Voices from webbrowser
var say = require('say') // Locally installed voices

let twitchViewerList = new PythonShell('python/Twitch/twitchViewerList.py');
let twitch = new PythonShell('python/Twitch/twitch.py');

// List of Twitch viewer
twitchViewerList.on('message', function(message) {
    // console.log(message);

    var json_obj = JSON.parse(message);

    getTwitchModerators(json_obj);
    getTwitchViewers(json_obj);
})

// Execute loadVoices.
loadVoices();

// Check installed voices
say.getInstalledVoices((err, voices) => console.log(voices))

// Get the voice select element.
var voiceSelect = document.getElementById('voice');

// Chrome loads voices asynchronously.
window.speechSynthesis.onvoiceschanged = function(e) {
    loadVoices();
};

// Fetch the list of voices and populate the voice options.
function loadVoices() {
    // Fetch the available voices.
    var voices = speechSynthesis.getVoices();

    // Loop through each of the voices.
    voices.forEach(function(voice, i) {
        // Create a new option element.
        var option = document.createElement('option');

        // Set the options value and text.
        option.value = voice.name;
        option.innerHTML = voice.name;

        // Add the option to the voice selector.
        voiceSelect.appendChild(option);
    });
}

function getTwitchViewers(json_obj) {
    let viewerlist = document.getElementById("viewers");

    // Remove current list of viewers
    if (viewerlist) {
        while (viewerlist.firstChild) {
            viewerlist.removeChild(viewerlist.firstChild);
        }
    }

    // Print list of current viewers
    let viewers = json_obj.viewers.viewers;
    if (viewers.length > 0) {
        for (var i = 0; i < viewers.length; i++) {
            var li = document.createElement("li");
            li.innerText = viewers[i];
            viewerlist.appendChild(li);
        }
    }
}

function getTwitchModerators(json_obj) {
    let viewerlist = document.getElementById("moderators");

    // Remove current list of moderators
    if (viewerlist) {
        while (viewerlist.firstChild) {
            viewerlist.removeChild(viewerlist.firstChild);
        }
    }

    // Print list of current moderators
    let viewers = json_obj.viewers.moderators;
    if (viewers.length > 0) {
        for (var i = 0; i < viewers.length; i++) {
            var li = document.createElement("li");
            li.innerText = viewers[i];
            viewerlist.appendChild(li);
        }
    }
}

// Recieve Twitch chat messages
twitch.on('message', function(message) {
    // console.log(message)

    // TODO: notification message when no key is given.

    load('sounds/alert.mp3').then(play);

    if (JSON.parse(message).Type === "Message") {

        // TODO: make TTS Dynamic
        say.speak(JSON.parse(message).Message, 'Vocalizer Expressive Jorge Harpo 22kHz', 1);

        userHtml = `
        <article class="msg-container msg-remote" id="msg-0">
            <div class="msg-box">
            <div class="icon-container">
            <img class="user-img" id="user-0" src="` + JSON.parse(message).Logo + `" />
            <img class="status-circle" id="user-0" src="./images/twitch-icon.png" />
        </div>
                <div class="flr">
                    <div class="messages">
                    <span class="timestamp"><span class="username">` + JSON.parse(message).User + `</span><span class="posttime">` + moment().format('hh:mm A') + `</span></span>
                    <br>
                        <p class="msg" id="msg-0">
                        ` + JSON.parse(message).Message + `
                        </p>
                    </div>

                </div>
            </div>
        </article>`;
    }

    if (JSON.parse(message).Type === "Console") {
        // Create chat message from recieved data
        userHtml = `
        <article class="msg-container msg-remote" id="msg-0">
            <div class="msg-box">
                <div class="flr">
                    <div class="messages">
                            <p class="msg" id="msg-0">
                            ` + JSON.parse(message).Message + ` 
                            </p>
                    </div>
                </div>
            </div>
        </article>`;
    }

    // Appends the message to the main chat box (shows the message)
    $("#chatbox").append(userHtml);

    // Auto-scrolls the window to the last recieved message
    let [lastMsg] = $('.msg-container').last();
    lastMsg.scrollIntoView({ behavior: 'smooth' });
});