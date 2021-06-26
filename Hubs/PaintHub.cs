using System.Threading.Tasks;

using Microsoft.AspNetCore.SignalR;

namespace AnonyTalk.Hubs
{
    /// <summary>
    /// A Paint Hub for users to draw things together.
    /// </summary>
    public class PaintHub : Hub
    {
        /// <summary>
        /// Draw the point clicked to the canvas and send the paint event to all other connected clients
        /// </summary>
        /// <param name="prevX"></param>
        /// <param name="prevY"></param>
        /// <param name="currentX"></param>
        /// <param name="currentY"></param>
        /// <param name="color"></param>
        /// <returns></returns>
        public async Task Paint(int prevX, int prevY, int currentX, int currentY, string color)
        {
            await Clients.Others.SendAsync("Paint", prevX, prevY, currentX, currentY, color);
        }

        /// <summary>
        /// this clears the canvas for ALL connected clients.
        /// In a real production app this would be some sort of vote system, like a vote would be triggered and if the majority
        /// of users on the PaintHub page voted to reset the canvas, it would be reset.
        /// Another Idea is that the canvas is reset every 30 seconds or so, some sort of time interval.
        /// </summary>
        /// <returns></returns>
        public async Task ClearCanvas()
        {
            await Clients.All.SendAsync("ClearCanvas");
        }
    }
}
