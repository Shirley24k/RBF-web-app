export const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className={`bg-white rounded-lg p-6 max-md:p-4 max-sm:p-3 shadow-md border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm max-md:text-xs font-medium text-gray-600">{title}</p>
          <p className="text-2xl max-md:text-xl max-sm:text-lg font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          <Icon className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4 text-gray-600" />
        </div>
      </div>
    </div>
  );