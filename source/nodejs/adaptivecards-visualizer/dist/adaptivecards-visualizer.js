/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = AdaptiveCards;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var adaptivecards_1 = __webpack_require__(0);
var vkbeautify = __webpack_require__(8);
var HostContainer = /** @class */ (function () {
    function HostContainer(styleSheet) {
        this.supportsActionBar = false;
        this.styleSheet = styleSheet;
    }
    HostContainer.playNextTTS = function (output, iCurrent) {
        if (iCurrent < output.length) {
            var current = output[iCurrent];
            if (typeof current === "number") {
                setTimeout(function () {
                    HostContainer.playNextTTS(output, iCurrent + 1);
                }, current);
            }
            else {
                if (current.indexOf("http") == 0) {
                    var audio = document.getElementById('player');
                    audio.src = current;
                    audio.onended = function () {
                        HostContainer.playNextTTS(output, iCurrent + 1);
                    };
                    audio.onerror = function () {
                        HostContainer.playNextTTS(output, iCurrent + 1);
                    };
                    audio.play();
                }
                else {
                    var msg = new SpeechSynthesisUtterance();
                    //msg.voiceURI = 'native';
                    // msg.volume = 1; // 0 to 1
                    // msg.rate = 1; // 0.1 to 10
                    // msg.pitch = 2; //0 to 2
                    msg.text = current;
                    msg.lang = 'en-US';
                    msg.onerror = function (event) {
                        HostContainer.playNextTTS(output, iCurrent + 1);
                    };
                    msg.onend = function (event) {
                        HostContainer.playNextTTS(output, iCurrent + 1);
                    };
                    window.speechSynthesis.speak(msg);
                }
            }
        }
    };
    // process SSML markup into an array of either
    // * utterenance
    // * number which is delay in msg
    // * url which is an audio file
    HostContainer.prototype.processNodes = function (nodes, output) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.nodeName == "p") {
                this.processNodes(node.childNodes, output);
                output.push(250);
            }
            else if (node.nodeName == "s") {
                this.processNodes(node.childNodes, output);
                output.push(100);
            }
            else if (node.nodeName == "break" && node instanceof Element) {
                if (node.attributes["strength"]) {
                    var strength = node.attributes["strength"].nodeValue;
                    if (strength == "weak") {
                        // output.push(50);
                    }
                    else if (strength == "medium") {
                        output.push(50);
                    }
                    else if (strength == "strong") {
                        output.push(100);
                    }
                    else if (strength == "x-strong") {
                        output.push(250);
                    }
                }
                else if (node.attributes["time"]) {
                    output.push(JSON.parse(node.attributes["time"].value));
                }
            }
            else if (node.nodeName == "audio" && node instanceof Element) {
                if (node.attributes["src"]) {
                    output.push(node.attributes["src"].value);
                }
            }
            else if (node.nodeName == "say-as") {
                this.processNodes(node.childNodes, output);
            }
            else if (node.nodeName == "w") {
                this.processNodes(node.childNodes, output);
            }
            else if (node.nodeName == "phoneme") {
                this.processNodes(node.childNodes, output);
            }
            else {
                output.push(node.nodeValue);
            }
        }
    };
    HostContainer.prototype.initialize = function () {
        adaptivecards_1.AdaptiveCard.elementTypeRegistry.reset();
        adaptivecards_1.AdaptiveCard.actionTypeRegistry.reset();
        adaptivecards_1.AdaptiveCard.useAutomaticContainerBleeding = false;
        adaptivecards_1.AdaptiveCard.useMarkdownInRadioButtonAndCheckbox = true;
    };
    HostContainer.prototype.parseElement = function (element, json) {
        // Do nothing in base implementation
    };
    HostContainer.prototype.anchorClicked = function (element, anchor) {
        // Not handled by the host container by default
        return false;
    };
    HostContainer.prototype.getHostConfig = function () {
        return new adaptivecards_1.HostConfig({
            preExpandSingleShowCardAction: false,
            spacing: {
                small: 3,
                default: 8,
                medium: 20,
                large: 30,
                extraLarge: 40,
                padding: 20
            },
            separator: {
                lineThickness: 1,
                lineColor: "#EEEEEE"
            },
            supportsInteractivity: true,
            fontFamily: "Segoe UI",
            fontSizes: {
                small: 12,
                default: 14,
                medium: 17,
                large: 21,
                extraLarge: 26
            },
            fontWeights: {
                lighter: 200,
                default: 400,
                bolder: 600
            },
            containerStyles: {
                default: {
                    backgroundColor: "#00000000",
                    foregroundColors: {
                        default: {
                            default: "#333333",
                            subtle: "#EE333333"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#FFD800",
                            subtle: "#DDFFD800"
                        },
                        good: {
                            default: "#00FF00",
                            subtle: "#DD00FF00"
                        },
                        warning: {
                            default: "#FF0000",
                            subtle: "#DDFF0000"
                        }
                    }
                },
                emphasis: {
                    backgroundColor: "08000000",
                    foregroundColors: {
                        default: {
                            default: "#333333",
                            subtle: "#EE333333"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#FFD800",
                            subtle: "#DDFFD800"
                        },
                        good: {
                            default: "#00FF00",
                            subtle: "#DD00FF00"
                        },
                        warning: {
                            default: "#FF0000",
                            subtle: "#DDFF0000"
                        }
                    }
                }
            },
            imageSizes: {
                small: 40,
                medium: 80,
                large: 160
            },
            actions: {
                maxActions: 5,
                spacing: adaptivecards_1.Spacing.Default,
                buttonSpacing: 20,
                showCard: {
                    actionMode: adaptivecards_1.ShowCardActionMode.Inline,
                    inlineTopMargin: 16
                },
                actionsOrientation: adaptivecards_1.Orientation.Horizontal,
                actionAlignment: adaptivecards_1.ActionAlignment.Left
            },
            adaptiveCard: {
                allowCustomStyle: false
            },
            imageSet: {
                imageSize: adaptivecards_1.Size.Medium,
                maxImageHeight: 100
            },
            factSet: {
                title: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Bolder,
                    wrap: true,
                    maxWidth: 150
                },
                value: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Default,
                    wrap: true
                },
                spacing: 10
            }
        });
    };
    HostContainer.prototype.renderContainer = function (adaptiveCard, target) {
        return null;
    };
    HostContainer.prototype.renderSpeech = function (speechString, showXml) {
        if (showXml === void 0) { showXml = false; }
        if (!speechString) {
            return null;
        }
        var element = document.createElement("div");
        var button = document.createElement("button");
        button.className = "button";
        button.innerText = "Speak this card";
        var t = document.createTextNode("Speak");
        var output = new Array();
        if (speechString[0] == '<') {
            if (speechString.indexOf("<speak") != 0) {
                speechString = '<speak>\n' + speechString + '\n</speak>\n';
            }
            var parser = new DOMParser();
            var dom = parser.parseFromString(speechString, "text/xml");
            var nodes = dom.documentElement.childNodes;
            this.processNodes(nodes, output);
            var serializer = new XMLSerializer();
            speechString = vkbeautify.xml(serializer.serializeToString(dom));
            ;
        }
        else {
            output.push(speechString);
            speechString = vkbeautify.xml(speechString);
        }
        button.addEventListener("click", function () {
            HostContainer.playNextTTS(output, 0);
        });
        element.appendChild(button);
        if (showXml) {
            var pre = document.createElement("pre");
            pre.appendChild(document.createTextNode(speechString));
            element.appendChild(pre);
        }
        var audio = document.createElement("audio");
        audio.id = 'player';
        audio.autoplay = true;
        element.appendChild(audio);
        return element;
    };
    HostContainer.prototype.render = function (adaptiveCard, target, showSpeechXml) {
        if (showSpeechXml === void 0) { showSpeechXml = false; }
        var element = document.createElement("div");
        target.appendChild(element);
        if (adaptiveCard) {
            var renderedContainer = this.renderContainer(adaptiveCard, element);
            if (renderedContainer) {
                var separator = document.createElement("div");
                separator.style.height = "20px";
                element.appendChild(separator);
            }
            var renderedSpeech = this.renderSpeech(adaptiveCard.renderSpeech());
            if (renderedSpeech) {
                element.appendChild(renderedSpeech);
            }
        }
        else {
            element.innerText = "The card is empty.";
        }
        return element;
    };
    return HostContainer;
}());
exports.HostContainer = HostContainer;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(3);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Clipboard = __webpack_require__(4);
var AdaptiveCards = __webpack_require__(0);
var MarkdownIt = __webpack_require__(5);
var Constants = __webpack_require__(6);
var skype_1 = __webpack_require__(7);
var webchat_1 = __webpack_require__(9);
var teams_1 = __webpack_require__(10);
var toast_1 = __webpack_require__(11);
var timeline_1 = __webpack_require__(12);
var outlook_1 = __webpack_require__(13);
var bf_image_1 = __webpack_require__(14);
var adaptive_card_schema_1 = __webpack_require__(15);
var cortana_1 = __webpack_require__(16);
var hostContainerOptions = [];
var hostContainerPicker;
var lastValidationErrors = [];
function getSelectedHostContainer() {
    return hostContainerOptions[hostContainerPicker.selectedIndex].hostContainer;
}
function setContent(element) {
    var contentContainer = document.getElementById("content");
    contentContainer.innerHTML = '';
    contentContainer.appendChild(element);
}
function renderCard(target) {
    document.getElementById("errorContainer").hidden = true;
    document.getElementById("csharp").innerText = "";
    lastValidationErrors = [];
    var json = JSON.parse(currentCardPayload);
    document.getElementById("csharp").innerText = AdaptiveCards.adaptiveCardJsonToCSharp(json);
    // Show all Host Apps at once, not working yet (to test uncomment the - 1 below)
    if (hostContainerPicker.selectedIndex === hostContainerPicker.length /* -1 */) {
        var wrapper = document.createElement("div");
        hostContainerOptions.forEach(function (hostContainerOption) {
            var label = document.createElement("h4");
            label.innerText = hostContainerOption.name;
            wrapper.appendChild(label);
            var cardContainer = document.createElement("div");
            var adaptiveCard = new AdaptiveCards.AdaptiveCard();
            adaptiveCard.hostConfig = new AdaptiveCards.HostConfig(hostContainerOption.hostContainer.getHostConfig());
            adaptiveCard.parse(json);
            wrapper.appendChild(hostContainerOption.hostContainer.render(adaptiveCard, cardContainer));
        });
        return target.appendChild(wrapper);
    }
    else {
        var adaptiveCard = new AdaptiveCards.AdaptiveCard();
        adaptiveCard.hostConfig = new AdaptiveCards.HostConfig(currentConfigPayload);
        adaptiveCard.parse(json);
        lastValidationErrors = lastValidationErrors.concat(adaptiveCard.validate());
        showValidationErrors();
        return getSelectedHostContainer().render(adaptiveCard, target);
    }
}
function tryRenderCard() {
    var contentContainer = document.getElementById("content");
    contentContainer.innerHTML = '';
    try {
        renderCard(contentContainer);
    }
    catch (ex) {
        var renderedCard = document.createElement("div");
        renderedCard.innerText = ex.message;
        contentContainer.appendChild(renderedCard);
    }
    try {
        sessionStorage.setItem("AdaptivePayload", currentCardPayload);
        history.pushState(hostContainerPicker.value, "Visualizer - " + hostContainerPicker.value, "index.html" + ("?hostApp=" + hostContainerPicker.value));
    }
    catch (e) {
        console.log("Unable to cache JSON payload.");
    }
    isLoaded = true;
}
function openFilePicker() {
    document.getElementById("filePicker").click();
}
function filePickerChanged(evt) {
    var filePicker = document.getElementById("filePicker");
    var file = filePicker.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var downloadedPayload = e.target.result;
            if (typeof downloadedPayload === "string") {
                currentCardPayload = downloadedPayload;
            }
            switchToCardEditor();
        };
        reader.readAsText(file);
    }
    else {
        alert("Failed to load file");
    }
}
function loadStyleSheetAndConfig() {
    var styleSheetLinkElement = document.getElementById("adaptiveCardStylesheet");
    if (styleSheetLinkElement == null) {
        styleSheetLinkElement = document.createElement("link");
        styleSheetLinkElement.id = "adaptiveCardStylesheet";
        document.getElementsByTagName("head")[0].appendChild(styleSheetLinkElement);
    }
    styleSheetLinkElement.rel = "stylesheet";
    styleSheetLinkElement.type = "text/css";
    var selectedHostContainer = getSelectedHostContainer();
    selectedHostContainer.initialize();
    styleSheetLinkElement.href = selectedHostContainer.styleSheet;
    currentConfigPayload = JSON.stringify(selectedHostContainer.getHostConfig(), null, '\t');
    if (!isCardEditor) {
        monacoEditor.setValue(currentConfigPayload);
    }
}
function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    if (results && results[2]) {
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    else {
        return "";
    }
}
var HostContainerOption = /** @class */ (function () {
    function HostContainerOption(name, hostContainer) {
        this.name = name;
        this.hostContainer = hostContainer;
    }
    return HostContainerOption;
}());
var currentCardPayload = "";
var currentConfigPayload = "";
var isLoaded = false;
;
function hostContainerPickerChanged() {
    loadStyleSheetAndConfig();
    if (isLoaded) {
        tryRenderCard();
    }
}
function setupContainerPicker() {
    hostContainerPicker = document.getElementById("hostContainerPicker");
    hostContainerOptions.push(new HostContainerOption("Bot Framework Other Channels (Image render)", new bf_image_1.BotFrameworkImageContainer(400, "css/bf.css")));
    hostContainerOptions.push(new HostContainerOption("Bot Framework WebChat", new webchat_1.WebChatContainer("css/webchat.css")));
    hostContainerOptions.push(new HostContainerOption("Cortana Skills", new cortana_1.CortanaContainer(true, "css/cortana.css")));
    hostContainerOptions.push(new HostContainerOption("Microsoft Teams", new teams_1.TeamsContainer("css/teams.css")));
    hostContainerOptions.push(new HostContainerOption("Outlook Actionable Messages", new outlook_1.OutlookContainer("css/outlook.css")));
    hostContainerOptions.push(new HostContainerOption("Windows Timeline", new timeline_1.TimelineContainer(320, 176, "css/timeline.css")));
    hostContainerOptions.push(new HostContainerOption("Skype (Preview)", new skype_1.SkypeContainer(350, "css/skype.css")));
    hostContainerOptions.push(new HostContainerOption("Windows Notifications (Preview)", new toast_1.ToastContainer(362, "css/toast.css")));
    // hostContainerOptions.push(//     new HostContainerOption(//         "All at once", //         new BotFrameworkImageContainer(400, "css/bf.css")));
    hostContainerPicker.addEventListener("change", hostContainerPickerChanged);
    for (var i = 0; i < hostContainerOptions.length; i++) {
        var option = document.createElement("option");
        option.value = hostContainerOptions[i].name;
        option.text = hostContainerOptions[i].name;
        hostContainerPicker.appendChild(option);
    }
}
function setContainerAppFromUrl() {
    var requestedHostApp = getParameterByName("hostApp", null);
    if (!requestedHostApp) {
        requestedHostApp = hostContainerOptions[0].name;
    }
    console.log("Setting host app to " + requestedHostApp);
    hostContainerPicker.value = requestedHostApp;
    hostContainerPickerChanged();
}
function setupFilePicker() {
    document.getElementById("loadSample").onclick = function () { document.getElementById("filePicker").click(); };
    document.getElementById("filePicker").addEventListener("change", filePickerChanged);
}
function actionExecuted(action) {
    var message = "Action executed\n";
    message += "    Title: " + action.title + "\n";
    if (action instanceof AdaptiveCards.OpenUrlAction) {
        message += "    Type: OpenUrl\n";
        message += "    Url: " + action.url + "\n";
    }
    else if (action instanceof AdaptiveCards.SubmitAction) {
        message += "    Type: Submit";
        message += "    Data: " + JSON.stringify(action.data);
    }
    else if (action instanceof AdaptiveCards.HttpAction) {
        var httpAction = action;
        message += "    Type: Http\n";
        message += "    Url: " + httpAction.url + "\n";
        message += "    Method: " + httpAction.method + "\n";
        message += "    Headers:\n";
        for (var i = 0; i < httpAction.headers.length; i++) {
            message += "        " + httpAction.headers[i].name + ": " + httpAction.headers[i].value + "\n";
        }
        message += "    Body: " + httpAction.body + "\n";
    }
    else if (action instanceof AdaptiveCards.ShowCardAction) {
        showPopupCard(action);
        return;
    }
    else {
        message += "    Type: <unknown>";
    }
    // Uncomment to test the action's setStatus method:
    /*
    action.setStatus(
        {
            "type": "AdaptiveCard",
            "body": [
                {
                    "type": "TextBlock",
                    "text": "Working on it...",
                    "weight": "normal",
                    "size": "small"
                }
            ]
        });

    window.setTimeout(actionCompletedCallback, 2000, action);
    */
    alert(message);
}
function actionCompletedCallback(action) {
    action.setStatus({
        "type": "AdaptiveCard",
        "body": [
            {
                "type": "TextBlock",
                "text": "Success!",
                "weight": "normal",
                "size": "small"
            }
        ]
    });
}
function showPopupCard(action) {
    var overlayElement = document.createElement("div");
    overlayElement.id = "popupOverlay";
    overlayElement.className = "popupOverlay";
    overlayElement.tabIndex = 0;
    overlayElement.style.width = document.documentElement.scrollWidth + "px";
    overlayElement.style.height = document.documentElement.scrollHeight + "px";
    overlayElement.onclick = function (e) {
        document.body.removeChild(overlayElement);
    };
    var cardContainer = document.createElement("div");
    cardContainer.className = "popupCardContainer";
    cardContainer.onclick = function (e) { e.stopPropagation(); };
    var cardContainerBounds = cardContainer.getBoundingClientRect();
    cardContainer.style.left = (window.innerWidth - cardContainerBounds.width) / 2 + "px";
    cardContainer.style.top = (window.innerHeight - cardContainerBounds.height) / 2 + "px";
    overlayElement.appendChild(cardContainer);
    document.body.appendChild(overlayElement);
    var hostContainer = getSelectedHostContainer();
    hostContainer.render(action.card, cardContainer);
}
function showValidationErrors() {
    if (lastValidationErrors.length > 0) {
        var errorContainer = document.getElementById("errorContainer");
        errorContainer.innerHTML = "";
        for (var i = 0; i < lastValidationErrors.length; i++) {
            var errorElement = document.createElement("div");
            errorElement.innerText = lastValidationErrors[i].message;
            errorContainer.appendChild(errorElement);
        }
        errorContainer.hidden = false;
    }
}
var isCardEditor = true;
function switchToCardEditor() {
    isCardEditor = true;
    document.getElementById("editCard").classList.remove("subdued");
    document.getElementById("editConfig").classList.add("subdued");
    monacoEditor.setValue(currentCardPayload);
    monacoEditor.focus();
}
function switchToConfigEditor() {
    isCardEditor = false;
    document.getElementById("editCard").classList.add("subdued");
    document.getElementById("editConfig").classList.remove("subdued");
    monacoEditor.setValue(currentConfigPayload);
    monacoEditor.focus();
}
function inlineCardExpanded(action, isExpanded) {
    alert("Card \"" + action.title + "\" " + (isExpanded ? "expanded" : "collapsed"));
}
function elementVisibilityChanged(element) {
    alert("An element is now " + (element.isVisible ? "visible" : "invisible"));
}
function monacoEditorLoaded() {
    AdaptiveCards.AdaptiveCard.onParseElement = function (element, json) {
        getSelectedHostContainer().parseElement(element, json);
    };
    AdaptiveCards.AdaptiveCard.onAnchorClicked = function (element, anchor) {
        return getSelectedHostContainer().anchorClicked(element, anchor);
    };
    currentConfigPayload = Constants.defaultConfigPayload;
    document.getElementById("editCard").onclick = function (e) {
        switchToCardEditor();
    };
    document.getElementById("editConfig").onclick = function (e) {
        switchToConfigEditor();
    };
    AdaptiveCards.AdaptiveCard.onExecuteAction = actionExecuted;
    // Adaptive.AdaptiveCard.onShowPopupCard = showPopupCard;
    /*
    Test additional events:

    Adaptive.AdaptiveCard.onInlineCardExpanded = inlineCardExpanded;
    Adaptive.AdaptiveCard.onElementVisibilityChanged = elementVisibilityChanged;
    */
    // Uncomment to test the onInlineCardExpanded event:
    // Adaptive.AdaptiveCard.onInlineCardExpanded = inlineCardExpanded;
    AdaptiveCards.AdaptiveCard.onParseError = function (error) {
        lastValidationErrors.push(error);
    };
    setupContainerPicker();
    setContainerAppFromUrl();
    setupFilePicker();
    loadStyleSheetAndConfig();
    // Handle Back and Forward after the Container app drop down is changed
    window.addEventListener("popstate", function (e) {
        setContainerAppFromUrl();
    });
    monacoEditor.onDidChangeModelContent(function (e) {
        if (isCardEditor) {
            currentCardPayload = monacoEditor.getValue();
        }
        else {
            currentConfigPayload = monacoEditor.getValue();
        }
        tryRenderCard();
    });
    currentCardPayload = Constants.defaultPayload;
    var initialCardLaodedAsynchronously = false;
    var cardUrl = getParameterByName("card", null);
    if (cardUrl) {
        initialCardLaodedAsynchronously = true;
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            if (xhttp.responseText && xhttp.responseText != "") {
                currentCardPayload = xhttp.responseText;
            }
            switchToCardEditor();
        };
        try {
            xhttp.open("GET", cardUrl, true);
            xhttp.send();
        }
        catch (_a) {
            initialCardLaodedAsynchronously = false;
        }
    }
    else {
        var cachedPayload;
        try {
            console.log("loading card from cache");
            cachedPayload = sessionStorage.getItem("AdaptivePayload");
        }
        catch (_b) {
            // Session storage is not accessible
            console.log("Unable to load card from cache");
        }
        if (cachedPayload && cachedPayload != "") {
            currentCardPayload = cachedPayload;
        }
    }
    if (!initialCardLaodedAsynchronously) {
        switchToCardEditor();
    }
}
window.onload = function () {
    AdaptiveCards.AdaptiveCard.processMarkdown = function (text) {
        return new MarkdownIt().render(text);
    };
    loadMonacoEditor(adaptive_card_schema_1.adaptiveCardSchema, monacoEditorLoaded);
    new Clipboard('.clipboard-button');
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/*!
 * clipboard.js v2.0.1
 * https://zenorocha.github.io/clipboard.js
 * 
 * Licensed MIT © Zeno Rocha
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ClipboardJS"] = factory();
	else
		root["ClipboardJS"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, __webpack_require__(7)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof exports !== "undefined") {
        factory(module, require('select'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.select);
        global.clipboardAction = mod.exports;
    }
})(this, function (module, _select) {
    'use strict';

    var _select2 = _interopRequireDefault(_select);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.container = options.container;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }
        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }
        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                this.container.appendChild(this.fakeElem);

                this.selectedText = (0, _select2.default)(this.fakeElem);
                this.copyText();
            }
        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    this.container.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    this.container.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }
        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = (0, _select2.default)(this.target);
                this.copyText();
            }
        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }
        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.trigger) {
                    this.trigger.focus();
                }

                window.getSelection().removeAllRanges();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            },
            get: function get() {
                return this._action;
            }
        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            },
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    module.exports = ClipboardAction;
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var is = __webpack_require__(6);
var delegate = __webpack_require__(5);

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, __webpack_require__(0), __webpack_require__(2), __webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof exports !== "undefined") {
        factory(module, require('./clipboard-action'), require('tiny-emitter'), require('good-listener'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
        global.clipboard = mod.exports;
    }
})(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
    'use strict';

    var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

    var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

    var _goodListener2 = _interopRequireDefault(_goodListener);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            _classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        _createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
                this.container = _typeof(options.container) === 'object' ? options.container : document.body;
            }
        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }
        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new _clipboardAction2.default({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    container: this.container,
                    trigger: trigger,
                    emitter: this
                });
            }
        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }
        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }
        }, {
            key: 'defaultText',
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }], [{
            key: 'isSupported',
            value: function isSupported() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];

                var actions = typeof action === 'string' ? [action] : action;
                var support = !!document.queryCommandSupported;

                actions.forEach(function (action) {
                    support = support && !!document.queryCommandSupported(action);
                });

                return support;
            }
        }]);

        return Clipboard;
    }(_tinyEmitter2.default);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */
    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    module.exports = Clipboard;
});

/***/ }),
/* 4 */
/***/ (function(module, exports) {

var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var closest = __webpack_require__(4);

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function _delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Delegates event to a selector.
 *
 * @param {Element|String|Array} [elements]
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(elements, selector, type, callback, useCapture) {
    // Handle the regular Element usage
    if (typeof elements.addEventListener === 'function') {
        return _delegate.apply(null, arguments);
    }

    // Handle Element-less usage, it defaults to global delegation
    if (typeof type === 'function') {
        // Use `document` as the first parameter, then apply arguments
        // This is a short way to .unshift `arguments` without running into deoptimizations
        return _delegate.bind(null, document).apply(null, arguments);
    }

    // Handle Selector-based usage
    if (typeof elements === 'string') {
        elements = document.querySelectorAll(elements);
    }

    // Handle Array-like based usage
    return Array.prototype.map.call(elements, function (element) {
        return _delegate(element, selector, type, callback, useCapture);
    });
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};


/***/ }),
/* 7 */
/***/ (function(module, exports) {

function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;


/***/ })
/******/ ]);
});

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = markdownit;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// TOOD: Can I pull this from the samples folder rather than copying it here?
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfigPayload = "{\n\t\"supportsInteractivity\": true,\n\t\"strongSeparation\": {\n\t\t\"spacing\": 40,\n\t\t\"lineThickness\": 1,\n\t\t\"lineColor\": \"#EEEEEE\"\n\t},\n\t\"fontFamily\": \"Segoe UI\",\n\t\"fontSizes\": {\n\t\t\"small\": 12,\n\t\t\"normal\": 14,\n\t\t\"medium\": 17,\n\t\t\"large\": 21,\n\t\t\"extraLarge\": 26\n\t},\n\t\"fontWeights\": {\n\t\t\"lighter\": 200,\n\t\t\"normal\": 400,\n\t\t\"bolder\": 600\n\t},\n\t\"colors\": {\n\t\t\"dark\": {\n\t\t\t\"normal\": \"#333333\",\n\t\t\t\"subtle\": \"#EE333333\"\n\t\t},\n\t\t\"light\": {\n\t\t\t\"normal\": \"#FFFFFF\",\n\t\t\t\"subtle\": \"#88FFFFFF\"\n\t\t},\n\t\t\"accent\": {\n\t\t\t\"normal\": \"#2E89FC\",\n\t\t\t\"subtle\": \"#882E89FC\"\n\t\t},\n\t\t\"attention\": {\n\t\t\t\"normal\": \"#FFD800\",\n\t\t\t\"subtle\": \"#DDFFD800\"\n\t\t},\n\t\t\"good\": {\n\t\t\t\"normal\": \"#00FF00\",\n\t\t\t\"subtle\": \"#DD00FF00\"\n\t\t},\n\t\t\"warning\": {\n\t\t\t\"normal\": \"#FF0000\",\n\t\t\t\"subtle\": \"#DDFF0000\"\n\t\t}\n\t},\n\t\"imageSizes\": {\n\t\t\"small\": 40,\n\t\t\"medium\": 80,\n\t\t\"large\": 160\n\t},\n\t\"actions\": {\n\t\t\"maxActions\": 5,\n\t\t\"separation\": {\n\t\t\t\"spacing\": 20\n\t\t},\n\t\t\"buttonSpacing\": 20,\n\t\t\"stretch\": false,\n\t\t\"showCard\": {\n\t\t\t\"actionMode\": \"inline\",\n\t\t\t\"inlineTopMargin\": 16,\n\t\t\t\"backgroundColor\": \"#08000000\",\n\t\t\t\"padding\": {\n\t\t\t\t\"top\": 16,\n\t\t\t\t\"right\": 16,\n\t\t\t\t\"bottom\": 16,\n\t\t\t\t\"left\": 16\n\t\t\t}\n\t\t},\n\t\t\"actionsOrientation\": \"horizontal\",\n\t\t\"actionAlignment\": \"left\"\n\t},\n\t\"adaptiveCard\": {\n\t\t\"backgroundColor\": \"#00000000\",\n\t\t\"padding\": {\n\t\t\t\"left\": 20,\n\t\t\t\"top\": 20,\n\t\t\t\"right\": 20,\n\t\t\t\"bottom\": 20\n\t\t}\n\t},\n\t\"container\": {\n\t\t\"separation\": {\n\t\t\t\"spacing\": 20\n\t\t},\n\t\t\"normal\": {},\n\t\t\"emphasis\": {\n\t\t\t\"backgroundColor\": \"#EEEEEE\",\n\t\t\t\"borderColor\": \"#AAAAAA\",\n\t\t\t\"borderThickness\": {\n\t\t\t\t\"top\": 1,\n\t\t\t\t\"right\": 1,\n\t\t\t\t\"bottom\": 1,\n\t\t\t\t\"left\": 1\n\t\t\t},\n\t\t\t\"padding\": {\n\t\t\t\t\"top\": 10,\n\t\t\t\t\"right\": 10,\n\t\t\t\t\"bottom\": 10,\n\t\t\t\t\"left\": 10\n\t\t\t}\n\t\t}\n\t},\n\t\"textBlock\": {\n\t\t\"color\": \"dark\",\n\t\t\"separations\": {\n\t\t\t\"small\": {\n\t\t\t\t\"spacing\": 20\n\t\t\t},\n\t\t\t\"normal\": {\n\t\t\t\t\"spacing\": 20\n\t\t\t},\n\t\t\t\"medium\": {\n\t\t\t\t\"spacing\": 20\n\t\t\t},\n\t\t\t\"large\": {\n\t\t\t\t\"spacing\": 20\n\t\t\t},\n\t\t\t\"extraLarge\": {\n\t\t\t\t\"spacing\": 20\n\t\t\t}\n\t\t}\n\t},\n\t\"image\": {\n\t\t\"size\": \"medium\",\n\t\t\"separation\": {\n\t\t\t\"spacing\": 20\n\t\t}\n\t},\n\t\"imageSet\": {\n\t\t\"imageSize\": \"medium\",\n\t\t\"separation\": {\n\t\t\t\"spacing\": 20\n\t\t}\n\t},\n\t\"factSet\": {\n\t\t\"separation\": {\n\t\t\t\"spacing\": 20\n\t\t},\n\t\t\"title\": {\n\t\t\t\"color\": \"dark\",\n\t\t\t\"size\": \"normal\",\n\t\t\t\"isSubtle\": false,\n\t\t\t\"weight\": \"bolder\",\n\t\t\t\"wrap\": true,\n\t\t\t\"maxWidth\": 150\n\t\t},\n\t\t\"value\": {\n\t\t\t\"color\": \"dark\",\n\t\t\t\"size\": \"normal\",\n\t\t\t\"isSubtle\": false,\n\t\t\t\"weight\": \"normal\",\n\t\t\t\"wrap\": true\n\t\t},\n\t\t\"spacing\": 10\n\t},\n\t\"input\": {\n\t\t\"separation\": {\n\t\t\t\"spacing\": 20\n\t\t}\n\t},\n\t\"columnSet\": {\n\t\t\"separation\": {\n\t\t\t\"spacing\": 20\n\t\t}\n\t},\n\t\"column\": {\n\t\t\"separation\": {\n\t\t\t\"spacing\": 20\n\t\t}\n\t}\n}";
exports.defaultPayload = "{\n\t\"$schema\": \"http://adaptivecards.io/schemas/adaptive-card.json\",\n\t\"type\": \"AdaptiveCard\",\n\t\"version\": \"1.0\",\n\t\"body\": [\n\t\t{\n\t\t\t\"type\": \"Container\",\n\t\t\t\"items\": [\n\t\t\t\t{\n\t\t\t\t\t\"type\": \"TextBlock\",\n\t\t\t\t\t\"text\": \"Publish Adaptive Card schema\",\n\t\t\t\t\t\"weight\": \"bolder\",\n\t\t\t\t\t\"size\": \"medium\"\n\t\t\t\t},\n\t\t\t\t{\n\t\t\t\t\t\"type\": \"ColumnSet\",\n\t\t\t\t\t\"columns\": [\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"type\": \"Column\",\n\t\t\t\t\t\t\t\"width\": \"auto\",\n\t\t\t\t\t\t\t\"items\": [\n\t\t\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\t\t\"type\": \"Image\",\n\t\t\t\t\t\t\t\t\t\"url\": \"https://pbs.twimg.com/profile_images/3647943215/d7f12830b3c17a5a9e4afcc370e3a37e_400x400.jpeg\",\n\t\t\t\t\t\t\t\t\t\"size\": \"small\",\n\t\t\t\t\t\t\t\t\t\"style\": \"person\"\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t]\n\t\t\t\t\t\t},\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"type\": \"Column\",\n\t\t\t\t\t\t\t\"width\": \"stretch\",\n\t\t\t\t\t\t\t\"items\": [\n\t\t\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\t\t\"type\": \"TextBlock\",\n\t\t\t\t\t\t\t\t\t\"text\": \"Matt Hidinger\",\n\t\t\t\t\t\t\t\t\t\"weight\": \"bolder\",\n\t\t\t\t\t\t\t\t\t\"wrap\": true\n\t\t\t\t\t\t\t\t},\n\t\t\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\t\t\"type\": \"TextBlock\",\n\t\t\t\t\t\t\t\t\t\"spacing\": \"none\",\n\t\t\t\t\t\t\t\t\t\"text\": \"Created {{DATE(2017-02-14T06:08:39Z,SHORT)}}\",\n\t\t\t\t\t\t\t\t\t\"isSubtle\": true,\n\t\t\t\t\t\t\t\t\t\"wrap\": true\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t]\n\t\t\t\t\t\t}\n\t\t\t\t\t]\n\t\t\t\t}\n\t\t\t]\n\t\t},\n\t\t{\n\t\t\t\"type\": \"Container\",\n\t\t\t\"items\": [\n\t\t\t\t{\n\t\t\t\t\t\"type\": \"TextBlock\",\n\t\t\t\t\t\"text\": \"Now that we have defined the main rules and features of the format, we need to produce a schema and publish it to GitHub. The schema will be the starting point of our reference documentation.\",\n\t\t\t\t\t\"wrap\": true\n\t\t\t\t},\n\t\t\t\t{\n\t\t\t\t\t\"type\": \"FactSet\",\n\t\t\t\t\t\"facts\": [\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"title\": \"Board:\",\n\t\t\t\t\t\t\t\"value\": \"Adaptive Card\"\n\t\t\t\t\t\t},\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"title\": \"List:\",\n\t\t\t\t\t\t\t\"value\": \"Backlog\"\n\t\t\t\t\t\t},\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"title\": \"Assigned to:\",\n\t\t\t\t\t\t\t\"value\": \"Matt Hidinger\"\n\t\t\t\t\t\t},\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"title\": \"Due date:\",\n\t\t\t\t\t\t\t\"value\": \"Not set\"\n\t\t\t\t\t\t}\n\t\t\t\t\t]\n\t\t\t\t}\n\t\t\t]\n\t\t}\n\t],\n\t\"actions\": [\n\t\t{\n\t\t\t\"type\": \"Action.ShowCard\",\n\t\t\t\"title\": \"Set due date\",\n\t\t\t\"card\": {\n\t\t\t\t\"type\": \"AdaptiveCard\",\n\t\t\t\t\"body\": [\n\t\t\t\t\t{\n\t\t\t\t\t\t\"type\": \"Input.Date\",\n\t\t\t\t\t\t\"id\": \"dueDate\",\n\t\t\t\t\t\t\"title\": \"Select due date\"\n\t\t\t\t\t},\n\t\t\t\t\t{\n\t\t\t\t\t\t\"type\": \"Input.Text\",\n\t\t\t\t\t\t\"id\": \"comment\",\n\t\t\t\t\t\t\"isMultiline\": true,\n\t\t\t\t\t\t\"placeholder\": \"Add a comment\"\n\t\t\t\t\t}\n\t\t\t\t],\n\t\t\t\t\"actions\": [\n\t\t\t\t    {\n\t\t\t\t        \"type\": \"Action.OpenUrl\",\n\t\t\t\t\t\t\"title\": \"OK\",\n\t\t\t\t\t\t\"url\": \"http://adaptivecards.io\"\n\t\t\t        }\n\t\t\t\t]\n\t\t\t}\n\t\t},\n\t\t{\n\t\t\t\"type\": \"Action.OpenUrl\",\n\t\t\t\"title\": \"View\",\n\t\t\t\"url\": \"http://adaptivecards.io\"\n\t\t}\n\t]\n}";


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var host_container_1 = __webpack_require__(1);
var adaptivecards_1 = __webpack_require__(0);
var SkypeContainer = /** @class */ (function (_super) {
    __extends(SkypeContainer, _super);
    function SkypeContainer(width, styleSheet) {
        var _this = _super.call(this, styleSheet) || this;
        _this._width = width;
        return _this;
    }
    SkypeContainer.prototype.renderContainer = function (adaptiveCard, target) {
        var element = document.createElement("div");
        element.className = "skypeContainer";
        // Draw the hexagon bot logo
        var botElement = document.createElement("div");
        botElement.className = "hexagon";
        var botElementIn1 = document.createElement("div");
        botElementIn1.className = "hexagon-in1";
        botElement.appendChild(botElementIn1);
        var botElementIn2 = document.createElement("div");
        botElementIn2.className = "hexagon-in2";
        botElementIn1.appendChild(botElementIn2);
        var cardWrapper = document.createElement("div");
        cardWrapper.style.width = this._width + "px";
        element.appendChild(botElement);
        element.appendChild(cardWrapper);
        target.appendChild(element);
        var renderedCard = adaptiveCard.render(cardWrapper);
        return element;
    };
    SkypeContainer.prototype.getHostConfig = function () {
        return new adaptivecards_1.HostConfig({
            spacing: {
                small: 3,
                default: 8,
                medium: 20,
                large: 30,
                extraLarge: 40,
                padding: 10
            },
            separator: {
                lineThickness: 1,
                lineColor: "#EEEEEE"
            },
            supportsInteractivity: true,
            fontFamily: "Segoe UI",
            fontSizes: {
                small: 12,
                default: 14,
                medium: 17,
                large: 21,
                extraLarge: 26
            },
            fontWeights: {
                lighter: 200,
                default: 400,
                bolder: 600
            },
            containerStyles: {
                default: {
                    backgroundColor: "#EAEAEA",
                    foregroundColors: {
                        default: {
                            default: "#333333",
                            subtle: "#EE333333"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#FF0000",
                            subtle: "#DDFF0000"
                        },
                        good: {
                            default: "#54a254",
                            subtle: "#DD54a254"
                        },
                        warning: {
                            default: "#c3ab23",
                            subtle: "#DDc3ab23"
                        }
                    }
                },
                emphasis: {
                    backgroundColor: "#08000000",
                    foregroundColors: {
                        default: {
                            default: "#333333",
                            subtle: "#EE333333"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#FF0000",
                            subtle: "#DDFF0000"
                        },
                        good: {
                            default: "#54a254",
                            subtle: "#DD54a254"
                        },
                        warning: {
                            default: "#c3ab23",
                            subtle: "#DDc3ab23"
                        }
                    }
                }
            },
            imageSizes: {
                small: 40,
                medium: 80,
                large: 160
            },
            actions: {
                maxActions: 5,
                spacing: adaptivecards_1.Spacing.Default,
                buttonSpacing: 10,
                showCard: {
                    actionMode: adaptivecards_1.ShowCardActionMode.Popup,
                    inlineTopMargin: 16
                },
                actionsOrientation: adaptivecards_1.Orientation.Vertical,
                actionAlignment: adaptivecards_1.ActionAlignment.Stretch
            },
            adaptiveCard: {
                allowCustomStyle: false
            },
            imageSet: {
                imageSize: adaptivecards_1.Size.Medium,
                maxImageHeight: 100
            },
            factSet: {
                title: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Bolder,
                    wrap: true,
                    maxWidth: 150,
                },
                value: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Default,
                    wrap: true,
                },
                spacing: 5
            }
        });
    };
    return SkypeContainer;
}(host_container_1.HostContainer));
exports.SkypeContainer = SkypeContainer;


/***/ }),
/* 8 */
/***/ (function(module, exports) {

/**
* vkBeautify - javascript plugin to pretty-print or minify text in XML, JSON, CSS and SQL formats.
*
* Copyright (c) 2012 Vadim Kiryukhin
* vkiryukhin @ gmail.com
* http://www.eslinstructor.net/vkbeautify/
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*   Pretty print
*
*        vkbeautify.xml(text [,indent_pattern]);
*        vkbeautify.json(text [,indent_pattern]);
*        vkbeautify.css(text [,indent_pattern]);
*        vkbeautify.sql(text [,indent_pattern]);
*
*        @text - String; text to beatufy;
*        @indent_pattern - Integer | String;
*                Integer:  number of white spaces;
*                String:   character string to visualize indentation ( can also be a set of white spaces )
*   Minify
*
*        vkbeautify.xmlmin(text [,preserve_comments]);
*        vkbeautify.jsonmin(text);
*        vkbeautify.cssmin(text [,preserve_comments]);
*        vkbeautify.sqlmin(text);
*
*        @text - String; text to minify;
*        @preserve_comments - Bool; [optional];
*                Set this flag to true to prevent removing comments from @text ( minxml and mincss functions only. )
*
*   Examples:
*        vkbeautify.xml(text); // pretty print XML
*        vkbeautify.json(text, 4 ); // pretty print JSON
*        vkbeautify.css(text, '. . . .'); // pretty print CSS
*        vkbeautify.sql(text, '----'); // pretty print SQL
*
*        vkbeautify.xmlmin(text, true);// minify XML, preserve comments
*        vkbeautify.jsonmin(text);// minify JSON
*        vkbeautify.cssmin(text);// minify CSS, remove comments ( default )
*        vkbeautify.sqlmin(text);// minify SQL
*
*/
function createShiftArr(step) {

	var space = '    ';

	if ( isNaN(parseInt(step)) ) {  // argument is string
		space = step;
	} else { // argument is integer
		switch(step) {
			case 1: space = ' '; break;
			case 2: space = '  '; break;
			case 3: space = '   '; break;
			case 4: space = '    '; break;
			case 5: space = '     '; break;
			case 6: space = '      '; break;
			case 7: space = '       '; break;
			case 8: space = '        '; break;
			case 9: space = '         '; break;
			case 10: space = '          '; break;
			case 11: space = '           '; break;
			case 12: space = '            '; break;
		}
	}

	var shift = ['\n']; // array of shifts
	for(var ix=0;ix<100;ix++) {
		shift.push(shift[ix]+space);
	}
	return shift;
}

function vkbeautify(){
	this.step = '    '; // 4 spaces
	this.shift = createShiftArr(this.step);
};

vkbeautify.prototype.xml = function(text,step) {

	var ar = text.replace(/>\s{0,}</g,"><")
				 .replace(/</g,"~::~<")
				 .replace(/\s*xmlns\:/g,"~::~xmlns:")
				 .replace(/\s*xmlns\=/g,"~::~xmlns=")
				 .split('~::~'),
		len = ar.length,
		inComment = false,
		deep = 0,
		str = '',
		ix = 0,
		shift = step ? createShiftArr(step) : this.shift;

		for(ix=0;ix<len;ix++) {
			// start comment or <![CDATA[...]]> or <!DOCTYPE //
			if(ar[ix].search(/<!/) > -1) {
				str += shift[deep]+ar[ix];
				inComment = true;
				// end comment  or <![CDATA[...]]> //
				if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1 ) {
					inComment = false;
				}
			} else
			// end comment  or <![CDATA[...]]> //
			if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
				str += ar[ix];
				inComment = false;
			} else
			// <elm></elm> //
			if( /^<\w/.exec(ar[ix-1]) && /^<\/\w/.exec(ar[ix]) &&
				/^<[\w:\-\.\,]+/.exec(ar[ix-1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/','')) {
				str += ar[ix];
				if(!inComment) deep--;
			} else
			 // <elm> //
			if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1 ) {
				str = !inComment ? str += shift[deep++]+ar[ix] : str += ar[ix];
			} else
			 // <elm>...</elm> //
			if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
				str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
			} else
			// </elm> //
			if(ar[ix].search(/<\//) > -1) {
				str = !inComment ? str += shift[--deep]+ar[ix] : str += ar[ix];
			} else
			// <elm/> //
			if(ar[ix].search(/\/>/) > -1 ) {
				str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
			} else
			// <? xml ... ?> //
			if(ar[ix].search(/<\?/) > -1) {
				str += shift[deep]+ar[ix];
			} else
			// xmlns //
			if( ar[ix].search(/xmlns\:/) > -1  || ar[ix].search(/xmlns\=/) > -1) {
				str += shift[deep]+ar[ix];
			}

			else {
				str += ar[ix];
			}
		}

	return  (str[0] == '\n') ? str.slice(1) : str;
}

vkbeautify.prototype.json = function(text,step) {

	var step = step ? step : this.step;

	if (typeof JSON === 'undefined' ) return text;

	if ( typeof text === "string" ) return JSON.stringify(JSON.parse(text), null, step);
	if ( typeof text === "object" ) return JSON.stringify(text, null, step);

	return text; // text is not string nor object
}

vkbeautify.prototype.css = function(text, step) {

	var ar = text.replace(/\s{1,}/g,' ')
				.replace(/\{/g,"{~::~")
				.replace(/\}/g,"~::~}~::~")
				.replace(/\;/g,";~::~")
				.replace(/\/\*/g,"~::~/*")
				.replace(/\*\//g,"*/~::~")
				.replace(/~::~\s{0,}~::~/g,"~::~")
				.split('~::~'),
		len = ar.length,
		deep = 0,
		str = '',
		ix = 0,
		shift = step ? createShiftArr(step) : this.shift;

		for(ix=0;ix<len;ix++) {

			if( /\{/.exec(ar[ix]))  {
				str += shift[deep++]+ar[ix];
			} else
			if( /\}/.exec(ar[ix]))  {
				str += shift[--deep]+ar[ix];
			} else
			if( /\*\\/.exec(ar[ix]))  {
				str += shift[deep]+ar[ix];
			}
			else {
				str += shift[deep]+ar[ix];
			}
		}
		return str.replace(/^\n{1,}/,'');
}

//----------------------------------------------------------------------------

function isSubquery(str, parenthesisLevel) {
	return  parenthesisLevel - (str.replace(/\(/g,'').length - str.replace(/\)/g,'').length )
}

function split_sql(str, tab) {

	return str.replace(/\s{1,}/g," ")

				.replace(/ AND /ig,"~::~"+tab+tab+"AND ")
				.replace(/ BETWEEN /ig,"~::~"+tab+"BETWEEN ")
				.replace(/ CASE /ig,"~::~"+tab+"CASE ")
				.replace(/ ELSE /ig,"~::~"+tab+"ELSE ")
				.replace(/ END /ig,"~::~"+tab+"END ")
				.replace(/ FROM /ig,"~::~FROM ")
				.replace(/ GROUP\s{1,}BY/ig,"~::~GROUP BY ")
				.replace(/ HAVING /ig,"~::~HAVING ")
				//.replace(/ SET /ig," SET~::~")
				.replace(/ IN /ig," IN ")

				.replace(/ JOIN /ig,"~::~JOIN ")
				.replace(/ CROSS~::~{1,}JOIN /ig,"~::~CROSS JOIN ")
				.replace(/ INNER~::~{1,}JOIN /ig,"~::~INNER JOIN ")
				.replace(/ LEFT~::~{1,}JOIN /ig,"~::~LEFT JOIN ")
				.replace(/ RIGHT~::~{1,}JOIN /ig,"~::~RIGHT JOIN ")

				.replace(/ ON /ig,"~::~"+tab+"ON ")
				.replace(/ OR /ig,"~::~"+tab+tab+"OR ")
				.replace(/ ORDER\s{1,}BY/ig,"~::~ORDER BY ")
				.replace(/ OVER /ig,"~::~"+tab+"OVER ")

				.replace(/\(\s{0,}SELECT /ig,"~::~(SELECT ")
				.replace(/\)\s{0,}SELECT /ig,")~::~SELECT ")

				.replace(/ THEN /ig," THEN~::~"+tab+"")
				.replace(/ UNION /ig,"~::~UNION~::~")
				.replace(/ USING /ig,"~::~USING ")
				.replace(/ WHEN /ig,"~::~"+tab+"WHEN ")
				.replace(/ WHERE /ig,"~::~WHERE ")
				.replace(/ WITH /ig,"~::~WITH ")

				//.replace(/\,\s{0,}\(/ig,",~::~( ")
				//.replace(/\,/ig,",~::~"+tab+tab+"")

				.replace(/ ALL /ig," ALL ")
				.replace(/ AS /ig," AS ")
				.replace(/ ASC /ig," ASC ")
				.replace(/ DESC /ig," DESC ")
				.replace(/ DISTINCT /ig," DISTINCT ")
				.replace(/ EXISTS /ig," EXISTS ")
				.replace(/ NOT /ig," NOT ")
				.replace(/ NULL /ig," NULL ")
				.replace(/ LIKE /ig," LIKE ")
				.replace(/\s{0,}SELECT /ig,"SELECT ")
				.replace(/\s{0,}UPDATE /ig,"UPDATE ")
				.replace(/ SET /ig," SET ")

				.replace(/~::~{1,}/g,"~::~")
				.split('~::~');
}

vkbeautify.prototype.sql = function(text,step) {

	var ar_by_quote = text.replace(/\s{1,}/g," ")
							.replace(/\'/ig,"~::~\'")
							.split('~::~'),
		len = ar_by_quote.length,
		ar = [],
		deep = 0,
		tab = this.step,//+this.step,
		inComment = true,
		inQuote = false,
		parenthesisLevel = 0,
		str = '',
		ix = 0,
		shift = step ? createShiftArr(step) : this.shift;;

		for(ix=0;ix<len;ix++) {
			if(ix%2) {
				ar = ar.concat(ar_by_quote[ix]);
			} else {
				ar = ar.concat(split_sql(ar_by_quote[ix], tab) );
			}
		}

		len = ar.length;
		for(ix=0;ix<len;ix++) {

			parenthesisLevel = isSubquery(ar[ix], parenthesisLevel);

			if( /\s{0,}\s{0,}SELECT\s{0,}/.exec(ar[ix]))  {
				ar[ix] = ar[ix].replace(/\,/g,",\n"+tab+tab+"")
			}

			if( /\s{0,}\s{0,}SET\s{0,}/.exec(ar[ix]))  {
				ar[ix] = ar[ix].replace(/\,/g,",\n"+tab+tab+"")
			}

			if( /\s{0,}\(\s{0,}SELECT\s{0,}/.exec(ar[ix]))  {
				deep++;
				str += shift[deep]+ar[ix];
			} else
			if( /\'/.exec(ar[ix]) )  {
				if(parenthesisLevel<1 && deep) {
					deep--;
				}
				str += ar[ix];
			}
			else  {
				str += shift[deep]+ar[ix];
				if(parenthesisLevel<1 && deep) {
					deep--;
				}
			}
			var junk = 0;
		}

		str = str.replace(/^\n{1,}/,'').replace(/\n{1,}/g,"\n");
		return str;
}


vkbeautify.prototype.xmlmin = function(text, preserveComments) {

	var str = preserveComments ? text
							   : text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g,"")
									 .replace(/[ \r\n\t]{1,}xmlns/g, ' xmlns');
	return  str.replace(/>\s{0,}</g,"><");
}

vkbeautify.prototype.jsonmin = function(text) {

	if (typeof JSON === 'undefined' ) return text;

	return JSON.stringify(JSON.parse(text), null, 0);

}

vkbeautify.prototype.cssmin = function(text, preserveComments) {

	var str = preserveComments ? text
							   : text.replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g,"") ;

	return str.replace(/\s{1,}/g,' ')
			  .replace(/\{\s{1,}/g,"{")
			  .replace(/\}\s{1,}/g,"}")
			  .replace(/\;\s{1,}/g,";")
			  .replace(/\/\*\s{1,}/g,"/*")
			  .replace(/\*\/\s{1,}/g,"*/");
}

vkbeautify.prototype.sqlmin = function(text) {
	return text.replace(/\s{1,}/g," ").replace(/\s{1,}\(/,"(").replace(/\s{1,}\)/,")");
}

module.exports = new vkbeautify();


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var host_container_1 = __webpack_require__(1);
var adaptivecards_1 = __webpack_require__(0);
var WebChatContainer = /** @class */ (function (_super) {
    __extends(WebChatContainer, _super);
    function WebChatContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WebChatContainer.prototype.renderContainer = function (adaptiveCard, target) {
        var outerElement = document.createElement("div");
        outerElement.className = "webChatOuterContainer";
        var resizeCard = function () {
            if (outerElement.parentElement) {
                var bounds = outerElement.parentElement.getBoundingClientRect();
                var newWidth = "216px";
                if (bounds.width >= 500) {
                    newWidth = "416px";
                }
                else if (bounds.width >= 400) {
                    newWidth = "320px";
                }
                if (outerElement.style.width != newWidth) {
                    outerElement.style.width = newWidth;
                }
                adaptiveCard.updateLayout();
            }
        };
        window.addEventListener("resize", resizeCard);
        var innerElement = document.createElement("div");
        innerElement.className = "webChatInnerContainer";
        target.appendChild(outerElement);
        outerElement.appendChild(innerElement);
        var renderedCard = adaptiveCard.render();
        innerElement.appendChild(renderedCard);
        resizeCard();
        return outerElement;
    };
    WebChatContainer.prototype.getHostConfig = function () {
        return new adaptivecards_1.HostConfig({
            spacing: {
                small: 3,
                default: 8,
                medium: 20,
                large: 30,
                extraLarge: 40,
                padding: 10
            },
            separator: {
                lineThickness: 1,
                lineColor: "#EEEEEE"
            },
            supportsInteractivity: true,
            fontFamily: "Segoe UI",
            fontSizes: {
                small: 12,
                default: 14,
                medium: 17,
                large: 21,
                extraLarge: 26
            },
            fontWeights: {
                lighter: 200,
                default: 400,
                bolder: 600
            },
            containerStyles: {
                default: {
                    backgroundColor: "#FFFFFF",
                    foregroundColors: {
                        default: {
                            default: "#333333",
                            subtle: "#EE333333"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#FF0000",
                            subtle: "#DDFF0000"
                        },
                        good: {
                            default: "#54a254",
                            subtle: "#DD54a254"
                        },
                        warning: {
                            default: "#c3ab23",
                            subtle: "#DDc3ab23"
                        }
                    }
                },
                emphasis: {
                    backgroundColor: "#08000000",
                    foregroundColors: {
                        default: {
                            default: "#333333",
                            subtle: "#EE333333"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#FF0000",
                            subtle: "#DDFF0000"
                        },
                        good: {
                            default: "#54a254",
                            subtle: "#DD54a254"
                        },
                        warning: {
                            default: "#c3ab23",
                            subtle: "#DDc3ab23"
                        }
                    }
                }
            },
            imageSizes: {
                small: 40,
                medium: 80,
                large: 160
            },
            actions: {
                maxActions: 5,
                spacing: adaptivecards_1.Spacing.Default,
                buttonSpacing: 10,
                showCard: {
                    actionMode: adaptivecards_1.ShowCardActionMode.Inline,
                    inlineTopMargin: 16
                },
                actionsOrientation: adaptivecards_1.Orientation.Horizontal,
                actionAlignment: adaptivecards_1.ActionAlignment.Left
            },
            adaptiveCard: {
                allowCustomStyle: false
            },
            imageSet: {
                imageSize: adaptivecards_1.Size.Medium,
                maxImageHeight: 100
            },
            factSet: {
                title: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Bolder,
                    wrap: true,
                    maxWidth: 150
                },
                value: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Default,
                    wrap: true
                },
                spacing: 10
            }
        });
    };
    return WebChatContainer;
}(host_container_1.HostContainer));
exports.WebChatContainer = WebChatContainer;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var host_container_1 = __webpack_require__(1);
var adaptivecards_1 = __webpack_require__(0);
var TeamsContainer = /** @class */ (function (_super) {
    __extends(TeamsContainer, _super);
    function TeamsContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TeamsContainer.prototype.renderContainer = function (adaptiveCard, target) {
        var element = document.createElement("div");
        element.style.borderTop = "1px solid #F1F1F1";
        element.style.borderRight = "1px solid #F1F1F1";
        element.style.borderBottom = "1px solid #F1F1F1";
        element.style.border = "1px solid #F1F1F1";
        target.appendChild(element);
        adaptiveCard.render(element);
        return element;
    };
    TeamsContainer.prototype.getHostConfig = function () {
        return new adaptivecards_1.HostConfig({
            spacing: {
                small: 3,
                default: 8,
                medium: 20,
                large: 30,
                extraLarge: 40,
                padding: 20
            },
            separator: {
                lineThickness: 1,
                lineColor: "#EEEEEE"
            },
            supportsInteractivity: true,
            fontFamily: "Segoe UI",
            fontSizes: {
                small: 12,
                default: 14,
                medium: 17,
                large: 21,
                extraLarge: 26
            },
            fontWeights: {
                lighter: 200,
                default: 400,
                bolder: 600
            },
            containerStyles: {
                default: {
                    backgroundColor: "#00000000",
                    foregroundColors: {
                        default: {
                            default: "#333333",
                            subtle: "#EE333333"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#cc3300",
                            subtle: "#DDcc3300"
                        },
                        good: {
                            default: "#54a254",
                            subtle: "#DD54a254"
                        },
                        warning: {
                            default: "#e69500",
                            subtle: "#DDe69500"
                        }
                    }
                },
                emphasis: {
                    backgroundColor: "#08000000",
                    foregroundColors: {
                        default: {
                            default: "#333333",
                            subtle: "#EE333333"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#cc3300",
                            subtle: "#DDcc3300"
                        },
                        good: {
                            default: "#54a254",
                            subtle: "#DD54a254"
                        },
                        warning: {
                            default: "#e69500",
                            subtle: "#DDe69500"
                        }
                    }
                }
            },
            imageSizes: {
                small: 40,
                medium: 80,
                large: 160
            },
            actions: {
                maxActions: 5,
                spacing: adaptivecards_1.Spacing.Default,
                buttonSpacing: 10,
                showCard: {
                    actionMode: adaptivecards_1.ShowCardActionMode.Inline,
                    inlineTopMargin: 16
                },
                actionsOrientation: adaptivecards_1.Orientation.Horizontal,
                actionAlignment: adaptivecards_1.ActionAlignment.Stretch
            },
            adaptiveCard: {
                allowCustomStyle: false
            },
            imageSet: {
                imageSize: adaptivecards_1.Size.Medium,
                maxImageHeight: 100
            },
            factSet: {
                title: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Bolder,
                    wrap: true,
                    maxWidth: 150,
                },
                value: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Default,
                    wrap: true,
                },
                spacing: 10
            }
        });
    };
    return TeamsContainer;
}(host_container_1.HostContainer));
exports.TeamsContainer = TeamsContainer;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var host_container_1 = __webpack_require__(1);
var adaptivecards_1 = __webpack_require__(0);
var ToastContainer = /** @class */ (function (_super) {
    __extends(ToastContainer, _super);
    function ToastContainer(width, styleSheet) {
        var _this = _super.call(this, styleSheet) || this;
        _this._width = width;
        return _this;
    }
    ToastContainer.prototype.renderContainer = function (adaptiveCard, target) {
        var element = document.createElement("div");
        element.style.border = "#474747 1px solid";
        element.style.width = this._width + "px";
        element.style.overflow = "hidden";
        target.appendChild(element);
        adaptiveCard.render(element);
        return element;
    };
    ToastContainer.prototype.getHostConfig = function () {
        return new adaptivecards_1.HostConfig({
            spacing: {
                small: 3,
                default: 8,
                medium: 20,
                large: 30,
                extraLarge: 40,
                padding: 10
            },
            separator: {
                lineThickness: 1,
                lineColor: "#EEEEEE"
            },
            supportsInteractivity: true,
            fontFamily: "Segoe UI",
            fontSizes: {
                small: 12,
                default: 14,
                medium: 17,
                large: 21,
                extraLarge: 26
            },
            fontWeights: {
                lighter: 200,
                default: 400,
                bolder: 600
            },
            containerStyles: {
                default: {
                    backgroundColor: "#1F1F1F",
                    foregroundColors: {
                        default: {
                            default: "#FFFFFF",
                            subtle: "#88FFFFFF"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#FF0000",
                            subtle: "#DDFF0000"
                        },
                        good: {
                            default: "#00FF00",
                            subtle: "#DD00FF00"
                        },
                        warning: {
                            default: "#FFD800",
                            subtle: "#DDFFD800"
                        }
                    }
                },
                emphasis: {
                    backgroundColor: "#19FFFFFF",
                    foregroundColors: {
                        default: {
                            default: "#FFFFFF",
                            subtle: "#88FFFFFF"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#FFD800",
                            subtle: "#DDFFD800"
                        },
                        good: {
                            default: "#00FF00",
                            subtle: "#DD00FF00"
                        },
                        warning: {
                            default: "#FF0000",
                            subtle: "#DDFF0000"
                        }
                    }
                }
            },
            imageSizes: {
                small: 40,
                medium: 80,
                large: 160
            },
            actions: {
                maxActions: 5,
                spacing: adaptivecards_1.Spacing.Default,
                buttonSpacing: 10,
                showCard: {
                    actionMode: adaptivecards_1.ShowCardActionMode.Inline,
                    inlineTopMargin: 16
                },
                actionsOrientation: adaptivecards_1.Orientation.Horizontal,
                actionAlignment: adaptivecards_1.ActionAlignment.Stretch
            },
            adaptiveCard: {
                allowCustomStyle: false
            },
            imageSet: {
                imageSize: adaptivecards_1.Size.Medium,
                maxImageHeight: 100
            },
            factSet: {
                title: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Bolder,
                    wrap: true,
                    maxWidth: 150,
                },
                value: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Default,
                    wrap: true,
                },
                spacing: 10
            }
        });
    };
    return ToastContainer;
}(host_container_1.HostContainer));
exports.ToastContainer = ToastContainer;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var host_container_1 = __webpack_require__(1);
var adaptivecards_1 = __webpack_require__(0);
var TimelineContainer = /** @class */ (function (_super) {
    __extends(TimelineContainer, _super);
    function TimelineContainer(width, height, styleSheet) {
        var _this = _super.call(this, styleSheet) || this;
        _this._width = width;
        _this._height = height;
        _this.supportsActionBar = false;
        return _this;
    }
    TimelineContainer.prototype.renderContainer = function (adaptiveCard, target) {
        adaptivecards_1.AdaptiveCard.useAdvancedCardBottomTruncation = true;
        var wrapper = document.createElement("div");
        wrapper.className = "timeline-frame";
        target.appendChild(wrapper);
        var cardContainer = document.createElement("div");
        cardContainer.className = "timeline-card";
        wrapper.appendChild(cardContainer);
        // Style must be set in code for fixed-height clipping to work
        var clippingDiv = document.createElement("div");
        clippingDiv.style.height = this._height + "px";
        clippingDiv.style.width = this._width + "px";
        clippingDiv.style.overflow = "hidden";
        cardContainer.appendChild(clippingDiv);
        var renderedCard = adaptiveCard.render();
        renderedCard.style.height = "100%";
        clippingDiv.appendChild(renderedCard);
        adaptiveCard.updateLayout();
        return wrapper;
    };
    TimelineContainer.prototype.getHostConfig = function () {
        return new adaptivecards_1.HostConfig({
            spacing: {
                small: 4,
                default: 12,
                medium: 20,
                large: 30,
                extraLarge: 40,
                padding: 15
            },
            separator: {
                lineThickness: 1,
                lineColor: "#EEEEEE"
            },
            supportsInteractivity: false,
            fontFamily: "Segoe UI",
            fontSizes: {
                small: 12,
                default: 14,
                medium: 20,
                large: 20,
                extraLarge: 26
            },
            fontWeights: {
                lighter: 200,
                default: 400,
                bolder: 700
            },
            containerStyles: {
                default: {
                    backgroundColor: "#535454",
                    foregroundColors: {
                        default: {
                            "default": "#FFFFFF",
                            "subtle": "#9C9E9F"
                        },
                        accent: {
                            "default": "#2E89FC",
                            "subtle": "#882E89FC"
                        },
                        attention: {
                            "default": "#FF0000",
                            "subtle": "#DDFF0000"
                        },
                        good: {
                            "default": "#00FF00",
                            "subtle": "#DD00FF00"
                        },
                        warning: {
                            "default": "#FFD800",
                            "subtle": "#DDFFD800"
                        }
                    }
                },
                emphasis: {
                    backgroundColor: "#33000000",
                    foregroundColors: {
                        default: {
                            "default": "#FFFFFF",
                            "subtle": "#9C9E9F"
                        },
                        accent: {
                            "default": "#2E89FC",
                            "subtle": "#882E89FC"
                        },
                        attention: {
                            "default": "#FF0000",
                            "subtle": "#DDFF0000"
                        },
                        good: {
                            "default": "#00FF00",
                            "subtle": "#DD00FF00"
                        },
                        warning: {
                            "default": "#FFD800",
                            "subtle": "#DDFFD800"
                        }
                    }
                }
            },
            imageSizes: {
                small: 40,
                medium: 80,
                large: 120
            },
            actions: {
                maxActions: 5,
                spacing: adaptivecards_1.Spacing.Default,
                buttonSpacing: 20,
                showCard: {
                    actionMode: adaptivecards_1.ShowCardActionMode.Inline,
                    inlineTopMargin: 16
                },
                actionsOrientation: adaptivecards_1.Orientation.Horizontal,
                actionAlignment: adaptivecards_1.ActionAlignment.Left
            },
            adaptiveCard: {
                allowCustomStyle: false
            },
            imageSet: {
                imageSize: adaptivecards_1.Size.Medium,
                maxImageHeight: 100
            },
            factSet: {
                title: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Bolder,
                    wrap: false,
                    maxWidth: 150,
                },
                value: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Default,
                    wrap: true,
                },
                spacing: 10
            }
        });
    };
    return TimelineContainer;
}(host_container_1.HostContainer));
exports.TimelineContainer = TimelineContainer;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var host_container_1 = __webpack_require__(1);
var Adaptive = __webpack_require__(0);
var ToggleVisibilityAction = /** @class */ (function (_super) {
    __extends(ToggleVisibilityAction, _super);
    function ToggleVisibilityAction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.targetElementIds = [];
        return _this;
    }
    ToggleVisibilityAction.prototype.getJsonTypeName = function () {
        return "Action.ToggleVisibility";
    };
    ToggleVisibilityAction.prototype.execute = function () {
        if (this.targetElementIds) {
            for (var i = 0; i < this.targetElementIds.length; i++) {
                var targetElement = this.parent.getRootElement().getElementById(this.targetElementIds[i]);
                if (targetElement) {
                    targetElement.isVisible = !targetElement.isVisible;
                }
            }
        }
    };
    ToggleVisibilityAction.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.targetElementIds = json["targetElements"];
    };
    return ToggleVisibilityAction;
}(Adaptive.Action));
exports.ToggleVisibilityAction = ToggleVisibilityAction;
var OutlookContainer = /** @class */ (function (_super) {
    __extends(OutlookContainer, _super);
    function OutlookContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OutlookContainer.prototype.renderContainer = function (adaptiveCard, target) {
        var element = document.createElement("div");
        element.style.borderTop = "1px solid #F1F1F1";
        element.style.borderRight = "1px solid #F1F1F1";
        element.style.borderBottom = "1px solid #F1F1F1";
        element.style.border = "1px solid #F1F1F1";
        target.appendChild(element);
        adaptiveCard.render(element);
        return element;
    };
    OutlookContainer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        Adaptive.AdaptiveCard.elementTypeRegistry.registerType("ActionSet", function () { return new Adaptive.ActionSet(); });
        Adaptive.AdaptiveCard.actionTypeRegistry.unregisterType("Action.Submit");
        Adaptive.AdaptiveCard.actionTypeRegistry.registerType("Action.Http", function () { return new Adaptive.HttpAction(); });
        Adaptive.AdaptiveCard.actionTypeRegistry.registerType("Action.ToggleVisibility", function () { return new ToggleVisibilityAction(); });
        Adaptive.AdaptiveCard.useMarkdownInRadioButtonAndCheckbox = false;
    };
    OutlookContainer.prototype.parsePadding = function (json) {
        if (json) {
            if (typeof json === "string") {
                var uniformPadding = Adaptive.getEnumValueOrDefault(Adaptive.Spacing, json, Adaptive.Spacing.None);
                return new Adaptive.PaddingDefinition(uniformPadding, uniformPadding, uniformPadding, uniformPadding);
            }
            else if (typeof json === "object") {
                return new Adaptive.PaddingDefinition(Adaptive.getEnumValueOrDefault(Adaptive.Spacing, json["top"], Adaptive.Spacing.None), Adaptive.getEnumValueOrDefault(Adaptive.Spacing, json["right"], Adaptive.Spacing.None), Adaptive.getEnumValueOrDefault(Adaptive.Spacing, json["bottom"], Adaptive.Spacing.None), Adaptive.getEnumValueOrDefault(Adaptive.Spacing, json["left"], Adaptive.Spacing.None));
            }
        }
        return null;
    };
    OutlookContainer.prototype.parseElement = function (element, json) {
        if (typeof json["isVisible"] === "boolean") {
            element.isVisible = json["isVisible"];
        }
        if (element instanceof Adaptive.AdaptiveCard) {
            var card = element;
            var actionArray = [];
            card["resources"] = { actions: actionArray };
            if (typeof json["resources"] === "object") {
                var actionResources = json["resources"]["actions"];
                for (var i = 0; i < actionResources.length; i++) {
                    var action = Adaptive.AdaptiveCard.actionTypeRegistry.createInstance(actionResources[i]["type"]);
                    if (action) {
                        action.parse(actionResources[i]);
                        action.setParent(card);
                        actionArray.push(action);
                    }
                }
            }
        }
        if (element instanceof Adaptive.Container) {
            var padding = this.parsePadding(json["padding"]);
            if (padding) {
                element.padding = padding;
            }
        }
        if (element instanceof Adaptive.ColumnSet) {
            var padding = this.parsePadding(json["padding"]);
            if (padding) {
                element.padding = padding;
            }
        }
    };
    OutlookContainer.prototype.anchorClicked = function (element, anchor) {
        var regEx = /^action:([a-z0-9]+)$/ig;
        var rootCard = element.getRootElement();
        var matches = regEx.exec(anchor.href);
        if (matches) {
            var actionId = matches[1];
            if (rootCard) {
                var actionArray = rootCard["resources"]["actions"];
                for (var i = 0; i < actionArray.length; i++) {
                    if (actionArray[i].id == actionId) {
                        actionArray[i].execute();
                        return true;
                    }
                }
            }
        }
        return false;
    };
    OutlookContainer.prototype.getHostConfig = function () {
        return new Adaptive.HostConfig({
            supportsInteractivity: true,
            fontFamily: "Segoe UI",
            spacing: {
                small: 10,
                default: 20,
                medium: 30,
                large: 40,
                extraLarge: 50,
                padding: 20
            },
            separator: {
                lineThickness: 1,
                lineColor: "#EEEEEE"
            },
            fontSizes: {
                small: 12,
                default: 14,
                medium: 17,
                large: 21,
                extraLarge: 26
            },
            fontWeights: {
                lighter: 200,
                default: 400,
                bolder: 600
            },
            imageSizes: {
                small: 40,
                medium: 80,
                large: 160
            },
            containerStyles: {
                default: {
                    backgroundColor: "#FFFFFF",
                    foregroundColors: {
                        default: {
                            default: "#333333",
                            subtle: "#EE333333"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#cc3300",
                            subtle: "#DDcc3300"
                        },
                        good: {
                            default: "#54a254",
                            subtle: "#DD54a254"
                        },
                        warning: {
                            default: "#e69500",
                            subtle: "#DDe69500"
                        }
                    }
                },
                emphasis: {
                    backgroundColor: "#08000000",
                    foregroundColors: {
                        default: {
                            default: "#333333",
                            subtle: "#EE333333"
                        },
                        accent: {
                            default: "#2E89FC",
                            subtle: "#882E89FC"
                        },
                        attention: {
                            default: "#cc3300",
                            subtle: "#DDcc3300"
                        },
                        good: {
                            default: "#54a254",
                            subtle: "#DD54a254"
                        },
                        warning: {
                            default: "#e69500",
                            subtle: "#DDe69500"
                        }
                    }
                }
            },
            actions: {
                maxActions: 5,
                spacing: Adaptive.Spacing.Default,
                buttonSpacing: 10,
                showCard: {
                    actionMode: Adaptive.ShowCardActionMode.Inline,
                    inlineTopMargin: 16
                },
                actionsOrientation: Adaptive.Orientation.Horizontal,
                actionAlignment: Adaptive.ActionAlignment.Left
            },
            adaptiveCard: {
                allowCustomStyle: true
            },
            imageSet: {
                imageSize: Adaptive.Size.Medium,
                maxImageHeight: 100
            },
            factSet: {
                title: {
                    color: Adaptive.TextColor.Default,
                    size: Adaptive.TextSize.Default,
                    isSubtle: false,
                    weight: Adaptive.TextWeight.Bolder,
                    wrap: true,
                    maxWidth: 150,
                },
                value: {
                    color: Adaptive.TextColor.Default,
                    size: Adaptive.TextSize.Default,
                    isSubtle: false,
                    weight: Adaptive.TextWeight.Default,
                    wrap: true,
                },
                spacing: 10
            }
        });
    };
    return OutlookContainer;
}(host_container_1.HostContainer));
exports.OutlookContainer = OutlookContainer;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var host_container_1 = __webpack_require__(1);
var adaptivecards_1 = __webpack_require__(0);
var BotFrameworkImageContainer = /** @class */ (function (_super) {
    __extends(BotFrameworkImageContainer, _super);
    function BotFrameworkImageContainer(width, styleSheet) {
        var _this = _super.call(this, styleSheet) || this;
        _this._width = width;
        _this.supportsActionBar = false;
        return _this;
    }
    BotFrameworkImageContainer.prototype.renderContainer = function (adaptiveCard, target) {
        var outerElement = document.createElement("div");
        outerElement.className = "kikOuterContainer";
        outerElement.style.width = this._width + "px";
        target.appendChild(outerElement);
        adaptiveCard.render(outerElement);
        return outerElement;
    };
    BotFrameworkImageContainer.prototype.getHostConfig = function () {
        return new adaptivecards_1.HostConfig({
            spacing: {
                small: 3,
                default: 8,
                medium: 20,
                large: 30,
                extraLarge: 40,
                padding: 10
            },
            separator: {
                lineThickness: 1,
                lineColor: "#EEEEEE"
            },
            supportsInteractivity: false,
            fontFamily: "Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif;",
            fontSizes: {
                small: 12,
                default: 14,
                medium: 16,
                large: 19,
                extraLarge: 22
            },
            fontWeights: {
                lighter: 200,
                default: 400,
                bolder: 600
            },
            containerStyles: {
                default: {
                    backgroundColor: "#FFFFFF",
                    foregroundColors: {
                        default: {
                            default: "#FF101010",
                            subtle: "#b2101010"
                        },
                        accent: {
                            default: "#FF0000FF",
                            subtle: "#b20000FF"
                        },
                        good: {
                            default: "#FF008000",
                            subtle: "#b2008000"
                        },
                        warning: {
                            default: "#FFFFD700",
                            subtle: "#b2FFD700"
                        },
                        attention: {
                            default: "#FF8B0000",
                            subtle: "#b28B0000"
                        }
                    }
                },
                emphasis: {
                    backgroundColor: "#08000000",
                    foregroundColors: {
                        default: {
                            default: "#FF101010",
                            subtle: "#b2101010"
                        },
                        accent: {
                            default: "#FF0000FF",
                            subtle: "#b20000FF"
                        },
                        good: {
                            default: "#FF008000",
                            subtle: "#b2008000"
                        },
                        warning: {
                            default: "#FFFFD700",
                            subtle: "#b2FFD700"
                        },
                        attention: {
                            default: "#FF8B0000",
                            subtle: "#b28B0000"
                        }
                    }
                }
            },
            imageSizes: {
                small: 60,
                medium: 120,
                large: 180
            },
            actions: {
                maxActions: 5,
                spacing: adaptivecards_1.Spacing.Default,
                buttonSpacing: 10,
                showCard: {
                    actionMode: adaptivecards_1.ShowCardActionMode.Inline,
                    inlineTopMargin: 16
                },
                actionsOrientation: adaptivecards_1.Orientation.Horizontal,
                actionAlignment: adaptivecards_1.ActionAlignment.Left
            },
            adaptiveCard: {
                allowCustomStyle: false
            },
            imageSet: {
                imageSize: adaptivecards_1.Size.Medium,
                maxImageHeight: 100
            },
            factSet: {
                title: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Bolder,
                    wrap: true,
                    maxWidth: 150
                },
                value: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Default,
                    wrap: true
                },
                spacing: 10
            }
        });
    };
    return BotFrameworkImageContainer;
}(host_container_1.HostContainer));
exports.BotFrameworkImageContainer = BotFrameworkImageContainer;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptiveCardSchema = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "id": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "object",
    "title": "Microsoft Adaptive Card Schema",
    "additionalProperties": true,
    "allOf": [
        {
            "$ref": "#/definitions/AdaptiveCard"
        }
    ],
    "properties": {
        "version": {
            "type": "string",
            "description": "version of schema that this card was authored "
        },
        "minVersion": {
            "type": "string",
            "description": "if a client doesn't support the minVersion the card should be rejected and return the fallbackText.  If it does, then the elements that are not supported are safe to ignore"
        },
        "fallbackText": {
            "type": "string",
            "description": "if a client is not able to show the card, show fallbackText to the user. This can be in markdown format. "
        },
        "speak": {
            "type": "string",
            "description": "Specifies what should be spoken for this entire Item. This is simple text or SSML fragment"
        }
    },
    "required": [
        "version"
    ],
    "definitions": {
        "Action": {
            "anyOf": [
                {
                    "$ref": "#/definitions/Action.Submit"
                },
                {
                    "$ref": "#/definitions/Action.ShowCard"
                },
                {
                    "$ref": "#/definitions/Action.OpenUrl"
                }
            ]
        },
        "Action.OpenUrl": {
            "additionalProperties": true,
            "description": "When Action.OpenUrl is invoked it will show the given url, either by launching it to an external web browser or showing in-situ with embedded web browser.",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Label for button or link that represents this action"
                },
                "type": {
                    "type": "string",
                    "description": "Must be Action.OpenUrl",
                    "enum": [
                        "Action.OpenUrl"
                    ]
                },
                "url": {
                    "type": "string",
                    "description": "The URL to open"
                }
            },
            "required": [
                "type",
                "url"
            ],
            "type": "object"
        },
        "Action.ShowCard": {
            "type": "object",
            "additionalProperties": true,
            "description": "Action.ShowCard defines an inline AdaptiveCard which is shown to the user when it is clicked.",
            "properties": {
                "type": {
                    "type": "string",
                    "description": "Must be Action.ShowCard",
                    "enum": [
                        "Action.ShowCard"
                    ]
                },
                "title": {
                    "type": "string",
                    "description": "Label for button or link that represents this action"
                },
                "card": {
                    "$ref": "#/definitions/AdaptiveCard"
                }
            },
            "required": [
                "type",
                "card"
            ]
        },
        "Action.Submit": {
            "type": "object",
            "additionalProperties": true,
            "description": "Submit action gathers up input fields, merges with optional data field and generates event to client asking for data to be submitted. It is up to the client to determine how that data is processed. For example: With BotFramework bots the client would send an activity through the messaging medium to the bot.",
            "properties": {
                "type": {
                    "type": "string",
                    "description": "Must be Action.Submit",
                    "enum": [
                        "Action.Submit"
                    ]
                },
                "title": {
                    "type": "string",
                    "description": "Label for button or link that represents this action"
                },
                "data": {
                    "type": ["string", "object"],
                    "description": "initial data that input fields will be combined with. This is essentially 'hidden' properties"
                }
            },
            "required": [
                "type"
            ]
        },
        "Actions": {
            "additionalItems": true,
            "items": {
                "$ref": "#/definitions/Action"
            },
            "type": "array"
        },
        "AdaptiveCard": {
            "additionalProperties": true,
            "type": "object",
            "description": "Card schema for an adaptive card",
            "properties": {
                "type": {
                    "type": "string",
                    "description": "Must be AdaptiveCard",
                    "enum": [
                        "AdaptiveCard"
                    ]
                },
                "actions": {
                    "description": "The Actions to show in the card's action bar",
                    "$ref": "#/definitions/Actions"
                },
                "body": {
                    "description": "The Card Elements to show in the primary card region",
                    "$ref": "#/definitions/CardElements"
                }
            },
            "required": [
                "type",
                "version"
            ]
        },
        "CardElement": {
            "additionalProperties": true,
            "properties": {
                "type": {
                    "type": "string"
                },
                "id": {
                    "type": "string",
                    "description": "A unique Id associated with the element"
                },
                "spacing": {
                    "$ref": "#/definitions/SpacingStyle"
                },
                "separator": {
                    "type": "boolean",
                    "description": "The Separator object type describes the look and feel of a separation line between two elements.",
                    "default": false
                }
            },
            "required": [
                "type"
            ]
        },
        "CardElements": {
            "type": "array",
            "additionalItems": true,
            "items": [
                {
                    "anyOf": [
                        {
                            "$ref": "#/definitions/TextBlock"
                        },
                        {
                            "$ref": "#/definitions/Image"
                        },
                        {
                            "$ref": "#/definitions/Container"
                        },
                        {
                            "$ref": "#/definitions/ColumnSet"
                        },
                        {
                            "$ref": "#/definitions/FactSet"
                        },
                        {
                            "$ref": "#/definitions/ImageSet"
                        },
                        {
                            "$ref": "#/definitions/Input.Text"
                        },
                        {
                            "$ref": "#/definitions/Input.Number"
                        },
                        {
                            "$ref": "#/definitions/Input.Date"
                        },
                        {
                            "$ref": "#/definitions/Input.Time"
                        },
                        {
                            "$ref": "#/definitions/Input.Toggle"
                        },
                        {
                            "$ref": "#/definitions/Input.ChoiceSet"
                        }
                    ]
                }
            ]
        },
        "Input.Choice": {
            "type": "object",
            "description": "Describes a Choice input. The value should be a simple string without a \",\"",
            "additionalProperties": true,
            "properties": {
                "type": {
                    "type": "string",
                    "enum": [
                        "Input.Choice"
                    ]
                },
                "title": {
                    "type": "string",
                    "description": "The text for a choice"
                },
                "value": {
                    "type": "string",
                    "description": "The raw value for the choice. NOTE: do not use a \",\" in the value, since MultiSelect ChoiceSet returns a comma-delimited string of choice values"
                }
            },
            "required": [
                "title",
                "value"
            ]
        },
        "ChoiceInputStyle": {
            "type": "string",
            "description": "Style hint for Input.ChoiceSet",
            "enum": [
                "compact",
                "expanded"
            ]
        },
        "Column": {
            "additionalProperties": true,
            "type": "object",
            "description": "Defines a container that is part of a ColumnSet",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "items": {
                    "description": "The Card Elements to include in the Column",
                    "$ref": "#/definitions/CardElements"
                },
                "selectAction": {
                    "description": "An Action that will be invoked when the Column is tapped or selected",
                    "$ref": "#/definitions/Action"
                },
                "width": {
                    "type": [
                        "string",
                        "number"
                    ],
                    "description": "\"auto\", \"stretch\", or a number representing relative width of the column in the column group"
                },
                "type": {
                    "type": "string",
                    "description": "Must be Column",
                    "enum": [
                        "Column"
                    ]
                }
            },
            "required": [
                "items"
            ]
        },
        "ColumnSet": {
            "additionalProperties": true,
            "type": "object",
            "description": "ColumnSet divides a region into Column's allowing elements to sit side-by-side",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "columns": {
                    "type": "array",
                    "description": "The array of Columns to divide the region into",
                    "items": {
                        "$ref": "#/definitions/Column"
                    }
                },
                "selectAction": {
                    "$ref": "#/definitions/Action",
                    "description": "The Action that is executed when the ColumnSet is clicked/tapped"
                },
                "type": {
                    "type": "string",
                    "description": "Must be ColumnSet",
                    "enum": [
                        "ColumnSet"
                    ]
                }
            }
        },
        "Container": {
            "additionalProperties": true,
            "type": "object",
            "description": "Containers group items together",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "items": {
                    "description": "The Card Elements to render inside the Container",
                    "$ref": "#/definitions/CardElements"
                },
                "selectAction": {
                    "description": "An Action that will be invoked when the Image is tapped or selected",
                    "$ref": "#/definitions/Action"
                },
                "style": {
                    "type": "string",
                    "description": "Style hint for Container",
                    "enum": [
                        "default",
                        "emphasis"
                    ]
                },
                "type": {
                    "type": "string",
                    "description": "Must be Container",
                    "enum": [
                        "Container"
                    ]
                }
            },
            "required": [
                "items"
            ]
        },
        "Fact": {
            "additionalProperties": true,
            "type": "object",
            "description": "Describes a Fact in a FactSet as a key/value pair",
            "properties": {
                "type": {
                    "type": "string",
                    "enum": [
                        "Fact"
                    ]
                },
                "title": {
                    "type": "string",
                    "description": "The title of the fact"
                },
                "value": {
                    "type": "string",
                    "description": "The value of the fact"
                }
            },
            "required": [
                "title",
                "value"
            ]
        },
        "FactSet": {
            "additionalProperties": true,
            "type": "object",
            "description": "The FactSet Item makes it simple to display a series of facts (e.g. name/value pairs) in a tabular form.",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "facts": {
                    "type": "array",
                    "description": "The array of Facts",
                    "items": {
                        "$ref": "#/definitions/Fact"
                    }
                },
                "type": {
                    "type": "string",
                    "description": "Must be FactSet",
                    "enum": [
                        "FactSet"
                    ]
                }
            },
            "required": [
                "facts"
            ]
        },
        "HorizontalAlignment": {
            "type": "string",
            "description": "Controls how Items are horizontally positioned within their container.",
            "enum": [
                "left",
                "center",
                "right"
            ]
        },
        "Image": {
            "additionalProperties": true,
            "type": "object",
            "description": "The Image Item allows for the inclusion of images in an Adaptive Card.",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "altText": {
                    "type": "string",
                    "description": "Alternate text for the image for accessibility"
                },
                "horizontalAlignment": {
                    "$ref": "#/definitions/HorizontalAlignment"
                },
                "selectAction": {
                    "description": "An Action that will be invoked when the Image is tapped or selected",
                    "$ref": "#/definitions/Action"
                },
                "size": {
                    "type": "object",
                    "$ref": "#/definitions/ImageSize"
                },
                "style": {
                    "$ref": "#/definitions/ImageStyle"
                },
                "type": {
                    "type": "string",
                    "description": "Must be Image",
                    "enum": [
                        "Image"
                    ]
                },
                "url": {
                    "type": "string",
                    "description": "The URL to the image."
                }
            },
            "required": [
                "url"
            ]
        },
        "ImageSet": {
            "additionalProperties": true,
            "type": "object",
            "description": "The ImageSet allows for the inclusion of a collection images like a photogallery.",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "images": {
                    "type": "array",
                    "description": "The array of Image elements to show",
                    "items": {
                        "$ref": "#/definitions/Image"
                    }
                },
                "imageSize": {
                    "$ref": "#/definitions/ImageSize"
                },
                "type": {
                    "type": "string",
                    "description": "Must be ImageSet",
                    "enum": [
                        "ImageSet"
                    ]
                }
            },
            "required": [
                "images"
            ]
        },
        "ImageSize": {
            "type": "string",
            "description": "Controls the approximate size of the image. The physical dimensions will vary per host. Specify \"auto\" for true image dimension or \"stretch\" to force it to fill the container",
            "default": "auto",
            "enum": [
                "auto",
                "stretch",
                "small",
                "medium",
                "large"
            ]
        },
        "ImageStyle": {
            "type": "string",
            "description": "Controls the way Images are displayed",
            "enum": [
                "default",
                "person"
            ]
        },
        "Input.ChoiceSet": {
            "additionalProperties": true,
            "type": "object",
            "description": "Shows an array of Choice objects",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "choices": {
                    "type": "array",
                    "description": "the choice options",
                    "items": {
                        "$ref": "#/definitions/Input.Choice"
                    }
                },
                "id": {
                    "type": "string",
                    "description": "Id for the value (will be used to identify collected input when SUBMIT is clicked)"
                },
                "isMultiSelect": {
                    "type": "boolean",
                    "description": "allow multiple choices to be selected",
                    "default": false
                },
                "style": {
                    "$ref": "#/definitions/ChoiceInputStyle"
                },
                "type": {
                    "description": "Must be Input.ChoiceInput",
                    "enum": [
                        "Input.ChoiceSet"
                    ],
                    "type": "string"
                },
                "value": {
                    "type": "string",
                    "description": "The initial choice (or set of choices) that should be selected. For multi-select, specifcy a comma-separated string of values"
                }
            },
            "required": [
                "id",
                "choices"
            ]
        },
        "Input.Date": {
            "additionalProperties": true,
            "type": "object",
            "description": "Input.Date collects Date from the user,",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "id": {
                    "type": "string",
                    "description": "Id for the value (will be used to identify collected input when SUBMIT is clicked)"
                },
                "max": {
                    "type": "string",
                    "description": "hint of maximum value expressed in ISO-8601 format (may be ignored by some clients)"
                },
                "min": {
                    "type": "string",
                    "description": "hint of minimum value expressed in ISO-8601 format (may be ignored by some clients)"
                },
                "placeholder": {
                    "type": "string",
                    "description": "Title Description of the input desired"
                },
                "type": {
                    "type": "string",
                    "description": "The type must be Input.Date",
                    "enum": [
                        "Input.Date"
                    ]
                },
                "value": {
                    "type": "string",
                    "description": "The initial value for a field expressed in ISO-8601 format"
                }
            },
            "required": [
                "id"
            ]
        },
        "Input.Number": {
            "additionalProperties": true,
            "type": "object",
            "description": "Input.Number collects number from the user,",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "id": {
                    "type": "string",
                    "description": "Id for the value (will be used to identify collected input when SUBMIT is clicked)"
                },
                "max": {
                    "type": "number",
                    "description": "hint of maximum value (may be ignored by some clients)"
                },
                "min": {
                    "type": "number",
                    "description": "hint of minimum value (may be ignored by some clients)"
                },
                "placeholder": {
                    "type": "string",
                    "description": "Title Description of the input desired"
                },
                "type": {
                    "type": "string",
                    "description": "The type must be Input.Number",
                    "enum": [
                        "Input.Number"
                    ]
                },
                "value": {
                    "type": "number",
                    "description": "The initial value for a field"
                }
            },
            "required": [
                "id"
            ]
        },
        "Input.Text": {
            "additionalProperties": true,
            "type": "object",
            "description": "Input.Text collects text from the user,",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "id": {
                    "type": "string",
                    "description": "Id for the value (will be used to identify collected input when SUBMIT is clicked)"
                },
                "isMultiline": {
                    "type": "boolean",
                    "description": "Do you want to allow multiple lines of input"
                },
                "maxLength": {
                    "type": "number",
                    "description": "hint of maximum length characters to collect (may be ignored by some clients)"
                },
                "placeholder": {
                    "type": "string",
                    "description": "Title Description of the input desired"
                },
                "style": {
                    "$ref": "#/definitions/TextInputStyle"
                },
                "type": {
                    "type": "string",
                    "description": "Input.Text",
                    "enum": [
                        "Input.Text"
                    ]
                },
                "value": {
                    "type": "string",
                    "description": "The initial value for a field"
                }
            },
            "required": [
                "id"
            ]
        },
        "Input.Time": {
            "additionalProperties": true,
            "type": "object",
            "description": "Input.Time collects Time from the user,",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "id": {
                    "type": "string",
                    "description": "Id for the value (will be used to identify collected input when SUBMIT is clicked)"
                },
                "max": {
                    "type": "string",
                    "description": "hint of maximum value (may be ignored by some clients)"
                },
                "min": {
                    "type": "string",
                    "description": "hint of minimum value (may be ignored by some clients)"
                },
                "placeholder": {
                    "type": "string",
                    "description": "Title Description of the input desired"
                },
                "type": {
                    "type": "string",
                    "description": "The type must be Input.Time",
                    "enum": [
                        "Input.Time"
                    ]
                },
                "value": {
                    "type": "string",
                    "description": "The initial value for a field expressed in ISO-8601 format"
                }
            },
            "required": [
                "id"
            ]
        },
        "Input.Toggle": {
            "additionalProperties": true,
            "type": "object",
            "description": "Input.Toggle collects a true/false response from the user",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "id": {
                    "type": "string",
                    "description": "Id for the value (will be used to identify collected input when SUBMIT is clicked)"
                },
                "title": {
                    "type": "string",
                    "description": "Title for the toggle"
                },
                "type": {
                    "type": "string",
                    "description": "Input.Toggle",
                    "enum": [
                        "Input.Toggle"
                    ]
                },
                "value": {
                    "type": "string",
                    "description": "The current selected value (default:false)"
                },
                "valueOff": {
                    "type": "string",
                    "description": "The value when toggle is off (default:false)"
                },
                "valueOn": {
                    "type": "string",
                    "description": "The value when toggle is on (default:true)"
                }
            },
            "required": [
                "id",
                "title"
            ]
        },
        "TextBlock": {
            "additionalProperties": true,
            "type": "object",
            "description": "The TextBlock Item allows for the inclusion of text, with various font sizes, weight and color, in Adaptive Cards.",
            "allOf": [
                {
                    "$ref": "#/definitions/CardElement"
                }
            ],
            "properties": {
                "color": {
                    "type": "string",
                    "description": "Controls the color of TextBlock Items.",
                    "enum": [
                        "default",
                        "dark",
                        "light",
                        "accent",
                        "good",
                        "warning",
                        "attention"
                    ]
                },
                "horizontalAlignment": {
                    "$ref": "#/definitions/HorizontalAlignment"
                },
                "isSubtle": {
                    "type": "boolean",
                    "description": "Indicates whether the color of the text should be slightly toned down to appear less prominent"
                },
                "maxLines": {
                    "type": "number",
                    "description": "When Wrap is true, you can specify the maximum number of lines to allow the textBlock to use."
                },
                "size": {
                    "type": "string",
                    "description": "controls size of the text.",
                    "enum": [
                        "small",
                        "default",
                        "medium",
                        "large",
                        "extraLarge"
                    ]
                },
                "text": {
                    "type": "string",
                    "description": "The actual text to display"
                },
                "type": {
                    "type": "string",
                    "description": "Must be TextBlock",
                    "enum": [
                        "TextBlock"
                    ]
                },
                "weight": {
                    "type": "string",
                    "description": "Controls the weight of TextBlock Items",
                    "enum": [
                        "lighter",
                        "default",
                        "bolder"
                    ]
                },
                "wrap": {
                    "type": "boolean",
                    "description": "True if be is allowed to wrap"
                }
            },
            "required": [
                "text"
            ]
        },
        "SeparatorStyle": {
            "type": "object",
            "description": "Indicates whether there should be a visible separator (e.g. a line) between the element and the one before it. If this property is not specified, no separator is displayed. If it is, a separator line is displayed. A separator will only appear if there was a preceding element.",
            "properties": {
                "thickness": {
                    "type": "string",
                    "description": "Specifies the thickness of the separation line.",
                    "enum": [
                        "default",
                        "thick"
                    ]
                },
                "color": {
                    "type": "string",
                    "description": "Specifies the color of the separation line.",
                    "enum": [
                        "default",
                        "accent"
                    ]
                }
            }
        },
        "SpacingStyle": {
            "type": "string",
            "description": "Controls the amount of spacing between this element and the previous element.",
            "enum": [
                "none",
                "small",
                "default",
                "medium",
                "large",
                "extraLarge",
                "padding"
            ]
        },
        "TextInputStyle": {
            "type": "string",
            "description": "Style hint for Input.Text.",
            "enum": [
                "text",
                "tel",
                "url",
                "email"
            ]
        }
    }
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var host_container_1 = __webpack_require__(1);
var adaptivecards_1 = __webpack_require__(0);
var CortanaContainer = /** @class */ (function (_super) {
    __extends(CortanaContainer, _super);
    function CortanaContainer(renderFrame, styleSheet) {
        var _this = _super.call(this, styleSheet) || this;
        _this._renderFrame = renderFrame;
        return _this;
    }
    CortanaContainer.prototype.renderContainer = function (adaptiveCard, target) {
        var wrapper = document.createElement("div");
        var cardContainer = document.createElement("div");
        if (this._renderFrame) {
            wrapper.className = "cortanaFrame";
            cardContainer.className = "cardWrapper";
        }
        adaptiveCard.render(cardContainer);
        wrapper.appendChild(cardContainer);
        target.appendChild(wrapper);
        return cardContainer;
    };
    CortanaContainer.prototype.getHostConfig = function () {
        return new adaptivecards_1.HostConfig({
            spacing: {
                small: 3,
                default: 8,
                medium: 20,
                large: 30,
                extraLarge: 40,
                padding: 10
            },
            separator: {
                lineThickness: 1,
                lineColor: "#FF999999"
            },
            supportsInteractivity: true,
            fontFamily: "Segoe UI",
            fontSizes: {
                small: 13,
                default: 15,
                medium: 18,
                large: 20,
                extraLarge: 24
            },
            fontWeights: {
                lighter: 200,
                default: 400,
                bolder: 600
            },
            containerStyles: {
                default: {
                    backgroundColor: "#000000",
                    foregroundColors: {
                        default: {
                            default: "#FFFFFFFF",
                            subtle: "#99FFFFFF"
                        },
                        accent: {
                            default: "#FF2E89FC",
                            subtle: "#CC2E89FC"
                        },
                        dark: {
                            default: "#FF999999",
                            subtle: "#99999999"
                        },
                        light: {
                            default: "#FFFFFFFF",
                            subtle: "#99FFFFFF"
                        },
                        attention: {
                            default: "#CCFF0000",
                            subtle: "#99FF0000"
                        },
                        good: {
                            default: "#CC00FF00",
                            subtle: "#9900FF00"
                        },
                        warning: {
                            default: "#CCFF9800",
                            subtle: "#99FF9800"
                        }
                    }
                },
                emphasis: {
                    backgroundColor: "#33FFFFFF",
                    foregroundColors: {
                        default: {
                            default: "#FFFFFFFF",
                            subtle: "#99FFFFFF"
                        },
                        accent: {
                            default: "#FF2E89FC",
                            subtle: "#CC2E89FC"
                        },
                        dark: {
                            default: "#FF999999",
                            subtle: "#99999999"
                        },
                        light: {
                            default: "#FFFFFFFF",
                            subtle: "#99FFFFFF"
                        },
                        attention: {
                            default: "#CCFF0000",
                            subtle: "#99FF0000"
                        },
                        good: {
                            default: "#CC00FF00",
                            subtle: "#9900FF00"
                        },
                        warning: {
                            default: "#CCFF9800",
                            subtle: "#99FF9800"
                        }
                    }
                }
            },
            imageSizes: {
                small: 40,
                medium: 68,
                large: 320
            },
            actions: {
                maxActions: 5,
                spacing: adaptivecards_1.Spacing.Default,
                buttonSpacing: 5,
                showCard: {
                    actionMode: adaptivecards_1.ShowCardActionMode.Inline,
                    inlineTopMargin: 20
                },
                actionsOrientation: adaptivecards_1.Orientation.Horizontal,
                actionAlignment: adaptivecards_1.ActionAlignment.Stretch
            },
            adaptiveCard: {
                allowCustomStyle: false
            },
            imageSet: {
                imageSize: adaptivecards_1.Size.Small,
                maxImageHeight: 100
            },
            factSet: {
                title: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Bolder,
                    wrap: true
                },
                value: {
                    color: adaptivecards_1.TextColor.Default,
                    size: adaptivecards_1.TextSize.Default,
                    isSubtle: false,
                    weight: adaptivecards_1.TextWeight.Default,
                    wrap: true,
                },
                spacing: 12
            }
        });
    };
    return CortanaContainer;
}(host_container_1.HostContainer));
exports.CortanaContainer = CortanaContainer;


/***/ })
/******/ ]);
//# sourceMappingURL=adaptivecards-visualizer.js.map