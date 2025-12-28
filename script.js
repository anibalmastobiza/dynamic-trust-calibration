  // Enhanced Complete Study function with robust Google Sheets integration
  async function completeStudy() {
      // Validate questionnaire
      const trustChange =
  document.querySelector('input[name="trust-change"]:checked')?.value;
      const trustFactors = Array.from(document.querySelectorAll('input[name=
  "trust-factors"]:checked')).map(cb => cb.value);
      const aiOpinion =
  document.getElementById('ai-healthcare-opinion').value;

      if (!trustChange || !aiOpinion) {
          showError('Please complete all required questions.');
          return;
      }

      if (trustFactors.length === 0) {
          showError('Please select at least one factor that influenced your 
  trust.');
          return;
      }

      // Store questionnaire data
      studyData.questionnaire = {
          trustChange: trustChange,
          trustFactors: trustFactors,
          aiOpinion: aiOpinion,
          comments: document.getElementById('comments').value
      };

      studyData.completed = true;
      studyData.endTime = new Date().toISOString();

      // Validate data before submission
      const validation = validateStudyData(studyData);
      if (!validation.isValid) {
          showError('Data validation failed: ' + validation.errors.join(', 
  '));
          return;
      }

      // Show loading state
      const completeButton =
  document.querySelector('button[onclick="completeStudy()"]');
      const originalText = completeButton.textContent;
      completeButton.innerHTML = `
          <span>Saving Data...</span>
          <div style="display: inline-block; margin-left: 10px;">
              <div style="width: 20px; height: 20px; border: 2px solid 
  #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; animation: 
  spin 1s linear infinite; display: inline-block;"></div>
          </div>
      `;
      completeButton.disabled = true;

      // Add CSS for spinner animation if not already present
      if (!document.querySelector('#spinner-style')) {
          const style = document.createElement('style');
          style.id = 'spinner-style';
          style.textContent = `
              @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }
          `;
          document.head.appendChild(style);
      }

      try {
          // Test connection first
          showProgressMessage('Testing connection...');
          const connectionTest = await testGoogleSheetsConnection();

          if (!connectionTest.success) {
              throw new Error('Connection test failed: ' +
  connectionTest.error);
          }

          // Submit to Google Sheets
          showProgressMessage('Submitting data to secure servers...');
          const result = await submitToGoogleSheets(studyData);

          if (result.success) {
              // Store data locally as backup
              localStorage.setItem('studyData_' + studyData.participantId,
  JSON.stringify(studyData));

              showProgressMessage('Data saved successfully! 
  Redirecting...');

              // Show completion page after a brief delay
              setTimeout(() => {
                  showPage('completion-page');
              }, 1500);

          } else {
              if (result.queued) {
                  showProgressMessage('Data queued for submission when 
  connection is restored.');
                  localStorage.setItem('studyData_' +
  studyData.participantId, JSON.stringify(studyData));

                  setTimeout(() => {
                      showPage('completion-page');
                  }, 2000);
              } else {
                  throw new Error(result.error || 'Unknown submission 
  error');
              }
          }

      } catch (error) {
          console.error('Error during data submission:', error);

          // Store locally as fallback
          localStorage.setItem('studyData_' + studyData.participantId,
  JSON.stringify(studyData));

          showError(`Data saved locally. ${error.message || 'Connection 
  issue detected.'} Your responses are secure and will be submitted when 
  connection is restored.`);

          // Still show completion page after a delay
          setTimeout(() => {
              showPage('completion-page');
          }, 3000);

      } finally {
          // Reset button
          completeButton.innerHTML = originalText;
          completeButton.disabled = false;
          hideProgressMessage();
      }
  }

  // Progress message functions
  function showProgressMessage(message) {
      let progressDiv = document.querySelector('#progress-message');
      if (!progressDiv) {
          progressDiv = document.createElement('div');
          progressDiv.id = 'progress-message';
          progressDiv.style.cssText = `
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: #2196F3;
              color: white;
              padding: 12px 24px;
              border-radius: 25px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              font-size: 14px;
              font-weight: 500;
              z-index: 10000;
              transition: all 0.3s ease;
          `;
          document.body.appendChild(progressDiv);
      }
      progressDiv.textContent = message;
      progressDiv.style.display = 'block';
  }

  function hideProgressMessage() {
      const progressDiv = document.querySelector('#progress-message');
      if (progressDiv) {
          progressDiv.style.display = 'none';
      }
  }

  // Check for queued data on page load and submit if online
  document.addEventListener('DOMContentLoaded', function() {
      // Existing initialization code...

      // Check for queued data
      if (navigator.onLine) {
          setTimeout(() => {
              submitQueuedData();
          }, 2000); // Wait 2 seconds before attempting to submit queued 
  data
      }
  });
