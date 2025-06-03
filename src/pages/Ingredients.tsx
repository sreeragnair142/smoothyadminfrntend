import React, { useState } from 'react';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Ingredient } from '../types';
import { ingredients as initialIngredients } from '../data/mockData';

const Ingredients: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    stock: 0,
    unit: '',
    price: 0,
    supplier: '',
    lastRestock: '',
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);

  const columns = [
    { header: 'Name', accessor: 'name', sortable: true },
    { 
      header: 'Category', 
      accessor: (ingredient: Ingredient) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {ingredient.category}
        </span>
      ),
    },
    { 
      header: 'Stock', 
      accessor: (ingredient: Ingredient) => (
        <div className="flex items-center">
          <span className={`font-medium ${ingredient.stock < 50 ? 'text-red-600' : 'text-gray-900'}`}>
            {ingredient.stock} {ingredient.unit}
          </span>
          {ingredient.stock < 50 && (
            <AlertTriangle className="ml-1 h-4 w-4 text-amber-500" />
          )}
        </div>
      ),
      sortable: true 
    },
    { 
      header: 'Price', 
      accessor: (ingredient: Ingredient) => (
        <span>
          ${ingredient.price.toFixed(2)} / {ingredient.unit}
        </span>
      ),
      sortable: true 
    },
    { header: 'Supplier', accessor: 'supplier' },
    { 
      header: 'Last Restock', 
      accessor: (ingredient: Ingredient) => new Date(ingredient.lastRestock).toLocaleDateString(),
      sortable: true 
    },
  ];

  const openAddModal = () => {
    setEditingIngredient(null);
    setFormData({
      id: '',
      name: '',
      category: '',
      stock: 0,
      unit: 'kg',
      price: 0,
      supplier: '',
      lastRestock: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEditModal = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      id: ingredient.id,
      name: ingredient.name,
      category: ingredient.category,
      stock: ingredient.stock,
      unit: ingredient.unit,
      price: ingredient.price,
      supplier: ingredient.supplier,
      lastRestock: new Date(ingredient.lastRestock).toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openDeleteModal = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient);
    setDeleteModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ingredientData = {
      ...formData,
      stock: Number(formData.stock),
      price: Number(formData.price),
      lastRestock: new Date(formData.lastRestock).toISOString(),
    };
    
    if (editingIngredient) {
      // Update existing ingredient
      setIngredients(ingredients.map(ingredient => 
        ingredient.id === editingIngredient.id ? { ...ingredientData, id: ingredient.id } : ingredient
      ));
    } else {
      // Add new ingredient
      const newIngredient: Ingredient = {
        ...ingredientData,
        id: Date.now().toString(),
      };
      setIngredients([...ingredients, newIngredient]);
    }
    
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (ingredientToDelete) {
      setIngredients(ingredients.filter(ingredient => ingredient.id !== ingredientToDelete.id));
      setDeleteModalOpen(false);
      setIngredientToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ingredient Management</h1>
        <p className="text-gray-600">Manage your smoothie ingredients inventory</p>
      </div>
      
      <DataTable
        columns={columns}
        data={ingredients}
        keyField="id"
        title="Ingredients"
        onAddNew={openAddModal}
        addNewLabel="Add Ingredient"
        searchPlaceholder="Search ingredients..."
        actions={(ingredient) => (
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => openEditModal(ingredient)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => openDeleteModal(ingredient)}
              className="p-1 text-red-600 hover:text-red-800"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      />
      
      {/* Add/Edit Ingredient Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
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
              {editingIngredient ? 'Update' : 'Add'}
            </button>
          </div>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Ingredient Name
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
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                list="category-suggestions"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <datalist id="category-suggestions">
                <option value="Fruits" />
                <option value="Vegetables" />
                <option value="Dairy" />
                <option value="Dairy Alternatives" />
                <option value="Sweeteners" />
                <option value="Supplements" />
                <option value="Nuts & Seeds" />
                <option value="Liquids" />
              </datalist>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock Amount
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="lb">Pound (lb)</option>
                <option value="oz">Ounce (oz)</option>
                <option value="l">Liter (l)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="pcs">Pieces (pcs)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price per Unit ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
                Supplier
              </label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="lastRestock" className="block text-sm font-medium text-gray-700">
                Last Restock Date
              </label>
              <input
                type="date"
                id="lastRestock"
                name="lastRestock"
                value={formData.lastRestock}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
          
          {formData.stock < 50 && (
            <div className="bg-amber-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Low Stock Warning</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      This ingredient is currently at a low stock level. Consider restocking soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Ingredient"
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
              Are you sure you want to delete the ingredient "{ingredientToDelete?.name}"? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Ingredients;