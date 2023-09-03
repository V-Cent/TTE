(()=>{function o(){var i=function(n,l){return n.children[l].innerText||n.children[l].textContent},r=function(n,l){return function(e,s){return function(t,a){return t!==""&&a!==""&&!isNaN(t)&&!isNaN(a)?t-a:t.toString().localeCompare(a)}(i(l?e:s,n),i(l?s:e,n))}};document.querySelectorAll("th").forEach(n=>n.addEventListener("click",()=>{let e=n.closest("table").querySelector("tbody");Array.from(e.querySelectorAll("tr")).sort(r(Array.from(n.parentNode.children).indexOf(n),this.asc=!this.asc)).forEach(s=>e.appendChild(s))}))}function c(){document.querySelectorAll(".spoiler").forEach(i=>{i.addEventListener("click",r=>{r.target.style.background="transparent"})})}function u(){for(var i=document.getElementsByTagName("img"),r=document.getElementById("content"),n,n=0;n<i.length;n++)r.contains(i[n])&&i[n].classList.add("content__figure")}function f(){document.querySelectorAll("input").forEach(i=>{i.checked&&(i.parentElement.style.textDecorationLine="line-through")})}function p(i){let r=null,n=null,l=null,e="",s=i.innerHTML.split(`
`);for(let t=0;t<s.length;t++)s[t].includes('h4 id="')?(r&&(e=e+`</div></div>
`),r=s[t].substring(s[t].indexOf('h4 id="')+7),r=r.substring(0,r.indexOf('"')),e=e+`<div class="content__h4">
`,e=e+'<button class="content__collapse" data-open="'+r+" "+n+" "+l+'"><span class="material-icons md-light md-36">remove</span></button>',e=e+s[t]+`
`,e=e+'<div class="'+r+`">
`):s[t].includes('h3 id="')?(r&&(e=e+`</div></div>
`,r=null),n&&(e=e+`</div></div>
`),n=s[t].substring(s[t].indexOf('h3 id="')+7),n=n.substring(0,n.indexOf('"')),e=e+`<div class="content__h3">
`,e=e+'<button class="content__collapse" data-open="'+n+" "+l+'"><span class="material-icons md-light md-36">expand_more</span></button>',e=e+s[t]+`
`,e=e+'<div class="'+n+`" hidden>
`):s[t].includes('h2 id="')&&!s[t].includes("table-of-contents")?(r&&(e=e+`</div></div>
`,r=null),n&&(e=e+`</div></div>
`,n=null),l&&(e=e+`</div></div>
`),l=s[t].substring(s[t].indexOf('h2 id="')+7),l=l.substring(0,l.indexOf('"')),e=e+`<div class="content__h2">
`,e=e+'<button class="content__collapse" data-open="'+l+'"><span class="material-icons md-light md-36">expand_less</span></button>',e=e+s[t]+`
`,e=e+'<div class="'+l+`">
`):e=e+s[t]+`
`;r&&(e=e+`</div></div>
`),n&&(e=e+`</div></div>
`),l&&(e=e+`</div></div>
`),i.innerHTML=e,document.querySelectorAll(".content__collapse").forEach(t=>{t.addEventListener("click",d)})}function d(i){let r=i.currentTarget.dataset.open.split(" ");for(let n=0;n<r.length;n++){targetList=document.getElementsByClassName(r[n]);for(let l of targetList)l.hidden?(l.hidden=!1,i.currentTarget.firstChild.innerHTML=="expand_more"?i.currentTarget.firstChild.innerHTML="expand_less":i.currentTarget.firstChild.innerHTML="remove"):n==0&&(l.hidden=!0,i.currentTarget.firstChild.innerHTML=="expand_less"?i.currentTarget.firstChild.innerHTML="expand_more":i.currentTarget.firstChild.innerHTML="add")}}})();
//# sourceMappingURL=style.js.map
