import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('renderer', ROOT/'scripts/render_catalogue.py')
renderer=importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
class CatalogueTest(unittest.TestCase):
    def test_paused_product_removes_static_payment_links_everywhere(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp)
            for source in [*ROOT.rglob('*.html'),ROOT/'shop/products.json']:
                out=target/source.relative_to(ROOT);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(source.read_text())
            data=json.loads((target/'shop/products.json').read_text())
            data[0]['checkoutEnabled']=False
            link=data[0]['orderLink']
            (target/'shop/products.json').write_text(json.dumps(data))
            original=renderer.ROOT
            try:
                renderer.ROOT=target;renderer.render()
                for html in target.rglob('*.html'):self.assertNotIn(link,html.read_text(),str(html))
                first={p:p.read_bytes() for p in target.rglob('*.html')}
                renderer.render()
                self.assertTrue(all(p.read_bytes()==s for p,s in first.items()))
            finally:renderer.ROOT=original
