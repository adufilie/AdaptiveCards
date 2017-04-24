﻿import * as Enums from "./enums";
import * as Utils from "./utils";
import * as HostConfig from "./host-configuration";
import * as TextFormatters from "./text-formatters";

function invokeSetParent(obj: any, parent: CardElement) {
    // This is not super pretty, but it the closest emulation of
    // "internal" in TypeScript.
    obj["setParent"](parent);
}

function isActionAllowed(action: Action, forbiddenActionTypes: Array<string>): boolean {
    if (forbiddenActionTypes) {
        for (var i = 0; i < forbiddenActionTypes.length; i++) {
            if (action.getJsonTypeName() === forbiddenActionTypes[i]) {
                return false;
            }
        }
    }

    if (!hostConfiguration.actions.supportedActionTypes) {
        return true;
    }

    for (var i = 0; i < hostConfiguration.actions.supportedActionTypes.length; i++) {
        if (action.getJsonTypeName() === hostConfiguration.actions.supportedActionTypes[i]) {
            return true;
        }
    }

    return false;
}

function isElementAllowed(element: CardElement, forbiddenElementTypes: Array<string>) {
    if (!hostConfiguration.supportsInteractivity && element.isInteractive) {
        return false;
    }

    if (forbiddenElementTypes) {
        for (var i = 0; i < forbiddenElementTypes.length; i++) {
            if (element.getJsonTypeName() === forbiddenElementTypes[i]) {
                return false;
            }
        }
    }

    if (!hostConfiguration.supportedElementTypes) {
        return true;
    }
    
    for (var i = 0; i < hostConfiguration.supportedElementTypes.length; i++) {
        if (element.getJsonTypeName() === hostConfiguration.supportedElementTypes[i]) {
            return true;
        }
    }
    
    return false;
}

export interface IValidationError {
    error: Enums.ValidationError,
    message: string;
}

export abstract class CardElement {
    private _parent: CardElement = null;

    private internalGetNonZeroPadding(element: CardElement, padding: HostConfig.ISpacingDefinition) {
        if (padding.top == 0) {
            padding.top = element.padding.top;
        }

        if (padding.right == 0) {
            padding.right = element.padding.right;
        }

        if (padding.bottom == 0) {
            padding.bottom = element.padding.bottom;
        }

        if (padding.left == 0) {
            padding.left = element.padding.left;
        }

        if (element.parent) {
            this.internalGetNonZeroPadding(element.parent, padding);
        }
    }

    protected showBottomSpacer(requestingElement: CardElement) {
        if (this.parent) {
            this.parent.showBottomSpacer(this);
        }
    }

    protected hideBottomSpacer(requestingElement: CardElement) {
        if (this.parent) {
            this.parent.hideBottomSpacer(this);
        }
    }

    protected setParent(value: CardElement) {
        this._parent = value;
    }

    protected get useDefaultSizing(): boolean {
        return true;
    }

    protected adjustAlignment(element: HTMLElement) {
        if (this.horizontalAlignment != "left") {
            element.style.textAlign = this.horizontalAlignment;
        }
    }

    protected adjustLayout(element: HTMLElement) {
        element.style.boxSizing = "border-box";

        if (this.useDefaultSizing) {
            element.style.width = "100%";
        }

        this.adjustAlignment(element);
    }

    protected abstract internalRender(): HTMLElement;

    speak: string;
    horizontalAlignment: Enums.HorizontalAlignment = "left";
    separation: Enums.Separation;

    abstract getJsonTypeName(): string;
    abstract getDefaultSeparationDefinition(): HostConfig.ISeparationDefinition;
    abstract renderSpeech(): string;

    getNonZeroPadding(): HostConfig.ISpacingDefinition {
        var padding: HostConfig.ISpacingDefinition = { top: 0, right: 0, bottom: 0, left: 0 };

        this.internalGetNonZeroPadding(this, padding);

        return padding;
    }

    getForbiddenElementTypes(): Array<string> {
        return null;
    }

    getForbiddenActionTypes(): Array<any> {
        return null;
    }

    parse(json: any) {
        this.speak = json["speak"];
        this.horizontalAlignment = json["horizontalAlignment"];
        this.separation = Utils.getValueOrDefault<Enums.Separation>(json["separation"], "default");        
    }

    validate(): Array<IValidationError> {
        return [];
    }

    render(): HTMLElement {
        let renderedElement = this.internalRender();

        if (renderedElement != null) {
            this.adjustLayout(renderedElement);
        }

        return renderedElement;
    }

    isLastItem(item: CardElement): boolean {
        return this.parent ? this.parent.isLastItem(item) : true;
    }

    getRootElement(): CardElement {
        var rootElement: CardElement = this;

        while (rootElement.parent) {
            rootElement = rootElement.parent;
        }

        return rootElement;
    }

    getAllInputs(): Array<Input> {
        return [];
    }

    protected get padding(): HostConfig.ISpacingDefinition {
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    get isInteractive(): boolean {
        return false;
    }

    get parent(): CardElement {
        return this._parent;
    }
}

export class TextBlock extends CardElement {
    size: Enums.TextSize = "normal";
    weight: Enums.TextWeight = "normal";
    color?: Enums.TextColor;
    text: string;
    isSubtle: boolean = false;
    wrap: boolean = true;
    maxLines: number;

    protected internalRender(): HTMLElement {
        if (!Utils.isNullOrEmpty(this.text)) {
            var element = document.createElement("div");
            element.style.fontFamily = hostConfiguration.fontFamily;

            var cssStyle = "text ";
            var fontSize: number;

            switch (this.size) {
                case "small":
                    fontSize = hostConfiguration.fontSizes.small;
                    break;
                case "medium":
                    fontSize = hostConfiguration.fontSizes.medium;
                    break;
                case "large":
                    fontSize = hostConfiguration.fontSizes.large;
                    break;
                case "extraLarge":
                    fontSize = hostConfiguration.fontSizes.extraLarge;
                    break;
                default:
                    fontSize = hostConfiguration.fontSizes.normal;
                    break;
            }

            element.style.fontSize = fontSize + "px";

            var actualTextColor = this.color ? this.color : hostConfiguration.textBlock.color;
            var colorDefinition: HostConfig.IColorDefinition;

            switch (actualTextColor) {
                case "dark":
                    colorDefinition = hostConfiguration.colors.dark;
                    break;
                case "light":
                    colorDefinition = hostConfiguration.colors.light;
                    break;
                case "accent":
                    colorDefinition = hostConfiguration.colors.accent;
                    break;
                case "good":
                    colorDefinition = hostConfiguration.colors.good;
                    break;
                case "warning":
                    colorDefinition = hostConfiguration.colors.warning;
                    break;
                case "attention":
                    colorDefinition = hostConfiguration.colors.attention;
                    break;
                default:
                    colorDefinition = hostConfiguration.colors.dark;
                    break;
            }

            element.style.color = Utils.stringToCssColor(this.isSubtle ? colorDefinition.subtle : colorDefinition.normal);

            var fontWeight: number;

            switch (this.weight) {
                case "lighter":
                    fontWeight = hostConfiguration.fontWeights.lighter;
                    break;
                case "bolder":
                    fontWeight = hostConfiguration.fontWeights.bolder;
                    break;
                default:
                    fontWeight = hostConfiguration.fontWeights.normal;
                    break;
            }

            element.style.fontWeight = fontWeight.toString();

            var formattedText = TextFormatters.formatText(this.text);

            element.innerHTML = Utils.processMarkdown(formattedText);

            if (element.firstElementChild instanceof HTMLElement) {
                var firstElementChild = <HTMLElement>element.firstElementChild;                
                firstElementChild.style.marginTop = "0px";

                if (!this.wrap) {
                    firstElementChild.style.overflow = "hidden";
                    firstElementChild.style.textOverflow = "ellipsis";
                }
            }

            if (element.lastElementChild instanceof HTMLElement) {
                (<HTMLElement>element.lastElementChild).style.marginBottom = "0px";
            }

            var anchors = element.getElementsByTagName("a");

            for (var i = 0; i < anchors.length; i++) {
                anchors[i].target = "_blank";
            }

            if (this.wrap) {
                element.style.wordWrap = "break-word";
            }
            else {
                element.style.whiteSpace = "nowrap";
            }

            return element;
        }
        else {
            return null;
        }
    }

    getJsonTypeName(): string {
        return "TextBlock";
    }

    getDefaultSeparationDefinition(): HostConfig.ISeparationDefinition {
        switch (this.size) {
            case "small":
                return hostConfiguration.textBlock.separations.small;
            case "medium":
                return hostConfiguration.textBlock.separations.medium;
            case "large":
                return hostConfiguration.textBlock.separations.large;
            case "extraLarge":
                return hostConfiguration.textBlock.separations.extraLarge;
            default:
                return hostConfiguration.textBlock.separations.normal;
        }
    }

    parse(json: any) {
        super.parse(json);

        this.text = json["text"];
        this.size = Utils.getValueOrDefault<Enums.TextSize>(json["size"], "normal");
        this.weight = Utils.getValueOrDefault<Enums.TextWeight>(json["weight"], "normal");
        this.color = Utils.getValueOrDefault<Enums.TextColor>(json["color"], hostConfiguration.textBlock.color);
        this.isSubtle = json["isSubtle"];
        this.wrap = json["wrap"] === undefined ? true : json["wrap"];
        this.maxLines = json["maxLines"];        
    }

    renderSpeech(): string {
        if (this.speak != null)
            return this.speak + '\n';

        if (this.text)
            return '<s>' + this.text + '</s>\n';

        return null;
    }
}

class InternalTextBlock extends TextBlock {
    get useDefaultSizing(): boolean {
        return false;
    }
}

export class Fact {
    name: string;
    value: string;
    speak: string;

    renderSpeech(): string {
        if (this.speak != null) {
            return this.speak + '\n';
        }

        return '<s>' + this.name + ' ' + this.value + '</s>\n';
    }
}

export class FactSet extends CardElement {
    protected get useDefaultSizing(): boolean {
        return false;
    }

    protected internalRender(): HTMLElement {
        let element: HTMLElement = null;

        if (this.facts.length > 0) {
            element = document.createElement("table");
            element.style.borderWidth = "0px";
            element.style.borderSpacing = "0px";
            element.style.borderStyle = "none";
            element.style.borderCollapse = "collapse";

            for (var i = 0; i < this.facts.length; i++) {
                var trElement = document.createElement("tr");

                if (i > 0) {
                    trElement.style.marginTop = hostConfiguration.factSet.spacing + "px";
                }

                var tdElement = document.createElement("td");
                tdElement.className = "factNameContainer";

                let textBlock = new InternalTextBlock();
                textBlock.text = this.facts[i].name;
                textBlock.size = hostConfiguration.factSet.title.size;
                textBlock.color = hostConfiguration.factSet.title.color;
                textBlock.isSubtle = hostConfiguration.factSet.title.isSubtle;
                textBlock.weight = hostConfiguration.factSet.title.weight;
                textBlock.separation = "none";

                Utils.appendChild(tdElement, textBlock.render());
                Utils.appendChild(trElement, tdElement);

                tdElement = document.createElement("td");
                tdElement.className = "factValueContainer";

                textBlock = new InternalTextBlock();
                textBlock.text = this.facts[i].value;
                textBlock.size = hostConfiguration.factSet.value.size;
                textBlock.color = hostConfiguration.factSet.value.color;
                textBlock.isSubtle = hostConfiguration.factSet.value.isSubtle;
                textBlock.weight = hostConfiguration.factSet.value.weight;
                textBlock.separation = "none";

                Utils.appendChild(tdElement, textBlock.render());
                Utils.appendChild(trElement, tdElement);
                Utils.appendChild(element, trElement);
            }
        }

        return element;
    }

    facts: Array<Fact> = [];

    getJsonTypeName(): string {
        return "FactSet";
    }

    getDefaultSeparationDefinition(): HostConfig.ISeparationDefinition {
        return hostConfiguration.factSet.separation;
    }

    parse(json: any) {
        super.parse(json);
        
        if (json["facts"] != null) {
            var jsonFacts = json["facts"] as Array<any>;

            for (var i = 0; i < jsonFacts.length; i++) {
                let fact = new Fact();

                fact.name = jsonFacts[i]["title"];
                fact.value = jsonFacts[i]["value"];
                fact.speak = jsonFacts[i]["speak"];

                this.facts.push(fact);
            }
        }
    }

    renderSpeech(): string {
        if (this.speak != null) {
            return this.speak + '\n';
        }

        // render each fact 
        let speak = null;

        if (this.facts.length > 0) {
            speak = '';

            for (var i = 0; i < this.facts.length; i++) {
                let speech = this.facts[i].renderSpeech();

                if (speech) {
                    speak += speech;
                }
            }
        }

        return '<p>' + speak + '\n</p>\n';
    }
}

export class Image extends CardElement {
    protected get useDefaultSizing() {
        return false;
    }

    protected adjustAlignment(element: HTMLElement) {
        switch (this.horizontalAlignment) {
            case "center":
                element.style.marginLeft = "auto";
                element.style.marginRight = "auto";

                break;
            case "right":
                element.style.marginLeft = "auto";

                break;
        }
    }

    protected internalRender(): HTMLElement {
        let imageElement: HTMLImageElement = null;

        if (!Utils.isNullOrEmpty(this.url)) {
            imageElement = document.createElement("img");
            imageElement.style.display = "block";
            imageElement.onclick = (e) => {
                if (this.selectAction != null) {
                    raiseExecuteActionEvent(this.selectAction);
                    e.cancelBubble = true;
                }
            }
            imageElement.classList.add("image");

            if (this.selectAction != null) {
                imageElement.classList.add("selectable");
            }

            switch (this.size) {
                case "auto":
                    imageElement.style.maxWidth = "100%";
                    break;
                case "stretch":
                    imageElement.style.width = "100%";
                    break;
                case "small":
                    imageElement.style.maxWidth = hostConfiguration.imageSizes.small + "px";
                    break;
                case "large":
                    imageElement.style.maxWidth = hostConfiguration.imageSizes.large + "px";
                    break;
                default:
                    imageElement.style.maxWidth = hostConfiguration.imageSizes.medium + "px";
                    break;
            }

            if (this.style == "person") {
                imageElement.classList.add("person");
            }

            imageElement.src = this.url;
        }

        return imageElement;
    }

    style: Enums.ImageStyle = "normal";
    url: string;
    size: Enums.Size = "medium";
    selectAction: ExternalAction;

    getJsonTypeName(): string {
        return "Image";
    }

    getDefaultSeparationDefinition(): HostConfig.ISeparationDefinition {
        return hostConfiguration.image.separation;
    }

    parse(json: any) {
        super.parse(json);

        this.url = json["url"];
        this.style = Utils.getValueOrDefault<Enums.ImageStyle>(json["style"], "normal");
        this.size = Utils.getValueOrDefault<Enums.Size>(json["size"], "medium");

        var selectActionJson = json["selectAction"];

        if (selectActionJson != undefined) {
            this.selectAction = <ExternalAction>Action.createAction(selectActionJson);
            invokeSetParent(this.selectAction, this);
        }        
    }

    renderSpeech(): string {
        if (this.speak != null) {
            return this.speak + '\n';
        }

        return null;
    }
}

export class ImageSet extends CardElement {
    private _images: Array<Image> = [];

    protected internalRender(): HTMLElement {
        let element: HTMLElement = null;

        if (this._images.length > 0) {
            element = document.createElement("div");

            for (var i = 0; i < this._images.length; i++) {
                let renderedImage = this._images[i].render();

                // Default display for Image is "block" but that forces them to stack vertically
                // in a div. So we need to override display and set it to "inline-block". The
                // drawback is that it adds a small spacing at the bottom of each image, which
                // simply can't be removed cleanly in a cross-browser compatible way.
                renderedImage.style.display = "inline-block";
                renderedImage.style.margin = "0px";
                renderedImage.style.marginRight = "10px";

                Utils.appendChild(element, renderedImage);
            }
        }

        return element;
    }

    imageSize: Enums.Size = "medium";

    getJsonTypeName(): string {
        return "ImageSet";
    }

    getDefaultSeparationDefinition(): HostConfig.ISeparationDefinition {
        return hostConfiguration.imageSet.separation;
    }

    parse(json: any) {
        super.parse(json);
        
        this.imageSize = Utils.getValueOrDefault<Enums.Size>(json["imageSize"], "medium");

        if (json["images"] != null) {
            let jsonImages = json["images"] as Array<any>;

            for (let i = 0; i < jsonImages.length; i++) {
                var image = new Image();

                image.size = this.imageSize;
                image.url = jsonImages[i]["url"];

                this.addImage(image);
            }
        }
    }

    addImage(image: Image) {
        if (!image.parent) {
            this._images.push(image);

            invokeSetParent(image, this);
        }
        else {
            throw new Error("This image already belongs to another ImageSet");
        }
    }

    renderSpeech(): string {
        if (this.speak != null) {
            return this.speak;
        }

        var speak = null;

        if (this._images.length > 0) {
            speak = '';

            for (var i = 0; i < this._images.length; i++) {
                speak += this._images[i].renderSpeech();
            }
        }

        return speak;
    }
}

export abstract class Input extends CardElement implements Utils.IInput {
    id: string;
    title: string;
    defaultValue: string;

    abstract get value(): string;

    getDefaultSeparationDefinition(): HostConfig.ISeparationDefinition {
        return hostConfiguration.input.separation;
    }

    validate(): Array<IValidationError> {
        if (!this.id) {
            return [ { error: Enums.ValidationError.PropertyCantBeNull, message: "All inputs must have a unique Id" } ];
        }
        else {
            return [];
        }
    }

    parse(json: any) {
        super.parse(json);

        this.id = json["id"];
        this.defaultValue = json["value"];
    }

    renderSpeech(): string {
        if (this.speak != null) {
            return this.speak;
        }

        if (this.title) {
            return '<s>' + this.title + '</s>\n';
        }

        return null;
    }

    getAllInputs(): Array<Input> {
        return [ this ];
    }

    get isInteractive(): boolean {
        return true;
    }
}

export class TextInput extends Input {
    private _textareaElement: HTMLTextAreaElement;

    protected internalRender(): HTMLElement {
        this._textareaElement = document.createElement("textarea");
        this._textareaElement.className = "input textInput";

        if (this.isMultiline) {
            this._textareaElement.classList.add("multiline");
        }

        if (!Utils.isNullOrEmpty(this.placeholder)) {
            this._textareaElement.placeholder = this.placeholder;
        }

        if (!Utils.isNullOrEmpty(this.defaultValue)) {
            this._textareaElement.textContent = this.defaultValue;
        }

        if (this.maxLength > 0) {
            this._textareaElement.maxLength = this.maxLength;
        }

        return this._textareaElement;
    }

    maxLength: number;
    isMultiline: boolean;
    placeholder: string;

    getJsonTypeName(): string {
        return "Input.Text";
    }

    parse(json: any) {
        super.parse(json);

        this.maxLength = json["maxLength"];
        this.isMultiline = json["isMultiline"];
        this.placeholder = json["placeholder"];
    }

    get value(): string {
        return this._textareaElement ? this._textareaElement.textContent : null;
    }
}

export class ToggleInput extends Input {
    private _checkboxInputElement: HTMLInputElement;

    protected internalRender(): HTMLElement {
        var element = document.createElement("div");
        element.className = "input";

        this._checkboxInputElement = document.createElement("input");
        this._checkboxInputElement.className = "toggleInput";
        this._checkboxInputElement.type = "checkbox";

        if (this.defaultValue == this.valueOn) {
            this._checkboxInputElement.checked = true;
        }

        var label = new InternalTextBlock();
        label.text = this.title;

        var labelElement = label.render();
        labelElement.classList.add("toggleLabel");

        var compoundInput = document.createElement("div");

        Utils.appendChild(element, this._checkboxInputElement);
        Utils.appendChild(element, labelElement);

        return element;
    }

    title: string;
    valueOn: string;
    valueOff: string;

    getJsonTypeName(): string {
        return "Input.Toggle";
    }

    parse(json: any) {
        super.parse(json);

        this.title = json["title"];
        this.valueOn = json["valueOn"];
        this.valueOff = json["valueOff"];
    }

    get value(): string {
        if (this._checkboxInputElement) {
            return this._checkboxInputElement.checked ? this.valueOn : this.valueOff;
        }
        else {
            return null;
        }
    }
}

export class Choice {
    title: string;
    value: string;
}

export class ChoiceSetInput extends Input {
    private _selectElement: HTMLSelectElement;
    private _toggleInputs: Array<HTMLInputElement>;

    protected internalRender(): HTMLElement {
        if (!this.isMultiSelect) {
            if (this.isCompact) {
                // Render as a combo box
                this._selectElement = document.createElement("select");
                this._selectElement.className = "input multichoiceInput";

                var option = document.createElement("option");
                option.selected = true;
                option.disabled = true;
                option.hidden = true;
                option.text = this.placeholder;

                Utils.appendChild(this._selectElement, option);

                for (var i = 0; i < this.choices.length; i++) {
                    var option = document.createElement("option");
                    option.value = this.choices[i].value;
                    option.text = this.choices[i].title;

                    Utils.appendChild(this._selectElement, option);
                }

                return this._selectElement;
            }
            else {
                // Render as a series of radio buttons
                var element = document.createElement("div");
                element.className = "input";

                this._toggleInputs = [];

                for (var i = 0; i < this.choices.length; i++) {
                    var radioInput = document.createElement("input");
                    radioInput.className = "toggleInput";
                    radioInput.type = "radio";
                    radioInput.name = this.id;
                    radioInput.value = this.choices[i].value;

                    this._toggleInputs.push(radioInput);

                    var label = new InternalTextBlock();
                    label.text = this.choices[i].title;

                    var labelElement = label.render();
                    labelElement.classList.add("toggleLabel");

                    var compoundInput = document.createElement("div");

                    Utils.appendChild(compoundInput, radioInput);
                    Utils.appendChild(compoundInput, labelElement);

                    Utils.appendChild(element, compoundInput);
                }

                return element;
            }
        }
        else {
            // Render as a list of toggle inputs
            var element = document.createElement("div");
            element.className = "input";

            this._toggleInputs = [];

            for (var i = 0; i < this.choices.length; i++) {
                var checkboxInput = document.createElement("input");
                checkboxInput.className = "toggleInput";
                checkboxInput.type = "checkbox";
                checkboxInput.value = this.choices[i].value;

                this._toggleInputs.push(checkboxInput);

                var label = new InternalTextBlock();
                label.text = this.choices[i].title;

                var labelElement = label.render();
                labelElement.classList.add("toggleLabel");

                var compoundInput = document.createElement("div");

                Utils.appendChild(compoundInput, checkboxInput);
                Utils.appendChild(compoundInput, labelElement);

                Utils.appendChild(element, compoundInput);
            }

            return element;
        }
    }

    choices: Array<Choice> = [];
    isCompact: boolean;
    isMultiSelect: boolean;
    placeholder: string;

    getJsonTypeName(): string {
        return "Input.ChoiceSet";
    }

    validate(): Array<IValidationError> {
        var result: Array<IValidationError> = [];

        if (this.choices.length == 0) {
            result = [ { error: Enums.ValidationError.CollectionCantBeEmpty, message: "An Input.ChoiceSet must have at least one choice defined." } ];
        }

        for (var i = 0; i < this.choices.length; i++) {
            if (!this.choices[i].title || !this.choices[i].value) {
                result = result.concat([ { error: Enums.ValidationError.PropertyCantBeNull, message: "All choices in an Input.ChoiceSet must have their title and value properties set." } ])
                break;
            }
        }

        return result;
    }

    parse(json: any) {
        super.parse(json);

        this.isCompact = !(json["style"] === "expanded");
        this.isMultiSelect = json["isMultiSelect"];
        this.placeholder = json["placeholder"];

        if (json["choices"] != undefined) {
            var choiceArray = json["choices"] as Array<any>;

            for (var i = 0; i < choiceArray.length; i++) {
                var choice = new Choice();

                choice.title = choiceArray[i]["title"];
                choice.value = choiceArray[i]["value"];

                this.choices.push(choice);
            }
        }
    }

    get value(): string {
        if (!this.isMultiSelect) {
            if (this.isCompact) {
                return this._selectElement ? this._selectElement.value : null;
            }
            else {
                if (this._toggleInputs.length == 0) {
                    return null;
                }

                for (var i = 0; i < this._toggleInputs.length; i++) {
                    if (this._toggleInputs[i].checked) {
                        return this._toggleInputs[i].value;
                    }
                }

                return null;
            }
        }
        else {
            if (this._toggleInputs.length == 0) {
                return null;
            }
            
            var result: string = "";

            for (var i = 0; i < this._toggleInputs.length; i++) {
                if (this._toggleInputs[i].checked) {
                    if (result != "") {
                        result += ";";
                    }

                    result += this._toggleInputs[i].value;
                }
            }

            return result == "" ? null : result;
        }
    }
}

export class NumberInput extends Input {
    private _numberInputElement: HTMLInputElement;

    protected internalRender(): HTMLElement {
        this._numberInputElement = document.createElement("input");
        this._numberInputElement.type = "number";
        this._numberInputElement.className = "input number";
        this._numberInputElement.min = this.min;
        this._numberInputElement.max = this.max;

        if (!Utils.isNullOrEmpty(this.defaultValue)) {
            this._numberInputElement.value = this.defaultValue;
        }

        return this._numberInputElement;
    }

    min: string;
    max: string;

    getJsonTypeName(): string {
        return "Input.Number";
    }

    parse(json: any) {
        super.parse(json);

        this.min = json["min"];
        this.max = json["max"];
    }

    get value(): string {
        return this._numberInputElement ? this._numberInputElement.value : null;
    }
}

export class DateInput extends Input {
    private _dateInputElement: HTMLInputElement;

    protected internalRender(): HTMLElement {
        this._dateInputElement = document.createElement("input");
        this._dateInputElement.type = "date";
        this._dateInputElement.className = "input date";

        return this._dateInputElement;
    }

    getJsonTypeName(): string {
        return "Input.Date";
    }

    get value(): string {
        return this._dateInputElement ? this._dateInputElement.value : null;
    }
}

export class TimeInput extends Input {
    private _timeInputElement: HTMLInputElement;

    protected internalRender(): HTMLElement {
        this._timeInputElement = document.createElement("input");
        this._timeInputElement.type = "time";
        this._timeInputElement.className = "input time";

        return this._timeInputElement;
    }

    getJsonTypeName(): string {
        return "Input.Time";
    }

    get value(): string {
        return this._timeInputElement ? this._timeInputElement.value : null;
    }
}

enum ActionButtonStyle {
    Link,
    Push
}

enum ActionButtonState {
    Normal,
    Expanded,
    Subdued
}

class ActionButton {
    private _action: Action;
    private _style: ActionButtonStyle;
    private _element: HTMLElement = null;
    private _state: ActionButtonState = ActionButtonState.Normal;
    private _text: string;

    private click() {
        if (this.onClick != null) {
            this.onClick(this);
        }
    }

    private updateCssStyle() {
        let cssStyle = this._style == ActionButtonStyle.Link ? "linkButton " : "pushButton ";

        switch (this._state) {
            case ActionButtonState.Expanded:
                cssStyle += " expanded";
                break;
            case ActionButtonState.Subdued:
                cssStyle += " subdued";
                break;
        }

        this._element.className = cssStyle;
    }

    constructor(action: Action, style: ActionButtonStyle) {
        this._action = action;
        this._style = style;
        this._element = document.createElement("div");
        this._element.onclick = (e) => { this.click(); };

        this.updateCssStyle();
    }

    onClick: (actionButton: ActionButton) => void = null;

    get action() {
        return this._action;
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        this._text = value;
        this._element.innerText = this._text;
    }

    get element(): HTMLElement {
        return this._element;
    }

    get state(): ActionButtonState {
        return this._state;
    }

    set state(value: ActionButtonState) {
        this._state = value;

        this.updateCssStyle();
    }
}

export abstract class Action {
    static createAction(json: any): Action {
        var actionType = json["type"];

        var result = AdaptiveCard.actionTypeRegistry.createInstance(actionType);

        if (result) {
            result.parse(json);
        }
        else {
            raiseParseError(
                {
                    error: Enums.ValidationError.UnknownActionType,
                    message: "Unknown action type: " + actionType
                });
        }

        return result;
    }

    private _parent: CardElement = null;

    protected setParent(value: CardElement) {
        this._parent = value;
    }

    abstract getJsonTypeName(): string;

    validate(): Array<IValidationError> {
        return [];
    }

    prepare(inputs: Array<Input>) {
        // Do nothing in base implementation
    };

    parse(json: any) {
        this.title = json["title"];        
    }

    getAllInputs(): Array<Input> {
        return [];
    }

    title: string;

    get parent(): CardElement {
        return this._parent;
    }
}

export abstract class ExternalAction extends Action {
}

export class SubmitAction extends ExternalAction {
    private _isPrepared: boolean = false;
    private _originalData: Object;
    private _processedData: Object;

    getJsonTypeName(): string {
        return "Action.Submit";
    }

    prepare(inputs: Array<Input>) {
        if (this._originalData) {
            this._processedData = JSON.parse(JSON.stringify(this._originalData));
        }
        else {
            this._processedData = { };
        }

        for (var i = 0; i < inputs.length; i++) {
            var inputValue = inputs[i].value;

            if (inputValue != null) {
                this._processedData[inputs[i].id] = inputs[i].value;
            }
        }

        this._isPrepared = true;
    }

    parse(json: any) {
        super.parse(json);

        this.data = json["data"];        
    }

    get data(): Object {
        return this._isPrepared ? this._processedData : this._originalData;
    }

    set data(value: Object) {
        this._originalData = value;
        this._isPrepared = false;
    }
}

export class OpenUrlAction extends ExternalAction {
    url: string;

    getJsonTypeName(): string {
        return "Action.OpenUrl";
    }
    
    validate(): Array<IValidationError> {
        if (!this.url) {
            return [ { error: Enums.ValidationError.PropertyCantBeNull, message: "An Action.OpenUrl must have its url property set." }];
        }
        else {
            return [];
        }
    }

    parse(json: any) {
        super.parse(json);

        this.url = json["url"];        
    }
}

export class HttpHeader {
    private _value = new Utils.StringWithSubstitutions();

    name: string;

    prepare(inputs: Array<Input>) {
        this._value.substituteInputValues(inputs);
    }

    get value(): string {
        return this._value.get();
    }

    set value(newValue: string) {
        this._value.set(newValue);
    }
}

export class HttpAction extends ExternalAction {
    private _url = new Utils.StringWithSubstitutions();
    private _body = new Utils.StringWithSubstitutions();
    private _headers: Array<HttpHeader> = [];

    method: string;

    getJsonTypeName(): string {
        return "Action.Http";
    }
    
    validate(): Array<IValidationError> {
        var result: Array<IValidationError> = [];

        if (!this.url) {
            result = [ { error: Enums.ValidationError.PropertyCantBeNull, message: "An Action.Http must have its url property set." }];
        }

        if (this.headers.length > 0) {
            for (var i = 0; i < this.headers.length; i++) {
                if (!this.headers[i].name || !this.headers[i].value) {
                    result = result.concat([ { error: Enums.ValidationError.PropertyCantBeNull, message: "All headers of an Action.Http must have their name and value properties set."  } ]);
                    break;
                }
            }
        }

        return result;
    }

    prepare(inputs: Array<Input>) {
        this._url.substituteInputValues(inputs);
        this._body.substituteInputValues(inputs);

        for (var i = 0; i < this._headers.length; i++) {
            this._headers[i].prepare(inputs);
        }
    };

    parse(json: any) {
        super.parse(json);

        this.url = json["url"];
        this.method = json["method"];
        this.body = json["body"];

        if (json["headers"] != null) {
            var jsonHeaders = json["headers"] as Array<any>;

            for (var i = 0; i < jsonHeaders.length; i++) {
                let httpHeader = new HttpHeader();

                httpHeader.name = jsonHeaders[i]["name"];
                httpHeader.value = jsonHeaders[i]["value"];

                this.headers.push(httpHeader);
            }
        }        
    }

    get url(): string {
        return this._url.get();
    }

    set url(value: string) {
        this._url.set(value);
    }

    get body(): string {
        return this._body.get();
    }

    set body(value: string) {
        this._body.set(value);
    }

    get headers(): Array<HttpHeader> {
        return this._headers;
    }
}

export class ShowCardAction extends Action {
    protected setParent(value: CardElement) {
        super.setParent(value);

        invokeSetParent(this.card, value);
    }

    readonly card: AdaptiveCard = new InlineAdaptiveCard();

    title: string;

    getJsonTypeName(): string {
        return "Action.ShowCard";
    }
    
    validate(): Array<IValidationError> {
        return this.card.validate();
    }

    parse(json: any) {
        super.parse(json);

        this.card.parse(json["card"]);
    }

    getAllInputs(): Array<Input> {
        return this.card.getAllInputs();
    }
}

class ActionCollection {
    private _owner: CardElement;
    private _actionButtons: Array<ActionButton> = [];
    private _actionCardContainer: HTMLDivElement;
    private _expandedAction: Action = null;

    private hideActionCardPane() {
        this._actionCardContainer.innerHTML = '';
        this._actionCardContainer.style.padding = "0px";
        this._actionCardContainer.style.marginTop = "0px";

        if (this.onHideActionCardPane) {
            this.onHideActionCardPane();
        }
    }

    private showActionCardPane(action: ShowCardAction) {
        if (this.onShowActionCardPane) {
            this.onShowActionCardPane(action);
        }

        var renderedCard = action.card.render();

        this._actionCardContainer.innerHTML = '';
        this._actionCardContainer.style.marginTop = this.items.length > 1 ? hostConfiguration.actions.showCard.inlineCardSpacing + "px" : "0px";

        if (hostConfiguration.actions.showCard.actionMode == "inlineEdgeToEdge") {
            var padding = this._owner.getNonZeroPadding();

            this._actionCardContainer.style.paddingLeft = padding.left + "px";
            this._actionCardContainer.style.paddingRight = padding.right + "px";

            this._actionCardContainer.style.marginLeft = "-" + padding.left + "px";
            this._actionCardContainer.style.marginRight = "-" + padding.right + "px";

            renderedCard.style.paddingLeft = "0px";
            renderedCard.style.paddingRight = "0px";
        }

        Utils.appendChild(this._actionCardContainer, renderedCard);
    }

    private actionClicked(actionButton: ActionButton) {
        if (!(actionButton.action instanceof ShowCardAction)) {
            for (var i = 0; i < this._actionButtons.length; i++) {
                this._actionButtons[i].state = ActionButtonState.Normal;
            }

            this.hideActionCardPane();

            raiseExecuteActionEvent(<ExternalAction>actionButton.action);
        }
        else {
            if (hostConfiguration.actions.showCard.actionMode == "popup") {
                var actionShowCard = <ShowCardAction>actionButton.action;

                raiseShowPopupCardEvent(actionShowCard);
            }
            else if (actionButton.action === this._expandedAction) {
                for (var i = 0; i < this._actionButtons.length; i++) {
                    this._actionButtons[i].state = ActionButtonState.Normal;
                }

                this._expandedAction = null;

                this.hideActionCardPane();
            }
            else {
                for (var i = 0; i < this._actionButtons.length; i++) {
                    if (this._actionButtons[i] !== actionButton) {
                        this._actionButtons[i].state = ActionButtonState.Subdued;
                    }
                }

                actionButton.state = ActionButtonState.Expanded;

                this._expandedAction = actionButton.action;

                this.showActionCardPane(actionButton.action);
            }
        }
    }

    items: Array<Action> = [];
    onHideActionCardPane: () => void = null;
    onShowActionCardPane: (action: ShowCardAction) => void = null;

    constructor(owner: CardElement) {
        this._owner = owner;
    }

    validate(): Array<IValidationError> {
        var result: Array<IValidationError> = [];

        if (hostConfiguration.actions.maxActions && this.items.length > hostConfiguration.actions.maxActions) {
            result.push(
                {
                    error: Enums.ValidationError.TooManyActions,
                    message: "A maximum of " + hostConfiguration.actions.maxActions + " actions are allowed."
                });
        }

        if (this.items.length > 0 && !hostConfiguration.supportsInteractivity) {
            result.push(
                {
                    error: Enums.ValidationError.InteractivityNotAllowed,
                    message: "Interactivity is not allowed."
                });
        }

        for (var i = 0; i < this.items.length; i++) {
            if (!isActionAllowed(this.items[i], this._owner.getForbiddenActionTypes())) {
                result.push(
                    {
                        error: Enums.ValidationError.ActionTypeNotAllowed,
                        message: "Actions of type " + this.items[i].getJsonTypeName() + " are not allowe."
                    });
            }

        }

        for (var i = 0; i < this.items.length; i++) {
            result = result.concat(this.items[i].validate());
        }

        return result;
    }

    render(): HTMLElement {
        if (!hostConfiguration.supportsInteractivity) {
            return null;
        }

        let element = document.createElement("div");
        element.style.overflow = "hidden";

        let buttonStrip = document.createElement("div");

        switch (hostConfiguration.actions.actionAlignment) {
            case "center":
                element.style.textAlign = "center";
                buttonStrip.style.textAlign = "center";

                break;
            case "right":
                element.style.textAlign = "right";
                buttonStrip.style.textAlign = "right";

                break;
        }

        if (hostConfiguration.actions.actionsOrientation == "horizontal") {
            if (hostConfiguration.actions.stretch) {
                buttonStrip.style.display = "flex";
            }
            else {
                buttonStrip.style.display = "inline-flex";
            }
        }
        else {
            buttonStrip.style.display = "inline-table";
        }

        this._actionCardContainer = document.createElement("div");
        this._actionCardContainer.style.backgroundColor = Utils.stringToCssColor(hostConfiguration.actions.showCard.backgroundColor);

        var renderedActions: number = 0;

        if (this.items.length == 1 && this.items[0] instanceof ShowCardAction) {
            this.showActionCardPane(<ShowCardAction>this.items[0]);

            renderedActions++;
        }
        else {
            var actionButtonStyle = ActionButtonStyle.Push;

            var maxActions = hostConfiguration.actions.maxActions ? Math.min(hostConfiguration.actions.maxActions, this.items.length) : this.items.length;

            for (var i = 0; i < maxActions; i++) {
                if (this.items[i] instanceof ShowCardAction) {
                    actionButtonStyle = ActionButtonStyle.Link;
                    break;
                }
            }

            var forbiddenActionTypes = this._owner.getForbiddenActionTypes();

            for (var i = 0; i < maxActions; i++) {
                if (isActionAllowed(this.items[i], forbiddenActionTypes)) {
                    let buttonStripItem = document.createElement("div");
                    buttonStripItem.style.whiteSpace = "nowrap";
                    buttonStripItem.style.overflow = "hidden";
                    buttonStripItem.style.overflow = "table-cell";
                    buttonStripItem.style.flex = hostConfiguration.actions.stretch ? "0 1 100%" : "0 1 auto";

                    let actionButton = new ActionButton(this.items[i], actionButtonStyle);
                    actionButton.text = this.items[i].title;

                    actionButton.onClick = (ab) => { this.actionClicked(ab); };

                    this._actionButtons.push(actionButton);

                    Utils.appendChild(buttonStripItem, actionButton.element);

                    Utils.appendChild(buttonStrip, buttonStripItem);

                    if (i < this.items.length - 1 && hostConfiguration.actions.buttonSpacing > 0) {
                        var spacer = document.createElement("div");

                        if (hostConfiguration.actions.actionsOrientation == "horizontal") {
                            spacer.style.flex = "0 0 " + hostConfiguration.actions.buttonSpacing + "px";
                        }
                        else {
                            spacer.style.height = hostConfiguration.actions.buttonSpacing + "px";
                        }

                        Utils.appendChild(buttonStrip, spacer);
                    }

                    renderedActions++;
                }
            }

            Utils.appendChild(element, buttonStrip);
        }

        Utils.appendChild(element, this._actionCardContainer);

        return renderedActions > 0 ? element : null;
    }

    addAction(action: Action) {
        if (!action.parent) {
            this.items.push(action);

            invokeSetParent(action, this._owner);
        }
        else {
            throw new Error("The action already belongs to another element.")
        }
    }

    getAllInputs(): Array<Input> {
        var result: Array<Input> = [];

        for (var i = 0; i < this.items.length; i++) {
            var action = this.items[i];

            result = result.concat(action.getAllInputs());
        }

        return result;
    }
}

export class ActionSet extends CardElement {
    private _actionCollection: ActionCollection;

    protected internalRender(): HTMLElement {
        return this._actionCollection.render();
    }
    
    constructor() {
        super();

        this._actionCollection = new ActionCollection(this);
        this._actionCollection.onHideActionCardPane = () => { this.showBottomSpacer(this); };
        this._actionCollection.onShowActionCardPane = (action: ShowCardAction) => { this.hideBottomSpacer(this); };
    }

    getJsonTypeName(): string {
        return "ActionSet";
    }

    getDefaultSeparationDefinition(): HostConfig.ISeparationDefinition {
        return hostConfiguration.actions.separation;
    }

    validate(): Array<IValidationError> {
        return this._actionCollection.validate();
    }

    parse(json: any, itemsCollectionPropertyName: string = "items") {
        super.parse(json);

        if (json["actions"] != undefined) {
            var jsonActions = json["actions"] as Array<any>;

            for (var i = 0; i < jsonActions.length; i++) {
                this.addAction(Action.createAction(jsonActions[i]));
            }
        }
    }

    addAction(action: Action) {
        if (action != null) {
            this._actionCollection.addAction(action);
        }
    }

    getAllInputs(): Array<Input> {
        return this._actionCollection.getAllInputs();
    }

    renderSpeech(): string {
        // TODO: What's the right thing to do here?
        return "";
    }

    get isInteractive(): boolean {
        return true;
    }
}

export abstract class ContainerBase extends CardElement {
    private _items: Array<CardElement> = [];

    protected showBottomSpacer(requestingElement: CardElement) {
        if (!requestingElement || (this.isLastItem(requestingElement) && hostConfiguration.actions.showCard.actionMode == "inlineEdgeToEdge")) {
            this._element.style.paddingBottom = this.padding.bottom + "px";

            super.showBottomSpacer(this);
        }
    }

    protected hideBottomSpacer(requestingElement: CardElement) {
        if (!requestingElement || (this.isLastItem(requestingElement) && hostConfiguration.actions.showCard.actionMode == "inlineEdgeToEdge")) {
            this._element.style.paddingBottom = "0px";

            super.hideBottomSpacer(this);
        }
    }

    protected internalRender(): HTMLElement {
        this._element = document.createElement("div");
        this._element.className = "container";

        var backgroundColor = this.getBackgroundColor();

        if (backgroundColor) {
            this._element.style.backgroundColor = Utils.stringToCssColor(backgroundColor);
        }

        if (this.selectAction) {
            this._element.classList.add("selectable");
        }

        this._element.style.paddingTop = this.padding.top + "px";
        this._element.style.paddingRight = this.padding.right + "px";
        this._element.style.paddingBottom = this.padding.bottom + "px";
        this._element.style.paddingLeft = this.padding.left + "px";
        this._element.onclick = (e) => {
            if (this.selectAction != null) {
                raiseExecuteActionEvent(this.selectAction);
                e.cancelBubble = true;
            }
        }

        if (this._items.length > 0) {
            var renderedElementCount: number = 0;

            for (var i = 0; i < this._items.length; i++) {
                var renderedElement = isElementAllowed(this._items[i], this.getForbiddenElementTypes()) ? this._items[i].render() : null;

                if (renderedElement != null) {
                    if (renderedElementCount > 0 && this._items[i].separation != "none") {
                        var separationDefinition = this._items[i].separation == "default" ? this._items[i].getDefaultSeparationDefinition() : hostConfiguration.strongSeparation;

                        Utils.appendChild(this._element, Utils.renderSeparation(separationDefinition, "vertical"));
                    }

                    Utils.appendChild(this._element, renderedElement);

                    renderedElementCount++;
                }
            }
        }

        return renderedElementCount > 0 ? this._element : null;
    }

    protected getBackgroundColor(): string {
        return null;
    }

    protected _element: HTMLDivElement;

    protected get hideOverflow() {
        return false;
    }

    protected get padding(): HostConfig.ISpacingDefinition {
        return { left: 0, top: 0, right: 0, bottom: 0};
    }

    selectAction: ExternalAction;

    isLastItem(item: CardElement): boolean {
        return this._items.indexOf(item) == (this._items.length - 1);
    }

    getDefaultSeparationDefinition(): HostConfig.ISeparationDefinition {
        return hostConfiguration.container.separation;
    }

    validate(): Array<IValidationError> {
        var result: Array<IValidationError> = [];

        for (var i = 0; i < this._items.length; i++) {
            if (!hostConfiguration.supportsInteractivity && this._items[i].isInteractive) {
                result.push(
                    {
                        error: Enums.ValidationError.InteractivityNotAllowed,
                        message: "Interactivity is not allowed."
                    });
            }

            if (!isElementAllowed(this._items[i], this.getForbiddenElementTypes())) {
                result.push(
                    {
                        error: Enums.ValidationError.InteractivityNotAllowed,
                        message: "Elements of type " + this._items[i].getJsonTypeName() + " are not allowed in this container."
                    });
            }

            result = result.concat(this._items[i].validate());
        }

        return result;
    }

    parse(json: any, itemsCollectionPropertyName: string = "items") {
        super.parse(json);

        if (json[itemsCollectionPropertyName] != null) {
            var items = json[itemsCollectionPropertyName] as Array<any>;

            for (var i = 0; i < items.length; i++) {
                var elementType = items[i]["type"];

                var element = AdaptiveCard.elementTypeRegistry.createInstance(elementType);

                if (!element) {
                    raiseParseError(
                        {
                            error: Enums.ValidationError.UnknownElementType,
                            message: "Unknown element type: " + elementType
                        });
                }
                else {
                    this.addItem(element);

                    element.parse(items[i]);
                }
            }
        }

        var selectActionJson = json["selectAction"];

        if (selectActionJson != undefined) {
            this.selectAction = <ExternalAction>Action.createAction(selectActionJson);
            invokeSetParent(this.selectAction, this);
        }
    }

    addItem(item: CardElement) {
        if (!item.parent) {
            this._items.push(item);

            invokeSetParent(item, this);
        }
        else {
            throw new Error("The element already belongs to another container.")
        }
    }

    getAllInputs(): Array<Input> {
        var result: Array<Input> = [];

        for (var i = 0; i < this._items.length; i++) {
            var item: CardElement = this._items[i];

            result = result.concat(item.getAllInputs());
        }

        return result;
    }

    renderSpeech(): string {
        if (this.speak != null) {
            return this.speak;
        }

        // render each item
        let speak = null;

        if (this._items.length > 0) {
            speak = '';

            for (var i = 0; i < this._items.length; i++) {
                var result = this._items[i].renderSpeech();

                if (result) {
                    speak += result;
                }
            }
        }

        return speak;
    }
}

export class Container extends ContainerBase {
    protected getBackgroundColor(): string {
        return this.style == "normal" ? hostConfiguration.container.normal.backgroundColor : hostConfiguration.container.emphasis.backgroundColor;
    }

    protected internalRender(): HTMLElement {
        var renderedContainer = super.internalRender();

        var styleDefinition = this.style == "normal" ? hostConfiguration.container.normal : hostConfiguration.container.emphasis;

        if (styleDefinition.borderColor) {
            renderedContainer.style.borderColor = Utils.stringToCssColor(styleDefinition.borderColor);
        }

        if (styleDefinition.borderThickness) {
            renderedContainer.style.borderTop = styleDefinition.borderThickness.top + "px solid";
            renderedContainer.style.borderRight = styleDefinition.borderThickness.right + "px solid";
            renderedContainer.style.borderBottom = styleDefinition.borderThickness.bottom + "px solid";
            renderedContainer.style.borderLeft = styleDefinition.borderThickness.left + "px solid";
        }

        return renderedContainer;
    }

    protected get padding(): HostConfig.ISpacingDefinition {
        var styleDefinition = this.style == "normal" ? hostConfiguration.container.normal : hostConfiguration.container.emphasis;

        return styleDefinition.padding ? styleDefinition.padding : { top: 0, right: 0, bottom: 0, left: 0 };
    }

    style: Enums.ContainerStyle = "normal";    

    getJsonTypeName(): string {
        return "Container";
    }

    parse(json: any) {
        super.parse(json);

        this.style = Utils.getValueOrDefault<Enums.ContainerStyle>(json["style"], "normal");
    }
}

export class Column extends Container {
    protected get padding(): HostConfig.ISpacingDefinition {
        return { left: 0, top: 0, right: 0, bottom: 0};
    }

    protected adjustLayout(element: HTMLElement) {
        element.style.minWidth = "0";

        if (typeof this.size === "number") {
            element.style.flex = "1 1 " + this.size + "%";            
        }
        else if (this.size === "auto") {
            element.style.flex = "0 0 auto";
        }
        else {
            element.style.flex = "1 1 auto";
        }
    }

    size: number | "auto" | "stretch" = "auto";

    getJsonTypeName(): string {
        return "Column";
    }

    getDefaultSeparationDefinition(): HostConfig.ISeparationDefinition {
        return hostConfiguration.column.separation;
    }

    parse(json: any) {
        super.parse(json);

        var sizeValue = json["size"];

        if (sizeValue) {
            this.size = sizeValue;
        }
    }
}

export class ColumnSet extends CardElement {
    private _columns: Array<Column> = [];

    protected internalRender(): HTMLElement {
        if (this._columns.length > 0) {
            var element = document.createElement("div");
            element.style.display = "flex";

            var renderedColumnCount: number = 0;

            for (let i = 0; i < this._columns.length; i++) {
                var renderedColumn = this._columns[i].render();

                if (renderedColumn != null) {
                    Utils.appendChild(element, renderedColumn);

                    if (this._columns.length > 1 && i < this._columns.length - 1 && this._columns[i + 1].separation != "none") {
                        var separationDefinition = this._columns[i + 1].separation == "default" ? this._columns[i + 1].getDefaultSeparationDefinition() : hostConfiguration.strongSeparation;

                        if (separationDefinition) {
                            var separator = Utils.renderSeparation(separationDefinition, "horizontal");
                            separator.style.flex = "0 0 auto";

                            Utils.appendChild(element, separator);
                        }
                    }

                    renderedColumnCount++;
                }
            }

            return renderedColumnCount > 0 ? element : null;
        }
        else {
            return null;
        }
    }

    getJsonTypeName(): string {
        return "ColumnSet";
    }

    getDefaultSeparationDefinition(): HostConfig.ISeparationDefinition {
        return hostConfiguration.columnSet.separation;
    }

    parse(json: any) {
        super.parse(json);
        
        if (json["columns"] != null) {
            let jsonColumns = json["columns"] as Array<any>;

            for (let i = 0; i < jsonColumns.length; i++) {
                var column = new Column();

                column.parse(jsonColumns[i]);

                this.addColumn(column);
            }
        }
    }

    addColumn(column: Column) {
        if (!column.parent) {
            this._columns.push(column);

            invokeSetParent(column, this);
        }
        else {
            throw new Error("This column already belongs to another ColumnSet.");
        }
    }

    renderSpeech(): string {
        if (this.speak != null) {
            return this.speak;
        }

        // render each item
        let speak = '';

        if (this._columns.length > 0) {
            for (var i = 0; i < this._columns.length; i++) {
                speak += this._columns[i].renderSpeech();
            }
        }

        return speak;
    }
}

export interface IVersion {
    major: number;
    minor: number;
}

function raiseExecuteActionEvent(action: ExternalAction) {
    if (AdaptiveCard.onExecuteAction != null) {
        action.prepare(action.parent.getRootElement().getAllInputs());

        AdaptiveCard.onExecuteAction(action);
    }
}

function raiseShowPopupCardEvent(action: ShowCardAction) {
    if (AdaptiveCard.onShowPopupCard != null) {
        AdaptiveCard.onShowPopupCard(action);
    }
}

function raiseParseError(error: IValidationError) {
    if (AdaptiveCard.onParseError != null) {
        AdaptiveCard.onParseError(error);
    }
}

interface ITypeRegistration<T> {
    typeName: string,
    createInstance: () => T;
}

export class TypeRegistry<T> {
    private _items: Array<ITypeRegistration<T>> = [];

    private findTypeRegistration(typeName: string): ITypeRegistration<T> {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].typeName === typeName) {
                return this._items[i];
            }
        }

        return null;
    }

    clear() {
        this._items = [];
    }

    registerType(typeName: string, createInstance: () => T) {
        var registrationInfo = this.findTypeRegistration(typeName);

        if (registrationInfo != null) {
            registrationInfo.createInstance = createInstance;
        }
        else {
            registrationInfo = {
                typeName: typeName,
                createInstance: createInstance
            }

            this._items.push(registrationInfo);
        }
    }

    unregisterType(typeName: string) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].typeName === typeName) {                
                this._items = this._items.splice(i, 1);

                return;
            }
        }
    }

    createInstance(typeName: string): T {
        var registrationInfo = this.findTypeRegistration(typeName);

        return registrationInfo ? registrationInfo.createInstance() : null;
    }
}

export abstract class ContainerWithActions extends ContainerBase {
    private _actionCollection: ActionCollection;

    protected internalRender(): HTMLElement {
        super.internalRender();

        var renderedActions = this._actionCollection.render();

        if (renderedActions) {
            Utils.appendChild(this._element, Utils.renderSeparation(hostConfiguration.actions.separation, "vertical"));
            Utils.appendChild(this._element, renderedActions);
        }

        return this._element.children.length > 0 ? this._element : null;        
    }

    constructor() {
        super();

        this._actionCollection = new ActionCollection(this);
        this._actionCollection.onHideActionCardPane = () => { this.showBottomSpacer(null) };
        this._actionCollection.onShowActionCardPane = (action: ShowCardAction) => { this.hideBottomSpacer(null) };
    }

    parse(json: any, itemsCollectionPropertyName: string = "items") {
        super.parse(json, itemsCollectionPropertyName);

        if (json["actions"] != undefined) {
            var jsonActions = json["actions"] as Array<any>;

            for (var i = 0; i < jsonActions.length; i++) {
                var action = Action.createAction(jsonActions[i]);

                if (action != null) {
                    this.addAction(action);
                }
            }
        }
    }

    isLastItem(item: CardElement): boolean {
        return super.isLastItem(item) && this._actionCollection.items.length == 0;
    }

    addAction(action: Action) {
        this._actionCollection.addAction(action);
    }

    getAllInputs(): Array<Input> {
        return super.getAllInputs().concat(this._actionCollection.getAllInputs());
    }
}

export class AdaptiveCard extends ContainerWithActions {
    private static currentVersion: IVersion = { major: 1, minor: 0 };

    static elementTypeRegistry = new TypeRegistry<CardElement>();
    static actionTypeRegistry = new TypeRegistry<Action>();

    static onExecuteAction: (action: ExternalAction) => void = null;
    static onShowPopupCard: (action: ShowCardAction) => void = null;
    static onParseError: (error: IValidationError) => void = null;

    static initialize() {
        AdaptiveCard.elementTypeRegistry.clear();

        AdaptiveCard.elementTypeRegistry.registerType("Container", () => { return new Container(); });
        AdaptiveCard.elementTypeRegistry.registerType("TextBlock", () => { return new TextBlock(); });
        AdaptiveCard.elementTypeRegistry.registerType("Image", () => { return new Image(); });
        AdaptiveCard.elementTypeRegistry.registerType("ImageSet", () => { return new ImageSet(); });
        AdaptiveCard.elementTypeRegistry.registerType("FactSet", () => { return new FactSet(); });
        AdaptiveCard.elementTypeRegistry.registerType("ColumnSet", () => { return new ColumnSet(); });
        AdaptiveCard.elementTypeRegistry.registerType("ActionSet", () => { return new ActionSet(); });
        AdaptiveCard.elementTypeRegistry.registerType("Input.Text", () => { return new TextInput(); });
        AdaptiveCard.elementTypeRegistry.registerType("Input.Date", () => { return new DateInput(); });
        AdaptiveCard.elementTypeRegistry.registerType("Input.Time", () => { return new TimeInput(); });
        AdaptiveCard.elementTypeRegistry.registerType("Input.Number", () => { return new NumberInput(); });
        AdaptiveCard.elementTypeRegistry.registerType("Input.ChoiceSet", () => { return new ChoiceSetInput(); });
        AdaptiveCard.elementTypeRegistry.registerType("Input.Toggle", () => { return new ToggleInput(); });

        AdaptiveCard.actionTypeRegistry.clear();

        AdaptiveCard.actionTypeRegistry.registerType("Action.Http", () => { return new HttpAction(); });
        AdaptiveCard.actionTypeRegistry.registerType("Action.OpenUrl", () => { return new OpenUrlAction(); });
        AdaptiveCard.actionTypeRegistry.registerType("Action.Submit", () => { return new SubmitAction(); });
        AdaptiveCard.actionTypeRegistry.registerType("Action.ShowCard", () => { return new ShowCardAction(); });
    }

    private isVersionSupported(): boolean {
        var unsupportedVersion: boolean =
            (AdaptiveCard.currentVersion.major < this.minVersion.major) ||
            (AdaptiveCard.currentVersion.major == this.minVersion.major && AdaptiveCard.currentVersion.minor < this.minVersion.minor);

        return !unsupportedVersion;
    }

    private _cardTypeName: string;
    
    protected getBackgroundColor(): string {
        return hostConfiguration.adaptiveCard.backgroundColor;
    }

    protected get padding(): HostConfig.ISpacingDefinition {
        return hostConfiguration.adaptiveCard.padding;
    }

    minVersion: IVersion = { major: 1, minor: 0 };
    fallbackText: string;

    getJsonTypeName(): string {
        return "AdaptiveCard";
    }

    validate(): Array<IValidationError> {
        var result: Array<IValidationError> = [];

        if (this._cardTypeName != "AdaptiveCard") {
            result.push(
                {
                    error: Enums.ValidationError.MissingCardType,
                    message: "Invalid or missing card type. Make sure the card's type property is set to \"AdaptiveCard\"."
                });
        }

        if (!this.isVersionSupported()) {
            result.push(
                {
                    error: Enums.ValidationError.UnsupportedCardVersion,
                    message: "The specified card version is not supported."
                });
        }

        return result.concat(super.validate());
    }

    parse(json: any) {
        this._cardTypeName = json["type"];

        var minVersion = json["minVersion"];
        var regEx = /(\d+).(\d+)/gi;
        var matches = regEx.exec(minVersion);

        if (matches != null && matches.length == 3) {
            this.minVersion.major = parseInt(matches[1]);
            this.minVersion.minor = parseInt(matches[2]);
        }

        this.fallbackText = json["fallbackText"];

        super.parse(json, "body");
    }

    render(): HTMLElement {
        var renderedCard: HTMLElement;

        if (!this.isVersionSupported()) {
            renderedCard = document.createElement("div");
            renderedCard.innerHTML = this.fallbackText ? this.fallbackText : "The specified card version is not supported.";

            return renderedCard;
        }
        else {
            return super.render();
        }
    }
}

// This calls acts as a static constructor (see https://github.com/Microsoft/TypeScript/issues/265)
AdaptiveCard.initialize();

class InlineAdaptiveCard extends AdaptiveCard {
    protected get padding(): HostConfig.ISpacingDefinition {
        return hostConfiguration.actions.showCard.padding;
    }

    protected getBackgroundColor(): string {
        return null;
    }

    getForbiddenActionTypes(): Array<any> {
        return [ ShowCardAction ];
    }
}

var defaultConfiguration: HostConfig.IHostConfiguration = {
    supportsInteractivity: true,
    strongSeparation: {
        spacing: 40,
        lineThickness: 1,
        lineColor: "#EEEEEE"
    },
    fontFamily: "Segoe UI",
    fontSizes: {
        small: 8,
        normal: 10,
        medium: 12,
        large: 14,
        extraLarge: 16
    },
    fontWeights: {
        lighter: 200,
        normal: 400,
        bolder: 600
    },
    colors: {
        dark: {
            normal: "#0000FF",
            subtle: "#222222"
        },
        light: {
            normal: "#FFFFFF",
            subtle: "#DDDDDD"
        },
        accent: {
            normal: "#0000FF",
            subtle: "#0000DD" 
        },
        attention: {
            normal: "#FF6600",
            subtle: "#DD4400"
        },
        good: {
            normal: "#00FF00",
            subtle: "#00DD00"
        },
        warning: {
            normal: "#FF0000",
            subtle: "#DD0000"
        }
    },
    imageSizes: {
        small: 40,
        medium: 80,
        large: 160
    },
    actions: {
        maxActions: 5,
        separation: {
            spacing: 20
        },
        buttonSpacing: 20,
        stretch: false,
        showCard: {
            actionMode: "inlineEdgeToEdge",
            inlineCardSpacing: 16,
            backgroundColor: "#22000000",
            padding: {
                top: 16,
                right: 16,
                bottom: 16,
                left: 16
            }
        },
        actionsOrientation: "horizontal",
        actionAlignment: "left"
    },
    adaptiveCard: {
        backgroundColor: "#00000000",
        padding: {
            left: 20,
            top: 20,
            right: 20,
            bottom: 20
        }
    },
    container: {
        separation: {
            spacing: 20
        },
        normal: {
        },
        emphasis: {
            backgroundColor: "#EEEEEE",
            borderColor: "#AAAAAA",
            borderThickness: {
                top: 1,
                right: 1,
                bottom: 1,
                left: 1
            },
            padding: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        }
    },
    textBlock: {
        color: "dark",
        separations: {
            small: {
                spacing: 20,
            },
            normal: {
                spacing: 20
            },
            medium: {
                spacing: 20
            },
            large: {
                spacing: 20
            },
            extraLarge: {
                spacing: 20
            }
        }
    },
    image: {
        size: "medium",
        separation: {
            spacing: 20
        }
    },
    imageSet: {
        imageSize: "medium",
        separation: {
            spacing: 20
        }
    },
    factSet: {
        separation: {
            spacing: 20
        },
        title: {
            color: "dark",
            size: "normal",
            isSubtle: false,
            weight: "bolder"
        },
        value: {
            color: "dark",
            size: "normal",
            isSubtle: false,
            weight: "normal"
        },
        spacing: 10
    },
    input: {
        separation: {
            spacing: 20
        }
    },
    columnSet: {
        separation: {
            spacing: 20
        }
    },
    column: {
        separation: {
            spacing: 20
        }
    }
}

var hostConfiguration = defaultConfiguration;

export function setConfiguration(configuration: HostConfig.IHostConfiguration) {
    hostConfiguration = configuration;
}

export function resetConfiguration() {
    hostConfiguration = defaultConfiguration;
}