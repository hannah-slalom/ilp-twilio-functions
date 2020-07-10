async function authorizeAndRead() {
  try {
    jwtClient.authorize(async (error, tokens) => {
      if (error) {
        throw new Error("erError making request to generate access token:", error);
      } else if (tokens.access_token === null) {
        throw new Error("Provided service account does not have permission to generate access tokens");
      } else {
        var accessToken = tokens.access_token;
        console.log("you've been authorized", accessToken);

        let hResult;
        let headers = [];
        sheets.spreadsheets.values.get({
          access_token: accessToken,
          spreadsheetId: sheetId,
          range: ["A1:Z1"]
        })
          .then((hResult) => {
            const data = hResult.data;
            headers = hResult.data.values[0];
            console.log("headers", data, headers);

            // Add new headers if appropriate
            const newHeaders = checkForNewHeaders(headers, sampleEvent);
            if (newHeaders.length > 0) {
              startRangeForNewHeaders = `H${1}`;
              endRangeForNewHeaders = `G${1}`;

              console.log(startRangeForNewHeaders, " start");
              return sheets.spreadsheets.values.update({
                access_token: accessToken,
                spreadsheetId: sheetId,
                valueInputOption: "RAW",
                range: ["H1"],
                requestBody: {
                  majorDimension: "ROWS",
                  values: [newHeaders],
                }
              })
              .then(() => {
                return sheets.spreadsheets.values.get({
                  access_token: accessToken,
                  spreadsheetId: sheetId,
                  range: ["A1:Z1"]
                })
              })
            } else {
              return hResult
            }
          })
          .then((hResult) => {
            return sheets.spreadsheets.values.get({
              access_token: accessToken,
              spreadsheetId: sheetId,
              range: ["A1:Z1"]
            })
          })


        hResult = await sheets.spreadsheets.values.get({
          access_token: accessToken,
          spreadsheetId: sheetId,
          range: ["A1:Z1"]
        });

        headers = hResult.data.values[0];
        console.log("updated headers", headers);
      }

      const writeResults = await sheets.spreadsheets.values.append({
        access_token: accessToken,
        spreadsheetId: sheetId,
        range: ["A1"],
        resource: getEventResourceValues(headers, sampleEvent),
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS"
      });
      console.log('cells updated.', result.updatedCells);
    }
      })
  /* Your code goes here */
} catch (error) {
  console.log(error);
  callback(null, error);
}
  }