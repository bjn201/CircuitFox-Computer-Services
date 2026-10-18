"""Refresh published HTML from shop/products.json. Run before publishing changes."""
from pathlib import Path
from html import escape
import json
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]

def checkout_ready(product):
    url = urlsplit(product.get('orderLink') or '')
    return (product.get('checkoutEnabled') is True
            and bool(re.fullmatch(r'£\d+\.\d{2}', product.get('price') or ''))
            and float(product['price'][1:]) > 0
            and url.scheme == 'https' and url.netloc == 'buy.stripe.com'
            and len(url.path) > 1 and not url.query and not url.fragment)

def update_html(html, product, detail=False):
    def para(cls, value):
        nonlocal html
        html = re.sub(r'(<p class="[^\"]*\b'+cls+r'\b[^\"]*">).*?(</p>)',
                      lambda m: m[1]+escape(value)+m[2], html, flags=re.S)
    para('product-price', product.get('price') or '')
    para('product-description', product.get('description') or '')
    if 'specs' in product:
        para('product-specs', product['specs'])
    if product.get('delivery'):
        para('product-delivery', '+ '+product['delivery']+' UK delivery')
    if product.get('image'):
        html = re.sub(r'<img\b[^>]*>', lambda m: re.sub(r'\b(src|alt)="[^\"]*"',
            lambda a: a[1]+'="'+escape(product['image'] if a[1]=='src' else product.get('imageAlt',product['name']),quote=True)+'"',m[0]), html)
    def link(match):
        tag = match[0]
        tag = re.sub(r'\s(?:href|data-placeholder-link|aria-disabled)="[^\"]*"|\sdata-placeholder-link(?=\s|>)','',tag)
        if product.get('enquiryOnly'):
            dest=product['orderLink']; label='Enquire now'; extra=''
        elif checkout_ready(product):
            dest=product['orderLink']; label=product.get('orderLabel','Buy now'); extra=''
        else:
            dest='mailto:info@circuitfoxtech.com'; label='Enquire to order'; extra=' data-placeholder-link'
        tag=re.sub(r'>.*?</a>$',' href="'+escape(dest,quote=True)+'"'+extra+'>'+label+'</a>',tag,flags=re.S)
        return tag
    return re.sub(r'<a\b[^>]*class="[^\"]*\border-link\b[^\"]*"[^>]*>.*?</a>',link,html,flags=re.S)

def render():
    products=json.loads((ROOT/'shop/products.json').read_text())
    by_id={p['id']:p for p in products}
    for path in ROOT.rglob('*.html'):
        html=path.read_text()
        html=re.sub(r'<article\b[^>]*data-product="([^\"]+)"[^>]*>.*?</article>',
            lambda m:update_html(m[0],by_id[m[1]]) if m[1] in by_id else m[0],html,flags=re.S)
        if path.parent.parent == ROOT/'shop' and path.parent.name in by_id:
            product=by_id[path.parent.name]
            html=html.replace('<div class="container two-columns">','<div class="container two-columns" data-product-region="'+product['id']+'">')
            html=html.replace('<p class="lead">','<p class="lead product-description">')
            html=re.sub(r'<meta name="description" content="[^\"]*">','<meta name="description" content="'+escape(product['description'],quote=True)+'">',html)
            # The detail photo is a sibling of the product article.
            html=update_html(html,product,detail=True)
            if product['id']=='microsd':
                html=html.replace('<p class="small">Illustrative image. Brand, capacity and speed confirmed before order.</p>','')
        path.write_text(html)

if __name__=='__main__':
    render()
