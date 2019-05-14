type Converter = (value:any, lineSeparator?:string) => string;
const indent = '    ';
let capitalize = (name:string):string => name.charAt(0).toUpperCase() + name.slice(1);
let enumeration = (enumType:string):Converter => (value:string) => `${enumType}.${capitalize(value)}`;
let typed:Converter = (json:{type:string}, lineSeparator:string) => {
	let type = json && json.type;
	let className = typeNameToClassName[type] || type;
	if (className)
		return assignClass(className)(json, lineSeparator);
	return untyped(json, lineSeparator);
}
let assignClass = (className:keyof typeof types):Converter => (json:object, lineSeparator:string):string => {
    // if class not found, output a TypedElement to prevent data loss or crash
    let {type, ...spec} = types[className] || TypedElement;
	if (type == primitive)
	{
		spec = TypedElement;
		json = {...json, type: className};
		className = "TypedElement";
	}
    
    // get specified props from json
    let entries = Object.keys(spec)
        .filter(key => json[key] != null)
        .map(key => `${indent}${capitalize(key)} = ${spec[key](json[key], lineSeparator + indent)},`);

    // get extension data (unspecified props)
    let rest;
    for (let key in json)
    {
        if (key != 'type' && !spec[key])
        {
            rest = rest || {};
            rest[key] = json[key];
        }
    }
    if (rest)
        entries.push(`${indent}ExtensionData = ${dictionary("JToken", untyped)(rest, lineSeparator + indent)}`);

    return [
        `new ${className}`,
        '{',
        ...entries,
        '}'
    ].join(lineSeparator);
};
let untyped:Converter = (json:object, lineSeparator:string) => {
    if (json == null || typeof json != 'object')
        return primitive(json);
    
    return [
        'JToken.FromObject(new',
        `${indent}{`,
        ...Object.keys(json)
            .map(key => `${indent}${indent}${key} = ${typed(json[key], lineSeparator + indent + indent)},`),
        `${indent}})`
    ].join(lineSeparator);
};
let primitive:Converter = (value:any, lineSeparator?:string) => JSON.stringify(value);
let version:Converter = (v: {major:number, minor:number} | string) => primitive(typeof v == 'string' ? v : `${v.major}.${v.minor}`);
let list = (className:string, convert:Converter):Converter =>
    (items:any[], lineSeparator:string) =>
        [
            `new List<${className}>`,
            '{',
            ...items.map(item => `${indent}${convert(item, lineSeparator + indent)},`),
            '}'
        ].join(lineSeparator);
let dictionary = (className:string, convert:Converter):Converter =>
    (json:object, lineSeparator:string) => {
        if (json == null)
            return "null";
        return [
            `new Dictionary<string, ${className}>`,
            '{',
            ...Object.keys(json)
                .map(key => `${indent}\{ ${primitive(key)}, ${convert(json[key], lineSeparator + indent)} \},`),
            '}'
        ].join(lineSeparator);
    };

type Spec = { type?:string } & { [key:string]:Converter };
type SpecShim = { [key:string]:Converter|string };
// base classes are defined first because they are extended in types dictionary below
let TypedElement = {type: primitive};
let CardElement = {
    id: primitive,
    speak: primitive,
    horizontalAlignment: enumeration('HorizontalAlignment'),
    spacing: enumeration('Spacing'),
    separator: primitive,
    height: primitive,
};
let Input = {
    ...CardElement,
    id: primitive,
    value: primitive,
    isRequired: primitive,
};
let Container = {
    ...CardElement,
    type: "Container",
    backgroundImage: untyped,
    style: primitive,
    verticalContentAlignment: enumeration('VerticalContentAlignment'),
    selectAction: typed,
    items: list('CardElement', typed),
};
let ActionBase = {
    id: primitive,
    title: primitive,
    speak: primitive,
    isPrimary: primitive,
    actionContext: assignClass('ActionContext'),
};
let types:{[className:string]:Spec} = {
    AdaptiveCard: {
        ...CardElement,
        type: "AdaptiveCard",
        id: primitive,
        correlationId: primitive,
        originator: primitive,
        hideOriginalBody: primitive,
        enableBodyToggling: primitive,
        rtl: primitive,
        expectedActors: list('string', primitive),
        messageCardContext: assignClass('MessageCardContext'),
        resources: untyped,
        speak: primitive,
        backgroundImage: untyped,
        version: version,
        minVersion: primitive,
        fallbackText: primitive,
        theme: primitive,
        padding: untyped,
        body: list('CardElement', typed),
        actions: list('ActionBase', typed),
        autoInvokeAction: typed,
        autoInvokeOptions: assignClass('SwiftAutoInvokeOptions'),
        requiredHostCapabilities: list('string', primitive),
        requires: dictionary('string', primitive),
    },
    ActionContext: {
        actionButtonId: primitive,
    },
    MessageCardContext: {
        correlationId: primitive,
        messageCardSource: primitive,
        oamAppName: primitive,
        messageCardStampingSource: primitive,
        isRefreshCard: primitive,
        isInsightShown: primitive,
        isBodyHidden: primitive,
        insightProviderRendered: primitive,
        stampingCorrelationVector: primitive,
        transactionContext: primitive,
    },
    SwiftAutoInvokeOptions: {
        showCardOnFailure: primitive
    },
    ActionBase,
    CardElement,
    Container,
    Input,
    ActionSet: {
        ...CardElement,
		type: "ActionSet",
        actions: list('ActionBase', assignClass('ActionBase'))
    },
    DisplayAppointmentFormAction: {
        ...ActionBase,
        type: "Action.DisplayAppointmentForm",
        ItemId: primitive,
    },
    DisplayMessageFormAction: {
        ...ActionBase,
        type: "Action.DisplayMessageForm",
        ItemId: primitive,
    },
    HttpHeader: {
        name: primitive,
        value: primitive,
    },
    HttpAction: {
        ...ActionBase,
        type: "Action.Http",
        hideCardOnInvoke: primitive,
        method: primitive,
        url: primitive,
        headers: list('HttpHeader', assignClass('HttpHeader')),
        body: primitive,
        requiredHostCapabilities: list('string', primitive),
    },
    InvokeAddInCommandAction: {
        ...ActionBase,
        type: "Action.InvokeAddInCommand",
        AddInId: primitive,
        DesktopCommandId: primitive,
        InitializationContext: untyped,
    },
    OpenUrlAction: {
        ...ActionBase,
        type: "Action.OpenUrl",
        url: primitive,
    },
    ShowCardAction: {
        ...ActionBase,
        type: "Action.ShowCard",
        card: typed,
    },
    SubmitAction: {
        ...ActionBase,
        type: "Action.Submit",
        data: untyped,
    },
    ToggleVisibilityAction: {
        ...ActionBase,
        type: "Action.ToggleVisibility",
        targetElements: list('JToken', untyped),
    },
    TransactionAction: {
        ...ActionBase,
        type: "Action.Transaction",
        AddInId: primitive,
        InitializationContext: untyped,
    },
    BackgroundImage: {
        url: primitive,
    },
    TextBlock: {
        ...CardElement,
        type: "TextBlock",
        size: enumeration('TextSize'),
        weight: enumeration('TextWeight'),
        color: enumeration('TextColor'),
        text: primitive,
        isSubtle: primitive,
        wrap: primitive,
        maxLines: primitive,
    },
    Column: {
        ...Container,
        width: primitive,
    },
    ColumnSet: {
        ...CardElement,
        type: "ColumnSet",
        columns: list('Column', assignClass('Column')),
        selectAction: typed,
        padding: untyped,
    },
    Fact: {
        title: primitive,
        value: primitive,
        speak: primitive,
    },
    FactSet: {
        ...CardElement,
        type: "FactSet",
        facts: list('Fact', assignClass('Fact')),
    },
    Image: {
        ...CardElement,
        type: "Image",
        altText: primitive,
        selectAction: typed,
        size: enumeration('ImageSize'),
        width: primitive,
        height: primitive,
        pixelWidth: primitive,
        pixelHeight: primitive,
        style: enumeration('ImageStyle'),
        url: primitive,
        backgroundColor: primitive,
    },
    ImageSet: {
        ...CardElement,
        type: "ImageSet",
        images: list('Image', typed),
        imageSize: enumeration('ImageSize'),
        size: enumeration('ImageSize'), // needed?
    },
    DateInput: {
        ...Input,
        type: "Input.Date",
        min: primitive,
        max: primitive,
        placeholder: primitive,
    },
    TimeInput: {
        ...Input,
        type: "Input.Time",
        min: primitive,
        max: primitive,
        placeholder: primitive,
    },
    NumberInput: {
        ...Input,
        type: "Input.Number",
        min: primitive,
        max: primitive,
        placeholder: primitive,
    },
    TextInput: {
        ...Input,
        type: "Input.Text",
        isMultiline: primitive,
        maxLength: primitive,
        placeholder: primitive,
        style: enumeration('TextInputStyle'),
    },
    ToggleInput: {
        ...Input,
        type: "Input.Toggle",
        title: primitive,
        valueOn: primitive,
        valueOff: primitive,
    },
    Choice: {
        title: primitive,
        value: primitive,
        isSelected: primitive,
        speak: primitive,
    },
    ChoiceSet: {
        ...Input,
        type: "Input.ChoiceSet",
        isMultiSelect: primitive,
        style: enumeration('ChoiceInputStyle'),
        placeholder: primitive,
        choices: list('Choice', assignClass('Choice'))
    },
} as {[key:string]:SpecShim} as {[key:string]:Spec};
let typeNameToClassName = {};
for (let className in types)
{
    let spec = types[className];
    typeNameToClassName[spec.type || className] = className;
}

export function adaptiveCardJsonToCSharp(json:any)
{
    return typed(json, '\n');
}
