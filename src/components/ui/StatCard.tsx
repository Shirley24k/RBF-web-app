export const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => {
  // Map border colors to background colors for icon backgrounds
  const getIconBgColor = (borderColor: string) => {
    const colorMap: { [key: string]: string } = {
      'border-l-blue-500': 'bg-blue-100',
      'border-l-yellow-500': 'bg-yellow-100',
      'border-l-green-500': 'bg-green-100',
      'border-l-red-500': 'bg-red-100',
      'border-l-purple-500': 'bg-purple-100',
      'border-l-indigo-500': 'bg-indigo-100',
      'border-l-pink-500': 'bg-pink-100',
      'border-l-gray-500': 'bg-gray-100'
    };
    return colorMap[borderColor] || 'bg-gray-100';
  };

  return (
    <div className={`bg-white rounded-lg p-6 max-md:p-4 max-sm:p-3 shadow-md border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm max-md:text-xs font-medium text-gray-600">{title}</p>
          <p className="text-2xl max-md:text-xl max-sm:text-lg font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${getIconBgColor(color)}`}>
          <Icon className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4 text-gray-600" />
        </div>
      </div>
    </div>
  );
};