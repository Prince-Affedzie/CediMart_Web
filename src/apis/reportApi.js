import API from './axios'

 
export const reportApi = {
  submitReport: ({ contentType, contentId, reason, description }) =>
    API.post('/api/reports', { contentType, contentId, reason, description }),
};
 