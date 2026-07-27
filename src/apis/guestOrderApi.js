import API from './axios'

export const order = (data)=>API.post('/api/order',data)
export const getOrderById =(id) =>API.get(`/api/order/${id}`)