#!/usr/bin/env zx
import 'zx/globals'
import { sheets as sheetsAPI } from '@googleapis/sheets'
import { GoogleAuth } from 'google-auth-library'
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth'

async function main(
  auth: GoogleAuth<JSONClient>,
  runId: number,
  hour: number,
  min: number,
  spreadsheetId: string,
  sheetName: string
) {
  const authClient = await auth.getClient()
  const sheets = sheetsAPI({ version: 'v4', auth: authClient })
  try {
    const now = Date.now()
    const values = [[runId, hour, min, now]]
    console.log(`now: ${JSON.stringify(values)}`)
    const out = await $`gh run view ${runId} --json createdAt --jq ".createdAt"`
    if (out.exitCode !== 0) {
      throw `error occurred in "gh run view": ${JSON.stringify(out)}`
    }
    const createdAt = new Date(out.stdout.replace('\n', ''))
    values[0].push(createdAt.getTime())
    console.log(`now + createdAt: ${JSON.stringify(values)}`)
    const request = {
      spreadsheetId,
      range: `${sheetName}!A2:E`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        majorDimension: 'ROWS',
        values
      },
      auth: authClient
    }
    const addRes = await sheets.spreadsheets.values.append(request)
  } catch (err) {
    console.log('The API returned an error: ' + err)
    process.exit(1)
  }
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const auth = new GoogleAuth({
  scopes: SCOPES
})

const spreadsheetId = process.env['SPREADSHEET_ID']
const sheetName = process.env['SHEET_NAME']
let runId = -1
let hour = -1
let min = -1

if (!spreadsheetId) {
  console.error(chalk.red(`$SPREADSHEET_ID is not specified`))
  process.exit(1)
}
if (!sheetName) {
  console.error(chalk.red(`$SHEET_NAME is not specified`))
  process.exit(1)
}
if (
  typeof argv['run-id'] !== 'number' ||
  typeof argv['hour'] !== 'number' ||
  typeof argv['min'] !== 'number'
) {
  console.log('USAGE: script --run-in [RUN ID] --hour [HOUR] --min [MINUTE]')
  process.exit(1)
}
runId = argv['run-id']
hour = argv['hour']
min = argv['min']

main(auth, runId, hour, min, spreadsheetId, sheetName)
