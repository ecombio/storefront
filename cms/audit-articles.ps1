# Read-only content audit of all Shopify blog articles.
# Run from the repository root (reads .env.local):
#   .\cms\audit-articles.ps1                 # audit, thin = under 800 words
#   .\cms\audit-articles.ps1 -ThinWords 1000
param([int]$ThinWords = 800)

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
  -Body @{ grant_type = 'client_credentials'; client_id = $cfg['SHOPIFY_ADMIN_CLIENT_ID']; client_secret = $cfg[$secretKey] }
$headers = @{ 'X-Shopify-Access-Token' = $tok.access_token; 'Content-Type' = 'application/json' }

$q = 'query($after:String){ articles(first:50, after:$after){ pageInfo{ hasNextPage endCursor } nodes{ title handle tags isPublished publishedAt body image{ url } author{ name } blog{ handle } titleTag: metafield(namespace:"global", key:"title_tag"){ value } descTag: metafield(namespace:"global", key:"description_tag"){ value } } } }'
$nodes = @()
$after = $null
do {
  $body = @{ query = $q; variables = @{ after = $after } } | ConvertTo-Json -Depth 10
  $r = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body $body
  if ($r.errors) { throw ($r.errors | ConvertTo-Json -Compress -Depth 5) }
  $nodes += $r.data.articles.nodes
  $after = $r.data.articles.pageInfo.endCursor
} while ($r.data.articles.pageInfo.hasNextPage)

$rows = foreach ($a in $nodes) {
  $b = [string]$a.body
  $text = $b -replace '(?s)<[^>]+>', ' ' -replace '&nbsp;', ' ' -replace '\[[^\]]*\]', ' '
  [pscustomobject]@{
    date     = if ($a.publishedAt) { ([datetime]$a.publishedAt).ToString('yyyy-MM-dd') } else { 'draft' }
    title    = $a.title
    handle   = $a.handle
    blog     = $a.blog.handle
    words    = ($text -split '\s+' | Where-Object { $_ }).Count
    h2       = [regex]::Matches($b, '<h2').Count
    faq      = [regex]::Matches($b, '\[accordion:').Count
    products = [regex]::Matches($b, '\[products:').Count
    links    = [regex]::Matches($b, '<a\s[^>]*href=').Count
    image    = [bool]$a.image
    seoTitle = [bool]$a.titleTag.value
    seoDesc  = [bool]$a.descTag.value
    tags     = ($a.tags -join ';')
    published = $a.isPublished
  }
}

New-Item -ItemType Directory -Force seo-data | Out-Null
$rows | Export-Csv .\seo-data\content-audit.csv -NoTypeInformation -Encoding utf8

"Articles: $($rows.Count)  Published: $(($rows | Where-Object published).Count)  Avg words: $([int](($rows | Measure-Object words -Average).Average))`n"
$rows | Sort-Object date | Format-Table date, blog,
  @{ n = 'title'; e = { if ($_.title.Length -gt 58) { $_.title.Substring(0,55) + '...' } else { $_.title } } },
  words, h2, faq, products, links,
  @{ n = 'img'; e = { if ($_.image) { 'y' } else { 'N' } } },
  @{ n = 'seo'; e = { '{0}{1}' -f $(if ($_.seoTitle) { 't' } else { '-' }), $(if ($_.seoDesc) { 'd' } else { '-' }) } } -AutoSize

"`n--- Tags ---"
$rows | ForEach-Object { $_.tags -split ';' } | Where-Object { $_ } | Group-Object | Sort-Object Count -Descending |
  ForEach-Object { '{0} ({1})' -f $_.Name, $_.Count } | Join-String -Separator ', '

"`n--- Flags ---"
"Thin (<$ThinWords words): $(($rows | Where-Object { $_.words -lt $ThinWords }).Count)"
"No featured image: $(($rows | Where-Object { -not $_.image } | ForEach-Object handle) -join ', ')"
"Missing SEO title or description: $(($rows | Where-Object { -not $_.seoTitle -or -not $_.seoDesc }).Count)"
"No FAQ block: $(($rows | Where-Object { $_.faq -eq 0 }).Count)   No product block: $(($rows | Where-Object { $_.products -eq 0 }).Count)"

