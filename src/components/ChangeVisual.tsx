'use client';

interface Denomination {
  name: string;
  count: number;
  value: number;
}

interface ChangeVisualProps {
  denominations: Denomination[];
}

const DENOMINATION_STYLES: Record<string, { bg: string; border: string; text: string; icon: string; isBill?: boolean }> = {
  hundred: {
    bg: 'bg-green-200',
    border: 'border-green-400',
    text: 'text-green-900',
    icon: '$100',
    isBill: true,
  },
  fifty: {
    bg: 'bg-green-200',
    border: 'border-green-400',
    text: 'text-green-900',
    icon: '$50',
    isBill: true,
  },
  twenty: {
    bg: 'bg-green-200',
    border: 'border-green-400',
    text: 'text-green-900',
    icon: '$20',
    isBill: true,
  },
  ten: {
    bg: 'bg-green-200',
    border: 'border-green-400',
    text: 'text-green-900',
    icon: '$10',
    isBill: true,
  },
  five: {
    bg: 'bg-green-200',
    border: 'border-green-400',
    text: 'text-green-900',
    icon: '$5',
    isBill: true,
  },
  dollar: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-800',
    icon: '$1',
    isBill: true,
  },
  quarter: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-700',
    icon: '25¢',
  },
  dime: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-700',
    icon: '10¢',
  },
  nickel: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-700',
    icon: '5¢',
  },
  penny: {
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-800',
    icon: '1¢',
  },
};

export function ChangeVisual({ denominations }: ChangeVisualProps) {
  if (denominations.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h4 className="text-sm font-medium text-gray-600 mb-3">Visual Breakdown</h4>
      <div className="flex flex-wrap gap-2">
        {denominations.map((denom) => {
          const style = DENOMINATION_STYLES[denom.name] || {
            bg: 'bg-gray-100',
            border: 'border-gray-300',
            text: 'text-gray-700',
            icon: denom.name,
          };

          const isBill = style.isBill;
          const shapeClass = isBill ? 'w-12 h-7 rounded' : 'w-10 h-10 rounded-full';

          return Array.from({ length: Math.min(denom.count, 20) }).map((_, i) => (
            <div
              key={`${denom.name}-${i}`}
              className={`
                ${shapeClass} ${style.bg} ${style.border} border-2
                flex items-center justify-center text-xs font-bold ${style.text}
                transition-transform hover:scale-110
              `}
              title={denom.name}
              aria-label={denom.name}
            >
              {style.icon}
            </div>
          )).concat(
            denom.count > 20 ? [
              <div
                key={`${denom.name}-more`}
                className={`
                  ${shapeClass} ${style.bg} ${style.border} border-2
                  flex items-center justify-center text-xs font-bold ${style.text}
                `}
                title={`${denom.count - 20} more ${denom.name}s`}
              >
                +{denom.count - 20}
              </div>
            ] : []
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        {denominations.length > 0 && denominations.some(d => d.count > 20) &&
          '* Some denominations truncated for display'}
      </p>
    </div>
  );
}

