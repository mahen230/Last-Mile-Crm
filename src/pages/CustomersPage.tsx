import React, { useState } from 'react';
import CustomerList from '../components/customers/CustomerList';
import AddCustomerModal from '../components/customers/AddCustomerModal';
import ModulePage from '../components/ModulePage';

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ModulePage title="Customers" onAdd={() => setIsModalOpen(true)}>
      <CustomerList />
      <AddCustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </ModulePage>
  );
}
