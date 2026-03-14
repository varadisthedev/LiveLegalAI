import { Settings as SettingsIcon, MapPin, Calendar, Lock, Key, HeadphonesIcon, ArrowRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';

export default function Settings() {
  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex flex-col text-left sm:text-right">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Alex Lawstone</span>
            <span className="text-xs text-gray-500">Legal Member</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1F2937] flex items-center justify-center border border-gray-200 dark:border-[#374151]">
            <span className="text-sm font-bold text-gray-700 dark:text-white">A</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">User Profile</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your LegalDoc Advisor account settings, preferences and document defaults.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 mb-8 shadow-sm dark:shadow-soft">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#0F111A] overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm">
             {/* Fake Avatar Image using gradient */}
             <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-[#1C36A4] text-white flex items-center justify-center border-2 border-white dark:border-[#151822] shadow-sm transform translate-y-1/4 hover:bg-blue-700 transition-colors">
             <SettingsIcon size={14} />
          </button>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-3 mb-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Alex Lawstone</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
              Legal Member
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">alex.lawstone@example.com</p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs font-medium text-gray-400 dark:text-gray-400">
            <span className="flex items-center gap-1.5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Calendar size={14} /> Joined Sept 2023</span>
            <span className="flex items-center gap-1.5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><MapPin size={14} /> New York, USA</span>
          </div>
        </div>
        <div className="w-full md:w-auto mt-4 md:mt-0">
          <button className="w-full md:w-auto bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-md">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-[#1F2937] mb-8 overflow-x-auto scrollbar-thin pb-[2px]">
        {['Personal Info', 'Security', 'Notifications', 'Appearence', 'Help Center'].map((tab, i) => (
          <button
            key={tab}
            className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              i === 0 
                ? 'text-blue-600 dark:text-blue-500 border-blue-600 dark:border-blue-500' 
                : 'text-gray-500 dark:text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Form */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 shadow-sm dark:shadow-soft">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="Alex Lawstone"
                  className="w-full bg-gray-50 dark:bg-[#1A1D27] border border-gray-200 dark:border-[#2A3143] text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue="alex.lawstone@example.com"
                  className="w-full bg-gray-50 dark:bg-[#1A1D27] border border-gray-200 dark:border-[#2A3143] text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 000-1234"
                  className="w-full bg-gray-50 dark:bg-[#1A1D27] border border-gray-200 dark:border-[#2A3143] text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2">Timezone</label>
                <div className="relative">
                  <select className="w-full bg-gray-50 dark:bg-[#1A1D27] border border-gray-200 dark:border-[#2A3143] text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer">
                    <option>Eastern Time (US & Canada)</option>
                    <option>Pacific Time (US & Canada)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-[#1F2937]/50 mt-2">
              <button className="w-full sm:w-auto bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-md">
                Save Changes
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 shadow-sm dark:shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security Settings</h3>
              <button className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-sm font-semibold transition-colors">Manage All</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#1A1D27] border border-gray-200 dark:border-[#2A3143] hover:border-gray-300 dark:hover:border-gray-700 transition-colors group gap-4 sm:gap-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-500 group-hover:scale-105 transition-transform shrink-0">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Two-Factor Authentication</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Enabled since Oct 12, 2023</p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-semibold transition-colors pl-14 sm:pl-0 sm:pr-2">Disable</button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#1A1D27] border border-gray-200 dark:border-[#2A3143] hover:border-gray-300 dark:hover:border-gray-700 transition-colors group gap-4 sm:gap-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 group-hover:scale-105 transition-transform shrink-0">
                    <Key size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Last Password Change</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500">3 months ago</p>
                  </div>
                </div>
                <button className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-sm font-semibold transition-colors pl-14 sm:pl-0 sm:pr-2">Change</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Legal Summary Widget */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-[#1C36A4] dark:to-blue-800 rounded-xl p-6 shadow-lg border border-blue-500/20 dark:border-blue-600/30">
            <h3 className="text-lg font-bold text-white mb-6">Legal Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-white/90">
                <span className="text-sm font-medium">Active Cases</span>
                <span className="text-xl font-bold font-sans">12</span>
              </div>
              <div className="flex justify-between items-center text-white/90">
                <span className="text-sm font-medium">Pending Reviews</span>
                <span className="text-xl font-bold font-sans">4</span>
              </div>
            </div>
            <div>
              <div className="w-full h-1.5 bg-blue-900/40 dark:bg-blue-900/50 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-white rounded-full w-[75%]" />
              </div>
              <p className="text-xs text-blue-100 dark:text-blue-200">75% of your documents are verified</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 shadow-sm dark:shadow-soft">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-6">Recent Activity</h3>
            
            <div className="space-y-6 mb-6">
              <div className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] dark:shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <div className="absolute left-1 top-4 w-px h-full bg-gray-200 dark:bg-[#2A3143]" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Doc Verified</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-tight mb-1 font-medium">NDA_Agreement_Final.pdf</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase">2 Hours Ago</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                <div className="absolute left-1 top-4 w-px h-full bg-gray-200 dark:bg-[#2A3143]" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-0.5">New Login</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-tight mb-1 font-medium">Chrome on MacOS (NY, USA)</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase">5 Hours Ago</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Account Setup</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-tight mb-1 font-medium">Profile details updated</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase">Yesterday</p>
              </div>
            </div>
            
            <button className="w-full bg-gray-50 dark:bg-[#1A1D27] border border-gray-200 dark:border-[#2A3143] text-sm text-gray-600 dark:text-gray-400 font-medium py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F2432] hover:text-gray-900 dark:hover:text-white transition-colors">
              View Full Log
            </button>
          </div>

          {/* Need help? */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] border-dashed rounded-xl p-6 flex flex-col items-center sm:items-start text-center sm:text-left shadow-sm dark:shadow-soft hover:bg-gray-50 dark:hover:bg-[#1A1D27] transition-colors group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1A1D27] border border-gray-200 dark:border-[#2A3143] flex items-center justify-center mb-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors">
              <HeadphonesIcon size={18} />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Need help?</h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">Our legal support team is available 24/7 for you.</p>
            <span className="text-blue-600 dark:text-blue-500 font-semibold text-xs flex items-center gap-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              Open Support Ticket <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
