/**
 * NOACH Transport Services — Dual Form Controller & Live Email Dispatcher
 *
 * Configured with live Formspree endpoint: https://formspree.io/f/xbggzloq
 * Handles:
 * 1. Contact Us Form (#contact-form in slide-in right drawer)
 * 2. Request a Vehicle Form (#vehicle-request-form)
 * 3. Client-side field validations, interactive chips, and date restrictions
 * 4. Submission loading states, duplicate prevention, and success modals
 */

// ============================================================================
// EMAIL NOTIFICATION CONFIGURATION (FORMSPREE)
// Live Endpoint: https://formspree.io/f/xbggzloq
// ============================================================================
const FORMSPREE_CONFIG = {
  endpoint: 'https://formspree.io/f/xbggzloq',
  notificationEmail: 'noach.transportservice@gmail.com'
};

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // MODAL UTILITIES
  // ==========================================================================
  function showSuccessModal(title, message, subtext) {
    const modal = document.getElementById('success-modal');
    const titleEl = document.getElementById('modal-title-text');
    const msgEl = document.getElementById('modal-message-text');
    const subtextEl = document.getElementById('modal-subtext');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = `"${message}"`;
    if (subtextEl) subtextEl.textContent = subtext;
    if (modal) modal.classList.add('open');
  }

  function hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.classList.remove('open');
  }

  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', hideSuccessModal);
  });

  const successModal = document.getElementById('success-modal');
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) hideSuccessModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideSuccessModal();
  });

  // ==========================================================================
  // HELPER: FIELD ERROR DISPLAY
  // ==========================================================================
  function showFieldError(input, message) {
    input.classList.add('invalid');
    const group = input.closest('.form-group');
    if (group) {
      const errEl = group.querySelector('.form-error-msg');
      if (errEl) {
        errEl.textContent = message;
        errEl.classList.add('visible');
      }
    }
  }

  function clearFieldError(input) {
    input.classList.remove('invalid');
    const group = input.closest('.form-group');
    if (group) {
      const errEl = group.querySelector('.form-error-msg');
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('visible');
      }
    }
  }

  // Helper: Post form data to Formspree endpoint
  async function postFormspreeData(payload) {
    try {
      const response = await fetch(FORMSPREE_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Formspree dispatch error:', err);
      return { ok: false, error: err };
    }
  }


  // ==========================================================================
  // 1. CONTACT US FORM CONTROLLER (SLIDE-IN RIGHT DRAWER)
  // ==========================================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {

    function validateContactField(input) {
      const id = input.id;
      const value = input.value.trim();
      let isValid = true;
      let errorMsg = '';

      switch (id) {
        case 'contact-name':
          if (!value) {
            isValid = false;
            errorMsg = 'Please enter your full name.';
          } else if (value.length < 2) {
            isValid = false;
            errorMsg = 'Name must be at least 2 characters long.';
          }
          break;

        case 'contact-phone':
          if (!value) {
            isValid = false;
            errorMsg = 'Please provide a contact phone number.';
          } else {
            const digits = value.replace(/\D/g, '');
            if (digits.length < 7 || digits.length > 15) {
              isValid = false;
              errorMsg = 'Please enter a valid phone number (at least 7 digits).';
            }
          }
          break;

        case 'contact-email':
          // Email is optional (no *). If entered, validate format
          if (value) {
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(value)) {
              isValid = false;
              errorMsg = 'Please enter a valid email address.';
            }
          }
          break;

        default:
          break;
      }

      if (!isValid) {
        showDrawerFieldError(input, errorMsg);
      } else {
        clearDrawerFieldError(input);
      }

      return isValid;
    }

    function showDrawerFieldError(input, message) {
      input.classList.add('invalid');
      const group = input.closest('.drawer-field-group') || input.closest('.form-group');
      if (group) {
        const errEl = group.querySelector('.drawer-error-msg') || group.querySelector('.form-error-msg');
        if (errEl) {
          errEl.textContent = message;
          errEl.classList.add('visible');
        }
      }
    }

    function clearDrawerFieldError(input) {
      input.classList.remove('invalid');
      const group = input.closest('.drawer-field-group') || input.closest('.form-group');
      if (group) {
        const errEl = group.querySelector('.drawer-error-msg') || group.querySelector('.form-error-msg');
        if (errEl) {
          errEl.textContent = '';
          errEl.classList.remove('visible');
        }
      }
    }

    // Real-time listener for contact inputs
    ['contact-name', 'contact-phone', 'contact-email'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('blur', () => validateContactField(el));
        el.addEventListener('input', () => {
          if (el.classList.contains('invalid')) validateContactField(el);
        });
      }
    });

    // Form submission
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const requiredIds = ['contact-name', 'contact-phone'];
      let hasErrors = false;
      let firstInvalid = null;

      requiredIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && !validateContactField(el)) {
          hasErrors = true;
          if (!firstInvalid) firstInvalid = el;
        }
      });

      // Validate email only if user entered something
      const emailEl = document.getElementById('contact-email');
      if (emailEl && emailEl.value.trim() && !validateContactField(emailEl)) {
        hasErrors = true;
        if (!firstInvalid) firstInvalid = emailEl;
      }

      if (hasErrors) {
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
        return;
      }

      const submitBtn = document.getElementById('submit-contact-btn');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '<span>Submit</span>';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spinner" style="width:20px;height:20px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3"></path>
          </svg>
          <span>Submitting...</span>
        `;
      }

      const nameVal = document.getElementById('contact-name').value.trim();
      const phoneVal = document.getElementById('contact-phone').value.trim();
      const companyVal = document.getElementById('contact-company') ? document.getElementById('contact-company').value.trim() : '';
      const emailVal = document.getElementById('contact-email') ? document.getElementById('contact-email').value.trim() : '';

      const payload = {
        _subject: `New Contact Inquiry from ${nameVal} - NOACH Transport`,
        'Form Type': 'Contact Us (Quick Drawer)',
        'Customer Name': nameVal,
        'Phone Number': phoneVal,
        'Company Name': companyVal || 'Not specified',
        'Email Address': emailVal || 'Not specified',
        'Submission Time': new Date().toLocaleString()
      };

      if (emailVal) {
        payload._replyto = emailVal;
      }

      try {
        // Dispatch to Formspree endpoint (sending to ajaygudavalli24@gmail.com)
        const dispatchResult = await postFormspreeData(payload);

        if (!dispatchResult.ok) {
          const errMsg = (dispatchResult.data && dispatchResult.data.error) ? dispatchResult.data.error : 'There was a problem submitting your message to Formspree. Please check your form or try again.';
          alert(errMsg);
          return;
        }

        // Reset form
        contactForm.reset();
        ['contact-name', 'contact-phone', 'contact-email', 'contact-company'].forEach(id => {
          const el = document.getElementById(id);
          if (el) clearDrawerFieldError(el);
        });

        // Close the contact drawer if open
        if (window.closeContactDrawer) {
          window.closeContactDrawer();
        }

        // Present confirmation modal
        showSuccessModal(
          'Submission Successful',
          'Thank you for contacting NOACH Transport Services. Your submission has been received successfully. Our team will contact you shortly.',
          `Our operations team has received your details and an email notification has been dispatched to ${FORMSPREE_CONFIG.notificationEmail}.`
        );

        if (window.showToast) {
          window.showToast('Your inquiry has been submitted successfully!');
        }
      } catch (err) {
        console.error('Submission error:', err);
        alert('An error occurred. Please try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Submit</span>`;
        }
      }
    });
  }


  // ==========================================================================
  // 2. REQUEST A VEHICLE FORM CONTROLLER (ORIGINAL FORM)
  // ==========================================================================
  const vehicleForm = document.getElementById('vehicle-request-form');
  if (vehicleForm) {

    // Set minimum date picker to today
    const dateInput = document.getElementById('req-transport-date');
    if (dateInput) {
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    // Vehicle Type Chips synchronization
    const chips = document.querySelectorAll('.vehicle-chip');
    const vehicleSelect = document.getElementById('req-vehicle-type');

    function updateActiveChip(val) {
      chips.forEach(c => {
        if (c.getAttribute('data-value') === val) {
          c.classList.add('selected');
        } else {
          c.classList.remove('selected');
        }
      });
    }

    if (chips.length && vehicleSelect) {
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          const val = chip.getAttribute('data-value');
          vehicleSelect.value = val;
          updateActiveChip(val);
          clearFieldError(vehicleSelect);
        });
      });

      vehicleSelect.addEventListener('change', () => {
        updateActiveChip(vehicleSelect.value);
      });
    }

    function validateVehicleField(input) {
      const id = input.id;
      const value = input.value.trim();
      let isValid = true;
      let errorMsg = '';

      switch (id) {
        case 'req-customer-name':
          if (!value) {
            isValid = false;
            errorMsg = 'Please enter your full name.';
          } else if (value.length < 2) {
            isValid = false;
            errorMsg = 'Name must be at least 2 characters long.';
          }
          break;

        case 'req-mobile-number':
          if (!value) {
            isValid = false;
            errorMsg = 'Please provide a contact mobile number.';
          } else {
            const digits = value.replace(/\D/g, '');
            if (digits.length < 7 || digits.length > 15) {
              isValid = false;
              errorMsg = 'Please enter a valid phone number with area/country code.';
            }
          }
          break;

        case 'req-pickup-location':
          if (!value) {
            isValid = false;
            errorMsg = 'Pickup location address or landmark is required.';
          } else if (value.length < 3) {
            isValid = false;
            errorMsg = 'Please provide a specific pickup location.';
          }
          break;

        case 'req-delivery-location':
          if (!value) {
            isValid = false;
            errorMsg = 'Delivery destination address is required.';
          } else if (value.length < 3) {
            isValid = false;
            errorMsg = 'Please provide a specific delivery location.';
          }
          break;

        case 'req-vehicle-type':
          if (!value) {
            isValid = false;
            errorMsg = 'Please select a vehicle category.';
          }
          break;

        case 'req-transport-date':
          if (!value) {
            isValid = false;
            errorMsg = 'Please select your required transportation date.';
          } else {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
              isValid = false;
              errorMsg = 'Transportation date cannot be in the past.';
            }
          }
          break;

        default:
          break;
      }

      if (!isValid) {
        showFieldError(input, errorMsg);
      } else {
        clearFieldError(input);
      }

      return isValid;
    }

    // Real-time listener
    ['req-customer-name', 'req-mobile-number', 'req-pickup-location', 'req-delivery-location', 'req-vehicle-type', 'req-transport-date'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('blur', () => validateVehicleField(el));
        el.addEventListener('input', () => {
          if (el.classList.contains('invalid')) validateVehicleField(el);
        });
      }
    });

    // Form submission
    vehicleForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const requiredIds = [
        'req-customer-name',
        'req-mobile-number',
        'req-pickup-location',
        'req-delivery-location',
        'req-vehicle-type',
        'req-transport-date'
      ];

      let hasErrors = false;
      let firstInvalid = null;

      requiredIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && !validateVehicleField(el)) {
          hasErrors = true;
          if (!firstInvalid) firstInvalid = el;
        }
      });

      if (hasErrors) {
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
        return;
      }

      const submitBtn = document.getElementById('submit-request-btn');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spinner" style="width:20px;height:20px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3"></path>
          </svg>
          <span>Submitting Request...</span>
        `;
      }

      const customerName = document.getElementById('req-customer-name').value.trim();
      const mobileNumber = document.getElementById('req-mobile-number').value.trim();
      const vehicleType = document.getElementById('req-vehicle-type').value;

      const payload = {
        _subject: `New Vehicle Request: ${customerName} (${vehicleType}) - NOACH Transport`,
        'Form Type': 'Vehicle Request Form (Navbar)',
        'Customer Name': customerName,
        'Mobile Number': mobileNumber,
        'Company Name': document.getElementById('req-company-name')?.value.trim() || 'Not specified',
        'Pickup Location': document.getElementById('req-pickup-location').value.trim(),
        'Delivery Location': document.getElementById('req-delivery-location').value.trim(),
        'Vehicle Type': vehicleType,
        'Transportation Date': document.getElementById('req-transport-date').value,
        'Goods Type': document.getElementById('req-goods-type')?.value.trim() || 'Not specified',
        'Load Weight': document.getElementById('req-load-weight')?.value.trim() || 'Not specified',
        'Additional Requirements': document.getElementById('req-additional-reqs')?.value.trim() || 'None',
        'Submission Time': new Date().toLocaleString()
      };

      try {
        // Dispatch to Formspree endpoint (sending to ajaygudavalli24@gmail.com)
        const dispatchResult = await postFormspreeData(payload);

        if (!dispatchResult.ok) {
          const errMsg = (dispatchResult.data && dispatchResult.data.error) ? dispatchResult.data.error : 'There was a problem submitting your vehicle request to Formspree. Please try again.';
          alert(errMsg);
          return;
        }

        // Reset form & chips
        vehicleForm.reset();
        updateActiveChip('');

        // Present confirmation modal
        showSuccessModal(
          'Vehicle Request Submitted',
          'Thank you for contacting NOACH Transport Services. Your vehicle request has been submitted successfully. Our team will contact you shortly.',
          `Your logistics requirements have been recorded and an email notification has been dispatched to ${FORMSPREE_CONFIG.notificationEmail}.`
        );

        if (window.showToast) {
          window.showToast('Vehicle request submitted successfully!');
        }
      } catch (err) {
        console.error('Submission error:', err);
        alert('An error occurred. Please try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

});
