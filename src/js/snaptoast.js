/**
 * SnapToast - A lightweight JavaScript plugin for customizable toast notifications.
 * Now with ARIA compliance and compatibility for older browsers.
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
 * - readMoreText (string): Text displayed for the "Read more" link. Default is 'Read more'.
 * - readLessText (string): Text displayed for the "Read less" link. Default is 'Read less'.
 * 
 * ARIA Compliance:
 * - All toasts are marked with role="alert" and aria-live="polite".
 * - Focusable and accessible via keyboard for better accessibility.
 */

(function () {
    // Polyfill for classList (IE9+)
    if (!("classList" in document.createElement("_"))) {
        (function (view) {
            "use strict";
            if (!("Element" in view)) return;

            var classListProp = "classList",
                protoProp = "prototype",
                elemCtrProto = view.Element[protoProp],
                objCtr = Object,
                strTrim =
                    String[protoProp].trim ||
                    function () {
                        return this.replace(/^\s+|\s+$/g, "");
                    },
                arrIndexOf =
                    Array[protoProp].indexOf ||
                    function (item) {
                        var i = 0,
                            len = this.length;
                        for (; i < len; i++) {
                            if (i in this && this[i] === item) {
                                return i;
                            }
                        }
                        return -1;
                    },
                DOMEx = function (type, message) {
                    this.name = type;
                    this.code = DOMException[type];
                    this.message = message;
                },
                checkTokenAndGetIndex = function (classList, token) {
                    if (token === "") {
                        throw new DOMEx(
                            "SYNTAX_ERR",
                            "An invalid or illegal string was specified"
                        );
                    }
                    if (/\s/.test(token)) {
                        throw new DOMEx(
                            "INVALID_CHARACTER_ERR",
                            "String contains an invalid character"
                        );
                    }
                    return arrIndexOf.call(classList, token);
                },
                ClassList = function (elem) {
                    var trimmedClasses = strTrim.call(elem.getAttribute("class") || ""),
                        classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
                        i = 0,
                        len = classes.length;
                    for (; i < len; i++) {
                        this.push(classes[i]);
                    }
                    this._updateClassName = function () {
                        elem.setAttribute("class", this.toString());
                    };
                },
                classListProto = (ClassList[protoProp] = []),
                classListGetter = function () {
                    return new ClassList(this);
                };
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function (i) {
                return this[i] || null;
            };
            classListProto.contains = function (token) {
                token += "";
                return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function () {
                var tokens = arguments,
                    i = 0,
                    l = tokens.length,
                    token,
                    updated = false;
                do {
                    token = tokens[i] + "";
                    if (checkTokenAndGetIndex(this, token) === -1) {
                        this.push(token);
                        updated = true;
                    }
                } while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };
            classListProto.remove = function () {
                var tokens = arguments,
                    i = 0,
                    l = tokens.length,
                    token,
                    updated = false,
                    index;
                do {
                    token = tokens[i] + "";
                    index = checkTokenAndGetIndex(this, token);
                    while (index !== -1) {
                        this.splice(index, 1);
                        updated = true;
                        index = checkTokenAndGetIndex(this, token);
                    }
                } while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };
            classListProto.toggle = function (token, force) {
                token += "";

                var result = this.contains(token),
                    method = result
                        ? force !== true && "remove"
                        : force !== false && "add";

                if (method) {
                    this[method](token);
                }

                return force === true || force === false ? force : !result;
            };
            classListProto.toString = function () {
                return this.join(" ");
            };

            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get: classListGetter,
                    enumerable: true,
                    configurable: true,
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) {
                    if (ex.number === -2146823252) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(
                            elemCtrProto,
                            classListProp,
                            classListPropDesc
                        );
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }
        })(self);
    }

    // Polyfill for addEventListener and removeEventListener (IE8+)
    if (!Element.prototype.addEventListener) {
        Element.prototype.addEventListener = function (type, listener) {
            if (this.attachEvent) {
                this.attachEvent("on" + type, listener);
            }
        };
    }

    if (!Element.prototype.removeEventListener) {
        Element.prototype.removeEventListener = function (type, listener) {
            if (this.detachEvent) {
                this.detachEvent("on" + type, listener);
            }
        };
    }

    class SnapToast {
        static settings = {
            maxVisibleToasts: 3,       // Default maximum number of visible toasts
            readMoreText: 'Read more', // Default "Read more" text
            readLessText: 'Read less'  // Default "Read less" text
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
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');
            toast.tabIndex = 0; // Make toast focusable for accessibility

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
                closeButton.setAttribute('aria-label', 'Close notification');
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
                closeButton.setAttribute('aria-label', 'Close notification');
                closeButton.addEventListener('click', () => {
                    this.closeToast(toast, container);
                });
                bodyDiv.appendChild(closeButton);
            }

            // Add "Read More" functionality for long messages
            if (this.message.length > 100) { 
                const readMore = document.createElement('span');
                readMore.className = 'snap-toast-read-more';
                readMore.innerText = SnapToast.settings.readMoreText;
                readMore.setAttribute('role', 'button');
                readMore.setAttribute('aria-expanded', 'false');
                readMore.tabIndex = 0; // Make the link focusable for accessibility
                readMore.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent the click on "Read more" from closing the toast
                    bodyDiv.classList.toggle('expanded');
                    if (bodyDiv.classList.contains('expanded')) {
                        toast.style.maxHeight = `${bodyDiv.scrollHeight + 60}px`; // Adjust the toast height
                        readMore.innerText = SnapToast.settings.readLessText;
                        readMore.setAttribute('aria-expanded', 'true');
                    } else {
                        toast.style.maxHeight = '120px'; // Return to original height
                        readMore.innerText = SnapToast.settings.readMoreText;
                        readMore.setAttribute('aria-expanded', 'false');
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
                toast.focus(); // Focus the toast for accessibility
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
                    // Check if the toast is still in the DOM before attempting to remove it
                    if (toast.parentElement) {
                        toast.parentElement.removeChild(toast);
                    }
                    // Handle queued toasts
                    if (container.children.length < SnapToast.settings.maxVisibleToasts && SnapToast.toastQueue.length > 0) {
                        const nextToast = SnapToast.toastQueue.shift();
                        this.showToast(nextToast.toast, nextToast.container);
                    }
                    // If no more toasts are in the container or queue, remove the container
                    if (container.children.length === 0 && SnapToast.toastQueue.length === 0 && container.parentElement) {
                        container.parentElement.removeChild(container);
                    }
                }, 300);
            }, delay);
        }
    }

    // Expose SnapToast to the global scope
    window.SnapToast = SnapToast;
})();
