
'use strict';
const menuButton=document.querySelector('.menu-toggle');
const menu=document.getElementById('main-menu');
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.classList.toggle('menu-open',open)});
document.addEventListener('click',event=>{const link=event.target.closest('[data-placeholder-link]');if(!link)return;event.preventDefault();const status=document.getElementById('link-status');status.textContent='Contact info@circuitfoxtech.com or call 07410 582082 for help.';status.hidden=false});
const form=document.getElementById('contact-form');
form?.addEventListener('submit',event=>{event.preventDefault();const name=form.elements.namedItem('name').value.trim();const email=form.elements.namedItem('email').value.trim();const message=form.elements.namedItem('message').value.trim();const body=`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;window.location.href=`mailto:info@circuitfoxtech.com?subject=${encodeURIComponent('Quote request — '+name)}&body=${encodeURIComponent(body)}`});
const filters=[...document.querySelectorAll('[data-filter]')];
const filterProducts=[...document.querySelectorAll('#shop-products > [data-category]')];
function setCategory(category,updateUrl=false){if(!filters.some(b=>b.dataset.filter===category))category='all';filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));let count=0;filterProducts.forEach(p=>{p.hidden=category!=='all'&&p.dataset.category!==category;if(!p.hidden)count++});const counter=document.getElementById('filter-count');if(counter)counter.textContent=count+' products';const detail=document.getElementById('portable-category-link');if(detail)detail.hidden=category!=='portable-power';if(updateUrl){const url=new URL(window.location.href);category==='all'?url.searchParams.delete('category'):url.searchParams.set('category',category);history.replaceState(null,'',url)}}
if(filters.length){setCategory(new URL(window.location.href).searchParams.get('category')||'all');filters.forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.filter,true)));window.addEventListener('popstate',()=>setCategory(new URL(window.location.href).searchParams.get('category')||'all'))}
const capacity=document.getElementById('capacity'),load=document.getElementById('load'),usable=document.getElementById('usable'),result=document.getElementById('runtime-result');
function updateRuntime(){const c=Number(capacity.value),l=Number(load.value),u=Number(usable.value);if(!Number.isFinite(c)||!Number.isFinite(l)||!Number.isFinite(u)||c<=0||l<=0||u<=0||u>100){result.textContent='Enter positive values, with usable energy up to 100%.';return}const hours=c*(u/100)/l;result.textContent='About '+Number(hours.toFixed(1))+' hours'}
if(result){[capacity,load,usable].forEach(input=>input.addEventListener('input',updateRuntime));document.querySelectorAll('[data-load]').forEach(button=>button.addEventListener('click',()=>{load.value=button.dataset.load;updateRuntime()}));updateRuntime()}
function checkoutReady(product) {
  if (product.checkoutEnabled !== true || typeof product.price !== 'string' ||
      !/^£\d+\.\d{2}$/.test(product.price) || Number(product.price.slice(1)) <= 0) return false;
  try {
    const url = new URL(product.orderLink);
    return url.protocol === 'https:' && url.host === 'buy.stripe.com' &&
      !url.username && !url.password && url.pathname.length > 1 && !url.search && !url.hash;
  } catch { return false; }
}
function applyProduct(product) {
  const regions = document.querySelectorAll('.product-card[data-product], [data-product-region]');
  for (const region of regions) {
    if ((region.dataset.productRegion || region.dataset.product) !== product.id) continue;
    const heading = region.querySelector('h3 a,h2 a') || region.querySelector('h3,h2,h1');
    if (heading) heading.textContent = product.name;
    for (const [selector, key] of [['.product-description', 'description'], ['.product-specs', 'specs'], ['.product-price', 'price']]) {
      const element = region.querySelector(selector);
      if (element && typeof product[key] === 'string') element.textContent = product[key];
    }
    const delivery = region.querySelector('.product-delivery');
    if (delivery && typeof product.delivery === 'string') delivery.textContent = '+ ' + product.delivery + ' UK delivery';
    const image = region.querySelector('.product-image img');
    if (image && typeof product.image === 'string' && product.image.startsWith('/') && !product.image.startsWith('//')) {
      image.src = product.image;
      image.alt = product.imageAlt || product.name;
    }
    const link = region.querySelector('.order-link');
    if (!link) continue;
    if (product.enquiryOnly === true && typeof product.orderLink === 'string' && product.orderLink.startsWith('/?build=')) {
      link.href = product.orderLink;
      link.textContent = 'Enquire now';
      link.removeAttribute('data-placeholder-link');
    } else if (checkoutReady(product)) {
      link.href = product.orderLink;
      link.textContent = product.orderLabel || 'Buy now';
      link.removeAttribute('data-placeholder-link');
    } else {
      link.href = 'mailto:info@circuitfoxtech.com';
      link.textContent = 'Enquire to order';
      link.setAttribute('data-placeholder-link', '');
    }
  }
}
if (document.querySelector('[data-product]')) {
  fetch('/shop/products.json').then(response => {
    if (!response.ok) throw new Error('Catalogue unavailable');
    return response.json();
  }).then(products => {
    if (Array.isArray(products)) products.forEach(applyProduct);
  }).catch(() => {
    // Generated HTML retains the last published catalogue when the fetch fails.
  });
}

const requestedBuild=new URLSearchParams(window.location.search).get('build');
if(form&&["Standard Build","Gaming Lite","Gaming Plus","Extreme Build"].includes(requestedBuild)){const message=form.elements.namedItem('message');if(!message.value)message.value='I am interested in the '+requestedBuild+'.\n\nMy budget:\nGames or apps I use:\nPreferred style or other requirements:';const label=document.querySelector('label[for="contact-message"]');if(label)label.textContent='Tell us about your build';}
