$(document).ready(function() {
    
    $('#userModal').modal({
        keyboard: false
    });
    
    
    var username = "anonymous";
    var content = $('#content_chat');
    var socket = new io.connect('http://skynet.ptisp.pt:88');
    
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
        $(".messages").append("<li><span class='tag'>(" + message.time + ") " + message.name + " said </span><span class='txt_txt'>" + message.msg.linkify() + "</span></li>");
        
        $(".messages").scrollTop($(".messages")[0].scrollHeight);
    });
                
                
    socket.on('add', function(message) {
        $('.lusers').append("<li name='" + message + "'><span class='user_icon'></span><span class='user_txt'>" + message + "</span></li>");
    });
                
                
    socket.on('remove', function(message) {
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
    });
           
    $('#form_user').submit(function() {
        if($('input[name=usernameTxt]').val() != ""){
            username = $('input[name=usernameTxt]').val();
            socket.emit('enter', username);
        }
        return false;
    });
           
    $('#form_txt').submit(function() {
        socket.emit('send', {
            name: username, 
            msg: $("input[name=chatTxt]").val()
        });
            
        $("input[name=chatTxt]").val("");
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

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return this
        .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&" target="_blank">$&</a>');
    };
}
