"use client";
import { useState, useRef } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Contact = ({ services = [], content, initialService = '' }) => {
  const containerRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    projectLocation: '',
    serviceRequired: initialService || (services.length > 0 ? services[0].title : 'Industrial Erection'),
    projectDescription: '',
    expectedTimeline: '',
    preferredContactMethod: 'Email'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors = {};

    // Full Name
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    // Company
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company is required';
    }

    // Email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }

    // Phone
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    // Project Location
    if (!formData.projectLocation.trim()) {
      errors.projectLocation = 'Project location is required';
    }

    // Service Required
    if (!formData.serviceRequired) {
      errors.serviceRequired = 'Service is required';
    }

    // Project Description
    if (!formData.projectDescription.trim()) {
      errors.projectDescription = 'Project description is required';
    }

    // Expected Timeline
    if (!formData.expectedTimeline.trim()) {
      errors.expectedTimeline = 'Expected timeline is required';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('fullName', formData.fullName);
      formDataObj.append('companyName', formData.companyName);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone', formData.phone);
      formDataObj.append('projectLocation', formData.projectLocation);
      formDataObj.append('serviceRequired', formData.serviceRequired);
      formDataObj.append('projectDescription', formData.projectDescription);
      formDataObj.append('expectedTimeline', formData.expectedTimeline);
      formDataObj.append('preferredContactMethod', formData.preferredContactMethod);

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formDataObj
      });

      if (response.ok) {
        const responseData = await response.json();
        setReferenceNumber(responseData.referenceNumber || 'MEC-REQ-RECEIVED');
        setIsSubmitted(true);
        setFormData({
          fullName: '',
          companyName: '',
          email: '',
          phone: '',
          projectLocation: '',
          serviceRequired: initialService || (services.length > 0 ? services[0].title : 'Industrial Erection'),
          projectDescription: '',
          expectedTimeline: '',
          preferredContactMethod: 'Email'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      // Don't set form submitted on error - keep form active for correction
    } finally {
      setIsSubmitting(false);
    }
  };

  useGSAP(() => {
    gsap.fromTo('.contact-left',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: containerRef.current, start: 'top 80%' } }
    );
    gsap.fromTo('.contact-right',
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.2, scrollTrigger: { trigger: containerRef.current, start: 'top 80%' } }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="contact" className="section-padding bg-primary-light border-y border-white/5">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="max-w-3xl mb-16">
          <span className="inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-6 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
            Start Your Industrial Project
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-light text-white tracking-tight mb-6">
            REQUEST A QUOTE
          </h2>
          <p className="text-lg text-secondary font-light leading-relaxed max-w-2xl">
            Tell us about your requirements and our team will review your project.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Contact Details & Map */}
          <div className="contact-left flex flex-col gap-12">
            <div>
              <h3 className="text-2xl font-light text-white mb-8">
                {content?.legalName || content?.companyName || 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED'}
              </h3>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-accent mt-1" />
                  <div>
                    <h4 className="text-xs font-heading font-semibold text-secondary uppercase tracking-widest mb-1">REGISTERED OFFICE / YARDS</h4>
                    <p className="text-white/80 text-sm font-light leading-relaxed whitespace-pre-wrap">
                      {content?.address || 'Official registered office address available upon request'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone size={20} className="text-accent mt-1" />
                  <div>
                    <h4 className="text-xs font-heading font-semibold text-secondary uppercase tracking-widest mb-1">CONTACT NUMBER</h4>
                    <p className="text-white/80 text-sm font-light leading-relaxed">
                      {content?.phone || 'Available upon request'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail size={20} className="text-accent mt-1" />
                  <div>
                    <h4 className="text-xs font-heading font-semibold text-secondary uppercase tracking-widest mb-1">OFFICIAL EMAIL</h4>
                    <p className="text-white/80 text-sm font-light leading-relaxed">
                      {content?.email || 'contact@mecelfab.com'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock size={20} className="text-accent mt-1" />
                  <div>
                    <h4 className="text-xs font-heading font-semibold text-secondary uppercase tracking-widest mb-1">OPERATIONS</h4>
                    <p className="text-white/80 text-sm font-light leading-relaxed">
                      {content?.workingHours || 'Mon - Sat: 9:00 AM - 6:00 PM IST'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Styled Map Container */}
            {content?.address ? (
              <div className="w-full h-64 border border-white/5 overflow-hidden filter grayscale contrast-125 opacity-80">
                <iframe
                  title="MECELFAB Industrial Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://maps.google.com/maps?width=100%25&height=250&hl=en&q=${encodeURIComponent(content.address)}&t=m&z=14&ie=UTF8&iwloc=B&output=embed`}
                  className="invert hue-rotate-180"
                />
              </div>
            ) : (
              <div className="w-full p-8 border border-white/5 bg-white/[0.02] flex flex-col justify-center">
                <h4 className="text-xs font-heading font-semibold text-secondary uppercase tracking-widest mb-2">CORPORATE FACILITIES & YARDS</h4>
                <p className="text-white/70 text-xs font-light leading-relaxed mb-3">
                  Physical yard, fabrication shop, and registered office visits are scheduled in coordination with project managers.
                </p>
                <p className="text-secondary text-xs font-light">
                  For immediate project inquiries, please submit the request form or email <span className="text-white font-medium">{content?.email || 'contact@mecelfab.com'}</span>.
                </p>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="contact-right p-0 md:p-8 lg:p-12 bg-transparent md:bg-white/[0.02] border-none md:border border-white/5 mt-8 md:mt-0">
            {isSubmitted ? (
              <div className="text-center py-16">
                <div className="inline-flex text-accent mb-6">
                  <CheckCircle size={64} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-light text-white mb-2 uppercase tracking-widest">SERVICE REQUEST RECEIVED</h3>
                <p className="text-white/60 text-sm font-light mb-8">
                  Your request has been submitted successfully. Our engineering team will review your requirements.
                </p>
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg mb-8 max-w-sm mx-auto">
                  <p className="text-xs text-secondary font-heading uppercase tracking-widest mb-2">Reference Number</p>
                  <p className="text-2xl text-white font-medium">{referenceNumber}</p>
                </div>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-3 border border-white/20 text-white font-heading text-xs tracking-widest uppercase hover:bg-white hover:text-primary transition-colors duration-300"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                <h3 className="text-2xl font-light text-white mb-4 md:mb-2">
                  REQUEST A QUOTE
                </h3>

                {/* Row 1: Full Name and Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-heading tracking-widest text-secondary uppercase">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border ${formErrors.fullName ? 'border-red-500' : 'border-white/10'} text-white px-4 py-3 focus:outline-none focus:border-white/30 transition-colors font-light text-sm min-h-[44px]`}
                      placeholder="Contact Person Full Name"
                    />
                    {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-heading tracking-widest text-secondary uppercase">Company *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-white/30 transition-colors font-light text-sm min-h-[44px]"
                      placeholder="Organization / Enterprise Name"
                    />
                    {formErrors.companyName && <p className="text-red-500 text-xs mt-1">{formErrors.companyName}</p>}
                  </div>
                </div>

                {/* Row 2: Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-heading tracking-widest text-secondary uppercase">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border ${formErrors.email ? 'border-red-500' : 'border-white/10'} text-white px-4 py-3 focus:outline-none focus:border-white/30 transition-colors font-light text-sm min-h-[44px]`}
                      placeholder="corporate.email@company.com"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-heading tracking-widest text-secondary uppercase">Phone *</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border ${formErrors.phone ? 'border-red-500' : 'border-white/10'} text-white px-4 py-3 focus:outline-none focus:border-white/30 transition-colors font-light text-sm min-h-[44px]`}
                      placeholder="Contact Telephone Number"
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                {/* Row 3: Project Location and Service Required */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-heading tracking-widest text-secondary uppercase">Project Location *</label>
                    <input
                      type="text"
                      name="projectLocation"
                      value={formData.projectLocation}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-white/30 transition-colors font-light text-sm min-h-[44px]"
                      placeholder="Project Site / City, State"
                    />
                    {formErrors.projectLocation && <p className="text-red-500 text-xs mt-1">{formErrors.projectLocation}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-heading tracking-widest text-secondary uppercase">Service Required *</label>
                    <select
                      name="serviceRequired"
                      value={formData.serviceRequired}
                      onChange={handleChange}
                      className="w-full bg-primary-light border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-white/30 transition-colors font-light text-sm appearance-none min-h-[44px]"
                    >
                      <option value="">Select Service Required</option>
                      {services.length > 0 ? (
                        services.map((service, index) => (
                          <option key={index} value={service.title}>{service.title}</option>
                        ))
                      ) : (
                        <>
                          <option value="Industrial Erection">Industrial Erection</option>
                          <option value="Industrial Fabrication">Industrial Fabrication</option>
                          <option value="Hydraulic & Pneumatic System Overhauling">Hydraulic & Pneumatic System Overhauling</option>
                          <option value="Industrial Generator Spare Parts">Industrial Generator Spare Parts</option>
                          <option value="AMC — Annual Maintenance Contract">AMC — Annual Maintenance Contract</option>
                          <option value="Industrial Generator Rental">Industrial Generator Rental</option>
                          <option value="Air Compressor Rental">Air Compressor Rental</option>
                          <option value="Turbocharger Services">Turbocharger Services</option>
                        </>
                      )}
                      <option value="Other">Other Solutions</option>
                    </select>
                    {formErrors.serviceRequired && <p className="text-red-500 text-xs mt-1">{formErrors.serviceRequired}</p>}
                  </div>
                </div>

                {/* Row 4: Timeline and Preferred Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-heading tracking-widest text-secondary uppercase">Expected Timeline *</label>
                    <input
                      type="text"
                      name="expectedTimeline"
                      value={formData.expectedTimeline}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-white/30 transition-colors font-light text-sm min-h-[44px]"
                      placeholder="e.g. 3-4 months"
                    />
                    {formErrors.expectedTimeline && <p className="text-red-500 text-xs mt-1">{formErrors.expectedTimeline}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-heading tracking-widest text-secondary uppercase">Preferred Contact Method</label>
                    <div className="flex gap-4 mt-1">
                      {['Phone', 'Email', 'WhatsApp'].map(method => (
                        <label key={method} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${formData.preferredContactMethod === method ? 'border-accent' : 'border-white/30 group-hover:border-white/60'}`}>
                            {formData.preferredContactMethod === method && <div className="w-2 h-2 rounded-full bg-accent" />}
                          </div>
                          <span className={`text-sm font-light transition-colors ${formData.preferredContactMethod === method ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{method}</span>
                          <input
                            type="radio"
                            name="preferredContactMethod"
                            value={method}
                            checked={formData.preferredContactMethod === method}
                            onChange={handleChange}
                            className="hidden"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Project Description (Full width) */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-heading tracking-widest text-secondary uppercase">Project Description *</label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleChange}
                    rows="6"
                    className={`w-full bg-white/5 border ${formErrors.projectDetails ? 'border-red-500' : 'border-white/10'} text-white px-4 py-3 focus:outline-none focus:border-white/30 transition-colors font-light text-sm resize-y min-h-[44px]`}
                    placeholder="Describe your project requirements, scope, specifications, and any special considerations..."
                  />
                  {formErrors.projectDescription && <p className="text-red-500 text-xs mt-1">{formErrors.projectDescription}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 mt-4 bg-white text-primary font-heading tracking-widest uppercase text-sm font-medium flex items-center justify-center gap-3 hover:bg-white/90 transition-colors duration-300"
                >
                  {isSubmitting ? (
                    <>
                      Submitting... <Send size={16} />
                    </>
                  ) : (
                    <>
                      Submit Request <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
