/**
 * SnapToast - A lightweight JavaScript plugin for customizable toast notifications.
 *
 * @param {string} message - The message content to display in the toast.
 * @param {string} [title=''] - (Optional) The title of the toast notification.
 * @param {string} [mode='info'] - The type of toast. Options are 'info', 'warning', 'danger', 'success'.
 * @param {string} [position='top-right'] - The position of the toast on the screen. Options are 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'center-top', 'center-bottom'.
 * @param {number} [duration=3000] - The duration (in milliseconds) the toast remains visible before automatically closing.
 * 
 * Plugin Configuration:
 * 
 * - maxVisibleToasts (number): Limits the number of toasts visible at the same time. Default is 3.
 * 
 * Usage:
 * 
 * 1. Configure the plugin (optional):
 * 
 * SnapToast.configure({
 *     maxVisibleToasts: 5 // Set the maximum number of visible toasts
 * });
 * 
 * 2. Create a toast notification:
 * 
 * new SnapToast('This is a message', 'Title', 'info', 'top-right', 5000);
 * 
 * 3. Available modes for toast:
 * 
 * - 'info': Displays an informational message.
 * - 'warning': Displays a warning message.
 * - 'danger': Displays an error or danger message.
 * - 'success': Displays a success message.
 * 
 * 4. Available positions for toast:
 * 
 * - 'top-right': Toast appears in the top-right corner of the screen.
 * - 'top-left': Toast appears in the top-left corner of the screen.
 * - 'bottom-right': Toast appears in the bottom-right corner of the screen.
 * - 'bottom-left': Toast appears in the bottom-left corner of the screen.
 * - 'center-top': Toast appears at the center of the screen at the top.
 * - 'center-bottom': Toast appears at the center of the screen at the bottom.
 * 
 * 5. Advanced Features:
 * 
 * - Hover/Click Pause: The toast's countdown pauses when the user hovers over or clicks on the toast, preventing it from closing automatically during interaction.
 * - Read More: For long messages, a "Read more" link is displayed, allowing the user to expand the toast and view the full message. The toast remains visible until the user interacts with it.
 * 
 * Example usage:
 * 
 * <script>
 *     // Optional configuration
 *     SnapToast.configure({
 *         maxVisibleToasts: 5 // Allow up to 5 toasts to be visible at once
 *     });
 * 
 *     // Create toasts
 *     new SnapToast('Operation completed successfully.', 'Success', 'success', 'top-right', 5000);
 *     new SnapToast('Error processing your request.', 'Error', 'danger', 'bottom-left', 7000);
 *     new SnapToast('This is an informational message.', 'Info', 'info', 'center-top', 3000);
 * </script>
 */

class SnapToast {
    static settings = {
        maxVisibleToasts: 3, // Default maximum number of visible toasts
    };
    static toastQueue = []; // Queue for pending toasts

    /**
     * Initializes a new toast notification.
     * 
     * @param {string} message - The message content to display in the toast.
     * @param {string} [title=''] - (Optional) The title of the toast notification.
     * @param {string} [mode='info'] - The type of toast. Options are 'info', 'warning', 'danger', 'success'.
     * @param {string} [position='top-right'] - The position of the toast on the screen.
     * @param {number} [duration=3000] - The duration (in milliseconds) the toast remains visible before automatically closing.
     */
    constructor(message, title = '', mode = 'info', position = 'top-right', duration = 3000) {
        this.message = message;
        this.title = title;
        this.mode = mode;
        this.position = position;
        this.duration = duration;
        this.timeoutId = null;
        this.remainingTime = duration;
        this.startTime = null;
        this.isPaused = false; // State to know if the toast is paused by click
        this.createToast();
    }

    /**
     * Updates the plugin's global settings.
     * 
     * @param {Object} settings - An object containing the settings to be updated.
     * 
     * Example:
     * 
     * SnapToast.configure({ maxVisibleToasts: 5 });
     */
    static configure(settings) {
        this.settings = { ...this.settings, ...settings };
    }

    /**
     * Creates and displays the toast notification.
     * Adds the toast to the queue if the maximum number of visible toasts is exceeded.
     */
    createToast() {
        const container = this.getContainer();

        // Create the toast
        const toast = document.createElement('div');
        toast.className = `snap-toast-notification snap-toast-${this.mode}`;

        if (this.title) {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'snap-toast-header';

            const iconDiv = document.createElement('div');
            iconDiv.className = 'snap-toast-header-icon';

            const titleElement = document.createElement('div');
            titleElement.className = 'snap-toast-header-title';
            titleElement.innerText = this.title;

            const closeButton = document.createElement('button');
            closeButton.className = 'snap-toast-close';
            closeButton.innerText = 'X';
            closeButton.addEventListener('click', () => {
                this.closeToast(toast, container);
            });

            headerDiv.appendChild(iconDiv);
            headerDiv.appendChild(titleElement);
            headerDiv.appendChild(closeButton);
            toast.appendChild(headerDiv);
        }

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'snap-toast-body';
        bodyDiv.innerText = this.message;

        if (!this.title) {
            const closeButton = document.createElement('button');
            closeButton.className = 'snap-toast-close';
            closeButton.innerText = 'X';
            closeButton.addEventListener('click', () => {
                this.closeToast(toast, container);
            });
            bodyDiv.appendChild(closeButton);
        }

        // Add "Read More" functionality for long messages
        if (this.message.length > 100) { 
            const readMore = document.createElement('span');
            readMore.className = 'snap-toast-read-more';
            readMore.innerText = 'Read more';
            readMore.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the click on "Read more" from closing the toast
                bodyDiv.classList.toggle('expanded');
                if (bodyDiv.classList.contains('expanded')) {
                    toast.style.maxHeight = `${bodyDiv.scrollHeight + 60}px`; // Adjust the toast height
                    readMore.innerText = 'Read less';
                } else {
                    toast.style.maxHeight = '120px'; // Return to original height
                    readMore.innerText = 'Read more';
                }
                // Mark the toast as paused when "Read more" is clicked
                this.isPaused = true;
                toast.classList.add('paused');
                this.pauseTimeout();
            });
            bodyDiv.appendChild(readMore);
        }

        toast.appendChild(bodyDiv);

        // Pause and resume the timer on hover or click
        toast.addEventListener('mouseenter', () => {
            if (!this.isPaused) this.pauseTimeout();
        });

        toast.addEventListener('mouseleave', () => {
            if (!this.isPaused) this.resumeTimeout(toast, container);
        });

        // Handle clicks to pause and mark the toast
        toast.addEventListener('click', () => {
            if (this.isPaused) {
                this.isPaused = false;
                toast.classList.remove('paused');
                this.resumeTimeout(toast, container);
            } else {
                this.isPaused = true;
                toast.classList.add('paused');
                this.pauseTimeout();
            }
        });

        // Add the toast to the queue if there is no space
        if (container.children.length < SnapToast.settings.maxVisibleToasts) {
            this.showToast(toast, container);
        } else {
            SnapToast.toastQueue.push({ toast, container });
        }
    }

    /**
     * Gets the container for the toasts based on the position.
     * If the container does not exist, it is created.
     * 
     * @returns {HTMLElement} The container for the toasts.
     */
    getContainer() {
        let container = document.querySelector(`.snap-toast-container.${this.position}`);
        if (!container) {
            container = document.createElement('div');
            container.className = `snap-toast-container ${this.position}`;
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Displays the toast notification.
     * Starts the countdown timer for auto-closing the toast.
     * 
     * @param {HTMLElement} toast - The toast element to be displayed.
     * @param {HTMLElement} container - The container element where the toast is to be appended.
     */
    showToast(toast, container) {
        if (this.position.includes('bottom')) {
            container.prepend(toast);
        } else {
            container.appendChild(toast);
        }

        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
            this.startTime = Date.now();
            this.timeoutId = setTimeout(() => {
                this.closeToast(toast, container, true);
            }, this.remainingTime);
        }, 100);
    }

    /**
     * Pauses the countdown timer when the user hovers over or clicks on the toast.
     */
    pauseTimeout() {
        clearTimeout(this.timeoutId);
        this.remainingTime -= Date.now() - this.startTime;
    }

    /**
     * Resumes the countdown timer when the user stops hovering over or clicks again on the toast.
     * 
     * @param {HTMLElement} toast - The toast element.
     * @param {HTMLElement} container - The container element where the toast is located.
     */
    resumeTimeout(toast, container) {
        this.startTime = Date.now();
        this.timeoutId = setTimeout(() => {
            this.closeToast(toast, container, true);
        }, this.remainingTime);
    }

    /**
     * Closes the toast notification, either automatically or manually by the user.
     * Removes the toast from the DOM and handles the display of queued toasts.
     * 
     * @param {HTMLElement} toast - The toast element to be closed.
     * @param {HTMLElement} container - The container element where the toast is located.
     * @param {boolean} [auto=false] - Indicates if the toast is being closed automatically.
     */
    closeToast(toast, container, auto = false) {
        const delay = auto ? 0 : 200;

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
                if (container.children.length < SnapToast.settings.maxVisibleToasts && SnapToast.toastQueue.length > 0) {
                    const nextToast = SnapToast.toastQueue.shift();
                    this.showToast(nextToast.toast, nextToast.container);
                }
                if (container.children.length === 0 && SnapToast.toastQueue.length === 0) {
                    document.body.removeChild(container);
                }
            }, 300);
        }, delay);
    }
}
