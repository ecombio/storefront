# Creates draft (unpublished) blog posts in Shopify using the Terminal CMS app.
#
# Run from the repository root (it reads .env.local there):
#   .\create-draft-posts.ps1           # preview only, writes nothing
#   .\create-draft-posts.ps1 -Apply    # creates the drafts
#
# If the SEO metafields cause an error, set $withSeo = $false below and run again.

param([switch]$Apply)

$ErrorActionPreference = 'Stop'
$shop       = 'ecombio.myshopify.com'
$url        = "https://$shop/admin/api/2025-01/graphql.json"
$authorName = 'Lannay Dale-Tooze'
$authorId   = 'gid://shopify/Metaobject/610756690134'
$withSeo = $true

# ---------- Credentials and token ----------
if (-not (Test-Path .env.local)) { throw 'Run this from the repository root. .env.local was not found.' }
$cfg = @{}
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^\s*([^#=]+?)\s*=\s*"?(.*?)"?\s*$') { $cfg[$matches[1]] = $matches[2] }
}
$tok = Invoke-RestMethod -Method Post -Uri "https://$shop/admin/oauth/access_token" `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body @{ grant_type = 'client_credentials'; client_id = $cfg['SHOPIFY_ADMIN_CLIENT_ID']; client_secret = $cfg['SHOPIFY_ADMIN_CLIENT_SECRET'] }
$headers = @{ 'X-Shopify-Access-Token' = $tok.access_token; 'Content-Type' = 'application/json' }

function Invoke-Gql([string]$query, $variables = @{}) {
  $body = @{ query = $query; variables = $variables } | ConvertTo-Json -Depth 10
  $r = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body $body
  if ($r.errors) { throw ($r.errors | ConvertTo-Json -Compress -Depth 5) }
  $r
}

# ---------- Helpers ----------
function Test-Shortcodes([string]$body) {
  $open  = [regex]::Matches($body, '\[accordion:').Count
  $close = [regex]::Matches($body, '\[/accordion\]').Count
  $any   = [regex]::Matches($body, '\[(accordion:|/accordion\]|products:|button:)').Count
  $clean = [regex]::Matches($body, '<p>\[(accordion:[^\]]*|/accordion|products:[^\]]*|button:[^\]]*)\]</p>').Count
  $noH1  = ($body -notmatch '<h1')
  [pscustomobject]@{ Balanced = ($open -eq $close); EachInOwnParagraph = ($any -eq $clean); NoH1 = $noH1 }
}

function Get-MissingProductHandles([string]$body) {
  $missing = @()
  foreach ($m in [regex]::Matches($body, '\[products:([^\]]*)\]')) {
    $list = ($m.Groups[1].Value -split '\|')[-1]
    foreach ($h in ($list -split ',')) {
      $h = $h.Trim()
      if (-not $h) { continue }
      $res = Invoke-Gql 'query($h:String!){ productByHandle(handle:$h){ handle } }' @{ h = $h }
      if (-not $res.data.productByHandle) { $missing += $h }
    }
  }
  $missing
}

# ---------- The drafts ----------
$drafts = @(
  @{
    blogName = 'Articles'; blogId = 'gid://shopify/Blog/105286861014'
    title    = 'E-Bike vs Electric Scooter: Which Should You Buy?'
    handle   = 'e-bike-vs-electric-scooter'
    tags     = @('Electric Bikes', 'Electric Scooters')
    summary  = '<p>Compare e-bikes and electric scooters on distance, comfort, portability, storage, and local rules to decide which one fits your commute.</p>'
    seoTitle = 'E-Bike vs Electric Scooter: Which Should You Buy?'
    seoDesc  = 'Compare e-bikes and electric scooters on distance, comfort, portability, storage, and local rules to decide which fits your commute.'
    body     = @'
<p>Both e-bikes and electric scooters can replace short car trips and take the stress out of a commute, but they suit different riders. This guide compares them on the points that usually decide the purchase: distance, comfort, portability, storage, and the rules where you ride.</p>

<h2>1. Distance and comfort</h2>
<p>An e-bike is built like a bicycle, so it is generally the more comfortable choice for longer rides. You sit down, you can add your own pedaling to stretch the battery, and the frame, wheels, and gearing are designed for sustained use. Electric scooters shine on short to medium trips. You stand the whole time, which is fine for a quick commute but tiring over long distances.</p>

<p>[products: Shop commuter e-bikes | aventon-level-4-rec-electric-commuter-bike, aventon-soltera-2-5-electric-commuter-bike, aventon-pace-5-rec-step-through-electric-cruiser-bike]</p>

<h2>2. Portability and storage</h2>
<p>This is where scooters usually win. Many electric scooters fold, fit in a car trunk or under a desk, and can be carried up a few flights of stairs. E-bikes are longer and heavier, so they need a rack, a garage, or ground-floor access. If your trip includes trains, buses, or an office with limited space, a folding scooter is often the easier fit.</p>

<p>[products: Shop commuter electric scooters | g6-electric-scooter, apex-pro-commuting-electric-scooter, apollo-city-24]</p>

<h2>3. Hills, cargo, and passengers</h2>
<p>On a climb, an e-bike lets you combine motor power with your own pedaling, and many models accept racks, panniers, or child seats. Some e-bikes are designed specifically for cargo. Scooters rely on the motor alone, and most are designed for one rider with limited carrying capacity, so always check the weight limit and the motor's climbing ability before you buy.</p>

<h2>4. Learning curve and safety</h2>
<p>Both are vehicles that share space with traffic, so wear a helmet and learn your brakes before riding in busy areas. Scooters have small wheels, which makes potholes, cracks, and wet surfaces more noticeable. A bicycle-style frame with larger wheels tends to feel steadier at speed, especially for newer riders.</p>

<h2>5. Rules where you ride</h2>
<p>Rules differ by city and state. E-bikes are often treated like bicycles, while scooter rules vary more, including where you can ride, speed limits, and age requirements. Check your local regulations before you decide.</p>

<h2>Quick decision guide</h2>
<ul>
<li>Choose an e-bike if you ride longer distances, want more comfort, need to carry things, or want to pedal.</li>
<li>Choose an electric scooter if you ride short trips, need something compact, or have limited storage.</li>
</ul>

<p>[accordion: Is an e-bike or an electric scooter better for commuting?]</p>
<p>It depends on your distance and where you keep it. For commutes of several miles or more, an e-bike is usually more comfortable. For short trips, mixed commutes with public transit, or tight storage, a folding scooter is often more practical.</p>
<p>[/accordion]</p>

<p>[accordion: Do I need a license or registration?]</p>
<p>Requirements vary by location and by the class or power of the vehicle. Check your state and local rules before you ride.</p>
<p>[/accordion]</p>

<p>[accordion: Which is easier to store in an apartment?]</p>
<p>A folding electric scooter usually takes far less space than an e-bike and is easier to carry indoors.</p>
<p>[/accordion]</p>
'@
  },
  @{
    blogName = 'cycling'; blogId = 'gid://shopify/Blog/107541135574'
    title    = 'Electric Bike Classes Explained: Class 1, Class 2, and Class 3'
    handle   = 'electric-bike-classes-explained'
    tags     = @('Electric Bikes', 'Cycling Guides')
    summary  = '<p>Learn what Class 1, Class 2, and Class 3 e-bikes mean, how fast each one assists, and how to choose the right class for where you ride.</p>'
    seoTitle = 'Electric Bike Classes Explained: Class 1, 2 and 3'
    seoDesc  = 'Learn what Class 1, Class 2, and Class 3 e-bikes mean, how fast each assists, and how to choose the right class for where you ride.'
    body     = @'
<p>If you are shopping for an e-bike in the US, you will see the terms Class 1, Class 2, and Class 3. The class describes how the motor delivers power and how fast it assists, and it often decides where you are allowed to ride.</p>

<h2>1. Class 1: pedal assist, up to 20 mph</h2>
<p>The motor helps only while you pedal, and it stops assisting at 20 mph. There is no throttle. Class 1 bikes are usually the most widely accepted on shared bike paths and trails.</p>

<h2>2. Class 2: throttle, up to 20 mph</h2>
<p>A Class 2 bike has a throttle that can move the bike without pedaling, with assistance up to 20 mph. A throttle is handy when starting from a stop or when you want a break from pedaling. Some paths and trails limit throttle-equipped bikes.</p>

<h2>3. Class 3: pedal assist, up to 28 mph</h2>
<p>Class 3 bikes give pedal assistance up to 28 mph, which makes them popular for faster commutes. Because of the higher speed, some places restrict where they can ride, and some require helmets or set minimum rider ages.</p>

<p>[products: Shop commuter e-bikes | aventon-level-4-adv-electric-commuter-bike, aventon-level-3-electric-commuter-bike, aventon-soltera-3-adv-electric-commuter-bike]</p>

<h2>4. How to choose a class</h2>
<ul>
<li>Choose Class 1 if you mostly ride on shared paths and trails and want the broadest access.</li>
<li>Choose Class 2 if you want a throttle for starts, stops, and easy riding.</li>
<li>Choose Class 3 if you commute on roads or bike lanes and want higher assisted speeds.</li>
</ul>

<h2>5. Check your local rules</h2>
<p>The three-class system is used in many US states, but each state, city, and park sets its own rules. Check where you plan to ride before you buy.</p>

<p>[accordion: How do I find out which class a bike is?]</p>
<p>Check the product page and the specifications. Manufacturers usually list the class, and many bikes also carry a label on the frame.</p>
<p>[/accordion]</p>

<p>[accordion: Can I ride a Class 3 e-bike on a bike path?]</p>
<p>It depends on local rules. Some paths allow only Class 1, or Class 1 and 2, so check the signs and your city or park regulations first.</p>
<p>[/accordion]</p>

<p>[accordion: Does the class limit the motor's power?]</p>
<p>The class is defined by how the motor assists and its top assisted speed. Many US rules also cap motor power at 750 watts, so check both the class and the motor rating in the specifications.</p>
<p>[/accordion]</p>
'@
  },
  @{
    blogName = 'Articles'; blogId = 'gid://shopify/Blog/105286861014'
    title    = 'Electric Scooter Range Explained: What Affects It and How to Get More'
    handle   = 'electric-scooter-range-explained'
    tags     = @('Electric Scooters')
    summary  = '<p>Understand what affects electric scooter range, from battery size to terrain and tire pressure, plus simple habits to get more miles per charge.</p>'
    seoTitle = 'Electric Scooter Range Explained and How to Extend It'
    seoDesc  = 'Understand what affects electric scooter range, from battery size to terrain and tire pressure, plus simple habits to get more miles per charge.'
    body     = @'
<p>Range is one of the first numbers people check when buying an electric scooter, and one of the most misunderstood. The figure on a spec sheet is measured under ideal conditions, so your real-world range depends on the battery, the way you ride, and where you ride.</p>

<h2>1. Battery capacity</h2>
<p>Battery capacity is measured in watt-hours (Wh), which is volts multiplied by amp-hours. All else equal, a higher watt-hour rating means more range. When you compare scooters, look at the watt-hours as well as the advertised distance.</p>

<h2>2. What shortens your range</h2>
<ul>
<li><strong>Rider weight:</strong> a heavier load asks more of the motor.</li>
<li><strong>Speed:</strong> riding at top speed drains the battery faster than cruising.</li>
<li><strong>Hills:</strong> climbing uses a lot of power, and long hills add up quickly.</li>
<li><strong>Cold weather:</strong> lithium-ion batteries deliver less capacity when they are cold.</li>
<li><strong>Low tire pressure:</strong> soft tires create more rolling resistance.</li>
<li><strong>Stop-and-start riding:</strong> frequent hard acceleration uses more energy than smooth riding.</li>
</ul>

<p>[products: Browse electric scooters | g3-max-electric-scooter, apollo-explore-2-0, apollo-phantom-2-0]</p>

<h2>3. How to get more miles per charge</h2>
<ul>
<li>Keep pneumatic tires at the pressure recommended by the manufacturer.</li>
<li>Use an eco or lower-speed mode when you do not need top speed.</li>
<li>Accelerate smoothly and look ahead so you can coast.</li>
<li>Store and charge the scooter indoors, away from extreme heat or cold.</li>
<li>Carry only what you need.</li>
</ul>

<h2>4. How to read range claims</h2>
<p>Manufacturers typically measure range with a lighter rider, flat ground, and moderate speed. Plan on getting less than the claim in everyday riding, and leave a buffer so you are not caught with an empty battery.</p>

<p>[accordion: How far can an electric scooter go on one charge?]</p>
<p>It depends on the model and the conditions. Check the manufacturer's stated range on the product page, and expect less in everyday riding, especially with hills, heavier riders, and cold weather.</p>
<p>[/accordion]</p>

<p>[accordion: Is it bad to charge the battery to 100 percent?]</p>
<p>Follow the manufacturer's charging guidance. In general, lithium-ion batteries last longest when they are not left fully charged or fully drained for long periods.</p>
<p>[/accordion]</p>

<p>[accordion: Does cold weather reduce range?]</p>
<p>Yes. Lithium-ion batteries deliver less capacity in the cold, so keep the scooter indoors before you ride and expect a shorter range on chilly days.</p>
<p>[/accordion]</p>
'@
  }
)

# ---------- Preview and create ----------
$existing = @(); $after = $null
do {
  $r = Invoke-Gql 'query($after:String){ articles(first:100, after:$after){ pageInfo{hasNextPage endCursor} nodes{ title } } }' @{ after = $after }
  $existing += $r.data.articles.nodes.title
  $after = $r.data.articles.pageInfo.endCursor
} while ($r.data.articles.pageInfo.hasNextPage)

$mutation = 'mutation($article:ArticleCreateInput!){ articleCreate(article:$article){ article{ id title handle } userErrors{ field message } } }'

foreach ($d in $drafts) {
  Write-Host ''
  Write-Host ("[{0}] {1}" -f $d.blogName, $d.title) -ForegroundColor Cyan

  if ($existing -contains $d.title) { Write-Host '    SKIP: an article with this title already exists' -ForegroundColor Yellow; continue }

  $chk     = Test-Shortcodes $d.body
  $missing = @(Get-MissingProductHandles $d.body)
  Write-Host ("    handle: {0} | tags: {1} | body: {2} chars" -f $d.handle, ($d.tags -join ', '), $d.body.Length)
  Write-Host ("    shortcodes balanced: {0} | each in own paragraph: {1} | no H1: {2}" -f $chk.Balanced, $chk.EachInOwnParagraph, $chk.NoH1)
  if ($missing.Count) { Write-Host ("    MISSING product handles: {0}" -f ($missing -join ', ')) -ForegroundColor Red }
  if (-not ($chk.Balanced -and $chk.EachInOwnParagraph -and $chk.NoH1) -or $missing.Count) {
    Write-Host '    NOT CREATED: fix the problems above first' -ForegroundColor Red
    continue
  }

  if (-not $Apply) { continue }

  $mf = @(@{ namespace = 'custom'; key = 'author_profile'; type = 'mixed_reference'; value = $authorId })
  if ($withSeo) {
    $mf += @{ namespace = 'global'; key = 'title_tag';       type = 'single_line_text_field'; value = $d.seoTitle }
    $mf += @{ namespace = 'global'; key = 'description_tag'; type = 'single_line_text_field'; value = $d.seoDesc }
  }
  $article = @{
    blogId      = $d.blogId
    title       = $d.title
    handle      = $d.handle
    body        = $d.body
    summary     = $d.summary
    tags        = [string[]]$d.tags
    author      = @{ name = $authorName }
    isPublished = $false
    metafields  = [object[]]$mf
  }
  $res = Invoke-Gql $mutation @{ article = $article }
  $errs = $res.data.articleCreate.userErrors
  if ($errs) {
    Write-Host ("    ERROR: {0}" -f ($errs | ConvertTo-Json -Compress)) -ForegroundColor Red
  } else {
    Write-Host ("    CREATED as draft: {0}" -f $res.data.articleCreate.article.id) -ForegroundColor Green
  }
}

Write-Host ''
if ($Apply) { Write-Host 'Done. Review the drafts in Shopify admin under Content > Blog posts.' }
else        { Write-Host 'Preview only. Nothing was written. Run again with -Apply to create the drafts.' }
