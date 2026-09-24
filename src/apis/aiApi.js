import API from './axios'

export const aiSearch = (query,conversationId) =>
  API.post('/api/ai/i/search', {query,conversationId });

export const aiVisualSearch =(formData)=>
  API.post("/api/ai/visual-search",formData,{
      headers: {
        'Content-Type': 'multipart/form-data',   // Let Axios set this automatically
      },
    })
