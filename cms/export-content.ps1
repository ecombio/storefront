# Exports article text to seo-data\articles-content.md (read-only).
#   .\cms\export-content.ps1                      # all articles with a body
#   .\cms\export-content.ps1 -Handles a,b         # only these handles
param([string[]]$Handles)
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
$nl = [Environment]::NewLine
$out = @(); $after = $null
do {
  $q = 'query($after:String){ articles(first:25, after:$after){ pageInfo{ hasNextPage endCursor } nodes{ title handle isPublished summary body blog{ handle } } } }'
  $r = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body (@{ query = $q; variables = @{ after = $after } } | ConvertTo-Json -Depth 5)
  if ($r.errors) { throw ($r.errors | ConvertTo-Json -Compress -Depth 5) }
  $out += $r.data.articles.nodes
  $after = $r.data.articles.pageInfo.endCursor
} while ($r.data.articles.pageInfo.hasNextPage)
if ($Handles) { $out = @($out | Where-Object { $Handles -contains $_.handle }) }
$sb = New-Object System.Text.StringBuilder
$n = 0
foreach ($a in ($out | Sort-Object { $_.blog.handle }, title)) {
  $t = [string]$a.body
  $t = $t -replace '(?is)<h([1-6])[^>]*>', ($nl + '## ')
  $t = $t -replace '(?is)</(p|li|h[1-6]|div|tr)>', $nl
  $t = $t -replace '(?is)<li[^>]*>', '- '
  $t = $t -replace '<[^>]+>', ''
  $t = [System.Net.WebUtility]::HtmlDecode($t).Trim()
  $words = @($t -split '\s+' | Where-Object { $_ }).Count
  if (-not $Handles -and $words -lt 30) { continue }
  $n++
  [void]$sb.AppendLine("# $($a.title)")
  [void]$sb.AppendLine("handle: $($a.handle) | blog: $($a.blog.handle) | published: $($a.isPublished) | words: $words")
  [void]$sb.AppendLine("summary: $($a.summary)")
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine($t)
  [void]$sb.AppendLine('')
  [void]$sb.AppendLine('---')
  [void]$sb.AppendLine('')
}
New-Item -ItemType Directory -Force seo-data | Out-Null
Set-Content -Path .\seo-data\articles-content.md -Value $sb.ToString() -Encoding utf8
"Exported $n articles to seo-data\articles-content.md"
