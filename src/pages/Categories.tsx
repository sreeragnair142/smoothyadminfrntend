import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Category } from '../types';
import { categories as initialCategories } from '../data/mockData';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    smoothieCount: 0,
    image: '',
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const columns = [
    {
      header: 'Image',
      accessor: (category: Category) => (
        <img
          src={category.image}
          alt={category.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },
    { header: 'Name', accessor: 'name', sortable: true },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Smoothies',
      accessor: (category: Category) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {category.smoothieCount}
        </span>
      ),
      sortable: true,
    },
  ];

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      smoothieCount: 0,
      image: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description,
      smoothieCount: category.smoothieCount,
      image: category.image,
    });
    setModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'smoothieCount' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      setCategories(
        categories.map((category) =>
          category.id === editingCategory.id
            ? { ...category, ...formData }
            : category
        )
      );
    } else {
      const newCategory: Category = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setCategories([...categories, newCategory]);
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    if (categoryToDelete) {
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <p className="text-gray-600">Organize smoothies into categories</p>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        keyField="id"
        title="Categories"
        onAddNew={openAddModal}
        addNewLabel="Add Category"
        searchPlaceholder="Search categories..."
        actions={(category) => (
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => openEditModal(category)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => openDeleteModal(category)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              {editingCategory ? 'Update' : 'Add'}
            </button>
          </div>
        }
      >
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Category Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          {editingCategory && (
            <div>
              <label htmlFor="smoothieCount" className="block text-sm font-medium text-gray-700">
                Number of Smoothies
              </label>
              <input
                type="number"
                id="smoothieCount"
                name="smoothieCount"
                min="0"
                value={formData.smoothieCount}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Category"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        }
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
            </p>
            {categoryToDelete && categoryToDelete.smoothieCount > 0 && (
              <p className="mt-2 text-sm font-medium text-red-600">
                Warning: This category contains {categoryToDelete.smoothieCount} smoothies that will be uncategorized.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
