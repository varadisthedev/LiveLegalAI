const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const mockUserId = 'test_user_' + Date.now();

async function testBackend() {
  console.log(`\n================================`);
  console.log(`🚀 Starting Backend Integration Test`);
  console.log(`================================`);
  console.log(`Mock User ID: ${mockUserId}`);

  // Test setup: we use the test document from the RAG folder
  const testDocPath = path.join(__dirname, '../rag_service/test_copyright_notice.pdf');
  if (!fs.existsSync(testDocPath)) {
    console.error(`❌ Test document not found at: ${testDocPath}`);
    console.log(`Please generate the test document first.`);
    return;
  }

  let documentId;

  // 1. Upload Document
  console.log(`\n[1/4] Testing POST /document/upload...`);
  try {
    const form = new FormData();
    form.append('document', fs.createReadStream(testDocPath));
    form.append('userId', mockUserId);

    const response = await axios.post(`${BASE_URL}/document/upload`, form, {
      headers: { 
        ...form.getHeaders(),
        'x-user-id': mockUserId
      }
    });

    if (response.data.success) {
      documentId = response.data.data.documentId;
      console.log(`✅ Upload successful! RAG documentId: ${documentId}`);
      console.log(`Mongo ID: ${response.data.data.id}`);
      console.log(`Chunks: ${response.data.data.numChunks}`);
    } else {
      console.error(`❌ Upload failed:`, response.data);
      return;
    }
  } catch (error) {
    console.error(`❌ Upload request failed:`, error.response?.data || error.message);
    return;
  }

  // 2. Analyze Document
  console.log(`\n[2/4] Testing POST /chat/analyze...`);
  try {
    const response = await axios.post(`${BASE_URL}/chat/analyze`, {
      userId: mockUserId,
      document_id: documentId
    }, {
      headers: { 'x-user-id': mockUserId }
    });

    if (response.data.success) {
      const data = response.data.data;
      console.log(`✅ Analysis successful!`);
      console.log(`Severity: ${data.severity_score} (${data.risk_level})`);
      console.log(`Type: ${data.document_type}`);
    } else {
      console.error(`❌ Analyze failed:`, response.data);
    }
  } catch (error) {
    console.error(`❌ Analyze request failed:`, error.response?.data || error.message);
  }

  // 3. Ask Custom Question
  console.log(`\n[3/4] Testing POST /chat/chat...`);
  try {
    const response = await axios.post(`${BASE_URL}/chat/chat`, {
      userId: mockUserId,
      document_id: documentId,
      question: "Give me bullet points on what I should do.",
    }, {
      headers: { 'x-user-id': mockUserId }
    });

    if (response.data.success) {
      const data = response.data.data;
      console.log(`✅ Chat successful!`);
      console.log(`Sources Used: ${data.sources_used}`);
      console.log(`Answer: ${data.answer.substring(0, 100)}...`);
    } else {
      console.error(`❌ Chat failed:`, response.data);
    }
  } catch (error) {
    console.error(`❌ Chat request failed:`, error.response?.data || error.message);
  }

  // 4. Check Chat History API
  console.log(`\n[4/4] Testing GET /chat/history...`);
  try {
    const response = await axios.get(`${BASE_URL}/chat/history`, {
      headers: { 'x-user-id': mockUserId }
    });

    if (response.data.success) {
      const history = response.data.data;
      console.log(`✅ History fetched successfully! Found ${history.length} records.`);
      history.forEach((h, i) => {
        console.log(`  [${i+1}] ${h.responseType} - Q: ${h.question.substring(0, 50)}...`);
      });
    } else {
      console.error(`❌ History failed:`, response.data);
    }
  } catch (error) {
    console.error(`❌ History request failed:`, error.response?.data || error.message);
  }

  console.log(`\n================================`);
  console.log(`✅ Backend Integration Test Complete`);
  console.log(`================================`);
}

testBackend();
