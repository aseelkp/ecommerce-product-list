import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import ProductItem from '../components/productManagement/ProductItem';
import SelectProductModal from '../components/productManagement/SelectProductModal';

const ProductManagement = () => {
  const [products, setProducts] = useState([
    {
      id: Date.now(),
      title: '',
      variants: [],
      discountValue: 0,
      discountType: 'percentage',
      showVariants: false,
      showDiscount: false,
    },
  ]);

  const [isSelectProductModalOpen, setIsSelectProductModalOpen] =
    useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDiscountChange = (productId, changes, variantId = null) => {
    setProducts((products) =>
      products.map((p) => {
        if (p.id === productId) {
          if (variantId) {
            return {
              ...p,
              variants: p.variants.map((v) =>
                v.id === variantId ? { ...v, ...changes } : v
              ),
            };
          } else {
            return { ...p, ...changes };
          }
        }
        return p;
      })
    );
  };

  const handleRemoveVariant = (productId, variantId) => {
    setProducts((products) =>
      products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            variants: p.variants.filter((v) => v.id !== variantId),
          };
        }
        return p;
      })
    );
  };

  const handleAddProduct = () => {
    setProducts((products) => [
      ...products,
      {
        id: Date.now(),
        title: '',
        variants: [],
        discountValue: 0,
        discountType: 'percentage',
        showVariants: false,
        showDiscount: false,
      },
    ]);
  };

  const handleRemoveProduct = (id) => {
    setProducts((products) => products.filter((p) => p.id !== id));
  };

  const handleSelectProduct = (index) => {
    setEditingProductIndex(index);
    setIsSelectProductModalOpen(true);
  };

  const handleItemSelect = (selectedItems) => {
    setProducts((currentProducts) => {
      // Clone the current products array
      const updatedProducts = [...currentProducts];

      // If we're editing an existing product
      if (editingProductIndex !== null) {
        // Get the product being edited
        const editingProduct = updatedProducts[editingProductIndex];

        // Filter out products that were already selected for the editing product
        const newProductSelections = selectedItems.filter(
          (item) => item.productId !== editingProduct.id
        );

        // Update the editing product with its new selection
        const editingProductSelection = selectedItems.find(
          (item) => item.productId === editingProduct.id
        );

        if (editingProductSelection) {
          updatedProducts[editingProductIndex] = {
            ...updatedProducts[editingProductIndex],
            title: editingProductSelection.productTitle || '',
            image: editingProductSelection.productImage || { src: '' },
            variants: editingProductSelection.variants.map((variant) => ({
              id: variant.id,
              title: variant.title || '',
              price: variant.price || 0,
              inventory: variant.inventory || 0,
              discountValue: '',
              discountType: 'percent',
            })),
          };
        } else {
          // If the current product was completely removed from the selection
          // Replace it with the first new selection if available
          if (newProductSelections.length > 0) {
            const firstNewSelection = newProductSelections.shift();
            updatedProducts[editingProductIndex] = {
              id: firstNewSelection.productId,
              title: firstNewSelection.productTitle || '',
              image: firstNewSelection.productImage || { src: '' },
              variants: firstNewSelection.variants.map((variant) => ({
                id: variant.id,
                title: variant.title || '',
                price: variant.price || 0,
                inventory: variant.inventory || 0,
                discountValue: '',
                discountType: 'percent',
              })),
              discountValue: 0,
              discountType: 'percentage',
              showVariants: false,
              showDiscount: false,
            };
          } else {
            // If there's no new selection, reset the product to empty
            updatedProducts[editingProductIndex] = {
              ...updatedProducts[editingProductIndex],
              title: '',
              variants: [],
            };
          }
        }

        // Add any remaining new product selections
        newProductSelections.forEach(
          ({ productId, productTitle, productImage, variants }) => {
            updatedProducts.push({
              id: productId,
              title: productTitle || '',
              image: productImage || { src: '' },
              variants: variants.map((variant) => ({
                id: variant.id,
                title: variant.title || '',
                price: variant.price || 0,
                inventory: variant.inventory || 0,
                discountValue: '',
                discountType: 'percent',
              })),
              discountValue: 0,
              discountType: 'percentage',
              showVariants: false,
              showDiscount: false,
            });
          }
        );
      } else {
        // We're not editing a specific product, so add all selections as new products
        selectedItems.forEach(
          ({ productId, productTitle, productImage, variants }) => {
            updatedProducts.push({
              id: productId,
              title: productTitle || '',
              image: productImage || { src: '' },
              variants: variants.map((variant) => ({
                id: variant.id,
                title: variant.title || '',
                price: variant.price || 0,
                inventory: variant.inventory || 0,
                discountValue: '',
                discountType: 'percent',
              })),
              discountValue: 0,
              discountType: 'percentage',
              showVariants: false,
              showDiscount: false,
            });
          }
        );
      }

      return updatedProducts;
    });

    setIsSelectProductModalOpen(false);
    setEditingProductIndex(null);
  };

  const handleVariantsReorder = (productId, oldIndex, newIndex) => {
    setProducts((products) =>
      products.map((p) => {
        if (p.id === productId) {
          const reorderedVariants = arrayMove(p.variants, oldIndex, newIndex);
          return {
            ...p,
            variants: reorderedVariants,
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="mx-auto max-w-5xl p-5">
      <h1 className="mb-6 text-xl font-bold">Add Products</h1>
      <div className="mb-2 grid grid-cols-[1fr_0.5fr_auto] gap-4 px-4 font-medium">
        <div>Product</div>
        <div>Discount</div>
      </div>

      <div className="mb-2">
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
          <SortableContext
            items={products.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {products.map((p, i) => (
                <div key={`${p.id}-${i}`}>
                  <ProductItem
                    product={p}
                    index={i}
                    onRemove={() => handleRemoveProduct(p.id)}
                    onDiscountChange={handleDiscountChange}
                    onProductSelect={() => handleSelectProduct(i)}
                    onRemoveVariant={handleRemoveVariant}
                    onVariantsReorder={handleVariantsReorder}
                    multipleProducts={products.length > 1}
                  />
                  {i < products.length - 1 && (
                    <div className="mt-6 h-[1px] w-full bg-[#0000001A]"></div>
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-10 mr-10 flex justify-end">
        <button
          className="btn btn-wide rounded-md border-2 border-[#008060] p-6 font-medium text-[#008060]"
          onClick={handleAddProduct}
        >
          Add Product
        </button>
      </div>

      <SelectProductModal
        isOpen={isSelectProductModalOpen}
        onClose={() => {
          setIsSelectProductModalOpen(false);
          setEditingProductIndex(null);
        }}
        onSelect={handleItemSelect}
        selectedProducts={products.map((p) => ({
          productId: p.id,
          productTitle: p.title,
          productImage: p.image,
          variants: p.variants,
        }))}
        editingProductIndex={editingProductIndex}
      />
    </div>
  );
};

export default ProductManagement;
