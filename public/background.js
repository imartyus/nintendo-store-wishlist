"use strict";function e(e){chrome.storage.sync.get(["wishlist"],(({wishlist:t})=>{t&&t.items?e(t):e({items:[],lastUpdated:null,sortBy:"title",sortOrder:"asc"})}))}function t(t,s=!1){return new Promise((n=>{s?e((e=>{chrome.storage.sync.set({wishlist:Object.assign(Object.assign({},e),t)},(()=>{n()}))})):chrome.storage.sync.set({wishlist:t},(()=>{n()}))}))}let s;chrome.storage.sync.get(["locale"],(function({locale:e}){s=e||{}})),chrome.alarms.create("wishlistPoll",{periodInMinutes:60}),chrome.alarms.onAlarm.addListener((function(){return new Promise((s=>{e((e=>{if(!e.items.length)return s();const n=e.items.reduce(((e,t)=>e+`${""===e?"":","}${t.titleId}`),"");var c;(c=n,new Promise(((e,t)=>{chrome.storage.sync.get(["locale"],(async function({locale:s}){const n=s.country||"US",o=s.lang||"en";try{const t=await fetch(`https://api.ec.nintendo.com/v1/price?country=${n}&lang=${o}&ids=${c}`),s=await t.json();e(s.prices)}catch(e){t(e)}}))}))).then((n=>{const c=e.items.map((e=>{const{discount_price:t,regular_price:s}=n.find((t=>t.title_id===e.titleId));return Object.assign(Object.assign({},e),{price:t?t.amount:s.amount,ogPrice:t?s.amount:"",saleEnds:t?`Sale ends ${new Date(t.end_datetime).toLocaleString()}`:"",outdated:!1})})),o={items:c,lastUpdated:Date.now()};!function(e){const t=e.reduce(((e,t)=>t.ogPrice?e+1:e),0);chrome.action.setBadgeText({text:t?`${t}`:""}),chrome.action.setBadgeBackgroundColor({color:"#e60012"})}(c),t(o,!0).then(s)})).catch((n=>{console.log("Data refresh error: ",n);t({items:e.items.map((e=>Object.assign(Object.assign({},e),{outdated:!0}))),lastUpdated:Date.now()},!0).then(s)}))}))}))}));chrome.webRequest.onCompleted.addListener((function(e){const t=new URL(e.url),n=t.searchParams.get("country"),c=t.searchParams.get("lang");s&&s.country===n&&s.lang===c||chrome.storage.sync.set({locale:{country:n,lang:c}})}),{urls:["https://api.ec.nintendo.com/v1/price?*"]});
