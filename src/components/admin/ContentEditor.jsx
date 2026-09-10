'use client';
import { useState } from 'react';
import { Save, Layout, Info, Phone, CheckCircle } from 'lucide-react';

export default function ContentEditor({ initialSettings, saveContentAction }) {
  const [activeTab, setActiveTab] = useState('homepage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Parse initial JSON strings into state
  const [homepage, setHomepage] = useState(initialSettings.find(s => s.key === 'CONTENT_HOMEPAGE')?.value ? JSON.parse(initialSettings.find(s => s.key === 'CONTENT_HOMEPAGE').value) : {
    heroTitle: 'ENGINEERING EXCELLENCE IN HEAVY INDUSTRIES',
    heroDescription: 'MECELFAB delivers world-class industrial fabrication, erection, and mechanical services with unyielding commitment to safety and precision.',
    heroCta: 'Explore Services',
    secondaryCta: 'Contact Us',
    aboutHeading: 'WHO WE ARE'
  });

  const [about, setAbout] = useState(initialSettings.find(s => s.key === 'CONTENT_ABOUT')?.value ? JSON.parse(initialSettings.find(s => s.key === 'CONTENT_ABOUT').value) : {
    title: 'About MECELFAB',
    mission: 'To provide unparalleled engineering solutions that power industrial growth while maintaining the highest standards of safety and quality.',
    vision: 'To be the preferred mechanical and fabrication partner for major industrial sectors across the region.',
    values: 'Safety, Quality, Integrity, Innovation'
  });

  const [contact, setContact] = useState(() => {
    const existing = initialSettings.find(s => s.key === 'CONTENT_CONTACT')?.value;
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        return {
          companyName: parsed.companyName || 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED',
          phone: parsed.phone || '',
          email: parsed.email || 'mecelfab@gmail.com',
          address: parsed.address || '',
          workingHours: parsed.workingHours || 'Mon - Sat: 9:00 AM - 6:00 PM IST',
          linkedin: parsed.linkedin || '',
          twitter: parsed.twitter || ''
        };
      } catch {
        // Fallback below
      }
    }
    return {
      companyName: 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED',
      phone: '',
      email: 'mecelfab@gmail.com',
      address: '',
      workingHours: 'Mon - Sat: 9:00 AM - 6:00 PM IST',
      linkedin: '',
      twitter: ''
    };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    try {
      await saveContentAction({
        homepage: JSON.stringify(homepage),
        about: JSON.stringify(about),
        contact: JSON.stringify(contact)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTabButton = (id, label, Icon) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
        activeTab === id 
          ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {renderTabButton('homepage', 'Homepage', Layout)}
        {renderTabButton('about', 'About Us', Info)}
        {renderTabButton('contact', 'Contact & Footer', Phone)}
      </div>

      <div className="p-6">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center gap-2 text-sm font-medium">
            <CheckCircle size={16} /> Content successfully published to the live website!
          </div>
        )}

        {/* HOMEPAGE */}
        {activeTab === 'homepage' && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Hero Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Title</label>
                <input type="text" value={homepage.heroTitle} onChange={(e) => setHomepage({...homepage, heroTitle: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Description</label>
                <textarea rows="3" value={homepage.heroDescription} onChange={(e) => setHomepage({...homepage, heroDescription: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Primary CTA Label</label>
                <input type="text" value={homepage.heroCta} onChange={(e) => setHomepage({...homepage, heroCta: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Secondary CTA Label</label>
                <input type="text" value={homepage.secondaryCta} onChange={(e) => setHomepage({...homepage, secondaryCta: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mt-8">Other Sections</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">About Section Heading</label>
              <input type="text" value={homepage.aboutHeading} onChange={(e) => setHomepage({...homepage, aboutHeading: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
        )}

        {/* ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Main Description</label>
              <textarea rows="4" value={about.mission} onChange={(e) => setAbout({...about, mission: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Vision Statement</label>
              <textarea rows="3" value={about.vision} onChange={(e) => setAbout({...about, vision: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Core Values</label>
              <input type="text" value={about.values} onChange={(e) => setAbout({...about, values: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
        )}

        {/* CONTACT */}
        {activeTab === 'contact' && (
          <div className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Legal Name</label>
                <input type="text" value={contact.companyName} onChange={(e) => setContact({...contact, companyName: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Working Hours</label>
                <input type="text" value={contact.workingHours} onChange={(e) => setContact({...contact, workingHours: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Email</label>
                <input type="email" value={contact.email} onChange={(e) => setContact({...contact, email: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Phone</label>
                <input type="text" value={contact.phone} onChange={(e) => setContact({...contact, phone: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Physical Address</label>
                <textarea rows="2" value={contact.address} onChange={(e) => setContact({...contact, address: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn URL (Optional)</label>
                <input type="url" value={contact.linkedin} onChange={(e) => setContact({...contact, linkedin: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors shadow-sm disabled:opacity-50">
          <Save size={16} /> {isSubmitting ? 'Publishing to site...' : 'Publish Content'}
        </button>
      </div>
    </form>
  );
}
