import api from './api';

export const ollamaService = {
    getModels: async () => {
        try {
            const response = await api.get('/ollama/models');
            return response.data;
        } catch (error) {
            console.error('Error fetching models:', error);
            throw error;
        }
    },

    chat: async (model, prompt) => {
        try {
            const response = await api.post('/ollama/chat', { model, prompt });
            return response.data;
        } catch (error) {
            console.error('Error sending prompt:', error);
            throw error;
        }
    },
};
