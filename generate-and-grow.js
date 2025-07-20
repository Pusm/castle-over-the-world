#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class CastleGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.articlesDir = path.join(this.projectRoot, 'articles');
    this.castlesJsonPath = path.join(this.projectRoot, 'castles.json');
    this.stylesCssPath = path.join(this.projectRoot, 'style.css');
    this.indexHtmlPath = path.join(this.projectRoot, 'index.html');
    
    this.realWorldCastles = [
      {
        id: "neuschwanstein_castle",
        castleName: "Neuschwanstein Castle",
        country: "Germany",
        location: "Bavaria, near Fussen",
        architecturalStyle: "Romanesque Revival with Gothic Revival elements",
        yearBuilt: "1869-1886",
        shortDescription: "A 19th-century Romanesque Revival palace commissioned by Ludwig II of Bavaria as a retreat and homage to Richard Wagner. This castle inspired Disney's Sleeping Beauty Castle and stands majestically in the Bavarian Alps.",
        detailedDescription: "Neuschwanstein Castle represents the pinnacle of 19th-century romantic historicism, embodying Ludwig II's vision of a medieval knight's castle combined with the latest technological innovations. The castle was designed by Christian Jank, a theatrical set designer, which explains its fantastical appearance. Built as a personal refuge for the reclusive king, it incorporates advanced heating systems, running water on all floors, and even a telephone system - revolutionary for its time. The interior decoration draws heavily from Wagner's operas, particularly Tannhäuser, Lohengrin, and Parsifal, with elaborate murals depicting scenes from Germanic legends.",
        historicalTimeline: [
          { year: "1868", event: "Ludwig II orders the construction of 'New Hohenschwangau Castle'" },
          { year: "1869", event: "Foundation stone laid on September 5th, construction begins" },
          { year: "1873", event: "Palas (main building) construction starts" },
          { year: "1880", event: "Lower floors completed, Ludwig moves in temporarily" },
          { year: "1884", event: "Throne Hall completed with Byzantine-style mosaics" },
          { year: "1886", event: "Ludwig II dies mysteriously, construction continues" },
          { year: "1892", event: "Final completion of interior decoration" }
        ],
        dynastyInfo: {
          dynasty: "House of Wittelsbach",
          ruler: "Ludwig II of Bavaria (1845-1886)",
          predecessors: ["Maximilian II of Bavaria"],
          successors: ["Otto of Bavaria (declared insane)", "Luitpold, Prince Regent"],
          dynastyOrigin: "Founded 1180, ruled Bavaria until 1918"
        },
        notableEvents: [
          {
            date: "1886",
            event: "Mysterious death of Ludwig II",
            significance: "Found dead in Lake Starnberg under suspicious circumstances, officially ruled suicide but evidence suggests assassination"
          },
          {
            date: "1945",
            event: "Allied liberation and Nazi art storage discovery",
            significance: "Castle used by Nazis to store stolen art treasures, liberated by American forces"
          },
          {
            date: "1955",
            event: "Disney inspiration confirmed",
            significance: "Walt Disney visited and used the castle as inspiration for Sleeping Beauty Castle at Disneyland"
          }
        ],
        architecturalAnalysis: {
          structuralInnovations: [
            "Steel framework construction (revolutionary for castle architecture)",
            "Central heating system throughout all floors",
            "Running water and flush toilets on every floor",
            "Electric call system for servants",
            "Telephone connection to Munich and Hohenschwangau"
          ],
          defensiveFeatures: "Decorative only - no military purpose, purely romantic revival",
          materials: ["Kelheim limestone for exterior", "Salzburg marble for interior", "Bavarian pine for woodwork", "Steel framework"],
          dimensions: "Length: 150m, Width: 117m, Height: 213m above sea level",
          rooms: "65 rooms planned, only 15 completed and furnished"
        },
        constructionDetails: {
          chiefArchitect: "Eduard Riedel (1869-1874), Georg von Dollmann (1874-1884), Julius Hofmann (1884-1892)",
          designer: "Christian Jank (theatrical set designer)",
          cost: "6.2 million marks (equivalent to approximately 200 million euros today)",
          workers: "Up to 200 workers during peak construction",
          challenges: [
            "Extreme Alpine location required innovative engineering",
            "Transport of materials up steep mountain paths",
            "Integration of modern technology with medieval aesthetics",
            "Ludwig's constant design changes and perfectionism"
          ]
        },
        engineeringDetails: {
          foundationEngineering: {
            geologicalBase: "Alpine limestone bedrock at 965 meters above sea level",
            formationProcess: "Massive stone removal and reinforcement required due to steep mountain site",
            engineeringAdvantages: [
              "Commanding views over Bavarian Alps and Hohenschwangau Castle",
              "Natural defensive position on rocky Alpine outcrop",
              "Isolation provided privacy for reclusive King Ludwig II",
              "Stable limestone foundation suitable for heavy masonry construction"
            ]
          },
          constructionTechniques: {
            industrialInnovations: [
              "First large steam-powered crane used in German castle construction",
              "Steel framework hidden within romantic revival masonry",
              "Throne Hall supported by revolutionary steel girder lattice system",
              "Modern building techniques disguised with medieval aesthetic"
            ],
            materialEngineering: [
              "Brick walls clad with Kelheim limestone for aesthetic effect",
              "Salzburg marble used for interior decorative elements",
              "Steel framework provides structural integrity while maintaining romantic appearance",
              "Bavarian pine timber for interior woodwork and roofing"
            ]
          },
          innovativeFeatures: [
            "Central heating system throughout all floors - revolutionary for 1880s",
            "Running water and flush toilets on every floor",
            "Electric lighting system when electricity was still experimental",
            "Telephone connection to Munich and Hohenschwangau Castle",
            "Electric call system for servants throughout the castle",
            "Hot air heating system with elaborate ductwork"
          ],
          materialProperties: {
            steelFramework: "Hidden steel members provide earthquake resistance and support for elaborate throne hall ceiling",
            limestone: "Light-colored Kelheim limestone provides weather resistance and medieval aesthetic",
            brick: "Load-bearing brick walls allow for thinner construction than solid stone",
            marble: "Salzburg marble chosen for interior luxury and workability for detailed decoration"
          }
        },
        keyFeatures: [
          "Throne Hall with 13-meter-high ceiling and Byzantine-style dome",
          "Minstrels' Hall inspired by Wartburg Castle",
          "Artificial grotto recreation room with waterfall",
          "Swan motifs throughout (Ludwig's heraldic symbol)",
          "Wagner opera-themed murals and decorations",
          "Advanced 19th-century amenities disguised in medieval setting"
        ]
      },
      {
        id: "edinburgh_castle",
        castleName: "Edinburgh Castle",
        country: "Scotland",
        location: "Edinburgh, Scotland",
        architecturalStyle: "Medieval fortress with Renaissance and Georgian additions",
        yearBuilt: "12th century - 18th century (continuous development)",
        shortDescription: "A historic fortress dominating Edinburgh's skyline from its position on Castle Rock, serving as Scotland's most important fortress for over 1,000 years.",
        detailedDescription: "Edinburgh Castle stands on an extinct volcanic rock formation dating back 350 million years, making it one of Europe's most naturally defensible positions. Archaeological evidence suggests human occupation since the Iron Age, with the earliest recorded royal residence dating to the reign of Malcolm III in the 11th century. The castle has witnessed more sieges than any other place in Britain, serving as a royal residence, military garrison, and state prison. Its strategic importance stems from controlling the vital route between England and Scotland, making it a crucial stronghold during the Wars of Scottish Independence and numerous Anglo-Scottish conflicts.",
        historicalTimeline: [
          { year: "1100s", event: "Malcolm III establishes royal residence on Castle Rock" },
          { year: "1124", event: "St Margaret's Chapel built by David I, oldest surviving structure" },
          { year: "1296", event: "Edward I captures castle during Wars of Independence" },
          { year: "1314", event: "Thomas Randolph recaptures castle for Robert the Bruce" },
          { year: "1573", event: "Lang Siege - Mary Queen of Scots' supporters hold out for two years" },
          { year: "1650", event: "Cromwell captures castle after three-month siege" },
          { year: "1689", event: "Jacobite garrison surrenders to William of Orange" },
          { year: "1745", event: "Last military action during Jacobite Rising" }
        ],
        dynastyInfo: {
          dynasty: "Multiple Scottish dynasties and British Crown",
          rulers: ["Malcolm III", "David I", "Robert the Bruce", "James VI/I", "House of Stuart", "House of Hanover", "House of Windsor"],
          significance: "Crown fortress of Scotland, repository of Scottish Crown Jewels",
          dynastyOrigin: "Royal fortress since 1100s, continuous Crown possession"
        },
        notableEvents: [
          {
            date: "1314",
            event: "Thomas Randolph's daring night assault",
            significance: "Scottish forces scaled the north face using a secret path, recapturing the castle for Robert the Bruce"
          },
          {
            date: "1566",
            event: "Birth of James VI in royal apartments",
            significance: "Future King James I of England born in castle, uniting Scottish and English crowns"
          },
          {
            date: "1996",
            event: "Return of the Stone of Destiny",
            significance: "Ancient coronation stone returned to Scotland after 700 years in Westminster Abbey"
          }
        ],
        architecturalAnalysis: {
          structuralInnovations: [
            "Utilization of natural volcanic rock as foundation",
            "Concentric defensive walls following rock contours",
            "Massive curtain walls with projecting towers",
            "Spur defensive system on vulnerable eastern approach",
            "Integration of artillery positions for cannon defense"
          ],
          defensiveFeatures: "Naturally defended on three sides by precipitous cliffs, elaborate spur defense on vulnerable east side",
          materials: ["Local sandstone", "Imported limestone for finer work", "Iron reinforcement", "Lead roofing"],
          dimensions: "Covers approximately 35,737 square meters on Castle Rock summit",
          rooms: "Multiple buildings including royal apartments, great hall, military barracks, and state rooms"
        },
        constructionDetails: {
          chiefArchitects: "Various over centuries including Master James of St Andrews (Great Hall), William Burn (19th century restoration)",
          evolutionPeriods: [
            "Medieval core (12th-14th centuries)",
            "Renaissance royal palace (15th-16th centuries)",
            "Military fortress modifications (17th-18th centuries)",
            "Victorian restoration and museum conversion (19th-20th centuries)"
          ],
          challenges: [
            "Building on irregular volcanic rock surface",
            "Incorporating defensive needs with royal residence requirements",
            "Adapting medieval structures for artillery warfare",
            "Preservation while maintaining military function"
          ]
        },
        engineeringDetails: {
          foundationEngineering: {
            geologicalBase: "350-million-year-old volcanic plug formed from dolerite (coarser-grained basalt)",
            formationProcess: "Volcanic pipe cooled to form extremely hard dolerite, resisted glacial erosion creating crag-and-tail formation",
            engineeringAdvantages: [
              "Natural defensive cliffs rising 80 meters above surrounding landscape",
              "Summit 130 meters above sea level provides commanding position",
              "Only accessible approach from east where ridge slopes gently",
              "Impermeable basalt rock prevents water seepage but creates water supply challenges"
            ]
          },
          constructionTechniques: {
            stoneMasonry: [
              "Medieval masons utilized volcanic stone and glacial debris from castle site",
              "St Margaret's Chapel shows matrix-supported construction with big rocks in sand and gravel cement",
              "Wall thickness varies from 1 meter to over 3 meters for defensive purposes",
              "Different wall sections show evolution from rough volcanic stone to cut rectangular blocks"
            ],
            defensiveAdaptations: [
              "Walls built to follow natural rock contours maximizing defensive advantage",
              "Integration of natural cliff faces with built fortifications",
              "Spur design on eastern approach forces attackers through multiple gates",
              "Artillery adaptations for cannon warfare from 15th century onwards"
            ]
          },
          siegeAdaptations: [
            "26 recorded sieges over 1,100 years - most besieged place in Britain",
            "Medieval defenses largely destroyed in 1573 Lang Siege by artillery bombardment",
            "Fore Well provides siege-resistant water supply 28 meters deep into volcanic rock",
            "Multiple defensive rings and gates force attackers through killing zones",
            "Portcullis and drawbridge systems at vulnerable eastern entrance"
          ],
          materialProperties: {
            volcanicRock: "Extremely hard dolerite provides excellent structural foundation but difficult to quarry and shape",
            importedStone: "Limestone imported for decorative work and fine masonry requiring precision cutting",
            mortar: "Traditional lime mortar used for flexibility during ground settlement",
            ironwork: "Extensive use of iron for portcullis mechanisms, door hinges, and window grilles"
          }
        },
        keyFeatures: [
          "St Margaret's Chapel (1124) - oldest building in Edinburgh",
          "Great Hall with magnificent hammerbeam roof",
          "Scottish Crown Jewels and Stone of Destiny display",
          "One O'Clock Gun fired daily since 1861",
          "Mons Meg - massive 15th-century siege cannon",
          "Royal apartments with 16th-century painted ceilings",
          "Military museums covering 1,000 years of Scottish military history"
        ]
      },
      {
        id: "prague_castle",
        castleName: "Prague Castle",
        country: "Czech Republic",
        location: "Prague, Bohemia",
        architecturalStyle: "Romanesque, Gothic, Renaissance, Baroque fusion",
        yearBuilt: "870-880 AD (continuous expansion over 1,100 years)",
        shortDescription: "According to the Guinness Book of Records, Prague Castle is the largest ancient castle complex in the world. It has been the seat of power for kings of Bohemia, Holy Roman emperors, and presidents of Czechoslovakia and the Czech Republic.",
        detailedDescription: "Prague Castle represents over 1,100 years of architectural evolution, beginning as a fortified settlement established by Prince Bořivoj I around 870-880 AD. The complex occupies an area of almost 70,000 square metres, making it the largest ancient castle in the world. Its architectural diversity reflects centuries of reconstruction, with each era adding new styles without unity. The castle reached its zenith under Charles IV, who transformed Prague into the imperial capital of the Holy Roman Empire. Archaeological evidence reveals continuous development from the Premyslid dynasty through the modern Czech Republic, with each period leaving distinct architectural and cultural imprints.",
        historicalTimeline: [
          { year: "870-880", event: "Prince Bořivoj I establishes fortified settlement on Hradčany Hill" },
          { year: "925", event: "St. Vitus rotunda built, establishing Prague as spiritual center" },
          { year: "1085", event: "Vratislav II becomes first King of Bohemia, elevating castle status" },
          { year: "1344", event: "Charles IV lays foundation stone of Gothic St. Vitus Cathedral" },
          { year: "1378", event: "Charles IV dies, leaving Prague as imperial capital" },
          { year: "1483-1502", event: "Vladislav Hall constructed with revolutionary vault engineering" },
          { year: "1541", event: "Great fire destroys much of castle, Renaissance reconstruction begins" },
          { year: "1618", event: "Defenestration of Prague triggers Thirty Years' War" },
          { year: "1918", event: "Becomes seat of Czechoslovak presidents" },
          { year: "1929", event: "St. Vitus Cathedral finally completed after 585 years" }
        ],
        dynastyInfo: {
          dynasty: "Multiple: Premyslid, Luxembourg, Habsburg, Modern Czech Republic",
          rulers: ["Prince Bořivoj I (first Christian ruler)", "Charles IV (Holy Roman Emperor)", "Rudolf II (Habsburg)", "Václav Havel (first president)"],
          significance: "Continuous seat of power for over 1,100 years, symbol of Czech statehood",
          dynastyOrigin: "Founded 870 AD by Premyslid dynasty, evolved through medieval kingdoms to modern republic"
        },
        notableEvents: [
          {
            date: "1344",
            event: "Foundation of St. Vitus Cathedral under Charles IV",
            significance: "Marked Prague's transformation from provincial fortress to imperial capital, created architectural masterpiece spanning 585 years"
          },
          {
            date: "1618",
            event: "Second Defenestration of Prague",
            significance: "Catholic officials thrown from castle windows, triggering Thirty Years' War that devastated Europe"
          },
          {
            date: "1989",
            event: "Velvet Revolution and Václav Havel's presidency",
            significance: "Peaceful transition from communism, castle became symbol of democratic freedom"
          }
        ],
        architecturalAnalysis: {
          structuralInnovations: [
            "Vladislav Hall's revolutionary ribbed vault - one of Europe's largest unsupported spaces",
            "Integration of four distinct architectural periods without demolition",
            "St. Vitus Cathedral's flying buttresses supporting massive Gothic walls",
            "Benedikt Ried's geometric vault engineering in late Gothic style",
            "Baroque facades concealing medieval interiors"
          ],
          defensiveFeatures: "Natural hilltop position 70 meters above Vltava River, massive walls, strategic gates controlling access routes",
          materials: ["Local sandstone for detailed carvings", "Brick and mortar for structural walls", "Copper and gold for decorative elements", "Wood for roofing structures"],
          dimensions: "Length: 570 meters, Average width: 130 meters, Total area: 70,000 square meters",
          rooms: "Over 1,000 rooms across multiple buildings including state apartments, chapels, museums, and administrative offices"
        },
        constructionDetails: {
          chiefArchitects: "Petr Parléř (St. Vitus Cathedral), Benedikt Ried (Vladislav Hall), various masters over 1,100 years",
          evolutionPeriods: [
            "Premyslid Period (9th-13th centuries): Romanesque foundations",
            "Luxembourg Dynasty (14th century): Gothic transformation under Charles IV",
            "Jagiellon Period (15th-16th centuries): Late Gothic innovations",
            "Habsburg Era (16th-18th centuries): Renaissance and Baroque additions",
            "Modern Restoration (19th-21st centuries): Completion and preservation"
          ],
          challenges: [
            "Integrating 1,100 years of architectural styles cohesively",
            "St. Vitus Cathedral construction spanning six centuries",
            "Working around continuous governmental and ceremonial functions",
            "Preserving historical integrity while modernizing infrastructure",
            "Managing world's largest ancient castle complex"
          ]
        },
        keyFeatures: [
          "St. Vitus Cathedral with Gothic spires and Art Nouveau stained glass",
          "Vladislav Hall with revolutionary ribbed vault engineering",
          "Golden Lane with Renaissance craftsmen's houses",
          "Old Royal Palace spanning multiple architectural periods",
          "Basilica of St. George - Bohemia's oldest preserved church",
          "Powder Tower with panoramic views of Prague",
          "Crown Jewels chamber with Bohemian royal regalia"
        ]
      },
      {
        id: "versailles_palace",
        castleName: "Palace of Versailles",
        country: "France",
        location: "Versailles, Île-de-France",
        architecturalStyle: "French Baroque to Neoclassical",
        yearBuilt: "1630s-1780s (continuous expansion over 150 years)",
        shortDescription: "A testament to French architectural mastery spanning 150 years, Versailles evolved from a hunting lodge into the epitome of absolute monarchy and the pinnacle of European palace design.",
        detailedDescription: "The Palace of Versailles represents the zenith of French royal architecture and the embodiment of absolute monarchy under Louis XIV, the Sun King. Beginning as a modest hunting lodge built by Louis XIII in the 1620s, it was transformed into the most magnificent palace in Europe through a century and a half of continuous construction. The palace served as the principal residence of French kings from 1682 until the French Revolution in 1789, housing up to 20,000 courtiers, servants, and visitors. Its creation required revolutionary landscape engineering, transforming marshland into elaborate terraced gardens, and pioneered new construction techniques that influenced palace design across Europe. The palace became the template for royal residences from Russia's Peterhof to Germany's Sanssouci.",
        historicalTimeline: [
          { year: "1607", event: "Future Louis XIII first visits site for hunting" },
          { year: "1623-1624", event: "Louis XIII orders construction of modest hunting pavilion" },
          { year: "1661", event: "Louis XIV begins massive expansion project" },
          { year: "1668-1671", event: "Louis Le Vau's enveloppe construction adds state apartments" },
          { year: "1678-1689", event: "Hall of Mirrors constructed under Jules Hardouin-Mansart" },
          { year: "1682", event: "Louis XIV officially moves court from Paris to Versailles" },
          { year: "1699-1710", event: "Royal Chapel construction completed" },
          { year: "1715", event: "Death of Louis XIV, palace largely completed" },
          { year: "1789", event: "French Revolution forces royal family to abandon Versailles" },
          { year: "1919", event: "Treaty of Versailles signed in Hall of Mirrors, ending WWI" }
        ],
        dynastyInfo: {
          dynasty: "House of Bourbon",
          rulers: ["Louis XIII (founder)", "Louis XIV (the Sun King)", "Louis XV", "Louis XVI", "Marie Antoinette"],
          significance: "Symbol of absolute monarchy and French royal power, center of European diplomacy",
          dynastyOrigin: "Bourbon dynasty ruled France 1589-1792, Versailles their primary residence 1682-1789"
        },
        notableEvents: [
          {
            date: "1682",
            event: "Court officially moves from Paris to Versailles",
            significance: "Transformed French governance, concentrated nobility under royal control, established Versailles as Europe's political center"
          },
          {
            date: "1783",
            event: "Treaty of Paris signed ending American Revolutionary War",
            significance: "Versailles served as diplomatic center where France's support for American independence was formalized"
          },
          {
            date: "1919",
            event: "Treaty of Versailles signed in Hall of Mirrors",
            significance: "Symbolic venue chosen to end WWI where German Empire was proclaimed in 1871, completing historical circle"
          }
        ],
        architecturalAnalysis: {
          structuralInnovations: [
            "Enveloppe technique wrapping original château without demolition",
            "Hall of Mirrors spanning 230 feet with 17 arched mirrors opposite 17 windows",
            "Revolutionary use of French plate glass technology",
            "Integration of interior and exterior through fenestration design",
            "Systematic application of classical proportions across massive scale"
          ],
          defensiveFeatures: "Ceremonial rather than military - open design emphasizing royal accessibility and magnificence over defense",
          materials: ["Local limestone for structure", "French plate glass for mirrors", "Italian marble for decoration", "Gilded bronze for ornamental details", "Oak for interior paneling"],
          dimensions: "Length: 680 meters, Total floor area: 67,000 square meters, Park area: 800 hectares",
          rooms: "2,300 rooms including royal apartments, state rooms, servants' quarters, and ceremonial halls"
        },
        constructionDetails: {
          chiefArchitects: "Louis Le Vau (1661-1670), Jules Hardouin-Mansart (1678-1708), Jacques-Ange Gabriel (18th century additions)",
          designer: "André Le Nôtre (landscape architect), Charles Le Brun (interior decorator and painter)",
          cost: "Estimated 25% of France's annual revenue during peak construction, equivalent to billions in modern currency",
          workers: "Up to 36,000 workers during peak construction including 6,000 horses for earth moving",
          challenges: [
            "Transforming marshy terrain into stable foundation for massive palace",
            "Creating elaborate water supply system for fountains across 800 hectares",
            "Integrating existing hunting lodge into grand palace design",
            "Managing construction while palace remained royal residence",
            "Coordinating work of multiple master craftsmen across decades"
          ]
        },
        engineeringDetails: {
          landscapeEngineering: {
            terraceConstruction: "Massive earth movement created formal French gardens with geometric precision",
            waterManagement: "Complex hydraulic system including Machine de Marly pumping water from Seine River",
            foundationWork: "Drainage of marshland and soil stabilization for heavy masonry construction"
          },
          constructionTechniques: {
            enveloppeMethod: [
              "Revolutionary technique of building around existing structure without demolition",
              "Louis Le Vau's design wrapped Louis XIII's château in new classical facades",
              "Maintained royal residence function during construction",
              "Created unified architectural appearance from disparate building periods"
            ],
            glassInnovation: [
              "French plate glass manufacturing revolutionized for Hall of Mirrors",
              "17 arched mirrors each 12 feet high created unprecedented interior lighting",
              "Glass technology advancement spurred by royal demand for magnificence",
              "Mirror gallery became template for European palace design"
            ]
          }
        },
        keyFeatures: [
          "Hall of Mirrors with 17 arched mirrors and crystal chandeliers",
          "Royal Chapel with baroque ceiling painted by Antoine Coypel",
          "King's Grand Apartment with salon dedicated to Roman gods",
          "Queen's Apartment with elaborate baroque decoration",
          "André Le Nôtre's geometric French gardens spanning 800 hectares",
          "Grand Trianon and Petit Trianon private retreat pavilions",
          "Orangery housing 3,000 trees in winter",
          "Grand Canal extending 1.67 kilometers through palace grounds"
        ]
      },
      {
        id: "himeji_castle",
        castleName: "Himeji Castle",
        country: "Japan",
        location: "Himeji, Hyogo Prefecture",
        architecturalStyle: "Japanese castle architecture",
        yearBuilt: "1333, rebuilt 1601-1609",
        shortDescription: "Known as White Heron Castle due to its elegant, white appearance, this is one of Japan's most spectacular castles and a UNESCO World Heritage Site. It survived World War II and earthquakes, representing the pinnacle of Japanese castle design.",
        keyFeatures: ["Six-story main keep", "Spiral defensive design", "White plastered walls", "Advanced defensive systems", "Cherry blossom views"]
      },
      {
        id: "windsor_castle",
        castleName: "Windsor Castle",
        country: "United Kingdom",
        location: "Windsor, Berkshire, England",
        architecturalStyle: "Georgian and Victorian design on Medieval structure",
        yearBuilt: "11th century (rebuilt multiple times)",
        shortDescription: "The world's oldest occupied castle, Windsor embodies nearly a millennium of architectural evolution. Originally built after the Norman Conquest, it has continuously served as a royal residence for over 900 years.",
        detailedDescription: "Windsor Castle stands as the world's oldest occupied castle and largest castle complex, representing 900 years of continuous royal residence and architectural evolution. Built by William the Conqueror circa 1070 as part of a defensive ring around London, it has undergone constant transformation from Norman motte-and-bailey fortress to the magnificent royal palace of today. The castle has served 39 monarchs, survived civil wars, world wars, and fires, each era leaving architectural and cultural layers that create a unique palimpsest of British royal history. Originally constructed on a 50-foot chalk mound with wooden fortifications, it evolved through stone keeps, Gothic halls, and baroque state apartments to become the preferred weekend residence of the modern British monarchy.",
        historicalTimeline: [
          { year: "1070", event: "William the Conqueror begins construction of motte-and-bailey castle" },
          { year: "1165-1179", event: "Henry II replaces wooden structures with stone buildings" },
          { year: "1350s", event: "Edward III transforms castle from fortress into Gothic palace" },
          { year: "1475-1483", event: "Edward IV builds St George's Chapel" },
          { year: "1680s", event: "Charles II reconstructs state apartments in baroque style" },
          { year: "1820s", event: "George IV's Gothic Revival transformation under Jeffry Wyatville" },
          { year: "1992", event: "Great Fire damages 100 rooms, restoration completed 1997" },
          { year: "2018", event: "Prince Harry and Meghan Markle marry in St George's Chapel" }
        ],
        dynastyInfo: {
          dynasty: "Continuous residence of British monarchy for 900+ years",
          rulers: ["William the Conqueror", "Henry II", "Edward III", "Henry VIII", "George IV", "Queen Victoria", "Elizabeth II", "Charles III"],
          significance: "Longest-occupied palace in Europe, working royal palace and weekend home",
          dynastyOrigin: "Norman dynasty 1066, continuous royal residence through Plantagenet, Tudor, Stuart, Hanover, Windsor dynasties"
        },
        notableEvents: [
          {
            date: "1216",
            event: "Siege during First Barons' War",
            significance: "Castle successfully defended against rebel barons, proving strategic importance and defensive strength"
          },
          {
            date: "1936",
            event: "Edward VIII abdicates from Windsor Castle",
            significance: "Constitutional crisis resolved when Edward VIII chose love over crown, enabling George VI's accession"
          },
          {
            date: "1992",
            event: "Great Fire destroys much of castle",
            significance: "£37 million restoration became model for heritage conservation, Queen's 'annus horribilis'"
          }
        ],
        architecturalAnalysis: {
          structuralInnovations: [
            "Motte-and-bailey design utilizing 50-foot chalk mound foundation",
            "Continuous architectural evolution maintaining medieval footprint",
            "Integration of Norman, Gothic, Georgian, and Victorian elements",
            "St George's Chapel as pinnacle of Perpendicular Gothic style",
            "Waterloo Chamber - longest room in castle spanning 98 feet"
          ],
          defensiveFeatures: "Strategic position commanding Thames valley, massive curtain walls, Round Tower commanding approaches, multiple defensive circuits",
          materials: ["Chalk excavated from site for motte construction", "Bagshot Heath stone for medieval work", "Bedfordshire stone for internal buildings", "Caen stone imported from Normandy", "Modern steel and concrete for 20th-century reinforcement"],
          dimensions: "Total area: 526,000 square feet, Longest facade: 1,900 feet, Round Tower height: 200 feet",
          rooms: "1,000 rooms including state apartments, private apartments, chapels, and working spaces"
        },
        constructionDetails: {
          chiefArchitects: "Gundulf of Rochester (Norman), Henry Yevele (medieval), Hugh May (baroque), Jeffry Wyatville (Gothic Revival)",
          foundationEngineering: "Chalk mound excavated from surrounding ditch, stone shell keep replacing wooden structures, subsidence management through reinforced foundations",
          evolutionPeriods: [
            "Norman Period (1070-1154): Motte-and-bailey fortress establishment",
            "Plantagenet Expansion (1154-1485): Stone castle development",
            "Tudor Modifications (1485-1603): Residential palace conversion",
            "Stuart Baroque (1603-1714): State apartments creation",
            "Georgian Gothic Revival (1714-1837): Romantic castle restoration",
            "Victorian Completion (1837-1901): Modern infrastructure integration",
            "Modern Conservation (1901-present): Heritage preservation and adaptation"
          ],
          challenges: [
            "Foundation subsidence on chalk mound requiring massive underpinning",
            "Maintaining royal residence function during continuous reconstruction",
            "Integrating 900 years of architectural styles cohesively",
            "Fire damage restoration while preserving historical authenticity",
            "Balancing public access with royal privacy and security"
          ]
        },
        engineeringDetails: {
          foundationEngineering: {
            geologicalBase: "Chalk bedrock with 50-foot artificial mound created from excavated ditch material",
            foundationChallenges: "Original stone keep suffered from subsidence and cracking requiring massive reinforcement",
            solutionImplemented: "Henry II moved walls inward from motte edge and added massive foundations along south side for additional support"
          },
          constructionInnovations: {
            defensiveAdaptations: [
              "Concentric defensive design with multiple walls and towers",
              "Strategic siting controlling Thames valley and approach routes to London",
              "Round Tower design providing 360-degree surveillance and command",
              "Integration with landscape using natural chalk escarpment"
            ],
            residentialEvolution: [
              "Transformation from military fortress to comfortable royal residence",
              "Creation of state apartments while maintaining defensive capabilities",
              "Gothic Revival restoration balancing authenticity with modern comfort",
              "Fire-resistant construction following 1992 disaster"
            ]
          }
        },
        keyFeatures: [
          "St George's Chapel - masterpiece of Perpendicular Gothic architecture",
          "Round Tower - Norman keep offering panoramic views",
          "State Apartments with Waterloo Chamber and throne room",
          "Queen Mary's Dolls' House - miniature masterpiece",
          "Long Walk - 2.65-mile tree-lined avenue to castle",
          "Great Kitchen - medieval kitchen still in use",
          "Albert Memorial Chapel - Victorian Gothic memorial",
          "Royal Archives and Library housing historic documents"
        ]
      },
      {
        id: "alhambra_palace",
        castleName: "The Alhambra",
        country: "Spain",
        location: "Granada, Andalusia",
        architecturalStyle: "Moorish (Islamic) Architecture",
        yearBuilt: "1238-1358",
        shortDescription: "The Alhambra stands as the finest example of Moorish architecture in the Western world, representing the sophisticated artistic and architectural achievements of Islamic Spain during the Nasrid dynasty.",
        detailedDescription: "The Alhambra represents the pinnacle of Islamic art and architecture in medieval Europe, serving as both fortress and palace complex for the Nasrid sultans who ruled the last Muslim kingdom in Spain. Built over more than a century on the Sabika hill overlooking Granada, it embodies the Islamic concept of paradise on earth through its integration of architecture, water, light, and gardens. The complex demonstrates the sophisticated engineering and artistic capabilities of Islamic civilization, featuring revolutionary architectural techniques including muqarnas (honeycomb vaulting), intricate geometric patterns, and an advanced hydraulic system that supplied water throughout the hilltop complex. The name 'Al-Qal'a al-Hamra' means 'Red Castle' in Arabic, referring to the reddish color of its walls built from local red earth and clay.",
        historicalTimeline: [
          { year: "1238", event: "Muhammad I ibn al-Ahmar establishes Nasrid dynasty and begins fortress construction" },
          { year: "1248-1273", event: "Muhammad II expands palace complex and defensive walls" },
          { year: "1302-1309", event: "Muhammad III builds Court of Machuca and Palace of Partal" },
          { year: "1333-1354", event: "Yusuf I constructs Court of Lions and Comares Palace" },
          { year: "1354-1391", event: "Muhammad V completes most spectacular decorative programs" },
          { year: "1492", event: "Catholic Monarchs Ferdinand and Isabella conquer Granada, ending Muslim rule" },
          { year: "1526", event: "Charles V builds Renaissance palace within Islamic complex" },
          { year: "1984", event: "UNESCO designates Alhambra as World Heritage Site" }
        ],
        dynastyInfo: {
          dynasty: "Nasrid Dynasty (Banū al-Aḥmar)",
          rulers: ["Muhammad I ibn al-Ahmar (founder)", "Yusuf I (great builder)", "Muhammad V (artistic patron)", "Boabdil (last sultan)"],
          significance: "Last Muslim dynasty in Western Europe, patrons of Islamic art and architecture",
          dynastyOrigin: "Founded 1238, ruled Granada until 1492, lasted 254 years as final Islamic kingdom in Spain"
        },
        notableEvents: [
          {
            date: "1354-1391",
            event: "Golden age under Muhammad V",
            significance: "Period of greatest artistic achievement, creation of Court of Lions and most intricate decorative programs"
          },
          {
            date: "1492",
            event: "Surrender to Catholic Monarchs",
            significance: "End of 781 years of Muslim rule in Spain, Boabdil's surrender marked completion of Christian Reconquista"
          },
          {
            date: "1829",
            event: "Washington Irving's 'Tales of the Alhambra'",
            significance: "American author's romantic writings sparked international interest and preservation movement"
          }
        ],
        architecturalAnalysis: {
          structuralInnovations: [
            "Muqarnas (honeycomb) vaulting creating complex three-dimensional patterns",
            "Integration of structural and decorative elements in unified design system",
            "Advanced hydraulic engineering supplying water to hilltop location",
            "Climate-responsive architecture with courtyards and water features for cooling",
            "Mathematical precision in geometric patterns and proportional systems"
          ],
          defensiveFeatures: "Strategic hilltop position, massive outer walls with towers, controlled access through multiple gates, separation of palace and military areas",
          materials: ["Local red clay and earth for walls", "White marble for columns and decorative elements", "Cedar wood for intricate ceilings", "Glazed ceramic tiles (azulejos)", "Gold and lapis lazuli for decorative accents"],
          dimensions: "Total area: 142,000 square meters, Palace area: 13,000 square meters, Wall perimeter: 1.4 kilometers",
          rooms: "Over 100 rooms including throne halls, royal apartments, baths, courtyards, and service areas"
        },
        constructionDetails: {
          chiefArchitects: "Various master builders (ustad) including Ismail ibn al-Ahmar, Ahmad ibn Muhammad al-Tilimsani",
          artisticProgram: "Complex integration of calligraphy, geometry, and vegetal motifs expressing Islamic cosmology",
          constructionTechniques: [
            "Tapia (rammed earth) construction for main walls",
            "Brick and tile work for decorative elements",
            "Carved stucco (yesería) for intricate wall decorations",
            "Wooden marquetry (taracea) for ceilings and doors"
          ],
          challenges: [
            "Supplying water to hilltop location through innovative hydraulic system",
            "Creating large interior spaces using Islamic architectural vocabulary",
            "Integrating defensive requirements with palatial luxury",
            "Coordinating complex decorative programs across multiple building phases",
            "Working with local materials to achieve sophisticated artistic effects"
          ]
        },
        engineeringDetails: {
          hydraulicSystem: {
            waterSource: "Darro River channeled through acequia (irrigation canal) system",
            distributionMethod: "Gravity-fed system using slope of hill and architectural levels",
            innovations: [
              "Complex network of channels, fountains, and pools throughout complex",
              "Integration of water features with architectural decoration",
              "Climate control through evaporative cooling in courtyards",
              "Acoustic enhancement through water sounds masking conversations"
            ]
          },
          architecturalMathematics: {
            geometricPrinciples: [
              "Based on Islamic mathematical traditions including star-and-polygon patterns",
              "Use of modular proportional systems derived from Quranic numerology",
              "Integration of geometric patterns at multiple scales from tile to architectural",
              "Application of mathematical concepts of infinity through repetitive patterns"
            ],
            structuralGeometry: [
              "Muqarnas vaults based on complex geometric calculations",
              "Arches using pointed, horseshoe, and multifoil profiles",
              "Column proportions following classical Islamic architectural treatises",
              "Courtyard proportions creating optimal light and shadow patterns"
            ]
          }
        },
        keyFeatures: [
          "Court of Lions with central fountain supported by 12 marble lions",
          "Hall of Ambassadors with star-pattern muqarnas dome",
          "Court of Myrtles reflecting pool and arcade galleries",
          "Generalife gardens with terraced water features",
          "Palace of Charles V - Renaissance addition within Islamic complex",
          "Hall of Two Sisters with intricate honeycomb ceiling",
          "Mirador de Daraxa with panoramic views over Granada",
          "Royal Baths with star-shaped skylights and marble floors"
        ]
      },
      {
        id: "bran_castle",
        castleName: "Bran Castle",
        country: "Romania",
        location: "Bran, Brasov County",
        architecturalStyle: "Gothic Revival",
        yearBuilt: "1377-1388",
        shortDescription: "Often referred to as 'Dracula's Castle', this medieval fortress sits dramatically on a rocky outcrop. While Bram Stoker likely never visited, the castle's Gothic appearance made it the perfect inspiration for Count Dracula's Transylvanian home.",
        keyFeatures: ["Gothic towers", "Secret passages", "Medieval courtyards", "Royal apartments", "Museum collections"]
      },
      {
        id: "mont_saint_michel",
        castleName: "Mont Saint-Michel",
        country: "France",
        location: "Normandy, Manche",
        architecturalStyle: "Medieval abbey fortress",
        yearBuilt: "8th century onwards",
        shortDescription: "A tidal island and mainland commune featuring a medieval abbey built on a rocky tidal island. Accessible by causeway only at low tide, this architectural marvel appears to rise from the sea like a mystical fortress.",
        keyFeatures: ["Gothic abbey church", "Cloister gardens", "Great Wheel", "Medieval ramparts", "Tidal causeway access"]
      },
      {
        id: "hohenzollern_castle",
        castleName: "Hohenzollern Castle",
        country: "Germany",
        location: "Baden-Württemberg",
        architecturalStyle: "Gothic Revival",
        yearBuilt: "1850-1867",
        shortDescription: "Perched 855 meters above sea level, this castle is the ancestral seat of the imperial House of Hohenzollern. The current structure is the third castle built on this site, designed in the Gothic Revival style with stunning views of the Swabian Alps.",
        keyFeatures: ["Crown of Prussia", "Military museum", "Ancestral portraits", "Gothic Revival architecture", "Panoramic Alpine views"]
      }
    ];
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  }

  async atomicWriteFile(filePath, content) {
    const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    try {
      await fs.writeFile(tempPath, content, 'utf8');
      await fs.rename(tempPath, filePath);
    } catch (error) {
      await fs.unlink(tempPath).catch(() => {});
      throw error;
    }
  }

  async initializeProject() {
    console.log('Phase 1: Initializing project structure...');
    
    await this.ensureDirectoryExists(this.articlesDir);
    
    try {
      await fs.access(this.castlesJsonPath);
      console.log('castles.json already exists');
    } catch (error) {
      await this.atomicWriteFile(this.castlesJsonPath, JSON.stringify([], null, 2));
      console.log('Created castles.json with empty array');
    }
    
    try {
      await fs.access(this.stylesCssPath);
      console.log('style.css already exists');
    } catch (error) {
      const cssContent = `/* Castles Over The World - Elegant Historic Styling */

/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Georgia, 'Times New Roman', serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f6f3;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23f8f6f3"/><circle cx="20" cy="20" r="1" fill="%23e8e6e3"/></svg>');
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    font-family: Georgia, serif;
    color: #2c3e50;
    margin-bottom: 1rem;
}

h1 {
    font-size: 2.5rem;
    text-align: center;
    border-bottom: 3px solid #8b4513;
    padding-bottom: 0.5rem;
    margin-bottom: 2rem;
}

h2 {
    font-size: 1.8rem;
    color: #34495e;
    border-left: 4px solid #8b4513;
    padding-left: 1rem;
    margin-top: 2rem;
}

h3 {
    font-size: 1.4rem;
    color: #2c3e50;
}

/* Layout */
header, main, footer {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Header Styles */
.main-header {
    text-align: center;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.subtitle {
    font-size: 1.2rem;
    color: #666;
    font-style: italic;
    margin-bottom: 1rem;
}

.collection-count {
    color: #8b4513;
    font-weight: bold;
}

/* Castle Grid */
.castle-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.castle-card {
    background: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.castle-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.card-header h3 {
    margin-bottom: 0.5rem;
}

.card-location {
    color: #8b4513;
    font-weight: bold;
    font-size: 0.9rem;
}

.card-description {
    margin: 1rem 0;
    color: #555;
}

.card-meta {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.card-style, .card-year {
    background: #f0f0f0;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    color: #666;
}

.card-footer {
    border-top: 1px solid #eee;
    padding-top: 1rem;
}

.read-more {
    display: inline-block;
    background: #8b4513;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.3s ease;
}

.read-more:hover {
    background: #a0522d;
}

/* Individual Castle Pages */
.castle-details {
    background: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.castle-location {
    color: #8b4513;
    font-size: 1.1rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 2rem;
}

.castle-overview, .castle-info, .key-features {
    margin-bottom: 3rem;
    padding: 1.5rem;
    background: #fafafa;
    border-radius: 6px;
}

.info-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
    margin-top: 1rem;
}

.info-grid dt {
    font-weight: bold;
    color: #2c3e50;
}

.info-grid dd {
    color: #555;
}

/* Navigation */
.nav-home, .footer-nav a {
    color: #8b4513;
    text-decoration: none;
    font-weight: bold;
    display: inline-block;
    margin-bottom: 1rem;
}

.nav-home:hover, .footer-nav a:hover {
    color: #a0522d;
    text-decoration: underline;
}

/* Links */
a {
    color: #8b4513;
    text-decoration: none;
    font-weight: bold;
}

a:hover {
    color: #a0522d;
    text-decoration: underline;
}

/* Lists */
ul, ol {
    margin-left: 2rem;
    margin-bottom: 1rem;
}

li {
    margin-bottom: 0.5rem;
    color: #555;
}

/* Sections */
section {
    margin-bottom: 3rem;
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Footer */
.main-footer {
    text-align: center;
    border-top: 2px solid #8b4513;
    margin-top: 3rem;
    color: #666;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.last-updated {
    font-size: 0.9rem;
    color: #999;
    margin-top: 0.5rem;
}

/* About Project Section */
.about-project {
    background: #f0f8ff;
    border-left: 4px solid #2980b9;
}

/* Enhanced Castle Page Styles */
.castle-period {
    color: #8b4513;
    font-style: italic;
    text-align: center;
    margin-bottom: 1rem;
}

.detailed-description {
    background: #fafafa;
    border-left: 4px solid #8b4513;
}

/* Timeline Styles */
.timeline {
    position: relative;
    padding-left: 2rem;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #8b4513;
}

.timeline-entry {
    position: relative;
    margin-bottom: 2rem;
    padding-left: 2rem;
}

.timeline-entry::before {
    content: '';
    position: absolute;
    left: -0.5rem;
    top: 0.2rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: #8b4513;
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px #8b4513;
}

.timeline-year {
    font-weight: bold;
    color: #8b4513;
    font-size: 1.1rem;
}

.timeline-event {
    margin-top: 0.5rem;
    color: #555;
}

/* Event Cards */
.event-card {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-left: 4px solid #8b4513;
}

.event-card h3 {
    color: #8b4513;
    margin-bottom: 0.5rem;
}

/* Dynasty Info */
.dynasty-info {
    background: #f0f4f8;
    border-left: 4px solid #2980b9;
}

/* Architectural Analysis */
.architectural-analysis {
    background: #f8f4f0;
    border-left: 4px solid #d68910;
}

/* Construction Details */
.construction-details {
    background: #f4f0f8;
    border-left: 4px solid #8e44ad;
}

/* Cultural Significance */
.cultural-significance {
    background: #f0f8f4;
    border-left: 4px solid #27ae60;
}

.legend-card, .ghost-story-card, .battle-card {
    background: #fafafa;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.legend-card h4, .ghost-story-card h4, .battle-card h4 {
    color: #27ae60;
    margin-bottom: 0.5rem;
}

.historical-context {
    font-style: italic;
    color: #666;
    margin-top: 0.5rem;
}

.battle-details {
    margin-top: 0.5rem;
}

.battle-details dt {
    font-weight: bold;
    color: #2c3e50;
    margin-top: 0.5rem;
}

/* Visitor Information */
.visitor-information {
    background: #f8f4f0;
    border-left: 4px solid #e67e22;
}

.visitor-details h4, .heritage-status h3, .restoration-info h3 {
    color: #e67e22;
    margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    body {
        font-size: 14px;
    }
    
    h1 {
        font-size: 2rem;
    }
    
    header, main, footer {
        padding: 1rem;
    }
    
    .castle-grid {
        grid-template-columns: 1fr;
    }
    
    .card-meta {
        flex-direction: column;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    h1 {
        font-size: 1.8rem;
    }
    
    header, main, footer {
        padding: 0.5rem;
    }
    
    .castle-card {
        padding: 1rem;
    }
}`;
      await this.atomicWriteFile(this.stylesCssPath, cssContent.trim());
      console.log('Created style.css with historic styling');
    }
    
    console.log('Phase 1 completed: Project structure initialized');
  }

  async loadExistingCastles() {
    // Try to load from unified database first, then fallback to regular castles.json
    const unifiedPath = path.join(this.projectRoot, 'castles_unified.json');
    try {
      await fs.access(unifiedPath);
      const data = await fs.readFile(unifiedPath, 'utf8');
      const castles = JSON.parse(data);
      console.log(`Loaded ${castles.length} castles from unified database`);
      return Array.isArray(castles) ? castles : [];
    } catch (error) {
      console.log('Unified database not found, loading from castles.json');
      try {
        const data = await fs.readFile(this.castlesJsonPath, 'utf8');
        const castles = JSON.parse(data);
        return Array.isArray(castles) ? castles : [];
      } catch (error2) {
        console.log('Error loading castles.json, returning empty array');
        return [];
      }
    }
  }

  getRandomUnusedCastle(existingCastles) {
    const existingIds = new Set(existingCastles.map(castle => castle.id));
    const existingNames = new Set(existingCastles.map(castle => castle.castleName.toLowerCase()));
    
    const availableCastles = this.realWorldCastles.filter(castle => 
      !existingIds.has(castle.id) && 
      !existingNames.has(castle.castleName.toLowerCase())
    );
    
    if (availableCastles.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableCastles.length);
    return availableCastles[randomIndex];
  }

  async addNewCastle() {
    console.log('Phase 2: Adding new castle to collection...');
    
    const existingCastles = await this.loadExistingCastles();
    const newCastle = this.getRandomUnusedCastle(existingCastles);
    
    if (!newCastle) {
      console.log('No more unique castles available to add');
      return existingCastles;
    }
    
    console.log(`AI is adding '${newCastle.castleName}' to the collection...`);
    
    const updatedCastles = [...existingCastles, newCastle];
    await this.atomicWriteFile(this.castlesJsonPath, JSON.stringify(updatedCastles, null, 2));
    
    console.log(`Phase 2 completed: ${newCastle.castleName} added successfully`);
    return updatedCastles;
  }

  generateCastleHtml(castle) {
    // Generate enhanced HTML with detailed information
    const detailedDescSection = castle.detailedDescription ? `
            <section class="detailed-description">
                <h2>Detailed History & Significance</h2>
                <p>${castle.detailedDescription}</p>
            </section>` : '';

    const timelineSection = castle.historicalTimeline ? `
            <section class="historical-timeline">
                <h2>Historical Timeline</h2>
                <div class="timeline">
                    ${castle.historicalTimeline.map(entry => `
                    <div class="timeline-entry">
                        <div class="timeline-year">${entry.year}</div>
                        <div class="timeline-event">${entry.event}</div>
                    </div>`).join('')}
                </div>
            </section>` : '';

    const dynastySection = castle.dynastyInfo ? `
            <section class="dynasty-info">
                <h2>Dynasty & Rulers</h2>
                <dl class="info-grid">
                    <dt>Dynasty:</dt>
                    <dd>${castle.dynastyInfo.dynasty}</dd>
                    <dt>Primary Ruler:</dt>
                    <dd>${castle.dynastyInfo.ruler || 'Multiple rulers'}</dd>
                    <dt>Dynasty Origin:</dt>
                    <dd>${castle.dynastyInfo.dynastyOrigin}</dd>
                    <dt>Significance:</dt>
                    <dd>${castle.dynastyInfo.significance || 'Major royal residence and fortress'}</dd>
                </dl>
                ${castle.dynastyInfo.rulers && Array.isArray(castle.dynastyInfo.rulers) ? `
                <h3>Notable Rulers</h3>
                <ul>
                    ${castle.dynastyInfo.rulers.map(ruler => `<li>${ruler}</li>`).join('')}
                </ul>` : ''}
            </section>` : '';

    const eventsSection = castle.notableEvents ? `
            <section class="notable-events">
                <h2>Notable Historical Events</h2>
                ${castle.notableEvents.map(event => `
                <div class="event-card">
                    <h3>${event.event} (${event.date})</h3>
                    <p>${event.significance}</p>
                </div>`).join('')}
            </section>` : '';

    const culturalSection = castle.culturalSignificance || castle.legends || castle.historicalEvents || castle.ghostStories || castle.historicalBattles ? `
            <section class="cultural-significance">
                <h2>Cultural Significance & Folklore</h2>
                ${castle.culturalSignificance ? `
                <div class="cultural-overview">
                    <h3>Cultural Significance</h3>
                    <p>${castle.culturalSignificance}</p>
                </div>` : ''}
                ${castle.legends && Array.isArray(castle.legends) ? `
                <div class="legends-section">
                    <h3>Legends & Folklore</h3>
                    ${castle.legends.map(legend => 
                        typeof legend === 'string' ? `<p class="legend-item">${legend}</p>` :
                        `<div class="legend-card">
                            <h4>${legend.title}</h4>
                            <p>${legend.narrative}</p>
                        </div>`
                    ).join('')}
                </div>` : ''}
                ${castle.historicalEvents && Array.isArray(castle.historicalEvents) ? `
                <div class="historical-events">
                    <h3>Key Historical Events</h3>
                    <ul class="historical-timeline">
                        ${castle.historicalEvents.map(event => `<li>${event}</li>`).join('')}
                    </ul>
                </div>` : ''}
                ${castle.ghostStories && Array.isArray(castle.ghostStories) ? `
                <div class="ghost-stories">
                    <h3>Ghost Stories & Hauntings</h3>
                    ${castle.ghostStories.map(story => `
                    <div class="ghost-story-card">
                        <h4>${story.spirit} - ${story.location}</h4>
                        <p>${story.story}</p>
                        ${story.historicalContext ? `<p class="historical-context"><strong>Historical Context:</strong> ${story.historicalContext}</p>` : ''}
                    </div>`).join('')}
                </div>` : ''}
                ${castle.historicalBattles && Array.isArray(castle.historicalBattles) ? `
                <div class="historical-battles">
                    <h3>Famous Battles & Sieges</h3>
                    ${castle.historicalBattles.map(battle => `
                    <div class="battle-card">
                        <h4>${battle.name}</h4>
                        <dl class="battle-details">
                            <dt>Participants:</dt><dd>${battle.participants}</dd>
                            <dt>Outcome:</dt><dd>${battle.outcome}</dd>
                            <dt>Significance:</dt><dd>${battle.significance}</dd>
                        </dl>
                    </div>`).join('')}
                </div>` : ''}
            </section>` : '';

    const visitorSection = castle.visitorInformation || castle.heritage || castle.restoration ? `
            <section class="visitor-information">
                <h2>Visitor Information & Heritage</h2>
                ${castle.visitorInformation ? `
                <div class="visitor-details">
                    <h3>Visiting Information</h3>
                    ${castle.visitorInformation.openingHours ? `
                    <h4>Opening Hours</h4>
                    <ul>
                        ${Object.entries(castle.visitorInformation.openingHours).map(([period, hours]) => 
                            `<li><strong>${period.charAt(0).toUpperCase() + period.slice(1)}:</strong> ${hours}</li>`
                        ).join('')}
                    </ul>` : ''}
                    ${castle.visitorInformation.ticketPrices ? `
                    <h4>Ticket Prices</h4>
                    <ul>
                        ${Object.entries(castle.visitorInformation.ticketPrices).map(([type, price]) => 
                            `<li><strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong> ${price}</li>`
                        ).join('')}
                    </ul>` : ''}
                    ${castle.visitorInformation.tours ? `
                    <h4>Tours & Accessibility</h4>
                    <p><strong>Duration:</strong> ${castle.visitorInformation.tours.guidedTourDuration || 'Varies'}</p>
                    ${castle.visitorInformation.tours.languages ? `<p><strong>Languages:</strong> ${castle.visitorInformation.tours.languages.join(', ')}</p>` : ''}
                    ${castle.visitorInformation.tours.booking ? `<p><strong>Booking:</strong> ${castle.visitorInformation.tours.booking}</p>` : ''}
                    ` : ''}
                </div>` : ''}
                ${castle.heritage ? `
                <div class="heritage-status">
                    <h3>Heritage & Conservation</h3>
                    ${castle.heritage.unescoStatus ? `<p><strong>UNESCO Status:</strong> ${castle.heritage.unescoStatus}</p>` : ''}
                    ${castle.heritage.conservationChallenges ? `<p><strong>Conservation Challenges:</strong> ${castle.heritage.conservationChallenges}</p>` : ''}
                </div>` : ''}
                ${castle.restoration ? `
                <div class="restoration-info">
                    <h3>Restoration Projects</h3>
                    ${castle.restoration.currentProjects ? `<p><strong>Current Projects:</strong> ${castle.restoration.currentProjects}</p>` : ''}
                    ${castle.restoration.completed ? `<p><strong>Recently Completed:</strong> ${castle.restoration.completed}</p>` : ''}
                    ${castle.restoration.ongoing ? `<p><strong>Ongoing Work:</strong> ${castle.restoration.ongoing}</p>` : ''}
                </div>` : ''}
            </section>` : '';

    const architectureSection = castle.architecturalAnalysis ? `
            <section class="architectural-analysis">
                <h2>Architectural Analysis</h2>
                <dl class="info-grid">
                    <dt>Defensive Features:</dt>
                    <dd>${castle.architecturalAnalysis.defensiveFeatures}</dd>
                    <dt>Materials:</dt>
                    <dd>${Array.isArray(castle.architecturalAnalysis.materials) ? 
                        castle.architecturalAnalysis.materials.join(', ') : 
                        castle.architecturalAnalysis.materials}</dd>
                    <dt>Dimensions:</dt>
                    <dd>${castle.architecturalAnalysis.dimensions}</dd>
                    <dt>Rooms/Spaces:</dt>
                    <dd>${castle.architecturalAnalysis.rooms}</dd>
                </dl>
                ${castle.architecturalAnalysis.structuralInnovations ? `
                <h3>Structural Innovations</h3>
                <ul>
                    ${castle.architecturalAnalysis.structuralInnovations.map(innovation => `<li>${innovation}</li>`).join('')}
                </ul>` : ''}
            </section>` : '';

    const constructionSection = castle.constructionDetails ? `
            <section class="construction-details">
                <h2>Construction Details</h2>
                <dl class="info-grid">
                    <dt>Chief Architect:</dt>
                    <dd>${castle.constructionDetails.chiefArchitect || castle.constructionDetails.chiefArchitects}</dd>
                    ${castle.constructionDetails.designer ? `
                    <dt>Designer:</dt>
                    <dd>${castle.constructionDetails.designer}</dd>` : ''}
                    ${castle.constructionDetails.cost ? `
                    <dt>Construction Cost:</dt>
                    <dd>${castle.constructionDetails.cost}</dd>` : ''}
                    ${castle.constructionDetails.workers ? `
                    <dt>Workforce:</dt>
                    <dd>${castle.constructionDetails.workers}</dd>` : ''}
                </dl>
                ${castle.constructionDetails.challenges ? `
                <h3>Construction Challenges</h3>
                <ul>
                    ${castle.constructionDetails.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                </ul>` : ''}
                ${castle.constructionDetails.evolutionPeriods ? `
                <h3>Construction Periods</h3>
                <ul>
                    ${castle.constructionDetails.evolutionPeriods.map(period => `<li>${period}</li>`).join('')}
                </ul>` : ''}
            </section>` : '';

    const engineeringSection = castle.engineeringDetails ? `
            <section class="engineering-details">
                <h2>Engineering & Technical Analysis</h2>
                ${castle.engineeringDetails.foundationEngineering ? `
                <div class="engineering-subsection">
                    <h3>Foundation Engineering</h3>
                    <dl class="info-grid">
                        <dt>Geological Base:</dt>
                        <dd>${castle.engineeringDetails.foundationEngineering.geologicalBase}</dd>
                        <dt>Formation Process:</dt>
                        <dd>${castle.engineeringDetails.foundationEngineering.formationProcess}</dd>
                    </dl>
                    <h4>Engineering Advantages</h4>
                    <ul>
                        ${castle.engineeringDetails.foundationEngineering.engineeringAdvantages.map(advantage => `<li>${advantage}</li>`).join('')}
                    </ul>
                </div>` : ''}
                ${castle.engineeringDetails.constructionTechniques ? `
                <div class="engineering-subsection">
                    <h3>Construction Techniques</h3>
                    ${Object.entries(castle.engineeringDetails.constructionTechniques).map(([technique, data]) => {
                        if (Array.isArray(data)) {
                            return `
                    <h4>${technique.charAt(0).toUpperCase() + technique.slice(1).replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <ul>
                        ${data.map(item => `<li>${item}</li>`).join('')}
                    </ul>`;
                        } else if (typeof data === 'string') {
                            return `
                    <dl class="info-grid">
                        <dt>${technique.charAt(0).toUpperCase() + technique.slice(1).replace(/([A-Z])/g, ' $1').trim()}:</dt>
                        <dd>${data}</dd>
                    </dl>`;
                        }
                        return '';
                    }).join('')}
                </div>` : ''}
                ${castle.engineeringDetails.siegeAdaptations ? `
                <div class="engineering-subsection">
                    <h3>Siege Warfare Adaptations</h3>
                    <ul>
                        ${castle.engineeringDetails.siegeAdaptations.map(adaptation => `<li>${adaptation}</li>`).join('')}
                    </ul>
                </div>` : ''}
                ${castle.engineeringDetails.materialProperties ? `
                <div class="engineering-subsection">
                    <h3>Material Properties & Engineering</h3>
                    <dl class="info-grid">
                        ${Object.entries(castle.engineeringDetails.materialProperties).map(([material, description]) => `
                        <dt>${material.charAt(0).toUpperCase() + material.slice(1)}:</dt>
                        <dd>${description}</dd>`).join('')}
                    </dl>
                </div>` : ''}
            </section>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${castle.castleName} | Comprehensive Castle Encyclopedia</title>
    <link rel="stylesheet" href="../style.css">
    <meta name="description" content="Comprehensive analysis of ${castle.castleName} in ${castle.country}. Detailed history, architecture, timelines, and dynasties exceeding Wikipedia standards.">
</head>
<body>
    <header>
        <nav>
            <a href="../index.html" class="nav-home">← Back to Castle Collection</a>
        </nav>
        <h1>${castle.castleName}</h1>
        <p class="castle-location">${castle.location}, ${castle.country}</p>
        <p class="castle-period">${castle.yearBuilt}</p>
    </header>

    <main>
        <article class="castle-details">
            <section class="castle-overview">
                <h2>Overview</h2>
                <p>${castle.shortDescription}</p>
            </section>

            ${detailedDescSection}

            <section class="basic-info">
                <h2>Basic Information</h2>
                <dl class="info-grid">
                    <dt>Architectural Style:</dt>
                    <dd>${castle.architecturalStyle}</dd>
                    
                    <dt>Construction Period:</dt>
                    <dd>${castle.yearBuilt}</dd>
                    
                    <dt>Location:</dt>
                    <dd>${castle.location}, ${castle.country}</dd>
                </dl>
            </section>

            ${timelineSection}

            ${dynastySection}

            ${eventsSection}

            ${culturalSection}

            ${architectureSection}

            ${constructionSection}

            ${engineeringSection}

            ${visitorSection}

            <section class="key-features">
                <h2>Key Features & Highlights</h2>
                <ul>
                    ${castle.keyFeatures.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </section>
        </article>
    </main>

    <footer>
        <nav class="footer-nav">
            <a href="../index.html">Return to Main Collection</a>
        </nav>
        <p>&copy; ${new Date().getFullYear()} Castles Over The World - Comprehensive Encyclopedia</p>
    </footer>
</body>
</html>`;
  }

  generateIndexHtml(castles) {
    const castleCount = castles.length;
    const currentYear = new Date().getFullYear();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Castles Over The World - Historic Castle Encyclopedia</title>
    <link rel="stylesheet" href="style.css">
    <meta name="description" content="Explore ${castleCount} magnificent castles from around the world. Discover their history, architecture, and fascinating stories.">
</head>
<body>
    <header class="main-header">
        <h1>Castles Over The World</h1>
        <p class="subtitle">A Self-Expanding Encyclopedia of Historic Fortresses</p>
        <p class="collection-count">Currently featuring <strong>${castleCount}</strong> magnificent castles</p>
    </header>

    <main>
        <section class="castle-collection">
            <h2>Explore Our Castle Collection</h2>
            
            ${castles.length === 0 ? 
                '<p class="no-castles">No castles in the collection yet. Run the script to add your first castle!</p>' :
                `<nav class="castle-grid" role="navigation" aria-label="Castle collection navigation">
${castles.map(castle => `                <article class="castle-card">
                    <header class="card-header">
                        <h3><a href="articles/${castle.id}.html">${castle.castleName}</a></h3>
                        <p class="card-location">${castle.country}</p>
                    </header>
                    <div class="card-content">
                        <p class="card-description">${castle.shortDescription.substring(0, 120)}${castle.shortDescription.length > 120 ? '...' : ''}</p>
                        <div class="card-meta">
                            <span class="card-style">${castle.architecturalStyle}</span>
                            <span class="card-year">${castle.yearBuilt}</span>
                        </div>
                    </div>
                    <footer class="card-footer">
                        <a href="articles/${castle.id}.html" class="read-more">Explore Castle →</a>
                    </footer>
                </article>`).join('\n')}
            </nav>`
            }
        </section>

        <section class="about-project">
            <h2>About This Project</h2>
            <p>This encyclopedia grows automatically with each execution, adding new castles from around the world. Each castle entry includes detailed information about its history, architecture, and unique features.</p>
        </section>
    </main>

    <footer class="main-footer">
        <p>&copy; ${currentYear} Castles Over The World | Self-Expanding Encyclopedia Project</p>
        <p class="last-updated">Last updated: ${new Date().toLocaleDateString()}</p>
    </footer>
</body>
</html>`;
  }

  async regenerateWebsite(castles) {
    console.log('Phase 3: Regenerating website...');
    
    try {
      const files = await fs.readdir(this.articlesDir);
      const htmlFiles = files.filter(file => file.endsWith('.html'));
      for (const file of htmlFiles) {
        await fs.unlink(path.join(this.articlesDir, file));
      }
      console.log(`Cleaned up ${htmlFiles.length} old HTML files`);
    } catch (error) {
      console.log('No existing HTML files to clean up');
    }
    
    for (const castle of castles) {
      const htmlContent = this.generateCastleHtml(castle);
      const htmlPath = path.join(this.articlesDir, `${castle.id}.html`);
      await this.atomicWriteFile(htmlPath, htmlContent);
    }
    console.log(`Generated ${castles.length} castle pages`);
    
    const indexContent = this.generateIndexHtml(castles);
    await this.atomicWriteFile(this.indexHtmlPath, indexContent);
    console.log('Generated index.html');
    
    console.log('Phase 3 completed: Website regenerated successfully');
  }

  async run() {
    try {
      await this.initializeProject();
      const updatedCastles = await this.addNewCastle();
      await this.regenerateWebsite(updatedCastles);
      
      if (updatedCastles.length > 0) {
        const latestCastle = updatedCastles[updatedCastles.length - 1];
        console.log(`\nSuccess! '${latestCastle.castleName}' was added. The site now features ${updatedCastles.length} castles.`);
      } else {
        console.log('\nProject initialized but no new castles were added.');
      }
      
    } catch (error) {
      console.error('Error during execution:', error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const generator = new CastleGenerator();
  generator.run();
}

module.exports = CastleGenerator;