import { useState } from 'react';

export default function DynamicAdvisorForm({ tool, onSubmit, onCancel, loading }) {
  const [formValues, setFormValues] = useState(() => {
    const initialValues = {};
    if (tool && tool.fields) {
      tool.fields.forEach(field => {
        initialValues[field.name] = field.defaultValue || '';
      });
    }
    return initialValues;
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (fieldName, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear validation error on change
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const errors = {};
    tool.fields.forEach(field => {
      if (field.required && (!formValues[field.name] || String(formValues[field.name]).trim() === '')) {
        errors[field.name] = `${field.label || field.name} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    onSubmit(formValues);
  };

  if (!tool) return null;

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-md space-y-6 max-w-[700px] mx-auto">
      {/* Form Header */}
      <div className="flex justify-between items-start gap-4 pb-4 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              {tool.icon || 'smart_toy'}
            </span>
            <h2 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
              {tool.name}
            </h2>
          </div>
          <p className="text-body-sm text-on-surface-variant font-medium mt-1">
            {tool.description}
          </p>
        </div>
        <button
          onClick={onCancel}
          disabled={loading}
          className="text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center"
          title="Back to Grid"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {tool.fields && tool.fields.map((field) => {
          const hasError = !!validationErrors[field.name];
          const inputId = `field-${field.name}`;

          return (
            <div key={field.name} className="space-y-1.5">
              <label htmlFor={inputId} className="block text-body-sm font-bold text-primary">
                {field.label}
                {field.required && <span className="text-error ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  id={inputId}
                  rows={field.rows || 4}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={loading}
                  className={`w-full bg-surface-container-lowest border text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all ${
                    hasError ? 'border-error' : 'border-outline-variant'
                  }`}
                />
              ) : field.type === 'select' ? (
                <select
                  id={inputId}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  disabled={loading}
                  className={`w-full bg-surface-container-lowest border text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all ${
                    hasError ? 'border-error' : 'border-outline-variant'
                  }`}
                >
                  <option value="" disabled>Select an option...</option>
                  {field.options && field.options.map((opt) => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const label = typeof opt === 'object' ? opt.label : opt;
                    return (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  id={inputId}
                  type={field.type || 'text'}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={loading}
                  className={`w-full bg-surface-container-lowest border text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all ${
                    hasError ? 'border-error' : 'border-outline-variant'
                  }`}
                />
              )}

              {hasError && (
                <p className="text-[12px] text-error font-medium">
                  {validationErrors[field.name]}
                </p>
              )}
            </div>
          );
        })}

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border border-outline text-primary hover:bg-surface-container-high px-5 py-2.5 rounded-full font-semibold text-body-sm transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed font-label-md text-label-md px-6 py-3 rounded-full font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                Generate Advice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
