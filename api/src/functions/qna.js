const { app } = require('@azure/functions');
const axios = require('axios');

app.http('qna', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Processing request: ${request.url}`);

        const { question } = await request.json(); 
        context.log(`Received question: ${question}`);

        try {
            const endpoint = `${process.env.AZURE_QNA_ENDPOINT}/language/:query-knowledgebases?projectName=AlterEgoBotQnA&api-version=2021-10-01&deploymentName=production`;

            context.log(`Calling QnA API: ${endpoint}`);
            
            const response = await axios.post(
                endpoint,
                { question, top: 1 },
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': process.env.AZURE_QNA_API_KEY,
                        'Content-Type': 'application/json',
                    },
                }
            );

            context.log("Full API Response:", JSON.stringify(response.data, null, 2));

            // Check if we got answers
            const answer = response.data.answers?.[0]?.answer || "default message";
            context.log(`Returning answer: ${answer}`);

            return { body: answer };
        } catch (error) {
            context.log.error('Error querying QnA Maker:', error);
            return { status: 500, body: 'Error querying QnA Maker' };
        }
    }
});


