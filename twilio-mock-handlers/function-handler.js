var {google} = require("googleapis");
const sheets = google.sheets('v4');
const sheetId = "14vtJOe3FDPnI94Eo2sqElLhovLn3fO5jkHcCJ14g0cQ";

const c_email = "twiliotest@sls-notes-app-247017.iam.gserviceaccount.com"
// Define the required scopes.
var scopes = [
  "https://www.googleapis.com/auth/spreadsheets"
];

var jwtClient = new google.auth.JWT(
  c_email,
  null,
  "-----BEGIN PRIVATE KEY-----...\n-----END PRIVATE KEY-----\n",
  scopes
);

const getEventResourceValues = (headers, eventData) => {
    const eventValues = headers.map((header, index) => {
        if (index === 0) {
            // push Id
            return "myId-123";
        } else if (eventData[header]) {
            // push the answer in for the question if it already has a header
            return eventData[header];
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

console.log("asked for token, asking to authorize");

function twilioTest(context, event, callback) {
    try {
    const eventData = {
        [`${event.intro}`]: event.intro_answer,
        [`${event.q2}`]: event.q2_answer,
        [`${event.q3}`]: event.q3_answer,
    }
    jwtClient.authorize( (error, tokens) => {
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

        sheets.spreadsheets.values.get({
          access_token: accessToken,
          spreadsheetId: sheetId,
          range: ["A1:Z1"]
        })
        .then((hResult) => {
            const data = hResult.data;
            headers = hResult.data.values[0];
            console.log("headers", data, headers);

            return sheets.spreadsheets.values.append({
            access_token: accessToken,
            spreadsheetId: sheetId,
            range: ["A1"],
            resource: getEventResourceValues(headers, eventData),
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS"
            })
        })
        .then((result) => {
            console.log('cells updated.', result.updatedCells);
        })
      }
    })
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}

const sampleEvent = {
    "intro": "intro",
    "intro_answer": "intro answer",
    "q2": "q2",
    "q2_answer": "answer 2",
    "q3": "q3",
    "q3_answer": "answer 3"
}
