(()=>{function c(){var s=function(n,r){return n.children[r].innerText||n.children[r].textContent},i=function(n,r){return function(e,l){return function(t,a){return t!==""&&a!==""&&!isNaN(t)&&!isNaN(a)?t-a:t.toString().localeCompare(a)}(s(r?e:l,n),s(r?l:e,n))}};document.querySelectorAll("th").forEach(n=>n.addEventListener("click",()=>{let e=n.closest("table").querySelector("tbody");Array.from(e.querySelectorAll("tr")).sort(i(Array.from(n.parentNode.children).indexOf(n),this.asc=!this.asc)).forEach(l=>e.appendChild(l))}))}function o(){document.querySelectorAll(".spoiler").forEach(s=>{s.addEventListener("click",i=>{i.target.style.background="transparent"})})}function u(){for(var s=document.getElementsByTagName("img"),i=document.getElementById("content"),n,n=0;n<s.length;n++)i.contains(s[n])&&s[n].classList.add("content__figure")}function f(s){let i=null,n=null,r=null,e="",l=s.innerHTML.split(`
`);for(let t=0;t<l.length;t++)l[t].includes('h4 id="')?(i&&(e=e+`</div></div>
`),i=l[t].substring(l[t].indexOf('h4 id="')+7),i=i.substring(0,i.indexOf('"')),e=e+`<div class="content__h4">
`,e=e+'<button class="content__collapse" data-open="'+i+" "+n+" "+r+'"><span class="material-icons md-light md-36">remove</span></button>',e=e+l[t]+`
`,e=e+'<div class="'+i+`">
`):l[t].includes('h3 id="')?(i&&(e=e+`</div></div>
`,i=null),n&&(e=e+`</div></div>
`),n=l[t].substring(l[t].indexOf('h3 id="')+7),n=n.substring(0,n.indexOf('"')),e=e+`<div class="content__h3">
`,e=e+'<button class="content__collapse" data-open="'+n+" "+r+'"><span class="material-icons md-light md-36">expand_more</span></button>',e=e+l[t]+`
`,e=e+'<div class="'+n+`" hidden>
`):l[t].includes('h2 id="')&&!l[t].includes("table-of-contents")?(i&&(e=e+`</div></div>
`,i=null),n&&(e=e+`</div></div>
`,n=null),r&&(e=e+`</div></div>
`),r=l[t].substring(l[t].indexOf('h2 id="')+7),r=r.substring(0,r.indexOf('"')),e=e+`<div class="content__h2">
`,e=e+'<button class="content__collapse" data-open="'+r+'"><span class="material-icons md-light md-36">expand_less</span></button>',e=e+l[t]+`
`,e=e+'<div class="'+r+`">
`):e=e+l[t]+`
`;i&&(e=e+`</div></div>
`),n&&(e=e+`</div></div>
`),r&&(e=e+`</div></div>
`),s.innerHTML=e,document.querySelectorAll(".content__collapse").forEach(t=>{t.addEventListener("click",d)})}function d(s){let i=s.currentTarget.dataset.open.split(" ");for(let n=0;n<i.length;n++){targetList=document.getElementsByClassName(i[n]);for(let r of targetList)r.hidden?(r.hidden=!1,s.currentTarget.firstChild.innerHTML=="expand_more"?s.currentTarget.firstChild.innerHTML="expand_less":s.currentTarget.firstChild.innerHTML="remove"):n==0&&(r.hidden=!0,s.currentTarget.firstChild.innerHTML=="expand_less"?s.currentTarget.firstChild.innerHTML="expand_more":s.currentTarget.firstChild.innerHTML="add")}}})();
//# sourceMappingURL=style.js.map
