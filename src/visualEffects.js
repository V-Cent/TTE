// Global control variables
//For bottom right scroll button
var scrollButton = null;
var rootElement = null;
//For nav-bar logo
var rotateFlag = false;

//Actions taken on DOM Load
document.addEventListener(
  "DOMContentLoaded",
  function () {
    //Add nav-bar events --> logo rotation
    let titleElement = document.querySelector("#nav-bar__title");
    titleElement.addEventListener("mouseenter", startRotateLogo);
    titleElement.addEventListener("mouseleave", stopRotateLogo);

    //Add scroll button events
    scrollButton = document.querySelector("#scroll__button--to-top");
    rootElement = document.documentElement;
    scrollButton.addEventListener("click", scrollToTop);
    document.addEventListener("scroll", handleScroll);

    //Add tooltip events to every tab-bar link
    document
      .querySelectorAll(".nav-bar__tab-bar--links")
      .forEach((tabBarLink) => {
        tabBarLink.addEventListener("mouseover", () => {
          loadTooltip(tabBarLink, tabBarLink.dataset.section);
        });
        tabBarLink.addEventListener("mouseleave", () => {
          unloadTooltip(tabBarLink);
        });
      });
  },
  false
);

// --- Functions related to rotating logo
function startRotateLogo(event) {
  rotateFlag = true;
  //On mouseover, start animation
  requestAnimationFrame(rotateLogo);
}

function stopRotateLogo(event) {
  //On mouseleave, change flag so rotateLogo() doesn't loop anymore
  rotateFlag = false;
}

function rotateLogo(event) {
  if (rotateFlag) {
    //Get logo style properties
    let logo = document.querySelector("#nav-bar__title__logo");
    let st = getComputedStyle(logo, null);
    //Get transform property
    let tr = st.getPropertyValue("transform");
    let values = tr.split("(")[1].split(")")[0].split(",");
    let a = values[0];
    let b = values[1];
    //Convert angle
    let currentAngle = Math.atan2(b, a) * (180 / Math.PI);
    //Increment current angle
    let angle = 1 + currentAngle;
    if (angle < 0) {
      angle = angle + 360;
    }
    //Update style and start animation again
    logo.style.transform = "rotate(" + angle + "deg)";
    requestAnimationFrame(rotateLogo);
  }
}

// --- Functions related to tooltips
function loadTooltip(evt, tooltip) {
  //Create tooltip element
  let base = document.createElement("tooltip");
  base.id = "nav-bar__tooltip";
  let tip = document.createTextNode(tooltip);
  if (tooltip != null) {
    //Set tooltip contents
    base.innerHTML = "";
    base.appendChild(tip);
    //Remove existing tooltip if needed
    if (document.getElementsByTagName("tooltip")[0]) {
      document.getElementsByTagName("tooltip")[0].remove();
    }
    //Set tooltip location and add it to the page
    base.style.top = event.pageY + 20 + "px";
    base.style.left = event.pageX + 20 + "px";
    document.body.appendChild(base);
  }
}

function unloadTooltip(evt) {
  //Remove existing tooltip
  document.getElementsByTagName("tooltip")[0].remove();
}

// --- Functions related to the scroll
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
