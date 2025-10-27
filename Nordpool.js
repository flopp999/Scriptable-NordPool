// License: Personal use only. See LICENSE for details.
// This script was created by Flopp999
// Support me with a coffee https://www.buymeacoffee.com/flopp999 
let version = 0.810
let notificationSet;
let highTime;
let lowTime;
let allValues = [];
let widget;
let daybefore;
let day;
let date;
let prices;
let pricesJSON;
let priceAvg;
let priceLowest;
let priceHighest;
let priceDiff;
let area;
let resolution;
let currency;
let vat;
let includevat;
let extras;
let language;
let settings = {}
let langId;
let hour;
let hours;
let minute;
let translationData;
let currentLang;
let tomorrowdate
const fileNameSettings = Script.name() + "_Settings.json";
const fileNameTranslations = Script.name() + "_Translations.json";
const fm = FileManager.iCloud();
const dir = fm.documentsDirectory();
const filePathSettings = fm.joinPath(dir, fileNameSettings);
const filePathTranslations = fm.joinPath(dir, fileNameTranslations);
//let height = 1150;
//let width = 1100;
let keys = [];
let internet = false;
//async function harInternet() {
  try {
    let req = new Request("https://www.apple.com/library/test/success.html");
    req.method = "HEAD";
    req.timeoutInterval = 5;
    await req.load();
    internet = true;
  } catch (error) {
    internet = false;
  }
//}

if (!config.runsInWidget){
  if (internet == true) {
    await updatecode();
  }
  if (internet == true) {
    await readTranslations();
  }
  //if (internet == true) {
  await readsettings();
  //}
  await createVariables();
  
  await start();
  
  await createVariables();
}

if (config.runsInWidget){
  await readsettings();
  await updatecode();
  await createVariables();
}

async function start() {
  const [topType, topDay] = settings.showattop.split(",").map(s => s.trim());
  //const [middleType, middleDay] = settings.showatmiddle.split(",").map(s => s.trim());
  const [bottomType, bottomDay] = settings.showatbottom.split(",").map(s => s.trim());
  let alert = new Alert();
  let vatText = includevat == 1 ? t("yes") : t("no")
  let notifyText = settings.highlow == 1 ? t("yes") : t("no")
  alert.message = 
    t("changesetup") + "?\n" +
    //t("top").charAt(0).toUpperCase() + t("top").slice(1) + ":\n" + 
    t(topType) + (topDay ? ", " + t(topDay) : "") + "\n" +
    //t("middle").charAt(0).toUpperCase() + t("middle").slice(1) + ":\n" + t(middleType) + (middleDay ? ", " + t(middleDay) : "") + "\n" +
    //t("bottom").charAt(0).toUpperCase() + t("bottom").slice(1) + ":\n" + t(bottomType) + (bottomDay ? ", " + t(bottomDay) : "") + "\n" +
    t("area") + ": " + area + "\n" +
    "Extras: " + extras + "\n" +
    t("withvat") + ": " + vatText +
    (includevat == 1 ? " (" + vat + "%)" : "") + "\n" +
    "Notify: " + notifyText;
    

  alert.addAction(t("yes"));
  alert.addAction(t("no"));
  let index = await alert.presentAlert();
  if (index === 0) {
    settings = await ask();
    fm.writeString(filePathSettings, JSON.stringify(settings, null, 2));
  }
}

async function updatecode() {
  try {
    const req = new Request("https://raw.githubusercontent.com/flopp999/Scriptable-NordPool/main/Version.txt");
    req.timeoutInterval = 1;
    const serverVersion = await req.loadString()
    if (version < serverVersion) {
      try {
        const req = new Request("https://raw.githubusercontent.com/flopp999/Scriptable-NordPool/main/Nordpool.js");
        req.timeoutInterval = 1;
        const response = await req.load();
        const status = req.response.statusCode;
        if (status !== 200) {
          throw new Error(`Error: HTTP ${status}`);
        }
        const codeString = response.toRawString();
        fm.writeString(module.filename, codeString);
        const reqTranslations = new Request("https://raw.githubusercontent.com/flopp999/Scriptable-NordPool/main/Translations.json");
        reqTranslations.timeoutInterval = 1;
        const responseTranslations = await reqTranslations.load();
        const statusTranslations = reqTranslations.response.statusCode;
        if (statusTranslations !== 200) {
          throw new Error(`Error: HTTP ${statusTranslations}`);
        }
        const codeStringTranslations = responseTranslations.toRawString();
        fm.writeString(filePathTranslations, codeStringTranslations);
        //fm.remove(filePathSettings);
        let updateNotify = new Notification();
        updateNotify.title = Script.name();
        updateNotify.body = "New version installed, " + serverVersion;
        updateNotify.sound = "default";
        await updateNotify.schedule();
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error("The update failed. Please try again later." + error);
  }
}

async function readsettings() {
  try {
    if (fm.fileExists(filePathSettings)) {
      let raw = fm.readString(filePathSettings);
      settings = JSON.parse(raw);
      if (settings.language !== 1  && settings.language !== 2 && settings.language !== 3 && settings.language !== 4) {
				await askForLanguage();
			}
			langId = settings.language; // 1 = ENG, 2 = DE, 3 = SV
      await readTranslations();
			if (!settings.area) {
				await askForArea();
			}
			if (settings.includevat !== 0  && settings.includevat !== 1) {
				await askForIncludeVAT();
			}
			if (!settings.vat || settings.vat.length === 0) {
				await askForIncludeVAT();
			}
			if (isNaN(Number(settings.extras))) {
        await askForExtras();
      }
      if (settings.highlow !== 0 && settings.highlow !== 1) {
				settings.highlow = 1
				//await askForHighLow();
			}
      if (settings.notificationSet !== 0 && settings.notificationSet !== 1) {
				settings.notificationSet = 0;
			}
      if (settings.notificationSetTomorrow !== 0 && settings.notificationSetTomorrow !== 1) {
				settings.notificationSetTomorrow = 1;
			}	
			if (!settings.currency || settings.currency.length === 0) {
				await askForArea();
			}
      
		} else {
      if (config.runsInWidget) {
        return;
      }
      await askForLanguage();
      await readTranslations();
      let alert = new Alert();
      alert.title = "Support";
      alert.message = t("buymeacoffee") + "?";
      alert.addAction(t("noway"));
      alert.addCancelAction(t("ofcourse"));
      let response = await alert.present();
      if (response === -1) {
        Safari.open("https://buymeacoffee.com/flopp999");
      }
      throw new Error("Settings file not found");
    }
  } catch (error) {
    if (config.runsInWidget) {
      return;
    }
    console.warn("Settings file not found or error reading file: " + error.message);
    settings = await ask();
    fm.writeString(filePathSettings, JSON.stringify(settings, null, 2));
  }
}

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
  if (!fm.fileExists(filePathTranslations)) {
    let url = "https://raw.githubusercontent.com/flopp999/Scriptable-NordPool/main/Translations.json";
    let req = new Request(url);
    req.timeoutInterval = 1;
    let content = await req.loadString();
    fm.writeString(filePathTranslations, content);
  }
  try {
    translationData = JSON.parse(fm.readString(filePathTranslations));
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

function t(key) {
  const entry = translationData[key];
  if (!entry) return `[${key}]`; // key is missing
  return entry[currentLang] || entry["en"] || `[${key}]`;
}

async function ask() {
  [settings.area, settings.vat, settings.currency] = await askForArea();
  settings.includevat = await askForIncludeVAT();
  settings.extras = await askForExtras();
  await askForAllShowPositions("top");
  await askForHighLow();
  settings.resolution = await askForResolution();
  //settings.resolution = 60;
  return settings
}

async function askForAllShowPositions() {
  const options = ["graph", "table"];
	const days = ["today", "tomorrow"];
	//const graphOption = {};
	// Fråga först: graph eller table
	const alert = new Alert();
	alert.message = t("showwhat") + "?";
	options.forEach(o => alert.addAction(t(o)));
	const index = await alert.presentAlert();
	const choice = options[index];
	// Fråga sedan: today eller tomorrow
	const dayAlert = new Alert();
	dayAlert.message = t("showday") + "?";
	days.forEach(d => dayAlert.addAction(t(d)));
	const dayIndex = await dayAlert.presentAlert();
	const day = days[dayIndex];
	// Spara i settings
	//graphOption.type = choice;
	//graphOption.day = day;
	settings.showattop = `${choice}, ${day}`
	settings.showatbottom = `pricestats, ${day}`
	//settings.graphOption = graphOption;
  fm.writeString(filePathSettings, JSON.stringify(settings, null, 2));
  //const key = `${totalGraph}-${totalTable}-${totalPriceStats}`;
  //settings.height = 1150;
  return settings;
 }

async function askForLanguage() {
  let alert = new Alert();
  alert.message = "Language/Sprache/Språk/Taal:";
  alert.addAction("English");
  alert.addAction("Deutsch");
  alert.addAction("Svenska");
  alert.addAction("Nederlands");
  let index = await alert.presentAlert();
  settings.language = [1,2,3,4][index];
  fm.writeString(filePathSettings, JSON.stringify(settings, null, 2));
  langId = settings.language; // 1 = ENG, 2 = DE, 3 = SV
  return [1,2,3,4][index];
}

async function askForArea() {
  let alert = new Alert();
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
  let currencies2 = [
    "EUR",  // AT - Austria
    "EUR",
    "BGN",
    "DKK",
    "DKK",
    "EUR",
    "EUR",
    "EUR",
    "EUR",
    "EUR",
    "EUR",
    "EUR",
    "NOK",
    "NOK",
    "NOK",
    "NOK",
    "NOK",
    "PLN",
    "SEK", // SE1 - Sweden
    "SEK", // SE2 - Sweden
    "SEK", // SE3 - Sweden
    "SEK", // SE4 - Sweden
    "RON",
    "EUR"
    ][index];
  return [area, vat, currencies2];
}

async function askForResolution() {
  let alert = new Alert();
  alert.message = t("choosedataresolution") + ":";
  alert.addAction("15 min");
  alert.addAction("60 min");
  let index = await alert.presentAlert();
  return [15, 60][index];
}

async function askForIncludeVAT() {
  let alert = new Alert();
  alert.message = t("doyouwantvat") + "?";
  alert.addAction(t("withvat"));
  alert.addAction(t("withoutvat"));
  let index = await alert.presentAlert();
  return [1,0][index];
}

async function askForHighLow() {
  let alert = new Alert();
  alert.message = t("doyouwanthighlow") + "?";
  alert.addAction(t("yes"));
  alert.addAction(t("no"));
  let index = await alert.presentAlert();
  settings.highlow = [1,0][index];
  settings.notificationSet = 0;
  fm.writeString(filePathSettings, JSON.stringify(settings, null, 2));
  return [1,0][index];
}

async function askForExtras() {
  let alert = new Alert();
  alert.title = t("extraelectricitycost");
  alert.message = (t("enterextra") + `${settings.currency}`);
  alert.addTextField("e.g. 0.30",String(settings.extras ?? "0")).setDecimalPadKeyboard();
  alert.addAction("OK");
  await alert.present();
  let input = alert.textFieldValue(0);
  input = input.replace(",", ".")
  let newCost = parseFloat(input);
  return newCost;
}

async function Table(day) {
  if (size == "small") {return};
  if (internet == true) {await nordpoolData(day);
  }
  if (daybefore != day){
		daybefore = day;
	  let left = listwidget.addStack();
	  let whatday
		if (date == todaydate) {
			whatday = left.addText(t("today"));
		} else if (date == tomorrowdate) {
			whatday = left.addText(t("tomorrow"));
    } else {
			whatday = left.addText(date);
		}
	  whatday.textColor = new Color("#ffffff");
	  whatday.font = Font.lightSystemFont(13);
	  left.addSpacer();
	  if (prices == 0) {
	    whatday = left.addText(t("after13"));
	    whatday.textColor = new Color("#ffffff");
	    whatday.font = Font.lightSystemFont(13);
	    listwidget.addSpacer(5);
	    return;
	  } else {
	  	let updatetext = left.addText(t("updated") + updated);
	  	updatetext.font = Font.lightSystemFont(13);
	  	updatetext.textColor = new Color("#ffffff");
	  }
  }
  if (size == "medium"){
  listwidget.addSpacer(3)
  }
  daybefore = day;
  if (prices == 0) {
    return;
  }
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
        if (allValues.length == 24) {
          if (i === hour && day == "today") {
            timeText.textColor = new Color("#00ffff");
            timeText.font = Font.lightSystemFont(bigFont);
          } else {
            timeText.textColor = new Color("#ffffff");
            timeText.font = Font.lightSystemFont(mediumFont);
          }
          break
        }
        if (i === hour && day == "today" && minute >= a * 15 && minute < (a + 1) * 15) { // actual hour and identifies which 15-minute interval
          hour=i*4+a
          timeText.textColor = new Color("#00ffff");
          timeText.font = Font.lightSystemFont(bigFont);
        } else {
          timeText.textColor = new Color("#ffffff");
          timeText.font = Font.lightSystemFont(mediumFont);
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
        if (i === hour && day == "today") {
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
        priceText.textColor =  new Color("#ff3300"); // red
      } else {
        priceText.textColor = new Color("#f38"); // orange
      }
    }
  }
  listwidget.addSpacer(5);
}

async function Graph(day) {
//chart
  await nordpoolData(day);
  if (pricesJSON.length == 24) {
   hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
   zeroline = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  }
  else {
   hours = [
   0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,
   5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,
   10,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,
   14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17,
   18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,
   22,22,22,22,23,23,23,23
  ];
  zeroline = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  ,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  ,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  ,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  //hours = hours + hours
  //zeroline = zeroline + zeroline
  }
  if (daybefore != day && size != "small"){ 
    let left = listwidget.addStack();
	  let whatday
		if (date == todaydate) {
			whatday = left.addText(t("today"));
		} else if (date == tomorrowdate) {
			whatday = left.addText(t("tomorrow"));
    } else {
			whatday = left.addText(date);
		}
    whatday.textColor = new Color("#ffffff");
    whatday.font = Font.lightSystemFont(13);
    left.addSpacer();
    if (prices == 0) {
      whatday = left.addText(t("after13"));
      whatday.textColor = new Color("#ffffff");
      whatday.font = Font.lightSystemFont(13);
      listwidget.addSpacer(5);
      daybefore = day;
      return;
    } else {
      let updatetext = left.addText(t("updated") + updated);
      updatetext.font = Font.lightSystemFont(13);
      updatetext.textColor = new Color("#ffffff");
    }
  }
  daybefore = day;
  //listwidget.addSpacer(13)
  if (hour != 1111) {
    let avgtoday = []
    let dotNow = ""
    let countertoday = 0
    let counterdot = 0
    
    do{
      avgtoday += priceAvg + ","
      countertoday += 1
    }
    while (countertoday < pricesJSON.length)
    
    do{
      if (pricesJSON.length == 24){
        if (hour == counterdot && day == "today") {
          dotNow += pricesJSON[counterdot] + ","
        }
        else {
          dotNow += ","
        }
      }
      else {
        if (hour*4 == counterdot) {
          for (let a = 0; a < 4; a++) {
            if (day == "today" && minute >= a * 15 && minute < (a + 1) * 15) { // actual hour and identifies which 15-minute interval
              hour=hour*4+a
              dotNow += pricesJSON[hour] + ","
            } else {
            dotNow += ","}
          }
        } else {
            dotNow += ","
        }
      }
      counterdot += 1
    }
    while (counterdot < pricesJSON.length)
    //avgtoday += avgtoday
    //pricesJSON2 = 
    //await nordpoolData("tomorrow");
    //pricesJSON = pricesJSON + "," + pricesJSON
    //log(pricesJSON)
    //pricesJSON = pricesJSONnew + "," + pricesJSON
    let graphtoday = "https://quickchart.io/chart?bkg=black&w=1300&h="+settings.height+"&c="
    graphtoday += encodeURI("{\
      data: { \
        labels: ["+hours+"],\
        datasets: [\
        {\
            data: ["+dotNow+"],\
            type: 'line',\
            fill: false,\
            borderColor: 'rgb(0,255,255)',\
            borderWidth: 65,\
            pointRadius: 6\
          },\
          {\
            data: ["+avgtoday+"],\
            type: 'line',\
            fill: false,\
            borderColor: 'orange',\
            borderWidth: 6,\
            pointRadius: 0,\
            order: 4\
          },\
          {\
            data: ["+zeroline+"],\
            type: 'line',\
            fill: false,\
            borderColor: 'rgb(255,255,255)',\
            borderWidth: 6,\
            order: 5,\
            pointRadius: 0\
          },\
          {\
            data: ["+pricesJSON+"],\
            type: 'line',\
            fill: false,\
            borderColor: getGradientFillHelper('vertical',['rgb(255,25,255)','rgb(255,48,8)','orange','rgb(255,255,0)','rgb(0,150,0)']),\
            borderWidth: 10, \
            pointRadius: 0\
          },\
        ]\
      },\
        options:\
          {\
            legend:\
            {\
              display: false\
            },\
            scales:\
            {\
              xAxes: [{\
                offset:true,\
                ticks:{maxTicksLimit:24, maxRotation:0,fontSize:35,fontColor:'white'}\
              }],\
              yAxes: [{\
                ticks:{stepSize:10,beginAtZero:true,fontSize:35,fontColor:'white'}\
              }]\
            }\
          }\
    }")
    graphtoday.timeoutInterval = 10;
    const GRAPH = await new Request(graphtoday).loadImage()
    
    //let emptyrow = listwidget.addStack()
    
    //listwidget.addSpacer(5)
    let chart = listwidget.addStack()
    chart.addImage(GRAPH) 
  }
  listwidget.addSpacer(5);
}

async function PriceStats(day) {
  if (internet == true) {
  await nordpoolData(day);
  }
  if (daybefore != day){
    let left = listwidget.addStack();
	  let whatday
		if (date == todaydate) {
			whatday = left.addText(t("today"));
		} else if (date == tomorrowdate) {
			whatday = left.addText(t("tomorrow"));
    } else {
			whatday = left.addText(date);
		}
    whatday.textColor = new Color("#ffffff");
    whatday.font = Font.lightSystemFont(13);
    left.addSpacer();
		if (prices == 0) {
      whatday = left.addText(t("after13"));
      whatday.textColor = new Color("#ffffff");
      whatday.font = Font.lightSystemFont(13);
      listwidget.addSpacer(5);
      daybefore = day;
      return;
    } else {
      let updatetext = left.addText(t("updated") + updated);
      updatetext.font = Font.lightSystemFont(13);
      updatetext.textColor = new Color("#ffffff");
  	}
	}
  daybefore = day;
  if (prices == 0) {
    return;
  }
  let bottom = listwidget.addStack();
  if (day != "tomorrow"){
    let now;
    if (pricesJSON.length == 24){
      now = bottom.addText(t("now") + " " + Math.round(pricesJSON[hour]));
    }
    else {
      const nowdate = new Date()
      const nowminute = nowdate.getMinutes()
      const block = Math.floor(nowminute/15)
      
      now = bottom.addText(t("now") + " " + Math.round(pricesJSON[hour]));
    }
    now.font = Font.lightSystemFont(11);
    now.textColor = new Color("#00ffff");
    bottom.addSpacer();
  }
  // lowest
  let lowest = bottom.addText(t("lowest") + " " + Math.round(priceLowest));
  lowest.font = Font.lightSystemFont(11);
  lowest.textColor = new Color("#00cf00");
  //bottom.addSpacer();
  // average

  if (size == "small") {
    let yh = listwidget.addStack()
    let avg = yh.addText(t("average") + " " + Math.round(priceAvg));
    avg.font = Font.lightSystemFont(11);
    avg.textColor = new Color("#f38");
    yh.addSpacer();
  // highest
    let highest = yh.addText(t("highest") + " " + Math.round(priceHighest));
    highest.font = Font.lightSystemFont(11);
    highest.textColor = new Color("#fa60ff");
  }
  else {
    bottom.addSpacer();
    let avg = bottom.addText(t("average") + " " + Math.round(priceAvg));
  avg.font = Font.lightSystemFont(11);
  avg.textColor = new Color("#f38");
  bottom.addSpacer();
  // highest
  let highest = bottom.addText(t("highest") + " " + Math.round(priceHighest));
  highest.font = Font.lightSystemFont(11);
  highest.textColor = new Color("#fa60ff");
  }
  listwidget.addSpacer(5);
}

const smallFont = 10;
const mediumFont = 11.5;
const bigFont = 12.5;

  
  //0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
date = `${yyyy}-${mm}-${dd}`;
todaydate = `${yyyy}-${mm}-${dd}`;
const ddtomorrow = String(now.getDate() + 1).padStart(2, '0');
tomorrowdate = `${yyyy}-${mm}-${ddtomorrow}`;
hour = now.getHours();
minute = now.getMinutes();

async function nordpoolData(day) {
  allValues = [];
  allValues2 = [];
  Path = fm.joinPath(dir, "NordPool_" + day + "Prices.json");
  DateObj = new Date();
  async function getData() {
    if (day == "tomorrow") {
      settings.notificationSetTomorrow = 0;
    } else {
      settings.notificationSet = 0;
    }
    const yyyy = DateObj.getFullYear();
    const mm = String(DateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(DateObj.getDate()).padStart(2, '0');
    let date = `${yyyy}-${mm}-${dd}`;
    //log(tomorrowdate)
    //if (day == "tomorrow") {
      //date = tomorrowdate
      //settings.notificationSetTomorrow = 0;
    //}
    const Url = `https://dataportal-api.nordpoolgroup.com/api/DayAheadPriceIndices?date=${date}&market=DayAhead&indexNames=${area}&currency=${currency}&resolutionInMinutes=${resolution}`;
    const request = new Request(Url);
    request.timeoutInterval = 1;
    let response = (await request.loadJSON());
    const dataJSON = JSON.stringify(response, null ,2);
    fm.writeString(Path, dataJSON);
  }
  if (fm.fileExists(Path)) {
    let modified = fm.modificationDate(Path);
    let now = new Date();
    let hoursDiff = (now - modified) / (1000 * 60 * 60);
    let modifiedDay = modified.getDate();
    let modifiedMonth = modified.getMonth();
    let modifiedYear = modified.getFullYear();
    let yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    let isFromYesterday =
    modifiedDay === yesterday.getDate() &&
    modifiedMonth === yesterday.getMonth() &&
    modifiedYear === yesterday.getFullYear();
    if (hoursDiff > 6 || hour == 13 || isFromYesterday) {
      await getData();
    }
  } else {
    await getData();
  }
  //await getData();
  let content = fm.readString(Path);
  response = JSON.parse(content);
  date = response.deliveryDateCET;  
  prices = response.multiIndexEntries;
  let Updated = response.updatedAt;
  updated = Updated.replace(/\.\d+Z$/, '').replace('T', ' ');
  for (let i = 0; i < prices.length; i++) {
    const value = prices[i]["entryPerArea"][`${area}`];
    allValues.push(String(value/10* (1 + "." + (includevat*vat)) + extras));
  }
  pricesJSON = JSON.parse(JSON.stringify(allValues));
  priceLowest = (Math.min(...pricesJSON.map(Number)));
  priceHighest = (Math.max(...pricesJSON.map(Number)));
  priceDiff = (priceHighest - priceLowest)/3;
  priceAvg = pricesJSON.map(Number).reduce((a, b) => a + b, 0) / pricesJSON.length;
  highTime = pricesJSON.map(Number).indexOf(priceHighest)
  lowTime = pricesJSON.map(Number).indexOf(priceLowest)
  //log(Notification.allPending())
  if (prices != 0 && settings.highlow == 1)  {
   
     //let pending = await Notification.allPending()
    //console.log(pending)
    await setNotification(day);
  }
}

async function setNotification(day) {

//let pending = await Notification.allPending()
//console.log(pending)
//await Notification.removeAllDelivered()

let today = new Date()
if (day == "tomorrow" && settings.notificationSetTomorrow == 0) {
  await Notification.removeAllPending()
  let highnot = new Notification()
  highnot.title = "Högsta elpriset"
  highnot.body = `Elpriset är som högst klockan ${highTime}, ${Math.round(priceHighest)} öre/kWh)`
  highnot.sound = "piano_error"
  await highnot.schedule()

  let lownot = new Notification()
  lownot.title = "Lägsta elpriset"
  lownot.body = `Elpriset är som lägst klockan ${lowTime}, ${Math.round(priceLowest)} öre/kWh)`
  lownot.sound = "piano_success"
  await lownot.schedule()
  settings.notificationSetTomorrow = 1

} else if (settings.notificationSet == 0) {
  await Notification.removeAllPending()
  let highnot = new Notification()
  highnot.title = "Högsta elpriset"
  highnot.body = `Elpriset är som högst nu, ${Math.round(priceHighest)} öre/kWh)`
  highnot.sound = "default"
  hourtime = Math.floor(highTime / 4);     // varje timme = 4 kvart
  quarter = highTime % 4;              // resterande kvart i timmen (0–3)

// För att skapa rätt tid (kvart = 0, 1, 2, 3 motsvarar 00, 15, 30, 45 min):
  minutes = quarter * 15;
  highnot.setTriggerDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), hourtime,minutes))
  await highnot.schedule()

  let lownot = new Notification()
  lownot.title = "Lägsta elpriset"
  lownot.body = `Elpriset är som lägst nu, ${Math.round(priceLowest)} öre/kWh)`
  lownot.sound = "default"
  hourtime = Math.floor(lowTime / 4);     // varje timme = 4 kvart
  quarter = lowTime % 4;              // resterande kvart i timmen (0–3)

// För att skapa rätt tid (kvart = 0, 1, 2, 3 motsvarar 00, 15, 30, 45 min):
  minutes = quarter * 15;

  lownot.setTriggerDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), hourtime,minutes))
  await lownot.schedule()
  settings.notificationSet = 1

}
fm.writeString(filePathSettings, JSON.stringify(settings, null, 2));
}

async function renderSection(position) {
  const value = settings[`showat${position}`];
  if (!value || value === "nothing") {
    return;
  }
  let [type, day] = value.split(",").map(s => s.trim());
  //const graphOption = settings.graphOption[position]
  settings.showatbottom = `pricestats, ${day}`
  if (position == "top" && type == "pricestats") {type = "graph"}
  
   switch (type) {
    case "table":
      await Table(day);
      break;
    case "graph":
      await Graph(day, "line");
      break;
    case "pricestats":
      await PriceStats(day);
      break;
    default:
  }
}

let listwidget = new ListWidget();
listwidget.backgroundColor = new Color("#000000");

async function createWidgetLarge(){
  //listwidget.backgroundColor = new Color("#000000");
  settings.height = 1050;
  await renderSection("top");
  //await renderSection("middle");
  await renderSection("bottom");  
  
  let moms = listwidget.addStack();
  momstext = moms.addText("v. " + version);
  momstext.font = Font.lightSystemFont(10);
  momstext.textColor = new Color("#ffffff");
  moms.addSpacer(120);
  momstext = moms.addText(area);
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
  return listwidget
}

//widget = await createWidget();

// if (config.runsInWidget) {
//   Script.setWidget(widget);
// } else {
//   if (Math.random() < 0.5) {
//     let alert = new Alert();
//     alert.title = "Support";
//     alert.message = t("buymeacoffee") + "?";
//     alert.addCancelAction(t("ofcourse"));
//     alert.addAction(t("noway"));
//     let response = await alert.present();
//     if (response === -1) {
//       Safari.open("https://buymeacoffee.com/flopp999");
//     }
  //}
//}

// === EXEMPELFUNKTIONER ===
async function createWidgetSmall() {
  settings.height = 620;
  if (internet == true) { await renderSection("top");}
  //await renderSection("middle");
  await renderSection("bottom");let moms = listwidget.addStack();
  momstext = moms.addText("v. " + version);
  momstext.font = Font.lightSystemFont(10);
  momstext.textColor = new Color("#ffffff");
  moms.addSpacer();
  momstext = moms.addText(area);
  momstext.font = Font.lightSystemFont(10);
  momstext.textColor = new Color("#ffffff");
  //moms.addSpacer();
  let moms2 = listwidget.addStack();
  
  momstext = moms2.addText("Extras: " + extras);
  momstext.font = Font.lightSystemFont(10);
  momstext.textColor = new Color("#ffffff");
  moms2.addSpacer();
  if (includevat == 1) {
    momstext = moms2.addText(t("inclvat"));
  }
  else {
    momstext = moms2.addText(t("exclvat"));
  }
  momstext.font = Font.lightSystemFont(10);
  momstext.textColor = new Color("#ffffff");

  return listwidget
} 

async function createWidgetMedium() {
  settings.height = 290
  //listwidget.addSpacer(15)
  //await renderSection("top");
  //await renderSection("middle");
  await renderSection("bottom");  
  let moms = listwidget.addStack();
  momstext = moms.addText("v. " + version);
  momstext.font = Font.lightSystemFont(10);
  momstext.textColor = new Color("#ffffff");
  moms.addSpacer(120);
  momstext = moms.addText(area);
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
  return listwidget
}

async function createWidgetAccessoryCircular() {
  await nordpoolData(day)
  
  let moms = listwidget.addStack();
  moms.layoutVertically()
  //moms.centerAlignContent()
  
  //let moms2 = moms.addStack();
  //moms2.layoutHorizontally()
  //moms2.centerAlignContent()
  
  let momstext = moms.addText(String(Math.round(pricesJSON[hour])));
  //momstext.centerAlignText()
  momstext.font = Font.lightSystemFont(14);
  //let momstext2 = moms.addText(String(Math.round(pricesJSON[hour])));
  //momstext2.centerAlignText()
  //momstext2.font = Font.lightSystemFont(11);
  
  //let moms67 = moms.addStack(); 
  //moms67.layoutHorizontally()
  
  let momstex = moms.addText(String(Math.round(priceLowest)));
  //momstex.centerAlignText()
  momstex.font = Font.lightSystemFont(14);
  //let momste = moms.addText(String(Math.round(priceLowest)));
  //momste.centerAlignText()
  //momste.font = Font.lightSystemFont(11);
  
  //let moms3 = moms.addStack();
  //moms3.layoutHorizontally()
  //moms3.centerAlignContent()
  
  //let momstext3 = moms.addText(t("average") + Math.round(priceAvg));
  //momstext3.centerAlignText()
  //momstext3.font = Font.lightSystemFont(11);
  //let momstext23 = moms.addText(String(Math.round(priceAvg)));
  //momstext23.centerAlignText()
  //momstext23.font = Font.lightSystemFont(11);
  
  let moms6 = listwidget.addStack();
  //moms6.layoutHorizontally()
  
  let momstextu = moms6.addText(String(Math.round(priceHighest)));
  //momstextu.leftAlignText()
  momstextu.font = Font.lightSystemFont(14);
  //let momstext2u = moms.addText(String(Math.round(priceHighest)));
  //momstext2u.centerAlignText()
  //momstext2u.font = Font.lightSystemFont(11);
  
  listwidget.addAccessoryWidgetBackground = true
  return listwidget
}

async function createWidgetAccessoryInline() {
  await nordpoolData(day)
  
  let moms = listwidget.addStack();
  //moms.layoutVertically()
  //moms.centerAlignContent()
  
  //let moms2 = moms.addStack();
  //moms2.layoutHorizontally()
  //moms2.centerAlignContent()
  
  let momstext = moms.addText("nu "+ Math.round(pricesJSON[hour]));
  momstext.centerAlignText()
  momstext.font = Font.lightSystemFont(11);
  //let momstext2 = moms.addText(String(Math.round(pricesJSON[hour])));
  //momstext2.centerAlignText()
  //momstext2.font = Font.lightSystemFont(11);
  
  //let moms67 = moms.addStack();
  //moms67.layoutHorizontally()
  
  //let momstex = moms67.addText("lägsta ");
  //momstextu.centerAlignText()
  //momstex.font = Font.lightSystemFont(11);
  //let momste = moms67.addText(String(Math.round(priceLowest)));
  //momstext2u.centerAlignText()
  //momste.font = Font.lightSystemFont(11);
  
  //let moms3 = moms.addStack();
  //moms3.layoutHorizontally()
  //moms3.centerAlignContent()
  
  //let momstext3 = moms3.addText("medel ");
  //momstext3.centerAlignText()
  //momstext3.font = Font.lightSystemFont(11);
  //let momstext23 = moms3.addText(String(Math.round(priceAvg)));
  //momstext23.centerAlignText()
  //momstext23.font = Font.lightSystemFont(11);
  
  //let moms6 = moms.addStack();
  //moms6.layoutHorizontally()
  
  //let momstextu = moms6.addText("högsta ");
  //momstextu.centerAlignText()
  //momstextu.font = Font.lightSystemFont(11);
  //let momstext2u = moms6.addText(String(Math.round(priceHighest)));
  //momstext2u.centerAlignText()
  //momstext2u.font = Font.lightSystemFont(11);
  
  listwidget.addAccessoryWidgetBackground = true
  return listwidget
}


// function createWidgetLarge() {
//   let w = new ListWidget();
//   w.backgroundColor = new Color("#e67e22");
//   w.addText("Large widget");
//   return w;
// }

let size = config.widgetFamily;

if (!size) {
  let alert = new Alert();
  alert.title = "Test widget-size";
  alert.addAction("Small");
  alert.addAction("Medium");
  alert.addAction("Large");
  //alert.addAction("Accessory Circular");
  //alert.addAction("Accessory Rectangular");
  //alert.addAction("Accessory Inline");
  let response = await alert.presentSheet();

  // Support-popup ibland
  if (Math.random() < 0.0) {
    let alert = new Alert();
    alert.title = "Support";
    alert.message = t("buymeacoffee") + "?";
    alert.addCancelAction(t("ofcourse"));
    alert.addAction(t("noway"));
    let resp2 = await alert.present();
    if (resp2 === -1) {
      Safari.open("https://buymeacoffee.com/flopp999");
    }
  }

  // Sätt storlek beroende på val
  if (response === 0) size = "small";
  if (response === 1) size = "medium";
  if (response === 2) size = "large";
  if (response === 3) size = "accessoryCircular";
  if (response === 4) size = "accessoryRectangular";
  if (response === 5) size = "accessoryInline";
}

switch (size) {
  case "small":
    widget = await createWidgetSmall();
    break;
  case "medium":
    widget = await createWidgetMedium();
    break;
  case "large":
    widget = await createWidgetLarge();
    break;
  case "accessoryCircular":
    widget = await createWidgetAccessoryCircular();
    break;
  case "accessoryRectangular":
    widget = await createWidgetAccessoryRectangular();
    break;
  case "accessoryInline":
    widget = await createWidgetAccessoryInline();
    break;
}

if (!config.runsInWidget) {
  
  if (size === "small") await widget.presentSmall();
  if (size === "medium") await widget.presentMedium();
  if (size === "large") await widget.presentLarge();
  if (size === "accessoryCircular") await widget.presentAccessoryCircular();
  if (size === "accessoryRectangular") await widget.presentAccessoryRectangular();
  if (size === "accessoryInline") await widget.presentAccessoryInline();
} else {
  Script.setWidget(widget);
}

Script.complete();
