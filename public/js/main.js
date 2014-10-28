var socket = io();

var $ = require('jquery');
var r = require('./render');
var body = $('body');
var feed = $('#feed');
var online = $('#online');
var nobodyOnline = $('.nobody');
var noMessages = $('.nothing');
var offlineTimeout = {};

var activeUser = function (data) {
  if (online.find('li[data-id="' + data.user + '"]').length === 0) {
    var li = $('<li class="user"></li>');
    li.attr('data-id', data.user);
    var userLink = $('<a></a>');
    var img = $('<img></img>');
    userLink.attr('href', "http://keybase.io/" + data.user);
    userLink.attr('title', data.user);
    img.attr('src', data.avatar);
    nobodyOnline.hide();
    userLink.append(img);
    li.append(userLink);
    online.append(li);
    clearTimeout(offlineTimeout[data.user]);
    offlineTimeout[data.user] = setTimeout(function () {
      console.log('timed out ', data.user)
      online.find('li[data-id="' + data.user + '"]').remove();

      if (online.find('li.user').length === 0) {
        nobodyOnline.show();
      }
    }, 60000 * 3);
  }
};

switch (body.data('page')) {
  case 'feed':
    socket.emit('feed');
    socket.on('feed', function (data) {
      if (data) {
        noMessages.remove();
        r.render(data);
      }
    });

    socket.on('active', function (data) {
      activeUser(data);
    });

    socket.on('idle', function (data) {
      activeUser(data);
    });
    break;

  case 'dual':
    socket.emit('join', feed.data('key'));
    socket.emit('dual', {
      key: feed.data('key'),
      start: false
    });

    socket.on('message', function (data) {
      r.render(data);
    });
    break;

  default:
    break;
}
