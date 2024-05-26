(()=>{var b=[["yellow","#f8d959"],["pink","#fe796f"],["teal","#45c9c9"],["green","#58f15b"],["red","#e74a41"],["blue","#205aaa"]];function y(){var s=function(t,r){return t.children[r].innerText||t.children[r].textContent},l=function(t,r){return function(e,c){return function(d,i){return d!==""&&i!==""&&!isNaN(d)&&!isNaN(i)?d-i:d.toString().localeCompare(i)}(s(r?e:c,t),s(r?c:e,t))}};document.querySelectorAll("th").forEach(t=>t.addEventListener("click",()=>{let e=t.closest("table").querySelector("tbody");Array.from(e.querySelectorAll("tr")).sort(l(Array.from(t.parentNode.children).indexOf(t),this.asc=!this.asc)).forEach(c=>e.appendChild(c))}))}function E(){document.querySelectorAll(".spoiler").forEach(s=>{s.addEventListener("click",l=>{l.target.style.background="transparent"})})}function C(){for(var s=document.getElementsByTagName("img"),l=document.getElementById("content"),t,t=0;t<s.length;t++)l.contains(s[t])&&s[t].classList.add("content__figure")}var x=!1,u=[],g,p;function N(s){u=[];let l=null,t=null,r=null,e="",c="",d=!0,i=s.innerHTML.split(`
`),H=document.getElementById("content");for(let n=0;n<i.length;n++)if(i[n].includes('h4 id="')){l&&(e=e+`</div></div>
`),l=i[n].substring(i[n].indexOf('h4 id="')+7),l=l.substring(0,l.indexOf('"')),e=e+`<div class="content__h4">
`;let a=i[n].indexOf('h4 id="')+7+l.length+1,v=' data-open="'+l+" "+t+" "+r+'"',T=i[n].substr(0,a)+v+i[n].substr(a);e=e+T+`
`,e=e+'<div class="'+l+`">
`}else i[n].includes('h3 id="')?(l&&(e=e+`</div></div>
`,l=null),t&&(e=e+`<hr class="content__h3--divider" draggable="false" /></div></div>
`),t=i[n].substring(i[n].indexOf('h3 id="')+7),t=t.substring(0,t.indexOf('"')),e=e+`<div class="content__h3">
`,e=e+'<button class="content__collapse" data-open="'+t+" "+r+'"><span class="material-symbols-rounded">expand_circle_up</span></button>',e=e+i[n]+`
`,e=e+'<div class="'+t+`">
`):i[n].includes('h2 id="')?(d=!1,l&&(e=e+`</div></div>
`,l=null),t&&(e=e+`</div></div>
`,t=null),r&&(e=e+`</div></div>
`,u.push([r,currentH2Text,e]),e=""),r=i[n].substring(i[n].indexOf('h2 id="')+7),r=r.substring(0,r.indexOf('"')),currentH2Text=i[n].substring(i[n].indexOf('">')+2),currentH2Text=currentH2Text.substring(0,currentH2Text.indexOf("</h2>")),e=e+'<div class="content__h2" id="'+r+`">
`,e=e+'<div class="'+r+`">
`):d?c=c+i[n]+`
`:e=e+i[n]+`
`;l&&(e=e+`</div></div>
`),t&&(e=e+`</div></div>
`),r&&(e=e+`</div></div>
`,u.push([r,currentH2Text,e]),e="");var f='<div id="content__selector"><div id="content__selectorbox">';let h=0;for(;h<u.length;)h2Tag=u[h][0],h2Text=u[h][1],h2Color=b[h%b.length],f=f+'<div class="content__selectorbox--item" data-open="'+h2Tag+'" data-highlight="'+h2Color[1]+'">',f=f+h2Text+"</div>",h++;f=f+'</div><hr id="content__selectorhr"></hr></div><div id="content__currenth2"></div>',u.length>0?s.innerHTML=c+f:s.innerHTML=c;let o=document.querySelector("#content__selectorbox"),m=function(n){x=!0,g=n.pageX-o.offsetLeft,isNaN(g)&&(g=n.changedTouches[0].pageX-o.offsetLeft),p=o.scrollLeft},L=function(n){x=!1};o.addEventListener("mousemove",n=>{if(n.preventDefault(),n.stopPropagation(),!x)return;let a=n.pageX-o.offsetLeft,v=a-g;if(isNaN(a)){let _=n.changedTouches[0].pageX-o.offsetLeft-g;o.scrollLeft=p-_}else o.scrollLeft=p-v}),o.addEventListener("mousedown",m,!1),o.addEventListener("mouseup",L,!1),o.addEventListener("mouseleave",L,!1),o.addEventListener("touchmove",n=>{if(n.preventDefault(),n.stopPropagation(),!x)return;let a=n.pageX-o.offsetLeft,v=a-g;if(isNaN(a)){let _=n.changedTouches[0].pageX-o.offsetLeft-g;o.scrollLeft=p-_}else o.scrollLeft=p-v}),o.addEventListener("touchstart",m,!1),o.addEventListener("touchend",L,!1),H.style.visibility="visible"}function M(s){let l=s.currentTarget.dataset.open.split(" ");for(let t=0;t<l.length;t++){targetList=document.getElementsByClassName(l[t]);for(let r of targetList)r.hidden?(r.hidden=!1,s.currentTarget.firstChild.innerHTML=="expand_circle_down"?s.currentTarget.firstChild.innerHTML="expand_circle_up":s.currentTarget.firstChild.innerHTML="remove"):t==0&&(r.hidden=!0,s.currentTarget.firstChild.innerHTML=="expand_circle_up"?s.currentTarget.firstChild.innerHTML="expand_circle_down":s.currentTarget.firstChild.innerHTML="add")}}})();
//# sourceMappingURL=style.js.map
