# Fetches web pages as clean markdown via Jina Reader (r.jina.ai) into seo-data/external/.
# Research only: read-only, never writes to Shopify.
#   python cms\fetch-external.py https://example.com/page1 https://example.com/page2
#   python cms\fetch-external.py --file seo-data\urls.txt      (one URL per line, # for comments)
# Optional: set JINA_API_KEY in your environment for higher rate limits.
import argparse, os, re, sys, time, urllib.request, urllib.error
from datetime import date
from urllib.parse import urlparse

def slug(url):
    p = urlparse(url)
    s = (p.netloc + p.path).strip('/')
    return re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()[:120] or 'page'

def fetch(url, key):
    req = urllib.request.Request('https://r.jina.ai/' + url,
                                 headers={'Accept': 'text/markdown', 'User-Agent': 'ecombio-research/1.0'})
    if key:
        req.add_header('Authorization', 'Bearer ' + key)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode('utf-8', 'replace')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('urls', nargs='*')
    ap.add_argument('--file')
    ap.add_argument('--out', default=os.path.join('seo-data', 'external'))
    ap.add_argument('--delay', type=float, default=3.0, help='seconds between requests')
    ap.add_argument('--force', action='store_true', help='overwrite existing files')
    a = ap.parse_args()

    urls = list(a.urls)
    if a.file:
        with open(a.file, encoding='utf-8') as f:
            urls += [l.strip() for l in f if l.strip() and not l.strip().startswith('#')]
    if not urls:
        sys.exit('No URLs given.')

    os.makedirs(a.out, exist_ok=True)
    key = os.environ.get('JINA_API_KEY')
    ok = 0
    for i, u in enumerate(urls):
        path = os.path.join(a.out, slug(u) + '.md')
        if os.path.exists(path) and not a.force:
            print('skip (exists): ' + path)
            continue
        try:
            md = fetch(u, key)
        except urllib.error.HTTPError as e:
            print('FAILED %s: HTTP %s' % (u, e.code))
            continue
        except Exception as e:
            print('FAILED %s: %s' % (u, e))
            continue
        words = len(md.split())
        h2 = len(re.findall(r'^##\s', md, flags=re.M))
        with open(path, 'w', encoding='utf-8') as f:
            f.write('<!-- source: %s | fetched: %s | via r.jina.ai -->\n\n%s\n' % (u, date.today().isoformat(), md))
        print('saved %s  (%d words, %d H2)' % (path, words, h2))
        ok += 1
        if i < len(urls) - 1:
            time.sleep(a.delay)
    print('Done: %d saved' % ok)

main()
