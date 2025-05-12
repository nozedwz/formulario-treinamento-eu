declare module "google-spreadsheet" {
  export class GoogleSpreadsheet {
    constructor(sheetId: string)

    title: string
    sheetsByIndex: GoogleSpreadsheetWorksheet[]
    sheetsByTitle: Record<string, GoogleSpreadsheetWorksheet>

    useServiceAccountAuth(credentials: {
      client_email: string
      private_key: string
    }): Promise<void>

    loadInfo(): Promise<void>

    addSheet(options: {
      title: string
      headerValues: string[]
    }): Promise<GoogleSpreadsheetWorksheet>
  }

  export class GoogleSpreadsheetWorksheet {
    title: string
    rowCount: number

    getRows(): Promise<GoogleSpreadsheetRow[]>
    addRow(rowValues: Record<string, any>): Promise<GoogleSpreadsheetRow>
  }

  export class GoogleSpreadsheetRow {
    [key: string]: any
    save(): Promise<void>
    delete(): Promise<void>
  }
}
