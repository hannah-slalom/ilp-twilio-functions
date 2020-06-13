const checkForNewHeaders = (headers, sampleEvent) => {
    const newHeaders = [];
    Object.keys(sampleEvent).forEach((key) => {
        if (!headers.includes(key)) {
            newHeaders.push(key);
        }
    })
    console.log(newHeaders.length > 0 ? "found new headers" : "no new headers", newHeaders);
    return newHeaders;
}

const getEventResourceForNewHeaders = (newHeaders) => {
    const resource = {
        values: [newHeaders],
    };
    console.log("resources", resource);
    return resource;
}

const getEventResourceValues = (headers, sampleEvent) => {
    const eventValues = headers.map((header, index) => {
        if (index === 0) {
            // push Id
            return "myId-123";
        } else if (sampleEvent[header]) {
            // push the answer in for the question if it already has a header
            return sampleEvent[header];
        } else {
            // If the question wasn't answer, return no data
            return "No Data";
        }
    })

    const resource = {
        values: [eventValues],
    };
    console.log("resources", resource);
    return resource;
}

exports.getEventResourceValues = getEventResourceValues;
exports.checkForNewHeaders = checkForNewHeaders;
exports.getEventResourceForNewHeaders = getEventResourceForNewHeaders;