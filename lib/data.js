// AviList's unified global checklist contains 11,131 bird species.
export const WORLD_SPECIES_COUNT = 11131;

export const CONTINENTS = [
  { name: "North America", symbol: "◢", blurb: "Forests, coasts & wide-open skies" },
  { name: "South America", symbol: "◒", blurb: "Rainforests alive with color" },
  { name: "Europe", symbol: "♧", blurb: "Woodlands, wetlands & gardens" },
  { name: "Africa", symbol: "◩", blurb: "Savannas, deserts & great lakes" },
  { name: "Asia", symbol: "⌁", blurb: "Mountains, islands & ancient forests" },
  { name: "Oceania", symbol: "◓", blurb: "Unique birds found nowhere else" },
  { name: "Antarctica", symbol: "△", blurb: "Penguins, petrels & frozen seas" }
];

export const COUNTRIES = {
  "North America": ["United States", "Canada", "Mexico", "Costa Rica", "Panama", "Cuba", "Jamaica"],
  "South America": ["Brazil", "Argentina", "Colombia", "Peru", "Ecuador", "Chile", "Bolivia"],
  Europe: ["United Kingdom", "France", "Spain", "Germany", "Italy", "Norway", "Portugal"],
  Africa: ["Kenya", "South Africa", "Tanzania", "Botswana", "Morocco", "Ghana", "Uganda"],
  Asia: ["Japan", "China", "India", "Thailand", "Indonesia", "South Korea", "Vietnam"],
  Oceania: ["Australia", "New Zealand", "Papua New Guinea", "Fiji", "Samoa"],
  Antarctica: ["Antarctica"]
};

export const LOCATIONS = {
  "United States": { regions: ["California", "New York", "Florida", "Texas", "Washington", "Chicago", "San Francisco", "Los Angeles"], birds: ["california-quail", "american-robin", "bald-eagle", "barn-owl", "anna-hummingbird", "western-bluebird"] },
  Canada: { regions: ["British Columbia", "Ontario", "Québec", "Alberta", "Vancouver", "Toronto"], birds: ["american-robin", "bald-eagle", "barn-owl", "snowy-owl"] },
  Mexico: { regions: ["Yucatán", "Oaxaca", "Jalisco", "Mexico City", "Cancún"], birds: ["barn-owl", "resplendent-quetzal", "anna-hummingbird"] },
  Japan: { regions: ["Hokkaido", "Tokyo", "Kyoto", "Osaka", "Okinawa"], birds: ["red-crowned-crane", "barn-owl", "mandarin-duck"] },
  Kenya: { regions: ["Nairobi", "Mombasa", "Kisumu", "Rift Valley"], birds: ["lilac-breasted-roller", "african-fish-eagle", "greater-flamingo"] },
  Australia: { regions: ["New South Wales", "Victoria", "Queensland", "Sydney", "Melbourne"], birds: ["rainbow-lorikeet", "laughing-kookaburra", "superb-fairywren"] },
  Antarctica: { regions: ["Antarctic Peninsula", "Ross Sea", "Weddell Sea"], birds: ["emperor-penguin", "snow-petrel"] },
  Brazil: { regions: ["Amazonas", "São Paulo", "Rio de Janeiro", "Brasília"], birds: ["toco-toucan", "hyacinth-macaw", "greater-flamingo"] },
  "United Kingdom": { regions: ["England", "Scotland", "Wales", "London", "Edinburgh"], birds: ["european-robin", "barn-owl", "atlantic-puffin"] }
};

export const BIRDS = [
  {
    id: "california-quail", name: "California Quail", scientific: "Callipepla californica", rarity: "Common", emoji: "◉",
    size: "24–27 cm", diet: "Seeds & leaves", behavior: "Social ground bird",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/California%20Quail%20male.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Callipepla_californica",
    description: ["A plump, gray-and-brown bird with a distinctive forward-drooping head plume. Males have a black face outlined in white, while females wear softer brown coloring that helps them blend into dry vegetation.", "California Quail usually move in lively groups called coveys. They walk and scratch for seeds, leaves, berries, and insects, bursting into fast, low flight when startled."]
  },
  {
    id: "american-robin", name: "American Robin", scientific: "Turdus migratorius", rarity: "Common", emoji: "●",
    size: "20–28 cm", diet: "Worms & fruit", behavior: "Ground forager",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/American%20Robin.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Turdus_migratorius",
    description: ["American Robins are familiar thrushes with warm orange breasts, gray-brown backs, and dark heads. They are medium-sized songbirds often seen standing upright on lawns.", "They hunt earthworms by running and stopping across open ground, then switch to berries and fruit in colder months. Their clear, cheerful song is often one of the first heard at dawn."]
  },
  {
    id: "bald-eagle", name: "Bald Eagle", scientific: "Haliaeetus leucocephalus", rarity: "Uncommon", emoji: "◆",
    size: "70–102 cm", diet: "Mostly fish", behavior: "Soaring hunter",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Bald%20Eagle%20Portrait.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Haliaeetus_leucocephalus",
    description: ["This enormous raptor has broad wings, a heavy yellow bill, and—in adults—a bright white head and tail against a dark brown body. Young birds remain mottled brown for several years.", "Bald Eagles gather near rivers, lakes, and coasts where fish are plentiful. They catch prey with powerful feet, take stranded fish, and sometimes chase other birds until they drop a meal."]
  },
  {
    id: "barn-owl", name: "Barn Owl", scientific: "Tyto alba", rarity: "Uncommon", emoji: "▽",
    size: "33–39 cm", diet: "Small mammals", behavior: "Silent night hunter",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Barn%20Owl%2C%20Lancashire.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Tyto_alba",
    description: ["Barn Owls are pale, long-legged owls with golden backs and unmistakable heart-shaped white faces. Their dark eyes and ghostly, buoyant flight distinguish them from most other owls.", "Specially fringed feathers let them fly almost silently over fields. They locate mice and voles with extremely sensitive hearing, then drop feet-first to seize prey hidden in grass."]
  },
  {
    id: "anna-hummingbird", name: "Anna’s Hummingbird", scientific: "Calypte anna", rarity: "Common", emoji: "✦",
    size: "9–10 cm", diet: "Nectar & insects", behavior: "Hovering feeder",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Anna%27s%20hummingbird.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Calypte_anna",
    description: ["A compact hummingbird with an iridescent green back. Adult males have a dazzling rose-pink crown and throat that can look dark until the light catches it.", "They hover at flowers to drink nectar with long tongues and catch tiny insects in midair. Males perform spectacular diving displays that end with a sharp sound made by their tail feathers."]
  },
  {
    id: "western-bluebird", name: "Western Bluebird", scientific: "Sialia mexicana", rarity: "Rare", emoji: "◍",
    size: "15–18 cm", diet: "Insects & berries", behavior: "Perch-and-drop hunter",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Western%20Bluebird.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Sialia_mexicana",
    description: ["Male Western Bluebirds are vivid blue with rusty-orange chests and upper backs; females are subdued gray-brown with blue wings and tails. Both are small, round-bodied thrushes.", "They watch the ground from low perches before dropping onto insects. In winter they gather in flocks and eat berries, often nesting in old woodpecker holes or nest boxes."]
  },
  {
    id: "snowy-owl", name: "Snowy Owl", scientific: "Bubo scandiacus", rarity: "Rare", emoji: "○", endangered: true,
    size: "52–71 cm", diet: "Lemmings & birds", behavior: "Open-country hunter",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Snowy%20Owl%202008-11-23.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Bubo_scandiacus",
    description: ["A massive white owl of the Arctic tundra. Adult males can be nearly pure white, while females and young birds carry bold dark bars that provide camouflage.", "Snowy Owls hunt by day as well as night, watching from a low mound before flying after lemmings or birds. Some winters bring them unusually far south in search of food."]
  },
  {
    id: "resplendent-quetzal", name: "Resplendent Quetzal", scientific: "Pharomachrus mocinno", rarity: "Rare", emoji: "♢", endangered: true,
    size: "36–40 cm", diet: "Fruit & insects", behavior: "Canopy fruit eater",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Resplendent%20Quetzal%20male.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Pharomachrus_mocinno",
    description: ["This brilliant cloud-forest bird has shimmering green plumage, a red belly, and—on males—extraordinary flowing tail coverts. Its color shifts between green and blue as light changes.", "Quetzals pluck wild avocados and other fruit while fluttering near branches, later spreading the seeds. They also take insects, small frogs, and lizards."]
  },
  {
    id: "red-crowned-crane", name: "Red-crowned Crane", scientific: "Grus japonensis", rarity: "Rare", emoji: "⌇", endangered: true,
    size: "150–158 cm", diet: "Plants & small animals", behavior: "Wetland forager",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Red-crowned.crane.arp.750pix.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Grus_japonensis",
    description: ["One of the world’s largest cranes, this elegant white bird has black secondary feathers, a black neck, and bare red skin on its crown. Pairs are famous for synchronized dancing displays.", "They probe marshes and fields for roots, grain, insects, fish, and amphibians. The species is endangered, and protected wetlands are essential to its survival."]
  },
  {
    id: "mandarin-duck", name: "Mandarin Duck", scientific: "Aix galericulata", rarity: "Uncommon", emoji: "◈",
    size: "41–49 cm", diet: "Seeds & aquatic life", behavior: "Dabbling duck",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mandarin.duck.arp.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Aix_galericulata",
    description: ["Male Mandarin Ducks have orange sail-like feathers, a purple chest, and bold facial stripes. Females are gray-brown with a delicate white eye ring.", "They feed by dabbling at the water’s surface and walking under trees for seeds and insects. Unlike many ducks, they nest in tree cavities near wooded lakes and rivers."]
  },
  {
    id: "lilac-breasted-roller", name: "Lilac-breasted Roller", scientific: "Coracias caudatus", rarity: "Common", emoji: "✣",
    size: "28–38 cm", diet: "Insects & lizards", behavior: "Perch hunter",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Lilac-breasted%20roller%20%28Coracias%20caudatus%29.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Coracias_caudatus",
    description: ["This striking African bird combines a lilac breast with turquoise, green, blue, and rusty-brown feathers. Long outer tail feathers add to its unmistakable silhouette.", "It watches from an exposed perch, then swoops to the ground for beetles, grasshoppers, small reptiles, and frogs. Its name comes from its rolling aerial courtship display."]
  },
  {
    id: "african-fish-eagle", name: "African Fish Eagle", scientific: "Icthyophaga vocifer", rarity: "Uncommon", emoji: "◇",
    size: "63–75 cm", diet: "Fish", behavior: "Waterside hunter",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/African%20Fish%20Eagle.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Icthyophaga_vocifer",
    description: ["A bold chestnut, black, and white eagle with a powerful yellow-and-black bill. Its ringing call is one of the most recognizable sounds around African lakes and rivers.", "From a high waterside perch, it dives feet-first and uses rough-soled talons to grip fish near the surface. It also eats waterbirds and carrion."]
  },
  {
    id: "greater-flamingo", name: "Greater Flamingo", scientific: "Phoenicopterus roseus", rarity: "Uncommon", emoji: "⌁",
    size: "120–145 cm", diet: "Algae & tiny animals", behavior: "Filter feeder",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Greater%20flamingo%20%28Phoenicopterus%20roseus%29.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Phoenicopterus_roseus",
    description: ["The largest flamingo is pale pink with long pink legs, black-tipped wings, and a heavy downward-bent bill. Its color comes from pigments in its food.", "It feeds with its head upside down, pumping water through comb-like structures in its bill to strain algae, small crustaceans, and other tiny organisms."]
  },
  {
    id: "rainbow-lorikeet", name: "Rainbow Lorikeet", scientific: "Trichoglossus moluccanus", rarity: "Common", emoji: "◐",
    size: "25–30 cm", diet: "Nectar & fruit", behavior: "Fast social feeder",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Rainbow%20Lorikeet%20%28Trichoglossus%20moluccanus%29.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Trichoglossus_moluccanus",
    description: ["A vividly colored parrot with a blue head, orange-yellow chest, green wings, and red bill. Noisy flocks are common in parks and flowering trees.", "A brush-tipped tongue helps it sweep nectar and pollen from blossoms. Lorikeets also eat soft fruit and travel quickly between flowering trees in chattering groups."]
  },
  {
    id: "laughing-kookaburra", name: "Laughing Kookaburra", scientific: "Dacelo novaeguineae", rarity: "Common", emoji: "◑",
    size: "39–42 cm", diet: "Insects & small animals", behavior: "Sit-and-wait hunter",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Laughing%20Kookaburra%20%28Dacelo%20novaeguineae%29.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Dacelo_novaeguineae",
    description: ["This very large kingfisher has a cream head, dark eye stripe, brown wings, and a thick dagger-like bill. Family groups announce their territory with a famous chorus resembling loud laughter.", "It waits quietly on a branch before dropping onto insects, lizards, snakes, and small mammals. Prey is often struck against a perch before being swallowed."]
  },
  {
    id: "superb-fairywren", name: "Superb Fairywren", scientific: "Malurus cyaneus", rarity: "Common", emoji: "•",
    size: "14 cm", diet: "Insects", behavior: "Active shrub forager",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Superb%20fairywren%20male.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Malurus_cyaneus",
    description: ["Breeding males glow electric blue and black, while females and nonbreeding males are warm gray-brown with long upright tails. These tiny birds live in busy family groups.", "They hop rapidly through low shrubs and open ground, picking insects from leaves and soil. Group members cooperate to defend territory and raise young."]
  },
  {
    id: "emperor-penguin", name: "Emperor Penguin", scientific: "Aptenodytes forsteri", rarity: "Rare", emoji: "♠", endangered: true,
    size: "100–130 cm", diet: "Fish, squid & krill", behavior: "Deep-diving hunter",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Emperor%20Penguin%20Manchot%20empereur.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Aptenodytes_forsteri",
    description: ["The tallest penguin has a black head, silvery back, white belly, and golden-yellow patches along its neck. Its streamlined body and dense feathers are adapted to severe Antarctic cold.", "Emperor Penguins dive beneath sea ice for fish, squid, and krill. During winter breeding, males balance a single egg on their feet and huddle together for warmth."]
  },
  {
    id: "snow-petrel", name: "Snow Petrel", scientific: "Pagodroma nivea", rarity: "Uncommon", emoji: "⌒",
    size: "36–41 cm", diet: "Krill & fish", behavior: "Ocean surface feeder",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Snow%20Petrel.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Pagodroma_nivea",
    description: ["An almost completely white Antarctic seabird with black eyes, a small black bill, and gray-black feet. Its buoyant flight makes it easy to spot against dark ocean water.", "Snow Petrels seize krill, fish, and squid from the surface and sometimes make shallow dives. They nest in rocky crevices, often far inland among the ice."]
  },
  {
    id: "toco-toucan", name: "Toco Toucan", scientific: "Ramphastos toco", rarity: "Common", emoji: "◗",
    size: "55–65 cm", diet: "Fruit & small animals", behavior: "Canopy forager",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Toco%20Toucan%20%28Ramphastos%20toco%29.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Ramphastos_toco",
    description: ["The largest toucan has a black body, white throat, blue skin around the eye, and an enormous orange bill. Despite its size, the bill is light because its interior is a lattice of thin bone.", "Tocos use the bill to reach and toss fruit, dispersing seeds through the forest. They also take insects, eggs, and small vertebrates."]
  },
  {
    id: "hyacinth-macaw", name: "Hyacinth Macaw", scientific: "Anodorhynchus hyacinthinus", rarity: "Rare", emoji: "◕", endangered: true,
    size: "95–100 cm", diet: "Palm nuts", behavior: "Powerful tree forager",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Anodorhynchus%20hyacinthinus%20-%20Hyacinth%20Macaw.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Anodorhynchus_hyacinthinus",
    description: ["This spectacular cobalt-blue parrot is the world’s largest flying parrot. Bare yellow skin circles its eyes and lines the base of its massive black bill.", "Its strong bill cracks extremely hard palm nuts that few animals can open. Pairs and family groups travel between feeding and nesting trees, calling loudly in flight."]
  },
  {
    id: "european-robin", name: "European Robin", scientific: "Erithacus rubecula", rarity: "Common", emoji: "●",
    size: "12–14 cm", diet: "Insects & berries", behavior: "Territorial forager",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/European%20Robin.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Erithacus_rubecula",
    description: ["A small, round songbird with a warm orange-red face and breast, olive-brown back, and pale belly. Both males and females have the same familiar coloring.", "Robins hop close to disturbed soil to grab worms and insects, and eat berries in winter. Despite their friendly appearance, they defend feeding territories vigorously."]
  },
  {
    id: "atlantic-puffin", name: "Atlantic Puffin", scientific: "Fratercula arctica", rarity: "Rare", emoji: "▣", endangered: true,
    size: "26–29 cm", diet: "Small fish", behavior: "Pursuit diver",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Atlantic%20Puffin.jpg?width=1200",
    source: "https://commons.wikimedia.org/wiki/Category:Fratercula_arctica",
    description: ["Atlantic Puffins are compact black-and-white seabirds with bright multicolored bills during breeding season. Their short wings beat rapidly in air and act like flippers underwater.", "They dive and swim after small fish, carrying several crosswise in the bill at once. Puffins nest in burrows on grassy sea cliffs and spend most of the year far offshore."]
  }
];
