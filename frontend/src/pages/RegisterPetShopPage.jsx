import React from 'react';

const RegisterPetShopPage = () => {
  console.log('RegisterPetShopPage is rendering!');
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '400px' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>TEST: Register Pet Shop Page</h1>
      <p style={{ color: 'blue', fontSize: '18px' }}>If you can see this, the component is working!</p>
      <div style={{ backgroundColor: 'yellow', padding: '10px', margin: '10px 0' }}>
        <strong>Debug Info:</strong>
        <br />
        - Component loaded successfully
        <br />
        - Check browser console for log message
        <br />
        - URL should be: /register-pet-shop
      </div>
    </div>
  );
};

export default RegisterPetShopPage;
