export default function SummaryCard({ icon: Icon, title, children, accent = 'blue' }) {
  const accentClasses = {
    blue: { border: 'border-blue-100', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', titleColor: 'text-blue-700' },
    green: { border: 'border-green-100', iconBg: 'bg-green-50', iconColor: 'text-green-600', titleColor: 'text-green-700' },
    amber: { border: 'border-amber-100', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', titleColor: 'text-amber-700' },
    purple: { border: 'border-purple-100', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', titleColor: 'text-purple-700' },
    red: { border: 'border-red-100', iconBg: 'bg-red-50', iconColor: 'text-red-600', titleColor: 'text-red-700' },
  };

  const cls = accentClasses[accent] || accentClasses.blue;

  return (
    <div className={`bg-white rounded-2xl p-6 border ${cls.border} shadow-card hover:shadow-soft transition-shadow duration-200 animate-slide-up`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl ${cls.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={cls.iconColor} />
        </div>
        <h3 className={`text-base font-semibold ${cls.titleColor}`}>{title}</h3>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
