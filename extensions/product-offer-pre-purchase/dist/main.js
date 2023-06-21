(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/@shopify/checkout-ui-extensions/build/esm/extend.mjs
  var extend = (...args) => self.shopify.extend(...args);

  // node_modules/@shopify/checkout-ui-extensions/node_modules/@remote-ui/core/build/esm/component.mjs
  function createRemoteComponent(componentType) {
    return componentType;
  }

  // node_modules/@shopify/checkout-ui-extensions/build/esm/components/Banner/Banner.mjs
  var Banner = createRemoteComponent("Banner");

  // node_modules/@shopify/checkout-ui-extensions/build/esm/components/BlockStack/BlockStack.mjs
  var BlockStack = createRemoteComponent("BlockStack");

  // node_modules/@shopify/checkout-ui-extensions/build/esm/components/Button/Button.mjs
  var Button = createRemoteComponent("Button");

  // node_modules/@shopify/checkout-ui-extensions/build/esm/components/Divider/Divider.mjs
  var Divider = createRemoteComponent("Divider");

  // node_modules/@shopify/checkout-ui-extensions/build/esm/components/Heading/Heading.mjs
  var Heading = createRemoteComponent("Heading");

  // node_modules/@shopify/checkout-ui-extensions/build/esm/components/Image/Image.mjs
  var Image = createRemoteComponent("Image");

  // node_modules/@shopify/checkout-ui-extensions/build/esm/components/InlineLayout/InlineLayout.mjs
  var InlineLayout = createRemoteComponent("InlineLayout");

  // node_modules/@shopify/checkout-ui-extensions/build/esm/components/SkeletonImage/SkeletonImage.mjs
  var SkeletonImage = createRemoteComponent("SkeletonImage");

  // node_modules/@shopify/checkout-ui-extensions/build/esm/components/SkeletonText/SkeletonText.mjs
  var SkeletonText = createRemoteComponent("SkeletonText");

  // node_modules/@shopify/checkout-ui-extensions/build/esm/components/Text/Text.mjs
  var Text = createRemoteComponent("Text");

  // extensions/product-offer-pre-purchase-js/src/index.js
  extend(
    "Checkout::Dynamic::Render",
    (root, { lines, applyCartLinesChange, query, i18n }) => {
      let products = [];
      let loading = true;
      let appRendered = false;
      fetchProducts(query).then((fetchedProducts) => {
        products = fetchedProducts;
        loading = false;
        renderApp();
      });
      lines.subscribe(() => renderApp());
      const loadingState = createLoadingState(root);
      if (loading) {
        root.appendChild(loadingState);
      }
      const { imageComponent, titleMarkup, priceMarkup, merchandise } = createProductComponents(root);
      const addButtonComponent = createAddButtonComponent(
        root,
        applyCartLinesChange,
        merchandise
      );
      const app = createApp(
        root,
        imageComponent,
        titleMarkup,
        priceMarkup,
        addButtonComponent
      );
      function renderApp() {
        if (loading) {
          return;
        }
        if (!loading && products.length === 0) {
          root.removeChild(loadingState);
          return;
        }
        const productsOnOffer = filterProductsOnOffer(lines, products);
        if (!loading && productsOnOffer.length === 0) {
          if (loadingState.parent)
            root.removeChild(loadingState);
          if (root.children)
            root.removeChild(root.children[0]);
          return;
        }
        updateProductComponents(
          productsOnOffer[0],
          imageComponent,
          titleMarkup,
          priceMarkup,
          addButtonComponent,
          merchandise,
          i18n
        );
        if (!appRendered) {
          root.removeChild(loadingState);
          root.appendChild(app);
          appRendered = true;
        }
      }
    }
  );
  function fetchProducts(query) {
    return query(
      `query ($first: Int!) {
        products(first: $first) {
          nodes {
            id
            title
            images(first:1){
              nodes {
                url
              }
            }
            variants(first: 1) {
              nodes {
                id
                price {
                  amount
                }
              }
            }
          }
        }
      }`,
      {
        variables: { first: 5 }
      }
    ).then(({ data }) => data.products.nodes).catch((err) => {
      console.error(err);
      return [];
    });
  }
  function createLoadingState(root) {
    return root.createComponent(BlockStack, { spacing: "loose" }, [
      root.createComponent(Divider),
      root.createComponent(Heading, { level: 2 }, ["You might also like"]),
      root.createComponent(BlockStack, { spacing: "loose" }, [
        root.createComponent(
          InlineLayout,
          {
            spacing: "base",
            columns: [64, "fill", "auto"],
            blockAlignment: "center"
          },
          [
            root.createComponent(SkeletonImage, { aspectRatio: 1 }),
            root.createComponent(BlockStack, { spacing: "none" }, [
              root.createComponent(SkeletonText, { inlineSize: "large" }),
              root.createComponent(SkeletonText, { inlineSize: "small" })
            ]),
            root.createComponent(Button, { kind: "secondary", disabled: true }, [
              root.createText("Add")
            ])
          ]
        )
      ])
    ]);
  }
  function createProductComponents(root) {
    const imageComponent = root.createComponent(Image, {
      border: "base",
      borderWidth: "base",
      borderRadius: "loose",
      aspectRatio: 1,
      source: ""
    });
    const titleMarkup = root.createText("");
    const priceMarkup = root.createText("");
    const merchandise = { id: "" };
    return { imageComponent, titleMarkup, priceMarkup, merchandise };
  }
  function createAddButtonComponent(root, applyCartLinesChange, merchandise) {
    return root.createComponent(
      Button,
      {
        kind: "secondary",
        loading: false,
        onPress: () => __async(this, null, function* () {
          yield handleAddButtonPress(root, applyCartLinesChange, merchandise);
        })
      },
      ["Add"]
    );
  }
  function handleAddButtonPress(root, applyCartLinesChange, merchandise) {
    return __async(this, null, function* () {
      const result = yield applyCartLinesChange({
        type: "addCartLine",
        merchandiseId: merchandise.id,
        quantity: 1
      });
      if (result.type === "error") {
        displayErrorBanner(
          root,
          "There was an issue adding this product. Please try again."
        );
      }
    });
  }
  function displayErrorBanner(root, message) {
    const errorComponent = root.createComponent(Banner, { status: "critical" }, [
      message
    ]);
    const topLevelComponent = root.children[0];
    topLevelComponent.appendChild(errorComponent);
    setTimeout(() => topLevelComponent.removeChild(errorComponent), 3e3);
  }
  function createApp(root, imageComponent, titleMarkup, priceMarkup, addButtonComponent) {
    return root.createComponent(BlockStack, { spacing: "loose" }, [
      root.createComponent(Divider),
      root.createComponent(Heading, { level: 2 }, "You might also like"),
      root.createComponent(BlockStack, { spacing: "loose" }, [
        root.createComponent(
          InlineLayout,
          {
            spacing: "base",
            columns: [64, "fill", "auto"],
            blockAlignment: "center"
          },
          [
            imageComponent,
            root.createComponent(BlockStack, { spacing: "none" }, [
              root.createComponent(Text, { size: "medium", emphasis: "strong" }, [
                titleMarkup
              ]),
              root.createComponent(Text, { appearance: "subdued" }, [
                priceMarkup
              ])
            ]),
            addButtonComponent
          ]
        )
      ])
    ]);
  }
  function filterProductsOnOffer(lines, products) {
    const cartLineProductVariantIds = lines.current.map(
      (item) => item.merchandise.id
    );
    return products.filter((product) => {
      const isProductVariantInCart = product.variants.nodes.some(
        ({ id }) => cartLineProductVariantIds.includes(id)
      );
      return !isProductVariantInCart;
    });
  }
  function updateProductComponents(product, imageComponent, titleMarkup, priceMarkup, addButtonComponent, merchandise, i18n) {
    var _a, _b;
    const { images, title, variants } = product;
    const renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);
    const imageUrl = (_b = (_a = images.nodes[0]) == null ? void 0 : _a.url) != null ? _b : "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";
    imageComponent.updateProps({ source: imageUrl });
    titleMarkup.updateText(title);
    addButtonComponent.updateProps({
      accessibilityLabel: `Add ${title} to cart,`
    });
    priceMarkup.updateText(renderPrice);
    merchandise.id = variants.nodes[0].id;
  }
})();
