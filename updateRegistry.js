const { google } = require('googleapis');
const sheets = google.sheets('v4');
const { client_email, private_key } = require('./credentials.json');
const { spreadsheetId, } = require('./config.json');

const auth = new google.auth.JWT(
    client_email,
    null,
    private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

async function updateRegistry(fullName, gradeLevel, schoolId) {
    const range = 'Sheet1!A:C';

    try {
        const updatedRowIndex = await getNextEmptyRow(spreadsheetId);

        const requests = [{
            updateCells: {
                range: {
                    sheetId: 1242313362,
                    startRowIndex: updatedRowIndex,
                    endRowIndex: updatedRowIndex + 1,
                    startColumnIndex: 0,
                    endColumnIndex: 3,
                },
                rows: [{
                    values: [
                        {
                            userEnteredFormat: {
                                textFormat: {
                                    fontSize: 10,
                                    fontFamily: "Arial",
                                },
                            },
                        },
                        {
                            userEnteredFormat: {
                                textFormat: {
                                    fontSize: 10,
                                    fontFamily: "Arial",
                                },
                            },
                        },
                        {
                            userEnteredFormat: {
                                textFormat: {
                                    fontSize: 10,
                                    fontFamily: "Arial",
                                },
                            },
                        }
                    ],
                }],
                fields: 'userEnteredFormat.textFormat'
            },
        }];

        await sheets.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: { requests },
        });

        console.log('Formatting applied successfully.');


        const values = [
            [fullName, gradeLevel, schoolId]
        ];

        const resource = {
            values,
        };

        const result = await sheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource,
        });

        console.log(`${result.data.updates.updatedCells} cells updated.`);
    } catch (err) {
        console.error('Error writing to Registry!', err);
    }
}


async function getNextEmptyRow(spreadsheetId) {
    try {
        const result = await sheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: 'Sheet1!A:A',
        });

        const numRows = result.data.values ? result.data.values.length : 0;
        return numRows;
    } catch (err) {
        console.error('Error getting next empty row', err);
        throw err;
    }
}

module.exports = { updateRegistry };