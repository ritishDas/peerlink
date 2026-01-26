console.log("popup script1");

document.getElementById("share").onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true
    });
    console.log("Captured", stream);
  } catch (e) {
    console.error(e);
  }
};
// browser.windows.create({
//   url: "https:peerlink.ritish.site",
//   type: "normal", // can be "normal", "popup", or "panel"
// });
