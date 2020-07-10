const XLSX = require('xlsx');
const fs = require("fs");

let workbook = XLSX.readFile(`${__dirname}/excel_dictionary.xlsx`);

const sheet = workbook.SheetNames[0];

let worksheet = workbook.Sheets[workbook.SheetNames[0]];
console.log(worksheet);
let jsonArr = XLSX.utils.sheet_to_json(workbook);
console.log(jsonArr);


// fs.writeFile("./test-json-output.json", jsonArr, (error) => {
//     if (error) {
//         console.log("error", error);
//     }
// });


// const xlsx = require('node-xlsx');

// // Parse a buffer
// // const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(`${__dirname}/myFile.xlsx`));
// // Parse a file
// const workSheetsFromFile = xlsx.parse(`${__dirname}/excel_dictionary.xlsx`);

// console.log(workSheetsFromFile[0].data[1]);

// const buildJson = (dataArr) => {
//     const obj = {};
//     dataArr.forEach((row) => {
//         if (obj[row[0]]) {

//         } else {
//             obj[row[0]] = {

//             }
//         }
//     })
// }
