// SmartLoan Hub JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initEMICalculator();
    initApplicationForm();
    initChatWidget();
    initLoanCards();
    initFAQ();
    initScrollEffects();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');
    const dropdownLinks = document.querySelectorAll('.dropdown__link');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    [...navLinks, ...dropdownLinks].forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                    }
                }
            }
        });
    });
}

// EMI Calculator functionality
function initEMICalculator() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const calculateBtn = document.getElementById('calculateEMI');
    const loanAmountInput = document.getElementById('loanAmount');
    const interestRateInput = document.getElementById('interestRate');
    const loanTenureInput = document.getElementById('loanTenure');

    // Loan type specific data
    const loanData = {
        home: {
            minRate: 7.35,
            maxRate: 12.65,
            defaultAmount: 5000000,
            defaultTenure: 20
        },
        personal: {
            minRate: 10.49,
            maxRate: 24.00,
            defaultAmount: 500000,
            defaultTenure: 5
        },
        vehicle: {
            minRate: 8.35,
            maxRate: 15.00,
            defaultAmount: 1000000,
            defaultTenure: 7
        }
    };

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const loanType = this.dataset.tab;
            
            // Update active tab
            tabBtns.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            
            // Update default values
            const data = loanData[loanType];
            if (loanAmountInput) loanAmountInput.value = data.defaultAmount;
            if (interestRateInput) interestRateInput.value = data.minRate;
            if (loanTenureInput) loanTenureInput.value = data.defaultTenure;
            
            // Recalculate EMI
            calculateEMI();
        });
    });

    // Calculate EMI on input change
    [loanAmountInput, interestRateInput, loanTenureInput].forEach(input => {
        if (input) {
            input.addEventListener('input', calculateEMI);
            input.addEventListener('change', calculateEMI);
        }
    });

    // Calculate EMI on button click
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            calculateEMI();
        });
    }

    // Initial calculation
    setTimeout(calculateEMI, 100);

    function calculateEMI() {
        const principal = parseFloat(loanAmountInput?.value) || 0;
        const annualRate = parseFloat(interestRateInput?.value) || 0;
        const years = parseFloat(loanTenureInput?.value) || 0;

        if (principal <= 0 || annualRate <= 0 || years <= 0) {
            updateResults(0, 0, 0);
            return;
        }

        const monthlyRate = annualRate / (12 * 100);
        const numberOfPayments = years * 12;

        // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
                   (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        const totalPayment = emi * numberOfPayments;
        const totalInterest = totalPayment - principal;

        updateResults(emi, totalInterest, totalPayment);
    }

    function updateResults(emi, totalInterest, totalPayment) {
        const emiElement = document.getElementById('emiAmount');
        const totalInterestElement = document.getElementById('totalInterest');
        const totalPaymentElement = document.getElementById('totalPayment');
        
        if (emiElement) emiElement.textContent = `Rs ${formatNumber(Math.round(emi))}`;
        if (totalInterestElement) totalInterestElement.textContent = `Rs ${formatNumber(Math.round(totalInterest))}`;
        if (totalPaymentElement) totalPaymentElement.textContent = `Rs ${formatNumber(Math.round(totalPayment))}`;
    }

    function formatNumber(num) {
        return num.toLocaleString('en-IN');
    }
}

// Application Form functionality
function initApplicationForm() {
    const form = document.getElementById('loanApplicationForm');
    const nextBtn = document.getElementById('nextStep');
    const prevBtn = document.getElementById('prevStep');
    const submitBtn = document.getElementById('submitApp');
    const steps = document.querySelectorAll('.step');
    const formSteps = document.querySelectorAll('.form-step');
    
    let currentStep = 1;
    const totalSteps = 4;

    // Next step handler
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    currentStep++;
                    updateStep();
                }
            }
        });
    }

    // Previous step handler
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentStep > 1) {
                currentStep--;
                updateStep();
            }
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateStep(currentStep)) {
                submitApplication();
            }
        });
    }

    function updateStep() {
        // Update step indicators
        steps.forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update form steps
        formSteps.forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update buttons
        if (prevBtn) {
            prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
        }
        
        if (currentStep === totalSteps) {
            if (nextBtn) nextBtn.classList.add('hidden');
            if (submitBtn) submitBtn.classList.remove('hidden');
            generateReview();
        } else {
            if (nextBtn) nextBtn.classList.remove('hidden');
            if (submitBtn) submitBtn.classList.add('hidden');
        }
    }

    function validateStep(step) {
        const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
        const requiredFields = currentFormStep.querySelectorAll('[required]');
        let isValid = true;
        let errorMessage = '';

        requiredFields.forEach(field => {
            const value = field.value.trim();
            
            if (!value) {
                field.style.borderColor = 'var(--color-error)';
                field.style.boxShadow = '0 0 0 2px rgba(192, 21, 47, 0.1)';
                isValid = false;
                errorMessage = 'Please fill in all required fields.';
            } else {
                field.style.borderColor = 'var(--color-border)';
                field.style.boxShadow = '';
                
                // Additional validation
                if (field.type === 'email' && !validateEmail(value)) {
                    field.style.borderColor = 'var(--color-error)';
                    field.style.boxShadow = '0 0 0 2px rgba(192, 21, 47, 0.1)';
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                } else if (field.type === 'tel' && !validatePhone(value)) {
                    field.style.borderColor = 'var(--color-error)';
                    field.style.boxShadow = '0 0 0 2px rgba(192, 21, 47, 0.1)';
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number.';
                }
            }
        });

        if (!isValid) {
            showNotification(errorMessage, 'error');
        }

        return isValid;
    }

    function generateReview() {
        const formData = new FormData(form);
        const reviewContainer = document.getElementById('applicationReview');
        
        let reviewHTML = '<h4>Application Summary</h4>';
        
        // Personal Information
        reviewHTML += '<div class="review-section">';
        reviewHTML += '<h5>Personal Information</h5>';
        reviewHTML += `<p><strong>Name:</strong> ${formData.get('fullName') || 'N/A'}</p>`;
        reviewHTML += `<p><strong>Email:</strong> ${formData.get('email') || 'N/A'}</p>`;
        reviewHTML += `<p><strong>Phone:</strong> ${formData.get('phone') || 'N/A'}</p>`;
        reviewHTML += `<p><strong>Date of Birth:</strong> ${formData.get('dob') || 'N/A'}</p>`;
        reviewHTML += '</div>';

        // Employment Information
        reviewHTML += '<div class="review-section">';
        reviewHTML += '<h5>Employment Details</h5>';
        reviewHTML += `<p><strong>Employment Type:</strong> ${formData.get('employmentType') || 'N/A'}</p>`;
        reviewHTML += `<p><strong>Monthly Income:</strong> Rs ${formatNumber(formData.get('monthlyIncome')) || 'N/A'}</p>`;
        reviewHTML += `<p><strong>Company:</strong> ${formData.get('companyName') || 'N/A'}</p>`;
        reviewHTML += '</div>';

        // Loan Details
        reviewHTML += '<div class="review-section">';
        reviewHTML += '<h5>Loan Requirements</h5>';
        reviewHTML += `<p><strong>Loan Type:</strong> ${formData.get('loanType') || 'N/A'}</p>`;
        reviewHTML += `<p><strong>Loan Amount:</strong> Rs ${formatNumber(formData.get('loanAmount')) || 'N/A'}</p>`;
        reviewHTML += `<p><strong>Tenure:</strong> ${formData.get('loanTenure') || 'N/A'} years</p>`;
        reviewHTML += '</div>';

        if (reviewContainer) {
            reviewContainer.innerHTML = reviewHTML;
        }
    }

    function submitApplication() {
        // Simulate form submission
        const submitButton = document.getElementById('submitApp');
        const originalText = submitButton?.textContent;
        
        if (submitButton) {
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;
        }
        
        setTimeout(() => {
            showNotification('Application submitted successfully! Our team will contact you within 24 hours.', 'success');
            if (form) form.reset();
            currentStep = 1;
            updateStep();
            if (submitButton) {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        }, 2000);
    }

    function formatNumber(num) {
        return parseInt(num).toLocaleString('en-IN');
    }

    // Initialize first step
    updateStep();
}

// Chat Widget functionality
function initChatWidget() {
    const chatToggle = document.querySelector('.chat-toggle');
    const chatBox = document.querySelector('.chat-box');
    const chatClose = document.querySelector('.chat-close');
    const chatInput = document.querySelector('.chat-input input');
    const chatSendBtn = document.querySelector('.chat-input button');
    const chatMessages = document.querySelector('.chat-messages');

    // Toggle chat box
    if (chatToggle) {
        chatToggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (chatBox) {
                chatBox.classList.toggle('open');
            }
        });
    }

    // Close chat box
    if (chatClose) {
        chatClose.addEventListener('click', function(e) {
            e.preventDefault();
            if (chatBox) {
                chatBox.classList.remove('open');
            }
        });
    }

    // Send message
    function sendMessage() {
        if (!chatInput) return;
        
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            chatInput.value = '';
            
            // Simulate bot response
            setTimeout(() => {
                addBotResponse(message);
            }, 1000);
        }
    }

    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    function addMessage(message, sender) {
        if (!chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}`;
        messageEl.textContent = message;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addBotResponse(userMessage) {
        const responses = [
            "Thank you for your query. Our loan specialists can help you with competitive rates starting from 7.35% p.a.",
            "I can help you calculate your EMI or connect you with our loan experts. What would you prefer?",
            "For quick loan approval, you can apply online. Most applications are processed within 24-48 hours.",
            "We offer Home Loans, Personal Loans, and Vehicle Loans with minimal documentation. Which loan are you interested in?",
            "Our customer service team is available 24/7 to assist you. You can also call us at 1800-123-4567."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'bot');
    }
}

// Loan Cards functionality
function initLoanCards() {
    const loanCardBtns = document.querySelectorAll('.loan-card__btn');
    const heroCtaBtn = document.querySelector('.hero__cta');

    // Handle loan card buttons
    loanCardBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const loanType = this.dataset.loan;
            const targetSection = document.getElementById(`${loanType}-loans`);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle hero CTA button
    if (heroCtaBtn) {
        heroCtaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const calculatorSection = document.getElementById('calculators');
            if (calculatorSection) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = calculatorSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// FAQ functionality
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq__question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isOpen = answer.style.display === 'block';
            
            // Close all other answers
            document.querySelectorAll('.faq__answer').forEach(ans => {
                ans.style.display = 'none';
            });
            
            // Toggle current answer
            if (!isOpen) {
                answer.style.display = 'block';
            }
        });
    });
}

// Scroll effects and animations
function initScrollEffects() {
    // Add scroll effect to header
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        if (header) {
            if (currentScrollY > 100) {
                header.style.background = 'rgba(33, 128, 141, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal-700) 100%)';
                header.style.backdropFilter = 'none';
            }
        }
        
        lastScrollY = currentScrollY;
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.loan-card, .feature, .result-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'var(--color-error)' : type === 'success' ? 'var(--color-success)' : 'var(--color-info)'};
        color: var(--color-white);
        padding: var(--space-16);
        border-radius: var(--radius-base);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-16);
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    const button = notification.querySelector('button');
    if (button) {
        button.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            font-size: var(--font-size-xl);
            cursor: pointer;
            padding: 0;
            margin-left: var(--space-8);
        `;
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Handle form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
}

// Handle number formatting for Indian currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Export functions for external use
window.SmartLoanHub = {
    calculateEMI: function(principal, rate, years) {
        const monthlyRate = rate / (12 * 100);
        const numberOfPayments = years * 12;
        return principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    },
    formatCurrency: formatCurrency,
    validateEmail: validateEmail,
    validatePhone: validatePhone,
    showNotification: showNotification
};