# Pulls article bodies from Shopify into seo-data\articles\ (read-only on Shopify).
#   .\cms\pull-articles.ps1                    # every article with 30+ words of body
#   .\cms\pull-articles.ps1 -Handles a,b       # only these (even if empty)
#   .\cms\pull-articles.ps1 -Force             # overwrite local files that already exist
param([string[]]$Handles, [switch]$Force)
$ErrorActionPreference = 'Stop'
$shop = 'ecombio.myshopify.com'
$url  = "https://$shop/admin/api/2025-01/graphql.json"
$cfg = @{}
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^\s*([^#=]+?)\s*=\s*"?(.*?)"?\s*$') { $cfg[$matches[1]] = $matches[2] }
}
$secretKey = $cfg.Keys | Where-Object { $_ -match 'CLIENT_SECRET' } | Select-Object -First 1
$tok = Invoke-RestMethod -Method Post -Uri "https://$shop/admin/oauth/access_token" -ContentType 'application/x-www-form-urlencoded' -Body @{ grant_type = 'client_credentials'; client_id = $cfg['SHOPIFY_ADMIN_CLIENT_ID']; client_secret = $cfg[$secretKey] }
$headers = @{ 'X-Shopify-Access-Token' = $tok.access_token; 'Content-Type' = 'application/json' }
$out = @(); $after = $null
do {
  $q = 'query($after:String){ articles(first:25, after:$after){ pageInfo{ hasNextPage endCursor } nodes{ id title handle summary body isPublished blog{ handle } seoTitle: metafield(namespace:"global", key:"title_tag"){ value } seoDesc: metafield(namespace:"global", key:"description_tag"){ value } } } }'
  $r = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body (@{ query = $q; variables = @{ after = $after } } | ConvertTo-Json -Depth 5)
  if ($r.errors) { throw ($r.errors | ConvertTo-Json -Compress -Depth 5) }
  $out += $r.data.articles.nodes
  $after = $r.data.articles.pageInfo.endCursor
} while ($r.data.articles.pageInfo.hasNextPage)
$dir = '.\seo-data\articles'
New-Item -ItemType Directory -Force $dir | Out-Null
$n = 0
foreach ($a in $out) {
  $body = [string]$a.body
  $words = @(($body -replace '<[^>]+>', ' ') -split '\s+' | Where-Object { $_ }).Count
  if ($Handles) { if ($Handles -notcontains $a.handle) { continue } }
  elseif ($words -lt 30) { continue }
  $p = Join-Path $dir ($a.handle + '.html')
  if ((Test-Path $p) -and -not $Force) { Write-Host "skip (exists, use -Force): $($a.handle)"; continue }
  Set-Content -Path $p -Value $body -Encoding utf8 -NoNewline
  $meta = [ordered]@{
    id = $a.id; handle = $a.handle; blog = $a.blog.handle; isPublished = $a.isPublished
    title = $a.title; summary = [string]$a.summary
    seoTitle = [string]$a.seoTitle.value; seoDescription = [string]$a.seoDesc.value
  }
  $meta | ConvertTo-Json | Set-Content -Path (Join-Path $dir ($a.handle + '.meta.json')) -Encoding utf8
  $n++
}
"Pulled $n article(s) into $dir"
