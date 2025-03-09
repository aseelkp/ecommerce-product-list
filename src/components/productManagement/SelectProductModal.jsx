import { useEffect, useState, useRef, useCallback } from 'react';
import Modal from '../Modal';
import { fetchProducts } from '../../api/productService';
import useDebounce from '../../hooks/useDebounce';

const SelectProductModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedProducts = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const productsPerPage = 10;
  const containerRef = useRef(null);

  const loadProducts = useCallback(
    async (reset = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const currentPage = reset ? 0 : page;

        const response = await fetchProducts({
          search: debouncedSearchTerm,
          page: currentPage,
          limit: productsPerPage,
        });

        const fetchedProducts = response.data || [];

        if (fetchedProducts.length < productsPerPage) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setDisplayedProducts((prev) =>
          reset ? fetchedProducts : [...prev, ...fetchedProducts]
        );

        if (!reset) {
          setPage(currentPage + 1);
        } else {
          setPage(1);
        }
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [page, debouncedSearchTerm, productsPerPage]
  );

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (
      scrollTop + clientHeight >= scrollHeight - 20 &&
      hasMore &&
      !isLoading
    ) {
      loadProducts();
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

  // Load products when search term changes
  useEffect(() => {
    if (isOpen) {
      loadProducts(true);
    }
  }, [debouncedSearchTerm, isOpen, loadProducts]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Reset pagination when modal opens
  useEffect(() => {
    if (isOpen) {
      setPage(0);
      setHasMore(true);
      setDisplayedProducts([]);

      const initialSelectedItems = [];

      selectedProducts.forEach((item) => {
        if (
          item.productId &&
          Array.isArray(item.variants) &&
          item.variants.length > 0
        ) {
          initialSelectedItems.push({
            productId: item.productId,
            productTitle: item.productTitle || '',
            productImage: item.productImage || { src: '' },
            variants: item.variants,
          });
        }
      });

      setSelectedItems(initialSelectedItems);
    }
  }, [isOpen, selectedProducts]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={'Select Product'}
        size="3xl"
        customFooter={
          <div className="flex items-center justify-between">
            <span>{selectedItems.length} product variant(s) selected</span>
            <div className="flex gap-4">
              <button className="btn" onClick={handleAdd}>
                Add
              </button>
              <button className="btn btn-outline" onClick={onClose}>
                Cancel
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

            {displayedProducts.map((product) => (
              <div key={product.id} className="border-b">
                <div className="flex items-center border-b border-gray-300 bg-gray-50 p-3">
                  <input
                    type="checkbox"
                    className="checkbox mr-3"
                    checked={product.variants.some((v) =>
                      isSelected(product.id, v.id)
                    )}
                    onChange={() => {
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
                    }}
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
                    className="flex items-center justify-between border-b border-gray-300 p-3 pl-16 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="checkbox mr-3"
                        checked={isSelected(product.id, variant.id)}
                        onChange={() =>
                          toggleProductSelection(product, variant)
                        }
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
                No products found
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
