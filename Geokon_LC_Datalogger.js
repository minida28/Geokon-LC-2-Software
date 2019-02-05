
/*************************************************************************
This worker script (worker scripts can be added in the script window)
demonstrates the usage of the plotWindow.
***************************************************************************/

var channelNames = [
    'SG-1',
    'SG-2',
    'SG-3',
    'SG-4',
    'SG-5',
    'SG-6',
    'SG-7',
    'SG-8',
    'SG-9',
    'SG-10',
    'SG-11',
    'SG-12',
    'SG-13',
    'SG-14',
    'SG-15',
    'SG-16'
]

var colorsArray = [
    'red', 'green', /*'yellow',*/ 'blue', 'orange',
    'purple', /*'cyan',*/ 'magenta', 'lime', /*'pink',*/
    'teal', 'red', 'green', /*'yellow',*/ 'blue', 'orange',
    'purple', /*'cyan',*/ 'magenta', 'lime', /*'pink',*/
    'teal'
]

// var scatterStyle = UI_comboBoxScatterStyle.currentIndex();
var scatterStyleArray = [
    /*'Dot',*/ 'Disc', 'Cross', 'Plus', 'Circle', 'Disc',
    'Square', 'Diamond', 'Star', 'Triangle', 'TriangleInverted',
    'CrossSquare', 'PlusSquare', 'CrossCircle', 'PlusCircle', 'Peace',
    'None'
];

// https://www.w3resource.com/javascript-exercises/javascript-date-exercise-27.php
var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var filePathArray = [
    'Datalogger_LC-2.csv',
    'Datalogger_LC-2x4.csv',
    'Datalogger_LC-2x16.csv'
]

var numSensor = [1, 4, 16];

var LOGGER = [
    { numSensor: 1 },
    { numSensor: 4 },
    { numSensor: 16 }
];

var mainControlIsEnabled = false;

var plotWindowArray = [];
var arrayGraph = [];
var line = Array();

var MAX_MEM = 5000;

// var yArrayTot = new Array(3);

var yArrayTot = [];
yArrayTot = matrix(16, MAX_MEM, ''); // 10 lines, 5 cols filled with 0


// UI_console_2.insertPlainText("yArray, len:" + yArrayTot.length + " = " + yArrayTot + "\r\n");

var plotDataCounter = 0;

// chart variables
var xRange = 100;
var yMax = 6000;
var yMin = -6000;
var scaleFactor = 1.5;

var scanInterval = -1;
var simulateInterval = 500;
var randomize = true;

// frequency
var freq;
var freqCounter = 0;
var freqMillis = 0;


// https://stackoverflow.com/a/18116922/10079180
// How can I create a two dimensional array in JavaScript?
function matrix(rows, cols, defaultValue) {
    var arr = [];
    // Creates all lines:

    for (var i = 0; i < rows; i++) {
        // Creates an empty line
        arr.push([]);
        if (true) {
            // Adds cols to the empty line:
            arr[i].push(new Array(cols));

            for (var j = 0; j < cols; j++) {
                // Initializes:
                arr[i][j] = defaultValue;
            }
        }
    }

    return arr;
}


goodArray = [];
// goodArray4 = [];
// goodArray16 = [];

// var length = 400000; // user defined length
//
// for (var i = 0; i < length; i++) {
//   yArray.push(Math.random() * 100);
// }
var stringToProcess;
// var line = [];
// var tempArr = Array();
var reading = Array();

var rowMax = 200;
var insertNewDataOnTop = false;
var tableAutoScroll = true;

var commandStatusSent = false;
var simulateData = false;

// var localDay;
// var local

var now = 0;

// var loggerModel = -1;
// var loggerModel_old = loggerModel;

var newData = false;
// var regex = /LC0111192603/g;

// var offset = 0;

var monitorModeState = 0;

var sec_old = 0;

function getCurrentDateTimeStr() {

    if (UI_labelLoggerModel.text() &&
        UI_labelLoggerID.text() &&
        UI_labelMonitorMode.text() &&
        UI_labelLoggingState.text() &&
        UI_labelScanInterval.text()
    ) {
        UI_groupBoxMainControl.setEnabled(true);
        mainControlIsEnabled = true;
        // UI_groupBox_2.setEnabled(true);

        if (plotWindowArray.length == 0) {
            ConstructTable();
            AddGraphLines();


            // update file info
            UI_labelFileInfo.setText(GetLogFileInfo());

            if (plotWindowArray[0]) {
                UI_checkBoxShowPlotWindow_0.setChecked(1);
                UI_checkBoxShowPlotWindow_0.setEnabled(1);
            }

            if (plotWindowArray[1]) {
                UI_checkBoxShowPlotWindow_1.setChecked(1);
                UI_checkBoxShowPlotWindow_1.setEnabled(1);
            }


        }


        if (plotWindowArray[0]) {
            // UI_checkBoxShowPlotWindow_0.setChecked(1);
            UI_checkBoxShowPlotWindow_0.setEnabled(1);
        } else {
            UI_checkBoxShowPlotWindow_0.setEnabled(0);
        }

        if (plotWindowArray[1]) {
            // UI_checkBoxShowPlotWindow_1.setChecked(1);
            UI_checkBoxShowPlotWindow_1.setEnabled(1);
        } else {
            UI_checkBoxShowPlotWindow_1.setEnabled(0);
        }



    }

    // scriptThread.appendTextToConsole(simulateData());


    var tmp = new Date();
    var tmp2 = Math.floor(tmp.getTime());

    now = tmp2;
    var str = scriptThread.getTimestamp("yyyy-M-d hh:mm:ss");
    // UI_dateTimeEdit.setDateTime(str);
    // scriptThread.appendTextToConsole(now);
    // return str;

    var sec = tmp.getSeconds();

    if (sec != sec_old) {
        sec_old = sec;
        var dateStr = tmp.toDateString();
        // scriptThread.appendTextToConsole(str2);

        var hour = tmp.getHours();
        var min = tmp.getMinutes();
        var sec = tmp.getSeconds();

        hour = ("0" + hour).slice(-2);
        min = ("0" + min).slice(-2);
        sec = ("0" + sec).slice(-2);
        var timeStr = hour + ":" + min + ":" + sec;
        var dateTimeStr = dateStr + " " + timeStr;
        UI_labelDateTime.setText(dateTimeStr);
    }
}

Number.prototype.round = function (places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
}

function generateRandomFloat(nMin, nMax, nPrecision) {
    return (Math.random() * (nMax - nMin) + nMin).round(nPrecision);
}

function GenerateFakeData() {

    var loggerModel = UI_comboBoxLoggerModel.currentIndex();

    if (loggerModel < 0 || loggerModel > 2) {
        scriptThread.appendTextToConsole('[ERROR] GenerateFakeData(), WRONG DATALOGGER MODEL');
        return;
    }

    var dt = new Date();

    var fake = [];

    fake[0] = UI_labelLoggerID.text();
    fake[1] = dt.getFullYear();
    fake[2] = dt.getMonth() + 1;
    fake[3] = dt.getDate();
    fake[4] = dt.getHours();
    fake[5] = dt.getMinutes();
    fake[6] = dt.getSeconds();
    fake[7] = generateRandomFloat(1.5, 3, 2);
    fake[8] = generateRandomFloat(20, 30, 2);


    var sensorReadingArray = [];
    var tempReadingArray = [];

    var numSensor;

    if (loggerModel == 0)
        numSensor = 1;
    else if (loggerModel == 1)
        numSensor = 4;
    else if (loggerModel == 2)
        numSensor = 16;


    if (randomize) {
        var arraySensorMax = [0.1, 0.2, 0.3, 0.5, 3, 4, 4, 8, 9, 20, 50];
        var arraySensorMin = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -0.5];

        var ySensorMax = arraySensorMax[generateRandomFloat(0, 10, 0)];
        // var ySensorMin = arraySensorMin[generateRandomFloat(10, 10, 0)];
        var ySensorMin = ySensorMax - arraySensorMax[generateRandomFloat(0, 10, 0)];
        var yTempMax = 35;
        var yTempMin = 20;

        for (var i = 0; i < numSensor; i++) {
            var ySensorMax = arraySensorMax[generateRandomFloat(0, 10, 0)];
            var ySensorMin = ySensorMax - arraySensorMax[generateRandomFloat(0, 10, 0)];
            fake[i + 9] = generateRandomFloat(ySensorMin, ySensorMax, 2);
            fake[i + 9 + numSensor] = generateRandomFloat(yTempMin, yTempMax, 2);
        }

    } else {
        var s = [-10, -9, -8, -7, -6, -5, -4, -3, 3, 4, 5, 6, 7, 8, 9, 10];
        var t = [22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37, 38];

        for (var i = 0; i < numSensor; i++) {
            fake[i + 9] = s[i];
            fake[i + 9 + numSensor] = t[i];
        }
    }

    var addPointerNumber = true;

    if (addPointerNumber) {
        if (plotDataCounter < MAX_MEM) {
            fake[fake.length] = plotDataCounter + 1;
        }       
    }

    var data = fake.join(',') + '\r\n';

    dataReceivedSlot(conv.stringToArray(data));

    return conv.stringToArray(data);
    // return data;
}


function dataReceivedSlot(data) {

    var i = 0;

    UI_ledRx.setState(1);
    // UI_ledLoggingState.setState(1);

    while (i < data.length) {

        // var c = dataStr[i];
        var c = String.fromCharCode(data[i]);

        UI_console.insertPlainText(c);

        if (c === '*' || c === '\r' || c === '\n') {
            // line.push(c);
        } else {
            line.push(c);
        }

        var stringReady = 0;

        if (c === '\r' || c === '*') {
            stringReady = true;
        }

        if (stringReady) {

            stringToProcess = line.join("");
            line = Array();
			
			checkStringsLoggerModel();

            // if (commandStatusSent == true) {
                // commandStatusSent = false;
                // checkStringsLoggerModel();
            // }

            if (!UI_labelLoggerID.text() && UI_comboBoxLoggerModel.currentIndex() > -1 && UI_comboBoxLoggerModel.currentIndex() <= 2)
                checkStringsLoggerID();

            checkStringsMonitorModeState();
            checkStringsLoggingState();
            checkStringsScanInterval();

            if (UI_labelLoggerID.text() && UI_labelLoggerModel.text()) {
                // UI_console_2.insertPlainText("Check data for sensor readings...\r\n");
                checkStringsSensorReadings();
            }

        }

        i++;
    }

    UI_ledRx.setState(0);
    // UI_ledLoggingState.setState(0);
}

// /****************time / date / calendar************************/
// UI_timeEdit.setDisplayFormat("hh:mm:ss");
// UI_timeEdit.setTime("10:09:08");
// UI_timeEdit.timeChangedSignal.connect(timeEditTimeChanged);

//connect the dataReceivedSlot function to the dataReceivedSignal signal
scriptThread.dataReceivedSignal.connect(dataReceivedSlot);

// function searchString(strArray, regex) {
//   // var str = strArray.join("");
//   // var hello = strArray;
//   var m = stringToProcess.match(regex);
//   if (m === null) {
//     return 0;
//   }
//   return m.length;
// }

// function searchString(strArray, regex) {
//   return stringToProcess.search(regex);
// }


//Is called if this script shall be exited.
function stopScript() {
    scriptThread.appendTextToConsole("stopScript() called");
}

//The dialog is closed.
function mainWindowFinished(e) {
    // stopMonitorClicked();
    scriptThread.appendTextToConsole('mainWindowFinished() called');

    wakeUpCommand();
    stopMonitorCommand();
    scriptThread.stopScript();
}

//Is called if the user clicks on the run button.
function runClicked() {
    timer.start(0);
    plotWindow.setAutoUpdateEnabled(true);
    UI_pushButtonRun.setEnabled(false);
    UI_pushButtonStop.setEnabled(true);

    UI_MainWindow.showMessage("Data acquisition is running.", 0);
}

//Is called if the user clicks on the stop button.
function stopClicked() {
    timer.stop();
    plotWindow.setAutoUpdateEnabled(false);
    UI_pushButtonRun.setEnabled(true);
    UI_pushButtonStop.setEnabled(false);

    UI_MainWindow.showMessage("Data acquisition is stopped.", 2000);
}

function wakeUpSingleChannelLoggerCommand() {
    scriptInf.sendString("\r");
}

function wakeUpMutiChannelLoggerCommand() {
    scriptInf.sendString("\r", 2, 50);
}

function wakeUpCommand() {
    if (!UI_labelLoggerModel.text()) {
        wakeUpSingleChannelLoggerCommand();

        var timer1 = scriptThread.createTimer()
        timer1.timeoutSignal.connect(wakeUpMutiChannelLoggerCommand);
        timer1.setSingleShot(true);
        timer1.start(100);
    }

    if (UI_labelLoggerModel.text() === 'LC-2')
        wakeUpSingleChannelLoggerCommand();
    else
        wakeUpMutiChannelLoggerCommand();
}

// function wakeUpClicked() {
//   // timer.stop();
//   // plotWindow.setAutoUpdateEnabled(false);
//   // UI_pushButtonRun.setEnabled(true);
//   // UI_pushButtonStop.setEnabled(false);
//
//   UI_MainWindow.showMessage("Waking up datalogger.", 2000);
//
//   if (loggerModel == 0)
//     scriptInf.sendString("\r");
//   else
//     scriptInf.sendString("\r", 2, 50);
// }

function readNowCommand() {
    scriptInf.sendString("X\r");
}

function startMonitorCommand() {
    scriptInf.sendString("ME\r");
}

function stopMonitorCommand() {
    scriptInf.sendString("MD\r");
}

function startLoggingCommand() {
    scriptInf.sendString("ST\r");
}

function stopLoggingCommand() {
    scriptInf.sendString("SP\r");
}

function getLoggerStatusCommand() {
    // var settings = scriptThread.getConsoleSettings();
    // scriptThread.appendTextToConsole(settings.backgroundColor);
    // scriptThread.appendTextToConsole(settings.font);
    // scriptThread.appendTextToConsole("newLineAfterBytes: " + settings.newLineAfterBytes);
    // scriptThread.appendTextToConsole("newLineAfterPause: " + settings.newLineAfterPause);
    // scriptThread.appendTextToConsole("createNewLineAtByte: " + settings.createNewLineAtByte);
    // scriptThread.appendTextToConsole("newLineAtByte: " + settings.newLineAtByte);
    // scriptThread.appendTextToConsole("\r\n", false, false);

    // scriptInf.sendString("ID\r");
    scriptInf.sendString("S\r");
    commandStatusSent = true;
}

function getLoggerIDCommand() {
    scriptInf.sendString("ID\r");
}

function setScanIntervalCommand() {
    var interval = UI_lineEditScanInterval.text();
    scriptInf.sendString("SC" + interval + "\r");
}

function helpCommand() {
    scriptInf.sendString("?\r");
}

function readNowClicked() {
    UI_MainWindow.showMessage("Read now.", 2000);
    wakeUpCommand();
    var timer1 = scriptThread.createTimer();
    timer1.timeoutSignal.connect(readNowCommand);
    timer1.setSingleShot(true);
    timer1.start(100);

    // scriptInf.sendString("\rX\r");
}

/*
function startMonitorClicked() {
  UI_MainWindow.showMessage("Monitor enabled.", 2000);
  wakeUpCommand();
  var timer1 = scriptThread.createTimer();

  var checked = UI_pushButtonStartMonitor.isChecked();

  if (checked) {
    timer1.timeoutSignal.connect(stopMonitorCommand);
  } else {
    timer1.timeoutSignal.connect(startMonitorCommand);
  }
  timer1.setSingleShot(true);
  timer1.start(100);
}
*/

function startMonitorClicked() {
    UI_MainWindow.showMessage("Monitor enabled.", 2000);
    wakeUpCommand();
    var timer1 = scriptThread.createTimer();
    timer1.timeoutSignal.connect(startMonitorCommand);
    timer1.setSingleShot(true);
    timer1.start(100);
}

function stopMonitorClicked() {
    UI_MainWindow.showMessage("Monitor disabled.", 2000);
    wakeUpCommand();
    var timer1 = scriptThread.createTimer();
    timer1.timeoutSignal.connect(stopMonitorCommand);
    timer1.setSingleShot(true);
    timer1.start(100);

    // scriptInf.sendString("\rMD\r");
}

/*
function startLoggingClicked() {
  UI_MainWindow.showMessage("Start logging.", 2000);
  wakeUpCommand();
  var timer1 = scriptThread.createTimer();
  if (UI_pushButtonStartLogging.text() === 'Start LOGGING') {
    timer1.timeoutSignal.connect(startLoggingCommand);
  } else {
    timer1.timeoutSignal.connect(stopLoggingCommand);
  }

  timer1.setSingleShot(true);
  timer1.start(100);
}
*/

function startLoggingClicked() {
    UI_MainWindow.showMessage("Start logging.", 2000);
    wakeUpCommand();
    var timer1 = scriptThread.createTimer();
    timer1.timeoutSignal.connect(startLoggingCommand);
    timer1.setSingleShot(true);
    timer1.start(100);
}

function stopLoggingClicked() {
    UI_MainWindow.showMessage("Stop logging.", 2000);
    wakeUpCommand();
    var timer1 = scriptThread.createTimer();
    timer1.timeoutSignal.connect(stopLoggingCommand);
    timer1.setSingleShot(true);
    timer1.start(100);
}

function getLoggerStatusClicked() {
    UI_MainWindow.showMessage("Get status", 2000);



    // UI_comboBoxLoggerModel.setCurrentIndex(-1);
    loggerModel = -1;

    UI_labelLoggerModel.setText('');
    UI_labelLoggerID.setText('');
    UI_labelMonitorMode.setText('');
    UI_labelLoggingState.setText('');
    UI_labelScanInterval.setText('');

    // reset pushButtonStartMonitor
    UI_pushButtonStopMonitor.hide();
    UI_pushButtonStartMonitor.show();

    // reset pushButtonStartLogging
    UI_pushButtonStartLogging.show();
    UI_pushButtonStopLogging.hide();

    UI_groupBoxMainControl.setEnabled(false);
    mainControlIsEnabled = false;
    // UI_groupBox_2.setEnabled(false);

    UI_checkBoxShowPlotWindow_0.setEnabled(0);
    UI_checkBoxShowPlotWindow_0.setChecked(0);

    UI_checkBoxShowPlotWindow_1.setEnabled(0);
    UI_checkBoxShowPlotWindow_1.setChecked(0);

    // reset batt & temp
    UI_labelBatt.setText('-.--V');
    UI_labelTemp.setText('--.--°C');

    wakeUpCommand();

    var timer2 = scriptThread.createTimer();
    timer2.timeoutSignal.connect(getLoggerIDCommand);
    timer2.setSingleShot(true);
    timer2.start(100);

    var timer3 = scriptThread.createTimer();
    timer3.timeoutSignal.connect(getLoggerStatusCommand);
    timer3.setSingleShot(true);
    timer3.start(100);
}

function setScanIntervalClicked() {
    var interval = UI_lineEditScanInterval.text();
    var msg = "Set Scan Interval to " + interval + " second(s)";
    UI_MainWindow.showMessage(msg, 2000);
    wakeUpCommand();
    var timer1 = scriptThread.createTimer();
    timer1.timeoutSignal.connect(setScanIntervalCommand);
    timer1.setSingleShot(true);
    timer1.start(100);
}

function pushButtonHelpClicked() {
    var msg = "Help.";
    UI_MainWindow.showMessage(msg, 2000);
    wakeUpCommand();
    var timer1 = scriptThread.createTimer();
    timer1.timeoutSignal.connect(helpCommand);
    timer1.setSingleShot(true);
    timer1.start(100);
}

function PushButtonClearConsole_2Clicked() {
    UI_console_2.clear();
}

function PushButtonSetSimulateIntervalClicked() {
    simulateInterval = UI_lineEditSimulateInterval.text();
}

function PushButtonResetLogFileClicked() {
    if (scriptThread.showYesNoDialog('Warning', 'Reset Log file', "Reset the log file ?")) { //Yes clicked.
        var loggerModel = UI_comboBoxLoggerModel.currentIndex();
        if (loggerModel < 0) {
            // scriptThread.appendTextToConsole('Log file reset failed.');
            scriptThread.messageBox("Critical", "Error msg", "Reset file log failed.");
            return;
        }

        var path = filePathArray[loggerModel];

        if (scriptFile.deleteFile(path)) {
            CreateLogFile();
            UI_labelFileInfo.setText(GetLogFileInfo());
            scriptThread.messageBox("Information", "Info msg", "Log file reset successfully");
        } else {
            scriptThread.messageBox("Critical", "Error msg", "Reset file log failed.");
        }
    }
}

function CheckBoxShowPlotWindow_0Clicked() {
    if (plotWindowArray.length) {

        if (UI_checkBoxShowPlotWindow_0.isChecked())
            plotWindowArray[0].show();
        else {
            plotWindowArray[0].hide();
        }
    }
}

function CheckBoxShowPlotWindow_1Clicked() {
    if (plotWindowArray.length >= 2) {

        if (UI_checkBoxShowPlotWindow_1.isChecked())
            plotWindowArray[1].show();
        else {
            plotWindowArray[1].hide();
        }
    }
}

function CheckBoxAutoScrollClicked() {
    if (UI_checkBoxAutoScroll.isChecked())
        tableAutoScroll = true;
    else {
        tableAutoScroll = false;
    }
}

function CheckBoxRandomizeClicked() {
    if (UI_checkBoxRandomize.isChecked())
        randomize = true;
    else {
        randomize = false;
    }
}

var graphIsPaused = true;
var autoRangeIsEnabled = false;

function CheckBoxPauseGraphClicked() {
    graphIsPaused = UI_checkBoxPauseGraph.isChecked();
}

function CheckBoxAutoRangeClicked() {
    autoRangeIsEnabled = UI_checkBoxAutoRange.isChecked();
    UI_lineEditYMax.setEnabled(!autoRangeIsEnabled);
    UI_lineEditYMin.setEnabled(!autoRangeIsEnabled);
}

function LineEditXRangeTextChanged(text) {
    xRange = text;
}

function lineEditPasswordTextChanged() {
    // if (UI_lineEditPassword.text() == '1') {
    //   UI_checkBoxSimulateData.setEnabled(1);
    //   UI_pushButtonHelp.setEnabled(1);
    //   UI_comboBoxLoggerModel.setEnabled(1);
    // } else {
    //   UI_checkBoxSimulateData.setEnabled(0);
    //   UI_pushButtonHelp.setEnabled(0);
    //   UI_comboBoxLoggerModel.setEnabled(0);
    // }

    if (UI_lineEditPassword.text() === 'iqbal') {
        UI_groupBoxHiddenControl.show();
    } else {
        UI_groupBoxHiddenControl.hide();
    }
}

function PlotWindowMousePress(xValue, yValue, button) {
    graphIsPaused = true;
    UI_checkBoxPauseGraph.setChecked(graphIsPaused);
}

function checkStringsLoggerModel() {
	// scriptThread.appendTextToConsole('checkStringsLoggerModel() -> ' + stringToProcess);
	
	var text = UI_labelLoggerModel.text();
	
	 if (text === 'LC-2' || text === 'LC-2x4' || text === 'LC-2x16') {
		 return;
	 }
	 else if (text === '') {

		// var currentIndex = UI_comboBoxLoggerModel.currentIndex();
		//
		// if (currentIndex > -1 && currentIndex <= 2)
		//   return;

		var model;

		if (stringToProcess.search(/4 Channel Multiplexer Selected./g) > -1) {
			model = 1;
		} else if (stringToProcess.search(/16 Channel Multiplexer Selected./g) > -1) {
			model = 2;
		}
		else {
			// model = 0;
		}
		
		if (model == undefined)
			return;
		
		// scriptThread.appendTextToConsole('model = ' + model);

		UI_comboBoxLoggerModel.setCurrentIndex(model);

		text = UI_comboBoxLoggerModel.currentText();

		UI_labelLoggerModel.setText(text);	 
	 }

}

function checkStringsScanInterval() {
    var stringToSearch;
    var regex;
    var pos;

    stringToSearch = 'Scan interval: ';
    regex = new RegExp(stringToSearch, "g");
    pos = stringToProcess.search(regex);
    if (pos > -1) {
        var array = stringToProcess.slice(pos + stringToSearch.length);
        scanInterval = array.split(" ")[0];
        var scanIntervalStr = scanInterval + " secs.";
        UI_labelScanInterval.setText(scanIntervalStr);
        UI_labelScanInterval.setTextColor("blue");
    }
}

function checkStringsLoggerID() {
    var stringToSearch;
    var regex;
    var pos;

    stringToSearch = 'Datalogger ID:';
    regex = new RegExp(stringToSearch, "g");
    pos = stringToProcess.search(regex);
    if (pos > -1) {
        // scriptThread.appendTextToConsole("scan interval found: " + scanInterval);
        var array = stringToProcess.slice(pos + stringToSearch.length);
        loggerID = array;
        UI_labelLoggerID.setText(loggerID);
        UI_labelLoggerID.setTextColor("blue");
    }
}

function checkStringsMonitorModeState() {
    var state;
    var stringToSearch1;
    var stringToSearch2;
    var regex1;
    var regex2;
    var pos;

    stringToSearch1 = 'Monitor mode enabled.';
    stringToSearch2 = 'Monitor mode already enabled!';
    regex1 = new RegExp(stringToSearch1, "g");
    regex2 = new RegExp(stringToSearch2, "g");
    pos1 = stringToProcess.search(regex1);
    pos2 = stringToProcess.search(regex2);
    if (pos1 > -1 || pos2 > -1) {
        state = 1;
    }

    stringToSearch1 = 'Monitor mode disabled.';
    stringToSearch2 = 'Monitor mode already disabled!';
    regex1 = new RegExp(stringToSearch1, "g");
    regex2 = new RegExp(stringToSearch2, "g");
    pos1 = stringToProcess.search(regex1);
    pos2 = stringToProcess.search(regex2);
    if (pos1 > -1 || pos2 > -1) {
        state = 0;
    }

    /*
    if (UI_labelLoggerModel.text()) {
      if (state == 1) {
        UI_labelMonitorMode.setText("Enabled");
        UI_pushButtonStartMonitor.setText("STOP MONITOR");
        UI_pushButtonStartMonitor.setPaletteColor("Foreground", "red");
      } else if (state == 0) {
        UI_labelMonitorMode.setText("Disabled");
        UI_pushButtonStartMonitor.setText('Enable MONITOR');
        // UI_pushButtonStartMonitor.setPaletteColor("ButtonText", "black");
      }
    }
    */

    if (UI_labelLoggerModel.text()) {
        if (state == 1) {
            UI_pushButtonStartMonitor.hide();
            UI_pushButtonStopMonitor.show();
            UI_labelMonitorMode.setText("Enabled");
        } else if (state == 0) {
            UI_pushButtonStopMonitor.hide();
            UI_pushButtonStartMonitor.show();
            UI_labelMonitorMode.setText("Disabled");
        }
    }

    return state;
}

function checkStringsLoggingState() {
    var state;
    var stringToSearch1;
    var stringToSearch2;
    var regex1;
    var regex2;
    var pos;

    stringToSearch1 = 'Logging started.';
    stringToSearch2 = 'Logging already started!';
    regex1 = new RegExp(stringToSearch1, "g");
    regex2 = new RegExp(stringToSearch2, "g");
    pos1 = stringToProcess.search(regex1);
    pos2 = stringToProcess.search(regex2);
    if (pos1 > -1 || pos2 > -1) {
        state = 1;
    }

    stringToSearch1 = 'Logging stopped.';
    stringToSearch2 = 'Logging already stopped!';
    regex1 = new RegExp(stringToSearch1, "g");
    regex2 = new RegExp(stringToSearch2, "g");
    pos1 = stringToProcess.search(regex1);
    pos2 = stringToProcess.search(regex2);
    if (pos1 > -1 || pos2 > -1) {
        state = 0;
    }

    /*
      if (UI_labelLoggerModel.text()) {
        if (state == 1) {
          UI_pushButtonStartLogging.setText("STOP LOGGING");
          // UI_pushButtonStartLogging.setPaletteColor("ButtonText", "red");
          UI_labelLoggingState.setText('Running');
        } else if (state == 0) {
          UI_pushButtonStartLogging.setText('Start LOGGING');
          // UI_pushButtonStartLogging.setPaletteColor("ButtonText", "black");
          UI_labelLoggingState.setText("Stopped");
        }
      }
      */

    if (UI_labelLoggerModel.text()) {
        if (state == 1) {
            UI_pushButtonStartLogging.hide();
            UI_pushButtonStopLogging.show();
            // UI_pushButtonStartLogging.setPaletteColor("ButtonText", "red");
            UI_labelLoggingState.setText('Running');
        } else if (state == 0) {
            UI_pushButtonStartLogging.show();
            UI_pushButtonStopLogging.hide();
            // UI_pushButtonStartLogging.setPaletteColor("ButtonText", "black");
            UI_labelLoggingState.setText("Stopped");
        }
    }



    return state;
}

function CommenceFinishedProcedure() {
    // UI_MainWindow.showMessage("Monitor disabled.", 2000);
    stopMonitorCommand();
    // var timer1 = scriptThread.createTimer();
    // timer1.timeoutSignal.connect(stopScript);
    // timer1.setSingleShot(true);
    // timer1.start(100);
}

function checkStringsSensorReadings() {

    var loggerModel = UI_comboBoxLoggerModel.currentIndex();

    if (loggerModel < 0 || loggerModel > 2) {
        scriptThread.appendTextToConsole('[WARNING] CHECK STRINGS FOR SENSOR READINGS NOT PROCEED, WRONG DATALOGGER MODEL');
        return;
    }


    var goodReading = 0;

    var labelText = UI_labelLoggerID.text();
    // scriptThread.appendTextToConsole("label Logger ID: " + labelText);

    var index;
    if (!labelText || labelText.length <= 16) {
        regex = new RegExp(labelText, "g");
        index = stringToProcess.search(regex);

        if (index > -1)
            goodReading = true;
    }

    if (goodReading) {

        // var str = line.join("");
        // scriptThread.appendTextToConsole("goodReading");
        // UI_console_2.insertPlainText('Good reading...\r\n');

        var calonGoodData = stringToProcess.slice(index);

        var array = calonGoodData.split(",");

        // array = str.split(",");

        scriptThread.appendTextToConsole("array length: " + array.length);

        var processData = 0;

        if (loggerModel == 0 && (array.length == 11 || array.length == 12))
            processData = true;
        else if (loggerModel == 1 && (array.length == 17 || array.length == 18))
            processData = true;
        else if (loggerModel == 2 && (array.length == 41 || array.length == 42))
            processData = true;

        if (processData) {
            // UI_console_2.insertPlainText('Process data...\r\n');
            UI_console_2.insertPlainText(array.join(",") + '\r\n');

            var maxLen = -1;

            if (loggerModel == 0)
                maxLen = 12;
            else if (loggerModel == 1)
                maxLen = 18;
            else if (loggerModel == 2)
                maxLen = 42;
            else {
                scriptThread.appendTextToConsole('[ERROR] WRONG MAX LEN DETECTED');
                return;
            }

            // reset goodArray
            goodArray = [];

            for (var i = 0; i < maxLen; i++) {
                var c = array[i];
                if (i == 0) {
                    goodArray[i] = c;
                } else if (c == undefined) {
                    goodArray[i] = "";
                } else {
                    goodArray[i] = Number(c);
                    // goodArray[i] = array[i];
                }
            }


            FillDataTable();


            var batt = goodArray[7];
            var temperature = goodArray[8];

            var battStr = batt.toFixed(2) + "V";
            UI_labelBatt.setText(battStr);

            if (batt > 2.5)
                UI_labelBatt.setPaletteColor("Foreground", "blue");
            else if (2.0 <= batt && batt <= 2.5)
                UI_labelBatt.setPaletteColor("Foreground", "blue");
            else if (batt < 2.0)
                UI_labelBatt.setPaletteColor("Foreground", "red");

            var tempStr = temperature.toFixed(2) + "°C";
            UI_labelTemp.setText(tempStr);



            newData = true;

            // timeout();



            StoreDataToFile();


            timeout();
        }
    }
}

function FillDataTable() {

    var loggerModel = UI_comboBoxLoggerModel.currentIndex();

    if (loggerModel < 0 || loggerModel > 2) {
        scriptThread.appendTextToConsole('[ERROR] FillDataTable(), WRONG DATALOGGER MODEL');
        return;
    }

    var year = goodArray[1];
    var month = goodArray[2];
    var day = goodArray[3];
    var hour = goodArray[4];
    var min = goodArray[5];
    var sec = goodArray[6];

    var hour2digit = ('0' + hour).slice(-2);
    var min2digit = ('0' + min).slice(-2);
    var sec2digit = ('0' + sec).slice(-2);

    var strClock = hour2digit + ":" + min2digit + ":" + sec2digit;
    var strDate = year + "." + month + "." + day;

    var rowCount;

    if (insertNewDataOnTop) {
        rowCount = UI_tableWidgetMarkers.rowCount();

        if (rowCount >= rowMax)
            UI_tableWidgetMarkers.removeRow(rowMax - 1);

        var rowIndex = 0;

        UI_tableWidgetMarkers.insertRow(rowIndex);



        // inssert data to table row

        UI_tableWidgetMarkers.setText(rowIndex, 1, goodArray[0]);
        UI_tableWidgetMarkers.setText(rowIndex, 2, strDate);
        UI_tableWidgetMarkers.setText(rowIndex, 3, strClock);

        if (loggerModel == 0) {
            UI_tableWidgetMarkers.setText(rowIndex, 0, goodArray[11]);
            for (var i = 4; i < 6; i++) {
                UI_tableWidgetMarkers.setText(rowIndex, i, goodArray[i + 5]);
            }
        } else if (loggerModel == 1) {
            UI_tableWidgetMarkers.setText(rowIndex, 0, goodArray[17]);
            for (var i = 4; i < 12; i++) {
                UI_tableWidgetMarkers.setText(rowIndex, i, goodArray[i + 5]);
            }
        } else if (loggerModel == 2) {
            UI_tableWidgetMarkers.setText(rowIndex, 0, goodArray[41]);
            for (var i = 4; i < 36; i++) {
                UI_tableWidgetMarkers.setText(rowIndex, i, goodArray[i + 5]);
            }
        }
    } else {


        var rowIdToRemove;
        var rowIdToInsert;

        rowIdToRemove = 0;



        rowCount = UI_tableWidgetMarkers.rowCount();

        scriptThread.appendTextToConsole("rowCount=" + rowCount);

        rowIdToInsert = rowCount;

        UI_tableWidgetMarkers.insertRow(rowIdToInsert);

        if (rowCount > rowMax - 1) {
            UI_tableWidgetMarkers.removeRow(rowIdToRemove);
            rowIdToInsert--;
        }





        if (tableAutoScroll) {
            // void selectCell(Number row, Number column, bool scrollToCell=true)
            // UI_tableWidgetMarkers.selectCell(numRow-1, 0);
            UI_ledNewData.toggleState();
        }

        // inssert data to table row

        UI_tableWidgetMarkers.setText(rowIdToInsert, 1, goodArray[0]);
        UI_tableWidgetMarkers.setText(rowIdToInsert, 2, strDate);
        UI_tableWidgetMarkers.setText(rowIdToInsert, 3, strClock);

        if (loggerModel == 0) {
            UI_tableWidgetMarkers.setText(rowIdToInsert, 0, goodArray[11]);
            for (var i = 4; i < 6; i++) {
                UI_tableWidgetMarkers.setText(rowIdToInsert, i, goodArray[i + 5]);
            }
        } else if (loggerModel == 1) {
            UI_tableWidgetMarkers.setText(rowIdToInsert, 0, goodArray[17]);
            for (var i = 4; i < 12; i++) {
                UI_tableWidgetMarkers.setText(rowIdToInsert, i, goodArray[i + 5]);
            }
        } else if (loggerModel == 2) {
            UI_tableWidgetMarkers.setText(rowIdToInsert, 0, goodArray[41]);
            for (var i = 4; i < 36; i++) {
                UI_tableWidgetMarkers.setText(rowIdToInsert, i, goodArray[i + 5]);
            }
        }
    }


    // fit column to content
    var numColumn = UI_tableWidgetMarkers.columnCount();
    var numRow = UI_tableWidgetMarkers.rowCount();

    if (numRow != 0) {
        for (var i = 0; i < numColumn; i++) {
            UI_tableWidgetMarkers.resizeColumnToContents(i);
            // scriptThread.appendTextToConsole("columnId: " + i);
        }
    }



}

function StoreDataToFile() {
    var loggerModel;

    if (UI_labelLoggerModel.text() === 'LC-2')
        loggerModel = 0;
    else if (UI_labelLoggerModel.text() === 'LC-2x4')
        loggerModel = 1;
    else if (UI_labelLoggerModel.text() === 'LC-2x16')
        loggerModel = 2;
    else {
        scriptThread.appendTextToConsole('[WARNING] WRONG LOGGER MODEL, DATA ARE NOT STORED TO FILE');
        return;
    }

    var year = goodArray[1];
    var month = goodArray[2];
    var day = goodArray[3];
    var hour = goodArray[4];
    var min = goodArray[5];
    var sec = goodArray[6];

    var excelSerialDateTime = DMYToExcelSerialDate(year, month, day, hour, min, sec);
    // DMYToExcelSerialDate(2019, 2, 28, 23, 59, 59);

    var hour2digit = ("0" + hour).slice(-2);
    var min2digit = ("0" + min).slice(-2);
    var sec2digit = ("0" + sec).slice(-2);
    // var strClock = hour2digit + ":" + min2digit + ":" + sec2digit;

    var manualTimestamp = GetManualTimestamp(year, month, day, hour, min, sec);

    var strDateTime = day + "-" + shortMonths[month] + "-" + year + " " + hour2digit + ":" + min2digit + ":" + sec2digit;

    // get actual time
    var dt = new Date(Date.now());
    var epochActual = dt.getTime() / 1000;

    var strToLog = strToLog = goodArray.join(',') + "," + strDateTime + "," + excelSerialDateTime + "," + manualTimestamp + ',' + epochActual + "\r\n";

    // store good data to *csv file
    scriptFile.writeFile(filePathArray[loggerModel], true, strToLog, false);

    // update file info
    UI_labelFileInfo.setText(GetLogFileInfo());

}

function GetManualTimestamp(yYear, mMonth, dDay, hHour, mMin, sSec) {
    var dt = new Date();
    // var timeUTC_millisecond = timeNow.getTime();
    // var timeUTC_second = (timeUTC_millisecond / 1000).toFixed();
    var currentTimeZoneOffsetInSeconds = dt.getTimezoneOffset() * 60;

    var manualTimeStamp_millisecond = Date.UTC(yYear, mMonth - 1, dDay, hHour, mMin, sSec);
    var manualTimeStamp_second = manualTimeStamp_millisecond / 1000;

    var manualUTCtimestamp_second = manualTimeStamp_second + currentTimeZoneOffsetInSeconds;

    // console.log("Manual UTC timestamp: ", manualUTCtimestamp_second);
    // scriptThread.appendTextToConsole('Manual UTC timestamp=' + manualUTCtimestamp_second);
    return manualUTCtimestamp_second;
}

function loggerModelChanged() {

    var text = UI_comboBoxLoggerModel.currentText();
    UI_labelLoggerModel.setText(text);
    scriptThread.appendTextToConsole('logger model changed to: ' + text);


    // yArrayTot = [];
    //
    // yArrayTot = matrix(16, MAX_MEM, 0); // 10 lines, 5 cols filled with 0
    UI_labelyArrayTot.setText(yArrayTot.length);
    UI_labelyArrayTot_i.setText(yArrayTot[0].length);


    UI_tableWidgetMarkers.clear();
    UI_tableWidgetMarkers.setRowCount(0);

    plotDataCounter = 0;
    UI_labelPlotDataCounter.setText(plotDataCounter);


    // if grapht exist, remove & clear all graphs data
    if (plotWindowArray.length > 0) {
        for (var i = 0; i < plotWindowArray.length; i++) {
            plotWindowArray[i].hide();
            plotWindowArray[i].removeAllGraphs();
            plotWindowArray[i].clearGraphs();
        }
    }

    // clear the array
    plotWindowArray = [];


    // ConstructTable();
    // AddGraphLines();
    //
    // // update file info
    // UI_labelFileInfo.setText(GetLogFileInfo());

}

function lineStyleChanged() {
    var model = UI_comboBoxLoggerModel.currentIndex();
    var lineStyle = UI_comboBoxLineStyle.currentText();

    var numSensorPerGraph = LOGGER[model].numSensor / plotWindowArray.length;

    for (var i = 0; i < plotWindowArray.length; i++) {
        for (var j = 0; j < numSensorPerGraph; j++) {
            var k = j + (i * numSensorPerGraph);

            // arrayGraph[k] = plotWindowArray[i].addGraph(colors[j], 'dash', channelNames[k]);
            // plotWindowArray[i].setScatterStyle(arrayGraph[k], scatterStyles[1], scatterSize);
            // plotWindowArray[i].setLineStyle(arrayGraph[k], lineStyle);
            // plotWindowArray[i].setLineWidth(arrayGraph[k], lineWidth);

            plotWindowArray[i].setLineStyle(arrayGraph[k], lineStyle);
        }
    }
}

function scatterStyleChanged() {
    var model = UI_comboBoxLoggerModel.currentIndex();
    var scatterStyleText = UI_comboBoxScatterStyle.currentText();
    var scatterStyleIndex = UI_comboBoxScatterStyle.currentIndex();
    var scatterSize = UI_horizontalSliderScatterSize.value();

    var numSensorPerGraph = LOGGER[model].numSensor / plotWindowArray.length;

    var m = 0; // for scatter style
    for (var i = 0; i < plotWindowArray.length; i++) {
        for (var j = 0; j < numSensorPerGraph; j++) {            
            var k = j + (i * numSensorPerGraph);

            // arrayGraph[k] = plotWindowArray[i].addGraph(colors[j], 'dash', channelNames[k]);
            // plotWindowArray[i].setScatterStyle(arrayGraph[k], scatterStyles[1], scatterSize);
            // plotWindowArray[i].setLineStyle(arrayGraph[k], lineStyle);
            // plotWindowArray[i].setLineWidth(arrayGraph[k], lineWidth);

            if (scatterStyleText === 'Mixed') {
                var text = scatterStyleArray[m];

                if (text === 'None') {
                    // do nothing
                } else {
                    plotWindowArray[i].setScatterStyle(arrayGraph[k], text, scatterSize);
                }

                m++;
                if (m == scatterStyleArray.length) {
                    m = 0;
                }

            } else {
                plotWindowArray[i].setScatterStyle(arrayGraph[k], scatterStyleText, scatterSize);
            }
        }
    }
}

function horizontalSliderLineWidthValueChanged() {

    var model = UI_comboBoxLoggerModel.currentIndex();
    var lineWidth = UI_horizontalSliderLineWidth.value();

    var numSensorPerGraph = LOGGER[model].numSensor / plotWindowArray.length;

    for (var i = 0; i < plotWindowArray.length; i++) {
        for (var j = 0; j < numSensorPerGraph; j++) {
            var k = j + (i * numSensorPerGraph);

            // arrayGraph[k] = plotWindowArray[i].addGraph(colors[j], 'dash', channelNames[k]);
            // plotWindowArray[i].setScatterStyle(arrayGraph[k], scatterStyles[1], scatterSize);
            // plotWindowArray[i].setLineStyle(arrayGraph[k], lineStyle);
            // plotWindowArray[i].setLineWidth(arrayGraph[k], lineWidth);

            plotWindowArray[i].setLineWidth(arrayGraph[k], lineWidth);
        }
    }
}

function GetLogFileInfo() {
    var loggerModel = UI_comboBoxLoggerModel.currentIndex();

    // create log file if necessary
    CreateLogFile();

    // read log FILE
    var path = filePathArray[loggerModel];

    var str = scriptFile.readFile(path);
    // scriptThread.appendTextToConsole(str);
    var size = scriptFile.getFileSize(path);

    var strSize;
    if (size >= 1000000) {
        var sz = size / 1000000;
        strSize = number_format(sz, 2) + ' MB';
        // scriptThread.appendTextToConsole(number_format(sz, 2) + ' MB');
    } else if (size >= 1000) {
        var sz = size / 1000;
        strSize = number_format(sz, 2) + ' kB';
        // scriptThread.appendTextToConsole(number_format(sz, 2) + ' kB');
    } else {
        var sz = size;
        strSize = number_format(sz) + ' byte';
        // scriptThread.appendTextToConsole(number_format(sz) + ' byte');
    }

    // scriptThread.appendTextToConsole(number_format(size));
    var numData = (str.match(new RegExp('\r', 'g')) || []).length - 1;
    var strNumData = number_format(numData);

    // scriptThread.appendTextToConsole(number_format(numData) + ' reading(s)');

    var strFileInfo = 'filename: ' + path + '   size: ' + strSize + '   total readings in file: ' + strNumData;

    // scriptThread.appendTextToConsole(strFileInfo);

    return strFileInfo;
}

function CreateLogFile() {
    // check logger model
    var loggerModel = UI_comboBoxLoggerModel.currentIndex();

    var path = filePathArray[loggerModel];

    // check if file exist
    var size = scriptFile.getFileSize(path);
    if (size > 100)
        return;
    else if (size > 0)
        scriptFile.deleteFile(path);

    // prepare header
    var numSensor;
    if (loggerModel == 0)
        numSensor = 1;
    else if (loggerModel == 1)
        numSensor = 4;
    else if (loggerModel == 2)
        numSensor = 16;

    var arrayTableHeader = [];

    for (var i = 0; i < 2; i++) {
        var strHeader;
        strHeader = 'Logger ID,Year,Month,Day,Hour,Minute,Seconds,Battery Voltage(v),Internal Temp(°C),';
        for (var i = 0; i < numSensor; i++) {
            strHeader = strHeader + channelNames[i] + ' Reading,';
        }
        for (var i = 0; i < numSensor; i++) {
            strHeader = strHeader + channelNames[i] + ' Temp(°C),';
        }
        strHeader = strHeader +
            'Array#,' +
            'DateTime,' +
            'Serial_DateTime,' +
            'EPOCH_timestamp,' +
            'EPOCH_Actual' +
            '\r\n';

        // copy to table header array
        arrayTableHeader[loggerModel] = strHeader;
    }

    // create file
    scriptFile.writeFile(filePathArray[loggerModel], true, arrayTableHeader[loggerModel], false);
}

function checkBoxSimulateDataClicked() {
    simulateData = UI_checkBoxSimulateData.isChecked();
    if (simulateData) {
        GenerateFakeData();
    } else {
        timerSimulate.stop();
    }
}

function ConstructTable() {
    var loggerModel = UI_comboBoxLoggerModel.currentIndex();

    if (loggerModel >= 0) {

        scriptThread.appendTextToConsole("Constructing table...");
        scriptThread.appendTextToConsole("loggerModel: " + loggerModel);

        var numSensor;

        if (loggerModel == 0)
            numSensor = 1;
        else if (loggerModel == 1)
            numSensor = 4;
        else if (loggerModel == 2)
            numSensor = 16;


        var sensorColumnStartAt = 4;
        var maxColumn = sensorColumnStartAt + (2 * numSensor);
        var sensorReadingEndAt = sensorColumnStartAt + numSensor;
        var sensorTempEndAt = maxColumn;

        scriptThread.appendTextToConsole("maxColumn: " + maxColumn);


        UI_tableWidgetMarkers.setColumnCount(maxColumn);
        UI_tableWidgetMarkers.setHorizontalHeaderLabel(0, "Array#");
        UI_tableWidgetMarkers.setHorizontalHeaderLabel(1, "Logger ID");
        UI_tableWidgetMarkers.setHorizontalHeaderLabel(2, "Tanggal");
        UI_tableWidgetMarkers.setHorizontalHeaderLabel(3, "Jam");

        for (var i = 0; i < numSensor; i++) {

            // var id =
            var colReading = i + sensorColumnStartAt;
            var colTemp = i + sensorColumnStartAt + numSensor;

            var str = channelNames[i] + '\nreading';
            UI_tableWidgetMarkers.setHorizontalHeaderLabel(colReading, str);

            var str2 = channelNames[i] + '\n(°C)';
            UI_tableWidgetMarkers.setHorizontalHeaderLabel(colTemp, str2);
        }
    }
}




function AddGraphLines() {

    var loggerModel = UI_comboBoxLoggerModel.currentIndex();

    // if grapht exist, remove & clear all graphs data
    if (plotWindowArray.length > 0) {
        for (var i = 0; i < plotWindowArray.length; i++) {
            plotWindowArray[i].hide();
            plotWindowArray[i].removeAllGraphs();
            plotWindowArray[i].clearGraphs();
        }
    }

    // clear the array
    plotWindowArray = [];


    // List of 20 Simple, Distinct Colors
    // https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
    // var colors = [
    //   'red', 'green', /*'yellow',*/ 'blue', 'orange',
    //   'purple', /*'cyan',*/ 'magenta', 'lime', /*'pink',*/
    //   'teal', /*'lavender',*/ 'brown', /*'beige',*/ 'maroon',
    //   'mint', 'olive', 'apricot', 'navy', 'grey',
    //   /*'white',*/
    //   'black'
    // ]


    var scatterSize = UI_horizontalSliderScatterSize.value();

    // line style
    // possible values: None, Line, StepLeft, StepRight, StepCenter, Impulse
    var lineStyle = UI_comboBoxLineStyle.currentText();

    var lineWidth = UI_horizontalSliderLineWidth.value();
    var penStyleArray = ['solid'/*, 'dash'*//*, 'dot'*/];




    var maxPlotWindow = -1;
    if (loggerModel == 0)
        maxPlotWindow = 1;
    if (loggerModel == 1)
        maxPlotWindow = 1;
    if (loggerModel == 2)
        maxPlotWindow = 2;

    // create graph object
    for (var i = 0; i < maxPlotWindow; i++) {
        plotWindowArray[i] = scriptThread.createPlotWindow();
        // var plotWindow = UI_groupBoxPlotContainer.addPlotWidget();

        if (i == 0)
            plotWindowArray[i].closedSignal.connect(PlotWindowClosed_0);
        else if (i == 1)
            plotWindowArray[i].closedSignal.connect(PlotWindowClosed_1);
        plotWindowArray[i].setWindowTitle("Plot Window " + (i + 1));
        plotWindowArray[i].setAxisLabels("Time", "µStrain");
        plotWindowArray[i].showLegend(true);
        plotWindowArray[i].setInitialAxisRanges(xRange, yMin, yMax);
        // plotWindowArray[0].setCurrentAxisRanges(xMin, xMax, yMin * scaleFactor, yMax * scaleFactor);
        plotWindowArray[i].setMaxDataPointsPerGraph(MAX_MEM);
        plotWindowArray[i].showDateTimeAtXAxis('hh:mm:ss');
        plotWindowArray[i].setLocale(31, 224);
        plotWindowArray[i].setAutoUpdateEnabled(1);
        plotWindowArray[i].setUpdateInterval(100);
        plotWindowArray[i].showHelperElements(
            true, true,
            true, false,
            false, false,
            true, 200,
            true);
        var topLeftX = parseInt(0);
        // var topLeftY = parseInt(0);
        var topLeftY = parseInt(i * (900 / maxPlotWindow));
        var wWindow = parseInt(1440 / 2);
        var hWindow = parseInt(900 / 2);
        var string = topLeftX + "," + topLeftY + "," + wWindow + "," + 350;
        plotWindowArray[i].setWindowPositionAndSize(string);
        UI_console_2.insertPlainText('plotWindow_' + i + ' created, topLeftX=' + topLeftX + ', topLeftY=' + topLeftY + ', w=' + wWindow + ', h=' + hWindow + '\r\n');
    }





    var numSensor;
    if (loggerModel == 0)
        numSensor = 1;
    else if (loggerModel == 1)
        numSensor = 4;
    else if (loggerModel == 2)
        numSensor = 16;


    var numSensorPerGraph = numSensor / maxPlotWindow;

    var m = 0; // for scatter style
    var n = 0; // for pen style
    for (var i = 0; i < maxPlotWindow; i++) {        
        for (var j = 0; j < numSensorPerGraph; j++) {
            var k = j + (i * numSensorPerGraph);

            arrayGraph[k] = plotWindowArray[i].addGraph(colorsArray[j], penStyleArray[n], channelNames[k]);
            plotWindowArray[i].setScatterStyle(arrayGraph[k], scatterStyleArray[m], scatterSize);
            plotWindowArray[i].setLineStyle(arrayGraph[k], lineStyle);
            plotWindowArray[i].setLineWidth(arrayGraph[k], lineWidth);

            m++;
            if (m == scatterStyleArray.length) {
                m = 0;
            }

            n++;
            if (n == penStyleArray.length) {
                n = 0;
            }
        }

        plotWindowArray[i].updatePlot();
    }

    // show plot Window
    for (var i = 0; i < maxPlotWindow; i++) {
        plotWindowArray[i].show();
    }
}

// https://www.codeproject.com/Articles/2750/Excel-Serial-Date-to-Day-Month-Year-and-Vice-Versa
function DMYToExcelSerialDate(nYear, nMonth, nDay, nHour, nMin, nSec) {

    // var serialDate = Date.UTC(0,0,0,0,0,0);
    var timestamp31Dec1899 = Date.UTC(1899, 11, 31, 0, 0, 0);
    var timestamp1Jan1900 = Date.UTC(1900, 0, 1, 0, 0, 0);
    var timestamp1March1900 = Date.UTC(1900, 2, 1, 0, 0, 0);
    // var serialDateNow = Date.UTC(year,month-1,day,hour,min,sec);
    var timestampNow = Date.UTC(nYear, nMonth - 1, nDay, nHour, nMin, nSec);

    var serialDateTime;

    if (timestampNow < timestamp1Jan1900) {
        serialDateTime = "Error_DateTime_less_than_1_Jan_1900";
    } else if (nYear == 1900 && nMonth == 2 && nDay == 29) {
        serialDateTime = (timestampNow - timestamp31Dec1899) / 86400000;
    } else if (timestampNow < timestamp1March1900) {
        serialDateTime = (timestampNow - timestamp31Dec1899) / 86400000;
    } else if (timestampNow >= timestamp1March1900) {
        serialDateTime = 1 + (timestampNow - timestamp31Dec1899) / 86400000;
    }
    // scriptThread.appendTextToConsole("timestamp31Dec1899= " + timestamp31Dec1899);
    // scriptThread.appendTextToConsole("timestamp1Jan1900= " + timestamp1Jan1900);
    // scriptThread.appendTextToConsole("timestamp1March1900= " + timestamp1March1900);
    // scriptThread.appendTextToConsole("timestampNow= " + timestampNow);
    // scriptThread.appendTextToConsole("excelSerialDateTime= " + serialDateTime);
    // scriptThread.appendTextToConsole("serialDate= " + serialDate.toUTCString());

    return serialDateTime;
}



// Helper function to retrive data point form graphValues.
function getProcessYValueFromGrap(graphIdx, xValue) {
    var dataPoints = plotWindow.getDataFromGraph(graphIdx, xValue, 1);

    if (dataPoints.length == 0)
        return "na";

    return dataPoints[0].y.toFixed(2);
}

//Is called if the user clicks on the plot.
function plotWindowMousePress(xValue, yValue, button) {
    if ((button != 1) && (button != 2))
        return;

    var column = button - 1;

    var graphValues = [];
    graphValues.push(xValue.toFixed(2));
    graphValues.push(getProcessYValueFromGrap(plotWindowGraph1Index, xValue));
    graphValues.push(getProcessYValueFromGrap(plotWindowGraph2Index, xValue));
    graphValues.push(getProcessYValueFromGrap(plotWindowGraph3Index, xValue));

    for (var row = 0; row < graphValues.length; row++) {
        var textOld = UI_tableWidgetMarkers.getText(row, column);
        var textNew = graphValues[row];

        var color = (textOld == textNew) ? "black" : "red";

        UI_tableWidgetMarkers.setText(row, column, textNew);
        UI_tableWidgetMarkers.setCellForegroundColor(color, row, column);

        // calculate difference beetween second and first point
        var first = parseFloat(UI_tableWidgetMarkers.getText(row, 0));
        var second = parseFloat(UI_tableWidgetMarkers.getText(row, 1));

        var textOld = UI_tableWidgetMarkers.getText(row, 2);
        var textNew = (second - first).toFixed(2);

        color = (textOld == textNew) ? "black" : "red";

        UI_tableWidgetMarkers.setText(row, 2, textNew);
        UI_tableWidgetMarkers.setCellForegroundColor(color, row, 2);
    }

    // show marker
    var marker = (column == 0) ? plotWindowGraphMark1Index : plotWindowGraphMark2Index;

    plotWindow.removeDataRangeFromGraph(marker, -1e100, 1e100, true);
    plotWindow.addDataToGraph(marker, xValue, -1e100, true);
    plotWindow.addDataToGraph(marker, xValue, 1e100, true);

    // force update if disabled to view marker
    if (plotWindow.isAutoUpdateEnabled() == false)
        plotWindow.updatePlot();

    scriptThread.appendTextToConsole('plotWindowMousePress: ' + xValue + ", " + yValue + ", " + button);
}

// var clock = new Date();
// var timestamp = Math.ceil(clock.getTime() / 1000);

var timestamp;
var getfirsttimestamp = true;

//Called periodically to add some data to the plot widget
function timeout() {
    UI_console_2.insertPlainText('plotChart()\r\n');

    if (!newData) {
        return;
    } else {
        newData = false;
    }

    // check ptr
    var ptr;

    var loggerModel = UI_comboBoxLoggerModel.currentIndex();

    if (loggerModel == 0) {
        ptr = goodArray[11];
    } else if (loggerModel == 1) {
        ptr = goodArray[17];
    } else if (loggerModel == 2) {
        ptr = goodArray[41];
    }

    if (ptr === "" || ptr == undefined || isNaN(ptr)) {
        // UI_console_2.insertPlainText("[WARNING] ptr is [ " + ptr + " ], data will not plot.\r\n");
        // return;
    }


    // Add data to graph
    if (true) {
        var len;
        if (loggerModel == 0)
            len = 1;
        else if (loggerModel == 1)
            len = 4;
        else if (loggerModel == 2)
            len = 16;
        else
            return;

        // x Axis EPOCH_timestamp
        var dt = new Date(Date.now());
        // var epoch = Math.floor(dt.getTime() / 1000);
        var epoch = dt.getTime() / 1000;

        // UI_console_2.insertPlainText(epoch + "\r\n");

        var numSensor;
        if (loggerModel == 0)
            numSensor = 1;
        else if (loggerModel == 1)
            numSensor = 4;
        else if (loggerModel == 2)
            numSensor = 16;

        var maxPlotWindow = plotWindowArray.length;

        var numSensorPerGraph = numSensor / maxPlotWindow;

        for (var i = 0; i < maxPlotWindow; i++) {
            for (var j = 0; j < numSensorPerGraph; j++) {
                var k = j + (i * numSensorPerGraph);

                // arrayGraph[k] = plotWindowArray[i].addGraph(colors[j], 'dash', channelNames[k]);
                // plotWindowArray[i].setScatterStyle(arrayGraph[k], scatterStyles[1], scatterSize);
                // plotWindowArray[i].setLineStyle(arrayGraph[k], lineStyle);
                // plotWindowArray[i].setLineWidth(arrayGraph[k], lineWidth);

                var pos = k + 9;
                plotWindowArray[i].addDataToGraph(arrayGraph[k], epoch, goodArray[pos], true);
            }

            if (!plotWindowArray[i].isAutoUpdateEnabled()) {
                plotWindowArray[i].updatePlot();
            }
        }



        /*
            if (loggerModel == 0 || loggerModel == 1) {
              for (var i = 0; i < len; i++) {
                var pos = i + 9;
                // plotWindow.addDataToGraph(i, ptr, goodArray[pos]);
                // plotWindow.addDataToGraph(i, ptr, goodArray[pos], true);
                plotWindowArray[0].addDataToGraph(arrayGraph[i], epoch, goodArray[pos], true);
                // plotWindow.addDataToGraph(i, epoch, goodArray[pos], true);
              }
            }
            if (loggerModel == 2) {
              for (var i = 0; i < 8; i++) {
                var pos = i + 9;
                // plotWindow.addDataToGraph(i, ptr, goodArray[pos]);
                // plotWindow.addDataToGraph(i, ptr, goodArray[pos], true);
                plotWindowArray[0].addDataToGraph(arrayGraph[i], epoch, goodArray[pos], true);
              }
              for (var i = 8; i < len; i++) {
                var pos = i + 9;
                plotWindow2.addDataToGraph(arrayGraph[i], epoch, goodArray[pos], true);
              }
            }
            */

    }


    // var autoRange = true;
    // if (false) {
    if (autoRangeIsEnabled) {

        var arrayMaxValToCompare = [];
        var arrayMinValToCompare = [];

        var len;
        if (loggerModel == 0)
            len = 1;
        if (loggerModel == 1)
            len = 4;
        if (loggerModel == 2)
            len = 16;

        for (var i = 0; i < len; i++) {
            var pos = i + 9;
            // plotWindow.addDataToGraph(i, ptr, goodArray[pos], true);
            yArrayTot[i].push(goodArray[pos]);
            if (yArrayTot[i].length > MAX_MEM) {
                yArrayTot[i].shift();
                // UI_console_2.insertPlainText("SHIFT ARRAY\r\n");
            }


            // copy array
            // var temp = yArrayTot[i].slice(0, xRange);
            var startPos;
            var endPos;

            if (yArrayTot[i].length - xRange < 0) {
                startPos = 0;
            } else {
                startPos = yArrayTot[i].length - xRange;
            }

            endPos = yArrayTot[i].length;

            var temp = yArrayTot[i].slice(startPos, endPos);
            // UI_console_2.insertPlainText("origin" + (i + 1) + ", length=" + yArrayTot[i].length + " -> " + yArrayTot[i] + "\r\n");
            // UI_console_2.insertPlainText("sliced" + (i + 1) + ", length=" + temp.length + " -> " + temp + "\r\n");

            // Sort the numbers in the array in descending order
            // https://www.w3schools.com/jsref/jsref_sort.asp
            temp.sort(function (a, b) {
                return a - b;
            });

            arrayMinValToCompare[i] = temp[0];
            arrayMaxValToCompare[i] = temp[temp.length - 1];

            // UI_console_2.insertPlainText("yMax" + (i+1) + ": " + arrayToCompare[i] + "\r\n");
        }

        var temp_2 = arrayMaxValToCompare.slice(0);
        temp_2.sort(function (a, b) {
            return b - a
        });

        var temp_3 = arrayMinValToCompare.slice(0);
        temp_3.sort(function (a, b) {
            return a - b
        });

        if (autoRangeIsEnabled) {
            yMax = temp_2[0];
            yMin = temp_3[0];
        }

        // UI_console_2.insertPlainText("yMax=" + yMax + ", arrayLen:" + arrayMaxValToCompare.length + " -> " + arrayMaxValToCompare + "\r\n");
        // UI_console_2.insertPlainText("yMin=" + yMin + ", arrayLen:" + arrayMinValToCompare.length + " -> " + arrayMinValToCompare + "\r\n");
        // UI_console_2.insertPlainText("yArray, len:" + yArrayTot[i].length + " = " + yArrayTot[i] + "\r\n");
    }

    var sF;
    if (loggerModel == 0 || loggerModel == 1)
        sF = Math.ceil((0.13 * xRange + 1.67));
    else if (loggerModel == 2)
        sF = Math.ceil((0.3 * xRange + 3));

    var dt = new Date(Date.now());
    var t = Math.floor(dt.getTime() / 1000);

    var xMax = t + sF;
    var xMin = xMax - xRange - sF - 1;



    if (autoRangeIsEnabled) {

        UI_lineEditYMax.setText(Math.ceil(yMax));
        UI_lineEditYMin.setText(Math.floor(yMin));

        var shift = (yMax - yMin) / 10;
        var yMaxTemp = Math.ceil(yMax + shift + 1);
        var yMinTemp = Math.floor(yMin - shift - 1);

        // UI_console_2.insertPlainText('yMax=' + yMax + ', yMin=' + yMin + '\r\n');

        for (var i = 0; i < plotWindowArray.length; i++) {
            plotWindowArray[i].setInitialAxisRanges(xRange, yMinTemp, yMaxTemp);
        }

    }


    UI_labelyArrayTot.setText(yArrayTot.length);
    UI_labelyArrayTot_i.setText(yArrayTot[0].length);


    if (!autoRangeIsEnabled) {
        if (plotDataCounter == 0) {
            for (var i = 0; i < plotWindowArray.length; i++) {

                yMin = Number(goodArray[9]) - 100;
                yMax = Number(goodArray[9]) + 100;
                plotWindowArray[i].setInitialAxisRanges(xRange, yMin, yMax);
            }
        }
    }





    if (plotDataCounter < MAX_MEM) {
        plotDataCounter++;
    }

    UI_labelPlotDataCounter.setText(plotDataCounter);

    freqCounter++;
    if (freqCounter == 1) {
        // if (simulateData) {
        //   if (simulateInterval <= 1000) {
        //     timerFreq.start(simulateInterval);
        //   } else if (simulateInterval > 1000) {
        //     timerFreq.start(simulateInterval);
        //   }
        // } else {
        //   timerFreq.start(scanInterval * 1000);
        // }


        // freqMillis = Date.now();
    }

    if (simulateData) {
        // timerSimulate.stop();
        timerSimulate.start(simulateInterval);
    }
}

function CalcFreq() {
    var millis = Date.now();
    var diff = millis - freqMillis;
    freq = number_format(freqCounter / (diff / 1000), 2);

    if (timerFreq.isActive())
        timerFreq.stop();

    if (simulateData) {
        if (simulateInterval < 1000) {
            timerFreq.start(1000);
        } else if (simulateInterval >= 1000) {
            timerFreq.start(1000);
        }
    } else {
        timerFreq.start(1000);
    }

    UI_labelFreq.setText(freq + ' Hz');
    // scriptThread.appendTextToConsole('Counter = ' + freqCounter + ', Diff = ' + diff + ', Frequency = ' + freq + 'Hz');

    freqCounter = 0;
    freqMillis = millis;

}


function CalculateShiftFactor() {
    var sF;
    if (loggerModel != 2)
        sF = Math.ceil((0.13 * xRange + 1.67));
    else
        sF = Math.ceil((0.3 * xRange + 3));
    return sF;
}

function CalculateXMax() {
    var dt = new Date(Date.now());
    var t = Math.floor(dt.getTime() / 1000);

    var sF = CalculateShiftFactor();
    return t + sF;
}

function CalculateXMin() {
    return CalculateXMax() - xRange - (CalculateShiftFactor() - 1);
}


scriptThread.appendTextToConsole('script plot widget with markers started');



//Register ui signals.
UI_MainWindow.finishedSignal.connect(mainWindowFinished);
UI_pushButtonRun.clickedSignal.connect(runClicked);
UI_pushButtonStop.clickedSignal.connect(stopClicked);
// UI_pushButtonWakeUp.clickedSignal.connect(wakeUpClicked);
UI_pushButtonReadNow.clickedSignal.connect(readNowClicked);
UI_pushButtonStartMonitor.clickedSignal.connect(startMonitorClicked);
UI_pushButtonStopMonitor.clickedSignal.connect(stopMonitorClicked);
UI_pushButtonStopMonitor.hide();
UI_pushButtonStartLogging.clickedSignal.connect(startLoggingClicked);
UI_pushButtonStopLogging.clickedSignal.connect(stopLoggingClicked);
UI_pushButtonStopLogging.hide();
// UI_pushButtonGetLoggerID.clickedSignal.connect(getLoggerIDClicked);
UI_pushButtonGetLoggerStatus.clickedSignal.connect(getLoggerStatusClicked);
UI_pushButtonSetScanInterval.clickedSignal.connect(setScanIntervalClicked);
UI_comboBoxLoggerModel.currentIndexChangedSignal.connect(loggerModelChanged);
UI_checkBoxSimulateData.clickedSignal.connect(checkBoxSimulateDataClicked);
UI_pushButtonHelp.clickedSignal.connect(pushButtonHelpClicked);
UI_lineEditPassword.textChangedSignal.connect(lineEditPasswordTextChanged);
UI_groupBoxHiddenControl.hide();
UI_checkBoxPauseGraph.clickedSignal.connect(CheckBoxPauseGraphClicked);
UI_checkBoxAutoRange.clickedSignal.connect(CheckBoxAutoRangeClicked);
UI_checkBoxAutoRange.setChecked(autoRangeIsEnabled); // default is false
UI_lineEditXRange.textChangedSignal.connect(LineEditXRangeTextChanged);
UI_checkBoxShowPlotWindow_0.clickedSignal.connect(CheckBoxShowPlotWindow_0Clicked);
UI_checkBoxShowPlotWindow_1.clickedSignal.connect(CheckBoxShowPlotWindow_1Clicked);
UI_pushButtonClearConsole_2.clickedSignal.connect(PushButtonClearConsole_2Clicked);
UI_checkBoxAutoScroll.clickedSignal.connect(CheckBoxAutoScrollClicked);
UI_checkBoxRandomize.clickedSignal.connect(CheckBoxRandomizeClicked);
UI_pushButtonSetSimulateInterval.clickedSignal.connect(PushButtonSetSimulateIntervalClicked);
UI_pushButtonResetLogFile.clickedSignal.connect(PushButtonResetLogFileClicked);
UI_lineEditSimulateInterval.setText(simulateInterval);
UI_checkBoxAutoScroll.setChecked(true);
UI_checkBoxRandomize.setChecked(randomize);
UI_groupBoxMainControl.setEnabled(mainControlIsEnabled);
UI_comboBoxLineStyle.currentIndexChangedSignal.connect(lineStyleChanged);
UI_comboBoxScatterStyle.currentIndexChangedSignal.connect(scatterStyleChanged);
UI_horizontalSliderLineWidth.valueChangedSignal.connect(horizontalSliderLineWidthValueChanged);
UI_horizontalSliderScatterSize.valueChangedSignal.connect(scatterStyleChanged);
// UI_comboBoxPenStyle.currentIndexChangedSignal.connect(penStyleChanged);
// UI_pushButtonStartMonitor.setEnabled(false);
// UI_pushButtonStartLogging.setEnabled(false);
UI_lineEditXRange.setText(xRange);
UI_lineEditYMax.setText(yMax);
UI_lineEditYMin.setText(yMin);
UI_lineEditYMax.setEnabled(!autoRangeIsEnabled);
UI_lineEditYMin.setEnabled(!autoRangeIsEnabled);
// UI_dateTimeEdit.setDisplayFormat("yyyy-M-d hh:mm:ss");
// UI_dateTimeEdit.setDateTime("1-1-2016 10:09:08");
// UI_dateTimeEdit.dateTimeChangedSignal.connect(dateTimeEditTimeChanged);

// var path = scriptThread.showFileDialog(true, "Save File", "c:/TestDir/", "Files (*)");
// var path = scriptThread.showFileDialog(true, "Save File", "","Files (*)");



//Setup ui.
UI_tableWidgetMarkers.rowsCanBeMovedByUser(false);

for (var row = 0; row < UI_tableWidgetMarkers.rowCount(); row++) {
    for (var column = 0; column < UI_tableWidgetMarkers.columnCount(); column++) {
        UI_tableWidgetMarkers.setCellEditable(row, column, false);
    }
}


// var yMin = -30;
// var yMax = 30;

// var xRange = 100;
// var yMax = 4700;
// var yMin = -3000;

// var xRange = 5;
// var yMax = 10;
// var yMin = -10;

var sF = 20;
var xRange = 100;
var xMax = Date.now() / 1000 + sF;
var xMin = xMax - xRange - sF - 1;

var yMaxPos = -1;
var yMinPos = -1;

function plotWindowxRangeChanged(newValue) {
    // rowMax = newValue;
}

function ConstructPlotWindows() {

}

function PlotWindowClosed_0() {
    UI_checkBoxShowPlotWindow_0.setChecked(false);
}

function PlotWindowClosed_1() {
    UI_checkBoxShowPlotWindow_1.setChecked(false);
}


//Create a plot widget and setup them.
// var plotWindow = UI_groupBoxPlotContainer.addPlotWidget();

/*
var plotWindow = scriptThread.createPlotWindow();
plotWindow.closedSignal.connect(PlotWindowClosed);
plotWindow.setWindowTitle("PLOT 1");
plotWindow.setAxisLabels("Time", "µStrain");
plotWindow.showLegend(true);
plotWindow.setCurrentAxisRanges(xMin, xMax, yMin * scaleFactor, yMax * scaleFactor);
plotWindow.setMaxDataPointsPerGraph(MAX_MEM);
plotWindow.showDateTimeAtXAxis('hh:mm:ss');
plotWindow.setLocale(31, 224);
plotWindow.setAutoUpdateEnabled(1);
plotWindow.setUpdateInterval(100);
plotWindow.showHelperElements(
  true, true,
  true, false,
  false, false,
  true, 200,
  true);
var topLeftX = parseInt(0);
var topLeftY = parseInt(0);
var wWindow = parseInt(1440/2);
var hWindow = parseInt(900/2);

var string = topLeftX + "," + topLeftY + "," + wWindow + "," + 350;
plotWindow.setWindowPositionAndSize(string);
UI_console_2.insertPlainText('plotWindow_0' + ' created, topLeftX=' + topLeftX + ', topLeftY=' + topLeftY + ', w=' + wWindow + ', h=' + hWindow + '\r\n');
*/

/*
plotWindowArray[0] = scriptThread.createPlotWindow();
plotWindowArray[0].closedSignal.connect(PlotWindowClosed);
plotWindowArray[0].setWindowTitle("PLOT 1");
plotWindowArray[0].setAxisLabels("Time", "µStrain");
plotWindowArray[0].showLegend(true);
plotWindowArray[0].setInitialAxisRanges(xRange, yMin, yMax);
// plotWindowArray[0].setCurrentAxisRanges(xMin, xMax, yMin * scaleFactor, yMax * scaleFactor);
plotWindowArray[0].setMaxDataPointsPerGraph(MAX_MEM);
plotWindowArray[0].showDateTimeAtXAxis('hh:mm:ss');
plotWindowArray[0].setLocale(31, 224);
plotWindowArray[0].setAutoUpdateEnabled(1);
plotWindowArray[0].setUpdateInterval(100);
plotWindowArray[0].showHelperElements(
  true, true,
  true, false,
  false, false,
  true, 200,
  true);
var topLeftX = parseInt(0);
var topLeftY = parseInt(0);
var wWindow = parseInt(1440 / 2);
var hWindow = parseInt(900 / 2);
var string = topLeftX + "," + topLeftY + "," + wWindow + "," + 350;
plotWindowArray[0].setWindowPositionAndSize(string);
UI_console_2.insertPlainText('plotWindow_0' + ' created, topLeftX=' + topLeftX + ', topLeftY=' + topLeftY + ', w=' + wWindow + ', h=' + hWindow + '\r\n');
*/

/*
for (var i = 0; i < 2; i++) {
  plotWindowArray[i] = scriptThread.createPlotWindow();
  plotWindowArray[i].closedSignal.connect(PlotWindowClosed);
  plotWindowArray[i].setWindowTitle("PLOT 1");
  plotWindowArray[i].setAxisLabels("Time", "µStrain");
  plotWindowArray[i].showLegend(true);
  plotWindowArray[i].setInitialAxisRanges(xRange, yMin, yMax);
  // plotWindowArray[0].setCurrentAxisRanges(xMin, xMax, yMin * scaleFactor, yMax * scaleFactor);
  plotWindowArray[i].setMaxDataPointsPerGraph(MAX_MEM);
  plotWindowArray[i].showDateTimeAtXAxis('hh:mm:ss');
  plotWindowArray[i].setLocale(31, 224);
  plotWindowArray[i].setAutoUpdateEnabled(1);
  plotWindowArray[i].setUpdateInterval(100);
  plotWindowArray[i].showHelperElements(
    true, true,
    true, false,
    false, false,
    true, 200,
    true);
  var topLeftX = parseInt(0);
  var topLeftY = parseInt(0);
  var wWindow = parseInt(1440 / 2);
  var hWindow = parseInt(900 / 2);
  var string = topLeftX + "," + topLeftY + "," + wWindow + "," + 350;
  plotWindowArray[i].setWindowPositionAndSize(string);
  UI_console_2.insertPlainText('plotWindow_' + i + ' created, topLeftX=' + topLeftX + ', topLeftY=' + topLeftY + ', w=' + wWindow + ', h=' + hWindow + '\r\n');
}
*/


////////////////////////////////////////////////////


//Create periodically timer which calls the function timeout.
var timer = scriptThread.createTimer()
timer.timeoutSignal.connect(getCurrentDateTimeStr);
timer.start(100);


var timerSimulate = scriptThread.createTimer()
timerSimulate.timeoutSignal.connect(GenerateFakeData);
timerSimulate.setSingleShot(true);

var timerFreq = scriptThread.createTimer()
timerFreq.timeoutSignal.connect(CalcFreq);
timerFreq.setSingleShot(true);
timerFreq.start(1000);

// How to print a number with commas as thousands separators in JavaScript
// https://stackoverflow.com/a/2901136/10079180
function number_format(number, decimals, dec_point, thousands_sep) {
    // http://kevin.vanzonneveld.net
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     bugfix by: Michael White (http://getsprink.com)
    // +     bugfix by: Benjamin Lupton
    // +     bugfix by: Allan Jensen (http://www.winternet.no)
    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +     bugfix by: Howard Yeend
    // +    revised by: Luke Smith (http://lucassmith.name)
    // +     bugfix by: Diogo Resende
    // +     bugfix by: Rival
    // +      input by: Kheang Hok Chin (http://www.distantia.ca/)
    // +   improved by: davook
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Jay Klehr
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Amir Habibi (http://www.residence-mixte.com/)
    // +     bugfix by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +   improved by: Drew Noakes
    // *     example 1: number_format(1234.56);
    // *     returns 1: '1,235'
    // *     example 2: number_format(1234.56, 2, ',', ' ');
    // *     returns 2: '1 234,56'
    // *     example 3: number_format(1234.5678, 2, '.', '');
    // *     returns 3: '1234.57'
    // *     example 4: number_format(67, 2, ',', '.');
    // *     returns 4: '67,00'
    // *     example 5: number_format(1000);
    // *     returns 5: '1,000'
    // *     example 6: number_format(67.311, 2);
    // *     returns 6: '67.31'
    // *     example 7: number_format(1000.55, 1);
    // *     returns 7: '1,000.6'
    // *     example 8: number_format(67000, 5, ',', '.');
    // *     returns 8: '67.000,00000'
    // *     example 9: number_format(0.9, 0);
    // *     returns 9: '1'
    // *    example 10: number_format('1.20', 2);
    // *    returns 10: '1.20'
    // *    example 11: number_format('1.20', 4);
    // *    returns 11: '1.2000'
    // *    example 12: number_format('1.2000', 3);
    // *    returns 12: '1.200'
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        toFixedFix = function (n, prec) {
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            var k = Math.pow(10, prec);
            return Math.round(n * k) / k;
        },
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}


///////////////////////////////////////////////////////////////////////



// //Create a plot widget and setup them.
// // var plotWindow = UI_groupBoxPlotContainer.addPlotWidget();
// var plotWindow2 = scriptThread.createPlotWindow();
// plotWindow2.setWindowTitle("PLOT 2");
// plotWindow2.setAxisLabels("Time", 'µStrain');
// plotWindow2.showLegend(true);
// plotWindow2.setInitialAxisRanges(xRange, yMin, yMax);
// // plotWindow.setCurrentAxisRanges(xRange, yMin, yMax);
// // plotWindow.setCurrentAxisRanges(xMin, xMax, yMin * scaleFactor, yMax * scaleFactor);
// // void setCurrentAxisRanges(Number xMinValue, Number xMaxValue, Number
// // yMinValue, Number yMaxValue)
// // plotWindow2.setCurrentAxisRanges(CalculateXMin(), CalculateXMax(), yMin, yMax);
// plotWindow2.setMaxDataPointsPerGraph(MAX_MEM);
// plotWindow2.showDateTimeAtXAxis('hh:mm:ss');
// plotWindow2.setLocale(31, 224);
// // plotWindow2.xRangeChangedSignal.connect(plotWindowxRangeChanged);
// // plotWindow2.plotMousePressSignal.connect(PlotWindowMousePress);
// // plotWindow2.show();
//
//
// // void showHelperElements(
// // bool showXRange, bool showYRange,
// // bool showUpdate, bool showSave,
// // bool showLoad, bool showClear,
// // bool showGraphVisibility, Number graphVisibilityMaxSize=80,
// // bool showLegend=true)
// //
//
// plotWindow2.showHelperElements(
//   true, true,
//   true, false,
//   false, false,
//   true, 80,
//   true);
// // plotWindow2.showHelperElements(
// //   true, true,
// //   true, true,
// //   true, true,
// //   true, 200,
// //   true);
//
// // plotWindow.showHelperElements(true, true, true, true, false, false, true, 100, true);
//
// // plotWindow.plotMousePressSignal.connect(plotWindowMousePress);
// plotWindow2.setAutoUpdateEnabled(1);
// plotWindow2.setUpdateInterval(100);
//
//
//
// // var topLeftX, topLeftY, wWindow, hWindow;
// // var topLeftX2 = Number(plotPositionAndSizelist[0]);
// // var topLeftY2 = topLeftY + hWindow;
// // var wWindow2 = wWindow;
// // var hWindow2 = hWindow;
//
// var topLeftX2 = parseInt(0);
// var topLeftY2 = parseInt(450);
// var wWindow2 = parseInt(1440 / 2);
// var hWindow2 = parseInt(900 / 2);
//
// var string2 = topLeftX2 + "," + topLeftY2 + "," + wWindow2 + "," + hWindow2;
// plotWindow2.setWindowPositionAndSize(string2);
