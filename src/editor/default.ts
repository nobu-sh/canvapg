export const DefaultInput = `/********************************************************
*   Canvas playground for rapid development of images   *
*   for node discord bots. Output code will be tweaked  *
*    to be used with @napi-rs/canvas for performance.   *
*                                                       *
*      All code below will be unsafely evaluated <3     *
*********************************************************/

// Creates a new canvas (only supports 1 as of now)
// and gets 2d rendering context for the canvas.
const canvas = createCanvas(280, 150);
const ctx = canvas.getContext('2d');

// Draws white 32px Arial text to the canvas.
ctx.fillStyle = "#ffffff";
ctx.font = "32px Arial";
ctx.fillText('Hello World!', 10, 32);

// Draws a 50x50 red square to the canvas.
ctx.fillStyle = "rgb(245, 66, 66, 0.7)";
ctx.fillRect(10, 60, 50, 50);

// Draws a 50x50 blue square to the canvas.
ctx.fillStyle = "rgba(66, 135, 245, 0.5)";
ctx.fillRect(30, 80, 50, 50);


// Do not remove this line. Used for codegen.
finish(canvas, ctx);
`