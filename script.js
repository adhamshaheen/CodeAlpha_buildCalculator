class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        
        this.currentOperandElement = document.getElementById('current-operand');
        this.previousOperandElement = document.getElementById('previous-operand');
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Button click events
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.dataset.number);
                this.addButtonPressAnimation(button);
            });
        });
        
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                this.handleAction(button.dataset.action);
                this.addButtonPressAnimation(button);
            });
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    handleKeyboard(e) {
        const key = e.key;
        let button = null;
        
        // Prevent default behavior for calculator keys
        if (/[0-9+\-*/.=]|Enter|Escape|Backspace/.test(key)) {
            e.preventDefault();
        }
        
        if (/[0-9]/.test(key)) {
            this.appendNumber(key);
            button = document.querySelector(`[data-number="${key}"]`);
        } else if (key === '.') {
            this.appendNumber('.');
            button = document.querySelector('[data-action="decimal"]');
        } else if (key === '+') {
            this.handleAction('add');
            button = document.querySelector('[data-action="add"]');
        } else if (key === '-') {
            this.handleAction('subtract');
            button = document.querySelector('[data-action="subtract"]');
        } else if (key === '*') {
            this.handleAction('multiply');
            button = document.querySelector('[data-action="multiply"]');
        } else if (key === '/') {
            this.handleAction('divide');
            button = document.querySelector('[data-action="divide"]');
        } else if (key === '=' || key === 'Enter') {
            this.handleAction('equals');
            button = document.querySelector('[data-action="equals"]');
        } else if (key === 'Escape') {
            this.handleAction('clear');
            button = document.querySelector('[data-action="clear"]');
        } else if (key === 'Backspace') {
            this.handleAction('delete');
            button = document.querySelector('[data-action="delete"]');
        }
        
        if (button) {
            this.addButtonPressAnimation(button);
        }
    }
    
    addButtonPressAnimation(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 100);
    }
    
    appendNumber(number) {
        // Handle decimal point
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Reset display if needed
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }
        
        // Handle leading zero
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        
        this.updateDisplay();
    }
    
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.chooseOperation(action);
                break;
            case 'equals':
                this.compute();
                break;
            case 'decimal':
                this.appendNumber('.');
                break;
        }
    }
    
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.clearError();
        this.updateDisplay();
    }
    
    delete() {
        if (this.currentOperand.length <= 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }
    
    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        
        // If there's a previous calculation, compute it first
        if (this.previousOperand !== '' && this.operation !== null && !this.shouldResetDisplay) {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetDisplay = true;
        
        // Update operator button states
        this.updateOperatorButtons();
        this.updateDisplay();
    }
    
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case 'add':
                computation = prev + current;
                break;
            case 'subtract':
                computation = prev - current;
                break;
            case 'multiply':
                computation = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Handle floating point precision issues
        if (computation % 1 !== 0) {
            computation = parseFloat(computation.toFixed(10));
        }
        
        // Check for overflow
        if (!isFinite(computation)) {
            this.showError('Result too large');
            return;
        }
        
        this.currentOperand = computation.toString();
        this.operation = null;
        this.previousOperand = '';
        this.shouldResetDisplay = true;
        
        this.clearOperatorButtons();
        this.updateDisplay();
    }
    
    updateOperatorButtons() {
        // Clear all active states
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active state to current operation
        if (this.operation) {
            const activeButton = document.querySelector(`[data-action="${this.operation}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        }
    }
    
    clearOperatorButtons() {
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    showError(message) {
        this.currentOperand = message;
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetDisplay = true;
        
        // Add error styling
        document.querySelector('.display').classList.add('error');
        
        this.updateDisplay();
        
        // Clear error after 2 seconds
        setTimeout(() => {
            if (this.currentOperand === message) {
                this.clear();
            }
        }, 2000);
    }
    
    clearError() {
        document.querySelector('.display').classList.remove('error');
    }
    
    updateDisplay() {
        // Format current operand for display
        let displayValue = this.currentOperand;
        
        // Add commas for large numbers (if it's a valid number)
        if (!isNaN(parseFloat(this.currentOperand)) && isFinite(this.currentOperand)) {
            const number = parseFloat(this.currentOperand);
            if (Math.abs(number) >= 1000) {
                displayValue = number.toLocaleString();
            }
        }
        
        this.currentOperandElement.textContent = displayValue;
        
        // Update previous operand display
        if (this.operation != null) {
            const operationSymbol = this.getOperationSymbol(this.operation);
            this.previousOperandElement.textContent = `${this.previousOperand} ${operationSymbol}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }
    
    getOperationSymbol(operation) {
        switch (operation) {
            case 'add': return '+';
            case 'subtract': return '−';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Prevent context menu on right click for better mobile experience
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('btn')) {
        e.preventDefault();
    }
});