import { useEffect, useState, useRef, useCallback } from 'react';
import Modal from '../Modal';
import { fetchProducts } from '../../api/productService';
import useDebounce from '../../hooks/useDebounce';

const SelectProductModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedProducts = [],
  editingProductIndex = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Store IDs of products that are already selected in other product items
  const [alreadySelectedProductIds, setAlreadySelectedProductIds] = useState(
    new Set()
  );
  const productsPerPage = 10;
  const containerRef = useRef(null);
  const initialLoadRef = useRef(false);
  const searchChangeRef = useRef(false);

  // Calculate products that are already selected in other product items
  useEffect(() => {
    if (isOpen && editingProductIndex !== null) {
      const selectedProductIds = new Set();

      selectedProducts.forEach((product, index) => {
        // Skip the product being edited
        if (index !== editingProductIndex && product.productId) {
          selectedProductIds.add(product.productId);
        }
      });

      setAlreadySelectedProductIds(selectedProductIds);
    } else {
      setAlreadySelectedProductIds(new Set());
    }
  }, [isOpen, selectedProducts, editingProductIndex]);

  const loadProducts = useCallback(
    async (reset = false) => {
      if (isLoading) return;

      try {
        setIsLoading(true);
        setError(null);

        const currentPage = reset ? 0 : page;

        console.log(
          `Fetching products: page=${currentPage}, search=${debouncedSearchTerm}`
        );

        const response = await fetchProducts({
          search: debouncedSearchTerm,
          page: currentPage,
          limit: productsPerPage,
        });

        // Filter products for display
        let filteredProducts = response;

        // In edit mode, filter out products that are already selected in other items
        if (
          editingProductIndex !== null &&
          alreadySelectedProductIds.size > 0
        ) {
          filteredProducts = response.filter(
            (product) => !alreadySelectedProductIds.has(product.id)
          );
        }

        // If we received fewer items than requested, there are no more items
        const noMoreItems = filteredProducts.length < productsPerPage;
        setHasMore(!noMoreItems);

        setDisplayedProducts((prev) =>
          reset ? filteredProducts : [...prev, ...filteredProducts]
        );

        if (!reset) {
          setPage(currentPage + 1);
        } else {
          setPage(1); // After reset, next page to fetch will be 1
        }
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      page,
      debouncedSearchTerm,
      productsPerPage,
      isLoading,
      editingProductIndex,
      alreadySelectedProductIds,
    ]
  );

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 20; // pixels from bottom to trigger load

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadProducts(false);
    }
  }, [loadProducts, hasMore, isLoading]);

  const toggleProductSelection = (product, variant) => {
    setSelectedItems((items) => {
      const existingProductIndex = items.findIndex(
        (item) => item.productId === product.id
      );

      if (existingProductIndex >= 0) {
        const productItem = items[existingProductIndex];
        const variantIndex = productItem.variants.findIndex(
          (v) => v.id === variant.id
        );

        const updatedItems = [...items];
        if (variantIndex >= 0) {
          const updatedVariants = [...productItem.variants];
          updatedVariants.splice(variantIndex, 1);

          if (updatedVariants.length === 0) {
            updatedItems.splice(existingProductIndex, 1);
          } else {
            updatedItems[existingProductIndex] = {
              ...productItem,
              variants: updatedVariants,
            };
          }
        } else {
          updatedItems[existingProductIndex] = {
            ...productItem,
            variants: [...productItem.variants, variant],
          };
        }
        return updatedItems;
      } else {
        return [
          ...items,
          {
            productId: product.id,
            productTitle: product.title,
            productImage: product.image,
            variants: [variant],
          },
        ];
      }
    });
  };

  const isSelected = (productId, variantId) => {
    const product = selectedItems.find((item) => item.productId === productId);
    return product ? product.variants.some((v) => v.id === variantId) : false;
  };

  const handleAdd = () => {
    onSelect(selectedItems);
    onClose();
  };

  // Handle modal open/close and initial data loading
  useEffect(() => {
    if (isOpen) {
      setPage(0);
      setHasMore(true);
      setDisplayedProducts([]);
      searchChangeRef.current = false;

      let initialSelectedItems = [];

      if (
        editingProductIndex !== null &&
        selectedProducts[editingProductIndex]
      ) {
        const editingProduct = selectedProducts[editingProductIndex];

        if (
          editingProduct.productId &&
          Array.isArray(editingProduct.variants) &&
          editingProduct.variants.length > 0
        ) {
          initialSelectedItems.push({
            productId: editingProduct.productId,
            productTitle: editingProduct.productTitle || '',
            productImage: editingProduct.productImage || { src: '' },
            variants: editingProduct.variants,
          });
        }
      }

      setSelectedItems(initialSelectedItems);
      initialLoadRef.current = true;
    } else {
      setSearchTerm('');
    }
  }, [isOpen, selectedProducts, editingProductIndex]);

  // Handle search term changes and initial load
  useEffect(() => {
    if (!isOpen) return;

    if (initialLoadRef.current) {
      console.log('Initial load');
      initialLoadRef.current = false;
      loadProducts(true);
    } else if (searchChangeRef.current) {
      // This is a search term change
      console.log('Search changed');
      searchChangeRef.current = false;
      loadProducts(true);
    }
  }, [isOpen, loadProducts, debouncedSearchTerm]);

  // When search term changes, set flag to trigger a search
  useEffect(() => {
    if (isOpen && debouncedSearchTerm !== undefined) {
      // Don't call loadProducts directly from here to avoid duplicate calls
      searchChangeRef.current = true;
      setPage(0);
      setHasMore(true);
      setDisplayedProducts([]); // Clear displayed products when search changes
    }
  }, [debouncedSearchTerm, isOpen]);

  // Scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Helper function to determine if a product is disabled
  const isProductDisabled = (productId) => {
    return alreadySelectedProductIds.has(productId);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingProductIndex !== null ? 'Edit Product' : 'Select Product'}
        size="7xl"
        customFooter={
          <div className="flex items-center justify-between">
            <span>{selectedItems.length} product variant(s) selected</span>
            <div className="flex gap-4">
              <button
                className="btn btn-outline border-[#00000066] text-[#00000066]"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary text-white"
                onClick={handleAdd}
              >
                Add
              </button>
            </div>
          </div>
        }
      >
        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search product"
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute top-1/2 left-3 -translate-y-1/2 transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div
            ref={containerRef}
            className="max-h-80 overflow-y-auto rounded-md"
          >
            {error && (
              <div className="p-4 text-center text-red-500">
                {error}
                <button
                  className="ml-2 text-blue-500 underline"
                  onClick={() => loadProducts(true)}
                >
                  Try Again
                </button>
              </div>
            )}

            {displayedProducts.map((product, i) => (
              <div key={`${product.id}-${i}`} className="border-b">
                <div
                  className={`flex items-center border-b border-gray-300 bg-gray-50 p-3 ${isProductDisabled(product.id) ? 'opacity-50' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="checkbox mr-3"
                    checked={product.variants.some((v) =>
                      isSelected(product.id, v.id)
                    )}
                    onChange={() => {
                      if (!isProductDisabled(product.id)) {
                        const allSelected = product.variants.every((v) =>
                          isSelected(product.id, v.id)
                        );
                        product.variants.forEach((v) => {
                          if (allSelected) {
                            if (isSelected(product.id, v.id)) {
                              toggleProductSelection(product, v);
                            }
                          } else if (!isSelected(product.id, v.id)) {
                            toggleProductSelection(product, v);
                          }
                        });
                      }
                    }}
                    disabled={isProductDisabled(product.id)}
                  />
                  <div className="flex items-center">
                    <img
                      src={product.image.src}
                      alt={product.title}
                      className="mr-3 h-10 w-10 object-cover"
                    />
                    <span className="font-medium">{product.title}</span>
                  </div>
                </div>

                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`flex items-center justify-between border-b border-gray-300 p-3 pl-16 hover:bg-gray-50 ${isProductDisabled(product.id) ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="checkbox mr-3"
                        checked={isSelected(product.id, variant.id)}
                        onChange={() => {
                          if (!isProductDisabled(product.id)) {
                            toggleProductSelection(product, variant);
                          }
                        }}
                        disabled={isProductDisabled(product.id)}
                      />
                      <span>{variant.title}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <span className="mr-8">
                        {variant.inventory} available
                      </span>
                      <span>${variant.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-center p-4">
                <div className="loading loading-spinner loading-md"></div>
              </div>
            )}

            {displayedProducts.length === 0 && !isLoading && !error && (
              <div className="p-4 text-center text-gray-500">
                {editingProductIndex !== null
                  ? 'No available products to select. Products already selected in other items are not shown.'
                  : 'No products found'}
              </div>
            )}

            {!hasMore && displayedProducts.length > 0 && !isLoading && (
              <div className="p-2 text-center text-sm text-gray-500">
                No more products to load
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SelectProductModal;
