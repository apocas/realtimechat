
soundManager.onload = function() {
    sound = soundManager.createSound({
        id:'sound1',
        url:'./sound/sound.wav',
        onfinish:function() {
            soundManager._writeDebug(this.sID+' finished playing');
        }
    });
}

$(document).ready(function() {
    
    $('#userModal').modal({
        keyboard: false
    });
    
    
    var username = "anonymous";
    var content = $('#content_chat');
    var socket = new io.connect('http://localhost:88');
    
    $.jGrowl("Connecting...", {
        header: '<i class="icon-flag icon-white"></i> Info'
    });
			                
    socket.on('connect', function() {
        $.jGrowl("Connected!", {
            header: '<i class="icon-flag icon-white"></i> Server'
        });
    });

    socket.on('ping', function(message) {
        $.jGrowl("Pingged by " + message.name + " at " + message.time + "!", {
            header: '<i class="icon-flag icon-white"></i> Ping!',
            sticky: true
        });
    });

    socket.on('msg', function(message) {
        $(".messages").append("<li><span class='tag'>(" + message.time + ") " + message.name + ": </span><span class='txt_txt'>" + message.msg.linkify() + "</span></li>");
        $(".messages").scrollTop($(".messages")[0].scrollHeight);
        
        sound.play({
            volume:35
        });
    });
    
    socket.on('history', function(message) {
        $(".messages").append("<li class='history'><span class='tag'>(" + message.time + ") " + message.name + " said </span><span class='txt_txt'>" + message.msg.linkify() + "</span></li>");
        $(".messages").scrollTop($(".messages")[0].scrollHeight);
    });
                
                
    socket.on('add', function(message) {
        $(".messages").append("<li><span class='tag' style='color:#009900;'>(" + currentTime() + ") " + message + " entered.");
        $('.lusers').append("<li name='" + message + "'><span class='user_icon'></span><span class='user_txt'>" + message + "</span></li>");
    });
                
                
    socket.on('remove', function(message) {
        $(".messages").append("<li><span class='tag' style='color:#900000;'>(" + currentTime() + ") " + message + " leaved.");
        $('[name="' + message + '"]').remove();
    });
                 

    socket.on('disconnect', function() {
        content.html("<b>Disconnected!</b>");
    });

    $("input[name=sendBtn]").click(function() {
        $('#form_txt').submit();
    });
    
    $("input[name=enterBtn]").click(function() {
        $('#form_user').submit();
    });
    
    $("#enterBtn").click(function() {
        $('#enterBtn').button('loading');
        $('#lform').hide();
        $('#lloading').show();
        $('#form_user').submit();
    });
    
    socket.on('success', function() {
        setTimeout('resizeDivs()', 10);
        $('#content').show();
                    

        $('#sendChat').slideDown("slow");
        
        socket.emit('list','');
        
        $('#userModal').modal('hide');
    });
    
    socket.on('errorc', function(message) {
        $.jGrowl(message, {
            header: '<i class="icon-flag icon-white"></i> ERROR!',
            sticky: true
        });
        
        $('#lform').show();
        $('#lloading').hide();
        $('#enterBtn').button('reset');
    });
           
    $('#form_user').submit(function() {
        if($('input[name=usernameTxt]').val() != ""){
            username = $('input[name=usernameTxt]').val().split(' ').join('');
            password = $('input[name=passwordTxt]').val();
            socket.emit('enter', {
                name: username,
                password: password
            });
        }
        return false;
    });
           
    $('#form_txt').submit(function() {
        if($("input[name=chatTxt]").val().length > 0){
            socket.emit('send', {
                name: username, 
                msg: $("input[name=chatTxt]").val()
            });
            
            $("input[name=chatTxt]").val("");
        }
        return false;
    });
                
    $(window).resize(function() {
        resizeDivs();
    });
});
            
function resizeDivs() {
    $("#content").height($(window).height()*0.7);
}

if(!String.linkify) {
    String.prototype.linkify = function() {
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return this
        .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&" target="_blank">$&</a>');
    };
}

function currentTime() {
    var objToday = new Date(),
    curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
    curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
    curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds();
    var now = curHour + ":" + curMinute + ":" + curSeconds;
    return now;
}
