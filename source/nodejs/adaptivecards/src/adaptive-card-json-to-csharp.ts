const indent = '    ';
let assignClass = (className:string) => (json:object, lineSeparator:string):string => {
    let spec = types[className];
    let entries = Object.keys(spec)
        .filter(key => key != 'type' && !!json[key])
        .map(key => `${indent}${capitalize(key)} = ${spec[key](json[key], lineSeparator + indent)},`);

    if (spec.type)
    {
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
            entries.push(`${indent}ExtensionData = ${dictionary(rest, lineSeparator + indent)}`);
    }

    return [
        `new ${className} {`,
        ...entries,
        '}'
    ].join(lineSeparator);
};
let typed = (json:{type:string}, lineSeparator:string) => assignClass(typeToClass[json.type])(json, lineSeparator);
let primitive = JSON.stringify;
let list = (className:string, convert:(item:any, lineSeparator:string)=>string) =>
    (items:any[], lineSeparator:string) =>
        [
            '{',//`new List<${className}> {`,
            ...items.map(item => `${indent}${convert(item, lineSeparator + indent)},`),
            '}'
        ].join(lineSeparator);
let capitalize = (name:string) => name.charAt(0).toUpperCase() + name.slice(1);
let enumeration = (enumType:string) => (value:string) => `${enumType}.${capitalize(value)}`;
let version = (v: {major:number, minor:number} | string) => primitive(typeof v == 'string' ? v : `${v.major}.${v.minor}`);
let jToken = (json:object, lineSeparator:string) => {
    if (typeof json != 'object')
        return primitive(json);
    
    return [
        'JToken.FromObject(new {',
        ...Object.keys(json)
            .map(key => `${indent}${key} = ${primitive(json[key])},`),
        '}'
    ].join(lineSeparator);
};
let dictionary = (json:object, lineSeparator:string) => {
    return [
        '{',//'new Dictionary<string, JToken> {',
        ...Object.keys(json)
            .map(key => `${indent}\{ ${primitive(key)}, ${jToken(json[key], lineSeparator + indent)} \},`),
        '}'
    ].join(lineSeparator);
};

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
};
let Container = {
    ...CardElement,
    type: "Container",
    backgroundImage: jToken,
    style: primitive,
    verticalContentAlignment: enumeration('VerticalAlignment'),
    selectAction: typed,
    items: list('CardElement', typed),
};
let types = {
    CardElement,
    Container,
    Input,
    SubmitAction: {
        type: "Action.Submit",
        data: jToken,
        id: primitive,
        title: primitive,
    },
    OpenUrlAction: {
        type: "Action.OpenUrl",
        url: primitive,
        id: primitive,
        title: primitive,
    },
    ShowCardAction: {
        type: "Action.ShowCard",
        card: typed,
        id: primitive,
        title: primitive,
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
        style: enumeration('ImageStyle'),
        url: primitive,
    },
    ImageSet: {
        ...CardElement,
        type: "ImageSet",
        images: list('Image', typed),
        size: enumeration('ImageSize'),
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
    },
    ChoiceSet: {
        ...Input,
        type: "Input.ChoiceSet",
        isMultiSelect: primitive,
        style: enumeration('ChoiceInputStyle'),
        placeholder: primitive,
        choices: list('Choice', assignClass('Choice'))
    },
    AdaptiveCard: {
        ...CardElement,
        type: "AdaptiveCard",
        version: version,
        backgroundImage: jToken,
        body: list('CardElement', typed),
        actions: list('ActionBase', typed),
        speak: primitive,
    }
};
let typeToClass = {};
for (let className in types)
{
    let spec = types[className];
    typeToClass[spec.type] = className;
}

export function adaptiveCardJsonToCSharp(json:any)
{
    return typed(json, '\n');
}
