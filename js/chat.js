window.$ = window.jQuery = require('jquery');

// get current time.
function getTime() {
    let today = new Date();
    hours = today.getHours();
    minutes = today.getMinutes();

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let time = hours + ":" + minutes;
    return time;
}

function getHardResponse(userText) {
    let botResponse = getBotResponse(userText);
    let botHtml = '<p class="botText"><span>' + botResponse + '</span></p>';
    $("#chatbox").append(botHtml);

    document.getElementById("chat-bar-bottom").scrollIntoView(true);
}

function getResponse() {
    let userText = $("#textInput").val();

    if (userText == "") {
        userText = "I love Code Palace!";
    }

    // twitch.send("test");

    // Create chat message from recieved data
    let userHtml = `
                <article class="msg-container msg-self" id="msg-0">
                    <div class="msg-box">
                        <div class="flr">
                            <div class="messages">
                                <span class="timestamp"><span class="username">You</span><span class="posttime">` + moment().format('hh:mm') + `</span></span>
                                <br>
                                <p class="msg" id="msg-0">
                                    ` + userText + `
                                </p>
                            </div>
                        </div>
                        <div class="icon-container">
                            <img class="user-img" id="user-0" src="https://gravatar.com/avatar/56234674574535734573000000000001?d=retro" />
                            <img class="status-circle" id="user-0" src="./images/twitch-icon.png" />
                        </div>
                    </div>
                </article>`;

    // Appends the message to the main chat box (shows the message)
    $("#chatbox").append(userHtml);

    // Auto-scrolls the window to the last recieved message
    let [lastMsg] = $('.msg-container').last();
    lastMsg.scrollIntoView({ behavior: 'smooth' });
}

function buttonSendText(sampleText) {
    let userHtml = '<p class="userText"><span>' + sampleText + '</span></p>';

    $("#textInput").val("");
    $("#chatbox").append(userHtml);
    document.getElementById("mid").scrollIntoView(true);
}

function sendButton() {
    getResponse();
}

function heartButton() {
    buttonSendText("Heart clicked!")
}

$("#textInput").keypress(function(e) {
    if (e.which == 13) {
        getResponse();
    }
});


// Left panel retract function
$('.circle-left').click(function() {
    let spWidthLeft = $('.sidepanel-left').width();
    let spMarginLeft = parseInt($('.sidepanel-left').css('margin-left'), 10);
    let w = (spMarginLeft >= 0) ? spWidthLeft * -1 : 0;
    let cw = (w < 0) ? -w : spWidthLeft;
    $('.sidepanel-left').animate({
        marginLeft: w
    });
    $('.sidepanel-left span').animate({
        marginLeft: w
    });
    $('.circle-left').animate({
        left: cw
    }, function() {
        $('.fa-chevron-left').toggleClass('hide');
        $('.fa-chevron-right').toggleClass('hide');
    });
});

// Right panel retract function
$('.circle-right').click(function() {
    let spWidthRight = $('.sidepanel-right').width();
    let spMarginRight = parseInt($('.sidepanel-right').css('margin-right'), 10);
    let w = (spMarginRight >= 0) ? spWidthRight * -1 : 0;
    let cw = (w < 0) ? -w : spWidthRight;
    $('.sidepanel-right').animate({
        marginRight: w
    });
    $('.sidepanel-right span').animate({
        marginRight: w
    });
    $('.circle-right').animate({
        right: cw
    }, function() {
        $('.fa-chevron-left').toggleClass('hide');
        $('.fa-chevron-right').toggleClass('hide');
    });
});