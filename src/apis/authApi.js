import API from './axios'

export const getOTP = (phoneNumber) =>
  API.post('/api/send-otp', { phoneNumber });

export const verifyOTP = (phoneNumber, otp) =>
  API.post('/api/verify-otp', { phoneNumber, otp });

export const sendOTPVendor = (phoneNumber)=>
  API.post('/api/vendor-send-otp',{ phoneNumber })

export const login =(data)=>API.post('/api/login',data)
export const loginByGoogle =(data)=>API.post('/api/google_login',data)
export const SignUp = (data)=>API.post('/api/register/account',data)

export const signUpByGoogle = (data)=>API.post('/api/google_sign_up',data)
