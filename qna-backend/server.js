const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the React app
app.use(express.static('build'));
app.use(express.static(path.join(__dirname, '../chatbot-app/build')));
app.use(bodyParser.json());
app.use(cors());

app.post('/api/qna', async (req, res) => {
  const question = req.body.question;

  try {
    const response = await axios.post(
      `${process.env.AZURE_QNA_ENDPOINT}/language/:query-knowledgebases?projectName=AlterEgoBotQnA&api-version=2021-10-01&deploymentName=production`,
      { question, top: 1 },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_QNA_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    const answer = response.data.answers[0].answer;
    res.json({ answer });
  } catch (error) {
    console.error('Error querying QnA Maker:', error);
    res.status(500).send('Error querying QnA Maker');
  }
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../chatbot-app/build', 'index.html'));
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

