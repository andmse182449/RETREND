import React from 'react';
import { useLocation } from 'react-router-dom';
import PaymentSuccessContent from './PaymentSuccess'; 
import PaymentFailedContent from './PaymentFailed';   

export default function PaymentResultPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get('status');

  if (status === 'success') {
    return <PaymentSuccessContent queryParams={queryParams} />;
  } else {
    return <PaymentFailedContent queryParams={queryParams} />;
  }
}