import React, { useState } from 'react';
import { apiFetch } from '../utils/api';

const RegisterPetShopPage = () => {
  const [formData, setFormData] = useState({
    shopName: '',
    contactName: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiFetch('/registrations', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSuccess(true);
      setFormData({ shopName: '', contactName: '', email: '', message: '' }); // Clear form
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto my-10 p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Thank You!</h1>
        <p className="text-gray-700">Your inquiry has been submitted successfully. Our team will get in touch with you shortly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Partner with Us</h1>
      <p className="text-gray-600 mb-8 text-center">
        Interested in listing your puppies on our platform? Fill out the form below, and our team will get in touch with you shortly to discuss the next steps.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="shopName" className="block text-gray-700 font-medium mb-2">Pet Shop Name</label>
          <input type="text" id="shopName" name="shopName" value={formData.shopName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" required />
        </div>

        <div className="mb-6">
          <label htmlFor="contactName" className="block text-gray-700 font-medium mb-2">Contact Person</label>
          <input type="text" id="contactName" name="contactName" value={formData.contactName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" required />
        </div>

        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" required />
        </div>

        <div className="mb-6">
          <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message (Optional)</label>
          <textarea id="message" name="message" rows="4" value={formData.message} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"></textarea>
        </div>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
          {loading ? 'Submitting...' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPetShopPage;
