// Copyright 2019 WilcoForr
//JavaScript ASP NET Core Signal R docs: https://docs.microsoft.com/en-us/javascript/api/?view=signalr-js-latest
//https://docs.microsoft.com/en-us/aspnet/core/signalr/javascript-client?view=aspnetcore-3.0

//just a shorthand for document.getElementById
function get(id) {
    return document.getElementById(id);
}

//get a random "anonymous" name
const username = generateAnonymousName();

const chatroom = get("currentChatroom").innerText;

function generateAnonymousName() {
    let str = "";
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < 6; i++) {
        let index = Math.floor((Math.random() * alphabet.length));
        str += alphabet[index];
    }

    return str;
}

get("username").innerText = username;

//build a signalR connection
const connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

connection.start().then(() => {

    connection.invoke("UserJoined")
        .catch((err) => {
            return console.log(err.toString());
        });

    }).catch((err) => {
        return console.log(err.toString());
});


//receive the message and show the message.
//username: who sent the message
//message: message contents
//messageChatroom: the chatroom where the message was sent from/to
connection.on("ReceiveMessage", (username, message, messageChatroom) => {

    //only add a message if it was from the chatroom it originated from
    //kind of sloppy but instead of having different scripts for different pages
    //all pages use the same script and just dont show messages that aren't from
    //their respective chatroom
    if (chatroom != messageChatroom) {
        return;
    }

    let userTd = document.createElement("td");
    let messageTd = document.createElement("td");
    let dateTd = document.createElement("td"); 

    userTd.textContent = username;
    messageTd.textContent = message;
    dateTd.textContent = new Date().toLocaleTimeString();

    //build the new table row with data to insert into the table
    let newChatRow = document.createElement("tr");

    newChatRow.appendChild(userTd);
    newChatRow.appendChild(messageTd);
    newChatRow.appendChild(dateTd);

    //insert the row into the table
    get("messageTable").appendChild(newChatRow);
});


connection.on("UserJoined", (userCount) => {
    get("userCount").innerText = userCount;
    //todo: add message that the user joined a specific chat room instad of just incrementing the users online count
});


//add an event to send the message
get("sendButton").addEventListener("click", (event) => {
    event.preventDefault();

    sendMessage();
});

function sendMessage() {
    let message = get("userMessage").value;

    if (message.trim() === "") {
        window.alert("Cannot send an empty message.");
        return;
    }

    //reset text 
    get("userMessage").value = "";

    connection.invoke("SendMessage", username, message, chatroom)
        .catch((err) => {
            return console.log(err.toString());
        });
}

//on enter keypress, send the message
$(document).keypress((e) => {
    const ENTER_KEY = 13;
    if (e.which == ENTER_KEY) {
        sendMessage();
    }
});

