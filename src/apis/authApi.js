import API from './axios'

export const getOTP = (phoneNumber) =>
  API.post('/api/send-otp', { phoneNumber });

export const verifyOTP = (phoneNumber, otp) =>
  API.post('/api/verify-otp', { phoneNumber, otp });

export const sendOTPVendor = (phoneNumber)=>
  API.post('/api/vendor-send-otp',{ phoneNumber })
