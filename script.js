// Study Data Storage
  let studyData = {
      participantId: generateParticipantId(),
      startTime: new Date().toISOString(),
      demographics: {},
      scenarios: [],
      questionnaire: {},
      completed: false
  };

  // Scenario Data
  const scenarios = [
      {
          id: 1,
          title: "Chest Pain Diagnosis",
          patient: {
              age: 45,
              gender: "Male",
              symptoms: "Chest pain, shortness of breath, sweating",
              history: "Smoker, family history of heart disease, high 
  cholesterol"
          },
          aiRecommendation: {
              diagnosis: "Acute Myocardial Infarction (Heart Attack)",
              confidence: 85,
              reasoning: "Pattern consistent with STEMI based on symptom 
  cluster and risk factors"
          },
          evidence: {
              type: "ECG Results",
              content: "ECG shows ST-elevation in leads II, III, aVF, 
  confirming inferior STEMI"
          }
      },
      {
          id: 2,
          title: "Skin Lesion Analysis",
          patient: {
              age: 62,
              gender: "Female",
              symptoms: "New pigmented lesion on back, irregular borders, 
  color variation",
              history: "Fair skin, multiple sunburns in youth, family 
  history of melanoma"
          },
          aiRecommendation: {
              diagnosis: "Suspicious for Malignant Melanoma",
              confidence: 72,
              reasoning: "ABCDE criteria present: Asymmetry, irregular 
  Borders, Color variation, Diameter >6mm"
          },
          evidence: {
              type: "Dermatoscopy",
              content: "Dermatoscopic examination reveals atypical pigment 
  network and blue-white structures"
          }
      },
      {
          id: 3,
          title: "Pneumonia Detection",
          patient: {
              age: 78,
              gender: "Male",
              symptoms: "Productive cough, fever 102°F, difficulty 
  breathing",
              history: "COPD, recent hospitalization, immunocompromised"
          },
          aiRecommendation: {
              diagnosis: "Bacterial Pneumonia - likely Streptococcus 
  pneumoniae",
              confidence: 91,
              reasoning: "Classic presentation in high-risk patient with 
  typical chest X-ray findings"
          },
          evidence: {
              type: "Laboratory Results",
              content: "Blood cultures positive for Streptococcus 
  pneumoniae, elevated WBC count (15,000)"
          }
      },
      {
          id: 4,
          title: "Diabetic Retinopathy Screening",
          patient: {
              age: 55,
              gender: "Female",
              symptoms: "Gradual vision loss, floaters, difficulty with 
  night vision",
              history: "Type 2 diabetes for 15 years, poor glycemic control,
   hypertension"
          },
          aiRecommendation: {
              diagnosis: "Proliferative Diabetic Retinopathy",
              confidence: 78,
              reasoning: "Fundus images show neovascularization and cotton 
  wool spots consistent with advanced diabetic retinopathy"
          },
          evidence: {
              type: "Fluorescein Angiography",
              content: "Angiography confirms extensive capillary dropout and
   active neovascularization"
          }
      }
  ];

  let currentScenarioIndex = 0;
  let currentPhase = 'initial'; // 'initial' or 'updated'

  // Utility Functions
  function generateParticipantId() {
      return 'P' + Date.now().toString(36) +
  Math.random().toString(36).substr(2, 9);
  }

  function showPage(pageId) {
      document.querySelectorAll('.page').forEach(page => {
          page.classList.remove('active');
      });
      document.getElementById(pageId).classList.add('active');
  }

  function nextPage(pageId) {
      showPage(pageId);
  }

  function previousPage(pageId) {
      showPage(pageId);
  }

  // Consent Validation
  function validateConsent() {
      const checkboxes = [
          'consent-understand',
          'consent-voluntary',
          'consent-anonymous',
          'consent-agree'
      ];

      const allChecked = checkboxes.every(id =>
          document.getElementById(id).checked
      );

      if (!allChecked) {
          showError('Please check all consent boxes to continue.');
          return;
      }

      studyData.consentTime = new Date().toISOString();
      nextPage('demographics-page');
  }

  // Demographics Validation
  function validateDemographics() {
      const fields = ['age', 'gender', 'education', 'healthcare-role',
  'ai-experience'];
      const missing = [];

      fields.forEach(field => {
          const value = document.getElementById(field).value;
          if (!value) {
              missing.push(field);
          } else {
              studyData.demographics[field] = value;
          }
      });

      if (missing.length > 0) {
          showError('Please complete all demographic fields to continue.');
          return;
      }

      nextPage('instructions-page');
  }

  // Start Scenarios
  function startScenarios() {
      currentScenarioIndex = 0;
      currentPhase = 'initial';
      showScenario();
  }

  // Show Scenario
  function showScenario() {
      const scenario = scenarios[currentScenarioIndex];
      const container = document.getElementById('scenario-container');

      container.innerHTML = `
          <div class="scenario">
              <div class="scenario-header">
                  Case ${currentScenarioIndex + 1} of ${scenarios.length}: 
  ${scenario.title}
                  ${currentPhase === 'updated' ? ' - Updated Information' : 
  ''}
              </div>

              <div class="scenario-content">
                  <div class="case-info">
                      <h4>Patient Information</h4>
                      <p><strong>Age:</strong> ${scenario.patient.age}</p>
                      <p><strong>Gender:</strong> 
  ${scenario.patient.gender}</p>
                      <p><strong>Presenting Symptoms:</strong> 
  ${scenario.patient.symptoms}</p>
                      <p><strong>Medical History:</strong> 
  ${scenario.patient.history}</p>
                  </div>

                  <div class="ai-recommendation">
                      <h4>AI System Recommendation</h4>
                      <p><strong>Diagnosis:</strong> 
  ${scenario.aiRecommendation.diagnosis}</p>
                      <p><strong>Reasoning:</strong> 
  ${scenario.aiRecommendation.reasoning}</p>
                      <div class="confidence-indicator">
                          AI Confidence: 
  ${scenario.aiRecommendation.confidence}%
                      </div>
                  </div>

                  ${currentPhase === 'updated' ? `
                      <div class="evidence-box">
                          <h4>🔍 New Evidence: 
  ${scenario.evidence.type}</h4>
                          <p>${scenario.evidence.content}</p>
                      </div>
                  ` : ''}

                  <div class="trust-scale">
                      <h4>How much do you trust this AI recommendation?</h4>
                      <p>Move the slider to indicate your trust level (0 = 
  No trust, 100 = Complete trust)</p>

                      <div class="scale-container">
                          <input type="range" min="0" max="100" value="50"
                                 class="trust-slider" id="trust-rating"
                                 oninput="updateTrustDisplay(this.value)">
                          <div class="scale-labels-container">
                              <span>No Trust (0)</span>
                              <span>Low Trust (25)</span>
                              <span>Moderate Trust (50)</span>
                              <span>High Trust (75)</span>
                              <span>Complete Trust (100)</span>
                          </div>
                      </div>

                      <div style="text-align: center; margin-top: 10px;">
                          <strong>Current Trust Level: <span 
  id="trust-display">50</span></strong>
                      </div>
                  </div>

                  <div class="form-group">
                      <label>Would you follow this AI 
  recommendation?</label>
                      <div class="radio-group">
                          <label><input type="radio" 
  name="follow-recommendation" value="definitely-yes" required> Definitely 
  yes</label>
                          <label><input type="radio" 
  name="follow-recommendation" value="probably-yes" required> Probably 
  yes</label>
                          <label><input type="radio" 
  name="follow-recommendation" value="uncertain" required> Uncertain</label>
                          <label><input type="radio" 
  name="follow-recommendation" value="probably-no" required> Probably 
  no</label>
                          <label><input type="radio" 
  name="follow-recommendation" value="definitely-no" required> Definitely 
  no</label>
                      </div>
                  </div>

                  <div class="form-group">
                      <label for="reasoning">Briefly explain your reasoning 
  (optional):</label>
                      <textarea id="reasoning" rows="3" placeholder="What 
  factors influenced your decision?"></textarea>
                  </div>

                  <div class="button-container">
                      ${currentScenarioIndex > 0 || currentPhase === 
  'updated' ?
                          '<button class="btn btn-secondary" 
  onclick="previousScenario()">Back</button>' :
                          '<button class="btn btn-secondary" 
  onclick="previousPage(\'instructions-page\')">Back to 
  Instructions</button>'
                      }
                      <button class="btn btn-primary" 
  onclick="recordScenarioResponse()">
                          ${currentPhase === 'initial' ? 'See Additional 
  Evidence' :
                            currentScenarioIndex < scenarios.length - 1 ? 
  'Next Case' : 'Continue to Final Questions'}
                      </button>
                  </div>
              </div>
          </div>
      `;

      showPage('scenario-container');
  }

  // Update Trust Display
  function updateTrustDisplay(value) {
      document.getElementById('trust-display').textContent = value;
  }

  // Record Scenario Response
  function recordScenarioResponse() {
      const trustRating = document.getElementById('trust-rating').value;
      const followRecommendation = document.querySelector('input[name="follo
  w-recommendation"]:checked')?.value;
      const reasoning = document.getElementById('reasoning').value;

      if (!followRecommendation) {
          showError('Please indicate whether you would follow this AI 
  recommendation.');
          return;
      }

      const responseData = {
          scenarioId: scenarios[currentScenarioIndex].id,
          phase: currentPhase,
          trustRating: parseInt(trustRating),
          followRecommendation: followRecommendation,
          reasoning: reasoning,
          timestamp: new Date().toISOString()
      };

      if (currentPhase === 'initial') {
          // Store initial response and show updated version
          studyData.scenarios.push({
              ...responseData,
              scenarioData: scenarios[currentScenarioIndex]
          });
          currentPhase = 'updated';
          showScenario();
      } else {
          // Store updated response and move to next scenario
          studyData.scenarios.push({
              ...responseData,
              scenarioData: scenarios[currentScenarioIndex]
          });

          currentScenarioIndex++;
          currentPhase = 'initial';

          if (currentScenarioIndex < scenarios.length) {
              showScenario();
          } else {
              showPage('questionnaire-page');
          }
      }
  }

  // Previous Scenario
  function previousScenario() {
      if (currentPhase === 'updated') {
          currentPhase = 'initial';
          showScenario();
      } else if (currentScenarioIndex > 0) {
          currentScenarioIndex--;
          currentPhase = 'updated';
          showScenario();
      }
  }

  // Complete Study
  function completeStudy() {
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

      // Store data (in real implementation, this would send to server)
      localStorage.setItem('studyData_' + studyData.participantId,
  JSON.stringify(studyData));

      // Show completion page
      showPage('completion-page');
  }

  // Redirect to Prolific
  function redirectToProlific() {
      // Get Prolific completion URL from URL parameters or use default
      const urlParams = new URLSearchParams(window.location.search);
      const prolificCompleteUrl = urlParams.get('completionUrl') ||

  'https://app.prolific.co/submissions/complete?cc=STUDY_COMPLETE';

      // In a real study, you would also send the completion code to your 
  server
      console.log('Study completed for participant:',
  studyData.participantId);
      console.log('Final data:', studyData);

      // Redirect back to Prolific
      window.location.href = prolificCompleteUrl;
  }

  // Error Display
  function showError(message) {
      // Remove existing error messages
      document.querySelectorAll('.error-message').forEach(el =>
  el.remove());

      // Create and show new error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;

      // Insert before the button container in the current page
      const currentPage = document.querySelector('.page.active');
      const buttonContainer =
  currentPage.querySelector('.button-container');
      if (buttonContainer) {
          buttonContainer.parentNode.insertBefore(errorDiv,
  buttonContainer);
      }

      // Scroll to error message
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Remove error after 5 seconds
      setTimeout(() => {
          errorDiv.remove();
      }, 5000);
  }

  // Initialize the study
  document.addEventListener('DOMContentLoaded', function() {
      // Check if coming from Prolific
      const urlParams = new URLSearchParams(window.location.search);
      const prolificPid = urlParams.get('PROLIFIC_PID');

      if (prolificPid) {
          studyData.prolificId = prolificPid;
          studyData.studyId = urlParams.get('STUDY_ID');
          studyData.sessionId = urlParams.get('SESSION_ID');
      }

      // Show the first page
      showPage('info-page');

      console.log('Study initialized for participant:',
  studyData.participantId);
  });

  // Prevent accidental navigation away
  window.addEventListener('beforeunload', function(e) {
      if (!studyData.completed) {
          e.preventDefault();
          e.returnValue = 'You have not completed the study yet. Are you 
  sure you want to leave?';
          return 'You have not completed the study yet. Are you sure you 
  want to leave?';
      }
  });

  // Data export function for researchers
  function exportStudyData() {
      const dataBlob = new Blob([JSON.stringify(studyData, null, 2)], {
          type: 'application/json'
      });
      const url = URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study_data_${studyData.participantId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  // Make functions available globally
  window.nextPage = nextPage;
  window.previousPage = previousPage;
  window.validateConsent = validateConsent;
  window.validateDemographics = validateDemographics;
  window.startScenarios = startScenarios;
  window.updateTrustDisplay = updateTrustDisplay;
  window.recordScenarioResponse = recordScenarioResponse;
  window.previousScenario = previousScenario;
  window.completeStudy = completeStudy;
  window.redirectToProlific = redirectToProlific;
