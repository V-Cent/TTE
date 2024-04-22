(()=>{function y(){var l=function(t,r){return t.children[r].innerText||t.children[r].textContent},s=function(t,r){return function(e,a){return function(c,i){return c!==""&&i!==""&&!isNaN(c)&&!isNaN(i)?c-i:c.toString().localeCompare(i)}(l(r?e:a,t),l(r?a:e,t))}};document.querySelectorAll("th").forEach(t=>t.addEventListener("click",()=>{let e=t.closest("table").querySelector("tbody");Array.from(e.querySelectorAll("tr")).sort(s(Array.from(t.parentNode.children).indexOf(t),this.asc=!this.asc)).forEach(a=>e.appendChild(a))}))}function E(){document.querySelectorAll(".spoiler").forEach(l=>{l.addEventListener("click",s=>{s.target.style.background="transparent"})})}function C(){for(var l=document.getElementsByTagName("img"),s=document.getElementById("content"),t,t=0;t<l.length;t++)s.contains(l[t])&&l[t].classList.add("content__figure")}var x=!1,u=[],h,p;function N(l){u=[];let s=null,t=null,r=null,e="",a="",c=!0,i=l.innerHTML.split(`
`),H=document.getElementById("content");for(let n=0;n<i.length;n++)if(i[n].includes('h4 id="')){s&&(e=e+`</div></div>
`),s=i[n].substring(i[n].indexOf('h4 id="')+7),s=s.substring(0,s.indexOf('"')),e=e+`<div class="content__h4">
`;let d=i[n].indexOf('h4 id="')+7+s.length+1,v=' data-open="'+s+" "+t+" "+r+'"',L=i[n].substr(0,d)+v+i[n].substr(d);e=e+L+`
`,e=e+'<div class="'+s+`">
`}else i[n].includes('h3 id="')?(s&&(e=e+`</div></div>
`,s=null),t&&(e=e+`</div></div>
`),t=i[n].substring(i[n].indexOf('h3 id="')+7),t=t.substring(0,t.indexOf('"')),e=e+`<div class="content__h3">
`,e=e+'<button class="content__collapse" data-open="'+t+" "+r+'"><span class="material-symbols-rounded">expand_more</span></button>',e=e+i[n]+`
`,e=e+'<div class="'+t+`" hidden>
`):i[n].includes('h2 id="')?(c=!1,s&&(e=e+`</div></div>
`,s=null),t&&(e=e+`</div></div>
`,t=null),r&&(e=e+`</div></div>
`,u.push([r,currentH2Text,e]),e=""),r=i[n].substring(i[n].indexOf('h2 id="')+7),r=r.substring(0,r.indexOf('"')),currentH2Text=i[n].substring(i[n].indexOf('">')+2),currentH2Text=currentH2Text.substring(0,currentH2Text.indexOf("</h2>")),e=e+'<div class="content__h2" id="'+r+`">
`,e=e+'<div class="'+r+`">
`):c?a=a+i[n]+`
`:e=e+i[n]+`
`;s&&(e=e+`</div></div>
`),t&&(e=e+`</div></div>
`),r&&(e=e+`</div></div>
`,u.push([r,currentH2Text,e]),e="");let b=[["yellow","#f8d959"],["pink","#fe796f"],["teal","#45c9c9"],["green","#58f15b"],["red","#e74a41"],["blue","#205aaa"]];var f='<div id="content__selector"><div id="content__selectorbox">';let g=0;for(;g<u.length;)h2Tag=u[g][0],h2Text=u[g][1],h2Color=b[g%b.length],f=f+'<div class="content__selectorbox--item" data-open="'+h2Tag+'" data-highlight="'+h2Color[1]+'">',f=f+h2Text+"</div>",g++;f=f+'</div><hr id="content__selectorhr"></hr></div><div id="content__currenth2"></div>',u.length>0?l.innerHTML=a+f:l.innerHTML=a;let o=document.querySelector("#content__selectorbox"),_=function(n){x=!0,h=n.pageX-o.offsetLeft,isNaN(h)&&(h=n.changedTouches[0].pageX-o.offsetLeft),p=o.scrollLeft},m=function(n){x=!1};o.addEventListener("mousemove",n=>{if(n.preventDefault(),n.stopPropagation(),!x)return;let d=n.pageX-o.offsetLeft,v=d-h;if(isNaN(d)){let T=n.changedTouches[0].pageX-o.offsetLeft-h;o.scrollLeft=p-T}else o.scrollLeft=p-v}),o.addEventListener("mousedown",_,!1),o.addEventListener("mouseup",m,!1),o.addEventListener("mouseleave",m,!1),o.addEventListener("touchmove",n=>{if(n.preventDefault(),n.stopPropagation(),!x)return;let d=n.pageX-o.offsetLeft,v=d-h;if(isNaN(d)){let T=n.changedTouches[0].pageX-o.offsetLeft-h;o.scrollLeft=p-T}else o.scrollLeft=p-v}),o.addEventListener("touchstart",_,!1),o.addEventListener("touchend",m,!1),H.style.visibility="visible"}function M(l){let s=l.currentTarget.dataset.open.split(" ");for(let t=0;t<s.length;t++){targetList=document.getElementsByClassName(s[t]);for(let r of targetList)r.hidden?(r.hidden=!1,l.currentTarget.firstChild.innerHTML=="expand_more"?l.currentTarget.firstChild.innerHTML="expand_less":l.currentTarget.firstChild.innerHTML="remove"):t==0&&(r.hidden=!0,l.currentTarget.firstChild.innerHTML=="expand_less"?l.currentTarget.firstChild.innerHTML="expand_more":l.currentTarget.firstChild.innerHTML="add")}}})();
//# sourceMappingURL=style.js.map
