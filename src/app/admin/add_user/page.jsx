'use client';
import withAuth from '@/app/utils/auth';
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

const Page = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Handle form input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin_add_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add the user');
      }

      const data = await response.json();
      toast.success(data.message || 'User created successfully!');
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  // Reset form after successful submission
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'admin',
      password: '',
    });
  };

  return (
    <section className="p-4">
      <h3 className="text-2xl font-normal text-gray-800">Add User</h3>
      <form
        className="grid w-full grid-cols-1 gap-4 px-4 py-6 mx-auto mt-5 bg-white rounded shadow-lg sm:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <InputField
          label="Name"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter Username"
        />
        <InputField
          label="Email"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter Email"
        />
        <SelectField
          label="User Role"
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'user', label: 'User' },
          ]}
        />
        <InputField
          label="Password"
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter Password"
        />
        <button
          type="submit"
          disabled={loading}
          aria-live="assertive"
          aria-disabled={loading ? 'true' : 'false'}
          className="text-white w-[150px] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-2 py-2.5 text-center"
        >
          {loading ? 'Creating user...' : 'Create user'}
        </button>
      </form>
    </section>
  );
};

// Reusable input component for text and password fields
const InputField = ({ label, type, id, name, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      placeholder={placeholder}
      required
    />
  </div>
);

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
};

// Reusable select component for dropdowns
const SelectField = ({ label, id, name, value, onChange, options }) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900">
      {label}
    </label>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default withAuth(Page);
