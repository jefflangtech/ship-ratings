const WebSocket = require('ws');
let wss = null;

exports.setupWebSocket = (server) => {
  wss = new WebSocket.Server({
    noServer: true  // Important: Disable the server's own HTTP handling
  });

  server.on('upgrade', function (request, socket, head) {
    // Check for the correct WebSocket path
    if (request.url === '/sockets') {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();  // Close the connection if it's not the correct path
    }
  });

  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });

    ws.send(JSON.stringify({ message: 'something' }));
  });

  return wss;
};

exports.broadcast = (data) => {
  if (!wss) {
    throw new Error("WebSocket server not initialized.");
  }
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};