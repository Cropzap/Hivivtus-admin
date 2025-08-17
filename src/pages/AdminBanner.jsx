import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

// --- API Configuration ---
// Make sure your Node.js/Express server is running at this URL.
const API_URL = 'http://localhost:5000/api/banners';

// --- Main AdminBanner Component ---
const AdminBanner = () => {
  // --- State Management ---
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // For carousel navigation
  const [form, setForm] = useState({
    image: '',
    title: '',
    description: '',
    buttonText: 'Shop Now',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    contentPosition: 'left'
  });

  // --- Refs for Carousel ---
  const carouselRef = useRef(null);
  const itemRefs = useRef([]);

  // --- API Functions for CRUD Operations ---
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch banners.');
      }
      const data = await response.json();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!form.title) {
      console.error("Please provide a title.");
      return;
    }
    try {
      if (currentBanner) {
        // Update an existing banner
        const response = await fetch(`${API_URL}/${currentBanner._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error('Failed to update banner.');
      } else {
        // Add a new banner
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error('Failed to add banner.');
      }
      fetchBanners(); // Refresh the list after success
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save banner:", error);
    }
  };

  const handleDelete = async (id) => {
    // Custom modal instead of window.confirm for Canvas environment
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete banner.');
        fetchBanners(); // Refresh the list after deletion
      } catch (error) {
        console.error("Failed to delete banner:", error);
      }
    }
  };

  // --- Form and Modal Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openModalForEdit = (banner) => {
    setCurrentBanner(banner);
    setForm(banner);
    setIsModalOpen(true);
  };

  const openModalForAdd = () => {
    setCurrentBanner(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setForm({
      image: '',
      title: '',
      description: '',
      buttonText: 'Shop Now',
      bgColor: 'bg-white',
      textColor: 'text-gray-800',
      contentPosition: 'left'
    });
  };

  // --- Carousel Navigation and Sizing Logic ---
  const calculateTransform = () => {
    if (!carouselRef.current || itemRefs.current.length === 0 || banners.length === 0) return 0;
    const containerWidth = carouselRef.current.offsetWidth;
    const currentItem = itemRefs.current[currentIndex];
    if (!currentItem) return 0;
    const currentItemOffsetLeft = currentItem.offsetLeft;
    const currentItemWidth = currentItem.offsetWidth;
    const targetScroll = currentItemOffsetLeft - (containerWidth / 2 - currentItemWidth / 2);
    return -targetScroll;
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
  };

  // --- Lifecycle Hooks ---
  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    // Recalculate transform when currentIndex or banners change
    itemRefs.current = itemRefs.current.slice(0, banners.length);
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(${calculateTransform()}px)`;
    }
  }, [currentIndex, banners.length]);

  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        carouselRef.current.style.transform = `translateX(${calculateTransform()}px)`;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, banners.length]);

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 font-sans">
        <p className="text-gray-500 text-xl">Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 pt-8 pb-4">
        Banner Management
      </h1>
      <p className="text-center text-gray-600 mb-8">
        (Scroll down to see the Admin Dashboard)
      </p>

      {/* --- Banner Carousel Section --- */}
      <div className="relative w-full overflow-hidden py-6">
        <div
          ref={carouselRef}
          className="flex transition-transform duration-700 ease-in-out px-4 md:px-8 lg:px-12"
        >
          {banners.length === 0 ? (
            <div className="w-full flex justify-center items-center h-56 text-gray-500">
              No banners available. Add one from the admin panel below.
            </div>
          ) : (
            banners.map((banner, index) => (
              <div
                key={banner._id}
                ref={(el) => (itemRefs.current[index] = el)}
                className={`flex-shrink-0 mx-2 transform transition-all duration-300 ease-in-out
                  ${index === currentIndex
                    ? 'w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw] xl:w-[30vw]'
                    : 'w-[70vw] sm:w-[45vw] md:w-[30vw] lg:w-[25vw] xl:w-[20vw] opacity-70 scale-[0.9]'
                  }
                `}
              >
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-2xl flex items-stretch h-56 sm:h-64 md:h-72 lg:h-80 transform hover:scale-[1.01] transition-transform duration-300
                    ${index === currentIndex ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-gray-50' : ''}
                  `}
                  style={{
                    backgroundImage: `url(${banner.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-t ${banner.textColor === 'text-white' ? 'from-black/50 to-transparent' : 'from-black/30 to-transparent'}`}></div>
                  <div className={`absolute inset-0 ${banner.bgColor} opacity-60`}></div>
                  <div className={`relative z-10 flex flex-col justify-end p-4 sm:p-6 pb-6 ${banner.contentPosition === 'left' ? 'items-start' : 'items-end'} w-full`}>
                    <div className={`max-w-[80%] ${banner.contentPosition === 'left' ? 'text-left' : 'text-right'} ${banner.textColor}`}>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-1 sm:mb-2 leading-tight drop-shadow-lg">
                        {banner.title}
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 opacity-90 drop-shadow">
                        {banner.description}
                      </p>
                      <button className={`
                        px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold
                        text-sm sm:text-base
                        ${banner.textColor === 'text-white' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'}
                        shadow-xl hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5
                      `}>
                        {banner.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute top-1/2 left-2 md:left-4 lg:left-6 -translate-y-1/2 bg-white rounded-full p-2.5 sm:p-3 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transform hover:scale-110 transition-transform z-20"
            >
              <FaChevronLeft className="text-gray-700 text-lg sm:text-xl" />
            </button>
            <button
              onClick={goToNext}
              className="absolute top-1/2 right-2 md:right-4 lg:right-6 -translate-y-1/2 bg-white rounded-full p-2.5 sm:p-3 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transform hover:scale-110 transition-transform z-20"
            >
              <FaChevronRight className="text-gray-700 text-lg sm:text-xl" />
            </button>
          </>
        )}
      </div>

      <div className="w-full h-8 bg-gray-200 my-8"></div>

      {/* --- Admin Dashboard Section --- */}
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Banner Admin Dashboard</h1>
          <button
            onClick={openModalForAdd}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add New Banner
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Existing Banners</h2>
          <div className="space-y-4">
            {banners.length === 0 ? (
              <p className="text-gray-500">No banners found. Add a new one to get started.</p>
            ) : (
              banners.map((banner) => (
                <div
                  key={banner._id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium truncate">{banner.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{banner.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModalForEdit(banner)}
                      className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Modal for Add/Edit Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
              <h2 className="text-2xl font-bold mb-4">
                {currentBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddOrUpdate(); }} className="space-y-4">
                <div>
                  <label className="block text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Button Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={form.buttonText}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Background Color (Tailwind class)</label>
                  <input
                    type="text"
                    name="bgColor"
                    value={form.bgColor}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Text Color (Tailwind class)</label>
                  <input
                    type="text"
                    name="textColor"
                    value={form.textColor}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Content Position</label>
                  <select
                    name="contentPosition"
                    value={form.contentPosition}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {currentBanner ? 'Update Banner' : 'Add Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBanner;
