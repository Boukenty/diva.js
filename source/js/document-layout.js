module.exports = getDocumentLayout;

/**
 * Translate page layouts, as generated by page-layouts.js, into
 * a layout for the document as a whole
 */
function getDocumentLayout(config)
{
    var documentSecondaryExtent = getExtentAlongSecondaryAxis(config);

    // The current position in the document along the primary axis
    var primaryDocPosition = 0;

    var pageGroups = [];

    // TODO: Use bottom, right as well
    var pagePadding = {
        top: config.padding.page.top,
        left: config.padding.page.left
    };

    config.pageLayouts.forEach(function (layout, index)
    {
        var top, left;

        if (config.verticallyOriented)
        {
            top = primaryDocPosition;
            left = (documentSecondaryExtent - layout.dimensions.width) / 2;
        }
        else
        {
            top = (documentSecondaryExtent - layout.dimensions.height) / 2;
            left = primaryDocPosition;
        }

        var region = {
            top: top,
            bottom: top + pagePadding.top + layout.dimensions.height,
            left: left,
            right: left + pagePadding.left + layout.dimensions.width
        };

        pageGroups.push({
            index: index,
            dimensions: layout.dimensions,
            pages: layout.pages,
            region: region,
            padding: pagePadding
        });

        primaryDocPosition = config.verticallyOriented ? region.bottom : region.right;
    });

    var height, width;

    if (config.verticallyOriented)
    {
        height = primaryDocPosition + pagePadding.top;
        width = documentSecondaryExtent;
    }
    else
    {
        height = documentSecondaryExtent;
        width = primaryDocPosition + pagePadding.left;
    }

    return {
        dimensions: {
            height: height,
            width: width
        },
        pageGroups: pageGroups
    };
}

function getExtentAlongSecondaryAxis(config)
{
    // Get the extent of the document along the secondary axis
    var secondaryDim, secondaryPadding;
    var docPadding = config.padding.document;

    if (config.verticallyOriented)
    {
        secondaryDim = 'width';
        secondaryPadding = docPadding.left + docPadding.right;
    }
    else
    {
        secondaryDim = 'height';
        secondaryPadding = docPadding.top + docPadding.bottom;
    }

    return secondaryPadding + config.pageLayouts.reduce(function (maxDim, layout)
    {
        return Math.max(layout.dimensions[secondaryDim], maxDim);
    }, 0);
}
