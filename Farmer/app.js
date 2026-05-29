// FarmConnect Interactive App logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabCustomer = document.getElementById('tab-customer');
  const tabFarmer = document.getElementById('tab-farmer');
  const userRoleInput = document.getElementById('user-role');
  const registerForm = document.getElementById('register-form');
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  
  const googleBtn = document.getElementById('googleBtn');
  const loginBtn = document.getElementById('loginBtn');

  // Testimonials database
  const testimonials = {
    customer: {
      text: '"I love buying directly from local farms. The produce is fresher, tastes better, and I feel good knowing my money goes directly to supporting families in our community."',
      author: '— David Miller, Local Food Enthusiast'
    },
    farmer: {
      text: '"FarmConnect transformed how we reach our local community. We spend less time managing orders and more time focusing on what we do best: growing fresh, healthy food."',
      author: '— Sarah Jenkins, Sunny Valley Farms'
    }
  };

  // Tab Switcher logic
  const setRole = (role) => {
    userRoleInput.value = role;
    
    if (role === 'customer') {
      tabCustomer.classList.add('active');
      tabCustomer.setAttribute('aria-selected', 'true');
      tabFarmer.classList.remove('active');
      tabFarmer.setAttribute('aria-selected', 'false');
      
      // Animate testimonial transition
      animateTestimonial(testimonials.customer);
    } else {
      tabCustomer.classList.remove('active');
      tabCustomer.setAttribute('aria-selected', 'false');
      tabFarmer.classList.add('active');
      tabFarmer.setAttribute('aria-selected', 'true');
      
      // Animate testimonial transition
      animateTestimonial(testimonials.farmer);
    }
  };

  // Smooth fade transition for glassmorphism quote
  const animateTestimonial = (data) => {
    quoteText.style.opacity = 0;
    quoteAuthor.style.opacity = 0;
    
    setTimeout(() => {
      quoteText.innerText = data.text;
      quoteAuthor.innerText = data.author;
      
      quoteText.style.transition = 'opacity 0.4s ease';
      quoteAuthor.style.transition = 'opacity 0.4s ease';
      quoteText.style.opacity = 1;
      quoteAuthor.style.opacity = 0.9;
    }, 200);
  };

  tabCustomer.addEventListener('click', () => setRole('customer'));
  tabFarmer.addEventListener('click', () => setRole('farmer'));

  // Keyboard navigation for tabs
  [tabCustomer, tabFarmer].forEach(tab => {
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
  });

  // Real-time password confirmation check
  const validatePasswords = () => {
    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.setCustomValidity("Passwords don't match");
    } else {
      confirmPasswordInput.setCustomValidity('');
    }
  };

  passwordInput.addEventListener('change', validatePasswords);
  confirmPasswordInput.addEventListener('keyup', validatePasswords);

  // Form submission handling
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check standard HTML5 validation
    if (!registerForm.checkValidity()) {
      registerForm.reportValidity();
      return;
    }

    // Get Form Data
    const formData = {
      role: userRoleInput.value,
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value
    };

    // Show premium visual feedback on success
    showSuccessScreen(formData);
  });

  // Success view replacing form
  const showSuccessScreen = (data) => {
    const container = document.querySelector('.left-side-form');
    
    // Fade out original content
    container.style.transition = 'opacity 0.3s ease';
    container.style.opacity = 0;
    
    setTimeout(() => {
      // Build a premium success card with a checkmark animation
      container.innerHTML = `
        <div class="div" style="align-items: center; text-align: center; gap: 24px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #eaf6ed; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#2c694e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 style="font-family: 'Plus Jakarta Sans-Bold', Helvetica, sans-serif; font-size: 28px; color: #012d1d; font-weight: 700; line-height: 36px; margin: 0;">
            Welcome to FarmConnect!
          </h2>
          <p style="font-family: 'Inter-Regular', Helvetica, sans-serif; font-size: 15px; color: #414844; line-height: 24px; margin: 0;">
            Hi <strong>${escapeHtml(data.fullName)}</strong>, your registration as a <strong>${escapeHtml(data.role)}</strong> is successful.<br>
            A confirmation link has been sent to <strong>${escapeHtml(data.email)}</strong>.
          </p>
          <button class="button" onclick="window.location.reload()" style="margin-top: 16px;">
            <div class="text-3">Back to Homepage</div>
          </button>
        </div>
      `;
      container.style.opacity = 1;
    }, 300);
  };

  // Google sign up mock handler
  googleBtn.addEventListener('click', () => {
    const originalText = googleBtn.querySelector('.text-5').innerText;
    googleBtn.querySelector('.text-5').innerText = 'Connecting to Google...';
    googleBtn.style.opacity = '0.7';
    googleBtn.disabled = true;
    
    setTimeout(() => {
      alert('Mock Google OAuth Triggered! In production, this would redirect to Google account selection.');
      googleBtn.querySelector('.text-5').innerText = originalText;
      googleBtn.style.opacity = '1';
      googleBtn.disabled = false;
    }, 1200);
  });

  // Login click handler
  loginBtn.addEventListener('click', () => {
    alert('Log In page modal or redirect would trigger here!');
  });
  
  // Keyboard access for Login text
  loginBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      loginBtn.click();
    }
  });

  // Helper function to escape HTML values
  function escapeHtml(string) {
    const matchHtmlRegExp = /["'&<>]/;
    const str = '' + string;
    const match = matchHtmlRegExp.exec(str);

    if (!match) {
      return str;
    }

    let escape;
    let html = '';
    let index = 0;
    let lastIndex = 0;

    for (index = match.index; index < str.length; index++) {
      switch (str.charCodeAt(index)) {
        case 34: // "
          escape = '&quot;';
          break;
        case 38: // &
          escape = '&amp;';
          break;
        case 39: // '
          escape = '&#39;';
          break;
        case 60: // <
          escape = '&lt;';
          break;
        case 62: // >
          escape = '&gt;';
          break;
        default:
          continue;
      }

      if (lastIndex !== index) {
        html += str.substring(lastIndex, index);
      }

      lastIndex = index + 1;
      html += escape;
    }

    return lastIndex !== index
      ? html + str.substring(lastIndex, index)
      : html;
  }
});
