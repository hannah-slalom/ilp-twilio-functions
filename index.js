const dotenv = require('dotenv');
dotenv.config();

const { google } = require('googleapis');
const { getEventResourceValues, getEventResourceForNewHeaders, checkForNewHeaders } = require("./helper.js");
const sheets = google.sheets('v4');
const sheetId = "14vtJOe3FDPnI94Eo2sqElLhovLn3fO5jkHcCJ14g0cQ";


const c_email = process.env.CLIENT_EMAIL;
const key = process.env.PRIVATE_KEY.replace(/\\n/gm, "\n")
const private_key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----\n`;

// Define the required scopes.
var scopes = [
  "https://www.googleapis.com/auth/spreadsheets"
];

var jwtClient = new google.auth.JWT(
  c_email,
  null,
  private_key,
  scopes
);

const sampleEvent = {
  question_1: "my answer to q1",
  question_2: "my answer to q2",
  question_4: "my answer to q4",
  question_5: "my answer to q5"
};

async function authorizeAndRead() {
  try {
    jwtClient.authorize(async (error, tokens) => {
      if (error) {
        console.log("Error making request to generate access token:", error);
        throw new Error("error");
      } else if (tokens.access_token === null) {
        console.log("Provided service account does not have permission to generate access tokens");
        throw new Error("error");
      } else {
        var accessToken = tokens.access_token;
        console.log("you've been authorized", accessToken);

        let hResult;
        let headers = [];
        hResult = await sheets.spreadsheets.values.get({
          access_token: accessToken,
          spreadsheetId: sheetId,
          range: ["A1:Z1"]
        });

        const data = hResult.data;
        headers = hResult.data.values[0];
        console.log("headers", data, headers);

        // Add new headers if appropriate
        const newHeaders = checkForNewHeaders(headers, sampleEvent);
        if (newHeaders.length > 0) {
          startRangeForNewHeaders = `H${1}`;
          endRangeForNewHeaders = `G${1}`;

          console.log(startRangeForNewHeaders, " start");
          const writeResults = await sheets.spreadsheets.values.update({
            access_token: accessToken,
            spreadsheetId: sheetId,
            valueInputOption: "RAW",
            range: ["H1"],
            requestBody: {
              majorDimension: "ROWS",
              values:  [newHeaders],
            }
          });

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

authorizeAndRead();