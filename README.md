# SnapToast

**SnapToast** is a lightweight, customizable, and easy-to-use JavaScript plugin designed to create elegant and accessible toast notifications. Whether you need to display brief alerts, updates, or status messages, SnapToast provides a flexible and modern solution. Inspired by best practices in UI/UX design, SnapToast offers a wide range of features, including configurable toast limits, multi-position support, and expandable content, all while remaining highly performant and compatible with older browsers.

## Examples
### Simple Toast with title
![image](https://github.com/user-attachments/assets/c8e7bcc1-3d0c-401d-a1ff-3e16fac537f3)

### Simple Toast without title
![image](https://github.com/user-attachments/assets/e970f7f3-bd1c-4c49-b701-51043eafa1c7)

### Toast with read more capabilities (Closed)
![image](https://github.com/user-attachments/assets/12bce17e-47be-48f0-b7fd-dd947266e661)


### Toast with read more capabilities (Opened)
![image](https://github.com/user-attachments/assets/0a6fb793-228a-4393-acda-32a7dac648e4)

## Features
- **Configurable Toast Limit:** Set the maximum number of toasts that can be displayed on the screen at once to ensure a clean and manageable UI.
- **Customizable Messages:** Display brief, customizable messages with optional titles, allowing you to tailor the notifications to your application's needs.
- **Positioning Options:** Choose from multiple positions to display toasts, including top-right, top-left, bottom-right, bottom-left, center-top, and center-bottom.
- **Auto Dismissal with Pause:** Toasts can be set to auto-dismiss after a specified duration, with the ability to pause the countdown when the user hovers over or clicks on the toast.
- **Expandable Content:** For longer messages, include a "Read more" link that expands the toast to reveal the full content, improving readability.
- **Multi-Language Support:** Customize the text for "Read more" and "Read less" links to support multiple languages in your application.
- **Accessible Design:** Built with accessibility in mind, SnapToast uses ARIA roles and attributes to ensure compatibility with screen readers and keyboard navigation.
- **Lightweight and Fast:** SnapToast is optimized for performance, ensuring that notifications are displayed without delay and with minimal impact on your application's performance.
- **Customizable Appearance:** Easily customize the look and feel of the toasts through CSS, allowing them to seamlessly integrate with your design system.
- **Compatibility with Older Browsers:** Includes polyfills to support older browsers, ensuring that your notifications work across a wide range of environments.

## Installation

Include the SnapSelect JavaScript and CSS files in your project:
```html
<link rel="stylesheet" href="/path/to/snaptoast/dist/css/snaptoast.min.css">
<script src="/path/to/snaptoast/dist/js/snaptoast.min.js"></script>
```
## Usage
Initialize SnapToast by creating instances of the toast notifications with your desired configurations:
```html
<!-- Basic Toast -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Example of a basic toast notification
        new SnapToast('This is a basic toast message.', 'Basic Toast', 'info', 'top-right', 5000);
    });
</script>

<!-- Multiple Toasts with Custom Configuration -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Configure SnapToast with custom settings
        SnapToast.configure({
            maxVisibleToasts: 4,       // Limit the number of visible toasts
            readMoreText: 'See more',  // Customize the "Read more" text
            readLessText: 'See less'   // Customize the "Read less" text
        });

        // Example toasts with various configurations
        new SnapToast('Success! Your action was successful.', 'Success', 'success', 'bottom-left', 4000);
        new SnapToast('Warning: Please check your inputs.', 'Warning', 'warning', 'top-left', 6000);
        new SnapToast('Error: Something went wrong.', 'Error', 'danger', 'bottom-right', 7000);
        new SnapToast('Info: This is an informational message.', 'Info', 'info', 'center-top', 5000);
    });
</script>

<!-- Toast with Expandable Content -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Toast with long content that supports the "Read more" functionality
        new SnapToast('This message is a bit longer and contains additional information. Click "Read more" to expand and see the full content.', 'Expandable Toast', 'info', 'center-bottom', 10000);
    });
</script>
```
## Available Options
-   `message` (string): The content to display in the toast.
-   `title` (string, optional): The title of the toast notification.
-   `mode` (string): The type of toast, options include 'info', 'warning', 'danger', 'success'.
-   `position` (string): The screen position for the toast, options include 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'center-top', 'center-bottom'.
-   `duration` (number): The duration in milliseconds before the toast automatically closes.

## Configuration Options
-   `maxVisibleToasts` (number): Limits the number of toasts visible at the same time. Default: 3.
-   `readMoreText` (string): Text displayed for the "Read more" link. Default: 'Read more'.
-   `readLessText` (string): Text displayed for the "Read less" link. Default: 'Read less'.

## Accessibility (ARIA)
SnapToast is designed with accessibility in mind and includes ARIA attributes to enhance usability with assistive technologies.
-   Role as Alert: Each toast notification is set with role="alert" to ensure that screen readers announce the content immediately when it appears.
-   Polite Notifications: The toasts use aria-live="polite", allowing the message to be announced without interrupting the user's current activity.
-   Keyboard Accessibility: Toasts are focusable using tabindex="0", allowing users to navigate and interact with the toasts via keyboard.
-   Expandable Content: When using the "Read more" functionality, the expandable content is marked with aria-expanded, which dynamically updates to reflect the current state (expanded or collapsed).
-   Close Button: The close button in each toast is labeled with aria-label="Close notification" to clearly describe its function to screen readers.

## Compatibility and Polyfills
SnapToast includes polyfills to support older browsers:
-   `classList` Polyfill: Adds support for classList manipulation on elements, enabling modern DOM class management in older browsers.
-   `addEventListener` and `removeEventListener` Polyfill: Adds support for addEventListener and removeEventListener on elements, allowing for modern event handling in environments where these methods are not natively supported.
These polyfills ensure that SnapToast works across a wide range of browsers, including older versions of Internet Explorer, providing a consistent experience regardless of the user's browser.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any features, bug fixes, or improvements.

## License
SnapToast is released under the MIT License. See the LICENSE file for more details.
Feel free to use in any condition and modify all as you want.
