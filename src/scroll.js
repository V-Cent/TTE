// scroll.js controls the scroll button.

// Global control variables
//For bottom right scroll button
var scrollButton = null;
var rootElement = null;

//Actions taken on DOM Load
document.addEventListener(
  "DOMContentLoaded",
  function () {
    //Add scroll button events (icon that appears when you pass ToC)
    scrollButton = document.querySelector("#scroll__button--to-top");
    rootElement = document.documentElement;
    scrollButton.addEventListener("click", scrollToTop);
    document.addEventListener("scroll", handleScroll);
  },
  false
);

// --- Functions related to scrolling effects
// TODO - Once a "segment" tab (mechanics, glitches, combat ...) is added to tech pages
// TODO -   have scroll go to that section instead of ToC.
// Checks if scroll icon should be shown to user
function handleScroll() {
  //Get current scroll position
  let scrollTotal = rootElement.scrollHeight - rootElement.clientHeight;
  //Get TOC if it exists
  let toc = document.getElementById("table-of-contents");
  let tocLocation = 0;
  if (toc != null) {
    //If TOC exists, calculate the difference between the TOC location and the top of the page
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
  //Get TOC if it exists
  let toc = document.getElementById("table-of-contents");
  let tocLocation = 0;
  if (toc != null) {
    //If TOC exists, calculate the difference between the TOC location and the top of the page
    let bodyRect = document.body.getBoundingClientRect(),
      elemRect = toc.getBoundingClientRect(),
      offset = elemRect.top - bodyRect.top;

    if (offset > 0) {
      tocLocation = offset - 100;
    }
  }
  //Scroll either to top of the page or to TOC smoothly
  rootElement.scrollTo({
    top: tocLocation,
    behavior: "smooth",
  });
}
