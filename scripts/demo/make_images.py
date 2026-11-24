"""Draw the demo items' photos (demo/images/<item id>_01.jpg and _02.jpg) from demo/data.json.

Made-up studio-style shots of invented records, game cartridges, DVDs, books and cards,
drawn with HTML and CSS and photographed with Playwright's Chromium. Run once; the images
are committed so every version's capture uses the same ones:

    docker run --rm -v <repo>:/repo -w /repo mcr.microsoft.com/playwright/python:v1.56.0-noble \
        python scripts/demo/make_images.py
"""

from __future__ import annotations

import html
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "demo" / "images"

BACKDROP = """
body { margin:0; width:800px; height:800px; display:flex; align-items:center; justify-content:center;
       background: radial-gradient(circle at 50% 35%, #fbfaf7 0%, #e9e5dd 60%, #d6d0c4 100%);
       font-family: 'DejaVu Sans', Arial, sans-serif; overflow:hidden; }
.shadow { box-shadow: 0 30px 40px -18px rgba(0,0,0,.45), 0 8px 14px rgba(0,0,0,.18); }
"""


def esc(s: str) -> str:
    return html.escape(s or "")


def record(a: dict, back: bool) -> str:
    if back:
        return f"""<div class="shadow" style="width:560px;height:560px;background:{a['bg']};filter:saturate(.7) brightness(.85);
          position:relative;color:{a['fg']};padding:50px;box-sizing:border-box">
          <div style="font-size:30px;font-weight:bold">{esc(a['sub'])}</div>
          <div style="margin-top:30px;font-size:19px;line-height:1.9;opacity:.9">
            Side A<br>1. Lantern Light 3:42<br>2. Tidewater 4:10<br>3. North of Here 3:55<br>
            Side B<br>1. Paper Boats 4:21<br>2. Last Ferry 5:02<br>3. Harbor Song 3:30</div>
          <div style="position:absolute;right:50px;bottom:50px;width:150px;height:60px;
            background:repeating-linear-gradient(90deg,#111 0 3px,#fff 3px 6px,#111 6px 7px,#fff 7px 11px)"></div></div>"""
    return f"""<div style="position:relative;width:620px;height:560px">
      <div class="shadow" style="position:absolute;left:150px;top:20px;width:520px;height:520px;border-radius:50%;
        background:radial-gradient(circle,#c33 0 70px,#111 71px 80px,#222 81px,#0b0b0b 100%)"></div>
      <div class="shadow" style="position:absolute;left:0;top:0;width:560px;height:560px;background:{a['bg']};
        display:flex;flex-direction:column;justify-content:flex-end;padding:44px;box-sizing:border-box;overflow:hidden">
        <div style="position:absolute;left:-80px;top:-60px;width:420px;height:420px;border-radius:50%;
          background:{a['fg']};opacity:.18"></div>
        <div style="position:absolute;right:40px;top:60px;width:200px;height:200px;border:10px solid {a['fg']};
          opacity:.45;transform:rotate(18deg)"></div>
        <div style="color:{a['fg']};font-size:46px;font-weight:bold;letter-spacing:2px;line-height:1.05">{esc(a['text'])}</div>
        <div style="color:{a['fg']};font-size:26px;margin-top:12px;opacity:.85">{esc(a['sub'])}</div></div></div>"""


def cartridge(a: dict, back: bool) -> str:
    label = (f"""<div style="width:330px;height:250px;background:{a['bg']};border-radius:8px;margin:0 auto;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        background-image:linear-gradient(160deg,rgba(255,255,255,.25),rgba(0,0,0,.25))">
        <div style="color:{a['fg']};font-size:40px;font-weight:900;letter-spacing:1px;text-shadow:2px 2px 0 #0006">{esc(a['text'])}</div>
        <div style="color:#fff;font-size:24px;margin-top:8px;letter-spacing:4px">{esc(a['sub'])}</div></div>"""
             if not back else
             """<div style="width:300px;height:120px;margin:40px auto 0;background:#e6e6e6;border:2px solid #999;
        border-radius:4px;font-size:15px;color:#555;padding:12px;box-sizing:border-box;line-height:1.6">
        MADE IN JAPAN &nbsp; LOT 4471-B<br>Handle with care. Keep contacts clean.<br>Do not remove label.</div>""")
    return f"""<div class="shadow" style="width:440px;height:500px;background:linear-gradient(#9a9a9a,#7d7d7d);
      border-radius:22px 22px 10px 10px;padding-top:70px;box-sizing:border-box;position:relative">
      <div style="position:absolute;top:22px;left:40px;right:40px;height:18px;
        background:repeating-linear-gradient(90deg,#6d6d6d 0 10px,#8a8a8a 10px 20px);border-radius:4px"></div>
      {label}
      <div style="position:absolute;bottom:0;left:60px;right:60px;height:40px;background:#6a6a6a;border-radius:6px 6px 0 0"></div></div>"""


def dvd(a: dict, back: bool) -> str:
    if back:
        return f"""<div class="shadow" style="width:400px;height:560px;background:{a['bg']};border:12px solid #1c3f94;
          box-sizing:border-box;padding:30px;color:{a['fg']};position:relative">
          <div style="font-size:22px;font-weight:bold">{esc(a['text'].title())}</div>
          <div style="font-size:15px;line-height:1.7;margin-top:20px;opacity:.9">A story told across one long
          summer, with new interviews, deleted scenes and a commentary track. Widescreen. Dolby Digital.</div>
          <div style="display:flex;gap:10px;margin-top:24px">
            <div style="flex:1;height:90px;background:{a['fg']};opacity:.3"></div>
            <div style="flex:1;height:90px;background:{a['fg']};opacity:.5"></div>
            <div style="flex:1;height:90px;background:{a['fg']};opacity:.3"></div></div>
          <div style="position:absolute;left:30px;bottom:30px;width:140px;height:55px;
            background:repeating-linear-gradient(90deg,#111 0 3px,#fff 3px 6px,#111 6px 7px,#fff 7px 11px)"></div></div>"""
    return f"""<div class="shadow" style="width:400px;height:560px;background:#1c3f94;border-radius:6px;padding:12px;box-sizing:border-box">
      <div style="width:100%;height:100%;background:{a['bg']};position:relative;overflow:hidden;
        display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
        <div style="position:absolute;bottom:-120px;width:500px;height:300px;border-radius:50%;background:{a['fg']};opacity:.2"></div>
        <div style="color:{a['fg']};font-size:40px;font-weight:bold;letter-spacing:3px;padding:0 20px">{esc(a['text'])}</div>
        <div style="color:{a['fg']};font-size:20px;margin-top:14px;letter-spacing:2px">{esc(a['sub'])}</div></div></div>"""


def book(a: dict, back: bool) -> str:
    body = (f"""<div style="font-size:18px;line-height:1.8;color:{a['fg']};opacity:.9">"Impossible to put down."<br>
              <i>- The Riverside Review</i><br><br>A quiet, clever story about maps, time and the people who
              keep both.</div>""" if back else
            f"""<div style="flex:1"></div>
              <div style="width:140px;height:140px;border-radius:50%;border:8px solid {a['fg']};opacity:.5;margin:0 auto 40px"></div>
              <div style="color:{a['fg']};font-size:36px;font-weight:bold;line-height:1.15">{esc(a['text'])}</div>
              <div style="color:{a['fg']};font-size:22px;margin-top:18px">{esc(a['sub'])}</div><div style="flex:1"></div>""")
    return f"""<div class="shadow" style="width:380px;height:580px;background:{a['bg']};border-radius:3px 8px 8px 3px;
      display:flex;flex-direction:column;padding:44px 36px;box-sizing:border-box;text-align:center;
      background-image:linear-gradient(90deg,rgba(0,0,0,.25) 0 10px,rgba(255,255,255,.08) 10px 14px,transparent 14px)">{body}</div>"""


def card(a: dict, back: bool) -> str:
    if back:
        return """<div class="shadow" style="width:360px;height:500px;border-radius:18px;background:#3d2b56;
          border:14px solid #222;box-sizing:border-box;display:flex;align-items:center;justify-content:center">
          <div style="width:200px;height:200px;border-radius:50%;background:radial-gradient(#f6bd60,#84a59d 60%,#3d2b56 61%)"></div></div>"""
    return f"""<div class="shadow" style="width:360px;height:500px;border-radius:18px;background:#d9c27a;padding:16px;box-sizing:border-box">
      <div style="background:{a['bg']};height:100%;border-radius:8px;padding:12px;box-sizing:border-box;display:flex;flex-direction:column">
        <div style="color:#fff;font-weight:bold;font-size:22px">{esc(a['text'].title())}</div>
        <div style="height:210px;margin-top:10px;border:4px solid #d9c27a;
          background:radial-gradient(circle at 50% 60%,{a['fg']},{a['bg']} 70%),linear-gradient(45deg,#fff3,#0003)"></div>
        <div style="margin-top:12px;background:#f4ecd8;flex:1;border-radius:4px;padding:10px;font-size:14px;color:#333;line-height:1.5">
          <b>{esc(a['sub'])}</b><br>When this enters play, draw a card. Allies you control get +1 guard until end of turn.</div></div></div>"""


DRAW = {"record": record, "cartridge": cartridge, "dvd": dvd, "book": book, "card": card}


def main() -> None:
    data = json.loads((REPO / "demo" / "data.json").read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 800, "height": 800})
        for item in data["items"]:
            for n, back in ((1, False), (2, True)):
                page.set_content(f"<html><head><style>{BACKDROP}</style></head><body>"
                                 f"{DRAW[item['kind']](item['art'], back)}</body></html>")
                page.screenshot(path=str(OUT / f"{item['id']}_{n:02d}.jpg"), type="jpeg", quality=82)
        browser.close()
    print(f"drew {2 * len(data['items'])} images in {OUT}")


if __name__ == "__main__":
    main()
