/**
 * properties of a textarea that affect the position of the caret
 */
const properties = [
    'direction',
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
];

interface CaretCoordinates {
    top: number;
    left: number;
    height: number;
}

/**
 * Returns the coordinates of the caret (cursor) in a textarea or input element.
 * @param element The textarea or input element
 * @param position The cursor position (index)
 */
export function getCaretCoordinates(
    element: HTMLTextAreaElement | HTMLInputElement,
    position: number
): CaretCoordinates {
    const isFirefox = (window as any).mozInnerScreenX != null;

    // The mirror div will replicate the textarea's style
    const div = document.createElement('div');
    div.id = 'input-textarea-caret-position-mirror-div';
    document.body.appendChild(div);

    const style = div.style;
    const computed = window.getComputedStyle(element);

    // Default style for mirror div
    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';
    style.position = 'absolute';
    style.visibility = 'hidden';

    // Transfer properties from textarea to mirror div
    properties.forEach((prop) => {
        style[prop as any] = computed[prop as any];
    });

    if (isFirefox) {
        if (element.scrollHeight > parseInt(computed.height))
            style.overflowY = 'scroll';
    } else {
        style.overflow = 'hidden';
    }

    div.textContent = element.value.substring(0, position);

    if (element.nodeName === 'INPUT') {
        div.textContent = div.textContent.replace(/\s/g, '\u00a0');
    }

    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.'; // || because a completely empty faux span doesn't render at all
    div.appendChild(span);

    const coordinates = {
        top: span.offsetTop + parseInt(computed.borderTopWidth),
        left: span.offsetLeft + parseInt(computed.borderLeftWidth),
        height: parseInt(computed.lineHeight),
    };

    document.body.removeChild(div);

    return coordinates;
}
