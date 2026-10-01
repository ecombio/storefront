# Sorts a competitor sitemap CSV (needs a "loc" column) into topic candidates. Read-only research helper.
# Save the sitemap as docs\storefronts\blog\seo\competitor-sitemap.csv, then run from the repo root:
#   .\docs\apps\terminal-cms\scripts\competitor-topics.ps1                  # theme counts, writes docs\storefronts\blog\seo\competitor-topics.csv
#   .\docs\apps\terminal-cms\scripts\competitor-topics.ps1 -Theme laws      # list candidates for one theme
param([string]$Csv = '.\docs\storefronts\blog\seo\competitor-sitemap.csv', [string]$Theme)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path $Csv)) { throw "Not found: $Csv" }

$brand = 'aventon|rad-?power|radrover|radcity|radwagon|radexpand|lectric|velotric|himiway|juiced|pedego|trek|specialized|giant|gazelle|heybike|mokwheel|denago|tern|vanmoof|ride1up|bakcou|blix|kbo|momentum|rei|magnum|pace-|soltera|sinch|aventure|ramblas|abound|level-|current'
$news  = 'giveaway|ride-report|beyond-the-bike|award|expansion|holiday|black-friday|bfcm|sea-otter|eurobike|introducing|meet-|inspiring-story|wrap-up|state-of|tech-talk|tech-roundup|best-buy|packaging|shop-talk|tariff|presents|gift|app$|apple-watch|decorate|apart-together|gives-back|history|future'
$themes = [ordered]@{
  'laws'        = 'law|legal|license|insurance|rebate|tax|trail-rules|class-[123]|nyc|new-jersey|by-state'
  'cost'        = 'price|pricing|cost|worth|payback|save|money|cheap|affordable|budget'
  'battery'     = 'battery|charge|range|recycle|fire'
  'maintenance' = 'maintain|maintenance|clean|lube|chain|rust|tire|flat|squeak|repair|tool|handlebar|saddle|seat-post|brake|gear|inflate|safety-check|storage'
  'buying'      = '^best-|buying|choose|types|guide|-for-(men|women|seniors|tall|short|heavy|hills)'
  'compare'     = '(^|-)vs(-|$)'
  'riding'      = 'ride|riding|commut|tips|night|rain|snow|winter|travel|rack|camp|touring|kids|children|dogs|pain|health|safe'
}

$stop = 'the','a','an','of','to','and','for','in','on','your','you','is','are','what','how','do','does','with','vs','best'
function Get-Tokens([string]$s) {
  @($s.ToLower() -split '[^a-z0-9]+' | Where-Object { $_ -and $_.Length -gt 2 -and $stop -notcontains $_ } | Sort-Object -Unique)
}
$existing = @()
if (Test-Path .\docs\storefronts\blog\seo\articles.csv) {
  $existing = Import-Csv .\docs\storefronts\blog\seo\articles.csv | ForEach-Object { [pscustomobject]@{ Title = $_.title; Tokens = (Get-Tokens $_.title) } }
}
function Get-Similar([string[]]$t) {
  $best = ''; $bestScore = 0
  foreach ($e in $existing) {
    if ($t.Count -lt 2 -or $e.Tokens.Count -lt 2) { continue }
    $inter = @($t | Where-Object { $e.Tokens -contains $_ }).Count
    $score = $inter / [math]::Min($t.Count, $e.Tokens.Count)
    if ($score -gt $bestScore) { $bestScore = $score; $best = $e.Title }
  }
  if ($bestScore -ge 0.7) { $best } else { '' }
}

$ti = (Get-Culture).TextInfo
$rows = Import-Csv $Csv | Sort-Object loc -Unique | Where-Object { $_.loc -match '/blogs/[^/]+/[^/]+$' } | ForEach-Object {
  $slug = ($_.loc -split '/')[-1]
  $topic = $ti.ToTitleCase(($slug -replace '-', ' '))
  $action = 'candidate'; $th = 'other'
  if ($slug -match $news)      { $action = 'skip'; $th = 'news/event' }
  elseif ($slug -match $brand) { $action = 'skip'; $th = 'brand/product' }
  else { foreach ($k in $themes.Keys) { if ($slug -match $themes[$k]) { $th = $k; break } } }
  [pscustomobject]@{ theme = $th; action = $action; topic = $topic; slug = $slug; overlapsExisting = $(if ($action -eq 'candidate') { Get-Similar (Get-Tokens $topic) } else { '' }) }
}

$rows = @($rows | Sort-Object slug -Unique)
New-Item -ItemType Directory -Force docs\storefronts\blog\seo | Out-Null
$rows | Export-Csv .\docs\storefronts\blog\seo\competitor-topics.csv -NoTypeInformation -Encoding utf8
"Posts: $($rows.Count)   Candidates: $(($rows | Where-Object action -eq 'candidate').Count)   (saved docs\storefronts\blog\seo\competitor-topics.csv)`n"
if ($Theme) {
  $rows | Where-Object { $_.theme -eq $Theme -and $_.action -eq 'candidate' } | Sort-Object topic |
    Format-Table topic, @{ n = 'overlaps'; e = { $_.overlapsExisting } } -AutoSize
} else {
  $rows | Group-Object theme | Sort-Object Count -Descending | ForEach-Object { '{0,-14} {1}' -f $_.Name, $_.Count }
}


