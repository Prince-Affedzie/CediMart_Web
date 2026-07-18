import API from './axios'
export const createVendorProfile = async (data) => {
  try {
    // CRITICAL: For FormData with images, do NOT set Content-Type manually
    const response = await API.post('/api/vendor', data, {
      headers: {
        'Content-Type': 'multipart/form-data',  
      },
    });

    console.log('✅ Profile Created successfully:', response.data);
    return response;
  } catch (error) {
    console.error('Profile Update Failed:', {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
      url: error?.config?.url,
    });
    throw error;
  }
};

export const vendorLogin =(data)=>API.post('/api/vendor/login',data)
export const getMyProfileDetails =()=>API.get('/api/vendor_profile')
export const getMyProducts = ()=>API.get("/api/vendor/my_products")



