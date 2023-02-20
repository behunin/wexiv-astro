// pretty-print-json ~ MIT License

const prettyPrintJson = {

    version: '~~~version~~~',

    toHtml(thing, options) {
        const defaults = { indent: 3, lineNumbers: false, linkUrls: true, quoteKeys: false };
        const settings = { ...defaults, ...options };
        const htmlEntities = (text) => text
            // Makes text displayable in browsers.
            .replace(/&/g, '&amp;')
            .replace(/\\"/g, '&bsol;&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        const spanTag = (type, display) =>
            // Creates HTML to display a value like: like "<span class=json-boolean>true</span>"
            display ? '<span class=json-' + type + '>' + display + '</span>' : '';
        const buildValueHtml = (value) => {
            // Analyzes a value and returns HTML like: "<span class=json-number>3.1415</span>"
            const strType = /^"/.test(value) && 'string';
            const boolType = ['true', 'false'].includes(value) && 'boolean';
            const nullType = value === 'null' && 'null';
            const type = boolType || nullType || strType || 'number';
            const urlRegex = /https?:\/\/[^\s"]+/g;
            const makeLink = (link) => '<a class=json-link href="' + link + '">' + link + '</a>';
            const display = strType && settings.linkUrls ? value.replace(urlRegex, makeLink) : value;
            return spanTag(type, display);
        };
        const replacer = (match, p1, p2, p3, p4) => {
            // Converts the four parenthesized capture groups (indent, key, value, end) into HTML.
            const part = { indent: p1, key: p2, value: p3, end: p4 };
            const findName = settings.quoteKeys ? /(.*)(): / : /"([\w$]+)": |(.*): /;
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
        const json = JSON.stringify(thing, null, settings.indent) || 'undefined';
        const tmp = json.slice(2, -2) // remove {}
        const html = htmlEntities(tmp).replace(jsonLine, replacer);
        const makeLine = (line) => `   <li>${line}</li>`;
        const addLineNumbers = (html) =>  //wrap html in an <ol> tag
            ['<ol class=json-lines>', ...html.split('\n').map(makeLine), '</ol>'].join('\n');
        return settings.lineNumbers ? addLineNumbers(html) : html;
    },

};

export { prettyPrintJson };
