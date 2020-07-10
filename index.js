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


async function handler(event) {
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

        headers = hResult.data.values[0];
        // console.log("headers", data, headers);

        await sheets.spreadsheets.values.append({
          access_token: accessToken,
          spreadsheetId: sheetId,
          range: ["A1"],
          resource: getEventResourceValues(headers, event),
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS"
        });
      }
    })
  } catch (error) {
    console.log("error", error);
    callback(null, error);
  }
}


// Send batch requests to google sheet
const testBatch = (n) => {
  const event = {
    q1: "my answer to q1",
    q2: "my answer to q2",
    q4: "my answer to q4",
    q5: "my answer to q5",
  };

  const promArr = [];
  // Create n requests to write to the google sheet
  for(let i = 0; i < n; i++) {
    console.log("number", i);
    event.q1 = `${i}`;
    promArr.push(handler({...event}));
  }
  try {
    return Promise.all(promArr);
  } catch (error) {
    console.log("error from promise all", error);
  }
}

testBatch(100);