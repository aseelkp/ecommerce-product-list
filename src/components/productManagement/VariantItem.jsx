import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const VariantItem = ({
  variant,
  productId,
  onDiscountChange,
  onRemoveVariant,
  hasMultipleVariants,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: variant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDiscountChange = (e) => {
    let value = e.target.value === '' ? '' : Number(e.target.value);

    if (value !== '' && !isNaN(value)) {
      value = Math.max(0, value);

      if (variant.discountType === 'percent') {
        value = Math.min(100, value);
      }
    }

    onDiscountChange(productId, { discountValue: value }, variant.id);
  };

  return (
    <div ref={setNodeRef} style={style} className="ml-6 flex items-center">
      <div
        className="mr-2 flex-none cursor-grab"
        {...attributes}
        {...listeners}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400"
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

      <div className="grid flex-1 grid-cols-[1fr_0.5fr_auto] gap-4 px-4">
        <div className="relative flex w-full min-w-64 items-center justify-between rounded-4xl border border-[#00000012] bg-white px-3 py-2 shadow-sm">
          <span className="text-sm">{variant.title || `Variant`}</span>
        </div>
        <div className="flex w-full min-w-36 items-center gap-3">
          <input
            type="number"
            className="color-[#000000] w-16 rounded-4xl border border-[#00000012] bg-white px-2 py-2 text-sm font-medium"
            value={variant.discountValue || ''}
            onChange={handleDiscountChange}
            min="0"
            max={variant.discountType === 'percent' ? '100' : undefined}
            placeholder="0"
          />
          <select
            className="color-[#000000] w-24 rounded-4xl border border-[#00000012] bg-white px-2 py-2 text-sm font-medium"
            value={variant.discountType || 'percent'}
            onChange={(e) =>
              onDiscountChange(
                productId,
                { discountType: e.target.value },
                variant.id
              )
            }
          >
            <option value="percent">% Off</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        {hasMultipleVariants && (
          <div className="flex items-center">
            <button
              onClick={() => onRemoveVariant(productId, variant.id)}
              className="text-gray-500 hover:text-red-500"
              title="Remove variant"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantItem;
