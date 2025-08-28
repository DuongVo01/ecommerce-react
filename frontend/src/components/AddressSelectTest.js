import React, { useState } from 'react';
import AddressSelect from './AddressSelect';

export default function AddressSelectTest() {
  const [address, setAddress] = useState({});

  const handleAddressChange = (newAddress) => {
    setAddress(newAddress);
    console.log('Address changed:', newAddress);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Test AddressSelect Component</h2>
      <p>Select your address using the cascading dropdowns:</p>
      
      <AddressSelect 
        value={address} 
        onChange={handleAddressChange} 
      />
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <h3>Selected Address:</h3>
        <p><strong>Province:</strong> {address.province || 'Not selected'}</p>
        <p><strong>District:</strong> {address.district || 'Not selected'}</p>
        <p><strong>Ward:</strong> {address.ward || 'Not selected'}</p>
      </div>
    </div>
  );
}
