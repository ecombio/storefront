# Publishes or unpublishes articles by handle. Preview by default; -Apply writes.
#   .\docs\apps\terminal-cms\scripts\set-article-status.ps1 -Handles a,b -Unpublish            # preview
#   .\docs\apps\terminal-cms\scripts\set-article-status.ps1 -Handles a,b -Unpublish -Apply     # write
#   .\docs\apps\terminal-cms\scripts\set-article-status.ps1 -Handles a,b -Publish -Apply       # reverse
param([Parameter(Mandatory)][string[]]$Handles, [switch]$Publish, [switch]$Unpublish, [switch]$Apply)

$ErrorActionPreference = 'Stop'
if ([bool]$Publish -eq [bool]$Unpublish) { throw 'Pass exactly one of -Publish or -Unpublish.' }
$target = [bool]$Publish
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

function Get-Articles {
  $out = @(); $after = $null
  do {
    $q = 'query($after:String){ articles(first:100, after:$after){ pageInfo{ hasNextPage endCursor } nodes{ id title handle isPublished blog{ handle } } } }'
    $r = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body (@{ query = $q; variables = @{ after = $after } } | ConvertTo-Json -Depth 5)
    if ($r.errors) { throw ($r.errors | ConvertTo-Json -Compress -Depth 5) }
    $out += $r.data.articles.nodes
    $after = $r.data.articles.pageInfo.endCursor
  } while ($r.data.articles.pageInfo.hasNextPage)
  $out
}

$articles = Get-Articles
New-Item -ItemType Directory -Force docs\storefronts\blog\seo\snapshots | Out-Null
$snap = ".\docs\storefronts\blog\seo\snapshots\articles-status-{0}.json" -f (Get-Date -Format yyyyMMdd-HHmmss)
$articles | ConvertTo-Json -Depth 5 | Set-Content $snap -Encoding utf8

$changed = 0
foreach ($h in $Handles) {
  $found = @($articles | Where-Object { $_.handle -eq $h })
  if ($found.Count -ne 1) { Write-Host ("SKIP ({0} matches): {1}" -f $found.Count, $h) -ForegroundColor Yellow; continue }
  $a = $found[0]
  if ($a.isPublished -eq $target) { Write-Host ("no change: {0}" -f $h); continue }
  Write-Host ("[{0}] {1}: published {2} -> {3}" -f $a.blog.handle, $a.handle, $a.isPublished, $target)
  $changed++
  if ($Apply) {
    $m = 'mutation($id:ID!,$pub:Boolean){ articleUpdate(id:$id, article:{isPublished:$pub}){ article{ id isPublished } userErrors{ field message } } }'
    $res = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body (@{ query = $m; variables = @{ id = $a.id; pub = $target } } | ConvertTo-Json -Depth 5)
    if ($res.errors) { Write-Host ("    GraphQL error: {0}" -f ($res.errors | ConvertTo-Json -Compress)) -ForegroundColor Red }
    elseif ($res.data.articleUpdate.userErrors) { Write-Host ("    ERROR: {0}" -f ($res.data.articleUpdate.userErrors | ConvertTo-Json -Compress)) -ForegroundColor Red }
  }
}
"Snapshot: $snap"
if (-not $Apply) { "PREVIEW ONLY: $changed change(s) pending. Add -Apply to write." }
else {
  "Verify:"
  Get-Articles | Where-Object { $Handles -contains $_.handle } | ForEach-Object { '  {0} published={1}' -f $_.handle, $_.isPublished }
}
