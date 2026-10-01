# Pushes edited local articles back to Shopify. Preview by default; -Apply writes.
# Updates only: body (.html file), title, summary, SEO title, SEO description (.meta.json).
#   .\cms\push-articles.ps1                      # preview all local articles
#   .\cms\push-articles.ps1 -Handles a,b -Apply  # write just these
param([string[]]$Handles, [switch]$Apply)
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
function Get-Live {
  $out = @(); $after = $null
  do {
    $q = 'query($after:String){ articles(first:25, after:$after){ pageInfo{ hasNextPage endCursor } nodes{ id title handle summary body seoTitle: metafield(namespace:"global", key:"title_tag"){ value } seoDesc: metafield(namespace:"global", key:"description_tag"){ value } } } }'
    $r = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body (@{ query = $q; variables = @{ after = $after } } | ConvertTo-Json -Depth 5)
    if ($r.errors) { throw ($r.errors | ConvertTo-Json -Compress -Depth 5) }
    $out += $r.data.articles.nodes
    $after = $r.data.articles.pageInfo.endCursor
  } while ($r.data.articles.pageInfo.hasNextPage)
  $out
}
function N($x) { (([string]$x) -replace '\r', '').Trim() }
$live = @{}
Get-Live | ForEach-Object { $live[$_.id] = $_ }
$dir = '.\seo-data\articles'
$plan = @()
foreach ($mf in (Get-ChildItem $dir -Filter *.meta.json)) {
  $m = Get-Content $mf.FullName -Raw -Encoding utf8 | ConvertFrom-Json
  if ($Handles -and ($Handles -notcontains $m.handle)) { continue }
  $hp = Join-Path $dir ($m.handle + '.html')
  if (-not (Test-Path $hp)) { Write-Host "SKIP (no .html): $($m.handle)" -ForegroundColor Yellow; continue }
  $body = Get-Content $hp -Raw -Encoding utf8
  if (-not (N $body)) { Write-Host "SKIP (empty body file): $($m.handle)" -ForegroundColor Yellow; continue }
  $l = $live[$m.id]
  if (-not $l) { Write-Host "SKIP (not found in Shopify): $($m.handle)" -ForegroundColor Yellow; continue }
  $art = @{}; $mfs = @(); $what = @()
  if ((N $body) -ne (N $l.body)) { $art.body = $body; $what += ('body {0} -> {1} chars' -f (N $l.body).Length, (N $body).Length) }
  if ((N $m.title) -ne (N $l.title)) { $art.title = [string]$m.title; $what += 'title' }
  if ((N $m.summary) -ne (N $l.summary)) { $art.summary = [string]$m.summary; $what += 'summary' }
  if ((N $m.seoTitle) -ne (N $l.seoTitle.value) -and (N $m.seoTitle)) { $mfs += @{ namespace = 'global'; key = 'title_tag'; type = 'single_line_text_field'; value = [string]$m.seoTitle }; $what += ('seoTitle ({0} chars)' -f (N $m.seoTitle).Length) }
  if ((N $m.seoDescription) -ne (N $l.seoDesc.value) -and (N $m.seoDescription)) { $mfs += @{ namespace = 'global'; key = 'description_tag'; type = 'single_line_text_field'; value = [string]$m.seoDescription }; $what += ('seoDescription ({0} chars)' -f (N $m.seoDescription).Length) }
  if ($mfs.Count -gt 0) { $art.metafields = @($mfs) }
  if ($what.Count -eq 0) { continue }
  Write-Host ('{0}: {1}' -f $m.handle, ($what -join ', '))
  $plan += [pscustomobject]@{ id = $m.id; handle = $m.handle; article = $art; before = $l }
}
if ($plan.Count -eq 0) { 'Nothing to push. Local files match Shopify.'; return }
if (-not $Apply) { "PREVIEW ONLY: $($plan.Count) article(s) would change. Add -Apply to write."; return }
New-Item -ItemType Directory -Force seo-data\snapshots | Out-Null
$snap = '.\seo-data\snapshots\articles-content-{0}.json' -f (Get-Date -Format yyyyMMdd-HHmmss)
$plan | ForEach-Object { $_.before } | ConvertTo-Json -Depth 6 | Set-Content $snap -Encoding utf8
"Snapshot of current Shopify values: $snap"
foreach ($p in $plan) {
  $mut = 'mutation($id:ID!,$a:ArticleUpdateInput!){ articleUpdate(id:$id, article:$a){ article{ id } userErrors{ field message } } }'
  $res = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body (@{ query = $mut; variables = @{ id = $p.id; a = $p.article } } | ConvertTo-Json -Depth 8)
  if ($res.errors) { Write-Host ("ERROR {0}: {1}" -f $p.handle, ($res.errors | ConvertTo-Json -Compress)) -ForegroundColor Red }
  elseif ($res.data.articleUpdate.userErrors) { Write-Host ("ERROR {0}: {1}" -f $p.handle, ($res.data.articleUpdate.userErrors | ConvertTo-Json -Compress)) -ForegroundColor Red }
  else { Write-Host "updated: $($p.handle)" }
}
