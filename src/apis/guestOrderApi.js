import API from './axios'

export const order = (data)=>
    API.post('/api/guest_order',data)