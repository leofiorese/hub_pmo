const ollamaClient = require('../config/ollama');

exports.listModels = async (req, res) => {
    try {
        const response = await ollamaClient.get('/api/tags');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching models from Ollama:', error.message);
        res.status(500).json({ error: 'Failed to fetch models from Ollama' });
    }
};

exports.chat = async (req, res) => {
    const { model, prompt, stream = false } = req.body;

    if (!model || !prompt) {
        return res.status(400).json({ error: 'Model and prompt are required' });
    }

    try {
        // If streaming is requested, we need to handle it differently
        // For simplicity in this first version, we'll disable streaming by default in the controller
        // unless we want to implement true streaming to the client.
        // Let's stick to non-streaming for the first implementation to ensure reliability,
        // unless the user specifically asked for streaming (the plan mentioned "streaming or displayed correctly").

        const response = await ollamaClient.post('/api/generate', {
            model,
            prompt,
            stream: false // Force non-streaming for now to simplify the proxy
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error chatting with Ollama:', error.message);
        res.status(500).json({ error: 'Failed to chat with Ollama' });
    }
};
