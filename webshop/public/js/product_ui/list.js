webshop.ProductList = class {
	/* Options:
		- items: Items
		- settings: Webshop Settings
		- products_section: Products Wrapper
		- preference: If preference is not list view, render but hide
	*/
	constructor(options) {
		Object.assign(this, options);

		if (this.preference !== "List View") {
			this.products_section.addClass("hidden");
		}

		this.products_section.empty();
		this.make();
	}

	make() {
		let me = this;
		let html = `<br><br>`;

		this.items.forEach(item => {
			let title = item.web_item_name || item.item_name || item.item_code || "";
			title =  title.length > 200 ? title.substr(0, 200) + "..." : title;

			html += `<div class='row list-row w-100 mb-4'>`;
			html += me.get_image_html(item, title, me.settings);
			html += me.get_row_body_html(item, title, me.settings);
			html += `</div>`;
		});

		let $product_wrapper = this.products_section;
		$product_wrapper.append(html);
	}

	get_image_html(item, title, settings) {
		let image = item.website_image;
		let wishlist_enabled = !item.has_variants && settings.enable_wishlist;
		let image_html = ``;

		if (image) {
			image_html += `
				<div class="col-2 border text-center rounded list-image">
					<a class="product-link product-list-link" href="/${ item.route || '#' }">
						<img itemprop="image" class="website-image h-100 w-100" alt="${ title }"
							src="${ image }">
					</a>
					${ wishlist_enabled ? this.get_wishlist_icon(item): '' }
				</div>
			`;
		} else {
			image_html += `
				<div class="col-2 border text-center rounded list-image">
					<a class="product-link product-list-link" href="/${ item.route || '#' }"
						style="text-decoration: none">
						<div class="card-img-top no-image-list">
							${ frappe.get_abbr(title) }
						</div>
					</a>
					${ wishlist_enabled ? this.get_wishlist_icon(item): '' }
				</div>
			`;
		}

		return image_html;
	}

	get_row_body_html(item, title, settings) {
		let body_html = `<div class='col-10 text-left'>`;
		body_html += this.get_title_html(item, title, settings);
		body_html += this.get_item_details(item, settings);
		body_html += `</div>`;
		return body_html;
	}

	get_title_html(item, title, settings) {
		let title_html = `<div style="display: flex; margin-left: -15px;">`;
		title_html += `
			<div class="col-7" style="margin-right: -15px;">
				<a class="" href="/${ item.route || '#' }"
					style="color: var(--gray-800); font-weight: 500;">
					${ title }
				</a>
			</div>
		`;

		if (settings.enabled) {
			title_html += `<div class="col-5 cart-action-container">`;
			title_html += this.get_primary_button(item, settings);
			title_html += `</div>`;
		}
		title_html += `</div>`;

		return title_html;
	}

	get_item_details(item, settings) {
		let details = `
			<p class="product-code">
				${ item.item_group } | Item Code : ${ item.item_code }
			</p>
			<div class="product-uom" itemprop="uom"> ${ frappe._('UOM') + ': ' + item.stock_uom || '' }</div>
			<div class="mt-2" style="color: var(--gray-600) !important; font-size: 13px;">
				${ item.short_description || '' }
			</div>
			<div class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/AggregateOffer">
				${ item.formatted_price || '' }
		`;

		if (item.formatted_mrp) {
			details += `
				<small class="striked-price">
					<s>${ item.formatted_mrp ? item.formatted_mrp.replace(/ +/g, "") : "" }</s>
				</small>
				<small class="ml-1 product-info-green">
					${ item.discount } OFF
				</small>
			`;
		}

		details += this.get_stock_availability(item, settings);
		details += `</div>`;

		return details;
	}

	get_stock_availability(item, settings) {
		if (settings.show_stock_availability && !item.has_variants) {
			if (item.on_backorder) {
				return `
					<br>
					<span class="out-of-stock mt-2" style="color: var(--primary-color)">
						${ __("Available on backorder") }
					</span>
				`;
			} else if (!item.in_stock) {
				return `
					<br>
					<span class="out-of-stock mt-2">${ __("Out of stock") }</span>
				`;
			} else if (item.is_stock) {
				return `
					<br>
					<span class="in-stock in-green has-stock mt-2"
						style="font-size: 14px;">${ __("In stock") }</span>
				`;
			}
		}
		return ``;
	}

	get_wishlist_icon(item) {
		let icon_class = item.wished ? "wished" : "not-wished";

		return `
			<div class="like-action-list ${ item.wished ? "like-action-wished" : ''}"
				data-item-code="${ item.item_code }">
				<svg class="icon sm">
					<use class="${ icon_class } wish-icon" href="#icon-heart"></use>
				</svg>
			</div>
		`;
	}

	get_primary_button(item, settings) {
		if (item.has_variants) {
			return `
				<a href="/${ item.route || '#' }">
					<div class="btn btn-sm btn-explore-variants btn mb-0 mt-0">
						${ __('Explore') }
					</div>
				</a>
			`;
		} else if (settings.enabled && (settings.allow_items_not_in_stock || item.in_stock)) {
			return `
				<div class="cart-item-container">
					<div class="d-flex align-items-center justify-content-end">
						<div class="mt-0 mb-0 mr-3 add-qty-to-cart-list ${item.in_cart ? 'hidden' : ''}">
							<div class="input-group number-spinner">
								<span class="input-group-prepend d-sm-inline-block">
									<button class="btn btn-outline-secondary cart-btn" data-dir="dwn">–</button>
								</span>
								<input class="form-control text-center cart-qty" value="1" data-item-code="${item.item_code}" style="max-width: 50px;">
								<span class="input-group-append d-sm-inline-block">
									<button class="btn btn-outline-secondary cart-btn" data-dir="up">+</button>
								</span>
							</div>
						</div>
						
						<div id="${item.name}" class="btn btn-sm btn-primary btn-add-to-cart-list mt-0 mb-0 ${item.in_cart ? 'hidden' : ''}"
							data-item-code="${item.item_code}" style="padding: 0.25rem 1rem; min-width: 135px;">
							<span class="mr-2">
								<svg class="icon icon-md">
									<use href="#icon-assets"></use>
								</svg>
							</span>
							${settings.enable_checkout ? __('Add to Cart') : __('Add to Quote')}
						</div>
					</div>
					
					<div class="d-flex align-items-center justify-content-end">
						<div class="cart-indicator list-indicator mr-5 ${item.in_cart ? '' : 'hidden'}">
							1
						</div>
						<a href="/cart">
							<div id="${item.name}" class="${item.in_cart ? '' : 'hidden'} btn btn-sm btn-primary btn-add-to-cart-list go-to-cart mb-0 mt-0"
								data-item-code="${item.item_code}" style="padding: 0.25rem 1rem; min-width: 135px;">
								${settings.enable_checkout ? __('Go to Cart') : __('Go to Quote')}
							</div>
						</a>
					</div>
				</div>
			`;
		} else {
			return ``;
		}
	}

};
