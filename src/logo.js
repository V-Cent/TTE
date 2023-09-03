// logo.js controls logo animations.

// Global control variables
//For nav-bar logo
var rotateFlag = false;
var leaveCounter = 0;
var currentVelocity = 0;

//Actions taken on DOM Load
document.addEventListener(
  "DOMContentLoaded",
  function () {
    //Add nav-bar events --> logo rotation
    let titleElement = document.querySelector("#nav-bar__title");
    titleElement.addEventListener("mouseenter", startRotateLogo);
    titleElement.addEventListener("mouseleave", stopRotateLogo);

    //Add tooltip events to every tab-bar link (game icon)
    document
      .querySelectorAll(".nav-bar__tab-bar--links")
      .forEach((tabBarLink) => {
        tabBarLink.addEventListener("click", () => {
          //When clicking on any game, rotate the logo a bit
          if (!rotateFlag && leaveCounter == 0) {
            currentVelocity = 3.3;
            leaveCounter = 200;
            requestAnimationFrame(rotateLogo);
          } else {
            currentVelocity = 3.3;
            leaveCounter = 200;
          }
        });
      });
  },
  false
);

// --- Functions related to rotating logo
function startRotateLogo() {
  //On mouseover, start animation
  if (!rotateFlag && leaveCounter == 0) {
    rotateFlag = true;
    requestAnimationFrame(rotateLogo);
  } else {
    rotateFlag = true;
    leaveCounter = 200;
  }
}

function stopRotateLogo() {
  //On mouseleave, change flag so rotateLogo() makes the logo slow down
  rotateFlag = false;
}

function rotateLogo() {
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
  //Speed up if the mouse is in the logo, slow down if not
  if (rotateFlag) {
    if (currentVelocity < 1.8) {
      currentVelocity = currentVelocity + 0.06;
    }
  } else {
    if (currentVelocity > 0) {
      currentVelocity = currentVelocity - 0.03;
    }
  }

  if (currentVelocity < 0) {
    currentVelocity = 0;
  }

  if (currentAngle < 0) {
    currentAngle = currentAngle + 360;
  }

  let angle = currentVelocity + currentAngle;

  //Update style and start animation again
  logo.style.transform = "rotate(" + angle + "deg)";

  if (rotateFlag) {
    leaveCounter = 200;
    requestAnimationFrame(rotateLogo);
  } else {
    // If flag is not set, keep running for ~200 frames to show the logo slowing down
    // In reality, it will run for at most 110 frames since top speed is 3.3
    // TODO - max speed could be a bit faster, but this isn't really a priority right now...
    leaveCounter--;
    if (currentVelocity <= 0) {
      leaveCounter = 0;
    }
    if (leaveCounter > 0) {
      requestAnimationFrame(rotateLogo);
    }
  }
}
