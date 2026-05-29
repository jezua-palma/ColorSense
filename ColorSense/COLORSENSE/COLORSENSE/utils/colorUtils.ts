interface ColorInfo {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  family: string;
}

interface NamedColor {
  name: string;
  hex: string;
  family: string;
}

interface CachedColor extends NamedColor {
  lab: { l: number; a: number; b: number };
}

const namedColors: NamedColor[] = [
  // BLACK FAMILY
  { name: "Black", hex: "#000000", family: "Black" },
  { name: "Black Blue", hex: "#040720", family: "Black" },
  { name: "Night", hex: "#0C090A", family: "Black" },
  { name: "Charcoal", hex: "#34282C", family: "Black" },
  { name: "Oil", hex: "#3B3131", family: "Black" },
  { name: "Light Black", hex: "#454545", family: "Black" },
  { name: "Black Cat", hex: "#413839", family: "Black" },
  { name: "Iridium", hex: "#3D3C3A", family: "Black" },
  { name: "Black Eel", hex: "#463E3F", family: "Black" },
  { name: "Black Cow", hex: "#4C4646", family: "Black" },
  { name: "Midnight", hex: "#2B1B17", family: "Black" },
  { name: "Dark Maroon", hex: "#2F0909", family: "Black" },
  { name: "Black Bean", hex: "#3D0C02", family: "Black" },

  // GRAY FAMILY
  { name: "Stormy Gray", hex: "#3A3B3C", family: "Gray" },
  { name: "Dark Steampunk", hex: "#4D4D4F", family: "Gray" },
  { name: "Gray Wolf", hex: "#504A4B", family: "Gray" },
  { name: "Vampire Gray", hex: "#565051", family: "Gray" },
  { name: "Iron Gray", hex: "#52595D", family: "Gray" },
  { name: "Gray Dolphin", hex: "#5C5858", family: "Gray" },
  { name: "Carbon Gray", hex: "#625D5D", family: "Gray" },
  { name: "Ash Gray", hex: "#666362", family: "Gray" },
  { name: "Dim Gray", hex: "#696969", family: "Gray" },
  { name: "Nardo Gray", hex: "#686A6C", family: "Gray" },
  { name: "Cloudy Gray", hex: "#6D6968", family: "Gray" },
  { name: "Smokey Gray", hex: "#726E6D", family: "Gray" },
  { name: "Alien Gray", hex: "#736F6E", family: "Gray" },
  { name: "Sonic Silver", hex: "#757575", family: "Gray" },
  { name: "Platinum Gray", hex: "#797979", family: "Gray" },
  { name: "Granite", hex: "#837E7C", family: "Gray" },
  { name: "Gray", hex: "#808080", family: "Gray" },
  { name: "Battleship Gray", hex: "#848482", family: "Gray" },
  { name: "Sheet Metal", hex: "#888B90", family: "Gray" },
  { name: "Dark Gainsboro", hex: "#8C8C8C", family: "Gray" },
  { name: "Gunmetal Gray", hex: "#8D918D", family: "Gray" },
  { name: "Cold Metal", hex: "#9B9A96", family: "Gray" },
  { name: "Stainless Steel Gray", hex: "#99A3A3", family: "Gray" },
  { name: "Dark Gray", hex: "#A9A9A9", family: "Gray" },
  { name: "Chrome Aluminum", hex: "#A8A9AD", family: "Gray" },
  { name: "Gray Cloud", hex: "#B6B6B4", family: "Gray" },
  { name: "Metal", hex: "#B6B6B6", family: "Gray" },
  { name: "Silver", hex: "#C0C0C0", family: "Gray" },
  { name: "Steampunk", hex: "#C9C1C1", family: "Gray" },
  { name: "Pale Silver", hex: "#C9C0BB", family: "Gray" },
  { name: "Gear Steel Gray", hex: "#C0C6C7", family: "Gray" },
  { name: "Gray Goose", hex: "#D1D0CE", family: "Gray" },
  { name: "Platinum Silver", hex: "#CECECE", family: "Gray" },
  { name: "Light Gray", hex: "#D3D3D3", family: "Gray" },
  { name: "Silver White", hex: "#DADBDD", family: "Gray" },
  { name: "Gainsboro", hex: "#DCDCDC", family: "Gray" },
  { name: "Light Steel Gray", hex: "#E0E5E5", family: "Gray" },
  { name: "Metallic Silver", hex: "#BCC6CC", family: "Gray" },
  { name: "Blue Gray", hex: "#98AFC7", family: "Gray" },
  { name: "Roman Silver", hex: "#838996", family: "Gray" },
  { name: "Light Slate Gray", hex: "#778899", family: "Gray" },
  { name: "Slate Gray", hex: "#708090", family: "Gray" },
  { name: "Rat Gray", hex: "#6D7B8D", family: "Gray" },
  { name: "Slate Granite Gray", hex: "#657383", family: "Gray" },
  { name: "Jet Gray", hex: "#616D7E", family: "Gray" },
  { name: "Steel Gray", hex: "#71797E", family: "Gray" },
  { name: "Gray Brown", hex: "#3D3635", family: "Gray" },
  { name: "Western Charcoal", hex: "#49413F", family: "Gray" },
  { name: "Gunmetal", hex: "#2C3539", family: "Gray" },
  { name: "Taupe", hex: "#483C32", family: "Gray" },
  { name: "Dark Grayish Olive", hex: "#4A412A", family: "Gray" },

  // BLUE FAMILY
  { name: "Mist Blue", hex: "#646D7E", family: "Blue" },
  { name: "Marble Blue", hex: "#566D7E", family: "Blue" },
  { name: "Slate Blue Gray", hex: "#737CA1", family: "Blue" },
  { name: "Light Purple Blue", hex: "#728FCE", family: "Blue" },
  { name: "Azure Blue", hex: "#4863A0", family: "Blue" },
  { name: "Estoril Blue", hex: "#2F539B", family: "Blue" },
  { name: "Blue Jay", hex: "#2B547E", family: "Blue" },
  { name: "Charcoal Blue", hex: "#36454F", family: "Blue" },
  { name: "Dark Blue Gray", hex: "#29465B", family: "Blue" },
  { name: "Dark Slate", hex: "#2B3856", family: "Blue" },
  { name: "Deep Sea Blue", hex: "#123456", family: "Blue" },
  { name: "Night Blue", hex: "#151B54", family: "Blue" },
  { name: "Midnight Blue", hex: "#191970", family: "Blue" },
  { name: "Navy", hex: "#000080", family: "Blue" },
  { name: "Denim Dark Blue", hex: "#151B8D", family: "Blue" },
  { name: "Dark Blue", hex: "#00008B", family: "Blue" },
  { name: "Lapis Blue", hex: "#15317E", family: "Blue" },
  { name: "New Midnight Blue", hex: "#0000A0", family: "Blue" },
  { name: "Earth Blue", hex: "#0000A5", family: "Blue" },
  { name: "Cobalt Blue", hex: "#0020C2", family: "Blue" },
  { name: "Medium Blue", hex: "#0000CD", family: "Blue" },
  { name: "Blueberry Blue", hex: "#0041C2", family: "Blue" },
  { name: "Canary Blue", hex: "#2916F5", family: "Blue" },
  { name: "Blue", hex: "#0000FF", family: "Blue" },
  { name: "Samco Blue", hex: "#0002FF", family: "Blue" },
  { name: "Bright Blue", hex: "#0909FF", family: "Blue" },
  { name: "Blue Orchid", hex: "#1F45FC", family: "Blue" },
  { name: "Sapphire Blue", hex: "#2554C7", family: "Blue" },
  { name: "Blue Eyes", hex: "#1569C7", family: "Blue" },
  { name: "Bright Navy Blue", hex: "#1974D2", family: "Blue" },
  { name: "Balloon Blue", hex: "#2B60DE", family: "Blue" },
  { name: "Royal Blue", hex: "#4169E1", family: "Blue" },
  { name: "Ocean Blue", hex: "#2B65EC", family: "Blue" },
  { name: "Dark Sky Blue", hex: "#0059FF", family: "Blue" },
  { name: "Blue Ribbon", hex: "#306EFF", family: "Blue" },
  { name: "Blue Dress", hex: "#157DEC", family: "Blue" },
  { name: "Neon Blue", hex: "#1589FF", family: "Blue" },
  { name: "Dodger Blue", hex: "#1E90FF", family: "Blue" },
  { name: "Water Blue", hex: "#0E87CC", family: "Blue" },
  { name: "Glacial Blue Ice", hex: "#368BC1", family: "Blue" },
  { name: "Steel Blue", hex: "#4682B4", family: "Blue" },
  { name: "Silk Blue", hex: "#488AC7", family: "Blue" },
  { name: "Windows Blue", hex: "#357EC7", family: "Blue" },
  { name: "Blue Ivy", hex: "#3090C7", family: "Blue" },
  { name: "Cyan Blue", hex: "#14A3C7", family: "Blue" },
  { name: "Blue Koi", hex: "#659EC7", family: "Blue" },
  { name: "Columbia Blue", hex: "#87AFC7", family: "Blue" },
  { name: "Baby Blue", hex: "#95B9C7", family: "Blue" },
  { name: "Cornflower Blue", hex: "#6495ED", family: "Blue" },
  { name: "Sky Blue Dress", hex: "#6698FF", family: "Blue" },
  { name: "Iceberg", hex: "#56A5EC", family: "Blue" },
  { name: "Butterfly Blue", hex: "#38ACEC", family: "Blue" },
  { name: "Deep Sky Blue", hex: "#00BFFF", family: "Blue" },
  { name: "Midday Blue", hex: "#3BB9FF", family: "Blue" },
  { name: "Crystal Blue", hex: "#5CB3FF", family: "Blue" },
  { name: "Denim Blue", hex: "#79BAEC", family: "Blue" },
  { name: "Day Sky Blue", hex: "#82CAFF", family: "Blue" },
  { name: "Light Sky Blue", hex: "#87CEFA", family: "Blue" },
  { name: "Sky Blue", hex: "#87CEEB", family: "Blue" },
  { name: "Jeans Blue", hex: "#A0CFEC", family: "Blue" },
  { name: "Blue Angel", hex: "#B7CEEC", family: "Blue" },
  { name: "Pastel Blue", hex: "#B4CFEC", family: "Blue" },
  { name: "Light Day Blue", hex: "#ADDFFF", family: "Blue" },
  { name: "Sea Blue", hex: "#C2DFFF", family: "Blue" },
  { name: "Heavenly Blue", hex: "#C6DEFF", family: "Blue" },
  { name: "Robin Egg Blue", hex: "#BDEDFF", family: "Blue" },
  { name: "Powder Blue", hex: "#B0E0E6", family: "Blue" },
  { name: "Coral Blue", hex: "#AFDCEC", family: "Blue" },
  { name: "Light Blue", hex: "#ADD8E6", family: "Blue" },
  { name: "Light Steel Blue", hex: "#B0CFDE", family: "Blue" },
  { name: "Gulf Blue", hex: "#C9DFEC", family: "Blue" },
  { name: "Pastel Light Blue", hex: "#D5D6EA", family: "Blue" },
  { name: "Lavender Blue", hex: "#E3E4FA", family: "Blue" },
  { name: "White Blue", hex: "#DBE9FA", family: "Blue" },
  { name: "Water", hex: "#EBF4FA", family: "Blue" },
  { name: "Alice Blue", hex: "#F0F8FF", family: "Blue" },
  { name: "Blurple", hex: "#5865F2", family: "Blue" },
  { name: "Light Slate Blue", hex: "#736AFF", family: "Blue" },
  { name: "Slate Blue", hex: "#6A5ACD", family: "Blue" },
  { name: "Blue Lotus", hex: "#6960EC", family: "Blue" },
  { name: "Medium Slate Blue", hex: "#7B68EE", family: "Blue" },
  { name: "Blue Whale", hex: "#342D7E", family: "Blue" },
  { name: "Blue Violet", hex: "#8A2BE2", family: "Blue" },
  { name: "Blue Magenta", hex: "#822EFF", family: "Blue" },
  { name: "Dark Blurple", hex: "#5539CC", family: "Blue" },
  { name: "Deep Periwinkle", hex: "#5453A6", family: "Blue" },
  { name: "Dark Slate Blue", hex: "#483D8B", family: "Blue" },

  // CYAN/TEAL FAMILY
  { name: "Lavender", hex: "#E6E6FA", family: "Cyan" },
  { name: "Azure", hex: "#F0FFFF", family: "Cyan" },
  { name: "Light Cyan", hex: "#E0FFFF", family: "Cyan" },
  { name: "Light Slate", hex: "#CCFFFF", family: "Cyan" },
  { name: "Electric Blue", hex: "#9AFEFF", family: "Cyan" },
  { name: "Tron Blue", hex: "#7DFDFE", family: "Cyan" },
  { name: "Blue Zircon", hex: "#57FEFF", family: "Cyan" },
  { name: "Cyan", hex: "#00FFFF", family: "Cyan" },
  { name: "Aqua", hex: "#00FFFF", family: "Cyan" },
  { name: "Bright Cyan", hex: "#0AFFFF", family: "Cyan" },
  { name: "Celeste", hex: "#50EBEC", family: "Cyan" },
  { name: "Blue Diamond", hex: "#4EE2EC", family: "Cyan" },
  { name: "Bright Turquoise", hex: "#16E2F5", family: "Cyan" },
  { name: "Blue Lagoon", hex: "#8EEBEC", family: "Cyan" },
  { name: "Pale Turquoise", hex: "#AFEEEE", family: "Cyan" },
  { name: "Pale Blue Lily", hex: "#CFECEC", family: "Cyan" },
  { name: "Light Teal", hex: "#B3D9D9", family: "Cyan" },
  { name: "Tiffany Blue", hex: "#81D8D0", family: "Cyan" },
  { name: "Blue Hosta", hex: "#77BFC7", family: "Cyan" },
  { name: "Cyan Opaque", hex: "#92C7C7", family: "Cyan" },
  { name: "Northern Lights Blue", hex: "#78C7C7", family: "Cyan" },
  { name: "Blue Green", hex: "#7BCCB5", family: "Cyan" },
  { name: "Medium Aqua Marine", hex: "#66CDAA", family: "Cyan" },
  { name: "Aqua Seafoam Green", hex: "#93E9BE", family: "Cyan" },
  { name: "Magic Mint", hex: "#AAF0D1", family: "Cyan" },
  { name: "Light Aquamarine", hex: "#93FFE8", family: "Cyan" },
  { name: "Aquamarine", hex: "#7FFFD4", family: "Cyan" },
  { name: "Bright Teal", hex: "#01F9C6", family: "Cyan" },
  { name: "Turquoise", hex: "#40E0D0", family: "Cyan" },
  { name: "Medium Turquoise", hex: "#48D1CC", family: "Cyan" },
  { name: "Deep Turquoise", hex: "#48CCCD", family: "Cyan" },
  { name: "Jellyfish", hex: "#46C7C7", family: "Cyan" },
  { name: "Blue Turquoise", hex: "#43C6DB", family: "Cyan" },
  { name: "Dark Turquoise", hex: "#00CED1", family: "Cyan" },
  { name: "Macaw Blue Green", hex: "#43BFC7", family: "Cyan" },
  { name: "Light Sea Green", hex: "#20B2AA", family: "Cyan" },
  { name: "Seafoam Green", hex: "#3EA99F", family: "Cyan" },
  { name: "Cadet Blue", hex: "#5F9EA0", family: "Cyan" },
  { name: "Deep Sea", hex: "#3B9C9C", family: "Cyan" },
  { name: "Dark Cyan", hex: "#008B8B", family: "Cyan" },
  { name: "Teal Green", hex: "#00827F", family: "Cyan" },
  { name: "Teal", hex: "#008080", family: "Cyan" },
  { name: "Teal Blue", hex: "#007C80", family: "Cyan" },
  { name: "Medium Teal", hex: "#045F5F", family: "Cyan" },
  { name: "Dark Teal", hex: "#045D5D", family: "Cyan" },
  { name: "Deep Teal", hex: "#033E3E", family: "Cyan" },
  { name: "Dark Slate Gray", hex: "#25383C", family: "Cyan" },
  { name: "Blue Moss Green", hex: "#3C565B", family: "Cyan" },
  { name: "Beetle Green", hex: "#4C787E", family: "Cyan" },
  { name: "Grayish Turquoise", hex: "#5E7D7E", family: "Cyan" },
  { name: "Greenish Blue", hex: "#307D7E", family: "Cyan" },
  { name: "Aquamarine Stone", hex: "#348781", family: "Cyan" },
  { name: "Sea Turtle Green", hex: "#438D80", family: "Cyan" },
  { name: "Dull Sea Green", hex: "#4E8975", family: "Cyan" },
  { name: "Dark Green Blue", hex: "#1F6357", family: "Cyan" },
  { name: "Deep Sea Green", hex: "#306754", family: "Cyan" },
  { name: "Bottle Green", hex: "#006A4E", family: "Cyan" },

  // GREEN FAMILY
  { name: "Sea Green", hex: "#2E8B57", family: "Green" },
  { name: "Elf Green", hex: "#1B8A6B", family: "Green" },
  { name: "Dark Mint", hex: "#31906E", family: "Green" },
  { name: "Jade", hex: "#00A36C", family: "Green" },
  { name: "Earth Green", hex: "#34A56F", family: "Green" },
  { name: "Chrome Green", hex: "#1AA260", family: "Green" },
  { name: "Mint", hex: "#3EB489", family: "Green" },
  { name: "Emerald", hex: "#50C878", family: "Green" },
  { name: "Isle Of Man Green", hex: "#22CE83", family: "Green" },
  { name: "Medium Sea Green", hex: "#3CB371", family: "Green" },
  { name: "Metallic Green", hex: "#7C9D8E", family: "Green" },
  { name: "Camouflage Green", hex: "#78866B", family: "Green" },
  { name: "Sage Green", hex: "#848B79", family: "Green" },
  { name: "Hazel Green", hex: "#617C58", family: "Green" },
  { name: "Venom Green", hex: "#728C00", family: "Green" },
  { name: "Olive Drab", hex: "#6B8E23", family: "Green" },
  { name: "Olive", hex: "#808000", family: "Green" },
  { name: "Ebony", hex: "#555D50", family: "Green" },
  { name: "Dark Olive Green", hex: "#556B2F", family: "Green" },
  { name: "Military Green", hex: "#4E5B31", family: "Green" },
  { name: "Green Leaves", hex: "#3A5F0B", family: "Green" },
  { name: "Army Green", hex: "#4B5320", family: "Green" },
  { name: "Fern Green", hex: "#667C26", family: "Green" },
  { name: "Fall Forest Green", hex: "#4E9258", family: "Green" },
  { name: "Irish Green", hex: "#08A04B", family: "Green" },
  { name: "Pine Green", hex: "#387C44", family: "Green" },
  { name: "Medium Forest Green", hex: "#347235", family: "Green" },
  { name: "Racing Green", hex: "#27742C", family: "Green" },
  { name: "Jungle Green", hex: "#347C2C", family: "Green" },
  { name: "Cactus Green", hex: "#227442", family: "Green" },
  { name: "Forest Green", hex: "#228B22", family: "Green" },
  { name: "Green", hex: "#008000", family: "Green" },
  { name: "Dark Green", hex: "#006400", family: "Green" },
  { name: "Deep Green", hex: "#056608", family: "Green" },
  { name: "Deep Emerald Green", hex: "#046307", family: "Green" },
  { name: "Hunter Green", hex: "#355E3B", family: "Green" },
  { name: "Dark Forest Green", hex: "#254117", family: "Green" },
  { name: "Lotus Green", hex: "#004225", family: "Green" },
  { name: "Broccoli Green", hex: "#026C3D", family: "Green" },
  { name: "Seaweed Green", hex: "#437C17", family: "Green" },
  { name: "Shamrock Green", hex: "#347C17", family: "Green" },
  { name: "Green Onion", hex: "#6AA121", family: "Green" },
  { name: "Moss Green", hex: "#8A9A5B", family: "Green" },
  { name: "Grass Green", hex: "#3F9B0B", family: "Green" },
  { name: "Green Pepper", hex: "#4AA02C", family: "Green" },
  { name: "Dark Lime Green", hex: "#41A317", family: "Green" },
  { name: "Parrot Green", hex: "#12AD2B", family: "Green" },
  { name: "Clover Green", hex: "#3EA055", family: "Green" },
  { name: "Dinosaur Green", hex: "#73A16C", family: "Green" },
  { name: "Green Snake", hex: "#6CBB3C", family: "Green" },
  { name: "Alien Green", hex: "#6CC417", family: "Green" },
  { name: "Green Apple", hex: "#4CC417", family: "Green" },
  { name: "Lime Green", hex: "#32CD32", family: "Green" },
  { name: "Pea Green", hex: "#52D017", family: "Green" },
  { name: "Kelly Green", hex: "#4CC552", family: "Green" },
  { name: "Zombie Green", hex: "#54C571", family: "Green" },
  { name: "Green Peas", hex: "#89C35C", family: "Green" },
  { name: "Dollar Bill Green", hex: "#85BB65", family: "Green" },
  { name: "Frog Green", hex: "#99C68E", family: "Green" },
  { name: "Turquoise Green", hex: "#A0D6B4", family: "Green" },
  { name: "Dark Sea Green", hex: "#8FBC8F", family: "Green" },
  { name: "Basil Green", hex: "#829F82", family: "Green" },
  { name: "Gray Green", hex: "#A2AD9C", family: "Green" },
  { name: "Light Olive Green", hex: "#B8BC86", family: "Green" },
  { name: "Iguana Green", hex: "#9CB071", family: "Green" },
  { name: "Citron Green", hex: "#8FB31D", family: "Green" },
  { name: "Acid Green", hex: "#B0BF1A", family: "Green" },
  { name: "Avocado Green", hex: "#B2C248", family: "Green" },
  { name: "Pistachio Green", hex: "#9DC209", family: "Green" },
  { name: "Salad Green", hex: "#A1C935", family: "Green" },
  { name: "Yellow Green", hex: "#9ACD32", family: "Green" },
  { name: "Pastel Green", hex: "#77DD77", family: "Green" },
  { name: "Hummingbird Green", hex: "#7FE817", family: "Green" },
  { name: "Nebula Green", hex: "#59E817", family: "Green" },
  { name: "Stoplight Go Green", hex: "#57E964", family: "Green" },
  { name: "Neon Green", hex: "#16F529", family: "Green" },
  { name: "Jade Green", hex: "#5EFB6E", family: "Green" },
  { name: "Spring Green", hex: "#00FF7F", family: "Green" },
  { name: "Ocean Green", hex: "#00FF80", family: "Green" },
  { name: "Lime Mint Green", hex: "#36F57F", family: "Green" },
  { name: "Medium Spring Green", hex: "#00FA9A", family: "Green" },
  { name: "Aqua Green", hex: "#12E193", family: "Green" },
  { name: "Emerald Green", hex: "#5FFB17", family: "Green" },
  { name: "Lime", hex: "#00FF00", family: "Green" },
  { name: "Lawn Green", hex: "#7CFC00", family: "Green" },
  { name: "Bright Green", hex: "#66FF00", family: "Green" },
  { name: "Chartreuse", hex: "#7FFF00", family: "Green" },
  { name: "Yellow Lawn Green", hex: "#87F717", family: "Green" },
  { name: "Aloe Vera Green", hex: "#98F516", family: "Green" },
  { name: "Dull Green Yellow", hex: "#B1FB17", family: "Green" },
  { name: "Lemon Green", hex: "#ADF802", family: "Green" },
  { name: "Green Yellow", hex: "#ADFF2F", family: "Green" },
  { name: "Chameleon Green", hex: "#BDF516", family: "Green" },
  { name: "Neon Yellow Green", hex: "#DAEE01", family: "Green" },
  { name: "Yellow Green Grosbeak", hex: "#E2F516", family: "Green" },
  { name: "Tea Green", hex: "#CCFB5D", family: "Green" },
  { name: "Slime Green", hex: "#BCE954", family: "Green" },
  { name: "Algae Green", hex: "#64E986", family: "Green" },
  { name: "Light Green", hex: "#90EE90", family: "Green" },
  { name: "Dragon Green", hex: "#6AFB92", family: "Green" },
  { name: "Pale Green", hex: "#98FB98", family: "Green" },
  { name: "Mint Green", hex: "#98FF98", family: "Green" },
  { name: "Green Thumb", hex: "#B5EAAA", family: "Green" },
  { name: "Light Jade", hex: "#C3FDB8", family: "Green" },
  { name: "Light Mint Green", hex: "#C2E5D3", family: "Green" },
  { name: "Light Rose Green", hex: "#DBF9DB", family: "Green" },
  { name: "Chrome White", hex: "#E8F1D4", family: "Green" },
  { name: "Honey Dew", hex: "#F0FFF0", family: "Green" },
  { name: "Mint Cream", hex: "#F5FFFA", family: "Green" },

  // YELLOW FAMILY
  { name: "Lemon Chiffon", hex: "#FFFACD", family: "Yellow" },
  { name: "Parchment", hex: "#FFFFC2", family: "Yellow" },
  { name: "Cream", hex: "#FFFFCC", family: "Yellow" },
  { name: "Cream White", hex: "#FFFDD0", family: "Yellow" },
  { name: "Light Goldenrod Yellow", hex: "#FAFAD2", family: "Yellow" },
  { name: "Light Yellow", hex: "#FFFFE0", family: "Yellow" },
  { name: "Beige", hex: "#F5F5DC", family: "Yellow" },
  { name: "White Yellow", hex: "#F2F0DF", family: "Yellow" },
  { name: "Cornsilk", hex: "#FFF8DC", family: "Yellow" },
  { name: "Blonde", hex: "#FBF6D9", family: "Yellow" },
  { name: "Antique White", hex: "#FAEBD7", family: "Yellow" },
  { name: "Light Beige", hex: "#FFF0DB", family: "Yellow" },
  { name: "Papaya Whip", hex: "#FFEFD5", family: "Yellow" },
  { name: "Champagne", hex: "#F7E7CE", family: "Yellow" },
  { name: "Blanched Almond", hex: "#FFEBCD", family: "Yellow" },
  { name: "Bisque", hex: "#FFE4C4", family: "Yellow" },
  { name: "Wheat", hex: "#F5DEB3", family: "Yellow" },
  { name: "Moccasin", hex: "#FFE4B5", family: "Yellow" },
  { name: "Peach", hex: "#FFE5B4", family: "Yellow" },
  { name: "Light Orange", hex: "#FED8B1", family: "Yellow" },
  { name: "Peach Puff", hex: "#FFDAB9", family: "Yellow" },
  { name: "Coral Peach", hex: "#FBD5AB", family: "Yellow" },
  { name: "Navajo White", hex: "#FFDEAD", family: "Yellow" },
  { name: "Golden Blonde", hex: "#FBE7A1", family: "Yellow" },
  { name: "Golden Silk", hex: "#F3E3C3", family: "Yellow" },
  { name: "Dark Blonde", hex: "#F0E2B6", family: "Yellow" },
  { name: "Light Gold", hex: "#F1E5AC", family: "Yellow" },
  { name: "Vanilla", hex: "#F3E5AB", family: "Yellow" },
  { name: "Tan Brown", hex: "#ECE5B6", family: "Yellow" },
  { name: "Dirty White", hex: "#E8E4C9", family: "Yellow" },
  { name: "Pale Goldenrod", hex: "#EEE8AA", family: "Yellow" },
  { name: "Khaki", hex: "#F0E68C", family: "Yellow" },
  { name: "Cardboard Brown", hex: "#EDDA74", family: "Yellow" },
  { name: "Harvest Gold", hex: "#EDE275", family: "Yellow" },
  { name: "Sun Yellow", hex: "#FFE87C", family: "Yellow" },
  { name: "Corn Yellow", hex: "#FFF380", family: "Yellow" },
  { name: "Pastel Yellow", hex: "#FAF884", family: "Yellow" },
  { name: "Neon Yellow", hex: "#FFFF33", family: "Yellow" },
  { name: "Yellow", hex: "#FFFF00", family: "Yellow" },
  { name: "Lemon Yellow", hex: "#FEF250", family: "Yellow" },
  { name: "Canary Yellow", hex: "#FFEF00", family: "Yellow" },
  { name: "Banana Yellow", hex: "#F5E216", family: "Yellow" },
  { name: "Mustard Yellow", hex: "#FFDB58", family: "Yellow" },
  { name: "Golden Yellow", hex: "#FFDF00", family: "Yellow" },
  { name: "Bold Yellow", hex: "#F9DB24", family: "Yellow" },
  { name: "Safety Yellow", hex: "#EED202", family: "Yellow" },
  { name: "Rubber Ducky Yellow", hex: "#FFD801", family: "Yellow" },
  { name: "Gold", hex: "#FFD700", family: "Yellow" },
  { name: "Bright Gold", hex: "#FDD017", family: "Yellow" },
  { name: "Chrome Gold", hex: "#FFCE44", family: "Yellow" },
  { name: "Golden Brown", hex: "#EAC117", family: "Yellow" },
  { name: "Deep Yellow", hex: "#F6BE00", family: "Yellow" },
  { name: "Macaroni and Cheese", hex: "#F2BB66", family: "Yellow" },
  { name: "Amber", hex: "#FFBF00", family: "Yellow" },
  { name: "Saffron", hex: "#FBB917", family: "Yellow" },
  { name: "Neon Gold", hex: "#FDBD01", family: "Yellow" },
  { name: "Beer", hex: "#FBB117", family: "Yellow" },
  { name: "Yellow Orange", hex: "#FFAE42", family: "Yellow" },

  // ORANGE FAMILY
  { name: "Cantaloupe", hex: "#FFA62F", family: "Orange" },
  { name: "Cheese Orange", hex: "#FFA600", family: "Orange" },
  { name: "Orange", hex: "#FFA500", family: "Orange" },
  { name: "Brown Sand", hex: "#EE9A4D", family: "Orange" },
  { name: "Sandy Brown", hex: "#F4A460", family: "Orange" },
  { name: "Brown Sugar", hex: "#E2A76F", family: "Orange" },
  { name: "Camel Brown", hex: "#C19A6B", family: "Orange" },
  { name: "Deer Brown", hex: "#E6BF83", family: "Orange" },
  { name: "Burly Wood", hex: "#DEB887", family: "Orange" },
  { name: "Tan", hex: "#D2B48C", family: "Orange" },
  { name: "Light French Beige", hex: "#C8AD7F", family: "Orange" },
  { name: "Sand", hex: "#C2B280", family: "Orange" },
  { name: "Soft Hazel", hex: "#C6BA8B", family: "Orange" },
  { name: "Sage", hex: "#BCB88A", family: "Orange" },
  { name: "Fall Leaf Brown", hex: "#C8B560", family: "Orange" },
  { name: "Ginger Brown", hex: "#C9BE62", family: "Orange" },
  { name: "Bronze Gold", hex: "#C9AE5D", family: "Orange" },
  { name: "Dark Khaki", hex: "#BDB76B", family: "Orange" },
  { name: "Olive Green", hex: "#BAB86C", family: "Orange" },
  { name: "Brass", hex: "#B5A642", family: "Orange" },
  { name: "Cookie Brown", hex: "#C7A317", family: "Orange" },
  { name: "Metallic Gold", hex: "#D4AF37", family: "Orange" },
  { name: "Mustard", hex: "#E1AD01", family: "Orange" },
  { name: "Bee Yellow", hex: "#E9AB17", family: "Orange" },
  { name: "Marigold", hex: "#EBA832", family: "Orange" },
  { name: "School Bus Yellow", hex: "#E8A317", family: "Orange" },
  { name: "Goldenrod", hex: "#DAA520", family: "Orange" },
  { name: "Orange Gold", hex: "#D4A017", family: "Orange" },
  { name: "Champagne Gold", hex: "#D29F51", family: "Orange" },
  { name: "Caramel", hex: "#C68E17", family: "Orange" },
  { name: "Dark Goldenrod", hex: "#B8860B", family: "Orange" },
  { name: "Cinnamon", hex: "#C58917", family: "Orange" },
  { name: "Peru", hex: "#CD853F", family: "Orange" },
  { name: "Bronze", hex: "#CD7F32", family: "Orange" },
  { name: "Pumpkin Pie", hex: "#CA762B", family: "Orange" },
  { name: "Tiger Orange", hex: "#C88141", family: "Orange" },
  { name: "Copper", hex: "#B87333", family: "Orange" },
  { name: "Dark Gold", hex: "#AA6C39", family: "Orange" },
  { name: "Metallic Bronze", hex: "#A97142", family: "Orange" },
  { name: "Dark Almond", hex: "#AB784E", family: "Orange" },
  { name: "Papaya Orange", hex: "#E56717", family: "Orange" },
  { name: "Halloween Orange", hex: "#E66C2C", family: "Orange" },
  { name: "Neon Orange", hex: "#FF6700", family: "Orange" },
  { name: "Bright Orange", hex: "#FF5F1F", family: "Orange" },
  { name: "Fluro Orange", hex: "#FE632A", family: "Orange" },
  { name: "Pumpkin Orange", hex: "#F87217", family: "Orange" },
  { name: "Safety Orange", hex: "#FF7900", family: "Orange" },
  { name: "Carrot Orange", hex: "#F88017", family: "Orange" },
  { name: "Dark Orange", hex: "#FF8C00", family: "Orange" },
  { name: "Construction Cone Orange", hex: "#F87431", family: "Orange" },
  { name: "Indian Saffron", hex: "#FF7722", family: "Orange" },
  { name: "Sunrise Orange", hex: "#E67451", family: "Orange" },
  { name: "Mango Orange", hex: "#FF8040", family: "Orange" },
  { name: "Coral", hex: "#FF7F50", family: "Orange" },
  { name: "Basket Ball Orange", hex: "#F88158", family: "Orange" },
  { name: "Light Salmon Rose", hex: "#F9966B", family: "Orange" },
  { name: "Light Salmon", hex: "#FFA07A", family: "Orange" },
  { name: "Pink Orange", hex: "#F89880", family: "Orange" },
  { name: "Dark Salmon", hex: "#E9967A", family: "Orange" },
  { name: "Tangerine", hex: "#E78A61", family: "Orange" },
  { name: "Light Copper", hex: "#DA8A67", family: "Orange" },

  // BROWN FAMILY
  { name: "Wood", hex: "#966F33", family: "Brown" },
  { name: "Khaki Brown", hex: "#906E3E", family: "Brown" },
  { name: "Oak Brown", hex: "#806517", family: "Brown" },
  { name: "Antique Bronze", hex: "#665D1E", family: "Brown" },
  { name: "Hazel", hex: "#8E7618", family: "Brown" },
  { name: "Dark Yellow", hex: "#8B8000", family: "Brown" },
  { name: "Dark Moccasin", hex: "#827839", family: "Brown" },
  { name: "Khaki Green", hex: "#8A865D", family: "Brown" },
  { name: "Millennium Jade", hex: "#93917C", family: "Brown" },
  { name: "Dark Beige", hex: "#9F8C76", family: "Brown" },
  { name: "Bullet Shell", hex: "#AF9B60", family: "Brown" },
  { name: "Army Brown", hex: "#827B60", family: "Brown" },
  { name: "Sandstone", hex: "#786D5F", family: "Brown" },
  { name: "Dark Hazel Brown", hex: "#473810", family: "Brown" },
  { name: "Mocha", hex: "#493D26", family: "Brown" },
  { name: "Milk Chocolate", hex: "#513B1C", family: "Brown" },
  { name: "Dark Coffee", hex: "#3B2F2F", family: "Brown" },
  { name: "Old Burgundy", hex: "#43302E", family: "Brown" },
  { name: "Red Brown", hex: "#622F22", family: "Brown" },
  { name: "Bakers Brown", hex: "#5C3317", family: "Brown" },
  { name: "Pullman Brown", hex: "#644117", family: "Brown" },
  { name: "Dark Brown", hex: "#654321", family: "Brown" },
  { name: "Sepia Brown", hex: "#704214", family: "Brown" },
  { name: "Dark Bronze", hex: "#804A00", family: "Brown" },
  { name: "Coffee", hex: "#6F4E37", family: "Brown" },
  { name: "Brown Bear", hex: "#835C3B", family: "Brown" },
  { name: "Red Dirt", hex: "#7F5217", family: "Brown" },
  { name: "Sepia", hex: "#7F462C", family: "Brown" },
  { name: "Sienna", hex: "#A0522D", family: "Brown" },
  { name: "Saddle Brown", hex: "#8B4513", family: "Brown" },
  { name: "Dark Sienna", hex: "#8A4117", family: "Brown" },
  { name: "Sangria", hex: "#7E3817", family: "Brown" },
  { name: "Blood Red", hex: "#7E3517", family: "Brown" },
  { name: "Chestnut", hex: "#954535", family: "Brown" },
  { name: "Coral Brown", hex: "#9E4638", family: "Brown" },
  { name: "Deep Amber", hex: "#A05544", family: "Brown" },
  { name: "Chestnut Red", hex: "#C34A2C", family: "Brown" },
  { name: "Ginger Red", hex: "#B83C08", family: "Brown" },
  { name: "Mahogany", hex: "#C04000", family: "Brown" },
  { name: "Red Gold", hex: "#EB5406", family: "Brown" },
  { name: "Red Fox", hex: "#C35817", family: "Brown" },
  { name: "Ginger", hex: "#B06500", family: "Brown" },
  { name: "Dark Bisque", hex: "#B86500", family: "Brown" },
  { name: "Light Brown", hex: "#B5651D", family: "Brown" },
  { name: "Petra Gold", hex: "#B76734", family: "Brown" },
  { name: "Brown Rust", hex: "#A55D35", family: "Brown" },
  { name: "Rust", hex: "#C36241", family: "Brown" },
  { name: "Copper Red", hex: "#CB6D51", family: "Brown" },
  { name: "Orange Salmon", hex: "#C47451", family: "Brown" },
  { name: "Chocolate", hex: "#D2691E", family: "Brown" },
  { name: "Sedona", hex: "#CC6600", family: "Brown" },
  { name: "Brown", hex: "#A52A2A", family: "Brown" },
  { name: "Chocolate Brown", hex: "#3F000F", family: "Brown" },
  { name: "Organic Brown", hex: "#E3F9A6", family: "Brown" },
  { name: "Pastel Brown", hex: "#B1907F", family: "Brown" },

  // RED FAMILY
  { name: "Salmon Pink", hex: "#FF8674", family: "Red" },
  { name: "Salmon", hex: "#FA8072", family: "Red" },
  { name: "Peach Pink", hex: "#F98B88", family: "Red" },
  { name: "Light Coral", hex: "#F08080", family: "Red" },
  { name: "Pastel Red", hex: "#F67280", family: "Red" },
  { name: "Pink Coral", hex: "#E77471", family: "Red" },
  { name: "Bean Red", hex: "#F75D59", family: "Red" },
  { name: "Valentine Red", hex: "#E55451", family: "Red" },
  { name: "Indian Red", hex: "#CD5C5C", family: "Red" },
  { name: "Tomato", hex: "#FF6347", family: "Red" },
  { name: "Shocking Orange", hex: "#E55B3C", family: "Red" },
  { name: "Orange Red", hex: "#FF4500", family: "Red" },
  { name: "Red", hex: "#FF0000", family: "Red" },
  { name: "Neon Red", hex: "#FD1C03", family: "Red" },
  { name: "Scarlet Red", hex: "#FF2400", family: "Red" },
  { name: "Ruby Red", hex: "#F62217", family: "Red" },
  { name: "Ferrari Red", hex: "#F70D1A", family: "Red" },
  { name: "Fire Engine Red", hex: "#F62817", family: "Red" },
  { name: "Lava Red", hex: "#E42217", family: "Red" },
  { name: "Love Red", hex: "#E41B17", family: "Red" },
  { name: "Grapefruit", hex: "#DC381F", family: "Red" },
  { name: "Strawberry Red", hex: "#C83F49", family: "Red" },
  { name: "Cherry Red", hex: "#C24641", family: "Red" },
  { name: "Chilli Pepper", hex: "#C11B17", family: "Red" },
  { name: "Fire Brick", hex: "#B22222", family: "Red" },
  { name: "Tomato Sauce Red", hex: "#B21807", family: "Red" },
  { name: "Carbon Red", hex: "#A70D2A", family: "Red" },
  { name: "Cranberry", hex: "#9F000F", family: "Red" },
  { name: "Saffron Red", hex: "#931314", family: "Red" },
  { name: "Crimson Red", hex: "#990000", family: "Red" },
  { name: "Red Wine", hex: "#990012", family: "Red" },
  { name: "Dark Red", hex: "#8B0000", family: "Red" },
  { name: "Maroon Red", hex: "#8F0B0B", family: "Red" },
  { name: "Maroon", hex: "#800000", family: "Red" },
  { name: "Burgundy", hex: "#8C001A", family: "Red" },
  { name: "Vermilion", hex: "#7E191B", family: "Red" },
  { name: "Deep Red", hex: "#800517", family: "Red" },
  { name: "Dark Burgundy", hex: "#800020", family: "Red" },
  { name: "Garnet Red", hex: "#733635", family: "Red" },
  { name: "Red Blood", hex: "#660000", family: "Red" },
  { name: "Blood Night", hex: "#551606", family: "Red" },
  { name: "Dark Scarlet", hex: "#560319", family: "Red" },
  { name: "Crimson", hex: "#DC143C", family: "Red" },
  { name: "Bright Maroon", hex: "#C32148", family: "Red" },
  { name: "Rose Red", hex: "#C21E56", family: "Red" },
  { name: "Raspberry", hex: "#E30B5D", family: "Red" },
  { name: "Red Pink", hex: "#FA2A55", family: "Red" },

  // PINK FAMILY
  { name: "Purple Lily", hex: "#550A35", family: "Pink" },
  { name: "Purple Maroon", hex: "#810541", family: "Pink" },
  { name: "Plum Pie", hex: "#7D0541", family: "Pink" },
  { name: "Plum Velvet", hex: "#7D0552", family: "Pink" },
  { name: "Dark Raspberry", hex: "#872657", family: "Pink" },
  { name: "Velvet Maroon", hex: "#7E354D", family: "Pink" },
  { name: "Rosy Finch", hex: "#7F4E52", family: "Pink" },
  { name: "Dull Purple", hex: "#7F525D", family: "Pink" },
  { name: "Puce", hex: "#7F5A58", family: "Pink" },
  { name: "Rose Dust", hex: "#997070", family: "Pink" },
  { name: "Rosy Pink", hex: "#B38481", family: "Pink" },
  { name: "Rosy Brown", hex: "#BC8F8F", family: "Pink" },
  { name: "Khaki Rose", hex: "#C5908E", family: "Pink" },
  { name: "Lipstick Pink", hex: "#C48793", family: "Pink" },
  { name: "Dusky Pink", hex: "#CC7A8B", family: "Pink" },
  { name: "Pink Brown", hex: "#C48189", family: "Pink" },
  { name: "Old Rose", hex: "#C08081", family: "Pink" },
  { name: "Dusty Pink", hex: "#D58A94", family: "Pink" },
  { name: "Pink Daisy", hex: "#E799A3", family: "Pink" },
  { name: "Rose", hex: "#E8ADAA", family: "Pink" },
  { name: "Dusty Rose", hex: "#C9A9A6", family: "Pink" },
  { name: "Silver Pink", hex: "#C4AEAD", family: "Pink" },
  { name: "Gold Pink", hex: "#E6C7C2", family: "Pink" },
  { name: "Rose Gold", hex: "#ECC5C0", family: "Pink" },
  { name: "Deep Peach", hex: "#FFCBA4", family: "Pink" },
  { name: "Pastel Orange", hex: "#F8B88B", family: "Pink" },
  { name: "Desert Sand", hex: "#EDC9AF", family: "Pink" },
  { name: "Unbleached Silk", hex: "#FFDDCA", family: "Pink" },
  { name: "Pig Pink", hex: "#FDD7E4", family: "Pink" },
  { name: "Pale Pink", hex: "#F2D4D7", family: "Pink" },
  { name: "Blush", hex: "#FFE6E8", family: "Pink" },
  { name: "Misty Rose", hex: "#FFE4E1", family: "Pink" },
  { name: "Pink Bubble Gum", hex: "#FFDFDD", family: "Pink" },
  { name: "Light Rose", hex: "#FBCFCD", family: "Pink" },
  { name: "Light Red", hex: "#FFCCCB", family: "Pink" },
  { name: "Rose Quartz", hex: "#F7CAC9", family: "Pink" },
  { name: "Warm Pink", hex: "#F6C6BD", family: "Pink" },
  { name: "Deep Rose", hex: "#FBBBB9", family: "Pink" },
  { name: "Pink", hex: "#FFC0CB", family: "Pink" },
  { name: "Light Pink", hex: "#FFB6C1", family: "Pink" },
  { name: "Soft Pink", hex: "#FFB8BF", family: "Pink" },
  { name: "Powder Pink", hex: "#FFB2D0", family: "Pink" },
  { name: "Donut Pink", hex: "#FAAFBE", family: "Pink" },
  { name: "Baby Pink", hex: "#FAAFBA", family: "Pink" },
  { name: "Flamingo Pink", hex: "#F9A7B0", family: "Pink" },
  { name: "Pastel Pink", hex: "#FEA3AA", family: "Pink" },
  { name: "Rose Pink", hex: "#E7A1B0", family: "Pink" },
  { name: "Cadillac Pink", hex: "#E38AAE", family: "Pink" },
  { name: "Carnation Pink", hex: "#F778A1", family: "Pink" },
  { name: "Pastel Rose", hex: "#E5788F", family: "Pink" },
  { name: "Blush Red", hex: "#E56E94", family: "Pink" },
  { name: "Pale Violet Red", hex: "#DB7093", family: "Pink" },
  { name: "Purple Pink", hex: "#D16587", family: "Pink" },
  { name: "Tulip Pink", hex: "#C25A7C", family: "Pink" },
  { name: "Bashful Pink", hex: "#C25283", family: "Pink" },
  { name: "Dark Pink", hex: "#E75480", family: "Pink" },
  { name: "Dark Hot Pink", hex: "#F660AB", family: "Pink" },
  { name: "Hot Pink", hex: "#FF69B4", family: "Pink" },
  { name: "Watermelon Pink", hex: "#FC6C85", family: "Pink" },
  { name: "Violet Red", hex: "#F6358A", family: "Pink" },
  { name: "Hot Deep Pink", hex: "#F52887", family: "Pink" },
  { name: "Bright Pink", hex: "#FF007F", family: "Pink" },
  { name: "Red Magenta", hex: "#FF0080", family: "Pink" },
  { name: "Deep Pink", hex: "#FF1493", family: "Pink" },
  { name: "Neon Pink", hex: "#F535AA", family: "Pink" },
  { name: "Chrome Pink", hex: "#FF33AA", family: "Pink" },
  { name: "Neon Hot Pink", hex: "#FD349C", family: "Pink" },
  { name: "Pink Cupcake", hex: "#E45E9D", family: "Pink" },
  { name: "Royal Pink", hex: "#E759AC", family: "Pink" },
  { name: "Dimorphotheca Magenta", hex: "#E3319D", family: "Pink" },
  { name: "Barbie Pink", hex: "#DA1884", family: "Pink" },
  { name: "Pink Lemonade", hex: "#E4287C", family: "Pink" },
  { name: "Rogue Pink", hex: "#C12869", family: "Pink" },
  { name: "Burnt Pink", hex: "#C12267", family: "Pink" },
  { name: "Pink Violet", hex: "#CA226B", family: "Pink" },
  { name: "Magenta Pink", hex: "#CC338B", family: "Pink" },
  { name: "Medium Violet Red", hex: "#C71585", family: "Pink" },
  { name: "Dark Carnation Pink", hex: "#C12283", family: "Pink" },
  { name: "Light Maroon", hex: "#A24857", family: "Pink" },
  { name: "Raspberry Purple", hex: "#B3446C", family: "Pink" },
  { name: "Pink Plum", hex: "#B93B8F", family: "Pink" },

  // PURPLE FAMILY
  { name: "Orchid", hex: "#DA70D6", family: "Purple" },
  { name: "Deep Mauve", hex: "#DF73D4", family: "Purple" },
  { name: "Violet", hex: "#EE82EE", family: "Purple" },
  { name: "Fuchsia Pink", hex: "#FF77FF", family: "Purple" },
  { name: "Bright Neon Pink", hex: "#F433FF", family: "Purple" },
  { name: "Magenta", hex: "#FF00FF", family: "Purple" },
  { name: "Fuchsia", hex: "#FF00FF", family: "Purple" },
  { name: "Crimson Purple", hex: "#E238EC", family: "Purple" },
  { name: "Heliotrope Purple", hex: "#D462FF", family: "Purple" },
  { name: "Tyrian Purple", hex: "#C45AEC", family: "Purple" },
  { name: "Medium Orchid", hex: "#BA55D3", family: "Purple" },
  { name: "Purple Flower", hex: "#A74AC7", family: "Purple" },
  { name: "Orchid Purple", hex: "#B048B5", family: "Purple" },
  { name: "Rich Lilac", hex: "#B666D2", family: "Purple" },
  { name: "Pastel Violet", hex: "#D291BC", family: "Purple" },
  { name: "Rosy", hex: "#A17188", family: "Purple" },
  { name: "Mauve Taupe", hex: "#915F6D", family: "Purple" },
  { name: "Viola Purple", hex: "#7E587E", family: "Purple" },
  { name: "Eggplant", hex: "#614051", family: "Purple" },
  { name: "Plum Purple", hex: "#583759", family: "Purple" },
  { name: "Grape", hex: "#5E5A80", family: "Purple" },
  { name: "Purple Navy", hex: "#4E5180", family: "Purple" },
  { name: "Periwinkle Purple", hex: "#7575CF", family: "Purple" },
  { name: "Very Peri", hex: "#6667AB", family: "Purple" },
  { name: "Dark Lavender", hex: "#734F96", family: "Purple" },
  { name: "Bright Grape", hex: "#6F2DA8", family: "Purple" },
  { name: "Bright Purple", hex: "#6A0DAD", family: "Purple" },
  { name: "Purple Amethyst", hex: "#6C2DC7", family: "Purple" },
  { name: "Purple Haze", hex: "#4E387E", family: "Purple" },
  { name: "Purple Iris", hex: "#571B7E", family: "Purple" },
  { name: "Dark Purple", hex: "#4B0150", family: "Purple" },
  { name: "Deep Purple", hex: "#36013F", family: "Purple" },
  { name: "Midnight Purple", hex: "#2E1A47", family: "Purple" },
  { name: "Purple Monster", hex: "#461B7E", family: "Purple" },
  { name: "Indigo", hex: "#4B0082", family: "Purple" },
  { name: "Rebecca Purple", hex: "#663399", family: "Purple" },
  { name: "Purple Jam", hex: "#6A287E", family: "Purple" },
  { name: "Dark Magenta", hex: "#8B008B", family: "Purple" },
  { name: "Purple", hex: "#800080", family: "Purple" },
  { name: "French Lilac", hex: "#86608E", family: "Purple" },
  { name: "Dark Orchid", hex: "#9932CC", family: "Purple" },
  { name: "Dark Violet", hex: "#9400D3", family: "Purple" },
  { name: "Purple Violet", hex: "#8D38C9", family: "Purple" },
  { name: "Jasmine Purple", hex: "#A23BEC", family: "Purple" },
  { name: "Purple Daffodil", hex: "#B041FF", family: "Purple" },
  { name: "Clematis Violet", hex: "#842DCE", family: "Purple" },
  { name: "Purple Sage Bush", hex: "#7A5DC7", family: "Purple" },
  { name: "Lovely Purple", hex: "#7F38EC", family: "Purple" },
  { name: "Neon Purple", hex: "#9D00FF", family: "Purple" },
  { name: "Purple Plum", hex: "#8E35EF", family: "Purple" },
  { name: "Aztech Purple", hex: "#893BFF", family: "Purple" },
  { name: "Medium Purple", hex: "#9370DB", family: "Purple" },
  { name: "Light Purple", hex: "#8467D7", family: "Purple" },
  { name: "Crocus Purple", hex: "#9172EC", family: "Purple" },
  { name: "Purple Mimosa", hex: "#9E7BFF", family: "Purple" },
  { name: "Pastel Indigo", hex: "#8686AF", family: "Purple" },
  { name: "Lavender Purple", hex: "#967BB6", family: "Purple" },
  { name: "Rose Purple", hex: "#B09FCA", family: "Purple" },
  { name: "Viola", hex: "#C8C4DF", family: "Purple" },
  { name: "Periwinkle", hex: "#CCCCFF", family: "Purple" },
  { name: "Pale Lilac", hex: "#DCD0FF", family: "Purple" },
  { name: "Lilac", hex: "#C8A2C8", family: "Purple" },
  { name: "Mauve", hex: "#E0B0FF", family: "Purple" },
  { name: "Bright Lilac", hex: "#D891EF", family: "Purple" },
  { name: "Purple Dragon", hex: "#C38EC7", family: "Purple" },
  { name: "Plum", hex: "#DDA0DD", family: "Purple" },
  { name: "Blush Pink", hex: "#E6A9EC", family: "Purple" },
  { name: "Pastel Purple", hex: "#F2A2E8", family: "Purple" },
  { name: "Blossom Pink", hex: "#F9B7FF", family: "Purple" },
  { name: "Wisteria Purple", hex: "#C6AEC7", family: "Purple" },
  { name: "Purple Thistle", hex: "#D2B9D3", family: "Purple" },
  { name: "Thistle", hex: "#D8BFD8", family: "Purple" },
  { name: "Purple White", hex: "#DFD3E3", family: "Purple" },
  { name: "Periwinkle Pink", hex: "#E9CFEC", family: "Purple" },
  { name: "Cotton Candy", hex: "#FCDFFF", family: "Purple" },
  { name: "Lavender Pinocchio", hex: "#EBDDE2", family: "Purple" },

  // WHITE FAMILY
  { name: "White Smoke", hex: "#F5F5F5", family: "White" },
  { name: "White Gray", hex: "#EEEEEE", family: "White" },
  { name: "Platinum", hex: "#E5E4E2", family: "White" },
  { name: "Ghost White", hex: "#F8F8FF", family: "White" },
  { name: "Dark White", hex: "#E1D9D1", family: "White" },
  { name: "Ash White", hex: "#E9E4D4", family: "White" },
  { name: "Warm White", hex: "#EFEBD8", family: "White" },
  { name: "White Chocolate", hex: "#EDE6D6", family: "White" },
  { name: "Creamy White", hex: "#F0E9D6", family: "White" },
  { name: "Off White", hex: "#F8F0E3", family: "White" },
  { name: "Soft Ivory", hex: "#FAF0DD", family: "White" },
  { name: "Cosmic Latte", hex: "#FFF8E7", family: "White" },
  { name: "Pearl White", hex: "#F8F6F0", family: "White" },
  { name: "Red White", hex: "#F3E8EA", family: "White" },
  { name: "Lavender Blush", hex: "#FFF0F5", family: "White" },
  { name: "Pearl", hex: "#FDEEF4", family: "White" },
  { name: "Egg Shell", hex: "#FFF9E3", family: "White" },
  { name: "Old Lace", hex: "#FEF0E3", family: "White" },
  { name: "White Ice", hex: "#EAEEE9", family: "White" },
  { name: "Linen", hex: "#FAF0E6", family: "White" },
  { name: "Sea Shell", hex: "#FFF5EE", family: "White" },
  { name: "Bone White", hex: "#F9F6EE", family: "White" },
  { name: "Rice", hex: "#FAF5EF", family: "White" },
  { name: "Floral White", hex: "#FFFAF0", family: "White" },
  { name: "Ivory", hex: "#FFFFF0", family: "White" },
  { name: "White Gold", hex: "#FFFFF4", family: "White" },
  { name: "Light White", hex: "#FFFFF7", family: "White" },
  { name: "Cotton", hex: "#FBFBF9", family: "White" },
  { name: "Snow", hex: "#FFFAFA", family: "White" },
  { name: "Milk White", hex: "#FEFCFF", family: "White" },
  { name: "Half White", hex: "#FFFEFA", family: "White" },
  { name: "White", hex: "#FFFFFF", family: "White" },
];

let colorCache: CachedColor[] | null = null;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;

  rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
  gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
  bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

  rNorm *= 100;
  gNorm *= 100;
  bNorm *= 100;

  let x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
  let y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750;
  let z = rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041;

  x /= 95.047;
  y /= 100.000;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  const L = (116 * y) - 16;
  const A = 500 * (x - y);
  const B = 200 * (y - z);

  return { l: L, a: A, b: B };
}

export function deltaE2000(lab1: { l: number; a: number; b: number }, lab2: { l: number; a: number; b: number }): number {
  const L1 = lab1.l, a1 = lab1.a, b1 = lab1.b;
  const L2 = lab2.l, a2 = lab2.a, b2 = lab2.b;

  const kL = 1, kC = 1, kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cab = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cab, 7) / (Math.pow(Cab, 7) + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = Math.atan2(b1, a1p) * (180 / Math.PI);
  if (h1p < 0) h1p += 360;
  let h2p = Math.atan2(b2, a2p) * (180 / Math.PI);
  if (h2p < 0) h2p += 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * (Math.PI / 180));

  const Lp = (L1 + L2) / 2;
  const Cp = (C1p + C2p) / 2;

  let Hp: number;
  if (C1p * C2p === 0) {
    Hp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    Hp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    Hp = (h1p + h2p + 360) / 2;
  } else {
    Hp = (h1p + h2p - 360) / 2;
  }

  const T = 1 - 0.17 * Math.cos((Hp - 30) * (Math.PI / 180))
            + 0.24 * Math.cos(2 * Hp * (Math.PI / 180))
            + 0.32 * Math.cos((3 * Hp + 6) * (Math.PI / 180))
            - 0.20 * Math.cos((4 * Hp - 63) * (Math.PI / 180));

  const dTheta = 30 * Math.exp(-Math.pow((Hp - 275) / 25, 2));

  const RC = 2 * Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + Math.pow(25, 7)));

  const SL = 1 + (0.015 * Math.pow(Lp - 50, 2)) / Math.sqrt(20 + Math.pow(Lp - 50, 2));
  const SC = 1 + 0.045 * Cp;
  const SH = 1 + 0.015 * Cp * T;

  const RT = -Math.sin(2 * dTheta * (Math.PI / 180)) * RC;

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
    Math.pow(dCp / (kC * SC), 2) +
    Math.pow(dHp / (kH * SH), 2) +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE;
}

function initializeColorCache(): CachedColor[] {
  if (colorCache) return colorCache;
  
  colorCache = namedColors.map(color => {
    const rgb = hexToRgb(color.hex);
    const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
    return {
      ...color,
      lab,
    };
  });
  
  return colorCache;
}

function findClosestNamedColor(r: number, g: number, b: number): NamedColor {
  const cache = initializeColorCache();
  const targetLab = rgbToLab(r, g, b);
  
  let closestColor = cache[0];
  let minDistance = Infinity;

  for (const color of cache) {
    const distance = deltaE2000(targetLab, color.lab);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
}

export function getColorFromRgb(r: number, g: number, b: number): ColorInfo {
  const closestColor = findClosestNamedColor(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  
  const actualHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();

  return {
    name: closestColor.name,
    hex: actualHex,
    rgb: { r, g, b },
    hsl,
    family: closestColor.family,
  };
}

export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

export function getColorInfo(hex: string): ColorInfo {
  const rgb = hexToRgb(hex);
  return getColorFromRgb(rgb.r, rgb.g, rgb.b);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

export function getColorSimilarity(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  const lab1 = rgbToLab(rgb1.r, rgb1.g, rgb1.b);
  const lab2 = rgbToLab(rgb2.r, rgb2.g, rgb2.b);
  
  const deltaE = deltaE2000(lab1, lab2);
  
  const similarity = Math.max(0, 100 - deltaE);
  return Math.round(similarity);
}
