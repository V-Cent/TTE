// scroll.js controls the scroll button.

// Global control variables
//For bottom right scroll button
var scrollButton = null;
var rootElement = null;

function scrollInit() {
  //Add scroll button events (icon that appears when you pass ToC)
  scrollButton = document.querySelector("#scroll__button--to-top");
  rootElement = document.documentElement;
  scrollButton.addEventListener("click", scrollToTop);
  window.addEventListener("scroll", handleScroll);
}

if (document.readyState !== "loading") {
  scrollInit(); // Or setTimeout(scrollInit, 0);
} else {
  document.addEventListener("DOMContentLoaded", scrollInit);
}

// --- Functions related to scrolling effects
// Checks if scroll icon should be shown to user
function handleScroll() {
  //Get current scroll position
  let scrollTotal = rootElement.scrollHeight - rootElement.clientHeight;
  //Get TOC if it exists
  let toc = document.getElementById("content__selectorbox");
  let tocLocation = 0;
  if (toc != null) {
    //If the content selector exists, calculate the difference between the selector location and the top of the page
    let bodyRect = document.body.getBoundingClientRect(),
      elemRect = toc.getBoundingClientRect(),
      offset = elemRect.top - bodyRect.top;

    if (offset > 0) {
      tocLocation = offset;
    }
  }

  //Test if current scroll position is past the top of the page or the top of the TOC
  if ((rootElement.scrollTop - tocLocation) / scrollTotal > 0.05) {
    // Show button on 5% scroll down
    scrollButton.classList.add("scroll__button--to-top--show");
  } else {
    // Hide button else
    scrollButton.classList.remove("scroll__button--to-top--show");
  }
}

function scrollToTop() {
  //Get content selector if it exists
  let toc = document.getElementById("content__selectorbox");
  let tocLocation = 0;
  if (toc != null) {
    //If the selector exists, calculate the difference between the selector location and the top of the page
    let bodyRect = document.body.getBoundingClientRect(),
      elemRect = toc.getBoundingClientRect(),
      offset = elemRect.top - bodyRect.top;

    if (offset > 0) {
      tocLocation = offset - 100;
    }
  }
  //Scroll either to top of the page or to the selector smoothly
  rootElement.scrollTo({
    top: tocLocation,
    behavior: "smooth",
  });
}
