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
      let updatedProducts = [...currentProducts];

      if (editingProductIndex !== null) {
        // When editing a product
        if (selectedItems.length > 0) {
          // Replace the current product with the first selection
          const firstSelection = selectedItems[0];

          updatedProducts[editingProductIndex] = {
            id: firstSelection.productId,
            title: firstSelection.productTitle || '',
            image: firstSelection.productImage || { src: '' },
            variants: firstSelection.variants.map((variant) => ({
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

          if (selectedItems.length > 1) {
            const additionalSelections = selectedItems.slice(1);

            additionalSelections.forEach(
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
        } else {
          updatedProducts[editingProductIndex] = {
            ...updatedProducts[editingProductIndex],
            title: '',
            variants: [],
          };
        }
      } else {
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
