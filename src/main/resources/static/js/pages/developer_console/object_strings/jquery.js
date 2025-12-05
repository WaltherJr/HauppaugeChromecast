
export function printElementDataAttributes(dataAttributes) {
    let str = '<ul class="element-data-attributes">';
    for (const key in dataAttributes) {
        str += `<li>${key}=${dataAttributes[key]}</li>`;
    }
    return str + '</ul>';
}

export function print(value) {
    const htmlOutput = Array.from(value).map(element => {
        let str = `<li>${element.tagName.toLowerCase()}`; // TODO: can spawn runtime error with #text-nodes

        if (element.attributes.id) {
            str += `#${element.attributes.id.value}`;
        }
        if (Object.keys(element.dataset).length > 0) {
            str += printElementDataAttributes(element.dataset);
        }

        return str + '</li>';
    }).join('');

    return `<ul>${htmlOutput}</ul>`;
}
