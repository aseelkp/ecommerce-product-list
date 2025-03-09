import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import editIcon from '../../assets/icons/edit.svg';
import crossIcon from '../../assets/icons/cross.svg';
import { useState, useEffect } from 'react';
import VariantItem from './VariantItem';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const ProductItem = ({
  product,
  index,
  onRemove,
  onDiscountChange,
  onProductSelect,
  onRemoveVariant,
  multipleProducts,
  onVariantsReorder,
  isDragging,
}) => {
  const {
    attributes: productAttributes,
    listeners: productListeners,
    setNodeRef: setProductNodeRef,
    transform: productTransform,
    transition: productTransition,
    isDragging: isItemDragging,
  } = useSortable({ id: product.id });

  const [showVariants, setShowVariants] = useState(false);

  const productStyle = {
    transform: CSS.Transform.toString(productTransform),
    transition: productTransition,
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

  const handleVariantDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = product.variants.findIndex((v) => v.id === active.id);
      const newIndex = product.variants.findIndex((v) => v.id === over.id);

      onVariantsReorder(product.id, oldIndex, newIndex);
    }
  };

  const handleDiscountChange = (e) => {
    let value = e.target.value === '' ? '' : Number(e.target.value);

    if (value !== '' && !isNaN(value)) {
      value = Math.max(0, value);

      if (product.discountType === 'percent') {
        value = Math.min(100, value);
      }
    }

    onDiscountChange(product.id, {
      discountValue: value,
    });
  };

  useEffect(() => {
    if (isItemDragging || isDragging) {
      setShowVariants(false);
    }
  }, [isItemDragging, isDragging]);

  const shouldShowVariantsSection =
    !isItemDragging &&
    !isDragging &&
    product.variants &&
    product.variants.length > 0;

  return (
    <div className="mb-2 flex flex-col">
      <div
        ref={setProductNodeRef}
        style={productStyle}
        className="flex items-center"
      >
        <div
          className="mr-2 flex-none cursor-grab"
          {...productAttributes}
          {...productListeners}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="mr-2 flex-none font-medium">{index + 1}.</div>

        <div className="grid flex-1 grid-cols-[1fr_0.5fr_auto] gap-4 px-4">
          <div className="relative flex w-full min-w-64 items-center justify-between border border-[#00000012] bg-white px-3 py-3 shadow-[0px_2px_4px_0px_rgba(0,_0,_0,_0.15)]">
            <span>{product.title || 'Select a product'}</span>
            <button onClick={onProductSelect} className="cursor-pointer">
              <img src={editIcon} alt="" />
            </button>
          </div>
          <div className="flex w-full min-w-36 items-center gap-3">
            {!product.showDiscount ? (
              <button
                onClick={() =>
                  onDiscountChange(product.id, { showDiscount: true })
                }
                className="btn w-full rounded-md bg-[#008060] p-6 font-medium text-white"
              >
                Add Discount
              </button>
            ) : (
              <>
                <input
                  type="number"
                  className="color-[#000000] w-full rounded-md border border-[#00000012] bg-white px-2 py-3 font-medium"
                  value={product.discountValue || ''}
                  onChange={handleDiscountChange}
                  min="0"
                  max={product.discountType === 'percent' ? '100' : undefined}
                  placeholder="0"
                />
                <select
                  className="color-[#000000] w-full rounded-md border border-[#00000012] bg-white px-2 py-3 font-medium"
                  value={product.discountType || 'percentage'}
                  onChange={(e) =>
                    onDiscountChange(product.id, {
                      discountType: e.target.value,
                    })
                  }
                >
                  <option value="percent">%</option>
                  <option value="fixed">Fixed</option>
                </select>
              </>
            )}
          </div>
          {multipleProducts && (
            <div className="flex items-center">
              <button
                onClick={() => {
                  onRemove(product.id);
                }}
                className="cursor-pointer"
              >
                <img src={crossIcon} alt="" />
              </button>
            </div>
          )}
        </div>
      </div>

      {shouldShowVariantsSection && (
        <div className="flex w-full flex-col pl-10">
          <button
            onClick={() => setShowVariants(!showVariants)}
            className="mt-2 mr-4 flex items-center self-end text-sm text-blue-600 hover:text-blue-800"
          >
            <span>{showVariants ? 'Hide' : 'Show'} Variants</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`ml-1 h-4 w-4 transition-transform ${showVariants ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showVariants && (
            <DndContext onDragEnd={handleVariantDragEnd} sensors={sensors}>
              <SortableContext
                items={product.variants.map((v) => v.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="mt-2 space-y-2">
                  {product.variants.map((variant, variantIndex) => (
                    <VariantItem
                      key={variant.id || variantIndex}
                      variant={variant}
                      productId={product.id}
                      onDiscountChange={onDiscountChange}
                      onRemoveVariant={onRemoveVariant}
                      hasMultipleVariants={product.variants.length > 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductItem;
