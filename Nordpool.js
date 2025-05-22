// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
// This script was created by Flopp999
// Support me with a coffee https://www.buymeacoffee.com/flopp999 
let version = 0.690
let area
let resolution
let currency
let vat
let includevat
let extras
let language
let settings = {}
let langId
let translationData
let currentLang
const fileName = Script.name() + "_Settings.json";
const fm = FileManager.iCloud(); // Or .local() if preferred
const dir = fm.documentsDirectory();
let filePath = fm.joinPath(dir, fileName);

if (!config.runsInWidget){
  //await askForLanguage();
  await readTranslations();
  await readsettings();
  await start();

}

if (config.runsInWidget){
  await updatecode();
  await readsettings();
}

async function start() {
  let alert = new Alert();
  //alert.title = "";
  alert.message = t("changesetup") + "?";
  alert.addAction(t("yes"));
  alert.addAction(t("no"));
  let index = await alert.presentAlert();
  if (index === 0) {
    settings = await ask();
    fm.writeString(filePath, JSON.stringify(settings, null, 2)); // Pretty print
  }
}

async function updatecode() {
  // Update the code.
  try {
    const req = new Request("https://github.com/flopp999/Scriptable-NordPool/releases/latest/download/Nordpool.js");
    const codeString = await req.loadString();
    const serverVersion = codeString.match(/version\s*=\s*([0-9.]+)/);
    if (version < serverVersion[1]){
      let files = FileManager.iCloud(); // Or .local() if preferred
      files.writeString(module.filename, codeString);
    }
  } catch (error) {
    console.error(error);
  }
}

async function readsettings() {
  //let fileName = Script.name() + "_Settings.json";
  //let fm = FileManager.iCloud(); // Or .local() if preferred
  let dir = fm.documentsDirectory();
  let filePath = fm.joinPath(dir, fileName);
  //let settings = {};
  
  try {
    if (fm.fileExists(filePath)) {
      let raw = fm.readString(filePath);
      settings = JSON.parse(raw);
      langId = settings.language; // 1 = ENG, 2 = DE, 3 = SV
      await readTranslations();
      let keys = Object.keys(settings);
      if (keys.length < 6) {
        throw new Error("Settings file is incomplete or corrupted");
      }
    } else {
      await askForLanguage();
      await readTranslations();
      let alert = new Alert();
      alert.title = "Support";
      alert.message = t("buymeacoffee") + "?";
      alert.addAction(t("ofcourse"));
      alert.addCancelAction(t("noway"));
      let response = await alert.present();
      if (response === 0) {
        Safari.open("https://buymeacoffee.com/flopp999");
      }
      throw new Error("Settings file not found");
    }
  } catch (error) {
    console.warn("Settings file not found or error reading file: " + error.message);
    settings = await ask();
    fm.writeString(filePath, JSON.stringify(settings, null, 2)); // Pretty print
  }
}

await createVariables();

async function createVariables() {
  area = settings.area;
  resolution = settings.resolution;
  currency = settings.currency;
  vat = settings.vat;
  includevat = settings.includevat;
  extras = settings.extras;
  language = settings.language;
}

async function readTranslations() {
  let url = "https://github.com/flopp999/Scriptable-NordPool/releases/latest/download/Translations.json";
  let filename = "Translations.json";
  let req = new Request(url);
  let content = await req.loadString();
  let fm = FileManager.iCloud();
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, filename);
  fm.writeString(path, content);
  try {
    const fm = FileManager.iCloud()
    const path = fm.joinPath(fm.documentsDirectory(), "Translations.json");
    translationData = JSON.parse(fm.readString(path));
    const langMap = {
      1: "en",
      2: "de",
      3: "sv"
    };
    
    currentLang = langMap[langId] || "en"; // fallback to english
  } catch (error) {
    console.error(error);
  }
}

//await readTranslations();

function t(key) {
  const entry = translationData[key];
  if (!entry) return `[${key}]`; // nyckel saknas
  return entry[currentLang] || entry["en"] || `[${key}]`;
}




async function ask() {
  
  //await readTranslations();
  [settings.area, settings.vat] = await askForArea();
  settings.currency = await askForCurrency();
  settings.includevat = await askForIncludeVAT();
  settings.extras = await askForExtras();
  settings.resolution = await askForResolution();
  return settings
}

// Select resolution
async function askForLanguage() {
  let alert = new Alert();
  //alert.title = "Select Resolution";
  alert.message = "Language/Sprache/Språk:";
  alert.addAction("English");
  alert.addAction("Deutsch");
  alert.addAction("Svenska");
  let index = await alert.presentAlert();
  settings.language = [1,2,3][index];
  fm.writeString(filePath, JSON.stringify(settings, null, 2)); // Pretty print
  langId = settings.language; // 1 = ENG, 2 = DE, 3 = SV
  return [1,2,3][index];
}


// Select area
async function askForArea() {
  let alert = new Alert();
  // alert.title = "Select Area";
  //alert.message = "Choose your electricity area:";
  alert.message = t("chooseyourelectricityarea") + ":";
  
  let areas = [
    "AT","BE","BG","DK1","DK2","EE","FI","FR","GER",
    "LT","LV","NL","NO1","NO2","NO3","NO4","NO5",
    "PL","SE1","SE2","SE3","SE4","TEL","SYS"
  ];
  for (let area of areas) {
    alert.addAction(area);
  }

  let index = await alert.presentAlert();
  let area = [
    "AT","BE","BG","DK1","DK2","EE","FI","FR","GER",
    "LT","LV","NL","NO1","NO2","NO3","NO4","NO5",
    "PL","SE1","SE2","SE3","SE4","TEL","SYS"][index];
  let vat = [
    20,  // AT - Austria
    6,   // BE - Belgium
    20,  // BG - Bulgaria
    25,  // DK1 - Denmark (East)
    25,  // DK2 - Denmark (West)
    20,  // EE - Estonia
    24,  // FI - Finland
    20,  // FR - France
    19,  // GER - Germany
    21,  // LT - Lithuania
    21,  // LV - Latvia
    21,  // NL - Netherlands
    25,  // NO1 - Norway
    25,  // NO2 - Norway
    25,  // NO3 - Norway
    25,  // NO4 - Norway
    25,  // NO5 - Norway
    23,  // PL - Poland
    25,  // SE1 - Sweden
    25,  // SE2 - Sweden
    25,  // SE3 - Sweden
    25,  // SE4 - Sweden
    19,   // TEL - Romania
    0    // SYS - System price or not applicable
    ][index];
    return [area, vat];
}

// Select resolution
async function askForResolution() {
  let alert = new Alert();
  //alert.title = "Select Resolution";
  alert.message = t("choosedataresolution") + ":";
  alert.addAction("15 min");
  alert.addAction("60 min");
  let index = await alert.presentAlert();
  return [15, 60][index];
}

// Select currency
async function askForCurrency() {
  let allowedCurrencies = {
    AT: ["EUR"],
    BE: ["EUR"],
    BG: ["BGN", "EUR"],
    DK1: ["DKK", "EUR", "NOK", "SEK"],
    DK2: ["DKK", "EUR", "NOK", "SEK"],
    EE: ["EUR", "DKK", "NOK", "SEK"],
    FI: ["EUR", "DKK", "NOK", "SEK"],
    FR: ["EUR"],
    GER: ["EUR"],
    LT: ["EUR", "DKK", "NOK", "SEK"],
    LV: ["EUR", "DKK", "NOK", "SEK"],
    NL: ["EUR"],
    NO1: ["NOK", "DKK", "EUR", "SEK"],
    NO2: ["NOK", "DKK", "EUR", "SEK"],
    NO3: ["NOK", "DKK", "EUR", "SEK"],
    NO4: ["NOK", "DKK", "EUR", "SEK"],
    NO5: ["NOK", "DKK", "EUR", "SEK"],
    PL: ["PLN", "EUR"],
    SE1: ["SEK", "DKK", "EUR", "NOK"],
    SE2: ["SEK", "DKK", "EUR", "NOK"],
    SE3: ["SEK", "DKK", "EUR", "NOK"],
    SE4: ["SEK", "DKK", "EUR", "NOK"],
    TEL: ["RON", "EUR"],
    SYS: ["EUR", "DKK", "NOK", "SEK"],
  };
  let alert = new Alert();
  //alert.title = "Select Currency";
  alert.message = t("chooseyourcurrency") + ":";
  let currencies = allowedCurrencies[settings.area] || [];
  for (let currency of currencies) {
    alert.addAction(currency);
  }
  if (currencies.length === 0) {
    alert.addAction("No options");
    await alert.presentAlert();
    return null;
  }
  let index = await alert.presentAlert();
  return currencies[index];
}

// Include VAT?
async function askForIncludeVAT() {
  let alert = new Alert();
  //alert.title = "Include VAT?";
  alert.message = t("doyouwantvat") + "?";
  alert.addAction(t("withvat"));
  alert.addAction(t("withoutvat"));
  let index = await alert.presentAlert();
  return [1,0][index];
}

// Include extra cost?
async function askForExtras() {
  let alert = new Alert();
  alert.title = t("extraelectricitycost");
  alert.message = (t("enterextra") + `${settings.currency}`);
  alert.addTextField("e.g. 0.30");
  alert.addAction("OK");
  await alert.present();
  let input = alert.textFieldValue(0);
  let newCost = parseFloat(input);
  return newCost;
}

const smallFont = 10;
const mediumFont = 12;
const bigFont = 13.5;
const date = new Date();
const yyyy = date.getFullYear();
const mm = String(date.getMonth() + 1).padStart(2, '0'); // month are indexed from 0
const dd = String(date.getDate()).padStart(2, '0');
const formattedDate = `${yyyy}-${mm}-${dd}`;
const hour = date.getHours();
const minute = date.getMinutes();
const hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
url = `https://dataportal-api.nordpoolgroup.com/api/DayAheadPriceIndices?date=${formattedDate}&market=DayAhead&indexNames=${area}&currency=${currency}&resolutionInMinutes=${resolution}`;
const request = new Request(url);
request.timeoutInterval = 1;
let response = (await request.loadJSON());
let updated = response.updatedAt;
updated = updated.replace(/\.\d+Z$/, '').replace('T', ' ');
const day = response.deliveryDateCET;
let prices = response.multiIndexEntries;
let allValues = [];

for (let i = 0; i < prices.length; i++) {
  const value = prices[i]["entryPerArea"][`${area}`];
  allValues.push(String(value/10* (1 + "." + (includevat*vat)) + extras));
}

let pricesJSON = JSON.parse(JSON.stringify(allValues));
// Test data for 15 min values
//pricesJSON = ["53.7", "89.1", "60.2", "97.9", "70.8", "40.3", "48.6", "81.7", "26.4", "73.5","75.1", "39.7", "62.8", "18.5", "92.6", "33.1", "20.7", "11.4", "55.5", "46.9","85.0", "35.6", "79.2", "90.4", "66.7", "67.3", "28.8", "15.3", "99.6", "64.5","38.9", "57.2", "19.8", "71.6", "84.4", "49.5", "14.7", "63.1", "21.6", "44.2","78.5", "37.4", "17.2", "13.8", "12.6", "45.3", "58.6", "43.8", "16.9", "69.2","24.1", "41.6", "50.8", "36.3", "59.9", "95.4", "42.5", "93.7", "61.4", "27.5","47.7", "31.9", "32.8", "25.2", "83.6", "30.5", "74.2", "22.4", "77.1", "29.6","34.7", "52.1", "56.8", "23.3", "86.3", "65.4", "91.2", "68.4", "94.9", "98.5","76.3", "87.5", "88.7", "51.3", "80.1", "82.2", "72.7", "96.8", "87.0", "10.9","10.1", "10.4", "10.7", "11.9", "12.2", "13.5", "14.1", "15.8", "16.4", "17.7"]
  
const priceLowest = (Math.min(...pricesJSON.map(Number)));
const priceHighest = (Math.max(...pricesJSON.map(Number)));
const priceDiff = (priceHighest - priceLowest)/3;
const priceAvg = pricesJSON.map(Number).reduce((a, b) => a + b, 0) / pricesJSON.length;

async function createWidget(){
  let listwidget = new ListWidget();
  listwidget.backgroundColor = new Color("#000000");
  let row = listwidget.addStack();
  row.layoutVertically();
  let left = row.addStack();
  left.layoutHorizontally();
  let whatday = left.addText(day);
  whatday.textColor = new Color("#ffffff");
  whatday.font = Font.lightSystemFont(20);
  let right = left.addStack();
  right.layoutVertically();
  let update = right.addStack();
  update.addSpacer();
  let updatetext = update.addText(t("updated") + updated);
  updatetext.font = Font.lightSystemFont(10);
  updatetext.textColor = new Color("#ffffff");
  let moms = right.addStack();
  moms.addSpacer();
  momstext = moms.addText("v. " + version);
  momstext.font = Font.lightSystemFont(10);
  momstext.textColor = new Color("#ffffff");
  moms.addSpacer();
  momstext = moms.addText(currency);
  momstext.font = Font.lightSystemFont(10);
  momstext.textColor = new Color("#ffffff");
  moms.addSpacer();
  momstext = moms.addText("Extras: " + extras);
  momstext.font = Font.lightSystemFont(10);
  momstext.textColor = new Color("#ffffff");
  moms.addSpacer();
  if (includevat == 1) {
    momstext = moms.addText(t("inclvat"));
  }
  else {
    momstext = moms.addText(t("exclvat"));
  }
  momstext.font = Font.lightSystemFont(10);
  momstext.textColor = new Color("#ffffff");
  
  let head = listwidget.addStack()
  let stackNames = ["first", "second", "third", "fourth", "fifth"];
  let timeStacks = {};
  let priceStacks = {};

  for (let name of stackNames) {
    let timeStack = head.addStack();
    timeStack.layoutVertically();
    head.addSpacer(4);
    let priceStack = head.addStack();
    priceStack.layoutVertically();
    if (name !== stackNames[stackNames.length - 1]) {
      head.addSpacer();
    }
    timeStacks[name] = timeStack;
    priceStacks[name] = priceStack;
  }

// Loop to add time and prices
for (let s = 0; s < stackNames.length; s++) {
  let name = stackNames[s];
  let timeStack = timeStacks[name];
  let priceStack = priceStacks[name];
  let hourOffset = 0 + s * 5; // how many hours per column
  // Add time
  for (let i = hourOffset; i < hourOffset + 5; i++) {
    if (i == 24) {
      continue
    }
    for (let a = 0; a < 4; a++) {
      let timeText = timeStack.addText(`${i}:${a === 0 ? "00" : a * 15}`);
      timeText.leftAlignText();
      if (i === hour && minute >= a * 15 && minute < (a + 1) * 15) { // actual hour and identifies which 15-minute interval (quarter-hour segment) the current time falls into. e.g., 00–14, 15–29, 30–44, or 45–59
        timeText.textColor = new Color("#00ffff");
        timeText.font = Font.lightSystemFont(bigFont);
      } else {
        timeText.textColor = new Color("#ffffff");
        timeText.font = Font.lightSystemFont(mediumFont);
      }
      if (allValues.length == 24) {
        if (i === hour) {
          timeText.textColor = new Color("#00ffff");
          timeText.font = Font.lightSystemFont(bigFont);
        }
      break
      }
    }
  }

  // Add prices
  let priceStart = 0 + s * Math.ceil(allValues.length*0.2083); // 0.2083 is the factor between 24 and 96
  for (let i = priceStart; i < priceStart + Math.ceil(allValues.length*0.2083); i++) {

    if (i == allValues.length){
      break
    }
    let priceVal = Math.round(pricesJSON[i]);
    let priceText = priceStack.addText(String(priceVal));
    priceText.leftAlignText();
    if (i === (hour * 4) + Math.floor(minute / 15)) {
        priceText.font = Font.lightSystemFont(bigFont);
      } else {
        priceText.font = Font.lightSystemFont(mediumFont);
      }
    if (allValues.length == 24) {
      if (i === hour) {
        priceText.font = Font.lightSystemFont(bigFont);
      }
    }
    if (pricesJSON[i] == priceLowest){
      priceText.textColor = new Color("#00cf00"); // green
    } else if (pricesJSON[i] < priceDiff + priceLowest) {
      priceText.textColor = new Color("#ffff00"); // yellow
    } else if (pricesJSON[i] == priceHighest){
      priceText.textColor = new Color("#fa60ff"); // purple
    } else if (pricesJSON[i] > priceHighest - priceDiff) {
      priceText.textColor =  new Color("#ff3000"); // red
    } else {
      priceText.textColor = new Color("#f38"); // orange
    }
  }
}
  let bottom = listwidget.addStack();
  // lowest
  let lowest = bottom.addText(t("lowest"));
  lowest.font = Font.lightSystemFont(11);
  lowest.textColor = new Color("#00cf00");
  bottom.addSpacer(4);
  let priceLowestRound = Math.round(priceLowest);
  let lowesttext = bottom.addText(`${priceLowestRound}`);
  lowesttext.font = Font.lightSystemFont(11);
  lowesttext.textColor = new Color("#00cf00");
  bottom.addSpacer();
  // average
  let avg = bottom.addText(t("average"));
  avg.font = Font.lightSystemFont(11);
  avg.textColor = new Color("#f38");
  bottom.addSpacer(4);
  let priceAvgRound = Math.round(priceAvg);
  let avgtext = bottom.addText(`${priceAvgRound}`);
  avgtext.font = Font.lightSystemFont(11);
  avgtext.textColor = new Color("#f38");
  bottom.addSpacer();
  // highest
  let highest = bottom.addText(t("highest"));
  highest.font = Font.lightSystemFont(11);
  highest.textColor = new Color("#fa60ff");
  bottom.addSpacer(4);
  let priceHighestRound = Math.round(priceHighest);
  let highesttext = bottom.addText(`${priceHighestRound}`);
  highesttext.font = Font.lightSystemFont(11);
  highesttext.textColor = new Color("#fa60ff");
  //chart
  if (resolution == 60) {
    let avgtoday = []
    let dotNow = ""
    let countertoday = 0
    let counterdot = 0
    do{
      avgtoday += priceAvg + ","
      countertoday += 1
    }
    while (countertoday < 24)
    do{
      if (hour == counterdot) {
        dotNow += pricesJSON[counterdot] + ","
      }
      else {
        dotNow += ","
      }
      counterdot += 1
    }
    while (counterdot < 24)
    let graphtoday = "https://quickchart.io/chart?bkg=black&w=1300&h=770&c="
    graphtoday += encodeURI("{\
      data: { \
        labels: ["+hours+"],\
        datasets: [\
        {\
            data:["+dotNow+"],\
            type:'line',\
            fill:false,\
            borderColor:'white',\
            borderWidth:25,\
            pointRadius:10\
          },\
          {\
            data:["+avgtoday+"],\
            type:'line',\
            fill:false,\
            borderColor: 'orange',\
            borderWidth:6,\
            pointRadius:0\
          },\
          {\
            data:["+pricesJSON+"],\
            type:'bar',\
            fill:false,\
            borderColor: getGradientFillHelper('vertical',['red','orange','darkgreen']),\
            borderWidth: 20, \
          },\
        ]\
      },\
        options:\
          {\
            legend:\
            {\
              display:false\
            },\
            scales:\
            {\
              xAxes:[{offset:true,ticks:{fontSize:35,fontColor:'white'}}],\
              yAxes:[{ticks:{beginAtZero:true,fontSize:35,fontColor:'white'}}]\
            }\
          }\
    }")
    const GRAPH = await new Request(graphtoday).loadImage()
    let emptyrow = listwidget.addStack()
    listwidget.addSpacer(10)
    let chart = listwidget.addStack()
    chart.addImage(GRAPH) 
  }
  
return listwidget
}

let widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  if (Math.random() < 0.5) {
    let alert = new Alert();
    alert.title = "Support";
    alert.message = t("buymeacoffee") + "?";
    alert.addCancelAction(t("ofcourse"));
    alert.addAction(t("noway"));
    let response = await alert.present();
    if (response === -1) {
      Safari.open("https://buymeacoffee.com/flopp999");
    }
  }
}

widget.presentLarge()
Script.complete();
