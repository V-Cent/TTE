// ---
// helper.js, as the name implies, is for a lot of helper functions to other modules
//   main creates an instance of it which can be used for various things
//   a better alternative than sessionStorage and can also save live objects

export class Helper {
  constructor(addPageChangeEvent, fileList) {
    this.mouseDown = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.startY = 0;
    this.scrollTop = 0;
    this.scrollButton = null;
    this.rootElement = null;
    this.colorList = ["yellow", "teal", "green", "pink", "red", "blue"];
    this.versionMap = new Map();
    this.scrollToTop = this.scrollToTop.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.dragScrollElement = this.dragScrollElement.bind(this);
    this.rotateFlag = false;
    this.leaveCounter = 0;
    this.currentVelocity = 0;
    this.currentSection = null;
    this.currentDocument = null;
    this.inTechPage = false;
    this.addPageChangeEvent = addPageChangeEvent;
    this.fileList = fileList;
  }

  updateStatus(document, section, inTechPage) {
    this.currentDocument = document;
    this.currentSection = section;
    this.inTechPage = inTechPage;
    this.versionMap = new Map();
  }

  // --- Logo functions
  logoInit() {
    // Add nav-bar events --> logo rotation
    this.titleElement = document.querySelector("#nav-bar__title");
    this.titleElement.addEventListener("mouseenter", this.startRotateLogo.bind(this));
    this.titleElement.addEventListener("mouseleave", this.stopRotateLogo.bind(this));
  }

  addLogoVelocity() {
    // When clicking on any game, rotate the logo a bit
    if (!this.rotateFlag && this.leaveCounter == 0) {
      this.currentVelocity = 4;
      this.leaveCounter = 200;
      requestAnimationFrame(this.rotateLogo.bind(this));
    } else {
      this.currentVelocity = 4;
      this.leaveCounter = 200;
    }
  }

  startRotateLogo() {
    // On mouseover, start animation
    if (!this.rotateFlag && this.leaveCounter == 0) {
      this.rotateFlag = true;
      requestAnimationFrame(this.rotateLogo.bind(this));
    } else {
      this.rotateFlag = true;
      this.leaveCounter = 200;
    }
  }

  stopRotateLogo() {
    // On mouseleave, change flag so rotateLogo() makes the logo slow down
    this.rotateFlag = false;
  }

  rotateLogo() {
    // Get logo style properties
    let logo = document.querySelector("#nav-bar__title__logo");
    let st = getComputedStyle(logo, null);
    // Get transform property
    let tr = st.getPropertyValue("transform");
    let values = tr.split("(")[1].split(")")[0].split(",");
    let a = values[0];
    let b = values[1];
    // Convert angle
    let currentAngle = Math.atan2(b, a) * (180 / Math.PI);
    // Speed up if the mouse is in the logo, slow down if not
    if (this.rotateFlag) {
      if (this.currentVelocity < 1.8) {
        this.currentVelocity = this.currentVelocity + 0.06;
      }
    } else {
      if (this.currentVelocity > 0) {
        this.currentVelocity = this.currentVelocity - 0.03;
      }
    }

    if (this.currentVelocity < 0) {
      this.currentVelocity = 0;
    }

    if (currentAngle < 0) {
      currentAngle = currentAngle + 360;
    }

    let angle = this.currentVelocity + currentAngle;

    // Update style and start animation again
    logo.style.transform = "rotate(" + angle + "deg)";

    if (this.rotateFlag) {
      this.leaveCounter = 200;
      requestAnimationFrame(this.rotateLogo.bind(this));
    } else {
      // If flag is not set, keep running for a maximum of 200 frames to show the logo slowing down
      this.leaveCounter--;
      if (this.currentVelocity <= 0) {
        this.leaveCounter = 0;
      }
      if (this.leaveCounter > 0) {
        requestAnimationFrame(this.rotateLogo.bind(this));
      }
    }
  }

  // --- Scroll functions
  scrollInit() {
    //Add scroll button events (icon that appears when you pass ToC)
    this.scrollButton = document.querySelector("#scroll__button--to-top");
    this.rootElement = document.documentElement;
    this.scrollButton.addEventListener("click", this.scrollToTop);
    window.addEventListener("scroll", this.handleScroll);
  }

  // --- Functions related to scrolling effects
  // Checks if scroll icon should be shown to user
  handleScroll(event) {
    event.preventDefault();
    //Get current scroll position
    let scrollTotal = this.rootElement.scrollHeight - this.rootElement.clientHeight;
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
    if ((this.rootElement.scrollTop - tocLocation) / scrollTotal > 0.05) {
      // Show button on 5% scroll down
      this.scrollButton.classList.add("scroll__button--to-top--show");
    } else {
      // Hide button else
      this.scrollButton.classList.remove("scroll__button--to-top--show");
    }
  }

  scrollToTop() {
    //Get content selector if it exists
    let toc = document.getElementById("content__selectorbox");
    let tocLocation = 0;
    if (toc != null) {
      //If the selector exists, calculate the difference between the selector location and the top of the page
      let bodyRect = document.body.getBoundingClientRect(),
        elemRect = toc.getBoundingClientRect(),
        offset = elemRect.top - bodyRect.top;

      if (offset > 0) {
        tocLocation = offset - 20;
      }
    }
    //Scroll either to top of the page or to the selector smoothly
    window.requestAnimationFrame(() => {
      let behavior = 'smooth';
      if (navigator.userAgent.includes('Chrome')){
        let pieces = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);
        if (pieces.length >= 1){
          // Chromes versions below 130 have a bug that will interefere with scrollTo and cause it to stop mid-way.
          if (!(isNaN(pieces[1]))){
            if ((Number(pieces[1]) < 130)){
              behavior = 'auto';
            }
          } else {
            behavior = 'auto';
          }
        }
      }
      this.rootElement.scrollTo({
        top: tocLocation,
        behavior: behavior,
      });
    });
  }

  // --- Tooltip functions
  loadTooltip(tooltip, tooltipText) {
    // Create tooltip element
    let base = document.createElement("tooltip");
    base.id = "nav-bar__tooltip";
    let tip = document.createTextNode(tooltipText);
    if (tooltip != null) {
      // Set tooltip contents
      base.innerHTML = "";
      base.appendChild(tip);
      // Remove existing tooltip if needed
      if (document.getElementsByTagName("tooltip")[0]) {
        document.getElementsByTagName("tooltip")[0].remove();
      }
      // Set tooltip location and add it to the page
      let boundingBox = tooltip.getBoundingClientRect();
      base.style.top = boundingBox.bottom - 10 + "px";
      base.style.left = boundingBox.right + "px";
      document.body.appendChild(base);
    }
  }

  unloadTooltip() {
    // Remove existing tooltip
    if (document.getElementsByTagName("tooltip")[0]) {
      document.getElementsByTagName("tooltip")[0].remove();
    }
  }

  // --- Drag function for h2s and TOC
  dragScrollElement(query, direction) {
    const sliderSelector = document.querySelector(query);
    if (sliderSelector == null){
      return;
    }

    const startDraggingX = (e) => {
      this.mouseDown = true;
      this.startX = e.pageX - sliderSelector.offsetLeft;
      if (isNaN(this.startX)) {
        this.startX = e.changedTouches[0].pageX - sliderSelector.offsetLeft;
      }
      this.scrollLeft = sliderSelector.scrollLeft;
    };

    const startDraggingY = (e) => {
      this.mouseDown = true;
      this.startY = e.pageY - sliderSelector.offsetTop;
      if (isNaN(this.startY)) {
        this.startY = e.changedTouches[0].pageY - sliderSelector.offsetTop;
      }
      this.scrollTop = sliderSelector.scrollTop;
    };

    const moveX = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.mouseDown) { return; }
      const x = e.pageX - sliderSelector.offsetLeft;
      const scroll = x - this.startX;
      if (isNaN(x)) {
        const x = e.changedTouches[0].pageX - sliderSelector.offsetLeft;
        const scroll = x - this.startX;
        sliderSelector.scrollLeft = this.scrollLeft - scroll;
      } else {
        sliderSelector.scrollLeft = this.scrollLeft - scroll;
      }
    };

    const moveY = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.mouseDown) { return; }
      const y = e.pageY - sliderSelector.offsetTop;
      const scroll = y - this.startY;
      if (isNaN(y)) {
        const y = e.changedTouches[0].pageY - sliderSelector.offsetTop;
        const scroll = y - this.startY;
        sliderSelector.scrollTop = this.scrollTop - scroll;
      } else {
        sliderSelector.scrollTop = this.scrollTop - scroll;
      }
    };

    const stopDragging = (event) => {
      this.mouseDown = false;
    };

    // Add the event listeners
    if (direction == 1) {
      sliderSelector.addEventListener('mousemove', moveY, false);
      sliderSelector.addEventListener('mousedown', startDraggingY, false);
      sliderSelector.addEventListener('mouseup', stopDragging, false);
      sliderSelector.addEventListener('mouseleave', stopDragging, false);

      // For mobile
      sliderSelector.addEventListener('touchmove', moveY, false);
      sliderSelector.addEventListener('touchstart', startDraggingY, false);
      sliderSelector.addEventListener('touchend', stopDragging, false);
    } else {
      sliderSelector.addEventListener('mousemove', moveX, false);
      sliderSelector.addEventListener('mousedown', startDraggingX, false);
      sliderSelector.addEventListener('mouseup', stopDragging, false);
      sliderSelector.addEventListener('mouseleave', stopDragging, false);

      // For mobile
      sliderSelector.addEventListener('touchmove', moveX, false);
      sliderSelector.addEventListener('touchstart', startDraggingX, false);
      sliderSelector.addEventListener('touchend', stopDragging, false);
    }
  }
}
