/**
 * LayoutParams are used by views to tell their parents how they want to be
 * laid out.
 *
 * @class LayoutParams
 */
function LayoutParams(widthOrParams, height) {
    if (widthOrParams.constructor.name == "LayoutParams") {
        this.width = widthOrParams.width;
        this.height = widthOrParams.height;
    } else {
        this.width = widthOrParams;
        this.height = height;
    }
    this.leftMargin = 0;
    this.topMargin = 0;
    this.rightMargin = 0;
    this.bottomMargin = 0;
    this.gravity = -1;
    this.weight = 0;

    /**
     * Sets the margins, in pixels.
     *
     * @method setMargins
     * @param {int} l the left margin size
     * @param {int} t the top margin size
     * @param {int} r the right margin size
     * @param {int} b the bottom margin size
     */
    this.setMargins = function(l, t, r, b) {
        if (t == undefined && r == undefined && b == undefined) {
            t = l;
            r = l;
            b = l;
        }
        this.leftMargin = l;
        this.topMargin = t;
        this.rightMargin = r;
        this.bottomMargin = b;
    };
}

/**
 * Special value for the height or width requested by a View.
 * FILL_PARENT means that the view wants to be as big as its parent,
 * minus the parent's padding, if any.
 *
 * @property FILL_PARENT
 * @type int
 * @static
 * @final
 */
Object.defineProperty(LayoutParams,"FILL_PARENT",{value:-1});

/**
 * Special value for the height or width requested by a View.
 * MATCH_PARENT means that the view wants to be as big as its parent,
 * minus the parent's padding, if any.
 *
 * @property MATCH_PARENT
 * @type int
 * @static
 * @final
 */
Object.defineProperty(LayoutParams,"MATCH_PARENT",{value:-1});

/**
 * Special value for the height or width requested by a View.
 * WRAP_CONTENT means that the view wants to be just large enough to fit
 * its own internal content, taking its own padding into account.
 *
 * @property WRAP_CONTENT
 * @type int
 * @static
 * @final
 */
Object.defineProperty(LayoutParams,"WRAP_CONTENT",{value:-2});

function getDefaultLayoutParams() {
    return new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
};

function getLayoutParams(view) {
    var lp = view.getLayoutParams();
    if (lp == null) {
        lp = getDefaultLayoutParams();
    }
    return lp;
};

function makeSpec(childDimen, lpDimen) {
    var spec;
    if (lpDimen == LayoutParams.FILL_PARENT) {
        spec = MeasureSpec.makeMeasureSpec(childDimen, MeasureSpec.EXACTLY);
    } else if (lpDimen == LayoutParams.WRAP_CONTENT) {
        spec = MeasureSpec.makeMeasureSpec(childDimen, MeasureSpec.UNSPECIFIED);
    } else {
        spec = MeasureSpec.makeMeasureSpec(lpDimen, MeasureSpec.EXACTLY);
    }
    return spec;
}

function calcOffsetXByGravity(parent, child) {
    var lp = getLayoutParams(child);
    var pl = parent.getPaddingLeft();
    var pr = parent.getPaddingRight();
    var offsetX = pl + lp.leftMargin;
    if (lp.gravity != -1) {
        if (lp.gravity & Gravity.CENTER_HORIZONTAL) {
            var contentWidth = parent.getMeasuredWidth() - pl - pr - lp.leftMargin - lp.rightMargin;
            offsetX = pl + lp.leftMargin + (contentWidth - child.getMeasuredWidth()) / 2;
        } else if (lp.gravity & Gravity.RIGHT) {
            offsetX = parent.getMeasuredWidth() - pr - lp.rightMargin - child.getMeasuredWidth();
        }
    }
    return offsetX;
};

function calcOffsetYByGravity(parent, child) {
    var lp = getLayoutParams(child);
    var pt = parent.getPaddingTop();
    var pb = parent.getPaddingBottom();
    var offsetY = pt + lp.topMargin;
    if (lp.gravity != -1) {
        if (lp.gravity & Gravity.CENTER_VERTICAL) {
            var contentHeight = parent.getMeasuredHeight() - pt - pb - lp.topMargin - lp.bottomMargin;
            offsetY = pt + lp.topMargin + (contentHeight - child.getMeasuredHeight()) / 2;
        } else if (lp.gravity & Gravity.BOTTOM) {
            offsetY = parent.getMeasuredHeight() - pb - lp.bottomMargin - child.getMeasuredHeight();
        }
    }
    return offsetY;
}

/**
 * A Layout that arranges its children in a single column or a single row. The direction of
 * the row can be set by calling setOrientation().
 *
 * @class LinearLayout
 * @extends ViewGroup
 */
function LinearLayout() {
    ViewGroup.apply(this, []);

    var mOrientation = LinearLayout.VERTICAL;

    /**
     * Should the layout be a column or a row.
     * @method setOrientation
     * @param {int} o Pass HORIZONTAL or VERTICAL. Default
     * value is VERTICAL.
     */
    this.setOrientation = function(o) {
        mOrientation = o;
        this.requestLayout();
    };

    this.getTotalWeight = function() {
        var totalWeight = 0;
        for (var i = 0; i < this.getChildCount(); i++) {
            var child = this.getChildAt(i);
            var clp = getLayoutParams(child);
            totalWeight += clp.weight;
        }
        return totalWeight;
    };

    this.getAvailableWidth = function(totalWidth) {
        var width = totalWidth - this.getPaddingLeft() - this.getPaddingRight();
        for (var i = 0; i < this.getChildCount(); i++) {
            var child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }
            var lp = getLayoutParams(child);
            width -= (lp.leftMargin + lp.rightMargin);
            if (lp.width > 0) {
                width -= lp.width;
            } else if (lp.width == LayoutParams.WRAP_CONTENT) {
                if (child.getMeasuredWidth() == 0 && child.getMeasuredHeight() == 0) {
                    child.measure(0, 0);
                }
                width -= child.getMeasuredWidth();
            }
        }
        return width;
    };

    this.getAvailableHeight = function(totalHeight) {
        var height = totalHeight - this.getPaddingTop() - this.getPaddingBottom();
        for (var i = 0; i < this.getChildCount(); i++) {
            var child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }
            var lp = getLayoutParams(child);
            height -= (lp.topMargin + lp.bottomMargin);
            if (lp.height > 0) {
                height -= lp.height;
            } else if (lp.height == LayoutParams.WRAP_CONTENT) {
                if (child.getMeasuredWidth() == 0 && child.getMeasuredHeight() == 0) {
                    child.measure(0, 0);
                }
                height -= child.getMeasuredHeight();
            }
        }
        return height;
    };

    this.onMeasure = function(widthMS, heightMS) {
        if (mOrientation == LinearLayout.VERTICAL) {
            this.measureVertical(widthMS, heightMS);
        } else {
            this.measureHorizontal(widthMS, heightMS);
        }
    };

    this.measureVertical = function(widthMS, heightMS) {
        var width = MeasureSpec.getSize(widthMS);
        var height = MeasureSpec.getSize(heightMS);
        var pl = this.getPaddingLeft();
        var pt = this.getPaddingTop();
        var pr = this.getPaddingRight();
        var pb = this.getPaddingBottom();
        var contentHeight = pt + pb;
        var totalWeight = this.getTotalWeight();
        var lp = getLayoutParams(this);
        for (var i = 0; i < this.getChildCount(); i++) {
            var child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }
            var clp = getLayoutParams(child);
            var childWidth = width - pl - pr - clp.leftMargin - clp.rightMargin;
            var childHeight = height - pt - pb - clp.topMargin - clp.bottomMargin;
            var cWidthSpec = makeSpec(childWidth, clp.width);
            var cHeightSpec = makeSpec(childHeight, clp.height);
            if (totalWeight != 0 && !(clp.weight == 0 && clp.height > 0)) {
                var cHeight = this.getAvailableHeight(height) * clp.weight / totalWeight;
                cHeightSpec = MeasureSpec.makeMeasureSpec(cHeight, MeasureSpec.EXACTLY);
            }
            child.measure(cWidthSpec, cHeightSpec);
            contentHeight += child.getMeasuredHeight() + clp.topMargin + clp.bottomMargin;
        }
        var hMode = MeasureSpec.getMode(heightMS);
        if (hMode != MeasureSpec.EXACTLY) {
            if (lp.height == LayoutParams.WRAP_CONTENT) {
                height = contentHeight;
            }
        }

        this.setMeasuredDimension(width, height);
    };

    this.measureHorizontal = function(widthMS, heightMS) {
        var width = MeasureSpec.getSize(widthMS);
        var height = MeasureSpec.getSize(heightMS);
        var hMode = MeasureSpec.getMode(heightMS);
        var pl = this.getPaddingLeft();
        var pt = this.getPaddingTop();
        var pr = this.getPaddingRight();
        var pb = this.getPaddingBottom();
        var contentWidth = pl + pr;
        var totalWeight = this.getTotalWeight();
        var lp = getLayoutParams(this);
        if (hMode != MeasureSpec.EXACTLY && lp.height == LayoutParams.WRAP_CONTENT) {
            height = pt + pb;
        }
        for (var i = 0; i < this.getChildCount(); i++) {
            var child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }
            var clp = getLayoutParams(child);
            var childWidth = width - pl - pr - clp.leftMargin - clp.rightMargin;
            var childHeight = height - pt - pb - clp.topMargin - clp.bottomMargin;
            var cWidthSpec = makeSpec(childWidth, clp.width);
            var cHeightSpec = makeSpec(childHeight, clp.height);
            if (totalWeight != 0 && !(clp.weight == 0 && clp.width > 0)) {
                var cWidth = this.getAvailableWidth(width) * clp.weight / totalWeight;
                cWidthSpec = MeasureSpec.makeMeasureSpec(cWidth, MeasureSpec.EXACTLY);
            }
            child.measure(cWidthSpec, cHeightSpec);
            contentWidth += child.getMeasuredWidth() + clp.leftMargin + clp.rightMargin;

            if (hMode != MeasureSpec.EXACTLY && lp.height == LayoutParams.WRAP_CONTENT) {
                var ch = pt + pb + clp.topMargin + clp.bottomMargin + child.getMeasuredHeight();
                if (ch > height) {
                    height = ch;
                }
            }
        }

        var wMode = MeasureSpec.getMode(widthMS);
        if (wMode != MeasureSpec.EXACTLY) {
            if (lp.width == LayoutParams.WRAP_CONTENT) {
                width = contentWidth;
            }
        }

        this.setMeasuredDimension(width, height);
    };

    this.onLayout = function(x, y) {
        if (mOrientation == LinearLayout.VERTICAL) {
            this.layoutVertical(x, y);
        } else {
            this.layoutHorizontal(x, y);
        }
    };

    this.layoutVertical = function(x, y) {
        var offsetX = this.getPaddingLeft();
        var offsetY = this.getPaddingTop();
        for (var i = 0; i < this.getChildCount(); i++) {
            var child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }
            var clp = getLayoutParams(child);
            offsetX = calcOffsetXByGravity(this, child);
            offsetY += clp.topMargin;
            child.layout(offsetX, offsetY);
            offsetY += child.getMeasuredHeight();
            offsetY += clp.bottomMargin;
        }
    };

    this.layoutHorizontal = function(x, y) {
        var offsetX = this.getPaddingLeft();
        var offsetY = this.getPaddingTop();
        for (var i = 0; i < this.getChildCount(); i++) {
            var child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }
            var clp = getLayoutParams(child);
            offsetX += clp.leftMargin;
            offsetY = calcOffsetYByGravity(this, child);
            child.layout(offsetX, offsetY);
            offsetX += child.getMeasuredWidth();
            offsetX += clp.rightMargin;
        }
    };
}

/**
 * for horizontal linear layouts.
 *
 * @property HORIZONTAL
 * @type int
 * @static
 * @final
 */
Object.defineProperty(LinearLayout,"HORIZONTAL",{value:0});

/**
 * for vertical linear layouts.
 *
 * @property VERTICAL
 * @type int
 * @static
 * @final
 */
Object.defineProperty(LinearLayout,"VERTICAL",{value:1});

/**
 * FrameLayout is designed to block out an area on the screen to display
 * a single item. Generally, FrameLayout should be used to hold a single child view, because it can
 * be difficult to organize child views in a way that's scalable to different screen sizes without
 * the children overlapping each other.
 *
 * @class FrameLayout
 * @extends ViewGroup
 */
function FrameLayout() {
    ViewGroup.apply(this, []);

    this.onMeasure = function(widthMS, heightMS) {
        var width = MeasureSpec.getSize(widthMS);
        var height = MeasureSpec.getSize(heightMS);
        var childWidth = width - this.getPaddingLeft() - this.getPaddingRight();
        var childHeight = height - this.getPaddingTop() - this.getPaddingBottom();
        for (var i = 0; i < this.getChildCount(); i++) {
            var child = this.getChildAt(i);
            var lp = getLayoutParams(child);
            var cw = childWidth - lp.leftMargin - lp.rightMargin;
            var ch = childHeight - lp.topMargin - lp.bottomMargin;
            var cWidthSpec = makeSpec(cw, lp.width);
            var cHeightSpec = makeSpec(ch, lp.height);
            child.measure(cWidthSpec, cHeightSpec);
        }
        this.setMeasuredDimension(width, height);
    };

    this.onLayout = function(x, y) {
        for (var i = 0; i < this.getChildCount(); i++) {
            var child = this.getChildAt(i);
            var offsetX = calcOffsetXByGravity(this, child);
            var offsetY = calcOffsetYByGravity(this, child);
            child.layout(offsetX, offsetY);
        }
    };
}

/**
 * A view that shows items in a center-locked, horizontally scrolling list.
 *
 * @class Gallery
 * @extends ViewGroup
 */
function Gallery() {
    ViewGroup.apply(this, []);

    this.setTag("Gallery");

    var mCurScreen = 0;
    var mCurX;
    var mProcessor = new Processor();
    var mDownX = 0;
    var mListener;

    var content = new GalleryContent();
    this.addView(content);

    this.setGalleryListener = function(l) {
        mListener = l;
    };

    this.getPageCount = function() {
        return content.getChildCount();
    };

    this.addPage = function(view) {
        content.addView(view);
    };

    this.scrollTo = function(x) {
        mCurX = x;
        content.getDiv().style.webkitTransform="translate3d(-" + x + "px,0,0)";
        if (mListener != null && mListener.onXChanged) {
            mListener.onXChanged(x);
        }
    };

    this.getCurX = function() {
        return mCurX;
    };

    this.checkBounds = function(whichScreen) {
        return (whichScreen < 0 ? 0 : whichScreen > (content.getChildCount() - 1) ? (content.getChildCount() - 1)
            : whichScreen);
    };

    this.setToScreen = function(index) {
        index = this.checkBounds(index);
        mCurScreen = index;
        this.scrollTo(index * this.getMeasuredWidth());
        fireScreenChanged();
    };

    this.snapToScreen = function(index, duration) {
        index = this.checkBounds(index);
        if (index == mCurScreen) {
            return;
        }
        var startX = mCurScreen * this.getMeasuredWidth();
        var endX = index * this.getMeasuredWidth();
        if (duration == undefined) {
            duration = Math.abs(endX - startX);
        }
        mProcessor.startProcess(startX, endX, duration);
        this.invalidate();

        mCurScreen = index;
        setTimeout(function() {forceReLayout();fireScreenChanged();}, duration);
    };

    this.onTouchEvent = function(ev) {
        var w = this.getMeasuredWidth();
        switch (ev.getAction()) {
            case MotionEvent.ACTION_DOWN:
                mDownX = ev.getX();
                break;
            case MotionEvent.ACTION_MOVE:
                var x = mCurScreen * w - (ev.getX() - mDownX);
                x = Math.max(0, x);
                x = Math.min(x, (content.getChildCount() - 1) * w);
                this.scrollTo(x);
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                var isNext = (this.getCurX() % w) > (w / 2);
                mCurScreen = Math.floor(this.getCurX() / w);
                if (isNext) {
                    mCurScreen = mCurScreen + 1;
                }
                var endX = mCurScreen * w;
                var d = Math.abs(this.getCurX() - endX);
                mProcessor.startProcess(this.getCurX(), endX, d);
                this.invalidate();
                setTimeout(function() {fireScreenChanged()}, d);
                break;
        }
    };

    this.onMeasure = function(widthMS, heightMS) {
        var width = MeasureSpec.getSize(widthMS);
        var height = MeasureSpec.getSize(heightMS);

        content.measure(width, height);

        this.setMeasuredDimension(width, height);

        this.setToScreen(mCurScreen);
    };

    this.onLayout = function(x, y) {
        content.layout(0, 0);
    };

    this.computeScroll = function() {
        if (mProcessor.computeProcessOffset()) {
            var x = mProcessor.getCurrProcess();
            this.scrollTo(x);

            this.postInvalidate();
        }
    };

    function GalleryContent() {
        ViewGroup.apply(this, []);

        this.onMeasure = function(widthMS, heightMS) {
            var width = MeasureSpec.getSize(widthMS);
            var height = MeasureSpec.getSize(heightMS);

            for (var i = 0; i < this.getChildCount(); i++) {
                var c = this.getChildAt(i);
                c.measure(MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY));
            }

            this.setMeasuredDimension(width * this.getChildCount(), height);
        };

        this.onLayout = function(x, y) {
            var offsetX = 0;
            var offsetY = 0;

            for (var i = 0; i < this.getChildCount(); i++) {
                var c = this.getChildAt(i);
                c.layout(offsetX, offsetY);
                offsetX += c.getMeasuredWidth();
            }
        };
    }

    function fireScreenChanged() {
        if (mListener != null && mListener.onGalleryScreenChanged) {
            mListener.onGalleryScreenChanged(mCurScreen);
        }
    }
}



