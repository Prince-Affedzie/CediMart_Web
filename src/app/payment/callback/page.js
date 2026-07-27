// src/app/payment/callback/page.js
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyPayment } from '@/apis/paymentApi';
import { order } from '@/apis/guestOrderApi';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    // Paystack returns ?reference=XXX&trxref=XXX in the URL
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found. Please contact support.');
      return;
    }

    const processPayment = async () => {
      try {
        // Step 1: Verify payment with your backend
        const verifyRes = await verifyPayment(reference);
        const paymentVerified = verifyRes?.status === 200 && verifyRes?.data?.success === true;

        if (!paymentVerified) {
          setStatus('failed');
          setMessage('Payment verification failed. Reference: ' + reference);
          return;
        }

        // Step 2: Get the saved checkout data
        const checkoutDataStr = sessionStorage.getItem('cm_checkout_data');
        if (!checkoutDataStr) {
          setStatus('failed');
          setMessage('Checkout session expired. Please contact support with reference: ' + reference);
          return;
        }

        const checkoutData = JSON.parse(checkoutDataStr);
        const token = localStorage.getItem('cm_token');

        // Step 3: Create the order (matching app structure)
        const orderData = {
          orderItems: [
            {
              productId: checkoutData.productId,
              name: checkoutData.productName,
              quantity: 1,
              unit: 'piece',
              price: checkoutData.price,
              product: checkoutData.productId,
            },
          ],
          shippingAddress: {
            address: `${checkoutData.campusArea}${checkoutData.nearestLandmark ? ', ' + checkoutData.nearestLandmark : ''}`,
            city: checkoutData.campus,
            region: '',
            nearestLandmark: checkoutData.nearestLandmark || '',
            phone: checkoutData.phone,
          },
          deliverySchedule: {
            preferredDay: 'monday',
            preferredTime: 'afternoon',
          },
          paymentMethod: 'paystack',
          paymentReference: reference,
          paymentStatus: 'paid',
          ...(checkoutData.referralCode && { referralCode: checkoutData.referralCode }),
        };

        const res = await order(orderData, token);

        if (res?.status === 200 || res?.success || res?.status === 201) {
          // Clear session data
          sessionStorage.removeItem('cm_checkout_data');
          sessionStorage.removeItem('cm_payment_ref');

          const createdOrder = res.data?.data || res.data;
          const orderId = createdOrder?._id || createdOrder?.orderId || createdOrder?.orderNumber || reference;
          router.replace(`/order-confirmed/${orderId}`);
        } else {
          setStatus('failed');
          setMessage(res?.data?.message || 'Payment was successful but order creation failed. Please contact support with reference: ' + reference);
        }
      } catch (err) {
        setStatus('failed');
        setMessage('An error occurred. Please contact support with reference: ' + reference);
      }
    };

    processPayment();
  }, [searchParams, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        {status === 'processing' && (
          <>
            <div style={{ width: 56, height: 56, border: '3px solid #E2E8F0', borderTopColor: '#0D9488', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 24px' }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Processing Payment</h1>
            <p style={{ color: '#475569', fontSize: 14 }}>{message}</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Payment Issue</h1>
            <p style={{ color: '#475569', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <a href="/listings" style={{ background: '#0D9488', color: '#fff', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
              Browse Products
            </a>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F8FAFC' }} />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}