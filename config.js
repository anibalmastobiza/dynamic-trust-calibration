// Google Sheets Configuration - Enhanced Version
  const GOOGLE_SHEETS_CONFIG = {
      // Replace with your Google Apps Script Web App URL
      scriptUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

      // Retry configuration
      maxRetries: 3,
      retryDelay: 1000, // milliseconds

      // Batch submission settings
      batchSize: 10,

      // Spreadsheet configuration
      spreadsheetId: 'YOUR_SPREADSHEET_ID',

      // Sheet names for different data types
      sheets: {
          demographics: 'Demographics',
          scenarios: 'Scenarios',
          questionnaire: 'Questionnaire',
          summary: 'Summary',
          errors: 'Errors'
      }
  };

  // Enhanced data submission with retry logic
  async function submitToGoogleSheets(data, retryCount = 0) {
      try {
          // Add submission metadata
          const submissionData = {
              ...data,
              submissionTime: new Date().toISOString(),
              browserInfo: {
                  userAgent: navigator.userAgent,
                  language: navigator.language,
                  platform: navigator.platform,
                  screenResolution: `${screen.width}x${screen.height}`
              }
          };

          const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptUrl, {
              method: 'POST',
              mode: 'cors',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  action: 'submitStudyData',
                  data: submissionData,
                  timestamp: new Date().toISOString()
              })
          });

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (result.success) {
              console.log('Data successfully submitted to Google Sheets');

              // Clear any queued data
              localStorage.removeItem('queuedStudyData_' +
  data.participantId);

              return {
                  success: true,
                  message: 'Data saved successfully',
                  rowsAdded: result.rowsAdded || 0
              };
          } else {
              throw new Error(result.error || 'Unknown error occurred');
          }
      } catch (error) {
          console.error(`Submission attempt ${retryCount + 1} failed:`,
  error);

          // Retry logic
          if (retryCount < GOOGLE_SHEETS_CONFIG.maxRetries) {
              console.log(`Retrying in 
  ${GOOGLE_SHEETS_CONFIG.retryDelay}ms...`);
              await new Promise(resolve => setTimeout(resolve,
  GOOGLE_SHEETS_CONFIG.retryDelay));
              return submitToGoogleSheets(data, retryCount + 1);
          } else {
              // Queue data for later submission
              queueDataForLater(data);
              return {
                  success: false,
                  error: error.message,
                  queued: true
              };
          }
      }
  }

  // Queue data for offline submission
  function queueDataForLater(data) {
      const queueKey = 'queuedStudyData_' + data.participantId;
      localStorage.setItem(queueKey, JSON.stringify({
          data: data,
          queueTime: new Date().toISOString(),
          attempts: 0
      }));

      console.log('Data queued for later submission');
  }

  // Submit queued data when online
  async function submitQueuedData() {
      const queuedItems = [];

      // Find all queued items
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('queuedStudyData_')) {
              try {
                  const queuedItem = JSON.parse(localStorage.getItem(key));
                  queuedItems.push({ key, ...queuedItem });
              } catch (error) {
                  console.error('Error parsing queued data:', error);
              }
          }
      }

      // Submit queued items
      for (const item of queuedItems) {
          try {
              const result = await submitToGoogleSheets(item.data);
              if (result.success) {
                  localStorage.removeItem(item.key);
                  console.log('Queued data submitted successfully');
              }
          } catch (error) {
              console.error('Error submitting queued data:', error);
          }
      }
  }

  // Test connection with detailed diagnostics
  async function testGoogleSheetsConnection() {
      try {
          const startTime = Date.now();

          const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptUrl, {
              method: 'POST',
              mode: 'cors',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  action: 'test',
                  timestamp: new Date().toISOString()
              })
          });

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          if (!response.ok) {
              throw new Error(`HTTP ${response.status}: 
  ${response.statusText}`);
          }

          const result = await response.json();

          return {
              ...result,
              responseTime: responseTime,
              status: response.status
          };

      } catch (error) {
          console.error('Connection test failed:', error);
          return {
              success: false,
              error: error.message,
              timestamp: new Date().toISOString()
          };
      }
  }

  // Validate data before submission
  function validateStudyData(data) {
      const errors = [];

      // Check required fields
      if (!data.participantId) errors.push('Missing participant ID');
      if (!data.demographics || Object.keys(data.demographics).length === 0)
   {
          errors.push('Missing demographics data');
      }
      if (!data.scenarios || data.scenarios.length === 0) {
          errors.push('Missing scenario responses');
      }
      if (!data.questionnaire) errors.push('Missing questionnaire data');

      // Validate scenario responses
      const expectedScenarios = 4; // Based on your study design
      const expectedResponses = expectedScenarios * 2; // Initial + Updated 
  phases

      if (data.scenarios && data.scenarios.length !== expectedResponses) {
          errors.push(`Incomplete scenario responses: 
  ${data.scenarios.length}/${expectedResponses}`);
      }

      return {
          isValid: errors.length === 0,
          errors: errors
      };
  }

  // Network status monitoring
  let isOnline = navigator.onLine;

  window.addEventListener('online', () => {
      isOnline = true;
      console.log('Connection restored. Attempting to submit queued 
  data...');
      submitQueuedData();
  });

  window.addEventListener('offline', () => {
      isOnline = false;
      console.log('Connection lost. Data will be queued locally.');
  });

  // Export functions for global access
  window.submitToGoogleSheets = submitToGoogleSheets;
  window.testGoogleSheetsConnection = testGoogleSheetsConnection;
  window.submitQueuedData = submitQueuedData;
  window.validateStudyData = validateStudyData;
