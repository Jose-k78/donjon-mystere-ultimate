# Reconstruit DonjonMystereUltimate.html a partir des sources.
# Usage : python build.py  (dans le dossier source/ ou a la racine du jeu)
import pathlib
here = pathlib.Path(__file__).parent
src = here / "src" if (here / "src").exists() else here
order = ["data.js", "data_ch2.js", "data_v3.js", "engine.js", "art.js", "storage.js", "ui.js", "scenes.js",
         "menus.js", "media.js", "dungeon.js", "wheel.js", "tournoi.js", "royaume.js",
         "chapitre2.js", "systemes.js", "atelier.js", "atelier2.js", "main.js"]
js = "\n".join((src / f).read_text(encoding="utf-8") for f in order)
css = (src / "style.css").read_text(encoding="utf-8")
tpl = (src / "template.html").read_text(encoding="utf-8")
out = tpl.replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
page = ('<!doctype html><html lang="fr"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0}[hidden]{display:none!important}</style></head><body>' + out + '</body></html>')
dest = here.parent / "DonjonMystereUltimate.html" if src == here else here / "DonjonMystereUltimate.html"
dest.write_text(page, encoding="utf-8")
print("OK ->", dest, len(page), "octets")
