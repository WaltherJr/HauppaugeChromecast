
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

function cssFloatToInteger(cssFloatString) {
    return parseFloat(cssFloatString) * 1000;
}

function getText(url) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function getJSON(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function putJSON(url, body) {
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function getFormattedDate(dateDelta) {
    const date = new Date();
    date.setDate(new Date().getDate() + dateDelta);
    return date.toISOString().split('T')[0];
}
