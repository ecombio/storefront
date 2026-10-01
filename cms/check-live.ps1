# Fetches every article URL in the live sitemap and reports what the public page serves (read-only).
#   .\cms\check-live.ps1                         # production
#   .\cms\check-live.ps1 -Base https://other.example   # another host
param([string]$Base = 'https://ecombio.com')

$ErrorActionPreference = 'Stop'
function Get-Locs([string]$u) {
  [regex]::Matches((Invoke-WebRequest $u -SkipHttpErrorCheck -TimeoutSec 30).Content, '<loc>([^<]+)</loc>') | ForEach-Object { $_.Groups[1].Value }
}
$all = foreach ($l in (Get-Locs "$Base/sitemap.xml")) { if ($l -match 'sitemap.*\.xml') { Get-Locs $l } else { $l } }
$urls = @($all | Where-Object { $_ -match '/blogs/articles/' } | Sort-Object -Unique)

$rows = foreach ($u in $urls) {
  $r = Invoke-WebRequest $u -SkipHttpErrorCheck -TimeoutSec 30
  $h = [string]$r.Content
  $title = [regex]::Match($h, '(?is)<title[^>]*>(.*?)</title>').Groups[1].Value.Trim()
  $desc = [regex]::Match($h, '(?is)<meta[^>]+name="description"[^>]+content="([^"]*)"').Groups[1].Value
  if (-not $desc) { $desc = [regex]::Match($h, '(?is)<meta[^>]+content="([^"]*)"[^>]+name="description"').Groups[1].Value }
  $h1 = ([regex]::Match($h, '(?is)<h1[^>]*>(.*?)</h1>').Groups[1].Value -replace '<[^>]+>', '').Trim()
  $text = $h -replace '(?is)<(script|style|noscript)[^>]*>.*?</\1>', ' ' -replace '<[^>]+>', ' ' -replace '&[a-z#0-9]+;', ' '
  [pscustomobject]@{
    status   = [int]$r.StatusCode
    noindex  = [bool]($h -match '(?i)<meta[^>]+name="robots"[^>]+noindex')
    words    = @($text -split '\s+' | Where-Object { $_ }).Count
    h1       = [bool]$h1
    title    = $title
    titleLen = $title.Length
    descLen  = $desc.Length
    page     = $u.Substring($u.LastIndexOf('/') + 1)
  }
}
$floor = ($rows | Measure-Object words -Minimum).Minimum
New-Item -ItemType Directory -Force seo-data | Out-Null
$rows | Select-Object status, noindex, @{ n = 'contentWords'; e = { $_.words - $floor } }, h1, titleLen, descLen, title, page |
  Export-Csv .\seo-data\live-check.csv -NoTypeInformation -Encoding utf8

"Pages: $($rows.Count)   noindex: $(($rows | Where-Object noindex).Count)   non-200: $(($rows | Where-Object { $_.status -ne 200 }).Count)   (saved seo-data\live-check.csv)"
"status  words  h1  title desc  page"
$rows | Sort-Object words | ForEach-Object {
  '{0}  {1,5}  {2,-3} {3,4} {4,4}  {5}' -f $_.status, ($_.words - $floor), $(if ($_.h1) { 'y' } else { 'N' }), $_.titleLen, $_.descLen, $_.page
}
"`nSample titles:"
$rows | Sort-Object words | Select-Object -First 3 | ForEach-Object { '  ' + $_.title }
$rows | Sort-Object words | Select-Object -Last 3 | ForEach-Object { '  ' + $_.title }
