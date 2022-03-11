#!/usr/bin/env zx
import 'zx/globals'
import { sheets as sheetsAPI } from '@googleapis/sheets'
import { GoogleAuth } from 'google-auth-library'
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth'

async function main(
  auth: GoogleAuth<JSONClient>,
  runId: number,
  step: number,
  spreadsheetId: string,
  sheetName: string
) {
  const authClient = await auth.getClient()
  const sheets = sheetsAPI({ version: 'v4', auth: authClient })
  try {
    const now = Date.now()
    const request = {
      spreadsheetId,
      range: `${sheetName}!A2:C`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        majorDimension: 'ROWS',
        values: [[runId, step, now]]
      },
      auth: authClient
    }
    const addRes = await sheets.spreadsheets.values.append(request)
  } catch (err) {
    console.log('The API returned an error: ' + err)
  }
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const auth = new GoogleAuth({
  scopes: SCOPES
})

const spreadsheetId = process.env['SPREADSHEET_ID']
const sheetName = process.env['SHEET_NAME']
let runId = -1
let step = -1

if (!spreadsheetId) {
  console.error(chalk.red(`$SPREADSHEET_ID is not specified`))
  process.exit(1)
}
if (!sheetName) {
  console.error(chalk.red(`$SHEET_NAME is not specified`))
  process.exit(1)
}
if (typeof argv['run-id'] === 'number' || typeof argv['step'] === 'number') {
  console.log('USAGE: script --run-in [RUN ID] --step [STEP]')
  process.exit(1)
}
runId = argv['run-id']
step = argv['step']

main(auth, runId, step, spreadsheetId, sheetName)
