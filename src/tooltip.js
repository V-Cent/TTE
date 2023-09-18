// tooltip.js controls tooltips.

function tooltipInit() {
  document
  .querySelectorAll(".nav-bar__tab-bar--links")
  .forEach((tabBarLink) => {
    tabBarLink.addEventListener("mouseover", () => {
      loadTooltip(tabBarLink, tabBarLink.dataset.section);
    });
    tabBarLink.addEventListener("mouseleave", () => {
      unloadTooltip();
    });
  });
}

if (document.readyState !== "loading") {
  tooltipInit(); // Or setTimeout(tooltipInit, 0);
} else {
  document.addEventListener("DOMContentLoaded", tooltipInit);
}

// --- Functions related to tooltips
export function loadTooltip(tooltip, tooltipText) {
  //Create tooltip element
  let base = document.createElement("tooltip");
  base.id = "nav-bar__tooltip";
  let tip = document.createTextNode(tooltipText);
  if (tooltip != null) {
    //Set tooltip contents
    base.innerHTML = "";
    base.appendChild(tip);
    //Remove existing tooltip if needed
    if (document.getElementsByTagName("tooltip")[0]) {
      document.getElementsByTagName("tooltip")[0].remove();
    }
    //Set tooltip location and add it to the page
    let boundingBox = tooltip.getBoundingClientRect();
    base.style.top = boundingBox.bottom - 10 + "px";
    base.style.left = boundingBox.right + "px";
    document.body.appendChild(base);
  }
}

export function unloadTooltip() {
  //Remove existing tooltip
  if (document.getElementsByTagName("tooltip")[0]) {
    document.getElementsByTagName("tooltip")[0].remove();
  }
}
