// pretty-print-json ~ MIT License

export default function prettyPrintJsontoHtml(thing: object) {
    const findName = /"([\w$]+)": |(.*): /;
    const htmlEntities = (text: string) => text
        // Makes text displayable in browsers.
        .replace(/&/g, '&amp;')
        .replace(/\\"/g, '&bsol;&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const spanTag = (type: string, display: string) =>
        // Creates HTML to display a value like: like "<span class=json-boolean>true</span>"
        display ? '<span class=json-' + type + '>' + display + '</span>' : '';
    const buildValueHtml = (value: string) => {
        // Analyzes a value and returns HTML like: "<span class=json-number>3.1415</span>"
        const strType = /^"/.test(value) && 'string';
        const boolType = ['true', 'false'].includes(value) && 'boolean';
        const nullType = value === 'null' && 'null';
        const type = boolType || nullType || strType || 'number';
        const urlRegex = /https?:\/\/[^\s"]+/g;
        const makeLink = (link: string) => '<a class=json-link href="' + link + '">' + link + '</a>';
        const display = value.replace(urlRegex, makeLink);
        return spanTag(type, display);
    };
    const replacer = (match: string, p1: string, p2: string, p3: string, p4: string) => {
        // Converts the four parenthesized capture groups (indent, key, value, end) into HTML.
        const part = { indent: p1, key: p2, value: p3, end: p4 };
        const indentHtml = part.indent || '';
        const keyName = part.key && part.key.replace(findName, '$1$2');
        const keyHtml = part.key ? spanTag('key', keyName) + spanTag('mark', ': ') : '';
        const valueHtml = part.value ? buildValueHtml(part.value) : '';
        const endHtml = spanTag('mark', part.end);
        return indentHtml + keyHtml + valueHtml + endHtml;
    };
    const jsonLine = /^( *)("[^"]+": )?("[^"]*"|[\w.+-]*)?([{}[\],]*)?$/mg;
    // Regex parses each line of the JSON string into four parts:
    //    Capture group       Part        Description                  Example
    //    ------------------  ----------  ---------------------------  --------------------
    //    ( *)                p1: indent  Spaces for indentation       '   '
    //    ("[^"]+": )         p2: key     Key name                     '"active": '
    //    ("[^"]*"|[\w.+-]*)  p3: value   Key value                    'true'
    //    ([{}[\],]*)         p4: end     Line termination characters  ','
    // For example, '   "active": true,' is parsed into: ['   ', '"active": ', 'true', ',']
    const json = JSON.stringify(thing, null, 2) || 'undefined';
    const tmp = json.slice(2, -2) // remove {}
    return htmlEntities(tmp).replace(jsonLine, replacer);
}
