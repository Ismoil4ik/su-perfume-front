import React, { useState, useEffect } from "react";

// Product Card Component for Admin
const AdminProductCard = ({ product, onDelete }) => {
  const originalPrice = product.cost * 1.54;

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 relative">
      {/* Delete Button */}
      <button
        onClick={() => onDelete(product._id)}
        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
        title="Удалить товар"
      >
        ✕
      </button>

      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={product.imgURL}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/300';
          }}
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.brand}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-500 text-sm line-through">${originalPrice.toFixed(2)}</span>
          <span className="text-lg font-semibold text-red-600">${product.cost.toFixed(2)}</span>
        </div>

        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {product.description}
        </p>
      </div>
    </div>
  );
};

// Add Product Form Component
const AddProductForm = ({ onAddProduct, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    cost: '',
    description: '',
    imgURL: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadMethod, setImageUploadMethod] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Convert file to base64 URL
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload file to server
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      // Здесь нужно будет заменить на ваш endpoint для загрузки изображений
      const response = await fetch('https://su-perfume-api-production.up.railway.app/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки изображения');
      }

      const data = await response.json();
      return data.imageUrl; // Предполагаем, что сервер возвращает { imageUrl: "..." }
    } catch (error) {
      console.error('Upload error:', error);
      // Fallback - используем base64 если нет сервера для загрузки
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = formData.imgURL;

      // If file upload method is selected and file is chosen
      if (imageUploadMethod === 'file' && selectedFile) {
        imageUrl = await convertFileToBase64(selectedFile);
      }

      // Validate that we have an image URL
      if (!imageUrl && imageUploadMethod === 'url') {
        alert('Пожалуйста, введите URL изображения');
        setIsSubmitting(false);
        return;
      }

      if (!imageUrl && imageUploadMethod === 'file') {
        alert('Пожалуйста, выберите файл изображения');
        setIsSubmitting(false);
        return;
      }

      const productData = {
        ...formData,
        cost: parseFloat(formData.cost),
        imgURL: imageUrl
      };

      // Get token from localStorage
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch('https://su-perfume-api-production.up.railway.app/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении товара');
      }

      // Reset form
      setFormData({
        name: '',
        brand: '',
        cost: '',
        description: '',
        imgURL: ''
      });
      setSelectedFile(null);
      setImagePreview('');

      onAddProduct();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Ошибка при добавлении товара');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");  // Clear user data from local storage
    localStorage.removeItem("accessToken");  // Clear access token from local storage
    window.location.reload();  // Reload the page after logout
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Добавить новый товар</h2>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="text-sm w-[70px] text-white h-[35px] bg-red-600 rounded-[10px]"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название товара
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Введите название товара"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Бренд
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Введите бренд"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цена ($)
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Способ добавления изображения
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="url"
                  checked={imageUploadMethod === 'url'}
                  onChange={(e) => {
                    setImageUploadMethod(e.target.value);
                    setSelectedFile(null);
                    setImagePreview('');
                  }}
                  className="mr-2"
                />
                По URL
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={imageUploadMethod === 'file'}
                  onChange={(e) => {
                    setImageUploadMethod(e.target.value);
                    setFormData(prev => ({ ...prev, imgURL: '' }));
                  }}
                  className="mr-2"
                />
                Из галереи
              </label>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          {imageUploadMethod === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL изображения
              </label>
              <input
                type="url"
                name="imgURL"
                value={formData.imgURL}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Выберите изображение
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                <p className="text-xs text-gray-500">
                  Поддерживаемые форматы: JPG, PNG, GIF, WebP. Максимальный размер: 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {(imagePreview || (imageUploadMethod === 'url' && formData.imgURL)) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Предварительный просмотр
            </label>
            <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
              <img
                src={imagePreview || formData.imgURL}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Введите описание товара"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Добавление...' : 'Добавить товар'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Admin Form Component
const AddAdminForm = ({ loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const adminData = {
        ...formData,
        role: "ADMIN" // Автоматически устанавливаем роль ADMIN
      };

      // Get token from localStorage
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch('https://su-perfume-api-production.up.railway.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(adminData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при добавлении администратора');
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: ''
      });

      alert('Администратор успешно добавлен!');
    } catch (error) {
      console.error('Error adding admin:', error);
      alert(error.message || 'Ошибка при добавлении администратора');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Добавить нового администратора</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя администратора
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Введите имя администратора"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Пароль
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Введите пароль (минимум 6 символов)"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Добавление...' : 'Добавить администратора'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Main Admin Layout Component
const AdminLayout = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("https://su-perfume-api-production.up.railway.app/api/products");
      if (!response.ok) {
        throw new Error('Ошибка загрузки товаров');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Ошибка загрузки товаров");
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product
  const deleteProduct = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      // Get token from localStorage
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(`https://su-perfume-api-production.up.railway.app/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении товара');
      }

      // Remove product from local state
      setProducts(prev => prev.filter(product => product._id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert('Ошибка при удалении товара');
    }
  };

  // Handle product addition
  const handleAddProduct = () => {
    fetchProducts(); // Refresh products list
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-wide">
            АДМИН ПАНЕЛЬ
          </h1>
          <p className="text-gray-600">Управление товарами</p>
        </div>

        {/* Add Product Form */}
        <AddProductForm onAddProduct={handleAddProduct} loading={loading} />

        {/* Add Admin Form */}
        <AddAdminForm loading={loading} />

        {/* Products Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Все товары</h2>
          {!loading && !error && (
            <p className="text-gray-600 text-sm">
              Всего товаров: {products.length}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-2">Ошибка загрузки товаров</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
            >
              Перезагрузить
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <AdminProductCard
                key={product._id}
                product={product}
                onDelete={deleteProduct}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl">📦</span>
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-2">Товары отсутствуют</p>
            <p className="text-gray-400 text-sm">Добавьте первый товар, используя форму выше</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;