# Lists all blog articles in Shopify (read-only) and checks keyword-cluster coverage.
# Run from the repository root (it reads .env.local there):
#   .\docs\apps\terminal-cms\scripts\list-articles.ps1                 # all articles + keyword coverage
#   .\docs\apps\terminal-cms\scripts\list-articles.ps1 -Find 'battery' # only titles/handles matching a pattern
param([string]$Find)

$ErrorActionPreference = 'Stop'
$shop = 'ecombio.myshopify.com'
$url  = "https://$shop/admin/api/2025-01/graphql.json"

if (-not (Test-Path .env.local)) { throw 'Run this from the repository root. .env.local was not found.' }
$cfg = @{}
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^\s*([^#=]+?)\s*=\s*"?(.*?)"?\s*$') { $cfg[$matches[1]] = $matches[2] }
}
$secretKey = $cfg.Keys | Where-Object { $_ -match 'CLIENT_SECRET' } | Select-Object -First 1
$tok = Invoke-RestMethod -Method Post -Uri "https://$shop/admin/oauth/access_token" `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body @{ grant_type = 'client_credentials'; client_id = $cfg['SHOPIFY_ADMIN_CLIENT_ID']; client_secret = $cfg['SHOPIFY_ADMIN_CLIENT_SECRET'] }
$headers = @{ 'X-Shopify-Access-Token' = $tok.access_token; 'Content-Type' = 'application/json' }

$q = 'query($after:String){ articles(first:100, after:$after){ pageInfo{ hasNextPage endCursor } nodes{ title handle isPublished publishedAt blog{ handle } } } }'
$articles = @()
$after = $null
do {
  $body = @{ query = $q; variables = @{ after = $after } } | ConvertTo-Json -Depth 10
  $r = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body $body
  if ($r.errors) { throw ($r.errors | ConvertTo-Json -Compress -Depth 5) }
  $articles += $r.data.articles.nodes
  $after = $r.data.articles.pageInfo.endCursor
} while ($r.data.articles.pageInfo.hasNextPage)

New-Item -ItemType Directory -Force docs\storefronts\blog\seo | Out-Null
$articles | Select-Object title, handle, isPublished, publishedAt, @{ n = 'blog'; e = { $_.blog.handle } } |
  Export-Csv .\docs\storefronts\blog\seo\articles.csv -NoTypeInformation -Encoding utf8

"Total: $($articles.Count)   Published: $(($articles | Where-Object isPublished).Count)   (saved docs\storefronts\blog\seo\articles.csv)"
$show = if ($Find) { $articles | Where-Object { $_.title -match $Find -or $_.handle -match $Find } } else { $articles }
$show | Sort-Object title | Format-Table title, handle, isPublished -AutoSize

if (-not $Find) {
  "`n--- Keyword cluster coverage (existing titles that already touch each topic) ---"
  $clusters = [ordered]@{
    'cost'        = 'cost|price|how much|cheap|afford|budget'
    'what-is'     = 'what is|beginner|guide'
    'speed'       = 'fast|speed|mph'
    'license'     = 'licen|regist|insur'
    'street-legal'= 'legal|law|road'
    'how-works'   = 'how .*work'
    'pedal'       = 'pedal'
    'rain'        = 'rain|wet|waterproof|weather'
    'worth/safe'  = 'worth|safe'
    'weight'      = 'weight|heavy'
    'charging'    = 'charg|battery'
    'conversion'  = 'convert|conversion|kit|diy'
    'folding'     = 'fold'
    'mountain/fat'= 'mountain|fat tire'
    'commuter'    = 'commut'
    'kids'        = 'kid|child'
    'three-wheel' = 'three|3.wheel|trike'
  }
  foreach ($k in $clusters.Keys) {
    $hits = $articles | Where-Object { $_.title -match $clusters[$k] }
    '{0,-14} {1}' -f $k, $(if ($hits) { ($hits.title -join ' | ') } else { '-- none --' })
  }
}
