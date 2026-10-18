const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname,'../assets/site.js'),'utf8');
function setup() {
  const nodes = {};
  for (const key of ['h3 a,h2 a','.product-description','.product-price','.product-delivery','.product-image img','.order-link']) {
    nodes[key] = {textContent:'',href:'https://buy.stripe.com/old',setAttribute(){},removeAttribute(){}};
  }
  const region = {dataset:{productRegion:'test'},querySelector:s=>nodes[s]||null};
  const document = {querySelector:()=>null,getElementById:()=>null,addEventListener(){},querySelectorAll:s=>s.includes('data-product-region')?[region]:[]};
  const ctx = vm.createContext({document,URL,URLSearchParams,window:{location:{search:''}}});
  vm.runInContext(source,ctx);
  return {ctx,nodes};
}
const product = {id:'test',name:'Test product',price:'£12.34',delivery:'£2.99',orderLink:'https://buy.stripe.com/example',checkoutEnabled:true,image:'/photo.png'};
test('valid checkout and detail delivery/image refresh',()=>{
  const {ctx,nodes}=setup();ctx.applyProduct(product);
  assert.equal(nodes['.order-link'].href,product.orderLink);
  assert.equal(nodes['.product-delivery'].textContent,'+ £2.99 UK delivery');
  assert.equal(nodes['.product-image img'].src,'/photo.png');
});
test('disabled, missing price and invalid hosts replace stale payment links',()=>{
  for (const change of [{checkoutEnabled:false},{checkoutEnabled:undefined},{price:null},{price:'£0.00'},{orderLink:'https://buy.stripe.com.evil.example/a'},{orderLink:'https://user@buy.stripe.com/a'},{orderLink:'http://buy.stripe.com/a'}]) {
    const {ctx,nodes}=setup();ctx.applyProduct({...product,...change});
    assert.equal(nodes['.order-link'].href,'mailto:info@circuitfoxtech.com');
    assert.equal(nodes['.order-link'].textContent,'Enquire to order');
  }
});
test('build enquiry remains enquiry-only',()=>{
  const {ctx,nodes}=setup();ctx.applyProduct({...product,enquiryOnly:true,price:null,orderLink:'/?build=Standard%20Build#contact'});
  assert.equal(nodes['.order-link'].href,'/?build=Standard%20Build#contact');
  assert.equal(nodes['.order-link'].textContent,'Enquire now');
});
