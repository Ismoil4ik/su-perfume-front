import React, { useState, useEffect, useMemo } from "react";
import { Heart, Filter } from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";

// Product Card Component
const ProductCard = ({ product, isInFavorites, isInCart, onToggleFavorite, onAddToCart }) => {
  const originalPrice = product.cost * 1.54;

  return (
    <div className="group mt-[] bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 w-full">
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={product.imgURL}
          alt={product.name}
          className="w-full mt-[6px] h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/300';
          }}
        />
        <button
          onClick={() => onToggleFavorite(product)}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm touch-manipulation"
        >
          <Heart
            className={`w-4 h-4 ${isInFavorites ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2">{product.brand}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-500 text-xs sm:text-sm line-through">${originalPrice.toFixed(2)}</span>
          <span className="text-base sm:text-lg font-semibold text-red-600">${product.cost.toFixed(2)}</span>
        </div>

        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {product.description}
        </p>

        <button
          onClick={() => onAddToCart(product)}
          className="w-full bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors duration-200 text-xs sm:text-sm font-medium touch-manipulation"
        >
          В корзину
        </button>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-200">
      <img
        src={item.imgURL}
        alt={item.name}
        className="w-full sm:w-16 h-32 sm:h-16 object-cover rounded"
        onError={(e) => {
          e.target.src = '/api/placeholder/300/300';
        }}
      />

      <div className="flex-1 w-full sm:w-auto">
        <h3 className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</h3>
        <p className="text-xs sm:text-sm text-gray-600">{item.brand}</p>
        <p className="text-base sm:text-lg font-semibold text-red-600">${item.cost.toFixed(2)}</p>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
            className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 touch-manipulation"
          >
            -
          </button>
          <span className="w-8 text-center text-sm sm:text-base">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
            className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 touch-manipulation"
          >
            +
          </button>
        </div>

        <button
          onClick={() => onRemove(item._id)}
          className="text-red-500 hover:text-red-700 text-lg sm:text-base touch-manipulation"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12 sm:py-20">
    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Modal for order form
const Modal = ({ isOpen, onClose, onSubmit, formData, setFormData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-sm sm:max-w-md md:w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Введите данные для заказа</h2>

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm text-gray-700 mb-1">Полное имя</label>
          <input
            id="name"
            type="text"
            className="w-full p-2 sm:p-3 border border-gray-300 rounded text-sm sm:text-base"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">Номер телефона</label>
          <input
            id="phone"
            type="tel"
            className="w-full p-2 sm:p-3 border border-gray-300 rounded text-sm sm:text-base"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="address" className="block text-sm text-gray-700 mb-1">Адрес</label>
          <input
            id="address"
            type="text"
            className="w-full p-2 sm:p-3 border border-gray-300 rounded text-sm sm:text-base"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-2 sm:py-3 px-4 rounded hover:bg-gray-600 text-sm sm:text-base touch-manipulation order-2 sm:order-1"
          >
            Отмена
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="bg-blue-600 text-white py-2 sm:py-3 px-4 rounded hover:bg-blue-700 text-sm sm:text-base touch-manipulation order-1 sm:order-2"
          >
            Подтвердить заказ
          </button>
        </div>
      </div>
    </div>
  );
};

// Main UserLayout Component
const UserLayout = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('products'); // 'products', 'favorites', 'cart'

  // NEW: price & brand filters
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Все бренды");
  const [showFilters, setShowFilters] = useState(false);
  // сортировка
  const [sortBy, setSortBy] = useState('relevance');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      const savedCart = localStorage.getItem('cart');

      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("https://su-perfume-api-production.up.railway.app/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message || "Ошибка загрузки товаров");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const saveFavoritesToStorage = (newFavorites) => localStorage.setItem('favorites', JSON.stringify(newFavorites));
  const saveCartToStorage = (newCart) => localStorage.setItem('cart', JSON.stringify(newCart));

  const toggleFavorite = (product) => {
    const isInFavorites = favorites.some(fav => fav._id === product._id);
    const newFavorites = isInFavorites ? favorites.filter(fav => fav._id !== product._id) : [...favorites, product];
    setFavorites(newFavorites);
    saveFavoritesToStorage(newFavorites);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    const newCart = existingItem
      ? cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item._id !== productId);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) return removeFromCart(productId);
    const newCart = cart.map(item => item._id === productId ? { ...item, quantity: newQuantity } : item);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const brands = useMemo(() => {
    const set = new Set();
    products.forEach(p => { if (p.brand) set.add(p.brand.trim()); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;
    return products.filter((product) => {
      if (!product) return false;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || product.name?.toLowerCase().includes(q) || product.brand?.toLowerCase().includes(q);
      const matchesBrand = selectedBrand === "Все бренды" || product.brand === selectedBrand;
      const price = Number(product.cost) || 0;
      const matchesMin = min === null || price >= min;
      const matchesMax = max === null || price <= max;
      return matchesSearch && matchesBrand && matchesMin && matchesMax;
    });
  }, [products, searchQuery, selectedBrand, minPrice, maxPrice]);

  // сортируем уже отфильтрованные товары
  const finalProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case 'price_asc':
        arr.sort((a, b) => (Number(a?.cost) || 0) - (Number(b?.cost) || 0));
        break;
      case 'price_desc':
        arr.sort((a, b) => (Number(b?.cost) || 0) - (Number(a?.cost) || 0));
        break;
      case 'name_asc':
        arr.sort((a, b) => (a?.name || '').localeCompare(b?.name || '', 'en', { sensitivity: 'base' }));
        break;
      case 'name_desc':
        arr.sort((a, b) => (b?.name || '').localeCompare(a?.name || '', 'en', { sensitivity: 'base' }));
        break;
      default:
        break;
    }
    return arr;
  }, [filteredProducts, sortBy]);

  const getTotalPrice = () => cart.reduce((total, item) => total + (item.cost * item.quantity), 0);

  const resetFilters = () => {
    setSelectedBrand("Все бренды");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setShowFilters(false);
  };

  // ========= ВСТАВЛЕНО: ОТПРАВКА ЗАКАЗА В TELEGRAM (из твоего кода) =========
  // ⚠️ Токен и chat_id будут видны на фронте. Делайте так только если осознанно идёте на риск.
  // Если это ПРОД — лучше вынести на бэкенд/серверлесс.

  const BOT_TOKEN = '7738887365:AAGvv6wBsAoc2pRXYAP0MSc3_oQw-eiMNho';
  // Для КАНАЛА можно указать @username, для ГРУППЫ — ТОЛЬКО numeric id вида -100xxxxxxxxxx
  const CHAT_ID = '-1002760665113'; // <-- подставьте id вашей группы/канала (или @channelusername только для канала)

  const sendOrderToTelegram = async (orderDetails) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const message =
      `Новый заказ:
Товары:
${orderDetails.items.map(item => `• ${item.name} x ${item.quantity} — $${(Number(item.cost) * Number(item.quantity)).toFixed(2)}`).join('\n')}

Общая сумма: $${Number(orderDetails.totalPrice).toFixed(2)}

Имя: ${orderDetails.name}
Телефон: ${orderDetails.phone}
Адрес: ${orderDetails.address}`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,        // можно добавить parse_mode: 'HTML' и форматировать <b>...</b>
        // parse_mode: 'HTML',
        // disable_web_page_preview: true,
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`Telegram error: ${t}`);
    }
  };

  // =========================================================================

  // обработка отправки заказа — теперь отправляет в Telegram
  const handleOrderSubmit = async (data) => {
    try {
      if (!data.name.trim() || !data.phone.trim() || !data.address.trim()) {
        alert('Заполните все поля.');
        return;
      }
      if (cart.length === 0) {
        alert('Корзина пуста.');
        return;
      }

      const orderDetails = {
        items: cart,
        totalPrice: getTotalPrice(),
        ...data,
      };

      await sendOrderToTelegram(orderDetails);

      // очистка UI
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', address: '' });

      // очищаем корзину и localStorage
      setCart([]);
      localStorage.setItem('cart', JSON.stringify([]));

      alert('Заказ отправлен! Мы свяжемся с вами.');
    } catch (err) {
      alert('Не удалось отправить заказ. Попробуйте ещё раз.');
    }
  };

  return (
    <div className="min-h-screen mt-[30px] bg-white">
      <Navbar
        setSearchQuery={setSearchQuery}
        currentView={currentView}
        setCurrentView={setCurrentView}
        favoritesCount={favorites.length}
        cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 tracking-wide">
            {currentView === 'favorites' ? 'ИЗБРАННОЕ' : currentView === 'cart' ? 'КОРЗИНА' : 'NEW ARRIVALS'}
          </h1>
        </div>

        {currentView !== 'products' && (
          <div className="mb-4 sm:mb-6">
            <button onClick={() => setCurrentView('products')} className="text-[black] text-base sm:text-[18px] hover:text-blue-800 touch-manipulation">
              ← Назад к товарам
            </button>
          </div>
        )}

        {!loading && !error && currentView === 'products' && (
          <div className="mb-6 sm:mb-8 bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-1">Поиск</label>
                <input
                  type="text"
                  placeholder="Название или бренд..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded text-sm sm:text-base"
                />
              </div>
              {/* Сортировка */}
              <div className="w-full sm:w-56">
                <label className="block text-sm text-gray-700 mb-1">Сортировка</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded bg-white text-sm sm:text-base"
                >
                  <option value="relevance">По умолчанию</option>
                  <option value="price_asc">Цена: по возрастанию</option>
                  <option value="price_desc">Цена: по убыванию</option>
                  <option value="name_asc">Название: A → Z</option>
                  <option value="name_desc">Название: Z → A</option>
                </select>
              </div>

              {/* Кнопка фильтров */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded hover:bg-gray-50 text-sm sm:text-base touch-manipulation"
              >
                <Filter className="w-4 h-4" /> Фильтры
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Цена от ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Цена до ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Бренд</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded bg-white text-sm sm:text-base"
                  >
                    <option>Все бренды</option>
                    {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <button
                  onClick={resetFilters}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm touch-manipulation"
                >
                  Сбросить
                </button>
              </div>
            )}

            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
              Найдено товаров: <span className="font-medium text-gray-900">{filteredProducts.length}</span>
            </div>
          </div>
        )}

        {loading && <LoadingSpinner />}
        {error && <div className="text-center text-red-600 px-4 py-8 text-sm sm:text-base">{error}</div>}

        {!loading && !error && currentView === 'products' && (
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {finalProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isInFavorites={favorites.some(fav => fav._id === product._id)}
                  isInCart={cart.some(item => item._id === product._id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-12 sm:py-16 px-4 text-sm sm:text-base">
              Товары не найдены. Измените параметры фильтра.
            </div>
          )
        )}

        {/* Favorites View (оставь products как есть, это просто ДОБАВКА) */}
        {currentView === 'favorites' && !loading && !error && (
          favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {favorites.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isInFavorites={favorites.some((fav) => fav._id === product._id)}
                  isInCart={cart.some((item) => item._id === product._id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-12 sm:py-16 px-4 text-sm sm:text-base">
              Список избранного пуст.
            </div>
          )
        )}


        {/* Cart View */}
        {!loading && !error && currentView === 'cart' && (
          cart.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {cart.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateCartQuantity}
                  />
                ))}
              </div>

              <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                  <span className="text-base sm:text-lg font-medium">Общая сумма:</span>
                  <span className="text-xl sm:text-2xl font-bold text-red-600">${getTotalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded hover:bg-gray-800 transition-colors duration-200 font-medium text-sm sm:text-base touch-manipulation"
                >
                  Заказать
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600 py-12 sm:py-16 px-4 text-sm sm:text-base">
              Ваша корзина пуста.
            </div>
          )
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleOrderSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 text-center">
          <p className="text-gray-600 text-xs sm:text-sm">
            © 2025 Su Perfume. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;