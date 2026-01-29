import axios from 'axios';

// Get base URL from Vite env or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: `${API_URL}/api/ollama`,
});

export const ollamaService = {
    getModels: async () => {
        try {
            const response = await api.get('/models');
            return response.data;
        } catch (error) {
            console.error('Error fetching models:', error);
            throw error;
        }
    },

    chat: async (model, prompt) => {
        try {
            const response = await api.post('/chat', { model, prompt });
            return response.data;
        } catch (error) {
            console.error('Error sending prompt:', error);
            throw error;
        }
    },
};
