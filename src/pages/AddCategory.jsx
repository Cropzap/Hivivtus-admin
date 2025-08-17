import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Save, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';

// The main application component
const App = () => {
  // State for managing categories, loading status, and errors
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modal management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  // State for subcategory list expansion
  const [isSubcategoryExpanded, setIsSubcategoryExpanded] = useState({});

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Base URL for the API. Change this if your backend is on a different port or host.
  const API_URL = 'http://localhost:5000/api/categories';

  // Function to fetch all categories from the backend
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories. Please check your network and server connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on initial component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to open the modal for adding a new category
  const handleAddCategory = () => {
    setCurrentCategory(null); // Reset to null for "add" mode
    setIsModalOpen(true);
  };

  // Function to open the modal for editing an existing category
  const handleEditCategory = (category) => {
    setCurrentCategory(category); // Set the category to be edited
    setIsModalOpen(true);
  };

  // Function to open the delete confirmation modal
  const handleDeleteCategoryPrompt = (categoryId) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  // Function to perform the deletion
  const handleDeleteCategory = async () => {
    setIsDeleteModalOpen(false); // Close the modal first
    if (!categoryToDelete) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${categoryToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Re-fetch the categories to update the UI
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category.');
    } finally {
      setLoading(false);
      setCategoryToDelete(null); // Clear the category to delete
    }
  };

  // Toggle subcategory list visibility
  const toggleSubcategories = (categoryId) => {
    setIsSubcategoryExpanded(prevState => ({
      ...prevState,
      [categoryId]: !prevState[categoryId],
    }));
  };

  // Main Category List View Component
  const CategoryListView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-600 text-center p-4 bg-red-100 rounded-lg border border-red-200">
          {error}
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Manage Categories
          </h2>
          <button
            onClick={handleAddCategory}
            className="flex items-center px-6 py-3 bg-emerald-500 text-white rounded-full font-bold shadow-md hover:bg-emerald-600 transition-colors duration-300"
          >
            <Plus size={24} className="mr-2" /> Add New
          </button>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center text-gray-500 py-20 text-lg">No categories found. Click 'Add New' to create one.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden mr-4 shadow-sm border border-gray-200 flex-shrink-0">
                      <img
                        src={category.mainImage}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/100x100/F3F4F6/6B7280?text=Category";
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 flex-1 break-words">
                      {category.name}
                    </h3>
                  </div>

                  <div className="flex-1 mt-auto">
                    <div className="border-t border-gray-200 pt-4">
                      <div
                        className="flex justify-between items-center cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                        onClick={() => toggleSubcategories(category._id)}
                      >
                        <span className="font-medium text-sm">
                          Subcategories ({category.subcategories.length})
                        </span>
                        {isSubcategoryExpanded[category._id] ? (
                          <ChevronUp size={20} className="transform scale-125" />
                        ) : (
                          <ChevronDown size={20} className="transform scale-125" />
                        )}
                      </div>
                      {isSubcategoryExpanded[category._id] && (
                        <ul className="mt-4 text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                          {category.subcategories.length === 0 ? (
                            <li className="italic text-gray-400">No subcategories.</li>
                          ) : (
                            category.subcategories.map((sub, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <span className="w-4 h-4 flex-shrink-0 text-gray-400">
                                  <ImageIcon size={16} />
                                </span>
                                <span>{sub.name}</span>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4 self-end">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors shadow-sm transform hover:scale-110"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategoryPrompt(category._id)}
                      className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm transform hover:scale-110"
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Modal for adding or editing a category
  const CategoryModal = () => {
    const [name, setName] = useState(currentCategory?.name || '');
    const [mainImage, setMainImage] = useState(currentCategory?.mainImage || '');
    const [subcategories, setSubcategories] = useState(currentCategory?.subcategories || [{ name: '', image: '' }]);
    const [modalError, setModalError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      setModalError(null);
      setIsSaving(true);
    
      if (!name.trim()) {
        setModalError('Category name is required.');
        setIsSaving(false);
        return;
      }
    
      const subcategoriesWithNames = subcategories.filter(sub => sub.name.trim() !== '');
      const categoryData = {
        name,
        mainImage: mainImage || 'https://placehold.co/250x250/E0E0E0/555555?text=Main',
        subcategories: subcategoriesWithNames.map(sub => ({
          ...sub,
          image: sub.image || 'https://placehold.co/100x100/E0E0E0/333333?text=Sub'
        })),
      };
    
      try {
        const url = currentCategory ? `${API_URL}/${currentCategory._id}` : API_URL;
        const method = currentCategory ? 'PUT' : 'POST';
    
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
    
        // Re-fetch categories to update the list and close the modal
        await fetchCategories();
        setIsModalOpen(false);
      } catch (err) {
        console.error('Error saving category:', err);
        setModalError(err.message || 'Failed to save category. Please try again.');
      } finally {
        setIsSaving(false);
      }
    };
    
    // Add a new empty subcategory
    const handleAddSubcategory = () => {
      setSubcategories([...subcategories, { name: '', image: '' }]);
    };
    
    // Update a subcategory's details
    const handleSubcategoryChange = (index, field, value) => {
      const newSubcategories = [...subcategories];
      newSubcategories[index][field] = value;
      setSubcategories(newSubcategories);
    };
    
    // Remove a subcategory
    const handleRemoveSubcategory = (index) => {
      const newSubcategories = [...subcategories];
      newSubcategories.splice(index, 1);
      setSubcategories(newSubcategories);
    };

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100 ease-out duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {currentCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full" aria-label="Close modal">
              <X size={24} />
            </button>
          </div>
          
          {modalError && (
            <div className="bg-red-100 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative mb-4" role="alert">
              <span className="block sm:inline">{modalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>
            
            <div>
              <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
              <input
                type="url"
                id="mainImage"
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="e.g., https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-3">Subcategories</h4>
              {subcategories.map((sub, index) => (
                <div key={index} className="flex items-center space-x-3 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex-1 space-y-2">
                    <label className="sr-only">Subcategory Name</label>
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => handleSubcategoryChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Subcategory Name"
                    />
                    <label className="sr-only">Subcategory Image</label>
                    <input
                      type="url"
                      value={sub.image}
                      onChange={(e) => handleSubcategoryChange(index, 'image', e.target.value)}
                      className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Image URL (optional)"
                    />
                  </div>
                  {subcategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full"
                      aria-label="Remove subcategory"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="flex items-center px-4 py-2 mt-2 text-sm text-emerald-600 font-medium rounded-full border border-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Plus size={16} className="mr-2" /> Add Subcategory
              </button>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded-full text-gray-700 bg-gray-200 font-medium hover:bg-gray-300 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-6 py-2 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-solid mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" /> Save
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Confirmation Modal for Deletion
  const DeleteConfirmationModal = () => {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 ease-out duration-300">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <Trash2 size={48} />
          </div>
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Confirm Deletion</h3>
          <p className="text-center text-gray-600 mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
              }}
              className="px-6 py-2 rounded-full text-gray-700 bg-gray-200 font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCategory}
              className="px-6 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans antialiased min-h-screen p-4 sm:p-8 bg-gray-100 text-gray-900">
      <div className="container mx-auto">
        {/* Render the category list view */}
        <CategoryListView />
        
        {/* Render the modals conditionally */}
        {isModalOpen && <CategoryModal />}
        {isDeleteModalOpen && <DeleteConfirmationModal />}
      </div>
    </div>
  );
};

export default App;
