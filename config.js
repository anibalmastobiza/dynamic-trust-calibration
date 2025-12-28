 // Google Sheets Configuration
  const GOOGLE_SHEETS_CONFIG = {
      // Replace with your Google Apps Script Web App URL
      scriptUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

      // Spreadsheet configuration
      spreadsheetId: 'YOUR_SPREADSHEET_ID',

      // Sheet names for different data types
      sheets: {
          demographics: 'Demographics',
          scenarios: 'Scenarios',
          questionnaire: 'Questionnaire',
          summary: 'Summary'
      }
  };

  // Data submission function
  async function submitToGoogleSheets(data) {
      try {
          const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptUrl, {
              method: 'POST',
              mode: 'cors',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  action: 'submitStudyData',
                  data: data
              })
          });

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (result.success) {
              console.log('Data successfully submitted to Google Sheets');
              return { success: true, message: 'Data saved successfully' };
          } else {
              throw new Error(result.error || 'Unknown error occurred');
          }
      } catch (error) {
          console.error('Error submitting to Google Sheets:', error);
          return { success: false, error: error.message };
      }
  }

  // Test connection function
  async function testGoogleSheetsConnection() {
      try {
          const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptUrl, {
              method: 'POST',
              mode: 'cors',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  action: 'test'
              })
          });

          const result = await response.json();
          return result;
      } catch (error) {
          console.error('Connection test failed:', error);
          return { success: false, error: error.message };
      }
  }
