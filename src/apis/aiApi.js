import API from './axios'

export const aiSearch = (query,conversationId) =>
  API.post('/api/ai/i/search', {query,conversationId });
