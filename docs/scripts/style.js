(()=>{function o(){var s=function(n,i){return n.children[i].innerText||n.children[i].textContent},r=function(n,i){return function(e,l){return function(t,a){return t!==""&&a!==""&&!isNaN(t)&&!isNaN(a)?t-a:t.toString().localeCompare(a)}(s(i?e:l,n),s(i?l:e,n))}};document.querySelectorAll("th").forEach(n=>n.addEventListener("click",()=>{let e=n.closest("table").querySelector("tbody");Array.from(e.querySelectorAll("tr")).sort(r(Array.from(n.parentNode.children).indexOf(n),this.asc=!this.asc)).forEach(l=>e.appendChild(l))}))}function c(){document.querySelectorAll(".spoiler").forEach(s=>{s.addEventListener("click",r=>{r.target.style.background="transparent"})})}function u(){for(var s=document.getElementsByTagName("img"),r=document.getElementById("content"),n,n=0;n<s.length;n++)r.contains(s[n])&&s[n].classList.add("content__figure")}function f(s){let r=null,n=null,i=null,e="",l=s.innerHTML.split(`
`);for(let t=0;t<l.length;t++)l[t].includes('h4 id="')?(r&&(e=e+`</div></div>
`),r=l[t].substring(l[t].indexOf('h4 id="')+7),r=r.substring(0,r.indexOf('"')),e=e+`<div class="content__h4">
`,e=e+'<button class="content__collapse" data-open="'+r+" "+n+" "+i+'"><span class="material-symbols-rounded">remove</span></button>',e=e+l[t]+`
`,e=e+'<div class="'+r+`">
`):l[t].includes('h3 id="')?(r&&(e=e+`</div></div>
`,r=null),n&&(e=e+`</div></div>
`),n=l[t].substring(l[t].indexOf('h3 id="')+7),n=n.substring(0,n.indexOf('"')),e=e+`<div class="content__h3">
`,e=e+'<button class="content__collapse" data-open="'+n+" "+i+'"><span class="material-symbols-rounded">expand_more</span></button>',e=e+l[t]+`
`,e=e+'<div class="'+n+`" hidden>
`):l[t].includes('h2 id="')&&!l[t].includes("table-of-contents")?(r&&(e=e+`</div></div>
`,r=null),n&&(e=e+`</div></div>
`,n=null),i&&(e=e+`</div></div>
`),i=l[t].substring(l[t].indexOf('h2 id="')+7),i=i.substring(0,i.indexOf('"')),e=e+`<div class="content__h2">
`,e=e+'<button class="content__collapse" data-open="'+i+'"><span class="material-symbols-rounded">expand_less</span></button>',e=e+l[t]+`
`,e=e+'<div class="'+i+`">
`):e=e+l[t]+`
`;r&&(e=e+`</div></div>
`),n&&(e=e+`</div></div>
`),i&&(e=e+`</div></div>
`),s.innerHTML=e,document.querySelectorAll(".content__collapse").forEach(t=>{t.addEventListener("click",d)})}function d(s){let r=s.currentTarget.dataset.open.split(" ");for(let n=0;n<r.length;n++){targetList=document.getElementsByClassName(r[n]);for(let i of targetList)i.hidden?(i.hidden=!1,s.currentTarget.firstChild.innerHTML=="expand_more"?s.currentTarget.firstChild.innerHTML="expand_less":s.currentTarget.firstChild.innerHTML="remove"):n==0&&(i.hidden=!0,s.currentTarget.firstChild.innerHTML=="expand_less"?s.currentTarget.firstChild.innerHTML="expand_more":s.currentTarget.firstChild.innerHTML="add")}}})();
//# sourceMappingURL=style.js.map
