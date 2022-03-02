const chat = require("express")();
const http = require("http").Server(chat);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
const electron = require('electron')

let roomList = [];

const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})


const createRoom = (roomName, user) => {
  return {
    name: roomName,
    users: user === undefined ? [] : [user],
  };
};

chat.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    let roomResult;
    for (let room of roomList) {
      if (room.users.find((user) => user.id === socket.id) !== undefined)
        roomResult = room;
    }
    if (roomResult !== undefined) {
      roomResult.users.map((socket) => {
        socket.emit("chat message", msg);
      });
    } else {
      console.log("the user is not in a room");
    }
  });

  socket.on("command", (msg) => {
    const [cmd, arg] = msg.split(" ");

    switch (cmd) {
      case "/join": {
        let room = roomList.find((x) => x.name === arg);
        if (room !== undefined) {
          for (let room of roomList) {
            if (room.users.find((user) => user.id === socket.id) !== undefined)
              room.users = room.users.filter((user) => user.id !== socket.id);
          }
          room.users.push(socket);
        }
        break;
      }
      case "/leave": {
        for (let room of roomList) {
          if (room.users.find((user) => user.id === socket.id) !== undefined)
            room.users = room.users.filter((user) => user.id !== socket.id);
        }
        console.log(roomList);
        break;
      }
      case "/create": {
        roomList.push(createRoom(arg));
        break;
      }
      case "/list": {
        socket.emit(
            "list",
            roomList.map((e) => e.name)
        );
        break;
      }
      default: {
        console.log("Command not found");
      }
    }
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
