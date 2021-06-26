using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.SignalR;

namespace AnonyTalk.Hubs
{
    public class ChatHub : Hub
    {
        /// <summary>
        /// Current connections of users for a ChatHub
        /// </summary>
        public static HashSet<string> CurrentConnections = new HashSet<string>();

        /// <summary>
        /// Send a message to all users in the chatroom they are in
        /// </summary>
        /// <param name="username"></param>
        /// <param name="message"></param>
        /// <param name="currentChatroom"></param>
        /// <returns></returns>
        public async Task SendMessage(string username, string message, string currentChatroom)
        {
            //Im not sure if script injection is even possible, but to just be safe
            //obviously for a real production facing web app this would be checked and also implement rate-limiting for messages
            //being sent, so a User just cant spam messages into the chatroom.
            string sanitizedMessage = message.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;"); //System.Net.WebUtility.HtmlEncode(message);

            //use this with groups instead of a string of the chatroom
            //await Client.Group.SendAsync("ReceiveMessage", username, sanitizedMessage, currentChatroom);

            await Clients.All.SendAsync("ReceiveMessage", username, sanitizedMessage, currentChatroom);
        }

        /// <summary>
        /// Increase the number of users online.
        /// Could also enhance this to send a message to the specific chat room that someone new joined it.
        /// </summary>
        /// <returns></returns>
        public async Task UserJoined()
        {
            await Clients.All.SendAsync("UserJoined", CurrentConnections.Count);
        }

        /// <summary>
        /// When a user connects, add this user's connection to the CurrentConnections hashset
        /// </summary>
        /// <returns></returns>
        public override Task OnConnectedAsync()
        {
            CurrentConnections.Add(Context.ConnectionId);

            return base.OnConnectedAsync();
        }

        /// <summary>
        /// When a user disconnects from the app, decrement the users online count
        /// </summary>
        /// <param name="ex"></param>
        /// <returns></returns>
        /// notes: chrome might thrown an websocket error code of 1006. seems like other browsers dont do this
        public override Task OnDisconnectedAsync(Exception ex)
        {
            var connection = CurrentConnections.FirstOrDefault(cc => cc == Context.ConnectionId);

            if (connection != null)
            {
                CurrentConnections.Remove(connection);
            }

            Clients.All.SendAsync("UserJoined", CurrentConnections.Count); //.ConfigureAwait(false);

            return base.OnDisconnectedAsync(ex);
        }
    }
}